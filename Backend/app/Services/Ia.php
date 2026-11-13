<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * ══════════════════════════════════════════════════════════
 * IA GRATUITA: GROQ + CLOUDFLARE
 *
 * El único sitio que habla con los servicios de IA. Lo usan el
 * chat de la web pública, el asistente de dietas del panel y el
 * borrador de dieta en JSON (el que luego acaba en el PDF).
 *
 * Por qué no Gemini gratis: las condiciones de Google solo permiten
 * su versión de pago en aplicaciones abiertas a usuarios de Europa.
 * Groq y Cloudflare tienen plan gratuito sin esa restricción, y
 * cuando se acaba el cupo gratuito devuelven un error, no un cargo.
 *
 * Funciona en cadena:
 *
 *   1. Groq (primero porque es el más rápido: en un hosting
 *      compartido cada petición tiene un tiempo máximo, y un plan
 *      de dieta largo tarda menos en Groq).
 *   2. Si Groq falla, está saturado o se acaba el cupo del día,
 *      Cloudflare Workers AI.
 *   3. Cada uno con su lista de modelos de reserva.
 *
 * El orden y los modelos se cambian desde el .env sin tocar código:
 *
 *   IA_PROVEEDORES=groq,cloudflare
 *   GROQ_MODELOS=...
 *   CLOUDFLARE_MODELOS=...
 *
 * Si algún día se quiere volver a meter Gemini como último recurso,
 * basta con añadir "gemini" a IA_PROVEEDORES y poner GEMINI_API_KEY:
 * el servicio Gemini antiguo se sigue usando tal cual.
 *
 * La interfaz es la misma que tenía Gemini::generar(), con los
 * contenidos en el formato de Gemini, para que los controladores no
 * tengan que cambiar. Aquí se traducen al formato de OpenAI, que es
 * el que hablan Groq y Cloudflare.
 * ══════════════════════════════════════════════════════════
 */
class Ia
{
    /** Tiempo total máximo de una consulta, sumando reintentos y modelos. */
    private const PRESUPUESTO_SEGUNDOS = 50;

    /** Tiempo máximo de una sola llamada. */
    private const TIMEOUT_LLAMADA = 40;

    /** Intentos por modelo cuando el servicio da un error temporal (5xx, red). */
    private const INTENTOS_POR_MODELO = 2;

    public function __construct(
        private Gemini $gemini,
    ) {}

    /**
     * @param  string  $sistema     Instrucciones de sistema (el "quién eres").
     * @param  array   $contenidos  Turnos en formato Gemini: [['role' => 'user'|'model', 'parts' => [['text' => '...']]], ...]
     * @param  array   $config      Formato Gemini: temperature, maxOutputTokens,
     *                              y para JSON responseMimeType + responseSchema.
     * @param  string  $uso         Etiqueta para el registro: 'chat-web', 'asistente', 'borrador'.
     *
     * @return array{ok: bool, texto?: string, modelo?: string, proveedor?: string, motivo?: string}
     *
     *   motivo, cuando ok es false:
     *     sin_clave   no hay ningún proveedor con su clave puesta
     *     clave       los proveedores rechazan la clave
     *     cupo        se ha agotado el cupo gratuito (por minuto o del día)
     *     saturado    servicios caídos o saturados
     *     vacio       respondieron, pero sin un texto o JSON utilizable
     *     red         no se pudo contactar con ninguno
     */
    public function generar(string $sistema, array $contenidos, array $config, string $uso): array
    {
        $proveedores = $this->proveedoresConfigurados();

        if ($proveedores === []) {
            Log::warning('IA_SIN_CLAVE', ['uso' => $uso]);

            return ['ok' => false, 'motivo' => 'sin_clave'];
        }

        /*
         * Los hostings compartidos suelen cortar cada petición a los 30 s.
         * Se pide margen; si el hosting no lo permite, el presupuesto de
         * abajo intenta acabar antes.
         */
        @set_time_limit(self::PRESUPUESTO_SEGUNDOS + 15);

        $inicio = microtime(true);
        $rastro = [];      // qué pasó con cada intento, para el registro
        $motivos = [];

        foreach ($proveedores as $proveedor) {

            // Gemini, solo si se ha añadido a mano a IA_PROVEEDORES.
            if ($proveedor === 'gemini') {
                if ($this->restante($inicio) < 10) {
                    break;
                }
                $r = $this->gemini->generar($sistema, $contenidos, $config, $uso);
                $rastro[] = 'gemini:' . ($r['ok'] ? 'ok' : $r['motivo']);
                if ($r['ok']) {
                    return $r + ['proveedor' => 'gemini'];
                }
                $motivos[] = $r['motivo'];
                continue;
            }

            foreach ($this->modelos($proveedor) as $modelo) {
                $conFormato = true;

                for ($intento = 1; $intento <= self::INTENTOS_POR_MODELO; $intento++) {

                    $restante = $this->restante($inicio);
                    if ($restante < 5) {
                        break 3;    // sin tiempo para otro intento con sentido
                    }

                    $r = $this->llamar(
                        $proveedor, $modelo, $sistema, $contenidos, $config,
                        (int) min(self::TIMEOUT_LLAMADA, $restante), $conFormato,
                    );
                    $rastro[] = "{$proveedor}:{$modelo}#{$intento}:{$r['estado']}";

                    if ($r['estado'] === 'ok') {
                        Log::info('IA_OK', [
                            'uso'       => $uso,
                            'proveedor' => $proveedor,
                            'modelo'    => $modelo,
                            'intentos'  => count($rastro),
                            'segundos'  => round(microtime(true) - $inicio, 1),
                        ]);

                        return [
                            'ok'        => true,
                            'texto'     => $r['texto'],
                            'modelo'    => $modelo,
                            'proveedor' => $proveedor,
                        ];
                    }

                    // El modelo no admite el modo JSON: mismo modelo, sin él.
                    // Se pide el JSON solo con las instrucciones y se extrae
                    // del texto. No cuenta como intento ni como fallo.
                    if ($r['estado'] === 'sin_formato') {
                        $conFormato = false;
                        $intento--;
                        continue;
                    }

                    $motivos[] = $r['motivo'];

                    // Clave mala: los demás modelos de este proveedor
                    // fallarían igual. Al siguiente proveedor.
                    if ($r['motivo'] === 'clave') {
                        continue 3;
                    }

                    // Modelo retirado, cupo agotado o respuesta inservible:
                    // al siguiente modelo sin gastar un segundo intento.
                    if ($r['estado'] === 'no_disponible') {
                        continue 2;
                    }

                    // Error temporal: una espera corta y otra vez.
                    if ($intento < self::INTENTOS_POR_MODELO) {
                        usleep(1_200_000);
                    }
                }
            }
        }

        $motivo = $this->motivoFinal($motivos);

        // Se registra QUÉ pasó, nunca el contenido de la conversación:
        // lleva datos de salud de clientes.
        Log::warning('IA_FALLO', [
            'uso'      => $uso,
            'motivo'   => $motivo,
            'rastro'   => $rastro,
            'segundos' => round(microtime(true) - $inicio, 1),
        ]);

        return ['ok' => false, 'motivo' => $motivo];
    }

    /* ══════════════════════════════════════════════════════
       UNA LLAMADA
       ══════════════════════════════════════════════════════ */

    /**
     * @return array{estado: string, motivo?: string, texto?: string}
     *   estado: ok · reintentable · no_disponible · definitivo · sin_formato
     */
    private function llamar(
        string $proveedor,
        string $modelo,
        string $sistema,
        array $contenidos,
        array $config,
        int $timeout,
        bool $conFormato,
    ): array {
        $quiereJson = ($config['responseMimeType'] ?? null) === 'application/json';

        $cuerpo = [
            'model'    => $modelo,
            'messages' => $this->mensajes(
                $sistema,
                $contenidos,
                $quiereJson ? ($config['responseSchema'] ?? []) : null,
            ),
        ];

        if (isset($config['temperature'])) {
            $cuerpo['temperature'] = (float) $config['temperature'];
        }

        if (isset($config['maxOutputTokens'])) {
            $max = (int) $config['maxOutputTokens'];

            if ($proveedor === 'groq') {
                // En el plan gratuito de Groq el límite es por minuto, y pedir
                // un máximo enorme puede chocar con él. Un plan de dieta
                // completo cabe de sobra en el tope configurado.
                $cuerpo['max_completion_tokens'] = min($max, (int) config('services.ia.groq.max_tokens', 4096));
            } else {
                // Sin esto, Cloudflare corta por defecto en muy pocas palabras.
                $cuerpo['max_tokens'] = $max;
            }
        }

        if ($quiereJson && $conFormato) {
            $cuerpo['response_format'] = ['type' => 'json_object'];
        }

        [$url, $clave] = $this->destino($proveedor);

        try {
            $res = Http::timeout(max(5, $timeout))
                ->withToken($clave)
                ->acceptJson()
                ->post($url, $cuerpo);
        } catch (\Throwable $e) {
            // Tiempo agotado o red caída: merece otro intento.
            Log::notice('IA_RED', [
                'proveedor' => $proveedor,
                'modelo'    => $modelo,
                'error'     => mb_substr($e->getMessage(), 0, 160),
            ]);

            return ['estado' => 'reintentable', 'motivo' => 'red'];
        }

        if ($res->failed()) {
            return $this->clasificarError($proveedor, $modelo, $res, $quiereJson && $conFormato);
        }

        $texto = $this->textoDeLaRespuesta($res->json());

        if ($texto === null) {
            // Respuesta cortada por el límite de palabras: un plan a medias
            // no sirve, y un JSON a medias no se puede leer.
            Log::notice('IA_CORTADO', ['proveedor' => $proveedor, 'modelo' => $modelo]);

            return ['estado' => 'no_disponible', 'motivo' => 'vacio'];
        }

        if ($texto === '') {
            Log::notice('IA_SIN_TEXTO', ['proveedor' => $proveedor, 'modelo' => $modelo]);

            return ['estado' => 'no_disponible', 'motivo' => 'vacio'];
        }

        if ($quiereJson) {
            $json = $this->extraerJson($texto);

            if ($json === null) {
                Log::notice('IA_JSON_INVALIDO', ['proveedor' => $proveedor, 'modelo' => $modelo]);

                return ['estado' => 'no_disponible', 'motivo' => 'vacio'];
            }

            $texto = $json;
        }

        return ['estado' => 'ok', 'texto' => $texto];
    }

    /**
     * Traduce un error HTTP a qué hacer después.
     *
     * El mensaje de error del proveedor dice la causa ("invalid API key",
     * "rate limit", "model not found"...) y no contiene la conversación,
     * así que se puede registrar. El cuerpo entero no.
     */
    private function clasificarError(string $proveedor, string $modelo, Response $res, bool $pedimosFormato): array
    {
        $http = $res->status();
        $error = $this->mensajeError($res);
        $minus = mb_strtolower($error);

        Log::notice('IA_HTTP', [
            'proveedor' => $proveedor,
            'modelo'    => $modelo,
            'http'      => $http,
            'error'     => mb_substr($error, 0, 200),
        ]);

        // El modelo no admite response_format: se repite sin él.
        if ($pedimosFormato && $http === 400
            && (str_contains($minus, 'response_format') || str_contains($minus, 'json'))) {
            return ['estado' => 'sin_formato', 'motivo' => 'vacio'];
        }

        // Cupo gratuito agotado. Cloudflare a veces lo devuelve con un
        // 403 en vez de un 429, así que se mira también el texto: si no,
        // parecería una clave mala.
        $esCupo = $http === 429
            || str_contains($minus, 'rate limit')
            || str_contains($minus, 'quota')
            || str_contains($minus, 'neurons')
            || str_contains($minus, 'allocation');

        if ($esCupo) {
            return ['estado' => 'no_disponible', 'motivo' => 'cupo'];
        }

        return match (true) {
            in_array($http, [401, 403], true)            => ['estado' => 'definitivo', 'motivo' => 'clave'],
            in_array($http, [400, 404, 413, 422], true)  => ['estado' => 'no_disponible', 'motivo' => 'saturado'],
            default                                      => ['estado' => 'reintentable', 'motivo' => 'saturado'], // 5xx
        };
    }

    /* ══════════════════════════════════════════════════════
       TRADUCCIÓN DE FORMATOS
       ══════════════════════════════════════════════════════ */

    /**
     * De los contenidos de Gemini a los mensajes de OpenAI.
     *
     *   Gemini:  role 'user' | 'model', parts[].text
     *   OpenAI:  role 'system' | 'user' | 'assistant', content
     *
     * Dos mensajes seguidos del mismo rol se juntan en uno: algunos
     * modelos abiertos se lían si no se alternan.
     *
     * @param  array|null  $esquema  Si viene, se pide JSON y se explica el formato.
     */
    private function mensajes(string $sistema, array $contenidos, ?array $esquema): array
    {
        if ($esquema !== null) {
            $sistema .= "\n\nFORMATO DE LA RESPUESTA\n"
                . "Responde SOLO con un objeto JSON válido: sin texto antes ni después "
                . "y sin bloques de código. Tiene que cumplir este esquema JSON:\n"
                . json_encode($this->esquemaJson($esquema), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        }

        $mensajes = [['role' => 'system', 'content' => $sistema]];

        foreach ($contenidos as $turno) {
            $texto = collect($turno['parts'] ?? [])
                ->map(fn ($p) => is_string($p['text'] ?? null) ? $p['text'] : '')
                ->implode('');

            if (trim($texto) === '') {
                continue;
            }

            $rol = ($turno['role'] ?? 'user') === 'model' ? 'assistant' : 'user';
            $ultimo = count($mensajes) - 1;

            if ($ultimo > 0 && $mensajes[$ultimo]['role'] === $rol) {
                $mensajes[$ultimo]['content'] .= "\n\n" . $texto;
            } else {
                $mensajes[] = ['role' => $rol, 'content' => $texto];
            }
        }

        return $mensajes;
    }

    /**
     * El esquema de Gemini usa los tipos en mayúsculas (OBJECT, STRING...).
     * El estándar JSON Schema los quiere en minúsculas.
     */
    private function esquemaJson(array $esquema): array
    {
        $salida = [];

        foreach ($esquema as $clave => $valor) {
            if ($clave === 'type' && is_string($valor)) {
                $salida[$clave] = strtolower($valor);
            } elseif (is_array($valor)) {
                $salida[$clave] = $this->esquemaJson($valor);
            } else {
                $salida[$clave] = $valor;
            }
        }

        return $salida;
    }

    /**
     * El texto de la respuesta, en formato OpenAI.
     *
     * Devuelve null si la respuesta salió cortada por el límite de
     * palabras, y '' si no trae texto.
     */
    private function textoDeLaRespuesta(?array $datos): ?string
    {
        $datos ??= [];

        // Por si Cloudflare la envuelve en { "result": ... }.
        if (isset($datos['result']) && is_array($datos['result'])) {
            $datos = $datos['result'];
        }

        $eleccion = $datos['choices'][0] ?? null;

        if ($eleccion === null) {
            // Formato propio de Cloudflare: { "response": "..." }
            $contenido = $datos['response'] ?? '';
        } else {
            if (($eleccion['finish_reason'] ?? null) === 'length') {
                return null;
            }
            $contenido = $eleccion['message']['content'] ?? '';
        }

        // En modo JSON algunos modelos devuelven ya el objeto, no un texto.
        if (is_array($contenido)) {
            $contenido = array_is_list($contenido)
                ? collect($contenido)->map(fn ($p) => is_array($p) ? ($p['text'] ?? '') : (string) $p)->implode('')
                : json_encode($contenido, JSON_UNESCAPED_UNICODE);
        }

        // Los modelos que "piensan" a veces dejan el razonamiento entre
        // <think>...</think> dentro de la respuesta. No es para David.
        $texto = preg_replace('/<think>.*?<\/think>/s', '', (string) $contenido);

        return trim($texto);
    }

    /**
     * Saca el objeto JSON de la respuesta aunque venga dentro de un
     * bloque ```json``` o con alguna frase delante. Devuelve el JSON
     * limpio, o null si no hay un objeto válido.
     */
    private function extraerJson(string $texto): ?string
    {
        $texto = trim($texto);
        $texto = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', $texto);

        $desde = strpos($texto, '{');
        $hasta = strrpos($texto, '}');

        if ($desde === false || $hasta === false || $hasta < $desde) {
            return null;
        }

        $datos = json_decode(substr($texto, $desde, $hasta - $desde + 1), true);

        return is_array($datos)
            ? json_encode($datos, JSON_UNESCAPED_UNICODE)
            : null;
    }

    private function mensajeError(Response $res): string
    {
        $mensaje = $res->json('error.message')
            ?? $res->json('errors.0.message')
            ?? (is_string($res->json('error')) ? $res->json('error') : null)
            ?? $res->body();

        return (string) $mensaje;
    }

    /* ══════════════════════════════════════════════════════
       CONFIGURACIÓN
       ══════════════════════════════════════════════════════ */

    /**
     * Los proveedores de IA_PROVEEDORES que tienen su clave puesta,
     * en orden.
     *
     * @return string[]
     */
    private function proveedoresConfigurados(): array
    {
        $lista = (array) config('services.ia.proveedores', ['groq', 'cloudflare']);

        return array_values(array_filter(
            array_unique(array_map(fn ($p) => strtolower(trim((string) $p)), $lista)),
            fn ($p) => match ($p) {
                'groq'       => filled(config('services.ia.groq.api_key')),
                'cloudflare' => filled(config('services.ia.cloudflare.account_id'))
                             && filled(config('services.ia.cloudflare.api_token')),
                'gemini'     => filled(config('services.gemini.api_key')),
                default      => false,
            },
        ));
    }

    /** @return string[] */
    private function modelos(string $proveedor): array
    {
        $lista = (array) config("services.ia.{$proveedor}.modelos", []);

        return array_values(array_unique(array_filter(array_map('trim', $lista))));
    }

    /** @return array{0: string, 1: string}  URL y clave */
    private function destino(string $proveedor): array
    {
        if ($proveedor === 'cloudflare') {
            $cuenta = rawurlencode((string) config('services.ia.cloudflare.account_id'));

            return [
                "https://api.cloudflare.com/client/v4/accounts/{$cuenta}/ai/v1/chat/completions",
                (string) config('services.ia.cloudflare.api_token'),
            ];
        }

        return [
            'https://api.groq.com/openai/v1/chat/completions',
            (string) config('services.ia.groq.api_key'),
        ];
    }

    private function restante(float $inicio): float
    {
        return self::PRESUPUESTO_SEGUNDOS - (microtime(true) - $inicio);
    }

    /**
     * El motivo más útil para quien lee el error.
     *
     * Solo se dice "clave" si TODOS fallaron por la clave: si uno tenía
     * la clave bien y estaba saturado, el problema real es la saturación.
     */
    private function motivoFinal(array $motivos): string
    {
        $motivos = array_values(array_unique($motivos));

        return match (true) {
            $motivos === []                 => 'saturado',
            $motivos === ['clave']          => 'clave',
            in_array('cupo', $motivos)      => 'cupo',
            in_array('vacio', $motivos)     => 'vacio',
            $motivos === ['red']            => 'red',
            default                         => 'saturado',
        };
    }
}

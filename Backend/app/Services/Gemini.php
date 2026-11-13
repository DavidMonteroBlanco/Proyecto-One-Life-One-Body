<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * ══════════════════════════════════════════════════════════
 * GEMINI
 *
 * El único sitio que habla con la API de Google. Lo usan los dos
 * chats: el de la web pública y el asistente de dietas del panel.
 *
 * Antes cada uno tenía su propia llamada, y las dos fallaban igual:
 *
 *  1. Un solo intento. El modelo rápido de Google responde 503
 *     ("alta demanda") a menudo, y con eso bastaba para que el chat
 *     contestara con un error.
 *
 *  2. Un solo modelo, escrito a mano. Cuando Google lo retiró para
 *     claves nuevas, las dos funciones murieron a la vez.
 *
 *  3. Solo se leía el primer trozo de la respuesta. Los modelos que
 *     "piensan" antes de contestar pueden devolver la respuesta en
 *     varias partes, o ninguna si se les acaba el presupuesto de
 *     palabras pensando.
 *
 * Aquí se intenta cada modelo dos veces si está saturado, luego se
 * pasa al siguiente de la lista, y la respuesta se arma con todas
 * sus partes. Todo con un tiempo máximo, para que quien está
 * esperando en el chat no se quede colgado.
 * ══════════════════════════════════════════════════════════
 */
class Gemini
{
    private const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/';

    /** Tiempo total máximo de una consulta, sumando reintentos y modelos. */
    private const PRESUPUESTO_SEGUNDOS = 40;

    /** Intentos por modelo cuando Google dice que está saturado. */
    private const INTENTOS_POR_MODELO = 2;

    /**
     * @param  string  $sistema     Instrucciones de sistema (el "quién eres").
     * @param  array   $contenidos  Turnos en formato Gemini: [['role' => 'user', 'parts' => [['text' => '...']]], ...]
     * @param  array   $config      generationConfig (temperatura, tokens, JSON...).
     * @param  string  $uso         Etiqueta para el registro: 'chat-web', 'asistente', 'borrador'.
     *
     * @return array{ok: bool, texto?: string, modelo?: string, motivo?: string}
     *
     *   motivo, cuando ok es false:
     *     sin_clave   falta GEMINI_API_KEY
     *     clave       Google rechaza la clave (inválida o sin permisos)
     *     saturado    todos los modelos saturados o caídos
     *     bloqueado   el filtro de contenido de Google cortó la respuesta
     *     vacio       respondió sin texto utilizable
     *     red         no se pudo contactar con Google
     */
    public function generar(string $sistema, array $contenidos, array $config, string $uso): array
    {
        $clave = config('services.gemini.api_key');

        if (! $clave) {
            Log::warning('GEMINI_SIN_CLAVE', ['uso' => $uso]);

            return ['ok' => false, 'motivo' => 'sin_clave'];
        }

        /*
         * Los hostings compartidos suelen cortar cada petición a los 30 s.
         * Con reintentos y modelos de reserva esto puede pasar de ahí, así
         * que se pide margen. Si el hosting no lo permite, no pasa nada:
         * el presupuesto de abajo ya intenta acabar antes.
         */
        @set_time_limit(self::PRESUPUESTO_SEGUNDOS + 15);

        $inicio = microtime(true);
        $rastro = [];      // qué pasó con cada intento, para el registro
        $ultimoMotivo = 'saturado';

        foreach ($this->modelos() as $modelo) {
            for ($intento = 1; $intento <= self::INTENTOS_POR_MODELO; $intento++) {

                $restante = self::PRESUPUESTO_SEGUNDOS - (microtime(true) - $inicio);
                if ($restante < 5) {
                    break 2;    // sin tiempo para otro intento con sentido
                }

                $r = $this->llamar($clave, $modelo, $sistema, $contenidos, $config, (int) min(30, $restante));
                $rastro[] = "{$modelo}#{$intento}:{$r['estado']}";

                if ($r['estado'] === 'ok') {
                    Log::info('GEMINI_OK', [
                        'uso'      => $uso,
                        'modelo'   => $modelo,
                        'intentos' => count($rastro),
                        'segundos' => round(microtime(true) - $inicio, 1),
                    ]);

                    return ['ok' => true, 'texto' => $r['texto'], 'modelo' => $modelo];
                }

                $ultimoMotivo = $r['motivo'];

                // Con estos no tiene sentido insistir con nada: la clave
                // está mal, o el contenido lo ha bloqueado Google.
                if (in_array($r['motivo'], ['clave', 'bloqueado'], true)) {
                    break 2;
                }

                // Modelo retirado o que no admite la petición: al siguiente
                // sin gastar un segundo intento.
                if ($r['estado'] === 'no_disponible') {
                    continue 2;
                }

                // Saturado o error temporal: una espera corta y otra vez.
                if ($intento < self::INTENTOS_POR_MODELO) {
                    usleep(1_200_000);
                }
            }
        }

        // Se registra QUÉ pasó, nunca el contenido de la conversación:
        // lleva datos de salud de clientes.
        Log::warning('GEMINI_FALLO', [
            'uso'      => $uso,
            'motivo'   => $ultimoMotivo,
            'rastro'   => $rastro,
            'segundos' => round(microtime(true) - $inicio, 1),
        ]);

        return ['ok' => false, 'motivo' => $ultimoMotivo];
    }

    /**
     * El modelo principal y los de reserva, sin repetir.
     *
     * @return string[]
     */
    private function modelos(): array
    {
        $lista = array_merge(
            [(string) config('services.gemini.model')],
            (array) config('services.gemini.fallback_models', [])
        );

        return array_values(array_unique(array_filter(array_map('trim', $lista))));
    }

    /**
     * Una sola llamada a un modelo.
     *
     * @return array{estado: string, motivo?: string, texto?: string}
     *   estado: ok · reintentable · no_disponible · definitivo
     */
    private function llamar(
        string $clave,
        string $modelo,
        string $sistema,
        array $contenidos,
        array $config,
        int $timeout,
    ): array {
        try {
            // La clave va en la cabecera y no en la URL: así no queda
            // escrita en los registros de acceso ni en las trazas.
            $res = Http::timeout(max(5, $timeout))
                ->withHeaders(['x-goog-api-key' => $clave])
                ->post(self::ENDPOINT . $modelo . ':generateContent', [
                    'system_instruction' => ['parts' => [['text' => $sistema]]],
                    'contents'           => $contenidos,
                    'generationConfig'   => $config,
                ]);
        } catch (\Throwable $e) {
            // Tiempo agotado o red caída: merece otro intento.
            Log::notice('GEMINI_RED', ['modelo' => $modelo, 'error' => mb_substr($e->getMessage(), 0, 160)]);

            return ['estado' => 'reintentable', 'motivo' => 'red'];
        }

        $http = $res->status();

        if ($res->failed()) {
            // El mensaje de error de Google dice la causa ("API key not
            // valid", "model not found"...) y no contiene la conversación,
            // así que se puede registrar. El cuerpo entero no.
            $error = (string) $res->json('error.message', '');
            Log::notice('GEMINI_HTTP', [
                'modelo' => $modelo,
                'http'   => $http,
                'error'  => mb_substr($error, 0, 200),
            ]);

            return match (true) {
                in_array($http, [401, 403], true)       => ['estado' => 'definitivo', 'motivo' => 'clave'],
                $http === 400 && str_contains($error, 'API key')
                                                       => ['estado' => 'definitivo', 'motivo' => 'clave'],
                in_array($http, [400, 404], true)       => ['estado' => 'no_disponible', 'motivo' => 'saturado'],
                default                                 => ['estado' => 'reintentable', 'motivo' => 'saturado'], // 429, 5xx
            };
        }

        $candidato = $res->json('candidates.0') ?? [];
        $fin = $candidato['finishReason'] ?? null;

        // Todas las partes con texto, en orden. Las de "pensamiento" no
        // son la respuesta y se descartan.
        $texto = collect($candidato['content']['parts'] ?? [])
            ->filter(fn ($p) => is_string($p['text'] ?? null) && empty($p['thought']))
            ->pluck('text')
            ->implode('');

        /*
         * Una respuesta cortada por el límite de tokens NO se da por buena.
         *
         * Pasa con los modelos que piensan antes de contestar: gastan el
         * presupuesto pensando y la respuesta sale a medias. Probado con
         * gemini-3-flash-preview: de 300 tokens se comió 287 pensando y
         * devolvió "Estamos ubicados en la Avenida de Europa," — cortada y,
         * de paso, con una dirección inventada. Mejor otro modelo que eso.
         */
        if ($fin === 'MAX_TOKENS') {
            Log::notice('GEMINI_CORTADO', ['modelo' => $modelo]);

            return ['estado' => 'no_disponible', 'motivo' => 'vacio'];
        }

        if (trim($texto) !== '') {
            return ['estado' => 'ok', 'texto' => trim($texto)];
        }

        // Sin texto. Puede ser que Google lo haya bloqueado, o que se le
        // acabara el presupuesto de palabras pensando antes de contestar.
        $bloqueado = in_array($fin, ['SAFETY', 'PROHIBITED_CONTENT', 'BLOCKLIST', 'SPII', 'RECITATION'], true)
            || $res->json('promptFeedback.blockReason') !== null;

        Log::notice('GEMINI_SIN_TEXTO', ['modelo' => $modelo, 'fin' => $fin, 'bloqueado' => $bloqueado]);

        return $bloqueado
            ? ['estado' => 'definitivo', 'motivo' => 'bloqueado']
            : ['estado' => 'no_disponible', 'motivo' => 'vacio'];
    }
}

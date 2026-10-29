<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WeightRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Asistente de IA del panel de administración.
 *
 * Solo para David (middleware admin). Dos modos:
 *
 *   chat()  → conversación normal para consultar y afinar ideas.
 *   draft() → devuelve un plan de comidas en JSON estructurado,
 *             listo para cargarse en el formulario de dietas.
 *
 * Lo que sale de aquí es SIEMPRE un borrador. No se envía nada a
 * ningún cliente sin que David lo revise y le dé a enviar.
 */
class AiAssistantController extends Controller
{
    private const MODEL = 'gemini-2.5-flash';
    private const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/';

    /** Tipos de comida admitidos. Debe coincidir con Frontend/src/lib/meals.ts */
    private const MEAL_TYPES = [
        'desayuno', 'media_manana', 'comida', 'merienda',
        'pre_entreno', 'post_entreno', 'cena',
    ];

    // ══════════════════════════════════════════════════════════
    // CONVERSACIÓN
    // ══════════════════════════════════════════════════════════

    public function chat(Request $request)
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'history' => ['nullable', 'array', 'max:30'],
            'history.*.role' => ['required_with:history', 'string', 'in:user,model'],
            'history.*.text' => ['required_with:history', 'string', 'max:4000'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $contents = $this->buildContents($data);

        $result = $this->callGemini(
            systemPrompt: $this->systemPrompt($this->clientContext($data['user_id'] ?? null)),
            contents: $contents,
            generationConfig: [
                'temperature' => 0.6,
                'maxOutputTokens' => 1200,
            ],
        );

        if (!$result['ok']) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        return response()->json(['reply' => $result['text']]);
    }

    // ══════════════════════════════════════════════════════════
    // BORRADOR DE PLAN EN JSON
    // ══════════════════════════════════════════════════════════

    public function draft(Request $request)
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'history' => ['nullable', 'array', 'max:30'],
            'history.*.role' => ['required_with:history', 'string', 'in:user,model'],
            'history.*.text' => ['required_with:history', 'string', 'max:4000'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $contents = $this->buildContents($data);

        // Se pide la respuesta como JSON con esquema fijo. Así no hay
        // que rascar el plan de dentro de un texto en prosa, que es
        // donde estas integraciones se rompen.
        $result = $this->callGemini(
            systemPrompt: $this->systemPrompt($this->clientContext($data['user_id'] ?? null))
                . "\n\nDevuelve ÚNICAMENTE el plan en el formato JSON solicitado.",
            contents: $contents,
            generationConfig: [
                'temperature' => 0.4,
                'maxOutputTokens' => 2400,
                'responseMimeType' => 'application/json',
                'responseSchema' => [
                    'type' => 'OBJECT',
                    'properties' => [
                        'title' => ['type' => 'STRING'],
                        'notes' => ['type' => 'STRING'],
                        'meals' => [
                            'type' => 'ARRAY',
                            'items' => [
                                'type' => 'OBJECT',
                                'properties' => [
                                    'meal_type' => ['type' => 'STRING', 'enum' => self::MEAL_TYPES],
                                    'foods'     => ['type' => 'STRING'],
                                    'calories'  => ['type' => 'STRING'],
                                    'macros'    => ['type' => 'STRING'],
                                ],
                                'required' => ['meal_type', 'foods'],
                            ],
                        ],
                    ],
                    'required' => ['title', 'meals'],
                ],
            ],
        );

        if (!$result['ok']) {
            return response()->json(['message' => $result['message']], $result['status']);
        }

        $plan = json_decode($result['text'], true);

        if (!is_array($plan) || empty($plan['meals'])) {
            return response()->json([
                'message' => 'El asistente no devolvió un plan utilizable. Pruébalo otra vez siendo más concreto.',
            ], 422);
        }

        return response()->json(['plan' => $this->sanitizePlan($plan)]);
    }

    // ══════════════════════════════════════════════════════════
    // INTERNOS
    // ══════════════════════════════════════════════════════════

    /** Convierte el historial validado al formato de contenidos de Gemini. */
    private function buildContents(array $data): array
    {
        $contents = [];

        foreach ($data['history'] ?? [] as $msg) {
            $text = trim($msg['text'] ?? '');
            if ($text === '') {
                continue;
            }
            $contents[] = [
                'role'  => $msg['role'] === 'user' ? 'user' : 'model',
                'parts' => [['text' => $text]],
            ];
        }

        $contents[] = [
            'role'  => 'user',
            'parts' => [['text' => $data['message']]],
        ];

        return $contents;
    }

    /**
     * Contexto del cliente seleccionado: sus últimos pesajes.
     *
     * Se manda lo mínimo necesario para que el plan tenga sentido —
     * nombre de pila, peso y composición — y nunca el email, el
     * teléfono ni la fecha de nacimiento.
     */
    private function clientContext(?int $userId): string
    {
        if (!$userId) {
            return '';
        }

        $user = User::find($userId);
        if (!$user) {
            return '';
        }

        $records = WeightRecord::where('user_id', $user->id)
            ->orderByDesc('recorded_at')
            ->limit(5)
            ->get(['weight_kg', 'fat_percentage', 'muscle_percentage', 'recorded_at']);

        if ($records->isEmpty()) {
            return "\n\nCLIENTE: " . explode(' ', $user->name)[0] . " (sin pesajes registrados todavía).";
        }

        $lines = $records->map(function ($r) {
            $parts = [date('d/m/Y', strtotime($r->recorded_at)) . ': ' . $r->weight_kg . ' kg'];
            if ($r->fat_percentage !== null) {
                $parts[] = $r->fat_percentage . '% grasa';
            }
            if ($r->muscle_percentage !== null) {
                $parts[] = $r->muscle_percentage . '% músculo';
            }
            return '- ' . implode(', ', $parts);
        })->implode("\n");

        return "\n\nCLIENTE: " . explode(' ', $user->name)[0]
            . "\nÚLTIMOS PESAJES (del más reciente al más antiguo):\n" . $lines;
    }

    private function systemPrompt(string $clientContext): string
    {
        return <<<PROMPT
        Eres el asistente de nutrición de ONE LIFE ONE BODY, un centro de entrenamiento
        personal en Benidorm. Hablas ÚNICAMENTE con David, el entrenador. El cliente
        final nunca te lee directamente.

        TU TRABAJO
        Ayudar a David a redactar planes de alimentación para sus clientes: proponer
        comidas, ajustar calorías y macros, sugerir alternativas y revisar lo que ya
        tiene escrito.

        CÓMO TRABAJAS
        - Responde siempre en español, en tono profesional y directo.
        - Comida mediterránea y de supermercado español: lo que se compra en Benidorm,
          no ingredientes exóticos ni difíciles de encontrar.
        - Cantidades concretas en gramos o medidas caseras. "Pollo" no sirve;
          "150 g de pechuga de pollo a la plancha" sí.
        - Si te falta un dato importante (objetivo, peso, alergias, presupuesto,
          número de comidas), PREGÚNTALO antes de inventártelo.
        - Los tipos de comida disponibles son exactamente: desayuno, media_manana,
          comida, merienda, pre_entreno, post_entreno, cena.

        LÍMITES IMPORTANTES
        - Lo que produces es un BORRADOR para que David lo revise y corrija. Nunca
          des por hecho que va a salir tal cual.
        - No eres médico. No diagnostiques, no trates patologías y no prescribas
          suplementación para condiciones médicas.
        - Si aparece un embarazo, un trastorno de la conducta alimentaria, diabetes,
          una patología renal o hepática, o una alergia grave, dilo claramente: ese
          caso necesita un dietista-nutricionista colegiado o un médico, no un plan
          genérico.
        - Nunca propongas dietas por debajo de 1200 kcal sin supervisión médica, ni
          planes de pérdida de peso superiores a 1 kg por semana.
        {$clientContext}
        PROMPT;
    }

    /** Limpia y acota lo que devuelve el modelo antes de dárselo al frontend. */
    private function sanitizePlan(array $plan): array
    {
        $meals = [];

        foreach ($plan['meals'] ?? [] as $meal) {
            $type = $meal['meal_type'] ?? '';
            if (!in_array($type, self::MEAL_TYPES, true)) {
                continue;
            }
            $meals[] = [
                'meal_type' => $type,
                'foods'     => mb_substr(trim((string) ($meal['foods'] ?? '')), 0, 1000),
                'calories'  => mb_substr(trim((string) ($meal['calories'] ?? '')), 0, 50),
                'macros'    => mb_substr(trim((string) ($meal['macros'] ?? '')), 0, 50),
            ];
        }

        return [
            'title' => mb_substr(trim((string) ($plan['title'] ?? 'Plan sin título')), 0, 120),
            'notes' => mb_substr(trim((string) ($plan['notes'] ?? '')), 0, 1000),
            'meals' => array_slice($meals, 0, 12),
        ];
    }

    /**
     * Llamada a Gemini.
     *
     * La clave va en la cabecera x-goog-api-key y no en la query string,
     * para que no acabe escrita en los logs de acceso ni en las trazas
     * de error de la petición saliente.
     */
    private function callGemini(string $systemPrompt, array $contents, array $generationConfig): array
    {
        $apiKey = config('services.gemini.api_key');

        if (!$apiKey) {
            return [
                'ok' => false,
                'status' => 503,
                'message' => 'El asistente no está configurado: falta GEMINI_API_KEY en el servidor.',
            ];
        }

        try {
            $response = Http::timeout(45)
                ->withHeaders(['x-goog-api-key' => $apiKey])
                ->post(self::ENDPOINT . self::MODEL . ':generateContent', [
                    'system_instruction' => ['parts' => [['text' => $systemPrompt]]],
                    'contents' => $contents,
                    'generationConfig' => $generationConfig,
                ]);
        } catch (\Throwable $e) {
            Log::error('AI_ASSISTANT_TRANSPORT_ERROR', ['error' => $e->getMessage()]);
            return [
                'ok' => false,
                'status' => 504,
                'message' => 'No se ha podido contactar con el asistente. Inténtalo de nuevo.',
            ];
        }

        if (!$response->successful()) {
            // Se registra el código, nunca el cuerpo: podría venir con
            // fragmentos del prompt y datos del cliente.
            Log::error('AI_ASSISTANT_HTTP_ERROR', ['status' => $response->status()]);
            return [
                'ok' => false,
                'status' => 502,
                'message' => 'El asistente ha devuelto un error. Inténtalo de nuevo en un momento.',
            ];
        }

        $text = $response->json('candidates.0.content.parts.0.text');

        if (!is_string($text) || trim($text) === '') {
            return [
                'ok' => false,
                'status' => 502,
                'message' => 'El asistente no ha devuelto respuesta. Reformula la petición.',
            ];
        }

        return ['ok' => true, 'text' => trim($text)];
    }
}

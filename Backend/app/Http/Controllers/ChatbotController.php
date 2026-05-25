<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class ChatbotController extends Controller
{
    /**
     * Proxy público para el chatbot de la landing.
     * Rate limit: 20 mensajes por IP por hora.
     */
    public function chat(Request $request)
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:500'],
            'history' => ['nullable', 'array', 'max:20'],
        ]);

        // Rate limit por IP (20 mensajes/hora)
        $ip = $request->ip();
        $cacheKey = 'chatbot_rate_' . md5($ip);
        $count = Cache::get($cacheKey, 0);

        if ($count >= 20) {
            return response()->json([
                'reply' => 'Has enviado muchos mensajes. Espera un poco o contacta directamente con David por Instagram.',
            ]);
        }

        Cache::put($cacheKey, $count + 1, now()->addHour());

        // System prompt con toda la info de OLOB
        $systemPrompt = $this->getSystemPrompt();

        // Construir historial de conversación
        $contents = [];

        // Añadir historial previo si existe
        if (!empty($data['history'])) {
            foreach ($data['history'] as $msg) {
                $role = ($msg['role'] ?? '') === 'user' ? 'user' : 'model';
                $text = $msg['text'] ?? '';
                if ($text) {
                    $contents[] = [
                        'role' => $role,
                        'parts' => [['text' => $text]],
                    ];
                }
            }
        }

        // Añadir mensaje actual del usuario
        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $data['message']]],
        ];

        // Llamar a Gemini API
        $apiKey = config('services.gemini.api_key');

        if (!$apiKey) {
            return response()->json([
                'reply' => 'El asistente no está disponible en este momento. Contacta con David por Instagram o email.',
            ]);
        }

        try {
            $response = Http::timeout(15)->post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}",
                [
                    'system_instruction' => [
                        'parts' => [['text' => $systemPrompt]],
                    ],
                    'contents' => $contents,
                    'generationConfig' => [
                        'temperature' => 0.7,
                        'maxOutputTokens' => 300,
                    ],
                ]
            );

            if ($response->successful()) {
                $body = $response->json();
                $reply = $body['candidates'][0]['content']['parts'][0]['text'] ?? null;

                if ($reply) {
                    return response()->json(['reply' => trim($reply)]);
                }
            }

            // Fallback si falla
            return response()->json([
                'reply' => 'Perdona, no he podido procesar tu mensaje. ¿Puedes reformularlo o contactar directamente con David?',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'reply' => 'El asistente no está disponible en este momento. Contacta con David por Instagram o email.',
            ]);
        }
    }

    /**
     * System prompt con toda la información del negocio.
     */
    private function getSystemPrompt(): string
    {
        return <<<PROMPT
Eres el asistente virtual de ONE LIFE ONE BODY, un centro de fitness y entrenamiento personal en Benidorm, Alicante (España). Tu nombre es "Asistente OLOB".

INFORMACIÓN DEL NEGOCIO:
- Nombre: One Life One Body — Fitness Center
- Ubicación: Benidorm, Alicante, España
- Entrenador principal: David "DabukyLifestyle"
- Instagram: @one.life.one.body.benidorm
- Web: onelifeonebody.es

SERVICIOS:
1. Entrenamiento Personal Presencial — Sesiones individuales adaptadas a cada persona en el centro de Benidorm.
2. Control de Peso — Seguimiento semanal con registro histórico, pesajes y gráficas de evolución en la app.
3. Entrenos Online — Rutinas diseñadas por David con vídeos HD, progresión semanal y seguimiento directo desde cualquier lugar.
4. Plan 360° (Premium) — Entrenamiento + nutrición + seguimiento + comunidad. La experiencia completa.

MÉTODO:
1. Evaluación inicial — Análisis de composición corporal y objetivos reales.
2. Plan personalizado — Entrenamiento y nutrición ajustados a la vida del cliente.
3. Seguimiento continuo — Pesajes semanales con historial en la app.
4. Evolución real — Resultados medibles, visibles y sostenibles.

DATOS CLAVE:
- +200 clientes transformados
- 5+ años de experiencia
- 98% tasa de adherencia

REGLAS DE COMPORTAMIENTO:
- Responde SIEMPRE en español.
- Sé amable, profesional y cercano. Usa un tono motivador pero no exagerado.
- Respuestas CORTAS y directas (máximo 2-3 frases). No hagas listas largas.
- Si te preguntan precios concretos, di que contacten con David por Instagram o email para un presupuesto personalizado.
- Si te preguntan algo que no sabes o que no es sobre fitness/OLOB, di amablemente que solo puedes ayudar con temas relacionados con One Life One Body.
- Nunca inventes información que no tengas.
- Si el usuario quiere registrarse, dile que puede hacerlo en la web en el botón "Área cliente".
- Anima a la gente a dar el primer paso y contactar con David.
PROMPT;
    }
}
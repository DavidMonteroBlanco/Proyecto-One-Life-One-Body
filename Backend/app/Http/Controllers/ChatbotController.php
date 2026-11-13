<?php

namespace App\Http\Controllers;

use App\Services\Gemini;
use Illuminate\Http\Request;

/**
 * Chat de la web pública.
 *
 * Contesta dudas de visitantes sobre el centro. La llamada a Google
 * la hace el servicio Gemini, que es quien reintenta y cambia de
 * modelo si el principal está saturado.
 *
 * El límite de mensajes (20 por hora y visitante) lo pone el
 * middleware throttle:chatbot en la ruta. Antes había además un
 * contador hecho a mano aquí dentro que lo duplicaba, y que contaba
 * también los mensajes que habían fallado.
 */
class ChatbotController extends Controller
{
    public function __construct(
        private Gemini $gemini,
    ) {}

    public function chat(Request $request)
    {
        $data = $request->validate([
            'message'        => ['required', 'string', 'max:500'],
            'history'        => ['nullable', 'array', 'max:20'],
            'history.*.role' => ['required_with:history', 'string', 'in:user,model'],
            'history.*.text' => ['required_with:history', 'string', 'max:2000'],
        ]);

        $contenidos = [];
        foreach ($data['history'] ?? [] as $msg) {
            $texto = trim($msg['text']);
            if ($texto !== '') {
                $contenidos[] = ['role' => $msg['role'], 'parts' => [['text' => $texto]]];
            }
        }
        $contenidos[] = ['role' => 'user', 'parts' => [['text' => $data['message']]]];

        $r = $this->gemini->generar(
            sistema: $this->instrucciones(),
            contenidos: $contenidos,
            config: [
                'temperature'     => 0.7,
                // Holgado a propósito. El prompt ya pide 2-3 frases, y un
                // modelo que no piensa se para solo mucho antes. Este margen
                // es para los modelos de reserva que sí piensan: con 300
                // gastaban casi todo pensando y la respuesta salía cortada.
                'maxOutputTokens' => 1024,
            ],
            uso: 'chat-web',
        );

        if ($r['ok']) {
            return response()->json(['reply' => $r['texto']]);
        }

        // El visitante no tiene por qué saber qué ha fallado por dentro;
        // la causa concreta ya ha quedado en el registro.
        return response()->json([
            'reply' => 'Ahora mismo no puedo responderte por aquí. Escríbele a David por Instagram ('
                     . '@' . config('olob.instagram') . ') o llama al '
                     . config('olob.telefono') . ' y te atiende él.',
        ]);
    }

    /**
     * Lo que el asistente sabe del centro.
     *
     * Los datos de contacto salen de config/olob.php, no van escritos
     * aquí. Con solo "Benidorm", el modelo se inventaba una dirección
     * cuando le preguntaban dónde estáis.
     */
    private function instrucciones(): string
    {
        $c = config('olob');

        return <<<PROMPT
Eres el asistente virtual de ONE LIFE ONE BODY, un centro de fitness y entrenamiento personal en Benidorm (Alicante, España). Te llamas "Asistente OLOB".

DATOS DEL CENTRO (úsalos tal cual, no inventes otros):
- Dirección: {$c['direccion']}
- Teléfono: {$c['telefono']}
- Instagram: @{$c['instagram']}
- Web: {$c['web']}
- Entrenador principal: David

SERVICIOS:
1. Entrenamiento personal presencial: sesiones individuales adaptadas a cada persona, en el centro.
2. Control de peso: pesaje semanal con historial y gráficas de evolución en la app del cliente.
3. Entrenos online: rutinas diseñadas por David con progresión semanal, desde cualquier sitio.
4. Plan 360°: entrenamiento, nutrición y seguimiento juntos. La experiencia completa.

MÉTODO:
1. Evaluación inicial de composición corporal y objetivos.
2. Plan personalizado de entrenamiento y nutrición.
3. Seguimiento continuo con pesajes semanales.
4. Resultados medibles y sostenibles.

DATOS CLAVE (los mismos que en la portada):
- +200 clientes transformados
- 5+ años de experiencia
- 98% de tasa de adherencia

CÓMO RESPONDES:
- Siempre en español, amable, cercano y profesional. Motivador sin exagerar.
- Respuestas cortas: 2-3 frases. Sin listas largas.
- Precios: no los des. Di que cada plan es personalizado y que contacten con David por Instagram o por teléfono para un presupuesto.
- Si no sabes algo o no es sobre el centro o el fitness, dilo con amabilidad y ofrece contactar con David.
- Nunca inventes datos: horarios, precios, direcciones o nombres que no estén aquí.
- Para registrarse: botón "Área cliente" de la web.
- No das consejos médicos. Ante lesiones, embarazo o patologías, recomienda consultar con un profesional sanitario y hablar con David.
PROMPT;
    }
}

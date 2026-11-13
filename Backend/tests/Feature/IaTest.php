<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Ia;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * Pruebas del servicio de IA gratuita (Groq + Cloudflare).
 *
 * No llaman a internet: las respuestas de Groq y Cloudflare se
 * simulan con Http::fake(), así que se pueden ejecutar sin claves:
 *
 *   php artisan test --filter=IaTest
 */
class IaTest extends TestCase
{
    use RefreshDatabase;

    private const GROQ = 'https://api.groq.com/openai/v1/chat/completions';
    private const CLOUDFLARE = 'https://api.cloudflare.com/client/v4/accounts/cuenta123/ai/v1/chat/completions';

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.ia.proveedores'           => ['groq', 'cloudflare'],
            'services.ia.groq.api_key'          => 'clave-groq',
            'services.ia.groq.modelos'          => ['modelo-groq-1', 'modelo-groq-2'],
            'services.ia.groq.max_tokens'       => 4096,
            'services.ia.cloudflare.account_id' => 'cuenta123',
            'services.ia.cloudflare.api_token'  => 'token-cf',
            'services.ia.cloudflare.modelos'    => ['@cf/modelo-cf-1'],
            'services.gemini.api_key'           => null,
        ]);
    }

    /** Respuesta de éxito en formato OpenAI. */
    private function ok(string $texto, string $fin = 'stop'): array
    {
        return ['choices' => [['message' => ['role' => 'assistant', 'content' => $texto], 'finish_reason' => $fin]]];
    }

    private function generar(array $config = ['temperature' => 0.7, 'maxOutputTokens' => 1024]): array
    {
        return app(Ia::class)->generar(
            sistema: 'Eres el asistente de prueba.',
            contenidos: [
                ['role' => 'user',  'parts' => [['text' => 'Hola']]],
                ['role' => 'model', 'parts' => [['text' => '¡Hola! ¿En qué te ayudo?']]],
                ['role' => 'user',  'parts' => [['text' => '¿Dónde estáis?']]],
            ],
            config: $config,
            uso: 'test',
        );
    }

    private function configBorrador(): array
    {
        return [
            'temperature'      => 0.4,
            'maxOutputTokens'  => 8192,
            'responseMimeType' => 'application/json',
            'responseSchema'   => [
                'type'       => 'OBJECT',
                'properties' => [
                    'title' => ['type' => 'STRING'],
                    'meals' => [
                        'type'  => 'ARRAY',
                        'items' => [
                            'type'       => 'OBJECT',
                            'properties' => [
                                'meal_type' => ['type' => 'STRING', 'enum' => ['desayuno', 'comida', 'cena']],
                                'foods'     => ['type' => 'STRING'],
                            ],
                        ],
                    ],
                ],
                'required' => ['title', 'meals'],
            ],
        ];
    }

    public function test_usa_groq_y_traduce_el_formato_de_gemini(): void
    {
        Http::fake([self::GROQ => Http::response($this->ok('Estamos en Benidorm.'))]);

        $r = $this->generar();

        $this->assertTrue($r['ok']);
        $this->assertSame('Estamos en Benidorm.', $r['texto']);
        $this->assertSame('groq', $r['proveedor']);
        $this->assertSame('modelo-groq-1', $r['modelo']);

        Http::assertSent(function (Request $req) {
            $m = $req['messages'];

            return $req->url() === self::GROQ
                && $req->hasHeader('Authorization', 'Bearer clave-groq')
                && $req['model'] === 'modelo-groq-1'
                && $req['max_completion_tokens'] === 1024
                && $req['temperature'] === 0.7
                && ! isset($req['response_format'])
                && $m[0] === ['role' => 'system', 'content' => 'Eres el asistente de prueba.']
                && $m[1] === ['role' => 'user', 'content' => 'Hola']
                && $m[2] === ['role' => 'assistant', 'content' => '¡Hola! ¿En qué te ayudo?']
                && $m[3] === ['role' => 'user', 'content' => '¿Dónde estáis?'];
        });
        Http::assertSentCount(1);
    }

    public function test_si_se_agota_el_cupo_de_groq_pasa_a_cloudflare(): void
    {
        Http::fake([
            self::GROQ       => Http::response(['error' => ['message' => 'Rate limit reached for model']], 429),
            self::CLOUDFLARE => Http::response($this->ok('Respuesta de Cloudflare')),
        ]);

        $r = $this->generar();

        $this->assertTrue($r['ok']);
        $this->assertSame('cloudflare', $r['proveedor']);
        $this->assertSame('Respuesta de Cloudflare', $r['texto']);

        // Los dos modelos de Groq una vez cada uno (el 429 no se repite) y luego Cloudflare.
        Http::assertSentCount(3);
        Http::assertSent(fn (Request $req) => $req->url() === self::CLOUDFLARE
            && $req->hasHeader('Authorization', 'Bearer token-cf')
            && $req['model'] === '@cf/modelo-cf-1'
            && $req['max_tokens'] === 1024);
    }

    public function test_borrador_json_aunque_venga_dentro_de_un_bloque_de_codigo(): void
    {
        $json = '{"title":"Plan definición","meals":[{"meal_type":"desayuno","foods":"60 g de avena"}]}';
        Http::fake([self::GROQ => Http::response($this->ok("Aquí tienes:\n```json\n{$json}\n```"))]);

        $r = $this->generar($this->configBorrador());

        $this->assertTrue($r['ok']);
        $plan = json_decode($r['texto'], true);
        $this->assertSame('Plan definición', $plan['title']);
        $this->assertSame('desayuno', $plan['meals'][0]['meal_type']);

        Http::assertSent(fn (Request $req) => $req['response_format'] === ['type' => 'json_object']
            && $req['max_completion_tokens'] === 4096                      // tope de Groq
            && str_contains($req['messages'][0]['content'], '"type": "object"')   // esquema en minúsculas
            && str_contains($req['messages'][0]['content'], 'meal_type'));
    }

    public function test_si_el_modelo_no_admite_el_modo_json_lo_repite_sin_el(): void
    {
        Http::fake([
            self::GROQ => Http::sequence()
                ->push(['error' => ['message' => 'response_format `json_object` is not supported with this model']], 400)
                ->push($this->ok('{"title":"Plan","meals":[{"meal_type":"cena","foods":"merluza"}]}')),
        ]);

        $r = $this->generar($this->configBorrador());

        $this->assertTrue($r['ok']);
        $this->assertSame('modelo-groq-1', $r['modelo']);

        $peticiones = Http::recorded();
        $this->assertCount(2, $peticiones);
        $this->assertTrue(isset($peticiones[0][0]['response_format']));
        $this->assertFalse(isset($peticiones[1][0]['response_format']));
    }

    public function test_json_roto_pasa_al_siguiente_modelo(): void
    {
        Http::fake([
            self::GROQ => Http::sequence()
                ->push($this->ok('{"title":"Plan","meals":[{"meal_type":'))   // cortado
                ->push($this->ok('{"title":"Plan B","meals":[{"meal_type":"comida","foods":"arroz"}]}')),
        ]);

        $r = $this->generar($this->configBorrador());

        $this->assertTrue($r['ok']);
        $this->assertSame('modelo-groq-2', $r['modelo']);
        $this->assertSame('Plan B', json_decode($r['texto'], true)['title']);
    }

    public function test_respuesta_cortada_por_limite_pasa_al_siguiente_modelo(): void
    {
        Http::fake([
            self::GROQ => Http::sequence()
                ->push($this->ok('Te propongo para el desayuno', 'length'))
                ->push($this->ok('Respuesta completa.')),
        ]);

        $r = $this->generar();

        $this->assertTrue($r['ok']);
        $this->assertSame('modelo-groq-2', $r['modelo']);
        $this->assertSame('Respuesta completa.', $r['texto']);
    }

    public function test_quita_el_razonamiento_think(): void
    {
        Http::fake([self::GROQ => Http::response($this->ok("<think>El usuario pregunta...</think>\nEstamos en la calle Goya."))]);

        $r = $this->generar();

        $this->assertSame('Estamos en la calle Goya.', $r['texto']);
    }

    public function test_clave_mala_en_groq_salta_a_cloudflare_sin_probar_mas_modelos(): void
    {
        Http::fake([
            self::GROQ       => Http::response(['error' => ['message' => 'Invalid API Key']], 401),
            self::CLOUDFLARE => Http::response($this->ok('OK desde Cloudflare')),
        ]);

        $r = $this->generar();

        $this->assertTrue($r['ok']);
        $this->assertSame('cloudflare', $r['proveedor']);
        Http::assertSentCount(2);   // un solo intento en Groq
    }

    public function test_sin_claves_no_llama_a_nadie(): void
    {
        config([
            'services.ia.groq.api_key'          => null,
            'services.ia.cloudflare.account_id' => null,
            'services.ia.cloudflare.api_token'  => null,
        ]);
        Http::fake();

        $r = $this->generar();

        $this->assertSame(['ok' => false, 'motivo' => 'sin_clave'], $r);
        Http::assertNothingSent();
    }

    public function test_si_falla_la_clave_en_los_dos_dice_clave(): void
    {
        Http::fake([
            self::GROQ       => Http::response(['error' => ['message' => 'Invalid API Key']], 401),
            self::CLOUDFLARE => Http::response(['errors' => [['message' => 'Authentication error']]], 403),
        ]);

        $this->assertSame('clave', $this->generar()['motivo']);
    }

    public function test_cupo_diario_de_cloudflare_aunque_llegue_como_403(): void
    {
        config(['services.ia.groq.api_key' => null]);   // solo Cloudflare
        Http::fake([
            self::CLOUDFLARE => Http::response(['errors' => [['message' => 'You have used up your daily free allocation of 10,000 neurons']]], 403),
        ]);

        $this->assertSame('cupo', $this->generar()['motivo']);
    }

    public function test_un_proveedor_sin_clave_se_salta(): void
    {
        config(['services.ia.groq.api_key' => null]);
        Http::fake([self::CLOUDFLARE => Http::response($this->ok('Solo Cloudflare'))]);

        $r = $this->generar();

        $this->assertSame('cloudflare', $r['proveedor']);
        Http::assertSentCount(1);
    }

    public function test_error_temporal_reintenta_el_mismo_modelo(): void
    {
        Http::fake([
            self::GROQ => Http::sequence()
                ->push(['error' => ['message' => 'Service unavailable']], 503)
                ->push($this->ok('A la segunda')),
        ]);

        $r = $this->generar();

        $this->assertTrue($r['ok']);
        $this->assertSame('modelo-groq-1', $r['modelo']);
        Http::assertSentCount(2);
    }

    /* ── De punta a punta, por las rutas reales ── */

    public function test_chatbot_publico_responde_con_la_ia(): void
    {
        Http::fake([self::GROQ => Http::response($this->ok('¡Hola! Estamos en Benidorm.'))]);

        $this->postJson('/api/chatbot', ['message' => 'Hola'])
            ->assertOk()
            ->assertJson(['reply' => '¡Hola! Estamos en Benidorm.']);
    }

    public function test_chatbot_publico_da_el_contacto_si_falla_todo(): void
    {
        Http::fake([
            self::GROQ       => Http::response([], 429),
            self::CLOUDFLARE => Http::response([], 429),
        ]);

        $this->postJson('/api/chatbot', ['message' => 'Hola'])
            ->assertOk()
            ->assertJsonFragment(['reply' => 'Ahora mismo no puedo responderte por aquí. Escríbele a David por Instagram (@'
                . config('olob.instagram') . ') o llama al ' . config('olob.telefono') . ' y te atiende él.']);
    }

    public function test_borrador_de_dieta_del_panel(): void
    {
        $plan = [
            'title' => 'Plan volumen',
            'notes' => 'Beber 2 litros de agua',
            'meals' => [
                ['meal_type' => 'desayuno', 'foods' => '80 g de avena con leche', 'calories' => '450 kcal', 'macros' => 'P 25 / C 60 / G 10'],
                ['meal_type' => 'merienda_inventada', 'foods' => 'esto se descarta'],
                ['meal_type' => 'cena', 'foods' => '150 g de salmón'],
            ],
        ];
        Http::fake([self::GROQ => Http::response($this->ok(json_encode($plan)))]);

        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->postJson('/api/admin/ai/draft', ['message' => 'Plan de volumen de 2500 kcal'])
            ->assertOk()
            ->assertJsonPath('plan.title', 'Plan volumen')
            ->assertJsonCount(2, 'plan.meals')          // el tipo inventado se descarta
            ->assertJsonPath('plan.meals.0.meal_type', 'desayuno')
            ->assertJsonPath('plan.meals.1.foods', '150 g de salmón');
    }

    public function test_borrador_explica_el_cupo_agotado(): void
    {
        Http::fake([
            self::GROQ       => Http::response([], 429),
            self::CLOUDFLARE => Http::response([], 429),
        ]);

        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->postJson('/api/admin/ai/draft', ['message' => 'Plan'])
            ->assertStatus(503)
            ->assertJsonFragment(['message' => 'Se ha agotado el cupo gratuito de la IA por ahora. Si es el límite por minuto, prueba en un par de minutos; el cupo diario se renueva cada noche.']);
    }
}

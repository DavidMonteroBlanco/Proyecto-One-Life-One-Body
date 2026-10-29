<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        /*
         * ═══════════════════════════════════════════════════════════
         * RATE LIMITING — Protección contra abuso
         * ═══════════════════════════════════════════════════════════
         */

        // API general: 100 peticiones por IP cada 15 minutos
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(100)->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Demasiadas peticiones. Espera un momento antes de intentarlo de nuevo.',
                    ], 429);
                });
        });

        // Auth (login, registro): 5 intentos por IP cada 15 minutos
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinutes(15, 5)->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Demasiados intentos de acceso. Espera 15 minutos antes de intentarlo de nuevo.',
                    ], 429);
                });
        });

        /*
         * Operaciones sensibles de la propia cuenta (cambiar contraseña,
         * pedir código): 10 cada 15 minutos.
         *
         * Se cuenta por usuario cuando hay sesión, y por IP cuando no la
         * hay. Contar solo por IP castigaba a todos los que comparten
         * salida a internet (un gimnasio, un wifi público) y a la vez
         * dejaba que un atacante con varias IP siguiera probando.
         */
        RateLimiter::for('sensitive', function (Request $request) {
            return Limit::perMinutes(15, 10)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Has realizado demasiadas operaciones. Espera unos minutos.',
                    ], 429);
                });
        });

        /*
         * Panel de administración: David encadena muchas operaciones
         * seguidas (altas de pesajes, edición de dietas), así que necesita
         * un margen mucho más alto que el de una cuenta normal. Se cuenta
         * por usuario, no por IP.
         */
        RateLimiter::for('admin', function (Request $request) {
            return Limit::perMinute(120)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Demasiadas operaciones seguidas. Espera unos segundos.',
                    ], 429);
                });
        });

        /*
         * Llamadas a la IA desde el panel: son caras y lentas, así que
         * van con su propio límite por usuario.
         */
        RateLimiter::for('ai', function (Request $request) {
            return Limit::perHour(60)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Has hecho muchas consultas al asistente. Espera un poco.',
                    ], 429);
                });
        });

        // Chatbot: 20 peticiones por IP cada hora
        RateLimiter::for('chatbot', function (Request $request) {
            return Limit::perHour(20)->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Has enviado muchos mensajes. Espera un poco o contacta con David directamente.',
                    ], 429);
                });
        });
    }
}
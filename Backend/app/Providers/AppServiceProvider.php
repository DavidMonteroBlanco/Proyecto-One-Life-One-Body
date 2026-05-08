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

        // Endpoints sensibles (admin, cambio contraseña): 10 por IP cada 15 min
        RateLimiter::for('sensitive', function (Request $request) {
    return Limit::perMinutes(15, 60)->by($request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Has realizado demasiadas operaciones. Espera unos minutos.',
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
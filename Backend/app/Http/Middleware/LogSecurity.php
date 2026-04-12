<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Logging de seguridad.
 * Registra intentos fallidos de auth, rate limits, e inputs sospechosos.
 * NUNCA loguea datos sensibles (contraseñas, tokens, datos personales).
 */
class LogSecurity
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $status = $response->getStatusCode();
        $ip = $request->ip();
        $path = $request->path();
        $method = $request->method();

        // Log intentos fallidos de autenticación (401)
        if ($status === 401) {
            Log::channel('security')->warning('AUTH_FAILED', [
                'ip'     => $ip,
                'path'   => $path,
                'method' => $method,
                'email'  => $request->input('email', '***'), // Solo el email, nunca la contraseña
            ]);
        }

        // Log rate limit excedido (429)
        if ($status === 429) {
            Log::channel('security')->warning('RATE_LIMIT_HIT', [
                'ip'     => $ip,
                'path'   => $path,
                'method' => $method,
            ]);
        }

        // Log validación fallida (422) - posible intento de inyección
        if ($status === 422) {
            Log::channel('security')->info('VALIDATION_REJECTED', [
                'ip'     => $ip,
                'path'   => $path,
                'method' => $method,
                // No logueamos el body completo por seguridad, solo el path
            ]);
        }

        // Log acceso admin denegado (403)
        if ($status === 403) {
            Log::channel('security')->warning('ACCESS_DENIED', [
                'ip'     => $ip,
                'path'   => $path,
                'method' => $method,
                'user_id' => $request->user()?->id,
            ]);
        }

        return $response;
    }
}
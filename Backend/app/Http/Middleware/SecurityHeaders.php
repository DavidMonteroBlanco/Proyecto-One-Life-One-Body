<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Aplica headers de seguridad HTTP a todas las respuestas de la API.
 * Equivalente a helmet.js en Express.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Previene que el navegador interprete archivos con MIME type diferente
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Previene clickjacking (no permite que tu web se meta en un iframe ajeno)
        $response->headers->set('X-Frame-Options', 'DENY');

        // Fuerza HTTPS en producción (navegadores recordarán usar HTTPS durante 1 año)
        if (config('app.env') === 'production') {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // Previene XSS reflected en navegadores antiguos
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // No enviar referrer a sitios externos
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Bloquea acceso a APIs del navegador innecesarias
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        return $response;
    }
}   
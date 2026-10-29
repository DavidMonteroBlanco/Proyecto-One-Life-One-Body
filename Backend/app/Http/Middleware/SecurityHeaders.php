<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Cabeceras de seguridad HTTP en todas las respuestas.
 * Equivalente a helmet.js en Express.
 */
class SecurityHeaders
{
    /** Para la API: no carga nada, porque no lo necesita. */
    private const CSP_API =
        "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'";

    /**
     * Para la aplicación de React. Cada origen está aquí por un motivo
     * concreto; si se añade uno nuevo, que sea con su razón al lado.
     *
     *   style-src  'unsafe-inline'  las animaciones escalonadas y las
     *                                barras del historial llevan su
     *                                valor en el atributo style
     *   fonts.googleapis / gstatic   las tipografías del diseño
     *   wger.de                      las fotos de los ejercicios vienen
     *                                con URL absoluta de su servidor
     *   youtube / google maps        los vídeos de ejercicios y el mapa
     *                                de la portada van en iframe
     */
    private const CSP_WEB = "default-src 'self'; "
        . "script-src 'self'; "
        . "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        . "font-src 'self' https://fonts.gstatic.com data:; "
        . "img-src 'self' data: blob: https://wger.de; "
        . "connect-src 'self'; "
        . "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.google.com; "
        . "object-src 'none'; "
        . "base-uri 'self'; "
        . "form-action 'self'; "
        . "frame-ancestors 'none'";

    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // El navegador respeta el Content-Type declarado y no lo adivina.
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Nadie puede incrustar estas respuestas en un iframe (clickjacking).
        $response->headers->set('X-Frame-Options', 'DENY');

        /*
         * La política depende de qué se está sirviendo.
         *
         * La API solo devuelve JSON y PDF, así que no necesita cargar
         * nada: con default-src 'none' no hay superficie para XSS ni
         * aunque una respuesta acabara interpretándose como HTML.
         *
         * Las rutas web sirven la aplicación de React, que sí necesita
         * su propio JavaScript, sus hojas de estilo y unos pocos
         * orígenes externos. Aplicarle la política de la API dejaría
         * la página en blanco.
         */
        $response->headers->set(
            'Content-Security-Policy',
            $request->is('api/*') ? self::CSP_API : self::CSP_WEB
        );

        // Aísla la respuesta de otros orígenes.
        $response->headers->set('Cross-Origin-Resource-Policy', 'same-site');
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');

        // Bloquea los ficheros de política de Flash/Acrobat heredados.
        $response->headers->set('X-Permitted-Cross-Domain-Policies', 'none');

        // El referrer nunca viaja completo a otro dominio: si alguna URL
        // llevara un identificador, no se filtra al salir del sitio.
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Ninguna pantalla necesita cámara, micrófono ni ubicación.
        $response->headers->set(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=(), interest-cohort=()'
        );

        // X-XSS-Protection se desactiva a propósito: el filtro XSS de los
        // navegadores antiguos llegó a introducir vulnerabilidades propias
        // y hoy la recomendación es apagarlo y confiar en la CSP.
        $response->headers->set('X-XSS-Protection', '0');

        // Las respuestas de la API llevan datos personales: que no queden
        // cacheadas en proxies ni en el disco del navegador.
        if ($request->is('api/*')) {
            $response->headers->set('Cache-Control', 'no-store, private');
        }

        // HSTS solo en producción y solo sobre HTTPS.
        if (config('app.env') === 'production') {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains'
            );
        }

        // El servidor no anuncia con qué está hecho.
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        return $response;
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Obliga a la API a responder siempre en JSON, pase lo que pase.
 *
 * Sin esto, un cliente que no mande `Accept: application/json` recibe
 * la página de error HTML de Laravel en vez de un JSON.
 *
 * Solo se aplica a `api/*`. La aplicación de React se sirve desde las
 * rutas web, y ahí forzar JSON haría que el index.html se negociara
 * como si fuera una respuesta de API.
 */
class ForceJsonResponse
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->is('api/*')) {
            $request->headers->set('Accept', 'application/json');
        }

        return $next($request);
    }
}

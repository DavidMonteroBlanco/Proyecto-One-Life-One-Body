<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

/**
 * Sirve la aplicación de React.
 *
 * En el servidor, el frontend ya construido vive dentro de `public/` y
 * se entrega desde aquí mismo: una sola dirección para todo, sin CORS
 * y sin dos despliegues que mantener sincronizados.
 *
 * Va en un controlador y no en una closure dentro de routes/web.php a
 * propósito: `php artisan route:cache` no sabe serializar closures y
 * falla con «Unable to prepare route for serialization», que en el
 * servidor rompería el despliegue entero.
 */
class SpaController extends Controller
{
    public function __invoke(Request $request)
    {
        $index = public_path('index.html');

        /*
         * En local no existe: el frontend corre aparte con Vite en el
         * puerto 5173. Se responde con una pista en vez de un error
         * cualquiera, que es lo que uno quiere leer si abre el 8000
         * por costumbre y ve algo raro.
         */
        if (! is_readable($index)) {
            return response()->json([
                'message' => 'La API está en pie. El frontend no está construido aquí: '
                           . 'en local se sirve con "npm run dev" en el puerto 5173.',
            ]);
        }

        /*
         * Sin caché: el index.html apunta a los ficheros con el hash en
         * el nombre (assets/index-ABC123.js). Si el navegador se queda
         * con un index.html viejo, pide ficheros que ya no existen y la
         * página sale en blanco después de cada despliegue.
         */
        return response()
            ->file($index, ['Cache-Control' => 'no-cache, must-revalidate']);
    }
}

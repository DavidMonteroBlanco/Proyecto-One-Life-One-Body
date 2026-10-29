<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Comprueba que la configuración crítica está presente antes de servir
 * la API en producción.
 *
 * Dos arreglos respecto a la versión anterior:
 *
 * 1. Lee de config() y no de env(). En cuanto se ejecuta
 *    `php artisan config:cache` —que es lo normal en producción—
 *    env() devuelve null para todo y esta comprobación fallaba
 *    siempre, tirando la API entera con un 500.
 *
 * 2. Comprueba lo que de verdad aplica a cada configuración. Antes
 *    exigía DB_DATABASE incluso con SQLite, donde esa variable no se
 *    usa, y credenciales SMTP aunque el mailer fuese 'log'.
 */
class ValidateEnv
{
    public function handle(Request $request, Closure $next)
    {
        if (config('app.env') !== 'production') {
            return $next($request);
        }

        $problems = [];

        // Sin clave de aplicación no hay cifrado ni firmas válidas.
        if (empty(config('app.key'))) {
            $problems[] = 'APP_KEY';
        }

        /*
         * APP_DEBUG=true en producción filtra rutas del servidor y
         * fragmentos de código en cada error. Es un fallo real y hay que
         * corregirlo, pero se avisa en vez de cortar: tumbar la web entera
         * por esto causaría más daño que el propio problema.
         */
        if (config('app.debug')) {
            Log::warning('APP_DEBUG_ACTIVO_EN_PRODUCCION', [
                'riesgo' => 'Las trazas de error se envían al cliente.',
            ]);
        }

        // Base de datos: cada driver necesita cosas distintas.
        $connection = config('database.default');
        $database = config("database.connections.{$connection}.database");

        if (empty($database)) {
            $problems[] = "database.connections.{$connection}.database";
        } elseif ($connection === 'sqlite' && $database !== ':memory:' && !file_exists($database)) {
            $problems[] = 'el fichero SQLite no existe: ' . basename($database);
        }

        // Correo: solo se exigen credenciales si se envía de verdad.
        $mailer = config('mail.default');
        if (in_array($mailer, ['smtp', 'ses', 'postmark', 'resend'], true)) {
            if ($mailer === 'smtp' && empty(config('mail.mailers.smtp.host'))) {
                $problems[] = 'MAIL_HOST';
            }
            if (empty(config('mail.from.address'))) {
                $problems[] = 'MAIL_FROM_ADDRESS';
            }
        }

        if ($problems !== []) {
            Log::critical('CONFIG_INCOMPLETA', ['problemas' => $problems]);

            return response()->json([
                'message' => 'Error de configuración del servidor.',
            ], 500);
        }

        return $next($request);
    }
}

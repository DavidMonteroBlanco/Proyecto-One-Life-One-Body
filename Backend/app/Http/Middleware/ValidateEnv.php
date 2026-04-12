<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Valida que las variables de entorno críticas existen.
 * Si falta alguna en producción, devuelve error 500.
 */
class ValidateEnv
{
    public function handle(Request $request, Closure $next)
    {
        // Solo validar en producción (en desarrollo puede faltar alguna)
        if (config('app.env') !== 'production') {
            return $next($request);
        }

        $required = [
            'APP_KEY',
            'DB_DATABASE',
            'MAIL_HOST',
            'MAIL_USERNAME',
            'MAIL_PASSWORD',
        ];

        $missing = [];
        foreach ($required as $var) {
            if (empty(env($var))) {
                $missing[] = $var;
            }
        }

        if (!empty($missing)) {
            \Log::critical('MISSING_ENV_VARS', ['vars' => $missing]);
            return response()->json([
                'message' => 'Error de configuración del servidor.',
            ], 500);
        }

        return $next($request);
    }
}
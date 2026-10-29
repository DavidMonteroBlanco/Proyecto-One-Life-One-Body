<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

/**
 * Registro de seguridad.
 *
 * Anota intentos fallidos de autenticación, límites de peticiones
 * superados, validaciones rechazadas y accesos denegados.
 * NUNCA guarda contraseñas, tokens ni datos personales del cliente.
 *
 * Importante: los 401 y los 429 no llegan aquí como respuesta, sino
 * como excepción lanzada por el middleware de autenticación o el de
 * rate limiting, que se renderiza más arriba en la pila. La versión
 * anterior solo miraba el código de la respuesta, así que esos dos
 * casos —justo los que más interesa vigilar— no se registraban nunca.
 */
class LogSecurity
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $response = $next($request);
        } catch (\Throwable $e) {
            if ($status = $this->statusFor($e)) {
                $this->record($status, $request);
            }
            throw $e;
        }

        $this->record($response->getStatusCode(), $request);

        return $response;
    }

    /** Traduce las excepciones que nos interesan a su código HTTP. */
    private function statusFor(\Throwable $e): ?int
    {
        return match (true) {
            $e instanceof AuthenticationException => 401,
            $e instanceof ValidationException     => 422,
            $e instanceof HttpExceptionInterface  => $e->getStatusCode(),
            default => null,
        };
    }

    private function record(int $status, Request $request): void
    {
        $context = [
            'ip'     => $request->ip(),
            'path'   => $request->path(),
            'method' => $request->method(),
        ];

        match ($status) {
            401 => Log::channel('security')->warning('AUTH_FAILED', $context + [
                // Solo el email, para poder detectar fuerza bruta sobre
                // una cuenta concreta. La contraseña jamás se toca.
                'email' => $request->input('email', '***'),
            ]),
            403 => Log::channel('security')->warning('ACCESS_DENIED', $context + [
                'user_id' => $request->user()?->id,
            ]),
            422 => Log::channel('security')->info('VALIDATION_REJECTED', $context),
            429 => Log::channel('security')->warning('RATE_LIMIT_HIT', $context),
            default => null,
        };
    }
}

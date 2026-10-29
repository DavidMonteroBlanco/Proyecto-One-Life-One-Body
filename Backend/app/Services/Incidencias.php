<?php

namespace App\Services;

use App\Models\FailedOperation;
use Illuminate\Support\Facades\Log;

/**
 * ══════════════════════════════════════════════════════════
 * REGISTRO Y REINTENTO DE OPERACIONES FALLIDAS
 *
 * La idea es sencilla: cuando algo que depende del exterior falla
 * —un email que no sale, un PDF que no se genera—, no se pierde ni
 * revienta la pantalla. Se guarda con todo lo necesario para volver
 * a intentarlo y se reintenta solo, con esperas cada vez más largas.
 *
 * Si después de todos los intentos sigue fallando, se queda en el
 * panel de incidencias para que lo vea una persona. Eso es lo que
 * hace que el sistema "se corrija solo" sin tomar decisiones por su
 * cuenta sobre datos de clientes.
 *
 * Lo que este sistema NO hace, a propósito: modificar código. Un
 * programa que se reescribe solo en producción es imposible de
 * auditar y puede romper algo peor que lo que arregla.
 * ══════════════════════════════════════════════════════════
 */
class Incidencias
{
    /**
     * Anota un fallo y programa el primer reintento.
     */
    public function registrar(
        string $operation,
        string $summary,
        array $payload,
        \Throwable $e,
        ?int $userId = null,
        ?int $triggeredBy = null,
    ): FailedOperation {
        $esperas = config('olob.reintentos.esperas', [2, 10, 60, 240]);

        $incidencia = FailedOperation::create([
            'operation'       => $operation,
            'summary'         => $summary,
            'payload'         => $payload,
            'last_error'      => $this->mensajeLimpio($e),
            'attempts'        => 0,
            'next_attempt_at' => now()->addMinutes($esperas[0]),
            'user_id'         => $userId,
            'triggered_by'    => $triggeredBy,
        ]);

        Log::channel('security')->warning('OPERACION_FALLIDA', [
            'id'        => $incidencia->id,
            'operation' => $operation,
            // El mensaje de error puede traer rutas del servidor, pero
            // nunca datos del cliente: el resumen va aparte.
            'error'     => $incidencia->last_error,
        ]);

        return $incidencia;
    }

    /**
     * Apunta que un reintento ha vuelto a fallar y programa el siguiente.
     * Al agotar las esperas, `next_attempt_at` se queda en null: eso es
     * lo que marca una incidencia como "necesita a una persona".
     */
    public function reprogramar(FailedOperation $incidencia, \Throwable $e): void
    {
        $esperas = config('olob.reintentos.esperas', [2, 10, 60, 240]);
        $intentos = $incidencia->attempts + 1;

        // Si quedan esperas por delante se programa la siguiente; si no,
        // null deja la incidencia a la espera de una persona.
        $siguiente = isset($esperas[$intentos])
            ? now()->addMinutes($esperas[$intentos])
            : null;

        $incidencia->update([
            'attempts'        => $intentos,
            'last_error'      => $this->mensajeLimpio($e),
            'next_attempt_at' => $siguiente,
        ]);
    }

    /** La operación ha salido bien: se cierra la incidencia. */
    public function resolver(FailedOperation $incidencia): void
    {
        $incidencia->update([
            'resolved_at'     => now(),
            'next_attempt_at' => null,
        ]);
    }

    /**
     * Recorta el mensaje y le quita la ruta absoluta del proyecto, que
     * no aporta nada en el panel y expone la estructura del servidor.
     */
    private function mensajeLimpio(\Throwable $e): string
    {
        $mensaje = str_replace(base_path(), '', $e->getMessage());

        return mb_substr(trim($mensaje), 0, 500);
    }
}

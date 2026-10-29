<?php

namespace App\Services;

use App\Models\DietPlan;
use App\Models\FailedOperation;
use App\Models\Workout;

/**
 * Vuelve a ejecutar una operación que falló.
 *
 * Es el único sitio que sabe traducir el `operation` guardado en la
 * incidencia a la acción real. Para añadir una operación nueva al
 * sistema de reintentos basta con registrarla aquí.
 */
class ReintentarOperacion
{
    public function __construct(
        private Entregas $entregas,
        private Incidencias $incidencias,
    ) {}

    /** @return array{ok: bool, message: string} */
    public function ejecutar(FailedOperation $incidencia): array
    {
        try {
            $resultado = match ($incidencia->operation) {
                'enviar_dieta'   => $this->dieta($incidencia),
                'enviar_entreno' => $this->entreno($incidencia),
                default => ['ok' => false, 'message' => "Operación desconocida: {$incidencia->operation}"],
            };
        } catch (\Throwable $e) {
            $this->incidencias->reprogramar($incidencia, $e);

            return ['ok' => false, 'message' => 'Ha vuelto a fallar: ' . $e->getMessage()];
        }

        // Al reintentar, Entregas ya reprograma la incidencia si vuelve a
        // fallar, así que aquí solo queda cerrarla cuando sale bien.
        if ($resultado['ok']) {
            $this->incidencias->resolver($incidencia);
        }

        return $resultado;
    }

    private function dieta(FailedOperation $incidencia): array
    {
        $plan = DietPlan::find($incidencia->payload['diet_plan_id'] ?? null);

        if (! $plan) {
            // El plan ya no existe: la incidencia no tiene arreglo posible,
            // así que se cierra en vez de reintentarla para siempre.
            $this->incidencias->resolver($incidencia);

            return ['ok' => true, 'message' => 'El plan ya no existe. Incidencia cerrada.'];
        }

        return $this->entregas->dieta($plan, $incidencia->triggered_by, $incidencia);
    }

    private function entreno(FailedOperation $incidencia): array
    {
        $workout = Workout::find($incidencia->payload['workout_id'] ?? null);

        if (! $workout) {
            $this->incidencias->resolver($incidencia);

            return ['ok' => true, 'message' => 'El entreno ya no existe. Incidencia cerrada.'];
        }

        return $this->entregas->entreno($workout, $incidencia->triggered_by, $incidencia);
    }
}

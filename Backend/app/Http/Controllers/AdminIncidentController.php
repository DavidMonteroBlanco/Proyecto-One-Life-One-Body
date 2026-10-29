<?php

namespace App\Http\Controllers;

use App\Models\FailedOperation;
use App\Services\ReintentarOperacion;
use Illuminate\Http\Request;

/**
 * Panel de incidencias.
 *
 * Aquí aparece lo que ha fallado y el sistema no ha conseguido
 * arreglar solo tras todos los reintentos. David ve qué pasó, sobre
 * qué cliente, y puede volver a lanzarlo con un botón.
 */
class AdminIncidentController extends Controller
{
    public function __construct(
        private ReintentarOperacion $reintentar,
    ) {}

    public function index()
    {
        $incidencias = FailedOperation::with('user:id,name,email')
            ->whereNull('resolved_at')
            ->orderByRaw('next_attempt_at IS NULL DESC')  // primero las agotadas
            ->latest()
            ->limit(100)
            ->get()
            ->map(fn ($i) => [
                'id'              => $i->id,
                'operation'       => $i->operation,
                'summary'         => $i->summary,
                'last_error'      => $i->last_error,
                'attempts'        => $i->attempts,
                'next_attempt_at' => $i->next_attempt_at,
                'agotada'         => $i->agotada,
                'cliente'         => $i->user?->name,
                'created_at'      => $i->created_at,
            ]);

        return response()->json([
            'incidents' => $incidencias,
            'pending'   => $incidencias->where('agotada', false)->count(),
            'exhausted' => $incidencias->where('agotada', true)->count(),
        ]);
    }

    /** Reintento a mano desde el panel. */
    public function retry(FailedOperation $incident)
    {
        $resultado = $this->reintentar->ejecutar($incident);

        return response()->json(
            ['message' => $resultado['message']],
            $resultado['ok'] ? 200 : 502
        );
    }

    /** Descartar: ya se resolvió por otra vía o no procede. */
    public function dismiss(FailedOperation $incident)
    {
        $incident->update(['resolved_at' => now(), 'next_attempt_at' => null]);

        return response()->json(['message' => 'Incidencia descartada.']);
    }
}

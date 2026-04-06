<?php

namespace App\Http\Controllers;

use App\Models\WeightRecord;
use Illuminate\Http\Request;

class WeightRecordController extends Controller
{
    /**
     * Listar todos los pesajes del usuario (ordenados por fecha).
     */
    public function index(Request $request)
    {
        $records = WeightRecord::where('user_id', $request->user()->id)
            ->orderBy('recorded_at', 'desc')
            ->get();

        return response()->json($records);
    }

    /**
     * Registrar un nuevo pesaje.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'weight_kg'   => ['required', 'numeric', 'min:30', 'max:300'],
            'notes'       => ['nullable', 'string', 'max:500'],
            'recorded_at' => ['required', 'date', 'before_or_equal:today'],
        ]);

        // Verificar que no existe ya un pesaje para esa fecha
        $existing = WeightRecord::where('user_id', $user->id)
            ->where('recorded_at', $data['recorded_at'])
            ->first();

        if ($existing) {
            // Si ya existe, actualizarlo
            $existing->update($data);
            return response()->json([
                'message' => 'Pesaje actualizado correctamente.',
                'record'  => $existing,
            ]);
        }

        $record = WeightRecord::create([
            'user_id' => $user->id,
            ...$data,
        ]);

        return response()->json([
            'message' => 'Pesaje registrado correctamente.',
            'record'  => $record,
        ], 201);
    }

    /**
     * Eliminar un pesaje.
     */
    public function destroy(Request $request, WeightRecord $weightRecord)
    {
        if ($weightRecord->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $weightRecord->delete();

        return response()->json(['message' => 'Pesaje eliminado.']);
    }

    /**
     * Estadísticas resumen del usuario.
     */
    public function stats(Request $request)
    {
        $user = $request->user();

        $records = WeightRecord::where('user_id', $user->id)
            ->orderBy('recorded_at', 'asc')
            ->get();

        if ($records->isEmpty()) {
            return response()->json([
                'total_records' => 0,
                'current_weight' => null,
                'start_weight' => null,
                'min_weight' => null,
                'max_weight' => null,
                'total_change' => null,
                'last_week_change' => null,
            ]);
        }

        $current = $records->last();
        $first = $records->first();
        $oneWeekAgo = $records->where('recorded_at', '<=', now()->subDays(7))->last();

        return response()->json([
            'total_records'   => $records->count(),
            'current_weight'  => (float) $current->weight_kg,
            'start_weight'    => (float) $first->weight_kg,
            'min_weight'      => (float) $records->min('weight_kg'),
            'max_weight'      => (float) $records->max('weight_kg'),
            'total_change'    => round((float) $current->weight_kg - (float) $first->weight_kg, 1),
            'last_week_change' => $oneWeekAgo
                ? round((float) $current->weight_kg - (float) $oneWeekAgo->weight_kg, 1)
                : null,
        ]);
    }
}
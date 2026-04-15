<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WeightRecord;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class AdminWeightController extends Controller
{
    public function users()
    {
        // EAGER LOADING — carga las relaciones de una vez, no N+1 queries
        $users = User::where('role', 'user')
            ->with(['weightRecords' => fn($q) => $q->orderBy('recorded_at', 'desc')])
            ->withCount('weightRecords')
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                $lastRecord = $user->weightRecords->first();

                return [
                    'id'             => $user->id,
                    'name'           => $user->name,
                    'email'          => $user->email,
                    'phone'          => $user->phone,
                    'created_at'     => $user->created_at,
                    'total_records'  => $user->weight_records_count,
                    'last_weight'    => $lastRecord ? (float) $lastRecord->weight_kg : null,
                    'last_fat'       => $lastRecord ? $lastRecord->fat_percentage : null,
                    'last_muscle'    => $lastRecord ? $lastRecord->muscle_percentage : null,
                    'last_record_at' => $lastRecord ? $lastRecord->recorded_at->format('Y-m-d') : null,
                ];
            });

        return response()->json($users);
    }

    public function records(User $user)
    {
        $records = WeightRecord::where('user_id', $user->id)
            ->orderBy('recorded_at', 'desc')
            ->get();

        return response()->json([
            'user'    => $user->only(['id', 'name', 'email', 'phone']),
            'records' => $records,
        ]);
    }

    public function stats(User $user)
    {
        $records = WeightRecord::where('user_id', $user->id)
            ->orderBy('recorded_at', 'asc')
            ->get();

        if ($records->isEmpty()) {
            return response()->json([
                'total_records'    => 0,
                'current_weight'   => null,
                'start_weight'     => null,
                'total_change'     => null,
                'last_week_change' => null,
                'current_fat'      => null,
                'current_muscle'   => null,
            ]);
        }

        $current = $records->last();
        $first = $records->first();
        $oneWeekAgo = $records->where('recorded_at', '<=', now()->subDays(7))->last();

        return response()->json([
            'total_records'    => $records->count(),
            'current_weight'   => (float) $current->weight_kg,
            'start_weight'     => (float) $first->weight_kg,
            'total_change'     => round((float) $current->weight_kg - (float) $first->weight_kg, 1),
            'last_week_change' => $oneWeekAgo
                ? round((float) $current->weight_kg - (float) $oneWeekAgo->weight_kg, 1)
                : null,
            'current_fat'      => $current->fat_percentage ? (float) $current->fat_percentage : null,
            'current_muscle'   => $current->muscle_percentage ? (float) $current->muscle_percentage : null,
        ]);
    }

    public function store(Request $request, User $user)
    {
        $data = $request->validate([
            'weight_kg'         => ['required', 'numeric', 'min:30', 'max:300'],
            'fat_percentage'    => ['nullable', 'numeric', 'min:1', 'max:60'],
            'muscle_percentage' => ['nullable', 'numeric', 'min:10', 'max:100'],
            'notes'             => ['nullable', 'string', 'max:500'],
            'recorded_at'       => ['required', 'date', 'before_or_equal:today'],
        ]);

        $existing = WeightRecord::where('user_id', $user->id)
            ->where('recorded_at', $data['recorded_at'])
            ->first();

        if ($existing) {
            $existing->update($data);
            return response()->json(['message' => 'Pesaje actualizado.', 'record' => $existing]);
        }

        $record = WeightRecord::create(['user_id' => $user->id, ...$data]);
        return response()->json(['message' => 'Pesaje registrado.', 'record' => $record], 201);
    }

    public function update(Request $request, WeightRecord $weightRecord)
    {
        $data = $request->validate([
            'weight_kg'         => ['required', 'numeric', 'min:30', 'max:300'],
            'fat_percentage'    => ['nullable', 'numeric', 'min:1', 'max:60'],
            'muscle_percentage' => ['nullable', 'numeric', 'min:10', 'max:100'],
            'notes'             => ['nullable', 'string', 'max:500'],
            'recorded_at'       => ['required', 'date', 'before_or_equal:today'],
        ]);

        $weightRecord->update($data);
        return response()->json(['message' => 'Pesaje actualizado.', 'record' => $weightRecord]);
    }

    public function destroy(WeightRecord $weightRecord)
    {
        $weightRecord->delete();
        return response()->json(['message' => 'Pesaje eliminado.']);
    }

    /**
     * Generar PDF con el informe de pesajes de un usuario.
     * Acepta auth por Bearer token o por query param ?token= (para descarga directa del navegador).
     */
    public function exportPdf(Request $request, User $user)
    {
        // Autenticar por query param ?token= (necesario porque se abre en nueva pestaña)
        $authenticated = false;

        // Intentar auth por Bearer (si viene del middleware)
        if ($request->user() && $request->user()->role === 'admin') {
            $authenticated = true;
        }

        // Intentar auth por query param
        if (!$authenticated && $request->has('token')) {
            $token = \Laravel\Sanctum\PersonalAccessToken::findToken($request->query('token'));
            if ($token && $token->tokenable && $token->tokenable->role === 'admin') {
                $authenticated = true;
            }
        }

        if (!$authenticated) {
            return response()->json(['message' => 'No autorizado'], 401);
        }

        $records = WeightRecord::where('user_id', $user->id)
            ->orderBy('recorded_at', 'desc')
            ->get();

        $pdf = Pdf::loadView('pdf.weight-report', [
            'user'        => $user,
            'records'     => $records,
            'generatedAt' => now()->format('d/m/Y H:i'),
        ]);

        $filename = 'informe-pesajes-' . str_replace(' ', '-', strtolower($user->name)) . '.pdf';

        return $pdf->download($filename);
    }
}
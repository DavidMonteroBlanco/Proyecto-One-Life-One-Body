<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WeightRecord;
use Illuminate\Http\Request;

class AdminWeightController extends Controller
{
    public function users()
    {
        $users = User::where('role', 'user')
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                $lastRecord = WeightRecord::where('user_id', $user->id)
                    ->orderBy('recorded_at', 'desc')
                    ->first();

                $totalRecords = WeightRecord::where('user_id', $user->id)->count();

                return [
                    'id'             => $user->id,
                    'name'           => $user->name,
                    'email'          => $user->email,
                    'phone'          => $user->phone,
                    'created_at'     => $user->created_at,
                    'total_records'  => $totalRecords,
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
}
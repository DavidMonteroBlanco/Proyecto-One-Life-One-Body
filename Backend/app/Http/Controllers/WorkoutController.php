<?php

namespace App\Http\Controllers;

use App\Models\Workout;
use Illuminate\Http\Request;

class WorkoutController extends Controller
{
    public function index(Request $request)
    {
        // Solo los del usuario logueado, con sus ejercicios: sin ellos
        // el cliente vería el título del entreno pero no las series ni
        // los pesos, que es justo lo que viene a consultar.
        $workouts = Workout::where('user_id', $request->user()->id)
            ->with('exercises')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($workouts);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'goal' => ['nullable', 'string', 'max:100'],
            'duration_minutes' => ['required', 'integer', 'min:10', 'max:300'],
            'level' => ['required', 'in:beginner,intermediate,advanced'],
            'notes' => ['nullable', 'string'],
        ]);

        $workout = Workout::create([
            'user_id' => $request->user()->id,
            ...$data,
        ]);

        return response()->json($workout, 201);
    }

    public function update(Request $request, Workout $workout)
    {
        if ($workout->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:100'],
            'goal' => ['nullable', 'string', 'max:100'],
            'duration_minutes' => ['required', 'integer', 'min:10', 'max:300'],
            'level' => ['required', 'in:beginner,intermediate,advanced'],
            'notes' => ['nullable', 'string'],
        ]);

        $workout->update($data);

        return response()->json($workout);
    }

    public function destroy(Request $request, Workout $workout)
    {
        if ($workout->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $workout->delete();

        return response()->json(['message' => 'Eliminado']);
    }
}

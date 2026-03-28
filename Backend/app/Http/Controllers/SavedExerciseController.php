<?php

namespace App\Http\Controllers;

use App\Models\SavedExercise;
use Illuminate\Http\Request;

class SavedExerciseController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return SavedExercise::where('user_id', $user->id)
            ->orderByDesc('id')
            ->get();
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'source' => ['required', 'string', 'max:30'],
            'external_id' => ['required', 'integer', 'min:1'],
            'name' => ['required', 'string', 'max:180'],
            'description' => ['nullable', 'string'],
        ]);

        $exists = SavedExercise::where('user_id', $user->id)
            ->where('source', $data['source'])
            ->where('external_id', $data['external_id'])
            ->first();

        if ($exists) {
            return response()->json($exists, 200);
        }

        $saved = SavedExercise::create([
            'user_id' => $user->id,
            'source' => $data['source'],
            'external_id' => $data['external_id'],
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
        ]);

        return response()->json($saved, 201);
    }

    public function destroy(Request $request, SavedExercise $savedExercise)
    {
        $user = $request->user();

        if ($savedExercise->user_id !== $user->id) {
            return response()->json(['message' => 'No permitido'], 403);
        }

        $savedExercise->delete();
        return response()->json(['ok' => true]);
    }
}

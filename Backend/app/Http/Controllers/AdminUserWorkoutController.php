<?php

namespace App\Http\Controllers;

use App\Mail\WorkoutAssignedMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AdminUserWorkoutController extends Controller
{
    public function store(Request $request, User $user)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'min:2', 'max:100'],
            'goal' => ['nullable', 'string', 'max:100'],
            'duration_minutes' => ['required', 'integer', 'min:10', 'max:300'],
            'level' => ['required', 'in:beginner,intermediate,advanced'],
            'notes' => ['nullable', 'string'],
        ]);

        $workout = $user->workouts()->create($data);

        Mail::to($user->email)->send(new WorkoutAssignedMail($user, $workout));

        return response()->json([
            'ok' => true,
            'message' => 'Entreno asignado y email enviado',
            'workout' => $workout,
        ], 201);
    }
}

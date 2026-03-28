<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class AdminReportController extends Controller
{
    public function workoutsPdf(Request $request)
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $user = User::with(['workouts' => function ($q) {
            $q->orderBy('created_at', 'desc');
        }])->findOrFail($request->user_id);

        $pdf = Pdf::loadView('pdf.workouts', [
            'user' => $user,
            'workouts' => $user->workouts,
            'generatedAt' => now(),
        ]);

        return $pdf->download('rutina_user_' . $user->id . '.pdf');
    }
}

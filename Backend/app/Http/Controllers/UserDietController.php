<?php

namespace App\Http\Controllers;

use App\Models\DietPlan;
use Illuminate\Http\Request;

class UserDietController extends Controller
{
    /**
     * Ver la dieta activa del usuario autenticado.
     */
    public function myDiet(Request $request)
    {
        $plan = DietPlan::where('user_id', $request->user()->id)
            ->where('active', true)
            ->with('meals')
            ->first();

        if (!$plan) {
            return response()->json([
                'plan' => null,
                'message' => 'No tienes ninguna dieta asignada.',
            ]);
        }

        return response()->json(['plan' => $plan]);
    }
}
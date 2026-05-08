<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\DietPlan;
use App\Models\DietMeal;
use Illuminate\Http\Request;

class AdminDietController extends Controller
{
    /**
     * Listar usuarios con su dieta activa (eager loading).
     */
    public function users()
    {
        $users = User::where('role', 'user')
            ->with(['dietPlans' => fn($q) => $q->where('active', true)->with('meals')])
            ->orderBy('name')
            ->get()
            ->map(fn($u) => [
                'id'        => $u->id,
                'name'      => $u->name,
                'email'     => $u->email,
                'has_diet'  => $u->dietPlans->isNotEmpty(),
                'diet_title'=> $u->dietPlans->first()?->title,
            ]);

        return response()->json($users);
    }

    /**
     * Ver dietas de un usuario.
     */
    public function index(User $user)
    {
        $plans = DietPlan::where('user_id', $user->id)
            ->with('meals')
            ->orderByDesc('active')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'user'  => $user->only(['id', 'name', 'email']),
            'plans' => $plans,
        ]);
    }

    /**
     * Crear un plan de dieta para un usuario.
     */
    public function storePlan(Request $request, User $user)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'meals' => ['required', 'array', 'min:1'],
            'meals.*.meal_type' => ['required', 'in:desayuno,media_manana,comida,merienda,cena,pre_entreno,post_entreno'],
            'meals.*.foods'     => ['required', 'string', 'max:2000'],
            'meals.*.calories'  => ['nullable', 'string', 'max:50'],
            'meals.*.macros'    => ['nullable', 'string', 'max:50'],
        ]);

        // Desactivar dietas anteriores
        DietPlan::where('user_id', $user->id)->update(['active' => false]);

        $plan = DietPlan::create([
            'user_id' => $user->id,
            'title'   => $data['title'],
            'notes'   => $data['notes'] ?? null,
            'active'  => true,
        ]);

        foreach ($data['meals'] as $i => $meal) {
            DietMeal::create([
                'diet_plan_id' => $plan->id,
                'meal_type'    => $meal['meal_type'],
                'foods'        => $meal['foods'],
                'calories'     => $meal['calories'] ?? null,
                'macros'       => $meal['macros'] ?? null,
                'sort_order'   => $i,
            ]);
        }

        return response()->json([
            'message' => 'Dieta creada.',
            'plan'    => $plan->load('meals'),
        ], 201);
    }

    /**
     * Actualizar un plan de dieta.
     */
    public function updatePlan(Request $request, DietPlan $dietPlan)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'meals' => ['required', 'array', 'min:1'],
            'meals.*.meal_type' => ['required', 'in:desayuno,media_manana,comida,merienda,cena,pre_entreno,post_entreno'],
            'meals.*.foods'     => ['required', 'string', 'max:2000'],
            'meals.*.calories'  => ['nullable', 'string', 'max:50'],
            'meals.*.macros'    => ['nullable', 'string', 'max:50'],
        ]);

        $dietPlan->update([
            'title' => $data['title'],
            'notes' => $data['notes'] ?? null,
        ]);

        // Reemplazar comidas
        $dietPlan->meals()->delete();
        foreach ($data['meals'] as $i => $meal) {
            DietMeal::create([
                'diet_plan_id' => $dietPlan->id,
                'meal_type'    => $meal['meal_type'],
                'foods'        => $meal['foods'],
                'calories'     => $meal['calories'] ?? null,
                'macros'       => $meal['macros'] ?? null,
                'sort_order'   => $i,
            ]);
        }

        return response()->json([
            'message' => 'Dieta actualizada.',
            'plan'    => $dietPlan->load('meals'),
        ]);
    }

    /**
     * Eliminar un plan de dieta.
     */
    public function destroyPlan(DietPlan $dietPlan)
    {
        $dietPlan->delete();
        return response()->json(['message' => 'Dieta eliminada.']);
    }

    /**
     * Activar/desactivar un plan.
     */
    public function toggleActive(DietPlan $dietPlan)
    {
        // Si se activa, desactivar las demás del mismo usuario
        if (!$dietPlan->active) {
            DietPlan::where('user_id', $dietPlan->user_id)->update(['active' => false]);
        }

        $dietPlan->update(['active' => !$dietPlan->active]);

        return response()->json([
            'message' => $dietPlan->active ? 'Dieta activada.' : 'Dieta desactivada.',
            'active'  => $dietPlan->active,
        ]);
    }
}
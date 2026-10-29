<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Workout;
use App\Services\Entregas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Entrenos desde el panel del entrenador.
 *
 * Un entreno se guarda con sus ejercicios de una vez: David rellena la
 * tabla entera y da a guardar, en lugar de crear la cabecera y luego ir
 * añadiendo ejercicios uno a uno.
 *
 * El envío al cliente es un paso aparte y manual, igual que en dietas:
 * se guarda, se revisa y luego se manda.
 */
class AdminWorkoutController extends Controller
{
    public function __construct(
        private Entregas $entregas,
    ) {}

    /** Clientes con el número de entrenos que tienen. */
    public function users()
    {
        return response()->json(
            User::where('role', 'user')
                ->withCount('workouts')
                ->with(['workouts' => fn ($q) => $q->latest()->limit(1)])
                ->orderBy('name')
                ->get()
                ->map(fn ($u) => [
                    'id'             => $u->id,
                    'name'           => $u->name,
                    'email'          => $u->email,
                    'workouts_count' => $u->workouts_count,
                    'last_title'     => $u->workouts->first()?->title,
                ])
        );
    }

    /** Entrenos de un cliente, con sus ejercicios. */
    public function index(User $user)
    {
        return response()->json([
            'user'     => $user->only(['id', 'name', 'email']),
            'workouts' => Workout::where('user_id', $user->id)
                ->with('exercises')
                ->latest()
                ->get(),
        ]);
    }

    public function store(Request $request, User $user)
    {
        $data = $this->validar($request);

        $workout = DB::transaction(function () use ($user, $data) {
            $workout = Workout::create([
                'user_id'          => $user->id,
                'title'            => $data['title'],
                'goal'             => $data['goal'] ?? null,
                'duration_minutes' => $data['duration_minutes'],
                'level'            => $data['level'],
                'notes'            => $data['notes'] ?? null,
            ]);

            $this->guardarEjercicios($workout, $data['exercises'] ?? []);

            return $workout;
        });

        return response()->json([
            'message' => 'Entreno creado.',
            'workout' => $workout->load('exercises'),
        ], 201);
    }

    public function update(Request $request, Workout $workout)
    {
        $data = $this->validar($request);

        DB::transaction(function () use ($workout, $data) {
            $workout->update([
                'title'            => $data['title'],
                'goal'             => $data['goal'] ?? null,
                'duration_minutes' => $data['duration_minutes'],
                'level'            => $data['level'],
                'notes'            => $data['notes'] ?? null,
            ]);

            // Se reemplazan en bloque: es más simple y más predecible que
            // casar cuáles se han añadido, movido o borrado en el formulario.
            $workout->exercises()->delete();
            $this->guardarEjercicios($workout, $data['exercises'] ?? []);
        });

        return response()->json([
            'message' => 'Entreno actualizado.',
            'workout' => $workout->fresh()->load('exercises'),
        ]);
    }

    public function destroy(Workout $workout)
    {
        $workout->delete();

        return response()->json(['message' => 'Entreno eliminado.']);
    }

    /**
     * Duplicar. En la práctica David repite el mismo entreno con pequeños
     * cambios semana a semana, y rehacerlo entero cada vez es el trabajo
     * más tedioso del panel.
     */
    public function duplicate(Workout $workout)
    {
        $copia = DB::transaction(function () use ($workout) {
            $copia = Workout::create([
                'user_id'          => $workout->user_id,
                'title'            => $workout->title . ' (copia)',
                'goal'             => $workout->goal,
                'duration_minutes' => $workout->duration_minutes,
                'level'            => $workout->level,
                'notes'            => $workout->notes,
            ]);

            foreach ($workout->exercises as $ex) {
                $copia->exercises()->create($ex->only([
                    'name', 'sets', 'reps', 'weight', 'rest_seconds', 'notes', 'wger_id', 'sort_order',
                ]));
            }

            return $copia;
        });

        return response()->json([
            'message' => 'Entreno duplicado.',
            'workout' => $copia->load('exercises'),
        ], 201);
    }

    /** Envía el entreno al cliente: email + aviso en la web. */
    public function send(Request $request, Workout $workout)
    {
        $resultado = $this->entregas->entreno($workout, $request->user()?->id);

        return response()->json(
            ['message' => $resultado['message'], 'sent_at' => $workout->fresh()->sent_at],
            $resultado['ok'] ? 200 : 502
        );
    }

    public function exportPdf(Workout $workout)
    {
        [$pdf, $nombre] = $this->entregas->pdfEntreno($workout);

        return $pdf->download($nombre);
    }

    /* ══════════════════════════════════════════════════════ */

    private function validar(Request $request): array
    {
        return $request->validate([
            'title'            => ['required', 'string', 'min:2', 'max:100'],
            'goal'             => ['nullable', 'string', 'max:100'],
            'duration_minutes' => ['required', 'integer', 'min:10', 'max:300'],
            'level'            => ['required', 'in:beginner,intermediate,advanced'],
            'notes'            => ['nullable', 'string', 'max:2000'],

            'exercises'                 => ['nullable', 'array', 'max:30'],
            'exercises.*.name'          => ['required', 'string', 'max:120'],
            'exercises.*.sets'          => ['required', 'integer', 'min:1', 'max:20'],
            'exercises.*.reps'          => ['required', 'string', 'max:30'],
            'exercises.*.weight'        => ['nullable', 'string', 'max:30'],
            'exercises.*.rest_seconds'  => ['required', 'integer', 'min:0', 'max:600'],
            'exercises.*.notes'         => ['nullable', 'string', 'max:300'],
            'exercises.*.wger_id'       => ['nullable', 'integer'],
        ]);
    }

    private function guardarEjercicios(Workout $workout, array $ejercicios): void
    {
        foreach (array_values($ejercicios) as $i => $ex) {
            $workout->exercises()->create([
                'name'         => $ex['name'],
                'sets'         => $ex['sets'],
                'reps'         => $ex['reps'],
                'weight'       => $ex['weight'] ?? null,
                'rest_seconds' => $ex['rest_seconds'],
                'notes'        => $ex['notes'] ?? null,
                'wger_id'      => $ex['wger_id'] ?? null,
                'sort_order'   => $i,
            ]);
        }
    }
}

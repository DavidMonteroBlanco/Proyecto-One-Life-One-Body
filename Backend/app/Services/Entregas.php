<?php

namespace App\Services;

use App\Mail\DietPlanMail;
use App\Mail\WorkoutAssignedMail;
use App\Models\DietPlan;
use App\Models\Notification;
use App\Models\User;
use App\Models\Workout;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;

/**
 * ══════════════════════════════════════════════════════════
 * ENTREGAS AL CLIENTE
 *
 * Un único sitio por el que pasa todo lo que se le manda a un
 * cliente. Cada entrega hace siempre las mismas cuatro cosas:
 *
 *   1. Genera el PDF con la imagen de One Life One Body
 *   2. Lo envía por email al cliente
 *   3. Crea un aviso dentro de la web
 *   4. Manda copia al gimnasio, si hay dirección configurada
 *
 * El aviso en la web es importante: el email puede acabar en
 * spam o perderse, y así el cliente lo ve igual al entrar.
 *
 * Si el email falla, la entrega NO se da por perdida: queda
 * registrada como incidencia y se reintenta sola. El aviso en la
 * web se crea igualmente, porque no depende del correo.
 * ══════════════════════════════════════════════════════════
 */
class Entregas
{
    public function __construct(
        private Incidencias $incidencias,
    ) {}

    /* ══════════════════════════════════════════════════════
       DIETA
       ══════════════════════════════════════════════════════ */

    /**
     * @param  \App\Models\FailedOperation|null  $reintentoDe
     *         Si viene, es que estamos reintentando esa incidencia: hay
     *         que actualizarla en vez de crear otra, o acabaríamos con
     *         una incidencia nueva por cada intento.
     */
    public function dieta(DietPlan $plan, ?int $lanzadaPor = null, $reintentoDe = null): array
    {
        $cliente = User::find($plan->user_id);

        if (! $cliente) {
            return ['ok' => false, 'message' => 'El cliente de este plan ya no existe.'];
        }

        [$pdf, $nombreFichero] = $this->pdfDieta($plan, $cliente);

        // El aviso en la web se crea antes de intentar el email: no
        // depende de que el correo salga.
        $this->avisar(
            $cliente,
            'diet_plan',
            'Tienes un plan de alimentación nuevo',
            $plan->title,
            '/my-diet',
        );

        if (! $cliente->email) {
            return ['ok' => true, 'message' => 'Aviso publicado en la web. El cliente no tiene email registrado.'];
        }

        try {
            Mail::to($cliente->email)->send(new DietPlanMail(
                userName: $cliente->name,
                planTitle: $plan->title,
                pdfContents: $pdf->output(),
                pdfFilename: $nombreFichero,
            ));

            $this->copiaAlGym($cliente, 'plan de alimentación', $plan->title);
        } catch (\Throwable $e) {
            $this->anotarFallo(
                $reintentoDe,
                'enviar_dieta',
                "Plan «{$plan->title}» para {$cliente->name}",
                ['diet_plan_id' => $plan->id],
                $e,
                $cliente->id,
                $lanzadaPor,
            );

            return [
                'ok' => false,
                'message' => 'El cliente ya lo ve en la web, pero el email no ha salido. '
                           . 'Se reintentará solo y aparece en Incidencias.',
            ];
        }

        $plan->forceFill(['sent_at' => now()])->save();

        return ['ok' => true, 'message' => 'Plan enviado a ' . $cliente->email];
    }

    /* ══════════════════════════════════════════════════════
       ENTRENO
       ══════════════════════════════════════════════════════ */

    public function entreno(Workout $workout, ?int $lanzadaPor = null, $reintentoDe = null): array
    {
        $cliente = User::find($workout->user_id);

        if (! $cliente) {
            return ['ok' => false, 'message' => 'El cliente de este entreno ya no existe.'];
        }

        $this->avisar(
            $cliente,
            'workout',
            'Tienes un entreno nuevo',
            $workout->title,
            '/my-workouts',
        );

        if (! $cliente->email) {
            return ['ok' => true, 'message' => 'Aviso publicado en la web. El cliente no tiene email registrado.'];
        }

        try {
            [$pdf, $nombreFichero] = $this->pdfEntreno($workout, $cliente);

            Mail::to($cliente->email)->send(new WorkoutAssignedMail(
                user: $cliente,
                workout: $workout,
                pdfContents: $pdf->output(),
                pdfFilename: $nombreFichero,
            ));

            $this->copiaAlGym($cliente, 'entreno', $workout->title);
        } catch (\Throwable $e) {
            $this->anotarFallo(
                $reintentoDe,
                'enviar_entreno',
                "Entreno «{$workout->title}» para {$cliente->name}",
                ['workout_id' => $workout->id],
                $e,
                $cliente->id,
                $lanzadaPor,
            );

            return [
                'ok' => false,
                'message' => 'El cliente ya lo ve en la web, pero el email no ha salido. '
                           . 'Se reintentará solo y aparece en Incidencias.',
            ];
        }

        $workout->forceFill(['sent_at' => now()])->save();

        return ['ok' => true, 'message' => 'Entreno enviado a ' . $cliente->email];
    }

    /* ══════════════════════════════════════════════════════
       PDF
       ══════════════════════════════════════════════════════ */

    /** @return array{0: \Barryvdh\DomPDF\PDF, 1: string} */
    public function pdfDieta(DietPlan $plan, ?User $cliente = null): array
    {
        $plan->load('meals');
        $cliente ??= User::find($plan->user_id);

        $pdf = Pdf::loadView('pdf.diet-plan', [
            'plan'        => $plan,
            'user'        => $cliente,
            'mealLabels'  => $this->etiquetasComidas(),
            'generatedAt' => now()->format('d/m/Y'),
            'logo'        => $this->logoEnBase64(),
            'centro'      => config('olob'),
        ]);

        return [$pdf, 'plan-alimentacion-' . $this->slug($cliente?->name) . '.pdf'];
    }

    /** @return array{0: \Barryvdh\DomPDF\PDF, 1: string} */
    public function pdfEntreno(Workout $workout, ?User $cliente = null): array
    {
        $workout->load('exercises');
        $cliente ??= User::find($workout->user_id);

        $pdf = Pdf::loadView('pdf.workout-plan', [
            'workout'     => $workout,
            'user'        => $cliente,
            'generatedAt' => now()->format('d/m/Y'),
            'logo'        => $this->logoEnBase64(),
            'centro'      => config('olob'),
        ]);

        return [$pdf, 'entreno-' . $this->slug($cliente?->name) . '.pdf'];
    }

    /* ══════════════════════════════════════════════════════
       INTERNOS
       ══════════════════════════════════════════════════════ */

    /**
     * Anota el fallo. Si venimos de un reintento se actualiza esa misma
     * incidencia; si es la primera vez, se crea una nueva. Sin esta
     * distinción cada reintento dejaría una incidencia más en el panel.
     */
    private function anotarFallo(
        $reintentoDe,
        string $operacion,
        string $resumen,
        array $payload,
        \Throwable $e,
        ?int $clienteId,
        ?int $lanzadaPor,
    ): void {
        if ($reintentoDe) {
            $this->incidencias->reprogramar($reintentoDe, $e);

            return;
        }

        $this->incidencias->registrar(
            operation: $operacion,
            summary: $resumen,
            payload: $payload,
            e: $e,
            userId: $clienteId,
            triggeredBy: $lanzadaPor,
        );
    }

    private function avisar(User $cliente, string $tipo, string $titulo, ?string $cuerpo, string $enlace): void
    {
        Notification::create([
            'user_id' => $cliente->id,
            'type'    => $tipo,
            'title'   => $titulo,
            'body'    => $cuerpo,
            'link'    => $enlace,
        ]);
    }

    /**
     * Copia al gimnasio de lo que se ha mandado, para tener constancia.
     * Si falla no se considera incidencia: es informativo y no debe
     * ensuciar el panel ni preocupar a nadie.
     */
    private function copiaAlGym(User $cliente, string $que, string $titulo): void
    {
        $destino = config('olob.copia');
        if (! $destino) {
            return;
        }

        try {
            Mail::raw(
                "Se ha enviado un {$que} a {$cliente->name} ({$cliente->email}).\n\n"
                . "Título: {$titulo}\n"
                . 'Fecha: ' . now()->format('d/m/Y H:i') . "\n\n"
                . '— Aviso automático de ' . config('olob.nombre'),
                fn ($m) => $m->to($destino)->subject("Enviado un {$que} a {$cliente->name}")
            );
        } catch (\Throwable) {
            // Silencio a propósito: la entrega al cliente ya salió bien.
        }
    }

    private function etiquetasComidas(): array
    {
        return [
            'desayuno'     => 'Desayuno',
            'media_manana' => 'Media mañana',
            'comida'       => 'Comida',
            'merienda'     => 'Merienda',
            'pre_entreno'  => 'Pre-entreno',
            'post_entreno' => 'Post-entreno',
            'cena'         => 'Cena',
        ];
    }

    /**
     * Ruta del logo para el PDF.
     *
     * Se le pasa la RUTA del fichero y no un data URI a propósito: con
     * base64 dompdf decodifica el JPEG y lo vuelve a embeber sin
     * comprimir, y el PDF se iba al megabyte. Con la ruta reutiliza el
     * JPEG original tal cual.
     *
     * Si el fichero no estuviera, se devuelve null y el documento sale
     * con el nombre en texto en vez de reventar.
     */
    private function logoEnBase64(): ?string
    {
        $ruta = public_path('img/logo-olob.jpg');

        return is_readable($ruta) ? $ruta : null;
    }

    private function slug(?string $nombre): string
    {
        $slug = preg_replace('/[^a-z0-9]+/', '-', strtolower($nombre ?? 'cliente'));

        return trim($slug, '-') ?: 'cliente';
    }
}

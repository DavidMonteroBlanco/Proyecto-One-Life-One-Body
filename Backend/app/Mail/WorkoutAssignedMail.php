<?php

namespace App\Mail;

use App\Models\User;
use App\Models\Workout;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Entreno asignado a un cliente.
 *
 * Esta clase faltaba: la vista `emails/workout_assigned` existía y
 * `AdminUserWorkoutController` la invocaba, pero el Mailable no estaba
 * creado, así que asignar un entreno reventaba con "Class not found".
 *
 * El PDF se adjunta solo si se le pasa ya renderizado, para no obligar
 * a generarlo cuando no hace falta.
 */
class WorkoutAssignedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Workout $workout,
        public ?string $pdfContents = null,
        public ?string $pdfFilename = null,
    ) {
        // La vista recorre los ejercicios: se cargan por si vienen sin ellos.
        $this->workout->loadMissing('exercises');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Tu entreno — ' . config('olob.nombre'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.workout_assigned',
            with: [
                'user'    => $this->user,
                'workout' => $this->workout,
            ],
        );
    }

    public function attachments(): array
    {
        if (! $this->pdfContents) {
            return [];
        }

        return [
            Attachment::fromData(fn () => $this->pdfContents, $this->pdfFilename ?? 'entreno.pdf')
                ->withMime('application/pdf'),
        ];
    }
}

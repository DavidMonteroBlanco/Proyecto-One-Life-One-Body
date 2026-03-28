<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class WorkoutAssignedMail extends Mailable
{
    public function __construct(public $user, public $workout) {}

    public function build()
    {
        return $this->subject('Nueva rutina asignada')
            ->view('emails.workout_assigned');
    }
}

<?php

namespace App\Mail;

use App\Models\User;
use App\Models\WeightRecord;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WeeklyReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public ?WeightRecord $lastRecord;

    public function __construct(User $user)
    {
        $this->user = $user;
        $this->lastRecord = WeightRecord::where('user_id', $user->id)
            ->orderBy('recorded_at', 'desc')
            ->first();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '⚖ ' . $this->user->name . ', es hora de pesarte — One Life One Body',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.weekly-reminder',
        );
    }
}
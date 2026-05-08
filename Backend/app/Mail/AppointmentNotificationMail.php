<?php

namespace App\Mail;

use App\Models\User;
use App\Models\WeighingAppointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AppointmentNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public WeighingAppointment $appointment;
    public User $client;

    public function __construct(WeighingAppointment $appointment, User $client)
    {
        $this->appointment = $appointment;
        $this->client = $client;
    }

    public function envelope(): Envelope
    {
        $date = $this->appointment->appointment_date->format('d/m/Y');
        $time = substr($this->appointment->appointment_time, 0, 5);

        return new Envelope(
            subject: "📅 Nueva reserva de pesaje — {$this->client->name} · {$date} a las {$time}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.appointment-notification',
        );
    }
}
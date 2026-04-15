<?php

namespace App\Jobs;

use App\Models\User;
use App\Mail\WeeklyReminderMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

/**
 * Job programado: envía un email semanal a todos los usuarios
 * recordándoles que se pesen y registren su progreso.
 */
class WeeklyReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct() {}

    public function handle(): void
    {
        $users = User::where('role', 'user')->get();

        $count = 0;
        foreach ($users as $user) {
            try {
                Mail::to($user->email)->send(new WeeklyReminderMail($user));
                $count++;
            } catch (\Exception $e) {
                Log::channel('security')->warning('WEEKLY_REMINDER_FAIL', [
                    'user_id' => $user->id,
                    'email'   => $user->email,
                    'error'   => $e->getMessage(),
                ]);
            }
        }

        Log::info("WeeklyReminderJob: enviados {$count} recordatorios a {$users->count()} usuarios.");
    }
}
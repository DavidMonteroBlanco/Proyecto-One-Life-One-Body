<?php
namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Tareas programadas (Jobs/Schedule).
     * Se ejecutan automáticamente con: php artisan schedule:run
     */
    protected function schedule(Schedule $schedule): void
    {
        // Recordatorio semanal de pesaje — cada lunes a las 9:00
        $schedule->job(new \App\Jobs\WeeklyReminderJob)
            ->weeklyOn(1, '09:00')   // 1 = lunes
            ->timezone('Europe/Madrid')
            ->withoutOverlapping()
            ->onOneServer();
    }

    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');
    }
}
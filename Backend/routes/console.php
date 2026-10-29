<?php

use App\Jobs\WeeklyReminderJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Tareas programadas
|--------------------------------------------------------------------------
|
| Para que esto corra en el servidor hace falta UNA línea de cron:
|
|   * * * * * cd /ruta/al/proyecto && php artisan schedule:run >> /dev/null 2>&1
|
| Sin ella nada de esto se ejecuta. El panel sigue funcionando, pero los
| reintentos automáticos y los recordatorios quedan parados.
|
*/

/*
 * Recordatorio semanal de pesaje.
 *
 * OJO: esto estaba puesto a `everyMinute()`. Siendo un recordatorio
 * SEMANAL, con el cron activo cada cliente habría recibido un email
 * cada sesenta segundos. Lunes a las 9:00, que es cuando tiene sentido
 * recordar el pesaje de la semana.
 */
Schedule::job(new WeeklyReminderJob)
    ->weeklyOn(1, '09:00')
    ->withoutOverlapping();

/*
 * Reintento de lo que falló (emails que no salieron, PDF que no se
 * generaron). Cada cinco minutos; las esperas reales de cada operación
 * las decide config/olob.php.
 */
Schedule::command('olob:reintentar')
    ->everyFiveMinutes()
    ->withoutOverlapping();

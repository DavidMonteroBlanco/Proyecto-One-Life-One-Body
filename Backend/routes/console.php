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
 *
 * Se ejecuta en el momento ('sync'), no se manda a la cola.
 *
 * WeeklyReminderJob es un trabajo "de cola", y con la cola en base de
 * datos solo se envía si hay un proceso `queue:work` encendido todo el
 * rato. En hosting compartido no lo hay, y en Render tampoco: el
 * recordatorio se guardaba cada lunes y no salía nunca, sin dar ningún
 * error. Así lo envía la propia tarea programada, en cualquier hosting.
 */
Schedule::job(new WeeklyReminderJob, connection: 'sync')
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

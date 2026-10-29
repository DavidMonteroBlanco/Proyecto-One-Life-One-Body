<?php

use App\Mail\AppointmentNotificationMail;
use App\Mail\DietPlanMail;
use App\Mail\VerificationCodeMail;
use App\Mail\WeeklyReminderMail;
use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas web
|--------------------------------------------------------------------------
|
| Este proyecto es una API: el frontend va aparte, en React. Aquí solo
| viven utilidades de desarrollo.
|
*/

/*
 * ══════════════════════════════════════════════════════════
 * PREVISUALIZACIÓN DE EMAILS
 *
 * Abre en el navegador el email exactamente como le llega al
 * cliente, sin necesidad de enviarlo ni de configurar un SMTP.
 *
 *   http://127.0.0.1:8000/dev/mail
 *
 * Solo existe fuera de producción: en el servidor real estas
 * rutas ni siquiera se registran.
 * ══════════════════════════════════════════════════════════
 */
if (! app()->environment('production')) {

    Route::get('/dev/mail', function () {
        $links = [
            'dieta'        => 'Plan de alimentación (con PDF adjunto)',
            'codigo'       => 'Código de verificación',
            'cita'         => 'Aviso de reserva de pesaje',
            'recordatorio' => 'Recordatorio semanal',
        ];

        $items = collect($links)
            ->map(fn ($label, $slug) => "<li><a href=\"/dev/mail/{$slug}\">{$label}</a></li>")
            ->implode('');

        return <<<HTML
        <!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
        <title>Emails · One Life One Body</title>
        <style>
          body{background:#060a0a;color:#e9f4f3;font-family:system-ui,sans-serif;padding:48px;line-height:1.7}
          h1{font-size:20px;letter-spacing:2px;text-transform:uppercase;color:#6fdedc}
          ul{margin-top:24px;padding-left:20px}
          a{color:#9af0ee}
          p{color:#9cb4b3;max-width:60ch}
        </style></head><body>
        <h1>Previsualización de emails</h1>
        <p>Cada enlace muestra el correo tal y como lo recibe el cliente. No se envía nada.</p>
        <ul>{$items}</ul>
        </body></html>
        HTML;
    });

    Route::get('/dev/mail/{slug}', function (string $slug) {
        $user = \App\Models\User::where('role', 'user')->first();

        if (! $user) {
            abort(404, 'No hay clientes en la base de datos. Ejecuta: php artisan db:seed --class=QaSeeder');
        }

        $appointment = \App\Models\WeighingAppointment::where('user_id', $user->id)->first()
            ?? new \App\Models\WeighingAppointment([
                'user_id'          => $user->id,
                'appointment_date' => now()->addDays(2)->format('Y-m-d'),
                'appointment_time' => '10:00:00',
                'status'           => 'confirmed',
            ]);

        return match ($slug) {
            'dieta' => new DietPlanMail(
                userName: $user->name,
                planTitle: 'Plan definición · Septiembre 2026',
                // En la vista previa no hace falta generar el PDF real:
                // aquí solo se está mirando el cuerpo del mensaje.
                pdfContents: '%PDF-1.4 vista previa',
                pdfFilename: 'plan-alimentacion-ejemplo.pdf',
            ),

            'codigo'       => new VerificationCodeMail($user->name, '482913'),
            'cita'         => new AppointmentNotificationMail($appointment, $user),
            'recordatorio' => new WeeklyReminderMail($user),

            default => abort(404, 'Ese email no existe. Vuelve a /dev/mail'),
        };
    });
}

/*
 * ══════════════════════════════════════════════════════════
 * LA APLICACIÓN DE REACT
 *
 * En el servidor, el frontend ya construido vive dentro de
 * `public/` y se sirve desde aquí mismo. Una sola dirección para
 * todo: nada de CORS, nada de dos despliegues que mantener
 * sincronizados.
 *
 * React Router lleva las rutas del lado del navegador, así que
 * cualquier dirección que no sea un fichero real tiene que
 * devolver el index.html y deja que React decida qué pintar. Sin
 * esto, recargar en /dashboard daría un 404.
 *
 * Quedan fuera las rutas de la API, el chequeo de salud y las
 * utilidades de desarrollo, que se registran antes.
 *
 * En local no existe `public/index.html` (el frontend corre en
 * Vite, en el puerto 5173), así que se responde con una pista en
 * vez de un error cualquiera.
 * ══════════════════════════════════════════════════════════
 */
Route::get('/{ruta?}', SpaController::class)
    ->where('ruta', '^(?!api/|up$|dev/).*$')
    ->name('spa');

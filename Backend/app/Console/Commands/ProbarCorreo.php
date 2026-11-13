<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

/**
 * Manda un correo de prueba con la configuración actual del .env.
 *
 *   php artisan olob:probar-correo tu@correo.com
 *
 * Es lo primero que hay que hacer en un servidor nuevo. Si el SMTP está
 * mal configurado, la web funciona igual pero ningún aviso ni ningún plan
 * llega a nadie, y solo se descubre cuando un cliente pregunta. Esto lo
 * dice en el momento, con el error exacto del servidor de correo.
 */
class ProbarCorreo extends Command
{
    protected $signature = 'olob:probar-correo
                            {destino : Correo al que mandar la prueba}';

    protected $description = 'Envía un correo de prueba y dice si la configuración SMTP funciona';

    public function handle(): int
    {
        $destino = trim($this->argument('destino'));

        if (! filter_var($destino, FILTER_VALIDATE_EMAIL)) {
            $this->error("«{$destino}» no es un correo válido.");

            return self::FAILURE;
        }

        $mailer = config('mail.default');
        $smtp = config('mail.mailers.smtp');

        // La configuración que se está usando, sin la contraseña.
        $this->line('Configuración en uso:');
        $this->line("  MAIL_MAILER        {$mailer}");
        if ($mailer === 'smtp') {
            $this->line('  MAIL_HOST          ' . ($smtp['host'] ?? '—'));
            $this->line('  MAIL_PORT          ' . ($smtp['port'] ?? '—'));
            $this->line('  MAIL_SCHEME        ' . ($smtp['scheme'] ?: '(automático)'));
            $this->line('  MAIL_USERNAME      ' . ($smtp['username'] ?: '—'));
            $this->line('  MAIL_PASSWORD      ' . (empty($smtp['password']) ? 'VACÍA' : '(puesta)'));
        }
        $this->line('  MAIL_FROM_ADDRESS  ' . (config('mail.from.address') ?: '—'));
        $this->line('  OLOB_MAIL_AVISOS   ' . (config('olob.avisos') ?: 'VACÍO: no se avisará de las reservas'));
        $this->newLine();

        if ($mailer === 'log') {
            $this->warn('MAIL_MAILER=log: el correo se escribe en storage/logs y NO sale a internet.');
            $this->warn('Para enviar de verdad, pon MAIL_MAILER=smtp y los datos del buzón.');

            // El mailer "log" escribe con nivel debug. Con LOG_LEVEL más
            // alto (la plantilla de producción usa notice), el correo no
            // llega a escribirse y parecería que no ha salido nada.
            if (config('logging.channels.' . config('logging.default') . '.level', 'debug') !== 'debug') {
                $this->warn('Y con LOG_LEVEL distinto de "debug" ni siquiera se escribe en el registro.');
            }
        }

        try {
            Mail::raw(
                "Correo de prueba de " . config('olob.nombre') . ".\n\n"
                . "Si lees esto, la configuración de correo del servidor funciona:\n"
                . "los avisos de reservas, las dietas y los entrenos llegarán.\n\n"
                . 'Enviado el ' . now()->format('d/m/Y \a \l\a\s H:i') . '.',
                fn ($m) => $m->to($destino)->subject('Prueba de correo · ' . config('olob.nombre'))
            );
        } catch (\Throwable $e) {
            $this->error('NO se ha podido enviar.');
            $this->line('  ' . $e->getMessage());
            $this->newLine();
            $this->line('Lo más habitual:');
            $this->line('  · "Connection could not be established" → MAIL_HOST o MAIL_PORT mal,');
            $this->line('    o el puerto no cuadra con MAIL_SCHEME (465 con smtps, 587 con smtp).');
            $this->line('  · "Authentication failed" / "535" → usuario o contraseña del buzón.');
            $this->line('  · "Sender address rejected" → MAIL_FROM_ADDRESS no es de ese buzón.');

            return self::FAILURE;
        }

        $this->info($mailer === 'log'
            ? 'Hecho. Míralo en el registro de hoy, dentro de storage/logs/.'
            : "Enviado a {$destino}. Mira la bandeja de entrada y también la de spam.");

        return self::SUCCESS;
    }
}

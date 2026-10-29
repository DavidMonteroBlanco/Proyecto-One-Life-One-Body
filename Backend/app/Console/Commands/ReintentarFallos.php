<?php

namespace App\Console\Commands;

use App\Models\FailedOperation;
use App\Services\ReintentarOperacion;
use Illuminate\Console\Command;

/**
 * Reintenta las operaciones que fallaron y ya les toca.
 *
 * Se programa cada cinco minutos en routes/console.php. En el servidor
 * hace falta una tarea de cron que llame al planificador de Laravel:
 *
 *   * * * * * cd /ruta/al/proyecto && php artisan schedule:run >> /dev/null 2>&1
 *
 * Sin esa línea el sistema sigue funcionando, pero los reintentos
 * automáticos no corren y todo queda a la espera del botón del panel.
 */
class ReintentarFallos extends Command
{
    protected $signature = 'olob:reintentar
                            {--limite=20 : Máximo de operaciones por pasada}';

    protected $description = 'Reintenta los envíos que fallaron y ya les toca';

    public function handle(ReintentarOperacion $reintentar): int
    {
        $pendientes = FailedOperation::whereNull('resolved_at')
            ->whereNotNull('next_attempt_at')
            ->where('next_attempt_at', '<=', now())
            ->orderBy('next_attempt_at')
            ->limit((int) $this->option('limite'))
            ->get();

        if ($pendientes->isEmpty()) {
            $this->info('Nada que reintentar.');

            return self::SUCCESS;
        }

        $this->info("Reintentando {$pendientes->count()} operación(es)…");

        $bien = 0;
        foreach ($pendientes as $incidencia) {
            $resultado = $reintentar->ejecutar($incidencia);

            if ($resultado['ok']) {
                $bien++;
                $this->line("  ✓ #{$incidencia->id} {$incidencia->summary}");
            } else {
                $this->line("  · #{$incidencia->id} sigue fallando: {$resultado['message']}");
            }
        }

        $this->info("Resueltas: {$bien} de {$pendientes->count()}.");

        return self::SUCCESS;
    }
}

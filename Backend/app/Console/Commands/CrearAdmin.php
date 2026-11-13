<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

/**
 * Crea la cuenta de administrador (la del entrenador) en un servidor nuevo.
 *
 *   php artisan olob:crear-admin david@centro.es --nombre="David Montero"
 *
 * Sin --password genera una contraseña fuerte y la enseña UNA vez. Es lo
 * recomendable: así nunca queda escrita en el historial del terminal.
 *
 * Si el correo ya existe, no crea otra cuenta: la convierte en
 * administradora y, solo si se pasa --password, cambia la contraseña.
 *
 * Existe porque en producción no deben cargarse los datos de demostración
 * (DemoSeeder): sus contraseñas están escritas en el código. Sin esto no
 * habría forma limpia de tener el primer administrador.
 */
class CrearAdmin extends Command
{
    protected $signature = 'olob:crear-admin
                            {email : Correo con el que entrará el entrenador}
                            {--nombre= : Nombre que se verá en el panel}
                            {--password= : Contraseña. Si no se pone, se genera una}';

    protected $description = 'Crea (o promueve) la cuenta de administrador';

    public function handle(): int
    {
        $email = mb_strtolower(trim($this->argument('email')));

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error("«{$email}» no es un correo válido.");

            return self::FAILURE;
        }

        $password = $this->option('password');
        if ($password !== null && mb_strlen($password) < 12) {
            $this->error('La contraseña debe tener al menos 12 caracteres.');

            return self::FAILURE;
        }

        $usuario = User::where('email', $email)->first();

        if ($usuario) {
            $usuario->role = 'admin';
            if ($this->option('nombre')) {
                $usuario->name = $this->option('nombre');
            }
            if ($password !== null) {
                $usuario->password = Hash::make($password);
            }
            $usuario->save();

            $this->info("La cuenta {$email} ya existía: ahora es administradora.");
            $this->line($password !== null
                ? '  Contraseña cambiada a la que has indicado.'
                : '  La contraseña NO se ha tocado.');

            return self::SUCCESS;
        }

        $generada = $password === null;
        $password ??= $this->contrasenaFuerte();

        User::create([
            'name'     => $this->option('nombre') ?: 'Administrador',
            'email'    => $email,
            'password' => Hash::make($password),
            'role'     => 'admin',
        ]);

        $this->info("Cuenta de administrador creada: {$email}");

        if ($generada) {
            $this->newLine();
            $this->warn('  Contraseña (cópiala ahora, no se volverá a mostrar):');
            $this->line("  {$password}");
            $this->newLine();
            $this->line('  Puede cambiarla luego desde Mi perfil.');
        }

        return self::SUCCESS;
    }

    /**
     * 16 caracteres con mayúsculas, minúsculas, números y símbolos, sin los
     * que se confunden al copiarlos a mano (0/O, 1/l/I).
     */
    private function contrasenaFuerte(): string
    {
        $grupos = [
            'ABCDEFGHJKLMNPQRSTUVWXYZ',
            'abcdefghijkmnpqrstuvwxyz',
            '23456789',
            '!@#$%*?+',
        ];

        // Uno de cada grupo como mínimo, el resto al azar de todos.
        $caracteres = array_map(fn ($g) => $g[random_int(0, strlen($g) - 1)], $grupos);
        $todos = implode('', $grupos);
        while (count($caracteres) < 16) {
            $caracteres[] = $todos[random_int(0, strlen($todos) - 1)];
        }

        // Barajado con random_int y no con shuffle(), que no usa azar
        // criptográfico: los cuatro caracteres obligatorios no deben
        // quedar en posiciones predecibles.
        for ($i = count($caracteres) - 1; $i > 0; $i--) {
            $j = random_int(0, $i);
            [$caracteres[$i], $caracteres[$j]] = [$caracteres[$j], $caracteres[$i]];
        }

        return implode('', $caracteres);
    }
}

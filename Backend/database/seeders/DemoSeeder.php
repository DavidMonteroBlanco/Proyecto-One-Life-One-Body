<?php

namespace Database\Seeders;

use App\Models\DietMeal;
use App\Models\DietPlan;
use App\Models\Notification;
use App\Models\User;
use App\Models\WeighingAppointment;
use App\Models\WeightRecord;
use App\Models\Workout;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * ══════════════════════════════════════════════════════════
 * DATOS PARA LA DEMO
 *
 * Dos cuentas y nada más: una de entrenador y una de cliente,
 * para poder recorrer la aplicación delante de alguien sin que
 * sobren nombres por la pantalla.
 *
 *   php artisan db:seed --class=DemoSeeder
 *
 * A diferencia de QaSeeder, este SÍ se ejecuta en producción,
 * porque es lo que levanta la demo en el hosting. Para que eso
 * sea seguro:
 *
 *   - Solo toca las dos cuentas de demo, por su email. Nunca
 *     recorre la tabla de usuarios ni borra nada ajeno.
 *   - Es idempotente: ejecutarlo dos veces deja lo mismo.
 *   - Las contraseñas salen del entorno si están definidas
 *     (DEMO_PASSWORD), para poder cambiarlas sin tocar código.
 *
 * Aun así, estas cuentas son de ENSEÑAR, no de trabajar. Cuando
 * el centro empiece a meter clientes de verdad hay que borrarlas.
 * ══════════════════════════════════════════════════════════
 */
class DemoSeeder extends Seeder
{
    public const EMAIL_ADMIN   = 'entrenador@onelifeonebody.demo';
    public const EMAIL_CLIENTE = 'cliente@onelifeonebody.demo';

    public function run(): void
    {
        $password = (string) (config('olob.demo_password') ?: 'Demo2026!Olob');

        $admin = $this->cuenta(
            'David Montero', self::EMAIL_ADMIN, 'admin', '601387263', $password
        );

        $cliente = $this->cuenta(
            'María García', self::EMAIL_CLIENTE, 'user', '611111111', $password
        );

        $this->historialDePesajes($cliente);
        $this->dieta($cliente);
        $this->entreno($cliente);
        $this->citas($cliente);
        $this->avisos($cliente);

        $this->command->info('');
        $this->command->info('  ══════════════════════════════════════════');
        $this->command->info('  CUENTAS DE LA DEMO');
        $this->command->info('  ══════════════════════════════════════════');
        $this->command->info('  Entrenador  ' . $admin->email);
        $this->command->info('  Cliente     ' . $cliente->email);
        $this->command->info('  Contraseña  ' . $password . '   (para las dos)');
        $this->command->info('  Código de acceso al registro: DIVA');
        $this->command->info('  ══════════════════════════════════════════');
        $this->command->info('');
    }

    private function cuenta(string $nombre, string $email, string $rol, string $telefono, string $password): User
    {
        return User::updateOrCreate(
            ['email' => $email],
            [
                'name'       => $nombre,
                'password'   => Hash::make($password),
                'role'       => $rol,
                'phone'      => $telefono,
                'birth_date' => '1992-04-18',
            ]
        );
    }

    /**
     * 14 semanas de pesajes bajando, con algo de ruido para que la
     * gráfica no sea una recta.
     *
     * Las fechas son relativas a hoy a propósito: así la demo nunca
     * sale con datos de hace medio año, y la tira de constancia
     * aparece encendida.
     */
    private function historialDePesajes(User $cliente): void
    {
        WeightRecord::where('user_id', $cliente->id)->delete();

        $peso    = 84.6;
        $grasa   = 27.4;
        $musculo = 36.1;

        for ($semana = 13; $semana >= 0; $semana--) {
            $peso    += -0.7 + (rand(-30, 30) / 100);
            $grasa   += -0.35 + (rand(-8, 8) / 100);
            $musculo += 0.22 + (rand(-6, 6) / 100);

            WeightRecord::create([
                'user_id'           => $cliente->id,
                'weight_kg'         => round($peso, 1),
                'fat_percentage'    => round(max(6, $grasa), 1),
                'muscle_percentage' => round(min(60, $musculo), 1),
                'recorded_at'       => now()->subWeeks($semana)->format('Y-m-d'),
                'notes'             => match ($semana) {
                    13 => 'Primer pesaje, evaluación inicial.',
                    6  => 'Semana de vacaciones, mantenemos.',
                    0  => 'Muy buena progresión. Subimos cargas.',
                    default => null,
                },
            ]);
        }
    }

    private function dieta(User $cliente): void
    {
        DietPlan::where('user_id', $cliente->id)->delete();

        $plan = DietPlan::create([
            'user_id' => $cliente->id,
            'title'   => 'Plan definición · ' . now()->translatedFormat('F Y'),
            'notes'   => 'Bebe 2,5 litros de agua al día. Si entrenas por la mañana, '
                       . 'pasa el pre-entreno al desayuno.',
            'active'  => true,
            'sent_at' => now()->subDays(3),
        ]);

        $comidas = [
            ['desayuno',     '2 huevos revueltos, 60 g de avena con leche desnatada, 1 plátano', '480 kcal', '32P / 55C / 14G'],
            ['media_manana', '1 yogur griego natural con 20 g de nueces',                        '240 kcal', '14P / 10C / 16G'],
            ['comida',       '150 g de pechuga de pollo a la plancha, 70 g de arroz integral, ensalada con aceite de oliva', '620 kcal', '48P / 62C / 18G'],
            ['pre_entreno',  '1 tostada de pan integral con pavo y un café solo',                '210 kcal', '14P / 28C / 4G'],
            ['cena',         '180 g de merluza al horno con verduras asadas y 1 rebanada de pan', '450 kcal', '40P / 32C / 15G'],
        ];

        foreach ($comidas as $i => [$tipo, $alimentos, $kcal, $macros]) {
            DietMeal::create([
                'diet_plan_id' => $plan->id,
                'meal_type'    => $tipo,
                'foods'        => $alimentos,
                'calories'     => $kcal,
                'macros'       => $macros,
                'sort_order'   => $i,
            ]);
        }
    }

    /**
     * Dos entrenos: uno ya enviado y otro sin enviar, para poder
     * mostrar en la demo las dos insignias y el botón de envío.
     */
    private function entreno(User $cliente): void
    {
        Workout::where('user_id', $cliente->id)->delete();

        $empuje = Workout::create([
            'user_id'          => $cliente->id,
            'title'            => 'Empuje semana 4',
            'goal'             => 'Hipertrofia',
            'duration_minutes' => 70,
            'level'            => 'intermediate',
            'notes'            => 'Calienta 10 minutos antes. Si el último set sale fácil, '
                                . 'sube 2,5 kg la semana que viene.',
            'sent_at'          => now()->subDays(2),
        ]);

        $this->ejercicios($empuje, [
            ['Press banca',                    4, '8-10',  '42,5 kg', 120, 'Bajada lenta'],
            ['Press inclinado con mancuernas', 3, '10-12', '16 kg',    90, null],
            ['Press militar',                  4, '8-10',  '27,5 kg', 120, null],
            ['Elevaciones laterales',          3, '12-15', '7 kg',     60, 'Sin balanceo'],
            ['Fondos en paralelas',            3, '10',    'corporal', 90, null],
            ['Extensión de tríceps en polea',  3, '12-15', '20 kg',    60, null],
        ]);

        $tiron = Workout::create([
            'user_id'          => $cliente->id,
            'title'            => 'Tirón semana 4',
            'goal'             => 'Hipertrofia',
            'duration_minutes' => 65,
            'level'            => 'intermediate',
            'notes'            => null,
            'sent_at'          => null,
        ]);

        $this->ejercicios($tiron, [
            ['Dominadas',            4, '6-8',   'corporal', 120, 'Con goma si hace falta'],
            ['Remo con barra',       4, '8-10',  '40 kg',    120, null],
            ['Jalón al pecho',       3, '10-12', '35 kg',     90, null],
            ['Remo en polea baja',   3, '12',    '30 kg',     90, null],
            ['Curl con barra',       3, '10-12', '20 kg',     60, null],
            ['Curl martillo',        3, '12',    '10 kg',     60, null],
        ]);
    }

    private function ejercicios(Workout $workout, array $filas): void
    {
        foreach ($filas as $i => [$nombre, $series, $reps, $peso, $descanso, $notas]) {
            $workout->exercises()->create([
                'name'         => $nombre,
                'sets'         => $series,
                'reps'         => $reps,
                'weight'       => $peso,
                'rest_seconds' => $descanso,
                'notes'        => $notas,
                'sort_order'   => $i,
            ]);
        }
    }

    /** Una cita futura y una pasada, para ver las dos insignias. */
    private function citas(User $cliente): void
    {
        WeighingAppointment::where('user_id', $cliente->id)->delete();

        WeighingAppointment::create([
            'user_id'          => $cliente->id,
            'appointment_date' => $this->diaDeSemana(2),
            'appointment_time' => '10:00:00',
            'status'           => 'confirmed',
            'notes'            => 'Vengo en ayunas.',
        ]);

        WeighingAppointment::create([
            'user_id'          => $cliente->id,
            'appointment_date' => $this->diaDeSemana(-7),
            'appointment_time' => '11:00:00',
            'status'           => 'completed',
        ]);
    }

    /** Avisos dentro de la web, con uno sin leer para que se vea la campana. */
    private function avisos(User $cliente): void
    {
        Notification::where('user_id', $cliente->id)->delete();

        Notification::create([
            'user_id' => $cliente->id,
            'type'    => 'workout',
            'title'   => 'Tienes un entreno nuevo',
            'body'    => 'Empuje semana 4',
            'link'    => '/my-workouts',
            'read_at' => null,
        ]);

        Notification::create([
            'user_id' => $cliente->id,
            'type'    => 'diet_plan',
            'title'   => 'Tienes un plan de alimentación nuevo',
            'body'    => 'Plan definición · ' . now()->translatedFormat('F Y'),
            'link'    => '/my-diet',
            'read_at' => now()->subDays(2),
        ]);
    }

    /** Suma días saltando el fin de semana: el centro solo pesa de lunes a viernes. */
    private function diaDeSemana(int $dias): string
    {
        $fecha = now()->addDays($dias);

        while (in_array($fecha->dayOfWeek, [0, 6], true)) {
            $fecha = $dias >= 0 ? $fecha->addDay() : $fecha->subDay();
        }

        return $fecha->format('Y-m-d');
    }
}

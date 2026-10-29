<?php

namespace Database\Seeders;

use App\Models\DietMeal;
use App\Models\DietPlan;
use App\Models\User;
use App\Models\WeighingAppointment;
use App\Models\WeightRecord;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Datos de prueba para QA.
 *
 * Crea un administrador y cuatro clientes con historial de pesajes,
 * planes de alimentación y reservas, para poder recorrer la aplicación
 * entera sin tener que ir dando de alta cosas a mano.
 *
 * Se niega a ejecutarse en producción: las contraseñas son conocidas
 * y están escritas en el repositorio.
 *
 *   php artisan db:seed --class=QaSeeder
 */
class QaSeeder extends Seeder
{
    /** Contraseña única para todas las cuentas de prueba. */
    private const PASSWORD = 'OloBqa2026!';

    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command->error('QaSeeder no se ejecuta en producción. Abortado.');
            return;
        }

        $admin = $this->user('David Montero', 'admin@olob.test', 'admin', '601387263');

        $clients = [
            // [nombre, email, teléfono, peso inicial, tendencia semanal]
            ['María García',    'maria@olob.test',    '611111111', 84.6, -0.7],
            ['Alejandro Ruiz',  'alejandro@olob.test', '622222222', 68.2, +0.4],
            ['Lucía Martín',    'lucia@olob.test',     '633333333', 61.0, -0.2],
            ['Carlos Nadal',    'carlos@olob.test',    '644444444', 95.3, -0.9],
        ];

        foreach ($clients as $i => [$name, $email, $phone, $startWeight, $trend]) {
            $user = $this->user($name, $email, 'user', $phone);

            $this->weightHistory($user, $startWeight, $trend);

            // Al último cliente se le deja sin dieta a propósito, para
            // poder ver el estado vacío de "Sin dieta asignada".
            if ($i < 3) {
                $this->dietPlan($user, $i === 0);
            }

            $this->appointments($user, $i);
        }

        $this->command->info('');
        $this->command->info('  Datos de QA listos.');
        $this->command->info('  Contraseña para todas las cuentas: ' . self::PASSWORD);
        $this->command->info('  Admin: ' . $admin->email);
        $this->command->info('');
    }

    private function user(string $name, string $email, string $role, string $phone): User
    {
        return User::updateOrCreate(
            ['email' => $email],
            [
                'name'       => $name,
                'password'   => Hash::make(self::PASSWORD),
                'role'       => $role,
                'phone'      => $phone,
                'birth_date' => now()->subYears(rand(24, 45))->format('Y-m-d'),
            ]
        );
    }

    /** 14 semanas de pesajes con una tendencia y algo de ruido. */
    private function weightHistory(User $user, float $start, float $trend): void
    {
        WeightRecord::where('user_id', $user->id)->delete();

        $weight = $start;
        $fat = rand(180, 280) / 10;
        $muscle = rand(350, 430) / 10;

        for ($week = 13; $week >= 0; $week--) {
            // Ruido de ±0.35 kg para que la gráfica no sea una recta
            $weight += $trend + (rand(-35, 35) / 100);
            $fat += ($trend < 0 ? -0.18 : 0.05) + (rand(-10, 10) / 100);
            $muscle += ($trend < 0 ? 0.06 : 0.14) + (rand(-8, 8) / 100);

            WeightRecord::create([
                'user_id'           => $user->id,
                'weight_kg'         => round($weight, 1),
                'fat_percentage'    => round(max(6, $fat), 1),
                'muscle_percentage' => round(min(60, $muscle), 1),
                'recorded_at'       => now()->subWeeks($week)->format('Y-m-d'),
                'notes'             => $week === 13 ? 'Primer pesaje, evaluación inicial.' : null,
            ]);
        }
    }

    private function dietPlan(User $user, bool $alreadySent): void
    {
        DietPlan::where('user_id', $user->id)->delete();

        $plan = DietPlan::create([
            'user_id' => $user->id,
            'title'   => 'Plan definición · ' . now()->translatedFormat('F Y'),
            'notes'   => 'Bebe 2,5 litros de agua al día. Si entrenas por la mañana, '
                       . 'pasa el pre-entreno al desayuno.',
            'active'  => true,
            'sent_at' => $alreadySent ? now()->subDays(3) : null,
        ]);

        $meals = [
            ['desayuno',     '2 huevos revueltos, 60 g de avena con leche desnatada, 1 plátano', '480 kcal', '32P / 55C / 14G'],
            ['media_manana', '1 yogur griego natural con 20 g de nueces',                        '240 kcal', '14P / 10C / 16G'],
            ['comida',       '150 g de pechuga de pollo a la plancha, 70 g de arroz integral, ensalada con aceite de oliva', '620 kcal', '48P / 62C / 18G'],
            ['pre_entreno',  '1 tostada de pan integral con pavo y un café solo',                '210 kcal', '14P / 28C / 4G'],
            ['cena',         '180 g de merluza al horno con verduras asadas y 1 rebanada de pan', '450 kcal', '40P / 32C / 15G'],
        ];

        foreach ($meals as $i => [$type, $foods, $kcal, $macros]) {
            DietMeal::create([
                'diet_plan_id' => $plan->id,
                'meal_type'    => $type,
                'foods'        => $foods,
                'calories'     => $kcal,
                'macros'       => $macros,
                'sort_order'   => $i,
            ]);
        }
    }

    /**
     * Una cita futura y una pasada por cliente, repartiendo estados
     * para poder ver las cuatro insignias del listado.
     */
    private function appointments(User $user, int $index): void
    {
        WeighingAppointment::where('user_id', $user->id)->delete();

        $future = ['pending', 'confirmed', 'confirmed', 'pending'][$index];
        $past   = ['completed', 'completed', 'cancelled', 'completed'][$index];

        WeighingAppointment::create([
            'user_id'          => $user->id,
            'appointment_date' => $this->nextWeekday($index + 1),
            'appointment_time' => sprintf('%02d:00:00', 10 + $index),
            'status'           => $future,
            'notes'            => $index === 0 ? 'Vengo en ayunas.' : null,
        ]);

        WeighingAppointment::create([
            'user_id'          => $user->id,
            'appointment_date' => $this->nextWeekday(-7 - $index),
            'appointment_time' => sprintf('%02d:00:00', 11 + $index),
            'status'           => $past,
        ]);
    }

    /** Suma días saltando fines de semana: el centro solo pesa de lunes a viernes. */
    private function nextWeekday(int $offsetDays): string
    {
        $date = now()->addDays($offsetDays);

        while (in_array($date->dayOfWeek, [0, 6], true)) {
            $date = $offsetDays >= 0 ? $date->addDay() : $date->subDay();
        }

        return $date->format('Y-m-d');
    }
}

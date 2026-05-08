<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeighingAppointment extends Model
{
    protected $fillable = [
        'user_id',
        'appointment_date',
        'appointment_time',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'appointment_date' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Horarios disponibles según el día de la semana.
     * Lunes a viernes: 7:00-13:00 y 16:30-19:00
     * Jueves: solo mañana (sin tarde)
     */
    public static function getAvailableSlots(string $date): array
    {
        $dayOfWeek = (int) date('N', strtotime($date)); // 1=lun, 5=vie, 6=sab, 7=dom

        // Solo lunes a viernes
        if ($dayOfWeek > 5) return [];

        $slots = [];

        // Mañanas: 7:00 a 13:00 (cada 30 min)
        for ($h = 7; $h < 13; $h++) {
            $slots[] = sprintf('%02d:00', $h);
            $slots[] = sprintf('%02d:30', $h);
        }
        $slots[] = '13:00';

        // Tardes: 16:30 a 19:00 (excepto jueves, dayOfWeek=4)
        if ($dayOfWeek !== 4) {
            $slots[] = '16:30';
            $slots[] = '17:00';
            $slots[] = '17:30';
            $slots[] = '18:00';
            $slots[] = '18:30';
            $slots[] = '19:00';
        }

        return $slots;
    }
}
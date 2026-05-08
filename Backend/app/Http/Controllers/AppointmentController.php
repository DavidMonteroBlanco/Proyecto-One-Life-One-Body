<?php

namespace App\Http\Controllers;

use App\Models\WeighingAppointment;
use App\Mail\AppointmentNotificationMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AppointmentController extends Controller
{
    /**
     * Ver las reservas del usuario autenticado.
     */
    public function myAppointments(Request $request)
    {
        $appointments = WeighingAppointment::where('user_id', $request->user()->id)
            ->orderByDesc('appointment_date')
            ->orderByDesc('appointment_time')
            ->get();

        return response()->json($appointments);
    }

    /**
     * Obtener horarios disponibles para una fecha.
     */
    public function availableSlots(Request $request)
    {
        $request->validate(['date' => ['required', 'date', 'after_or_equal:today']]);

        $date = $request->query('date');
        $allSlots = WeighingAppointment::getAvailableSlots($date);

        // Quitar los ya reservados
        $booked = WeighingAppointment::where('appointment_date', $date)
            ->whereIn('status', ['pending', 'confirmed'])
            ->pluck('appointment_time')
            ->map(fn($t) => substr($t, 0, 5))
            ->toArray();

        $available = array_values(array_filter($allSlots, fn($s) => !in_array($s, $booked)));

        return response()->json([
            'date'      => $date,
            'slots'     => $available,
            'day_name'  => self::dayName($date),
        ]);
    }

    /**
     * Reservar una cita de pesaje.
     */
    public function book(Request $request)
    {
        $data = $request->validate([
            'appointment_date' => ['required', 'date', 'after_or_equal:today'],
            'appointment_time' => ['required', 'string', 'regex:/^\d{2}:\d{2}$/'],
            'notes'            => ['nullable', 'string', 'max:500'],
        ]);

        $user = $request->user();
        $date = $data['appointment_date'];
        $time = $data['appointment_time'];

        // Verificar que es un horario válido
        $allSlots = WeighingAppointment::getAvailableSlots($date);
        if (!in_array($time, $allSlots)) {
            return response()->json(['message' => 'Horario no disponible para ese día.'], 422);
        }

        // Verificar que no está ya cogido
        $exists = WeighingAppointment::where('appointment_date', $date)
            ->where('appointment_time', $time)
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Ese horario ya está reservado. Elige otro.'], 422);
        }

        // Verificar que el usuario no tiene ya una cita ese día
        $userHas = WeighingAppointment::where('user_id', $user->id)
            ->where('appointment_date', $date)
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();

        if ($userHas) {
            return response()->json(['message' => 'Ya tienes una reserva para ese día.'], 422);
        }

        $appointment = WeighingAppointment::create([
            'user_id'          => $user->id,
            'appointment_date' => $date,
            'appointment_time' => $time,
            'notes'            => $data['notes'] ?? null,
            'status'           => 'pending',
        ]);

        // Enviar email de notificación a los entrenadores
        try {
            $trainers = [
                'pepesargento49@gmail.com', // Cambia por el email real de Muky/Dabuky
            ];

            foreach ($trainers as $email) {
                Mail::to($email)->send(new AppointmentNotificationMail($appointment, $user));
            }
        } catch (\Exception $e) {
            \Log::warning('Error enviando notificación de cita: ' . $e->getMessage());
        }

        return response()->json([
            'message'     => 'Reserva confirmada.',
            'appointment' => $appointment,
        ], 201);
    }

    /**
     * Cancelar una cita.
     */
    public function cancel(WeighingAppointment $appointment, Request $request)
    {
        if ($appointment->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        if ($appointment->status === 'completed') {
            return response()->json(['message' => 'No se puede cancelar una cita completada.'], 422);
        }

        $appointment->update(['status' => 'cancelled']);
        return response()->json(['message' => 'Reserva cancelada.']);
    }

    /**
     * Admin: ver todas las citas.
     */
    public function adminIndex()
    {
        $appointments = WeighingAppointment::with('user:id,name,email,phone')
            ->orderBy('appointment_date')
            ->orderBy('appointment_time')
            ->get();

        return response()->json($appointments);
    }

    /**
     * Admin: cambiar estado de una cita.
     */
    public function adminUpdateStatus(Request $request, WeighingAppointment $appointment)
    {
        $data = $request->validate([
            'status' => ['required', 'in:pending,confirmed,cancelled,completed'],
        ]);

        $appointment->update(['status' => $data['status']]);

        return response()->json([
            'message' => 'Estado actualizado.',
            'appointment' => $appointment->load('user:id,name,email'),
        ]);
    }

    private static function dayName(string $date): string
    {
        $days = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        return $days[(int) date('N', strtotime($date))] ?? '';
    }
}
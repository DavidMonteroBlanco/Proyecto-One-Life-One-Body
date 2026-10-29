<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

/**
 * Avisos dentro de la web para el cliente que ha iniciado sesión.
 * Solo lectura y marcar como leído: los avisos los crea el sistema.
 */
class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $avisos = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->limit(30)
            ->get();

        return response()->json([
            'notifications' => $avisos,
            'unread'        => $avisos->whereNull('read_at')->count(),
        ]);
    }

    public function markRead(Request $request, Notification $notification)
    {
        // Un usuario solo puede marcar los suyos.
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Leído.']);
    }

    public function markAllRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'Todos marcados como leídos.']);
    }
}

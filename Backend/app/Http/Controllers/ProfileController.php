<?php

namespace App\Http\Controllers;

use App\Mail\VerificationCodeMail;
use App\Models\PasswordVerificationCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Actualizar datos del perfil.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'phone'      => ['nullable', 'string', 'max:20'],
            'birth_date' => ['nullable', 'date', 'before:today'],
        ]);

        $user->update($data);

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'user'    => $user->only(['id', 'name', 'email', 'phone', 'birth_date', 'role']),
        ]);
    }

    /**
     * Solicitar código de verificación por EMAIL.
     * Protección: máximo 3 solicitudes por hora.
     */
    public function requestPasswordCode(Request $request)
    {
        $user = $request->user();

        // Rate limit: máximo 3 códigos por hora
        $recentCount = PasswordVerificationCode::where('user_id', $user->id)
            ->where('created_at', '>', now()->subHour())
            ->count();

        if ($recentCount >= 3) {
            return response()->json([
                'message' => 'Has solicitado demasiados códigos. Espera un poco antes de intentarlo de nuevo.',
            ], 429);
        }

        // Generar código de 6 dígitos
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Eliminar códigos anteriores del usuario
        PasswordVerificationCode::where('user_id', $user->id)->delete();

        // Guardar el nuevo (expira en 10 minutos)
        PasswordVerificationCode::create([
            'user_id'    => $user->id,
            'code'       => Hash::make($code),
            'method'     => 'email',
            'expires_at' => now()->addMinutes(10),
        ]);

        // Enviar email con template profesional
        Mail::to($user->email)->send(new VerificationCodeMail($user->name, $code));

        return response()->json([
            'message' => 'Código de verificación enviado a tu email.',
        ]);
    }

    /**
     * Verificar código y cambiar contraseña.
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'code'     => ['required', 'string', 'size:6'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        // Buscar código válido (no expirado)
        $record = PasswordVerificationCode::where('user_id', $user->id)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$record || !Hash::check($data['code'], $record->code)) {
            return response()->json([
                'message' => 'Código incorrecto o expirado. Solicita uno nuevo.',
            ], 422);
        }

        // Cambiar contraseña
        $user->update([
            'password' => $data['password'],
        ]);

        // Limpiar códigos
        PasswordVerificationCode::where('user_id', $user->id)->delete();

        // Revocar todas las sesiones excepto la actual
        $currentTokenId = $user->currentAccessToken()->id;
        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        return response()->json([
            'message' => 'Contraseña cambiada correctamente.',
        ]);
    }
}
<?php

namespace App\Http\Controllers;

use App\Mail\VerificationCodeMail;
use App\Models\PasswordVerificationCode;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;

class ForgotPasswordController extends Controller
{
    /**
     * Solicitar código de recuperación (ruta PÚBLICA).
     * No revelamos si el email existe o no (seguridad).
     */
    public function requestCode(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ]);

        $user = User::where('email', $data['email'])->first();

        // Siempre respondemos OK (no revelamos si el email existe)
        if (!$user) {
            return response()->json([
                'message' => 'Si el email existe, recibirás un código de verificación.',
            ]);
        }

        // Rate limit: máximo 3 por hora
        $recentCount = PasswordVerificationCode::where('user_id', $user->id)
            ->where('created_at', '>', now()->subHour())
            ->count();

        if ($recentCount >= 3) {
            return response()->json([
                'message' => 'Demasiados intentos. Espera un poco antes de intentarlo de nuevo.',
            ], 429);
        }

        // Generar código
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Limpiar anteriores
        PasswordVerificationCode::where('user_id', $user->id)->delete();

        // Guardar nuevo
        PasswordVerificationCode::create([
            'user_id'    => $user->id,
            'code'       => Hash::make($code),
            'method'     => 'email',
            'expires_at' => now()->addMinutes(10),
        ]);

        // Enviar email
        Mail::to($user->email)->send(new VerificationCodeMail($user->name, $code));

        return response()->json([
            'message' => 'Si el email existe, recibirás un código de verificación.',
        ]);
    }

    /**
     * Verificar código y cambiar contraseña (ruta PÚBLICA).
     */
    public function reset(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'code'     => ['required', 'string', 'size:6'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user) {
            return response()->json([
                'message' => 'Código incorrecto o expirado.',
            ], 422);
        }

        // Buscar código válido
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

        // Revocar todos los tokens activos
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Contraseña cambiada correctamente.',
        ]);
    }
}
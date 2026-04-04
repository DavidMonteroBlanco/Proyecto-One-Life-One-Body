<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Registro de nuevo usuario (cliente).
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'max:255', 'unique:users,email'],
            'password'   => ['required', 'confirmed', Password::defaults()],
            'phone'      => ['nullable', 'string', 'max:20'],
            'birth_date' => ['nullable', 'date', 'before:today'],
        ]);

        $user = User::create([
            'name'       => $data['name'],
            'email'      => $data['email'],
            'password'   => $data['password'], // El cast 'hashed' en el modelo lo encripta automáticamente
            'role'       => 'user',
            'phone'      => $data['phone'] ?? null,
            'birth_date' => $data['birth_date'] ?? null,
        ]);

        // Token para SPA (React)
        $token = $user->createToken('spa-token', ['*'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'token'   => $token,
            'user'    => $user->only(['id', 'name', 'email', 'phone', 'birth_date', 'role']),
        ], 201);
    }

    /**
     * Login de usuario.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email', 'max:255'],
            'password' => ['required'],
        ]);

        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            return response()->json([
                'message' => 'Credenciales incorrectas'
            ], 401);
        }

        $user = $request->user();

        // Token con expiración (mejor práctica)
        $token = $user->createToken(
            'spa-token',
            ['*'],
            now()->addDays(7)
        )->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión exitoso',
            'token'   => $token,
            'user'    => $user->only(['id', 'name', 'email', 'phone', 'birth_date', 'role']),
        ]);
    }

    /**
     * Obtener datos del usuario autenticado.
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => $user->only(['id', 'name', 'email', 'phone', 'birth_date', 'role', 'created_at']),
        ]);
    }

    /**
     * Cerrar sesión (revocar token actual).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente'
        ]);
    }
}
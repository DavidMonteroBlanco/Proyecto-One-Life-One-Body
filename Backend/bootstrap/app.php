<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'admin' => \App\Http\Middleware\IsAdmin::class,
        ]);

        // La API no redirige invitados a una pantalla de login: responde 401.
        $middleware->redirectGuestsTo(fn () => null);

        // ══════════════════════════════════════════════════════════
        // Límite de peticiones en TODA la API.
        // Sin esta llamada el limitador 'api' de AppServiceProvider
        // queda definido pero nunca se aplica, y solo estaban
        // protegidas las rutas con throttle: explícito.
        // ══════════════════════════════════════════════════════════
        $middleware->throttleApi();

        // ══════════════════════════════════════════════════════════
        // Estos cuatro existían en el proyecto pero no estaban
        // registrados en ningún sitio: eran código muerto.
        //
        // Van en la pila global y no en el grupo 'api' para que
        // LogSecurity envuelva también al middleware de autenticación:
        // los 401 y los 429 llegan como excepción, y desde dentro del
        // grupo no se llegaban a ver.
        // ══════════════════════════════════════════════════════════
        $middleware->append([
            \App\Http\Middleware\SecurityHeaders::class,
            \App\Http\Middleware\LogSecurity::class,
            \App\Http\Middleware\ValidateEnv::class,
            \App\Http\Middleware\ForceJsonResponse::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Los errores de la API salen siempre como JSON, nunca como la
        // página HTML de Laravel (que con APP_DEBUG=true llegaría a
        // mostrar rutas del servidor y fragmentos de código).
        //
        // Se limita a api/*: las rutas web sirven la aplicación de React
        // y ahí la respuesta tiene que poder ser HTML.
        $exceptions->shouldRenderJsonWhen(
            fn ($request) => $request->is("api/*") || $request->expectsJson()
        );
    })
    ->create();

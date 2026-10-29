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
        /*
         * ══════════════════════════════════════════════════════════
         * EL PROXY DEL HOSTING
         *
         * Render, Railway y Hostinger ponen un balanceador delante y
         * terminan ellos el HTTPS. Sin esto, Laravel ve SIEMPRE la IP
         * del proxy en lugar de la del visitante, y eso rompe dos cosas:
         *
         *   1. Los limitadores de peticiones van por IP. Con una sola IP
         *      para todo el mundo, los 5 intentos de acceso cada 15
         *      minutos se los reparten TODOS los visitantes juntos: basta
         *      que alguien falle cinco veces para dejar al resto fuera,
         *      y la contraseña correcta también empieza a dar error.
         *
         *   2. Laravel cree que la petición llegó por HTTP y genera
         *      enlaces con http:// dentro de los emails.
         *
         * Se confía en cualquier proxy ('*') porque en estas plataformas
         * su IP no es fija ni se publica. Es seguro aquí porque la
         * aplicación solo es accesible a través de ese balanceador: nadie
         * puede llegar al contenedor por su cuenta y falsear la cabecera.
         * ══════════════════════════════════════════════════════════
         */
        $middleware->trustProxies(at: '*');

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

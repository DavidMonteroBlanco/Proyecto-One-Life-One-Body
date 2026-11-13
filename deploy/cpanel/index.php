<?php

/**
 * ══════════════════════════════════════════════════════════
 * CONTROLADOR FRONTAL PARA cPANEL  (Namecheap, Hostinger…)
 *
 * Este fichero va en public_html/ y sustituye al index.php que
 * trae Laravel en su carpeta public/.
 *
 * Estructura esperada en el servidor:
 *
 *   /home/USUARIO/
 *   ├── olob/              ← la aplicación, FUERA de la web
 *   │   ├── app/ bootstrap/ config/ database/ routes/
 *   │   ├── storage/ vendor/
 *   │   └── .env
 *   └── public_html/       ← lo único accesible por internet
 *       ├── index.php      ← este fichero
 *       ├── .htaccess
 *       ├── index.html     ← el React ya construido
 *       └── assets/ img/ videos/ favicon.ico robots.txt
 *
 * Por qué la aplicación va fuera de public_html: ahí dentro está
 * el .env con la contraseña de la base de datos y las claves de
 * API. Si vive en una carpeta pública, basta acertar con la URL
 * para descargarlo. Fuera, no hay forma de llegar.
 *
 * Lo único que cambia respecto al index.php normal de Laravel es
 * la ruta: en vez de '..' apunta a la carpeta de la aplicación.
 * ══════════════════════════════════════════════════════════
 */

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/*
 * Ajusta esto si llamas a la carpeta de otra forma.
 *
 * '/../olob' significa: sube un nivel desde public_html y entra en
 * olob. Si la pones en otro sitio, cámbialo solo aquí.
 */
$aplicacion = __DIR__ . '/../olob';

/*
 * Un aviso claro vale más que un error de PHP en bruto: si la ruta
 * no es la correcta, lo normal es ver una pantalla en blanco o una
 * traza con rutas del servidor. Esto dice qué pasa y dónde mirar.
 */
if (! is_file($aplicacion . '/vendor/autoload.php')) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    exit(
        "No encuentro la aplicación.\n\n"
        . "Esperaba: {$aplicacion}/vendor/autoload.php\n\n"
        . "Revisa dos cosas:\n"
        . "  1. Que la carpeta de la aplicación esté donde dice la variable\n"
        . "     \$aplicacion de public_html/index.php\n"
        . "  2. Que hayas subido vendor/, o ejecutado composer install en el servidor\n"
    );
}

if (file_exists($mantenimiento = $aplicacion . '/storage/framework/maintenance.php')) {
    require $mantenimiento;
}

require $aplicacion . '/vendor/autoload.php';

$app = require_once $aplicacion . '/bootstrap/app.php';

/*
 * Laravel da por hecho que su carpeta pública es <aplicación>/public.
 * Aquí no lo es: la pública es ESTA, public_html. Sin corregirlo,
 * public_path() apuntaría a una carpeta que no sirve nadie y se
 * romperían dos cosas concretas:
 *
 *   - SpaController buscaría el index.html de React donde no está,
 *     así que toda la web respondería con el aviso de "frontend no
 *     construido" en vez de con la página.
 *   - Entregas no encontraría img/logo-olob.jpg y los PDF de dietas
 *     y entrenos saldrían sin el logo.
 *
 * __DIR__ es public_html, que es justo la respuesta correcta.
 */
$app->usePublicPath(__DIR__);

$app->handleRequest(Request::capture());

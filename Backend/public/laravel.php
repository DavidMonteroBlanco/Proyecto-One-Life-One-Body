<?php

/**
 * Gateway de Laravel para cPanel.
 *
 * Este archivo vive en public_html/ y redirige las peticiones /api/* y /sanctum/*
 * al backend de Laravel que está instalado en public_html/backend/.
 *
 * Estructura en cPanel:
 *   public_html/laravel.php   ← este archivo
 *   public_html/backend/      ← carpeta Laravel completa
 */

define('LARAVEL_START', microtime(true));

$backendPath = __DIR__ . '/backend';

if (file_exists($maintenance = $backendPath . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $backendPath . '/vendor/autoload.php';

$app = require_once $backendPath . '/bootstrap/app.php';

$app->handleRequest(Illuminate\Http\Request::capture());

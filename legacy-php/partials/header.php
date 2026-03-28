<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$isLoggedIn = isset($_SESSION['usuario_id']);
$rol = $_SESSION['rol'] ?? null; 
$nombre = $_SESSION['nombre'] ?? null;

$current = basename(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
function active($file, $current) {
    return $file === $current ? 'active' : '';
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>One Life One Body</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>

<div class="page-bg" aria-hidden="true"></div>

<nav class="navbar navbar-expand-lg fixed-top navbar-dark">
    <div class="container">
        <a class="navbar-brand" href="index.php">
            <img src="assets/one-life-one-body-logo-.png.jpeg"
                 alt="One Life One Body Fitness Center"
                 class="navbar-logo">
        </a>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="menu">
            <ul class="navbar-nav ms-auto align-items-lg-center">
                <li class="nav-item"><a class="nav-link" href="index.php#servicios">Servicios</a></li>
                <li class="nav-item"><a class="nav-link" href="index.php#metodo">Método</a></li>
                <li class="nav-item"><a class="nav-link" href="index.php#contacto">Contacto</a></li>

                <li class="nav-item">
                    <a class="nav-link <?= active('colaboradores.php', $current) ?>" href="colaboradores.php">Colaboradores</a>
                </li>

                <li class="nav-item ms-lg-3">
                    <?php if (!$isLoggedIn): ?>
                        <a class="btn btn-outline-light px-4 me-2" href="registro.php">
                            Registrarse
                        </a>
                        <a class="btn btn-primary px-4" href="login.php">
                            Acceso clientes
                        </a>
                    <?php else: ?>
                        <a class="btn btn-outline-light px-4 me-2" href="panel.php">
                            Panel<?= $nombre ? (': ' . htmlspecialchars($nombre)) : '' ?>
                        </a>
                        <a class="btn btn-primary px-4" href="logout.php">
                            Cerrar sesión
                        </a>
                    <?php endif; ?>
                </li>
            </ul>
        </div>
    </div>
</nav>

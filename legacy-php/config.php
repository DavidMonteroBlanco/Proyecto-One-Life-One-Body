<?php
$host = "localhost";
$db   = "onelifeonebody";
$user = "onebody_user";
$pass = "onebody123";

try {
    $dsn = "mysql:host={$host};dbname={$db};charset=utf8mb4";

    $conexion = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

} catch (PDOException $e) {
    die("Error de conexión con la base de datos.");
}
$API_BASE = "http://127.0.0.1:8000/api";

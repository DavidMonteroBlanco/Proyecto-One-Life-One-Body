<?php
session_start();
require 'config.php';

if (!isset($_SESSION['usuario_id']) || $_SESSION['rol'] !== 'admin') {
    header("Location: panel.php");
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $sql = "INSERT INTO seguimientos (usuario_id, fecha, peso, grasa, musculo)
            VALUES (:usuario_id, :fecha, :peso, :grasa, :musculo)";

    $stmt = $conexion->prepare($sql);

    $stmt->execute([
        ':usuario_id' => $_POST['usuario_id'],
        ':fecha' => $_POST['fecha'],
        ':peso' => $_POST['peso'],
        ':grasa' => $_POST['grasa'],
        ':musculo' => $_POST['musculo']
    ]);

    header("Location: seguimiento_admin.php");
    exit;
}

header("Location: seguimiento_admin.php");
exit;

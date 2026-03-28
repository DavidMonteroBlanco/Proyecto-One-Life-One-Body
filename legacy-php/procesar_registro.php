<?php
require 'config.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $nombre = trim($_POST['nombre'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';



    $securePassword =
        strlen($password) >= 8 &&                
        preg_match('/[A-Z]/', $password) &&      
        preg_match('/[0-9]/', $password) &&      
        preg_match('/[^A-Za-z0-9]/', $password); 

    if (!$securePassword) {
        header("Location: registro.php?error=security");
        exit;
    }



    $passwordHash = password_hash($password, PASSWORD_DEFAULT);



    $sql = "INSERT INTO usuarios (nombre, email, password, rol)
            VALUES (:nombre, :email, :password, 'user')";

    $stmt = $conexion->prepare($sql);

    try {
        $stmt->execute([
            ':nombre' => $nombre,
            ':email' => $email,
            ':password' => $passwordHash
        ]);

        header("Location: login.php?registro=ok");
        exit;

    } catch (PDOException $e) {

        if ((int)$e->getCode() === 23000) {
            header("Location: registro.php?error=email");
            exit;
        }

        echo "Error: " . $e->getMessage();
        exit;
    }
}

header("Location: registro.php");
exit;

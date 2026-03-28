<?php
require 'config.php';
require __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$mailCfg = require __DIR__ . '/mail_config.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: forgot_password.php");
    exit;
}

$email = trim($_POST['email'] ?? '');
if ($email === '') {
    header("Location: forgot_password.php");
    exit;
}

/*
  Por seguridad, siempre respondemos igual aunque el email no exista.
*/
$redirectOk = "Location: forgot_password.php?sent=1";

$stmt = $conexion->prepare("SELECT id FROM usuarios WHERE email = :email LIMIT 1");
$stmt->execute([':email' => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    header($redirectOk);
    exit;
}

$token = bin2hex(random_bytes(32));
$tokenHash = password_hash($token, PASSWORD_DEFAULT);
$expiresAt = (new DateTime('+60 minutes'))->format('Y-m-d H:i:s');

$del = $conexion->prepare("DELETE FROM password_resets WHERE email = :email");
$del->execute([':email' => $email]);

$ins = $conexion->prepare("
    INSERT INTO password_resets (email, token_hash, expires_at)
    VALUES (:email, :token_hash, :expires_at)
");
$ins->execute([
    ':email' => $email,
    ':token_hash' => $tokenHash,
    ':expires_at' => $expiresAt
]);

$baseUrl = "http://localhost/one_life_one_body"; // ajusta si tu carpeta cambia
$link = $baseUrl . "/reset_password.php?email=" . urlencode($email) . "&token=" . urlencode($token);

try {
    $mail = new PHPMailer(true);
    $mail->isSMTP();

    $mail->Host = $mailCfg['host'];              
    $mail->SMTPAuth = true;
    $mail->Username = $mailCfg['username'];
    $mail->Password = $mailCfg['password'];
    $mail->Port = (int)$mailCfg['port'];         

    // Evitar CRAM-MD5 / STARTTLS automático (mejor compatibilidad)
    $mail->AuthType = 'LOGIN';
    $mail->SMTPAutoTLS = false;
    $mail->SMTPSecure = false;

    $mail->setFrom($mailCfg['from_email'], $mailCfg['from_name']);
    $mail->addAddress($email);

    $mail->isHTML(true);
    $mail->Subject = "Recuperar contraseña - One Life One Body";
    $mail->Body = "
        <p>Hola,</p>
        <p>Has solicitado cambiar tu contraseña.</p>
        <p>
            <a href='{$link}' style='display:inline-block;padding:10px 15px;background:#0d6efd;color:#fff;text-decoration:none;border-radius:6px;'>
                Cambiar contraseña
            </a>
        </p>
        <p>Este enlace es válido durante 60 minutos.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
    ";

    $mail->AltBody = "Has solicitado cambiar tu contraseña. Abre este enlace (60 min): $link";

    $mail->send();

} catch (Exception $e) {
}

header($redirectOk);
exit;

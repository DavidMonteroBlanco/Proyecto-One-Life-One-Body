<?php
require 'config.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
  header("Location: login.php");
  exit;
}

$email = trim($_POST['email'] ?? '');
$token = $_POST['token'] ?? '';
$password = $_POST['password'] ?? '';
$passwordConfirm = $_POST['password_confirm'] ?? '';

if ($email === '' || $token === '') {
  header("Location: forgot_password.php");
  exit;
}

if ($password !== $passwordConfirm) {
  header("Location: reset_password.php?email=" . urlencode($email) . "&token=" . urlencode($token));
  exit;
}

$securePassword =
  strlen($password) >= 8 &&
  preg_match('/[A-Z]/', $password) &&
  preg_match('/[0-9]/', $password) &&
  preg_match('/[^A-Za-z0-9]/', $password);

if (!$securePassword) {
  header("Location: reset_password.php?email=" . urlencode($email) . "&token=" . urlencode($token) . "&error=security");
  exit;
}

$stmt = $conexion->prepare("
  SELECT token_hash, expires_at
  FROM password_resets
  WHERE email = :email
  LIMIT 1
");
$stmt->execute([':email' => $email]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
  header("Location: forgot_password.php");
  exit;
}

$now = new DateTime();
$exp = new DateTime($row['expires_at']);

if ($now > $exp || !password_verify($token, $row['token_hash'])) {
  header("Location: forgot_password.php");
  exit;
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);

$upd = $conexion->prepare("
  UPDATE usuarios
  SET password = :password
  WHERE email = :email
  LIMIT 1
");
$upd->execute([
  ':password' => $passwordHash,
  ':email' => $email
]);

$del = $conexion->prepare("DELETE FROM password_resets WHERE email = :email");
$del->execute([':email' => $email]);

header("Location: login.php?reset=ok");
exit;

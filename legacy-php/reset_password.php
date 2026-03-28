<?php
require 'config.php';

$email = trim($_GET['email'] ?? '');
$token = $_GET['token'] ?? '';

$valid = false;

if ($email && $token) {
  $stmt = $conexion->prepare("
    SELECT token_hash, expires_at
    FROM password_resets
    WHERE email = :email
    LIMIT 1
  ");
  $stmt->execute([':email' => $email]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);

  if ($row) {
    $now = new DateTime();
    $exp = new DateTime($row['expires_at']);

    if ($now <= $exp && password_verify($token, $row['token_hash'])) {
      $valid = true;
    }
  }
}

require_once __DIR__ . '/partials/header.php';
?>

<div class="auth-page">
  <div class="auth-card">
    <h2>Nueva contraseña</h2>

    <?php if (!$valid): ?>
      <div class="alert alert-danger">
        El enlace no es válido o ha caducado.
      </div>
      <div class="auth-links">
        <a href="forgot_password.php">Volver</a>
        <a href="index.php">Inicio</a>
      </div>
    <?php else: ?>

      <?php if (!empty($_GET['error']) && $_GET['error'] === 'security'): ?>
        <div class="alert alert-danger">
          La contraseña no cumple los requisitos de seguridad.
        </div>
      <?php endif; ?>

      <form action="actualizar_password.php" method="POST">
        <input type="hidden" name="email" value="<?php echo htmlspecialchars($email); ?>">
        <input type="hidden" name="token" value="<?php echo htmlspecialchars($token); ?>">

        <label class="form-label">Nueva contraseña</label>
        <input class="form-control mb-3" type="password" name="password" required>

        <label class="form-label">Repetir nueva contraseña</label>
        <input class="form-control mb-4" type="password" name="password_confirm" required>

        <button class="btn btn-primary w-100" type="submit">Guardar contraseña</button>
      </form>

      <div class="auth-links">
        <a href="login.php">Volver a login</a>
        <a href="index.php">Inicio</a>
      </div>

    <?php endif; ?>
  </div>
</div>

<?php require_once __DIR__ . '/partials/footer.php'; ?>

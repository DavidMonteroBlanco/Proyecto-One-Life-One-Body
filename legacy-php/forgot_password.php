<?php require_once __DIR__ . '/partials/header.php'; ?>

<div class="auth-page">
  <div class="auth-card">
    <h2>Recuperar contraseña</h2>

    <?php if (!empty($_GET['sent'])): ?>
      <div class="alert alert-success">
        Si el email existe, te hemos enviado un enlace para cambiar la contraseña.
      </div>
    <?php endif; ?>

    <p class="mb-3">
      Escribe tu email y recibirás un enlace seguro para cambiar tu contraseña.
    </p>

    <form action="enviar_reset.php" method="POST">
      <label class="form-label">Email</label>
      <input class="form-control mb-4" type="email" name="email" required>

      <button class="btn btn-primary w-100" type="submit">Enviar enlace</button>
    </form>

    <div class="auth-links">
      <a href="login.php">Volver a login</a>
      <a href="index.php">Volver a inicio</a>
    </div>
  </div>
</div>

<?php require_once __DIR__ . '/partials/footer.php'; ?>

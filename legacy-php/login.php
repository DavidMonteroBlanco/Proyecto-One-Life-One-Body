<?php
require_once __DIR__ . '/partials/header.php';
?>

<div class="auth-page">
    <div class="auth-card">

        <h2 class="mb-3">Iniciar sesión</h2>

        <?php if (!empty($_GET['error'])): ?>
            <div class="alert alert-danger">Email o contraseña incorrectos.</div>
        <?php endif; ?>

        <?php if (!empty($_GET['registro']) && $_GET['registro'] === 'ok'): ?>
            <div class="alert alert-success">Registro correcto. Ya puedes iniciar sesión.</div>
        <?php endif; ?>

        <?php if (!empty($_GET['reset']) && $_GET['reset'] === 'ok'): ?>
            <div class="alert alert-success">Contraseña actualizada. Ya puedes iniciar sesión.</div>
        <?php endif; ?>

        <form action="procesar_login.php" method="POST">

            <label class="form-label">Email</label>
            <input class="form-control mb-3" type="email" name="email" required>

            <label class="form-label">Contraseña</label>
            <input class="form-control mb-2" type="password" name="password" required>

            <div class="mb-3">
                <a href="forgot_password.php">¿Has olvidado tu contraseña?</a>
            </div>

            <button class="btn btn-primary w-100" type="submit">
                Entrar
            </button>
        </form>

        <div class="auth-links mt-3">
            <a href="registro.php">Crear cuenta</a>
            <a href="index.php">Volver a inicio</a>
        </div>

    </div>
</div>

<?php require_once __DIR__ . '/partials/footer.php'; ?>

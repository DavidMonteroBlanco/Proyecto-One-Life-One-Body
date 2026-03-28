<?php require_once __DIR__ . '/partials/header.php'; ?>

<div class="auth-page">
    <div class="auth-card">
        <h2>Registro de usuario</h2>

        <?php if (!empty($_GET['error'])): ?>
            <div class="alert alert-danger">
                La contraseña no cumple los requisitos de seguridad.
            </div>
        <?php endif; ?>

        <form action="procesar_registro.php" method="POST" id="registerForm">

            <label class="form-label">Nombre</label>
            <input class="form-control mb-3" type="text" name="nombre" required>

            <label class="form-label">Email</label>
            <input class="form-control mb-3" type="email" name="email" required>

            <label class="form-label">Contraseña</label>
            <input class="form-control mb-2" type="password" name="password" id="password" required>

            <div class="password-rules">
                <span id="rule-length" class="invalid">• Mínimo 8 caracteres</span>
                <span id="rule-upper" class="invalid">• Al menos una mayúscula</span>
                <span id="rule-number" class="invalid">• Al menos un número</span>
                <span id="rule-special" class="invalid">• Al menos un carácter especial</span>
            </div>

            <label class="form-label">Repetir contraseña</label>
            <input class="form-control mb-4" type="password" id="password_confirm" required>

            <button class="btn btn-primary w-100" type="submit" id="submitBtn" disabled>
                Registrarse
            </button>
        </form>

        <div class="auth-links">
            <a href="login.php">Ya tengo cuenta</a>
            <a href="index.php">Volver a inicio</a>
        </div>
    </div>
</div>

<script>
const password = document.getElementById('password');
const confirmPassword = document.getElementById('password_confirm');
const submitBtn = document.getElementById('submitBtn');

const rules = {
    length: document.getElementById('rule-length'),
    upper: document.getElementById('rule-upper'),
    number: document.getElementById('rule-number'),
    special: document.getElementById('rule-special'),
};

function validatePassword() {
    const value = password.value;

    const isLength = value.length >= 8;
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);
    const match = value === confirmPassword.value && value !== "";

    rules.length.className = isLength ? 'valid' : 'invalid';
    rules.upper.className = hasUpper ? 'valid' : 'invalid';
    rules.number.className = hasNumber ? 'valid' : 'invalid';
    rules.special.className = hasSpecial ? 'valid' : 'invalid';

    submitBtn.disabled = !(isLength && hasUpper && hasNumber && hasSpecial && match);
}

password.addEventListener('input', validatePassword);
confirmPassword.addEventListener('input', validatePassword);
</script>

<?php require_once __DIR__ . '/partials/footer.php'; ?>

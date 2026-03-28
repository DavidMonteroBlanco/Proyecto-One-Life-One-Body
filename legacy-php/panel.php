<?php
session_start();

if (!isset($_SESSION['usuario_id'])) {
    header("Location: login.php");
    exit;
}

require_once __DIR__ . '/partials/header.php';
?>

<section class="section">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="service-card">
                    <h2 class="mb-2">Bienvenido, <?php echo htmlspecialchars($_SESSION['nombre']); ?></h2>
                    <p class="mb-4"><strong>Rol:</strong> <?php echo htmlspecialchars($_SESSION['rol']); ?></p>

                    <div class="list-group">
                        <a class="list-group-item list-group-item-action" href="panel.php">Inicio</a>

                        <?php if ($_SESSION['rol'] === 'user'): ?>
                            <a class="list-group-item list-group-item-action" href="seguimiento_usuario.php">Mi seguimiento</a>
                        <?php endif; ?>

                        <?php if ($_SESSION['rol'] === 'admin'): ?>
                            <a class="list-group-item list-group-item-action" href="seguimiento_admin.php">Seguimiento (Entrenador)</a>
                        <?php endif; ?>

                        <a class="list-group-item list-group-item-action text-danger" href="logout.php">Cerrar sesión</a>
                    </div>

                    <div class="mt-4">
                        <a href="index.php">Volver a la web</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<?php require_once __DIR__ . '/partials/footer.php'; ?>

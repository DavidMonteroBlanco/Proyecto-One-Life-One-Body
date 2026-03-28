<?php
session_start();
require 'config.php';

if (!isset($_SESSION['usuario_id']) || $_SESSION['rol'] !== 'admin') {
    header("Location: panel.php");
    exit;
}

$usuarios = $conexion->query("SELECT id, nombre, email FROM usuarios ORDER BY nombre")
                     ->fetchAll(PDO::FETCH_ASSOC);

require_once __DIR__ . '/partials/header.php';
?>

<section class="section">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-8">
                <div class="service-card">
                    <h2 class="mb-3">Nuevo pesaje</h2>

                    <form action="guardar_seguimiento.php" method="POST">
                        <label class="form-label">Usuario</label>
                        <select class="form-select mb-3" name="usuario_id" required>
                            <?php foreach ($usuarios as $u): ?>
                                <option value="<?php echo (int)$u['id']; ?>">
                                    <?php echo htmlspecialchars($u['nombre'] . " (" . $u['email'] . ")"); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>

                        <label class="form-label">Fecha</label>
                        <input class="form-control mb-3" type="date" name="fecha" required>

                        <label class="form-label">Peso (kg)</label>
                        <input class="form-control mb-3" type="number" step="0.01" name="peso" required>

                        <label class="form-label">% Grasa corporal</label>
                        <input class="form-control mb-3" type="number" step="0.01" name="grasa" required>

                        <label class="form-label">% Músculo</label>
                        <input class="form-control mb-4" type="number" step="0.01" name="musculo" required>

                        <button class="btn btn-primary w-100" type="submit">Guardar pesaje</button>
                    </form>

                    <div class="mt-3 d-flex justify-content-between">
                        <a href="panel.php">Volver al panel</a>
                        <a href="index.php">Volver a la web</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<?php require_once __DIR__ . '/partials/footer.php'; ?>

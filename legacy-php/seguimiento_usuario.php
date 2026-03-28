<?php
session_start();
require 'config.php';

if (!isset($_SESSION['usuario_id'])) {
    header("Location: login.php");
    exit;
}

$usuario_id = $_SESSION['usuario_id'];

$sql = "SELECT fecha, peso, grasa, musculo
        FROM seguimientos
        WHERE usuario_id = :usuario_id
        ORDER BY fecha DESC";

$stmt = $conexion->prepare($sql);
$stmt->execute([':usuario_id' => $usuario_id]);
$registros = $stmt->fetchAll(PDO::FETCH_ASSOC);

require_once __DIR__ . '/partials/header.php';
?>

<section class="section">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-10">
                <div class="service-card">
                    <h2 class="mb-3">Mi seguimiento</h2>

                    <?php if (empty($registros)): ?>
                        <div class="alert alert-info mb-4">No hay registros todavía.</div>
                    <?php else: ?>
                        <div class="table-responsive">
                            <table class="table table-striped align-middle">
                                <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Peso (kg)</th>
                                    <th>% Grasa</th>
                                    <th>% Músculo</th>
                                </tr>
                                </thead>
                                <tbody>
                                <?php foreach ($registros as $r): ?>
                                    <tr>
                                        <td><?php echo htmlspecialchars($r['fecha']); ?></td>
                                        <td><?php echo htmlspecialchars($r['peso']); ?></td>
                                        <td><?php echo htmlspecialchars($r['grasa']); ?></td>
                                        <td><?php echo htmlspecialchars($r['musculo']); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php endif; ?>

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

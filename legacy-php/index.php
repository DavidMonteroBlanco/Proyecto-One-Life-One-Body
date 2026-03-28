<?php
require_once __DIR__ . "/config.php";
require_once __DIR__ . "/api_client.php";

$services = api_get("public/services");
$method   = api_get("public/method");
$site     = api_get("public/site");

$phone     = api_site_value($site, "phone");
$email     = api_site_value($site, "email");
$address   = api_site_value($site, "address");
$instagram = api_site_value($site, "instagram");

require_once __DIR__ . "/partials/header.php";
?>

<section class="hero">
  <div class="container text-center">
    <h1>Transforma tu cuerpo.<br>Transforma tu vida.</h1>
    <p class="lead mt-3">
      Entrenamiento personalizado, nutrición guiada y seguimiento profesional.
    </p>

    <a href="#servicios" class="btn btn-outline-light btn-lg mt-4">
      Descubre el método
    </a>

    <a href="colaboradores.php" class="btn btn-outline-light btn-lg mt-4">
      Conoce a nuestros colaboradores
    </a>
  </div>
</section>

<section id="servicios" class="section bg-light">
  <div class="container">
    <div class="section-title text-center">
      <h2>Nuestros Servicios</h2>
      <p>Todo lo que necesitas para alcanzar tus objetivos</p>
    </div>

    <div class="row g-4 mt-4">
      <?php if (empty($services)): ?>
        <div class="col-12">
          <div class="service-card">
            <h3>Servicios</h3>
            <p>Aún no hay servicios configurados.</p>
          </div>
        </div>
      <?php else: ?>
        <?php foreach ($services as $s): ?>
          <div class="col-md-4">
            <div class="service-card">
              <h3><?= htmlspecialchars($s["title"] ?? "") ?></h3>
              <p><?= htmlspecialchars($s["description"] ?? "") ?></p>
            </div>
          </div>
        <?php endforeach; ?>
      <?php endif; ?>
    </div>
  </div>
</section>

<section id="metodo" class="section">
  <div class="container">
    <div class="row align-items-center g-5">
      <div class="col-md-6">
        <h2>Nuestro Método</h2>
        <p>
          En One Life One Body creemos en un enfoque integral:
          entrenamiento, nutrición y constancia.
        </p>

        <?php if (empty($method)): ?>
          <p class="text-muted">Aún no hay pasos del método configurados.</p>
        <?php else: ?>
          <ul class="method-list">
            <?php foreach ($method as $m): ?>
              <li>
                <strong><?= htmlspecialchars($m["title"] ?? "") ?>:</strong>
                <?= htmlspecialchars($m["description"] ?? "") ?>
              </li>
            <?php endforeach; ?>
          </ul>
        <?php endif; ?>
      </div>

      <div class="col-md-6">
        <div class="video-wrapper">
          <video
            class="trainer-video"
            src="assets/trainer.mp4"
            autoplay
            muted
            loop
            playsinline>
          </video>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="final-quote-section">
  <div class="container">
    <div class="row align-items-center g-5">

      <div class="col-md-6">
        <h2 class="final-quote">
          Quizá no hagamos campeones,<br>
          <span>pero hacemos gente feliz.</span>
        </h2>
      </div>

      <div class="col-md-6">
        <div class="final-image-wrapper">
          <img
            src="assets/final-image.jpeg"
            alt="One Life One Body motivación"
            class="final-image"
          >
        </div>
      </div>

    </div>
  </div>
</section>

<section id="contacto" class="section bg-light">
  <div class="container">
    <div class="section-title text-center">
      <h2>Contacto</h2>
      <p>Escríbenos y te respondemos lo antes posible</p>
    </div>

    <div class="row justify-content-center mt-4">
      <div class="col-lg-6">
        <div class="service-card">
          <p class="mb-2"><strong>Instagram:</strong> <?= htmlspecialchars($instagram ?: "one.life.one.body.benidorm") ?></p>
          <p class="mb-2"><strong>Dirección:</strong> <?= htmlspecialchars($address ?: "Benidorm") ?></p>
          <p class="mb-2"><strong>Teléfono:</strong> <?= htmlspecialchars($phone ?: "-") ?></p>
          <p class="mb-0"><strong>Email:</strong> <?= htmlspecialchars($email ?: "dabukycoach@gmail.com") ?></p>
        </div>
      </div>
    </div>
  </div>
</section>

<?php require_once __DIR__ . "/partials/footer.php"; ?>

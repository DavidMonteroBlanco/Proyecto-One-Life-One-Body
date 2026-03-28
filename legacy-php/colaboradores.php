<?php require_once __DIR__ . '/partials/header.php'; ?>
<?php
require_once __DIR__ . "/config.php";
require_once __DIR__ . "/api_client.php";


$collabs = api_get("public/collaborators");


$existing = [
  "protectora de animales de benidorm",
  "di angelo tattoo",
  "fitness world shop",
];

function h($v) {
  return htmlspecialchars((string)$v, ENT_QUOTES, "UTF-8");
}

function safe_bg($url, $fallback = "assets/final-image.jpeg") {
  $u = trim((string)$url);
  if ($u === "") return $fallback;
  return $u;
}
?>

<style>
 
.collab-block { display:flex; gap:24px; align-items:stretch; margin: 34px 0; }
.collab-block.reverse { flex-direction: row-reverse; }
.collab-image { flex: 1; min-height: 320px; border-radius: 16px; overflow:hidden; }
.collab-image .img-bg { width:100%; height:100%; background-size:cover; background-position:center; }
.collab-content { flex: 1; color: #eaeaea; }
.collab-content h2 { margin:0; font-size: 38px; letter-spacing: .2px; }
.collab-content .lead { opacity: .9; line-height: 1.55; }
.collab-subtitle { margin-top: 10px; font-weight: 700; opacity: .9; }
</style>

<section class="hero-collabs">
  <div class="container">
    <h1>Colaboradores</h1>
    <p class="lead">
      Estas son las empresas y proyectos con los que colaboramos en One Life One Body.
    </p>
  </div>
</section>

<section class="section">
  <div class="container">


    <div class="collab-block">
      <div class="collab-image">
        <div class="img-bg" style="background-image: url('assets/protectora.png');"></div>
      </div>
      <div class="collab-content">
        <h2>Protectora de Animales de Benidorm</h2>
        <p class="lead">
          Creemos firmemente que la fuerza no solo se mide en el cuerpo, sino también
          en el corazón. Por eso colaboramos con la Protectora de Animales de Benidorm,
          apoyando la adopción responsable, el respeto y el bienestar animal.
        </p>
      </div>
    </div>

    <div class="collab-block reverse">
      <div class="collab-image">
        <div class="img-bg" style="background-image: url('assets/angelo.jpg');"></div>
      </div>
      <div class="collab-content">
        <h2>Di Angelo Tattoo</h2>
        <p class="lead">
          El cuerpo es un lienzo y cada historia merece ser contada. Di Angelo Tattoo
          representa arte, identidad y carácter, valores que encajan perfectamente con
          nuestra filosofía de transformación personal.
        </p>
      </div>
    </div>

    <div class="collab-block">
      <div class="collab-image">
        <div class="img-bg" style="background-image: url('assets/asier.jpg');"></div>
      </div>
      <div class="collab-content">
        <h2>Fitness World Shop</h2>
        <p class="lead">
          El entrenamiento también se construye con el material adecuado. Fitness World Shop
          nos apoya con suplementación y equipamiento para garantizar el máximo rendimiento,
          siempre con asesoramiento profesional.
        </p>
      </div>
    </div>


    <?php
      if (!is_array($collabs)) $collabs = [];

      $dynamic = [];
      foreach ($collabs as $c) {
        $name = strtolower(trim((string)($c["name"] ?? "")));
        if ($name === "") continue;
        if (in_array($name, $existing, true)) continue;
        $dynamic[] = $c;
      }

      usort($dynamic, function($a, $b) {
        $aa = (int)($a["sort_order"] ?? 9999);
        $bb = (int)($b["sort_order"] ?? 9999);
        return $aa <=> $bb;
      });

      $i = 0;
      foreach ($dynamic as $c):
        $reverse = ($i % 2 === 1) ? " reverse" : "";
        $title = $c["name"] ?? "";
        $role  = $c["role"] ?? "";
        $bio   = $c["bio"] ?? "";
        $img   = safe_bg($c["image_url"] ?? "", "assets/final-image.jpeg");
    ?>

      <div class="collab-block<?= $reverse ?>">
        <div class="collab-image">
          <div class="img-bg" style="background-image: url('<?= h($img) ?>');"></div>
        </div>

        <div class="collab-content">
          <h2><?= h($title) ?></h2>

          <?php if (trim($role) !== ""): ?>
            <div class="collab-subtitle"><?= h($role) ?></div>
          <?php endif; ?>

          <p class="lead">
            <?= nl2br(h($bio)) ?>
          </p>
        </div>
      </div>

    <?php
        $i++;
      endforeach;

      if (count($dynamic) === 0):
    ?>
      <div style="margin-top: 28px; opacity:.85;">
        <em>No hay colaboradores nuevos en BD todavía. (Los fijos se muestran arriba.)</em>
      </div>
    <?php endif; ?>

  </div>
</section>

<?php require_once __DIR__ . '/partials/footer.php'; ?>

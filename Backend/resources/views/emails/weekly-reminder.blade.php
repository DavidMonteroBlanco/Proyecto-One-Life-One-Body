<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #0d1515; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrap { max-width: 520px; margin: 0 auto; background: #111b1b; }
    .header { background: #0d1515; padding: 28px 30px; text-align: center; border-bottom: 2px solid #7ee8e8; }
    .header h1 { color: #fff; font-size: 18px; letter-spacing: 3px; margin: 0; }
    .header span { color: #7ee8e8; }
    .body { padding: 30px; color: #ccc; font-size: 14px; line-height: 1.7; }
    .body h2 { color: #fff; font-size: 20px; margin: 0 0 12px; }
    .body .accent { color: #7ee8e8; font-weight: bold; }
    .stat-box { background: #0d1515; border: 1px solid #1a2a2a; border-radius: 10px; padding: 16px 20px; margin: 16px 0; text-align: center; }
    .stat-box .label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
    .stat-box .value { font-size: 28px; font-weight: bold; color: #7ee8e8; margin-top: 4px; }
    .cta { display: inline-block; background: #7ee8e8; color: #0d1515; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 14px; letter-spacing: 1px; margin: 20px 0; }
    .footer { padding: 20px 30px; text-align: center; font-size: 11px; color: #555; border-top: 1px solid #1a2a2a; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>ONE LIFE <span>ONE BODY</span></h1>
    </div>

    <div class="body">
      <h2>Hola {{ $user->name }}!</h2>

      <p>Es hora de tu <span class="accent">pesaje semanal</span>. Recuerda que la constancia es lo que marca la diferencia.</p>

      @if($lastRecord)
        <div class="stat-box">
          <div class="label">Tu ultimo peso registrado</div>
          <div class="value">{{ number_format($lastRecord->weight_kg, 1) }} kg</div>
          @if($lastRecord->fat_percentage)
            <div class="label" style="margin-top: 8px;">Grasa: {{ number_format($lastRecord->fat_percentage, 1) }}%</div>
          @endif
        </div>
        <p>Tu último pesaje fue el <span class="accent">{{ \Carbon\Carbon::parse($lastRecord->recorded_at)->format('d/m/Y') }}</span>.</p>
      @else
        <p>Todavía no tienes pesajes registrados. Contacta con tu entrenador para que registre tu primer peso.</p>
      @endif

      <p>Pésate por la mañana en ayunas para obtener datos consistentes. Tu entrenador actualizará tu ficha con los nuevos datos.</p>

      <p style="text-align: center;">
        <a href="https://wa.me/34631986391?text=Hola%20Muky!%20Ya%20me%20he%20pesado%20esta%20semana" class="cta">
          Enviar peso por WhatsApp
        </a>
      </p>
    </div>

    <div class="footer">
      One Life One Body · Fitness Center · Benidorm, Alicante<br>
      Si no quieres recibir estos recordatorios, avisa a tu entrenador.
    </div>
  </div>
</body>
</html>
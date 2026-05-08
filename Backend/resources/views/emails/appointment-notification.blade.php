    <!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; background: #0d1515; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrap { max-width: 520px; margin: 0 auto; background: #111b1b; }
    .header { background: #0d1515; padding: 24px 30px; text-align: center; border-bottom: 2px solid #7ee8e8; }
    .header h1 { color: #fff; font-size: 16px; letter-spacing: 3px; margin: 0; }
    .header span { color: #7ee8e8; }
    .body { padding: 28px 30px; color: #ccc; font-size: 14px; line-height: 1.7; }
    .body h2 { color: #fff; font-size: 18px; margin: 0 0 16px; }
    .info-box { background: #0d1515; border: 1px solid #1a2a2a; border-radius: 10px; padding: 18px 22px; margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(126,232,232,0.06); }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #5a7070; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
    .info-value { color: #7ee8e8; font-weight: bold; font-size: 14px; }
    .footer { padding: 18px 30px; text-align: center; font-size: 10px; color: #3a5050; border-top: 1px solid #1a2a2a; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>ONE LIFE <span>ONE BODY</span></h1>
    </div>
    <div class="body">
      <h2>Nueva reserva de pesaje</h2>
      <p>Un cliente ha reservado un pesaje a través de la web:</p>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Cliente</span>
          <span class="info-value">{{ $client->name }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email</span>
          <span class="info-value">{{ $client->email }}</span>
        </div>
        @if($client->phone)
        <div class="info-row">
          <span class="info-label">Teléfono</span>
          <span class="info-value">{{ $client->phone }}</span>
        </div>
        @endif
        <div class="info-row">
          <span class="info-label">Fecha</span>
          <span class="info-value">{{ $appointment->appointment_date->format('d/m/Y') }} ({{ ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][$appointment->appointment_date->dayOfWeekIso] }})</span>
        </div>
        <div class="info-row">
          <span class="info-label">Hora</span>
          <span class="info-value">{{ substr($appointment->appointment_time, 0, 5) }}</span>
        </div>
        @if($appointment->notes)
        <div class="info-row">
          <span class="info-label">Notas</span>
          <span class="info-value" style="color: #a0b4b4; font-weight: normal;">{{ $appointment->notes }}</span>
        </div>
        @endif
      </div>
    </div>
    <div class="footer">
      One Life One Body · Fitness Center · Benidorm
    </div>
  </div>
</body>
</html>
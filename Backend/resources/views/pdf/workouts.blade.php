<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
    h1 { font-size: 18px; margin: 0 0 6px; }
    .muted { color:#666; }
    table { width:100%; border-collapse:collapse; margin-top:12px; }
    th, td { border:1px solid #ddd; padding:8px; }
    th { background:#f3f3f3; text-align:left; }
  </style>
</head>
<body>
  <h1>One Life One Body — Rutina</h1>
  <div class="muted">
    Cliente: <strong>{{ $user->name }}</strong> ({{ $user->email }})<br>
    Generado: {{ $generatedAt }}
  </div>

  <table>
    <thead>
      <tr>
        <th>Título</th>
        <th>Duración</th>
        <th>Nivel</th>
        <th>Fecha</th>
      </tr>
    </thead>
    <tbody>
      @forelse($workouts as $w)
        <tr>
          <td>{{ $w->title }}</td>
          <td>{{ $w->duration_minutes }} min</td>
          <td>{{ $w->level }}</td>
          <td>{{ $w->created_at }}</td>
        </tr>
      @empty
        <tr><td colspan="4">No hay entrenos.</td></tr>
      @endforelse
    </tbody>
  </table>
</body>
</html>

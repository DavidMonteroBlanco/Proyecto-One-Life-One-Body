<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #222; background: #fff; }

    .header { background: #0d1515; color: #fff; padding: 24px 30px; display: flex; justify-content: space-between; }
    .header h1 { font-size: 20px; letter-spacing: 2px; margin: 0; }
    .header .accent { color: #7ee8e8; }
    .header .date { font-size: 10px; color: #aaa; margin-top: 4px; }

    .info { padding: 20px 30px; background: #f7fafa; border-bottom: 2px solid #7ee8e8; }
    .info table { width: 100%; }
    .info td { padding: 3px 0; }
    .info .label { color: #888; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
    .info .value { font-weight: bold; font-size: 13px; }

    .stats { padding: 20px 30px; display: flex; }
    .stats table { width: 100%; border-collapse: collapse; }
    .stats td { width: 25%; text-align: center; padding: 12px 8px; }
    .stats .stat-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #888; }
    .stats .stat-value { font-size: 22px; font-weight: bold; color: #0d1515; margin-top: 2px; }
    .stats .stat-value.green { color: #10b981; }
    .stats .stat-value.red { color: #ef4444; }

    .section-title { padding: 16px 30px 8px; font-size: 13px; font-weight: bold; color: #0d1515; letter-spacing: 1px; text-transform: uppercase; border-top: 1px solid #eee; }

    .records { padding: 0 30px 20px; }
    .records table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .records th { background: #0d1515; color: #7ee8e8; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
    .records td { padding: 7px 10px; border-bottom: 1px solid #eee; font-size: 11px; }
    .records tr:nth-child(even) td { background: #f9fafa; }
    .records .change-pos { color: #ef4444; }
    .records .change-neg { color: #10b981; }

    .footer { margin-top: 20px; padding: 16px 30px; border-top: 2px solid #7ee8e8; text-align: center; font-size: 9px; color: #aaa; }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <h1>ONE LIFE ONE BODY</h1>
      <div class="date">Informe generado: {{ $generatedAt }}</div>
    </div>
    <div style="text-align: right;">
      <div class="accent" style="font-size: 14px; font-weight: bold;">INFORME DE PESAJES</div>
      <div class="date">Fitness Center · Benidorm</div>
    </div>
  </div>

  <div class="info">
    <table>
      <tr>
        <td>
          <div class="label">Cliente</div>
          <div class="value">{{ $user->name }}</div>
        </td>
        <td>
          <div class="label">Email</div>
          <div class="value">{{ $user->email }}</div>
        </td>
        <td>
          <div class="label">Teléfono</div>
          <div class="value">{{ $user->phone ?? '—' }}</div>
        </td>
        <td>
          <div class="label">Total pesajes</div>
          <div class="value">{{ $records->count() }}</div>
        </td>
      </tr>
    </table>
  </div>

  @if($records->count() > 0)
    @php
      $first = $records->last();
      $current = $records->first();
      $totalChange = round($current->weight_kg - $first->weight_kg, 1);
    @endphp

    <div class="stats">
      <table>
        <tr>
          <td>
            <div class="stat-label">Peso actual</div>
            <div class="stat-value">{{ number_format($current->weight_kg, 1) }} kg</div>
          </td>
          <td>
            <div class="stat-label">Peso inicial</div>
            <div class="stat-value">{{ number_format($first->weight_kg, 1) }} kg</div>
          </td>
          <td>
            <div class="stat-label">Cambio total</div>
            <div class="stat-value {{ $totalChange <= 0 ? 'green' : 'red' }}">
              {{ $totalChange > 0 ? '+' : '' }}{{ number_format($totalChange, 1) }} kg
            </div>
          </td>
          <td>
            <div class="stat-label">% Grasa actual</div>
            <div class="stat-value">{{ $current->fat_percentage ? number_format($current->fat_percentage, 1) . '%' : '—' }}</div>
          </td>
        </tr>
      </table>
    </div>
  @endif

  <div class="section-title">Historial de pesajes</div>

  <div class="records">
    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Peso</th>
          <th>% Grasa</th>
          <th>% Músculo</th>
          <th>Cambio</th>
          <th>Notas</th>
        </tr>
      </thead>
      <tbody>
        @forelse($records as $i => $r)
          @php
            $prev = $records[$i + 1] ?? null;
            $diff = $prev ? round($r->weight_kg - $prev->weight_kg, 1) : null;
          @endphp
          <tr>
            <td>{{ \Carbon\Carbon::parse($r->recorded_at)->format('d/m/Y') }}</td>
            <td><strong>{{ number_format($r->weight_kg, 1) }} kg</strong></td>
            <td>{{ $r->fat_percentage ? number_format($r->fat_percentage, 1) . '%' : '—' }}</td>
            <td>{{ $r->muscle_percentage ? number_format($r->muscle_percentage, 1) . '%' : '—' }}</td>
            <td>
              @if($diff !== null)
                <span class="{{ $diff <= 0 ? 'change-neg' : 'change-pos' }}">
                  {{ $diff > 0 ? '+' : '' }}{{ number_format($diff, 1) }}
                </span>
              @else
                —
              @endif
            </td>
            <td>{{ $r->notes ?? '' }}</td>
          </tr>
        @empty
          <tr><td colspan="6" style="text-align: center; padding: 20px;">No hay pesajes registrados.</td></tr>
        @endforelse
      </tbody>
    </table>
  </div>

  <div class="footer">
    One Life One Body · Fitness Center · Benidorm, Alicante · © {{ date('Y') }} · Documento confidencial
  </div>

</body>
</html>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <style>
    @page { margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #d0e0e0; background: #070c0c; }

    /* ── Header ── */
    .header {
      background: linear-gradient(135deg, #0d1515 0%, #0a1212 100%);
      padding: 28px 36px;
      border-bottom: 3px solid #7ee8e8;
      position: relative;
    }
    .header-row { display: table; width: 100%; }
    .header-left, .header-right { display: table-cell; vertical-align: middle; }
    .header-right { text-align: right; }
    .logo-text { font-size: 22px; font-weight: bold; letter-spacing: 4px; color: #ffffff; }
    .logo-accent { color: #7ee8e8; }
    .header-sub { font-size: 9px; color: #5a7070; margin-top: 3px; letter-spacing: 1.5px; }
    .report-label { font-size: 12px; font-weight: bold; color: #7ee8e8; letter-spacing: 2px; }
    .report-date { font-size: 9px; color: #5a7070; margin-top: 3px; }

    /* ── Client info ── */
    .info {
      background: #0e1919;
      padding: 18px 36px;
      border-bottom: 1px solid rgba(126,232,232,0.1);
    }
    .info-grid { display: table; width: 100%; }
    .info-item { display: table-cell; padding-right: 16px; }
    .info-label { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: #5a7070; font-weight: bold; }
    .info-value { font-size: 13px; font-weight: bold; color: #e8f0f0; margin-top: 2px; }

    /* ── Stats ── */
    .stats {
      padding: 22px 36px;
      background: #0a1111;
    }
    .stats-grid { display: table; width: 100%; }
    .stat-box {
      display: table-cell;
      text-align: center;
      padding: 14px 10px;
      background: #0e1919;
      border: 1px solid rgba(126,232,232,0.08);
      border-radius: 8px;
    }
    .stat-label { font-size: 8px; text-transform: uppercase; letter-spacing: 1.5px; color: #5a7070; font-weight: bold; }
    .stat-value { font-size: 24px; font-weight: bold; color: #7ee8e8; margin-top: 4px; }
    .stat-value.green { color: #6ee7b7; }
    .stat-value.red { color: #fca5a5; }

    /* ── Chart section ── */
    .chart-section {
      padding: 22px 36px 10px;
      background: #070c0c;
    }
    .chart-title {
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #5a7070;
      margin-bottom: 12px;
    }
    .chart-container {
      background: #0e1919;
      border: 1px solid rgba(126,232,232,0.08);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }

    /* ── Table ── */
    .table-section {
      padding: 16px 36px 30px;
      background: #070c0c;
    }
    .table-title {
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #5a7070;
      margin-bottom: 10px;
      padding-top: 8px;
      border-top: 1px solid rgba(126,232,232,0.06);
    }
    table.records { width: 100%; border-collapse: collapse; }
    table.records th {
      background: #0e1919;
      color: #7ee8e8;
      padding: 9px 10px;
      text-align: left;
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: bold;
      border-bottom: 2px solid rgba(126,232,232,0.15);
    }
    table.records td {
      padding: 8px 10px;
      border-bottom: 1px solid rgba(126,232,232,0.04);
      font-size: 10px;
      color: #a0b4b4;
    }
    table.records tr:nth-child(even) td { background: rgba(14,25,25,0.5); }
    table.records .weight { font-weight: bold; color: #e8f0f0; font-size: 12px; }
    .change-pos { color: #fca5a5; font-weight: bold; }
    .change-neg { color: #6ee7b7; font-weight: bold; }

    /* ── Footer ── */
    .footer {
      padding: 16px 36px;
      border-top: 2px solid #7ee8e8;
      background: #0d1515;
      text-align: center;
      font-size: 8px;
      color: #3a5050;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="header-row">
      <div class="header-left">
        <div class="logo-text">ONE LIFE <span class="logo-accent">ONE BODY</span></div>
        <div class="header-sub">FITNESS CENTER · BENIDORM</div>
      </div>
      <div class="header-right">
        <div class="report-label">INFORME DE PESAJES</div>
        <div class="report-date">Generado: {{ $generatedAt }}</div>
      </div>
    </div>
  </div>

  <!-- CLIENT INFO -->
  <div class="info">
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Cliente</div>
        <div class="info-value">{{ $user->name }}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Email</div>
        <div class="info-value">{{ $user->email }}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Telefono</div>
        <div class="info-value">{{ $user->phone ?? '—' }}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Total pesajes</div>
        <div class="info-value">{{ $records->count() }}</div>
      </div>
    </div>
  </div>

  @if($records->count() > 0)
    @php
      $sorted = $records->sortBy('recorded_at')->values();
      $first = $sorted->first();
      $current = $sorted->last();
      $totalChange = round($current->weight_kg - $first->weight_kg, 1);
    @endphp

    <!-- STATS -->
    <div class="stats">
      <div class="stats-grid">
        <div class="stat-box" style="margin-right: 8px;">
          <div class="stat-label">Peso actual</div>
          <div class="stat-value">{{ number_format($current->weight_kg, 1) }} kg</div>
        </div>
        <div class="stat-box" style="margin-right: 8px;">
          <div class="stat-label">Peso inicial</div>
          <div class="stat-value">{{ number_format($first->weight_kg, 1) }} kg</div>
        </div>
        <div class="stat-box" style="margin-right: 8px;">
          <div class="stat-label">Cambio total</div>
          <div class="stat-value {{ $totalChange <= 0 ? 'green' : 'red' }}">
            {{ $totalChange > 0 ? '+' : '' }}{{ number_format($totalChange, 1) }} kg
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-label">% Grasa actual</div>
          <div class="stat-value">{{ $current->fat_percentage ? number_format($current->fat_percentage, 1) . '%' : '—' }}</div>
        </div>
      </div>
    </div>

    <!-- CHART -->
    @if($sorted->count() >= 2)
    <div class="chart-section">
      <div class="chart-title">Evolucion de peso</div>
      <div class="chart-container">
        @php
          $chartW = 500;
          $chartH = 140;
          $padL = 45;
          $padR = 15;
          $padT = 15;
          $padB = 25;
          $innerW = $chartW - $padL - $padR;
          $innerH = $chartH - $padT - $padB;

          $weights = $sorted->pluck('weight_kg')->map(fn($v) => (float)$v);
          $minW = $weights->min() - 1;
          $maxW = $weights->max() + 1;
          $rangeW = max($maxW - $minW, 1);
          $count = $sorted->count();

          $points = [];
          foreach ($sorted as $i => $rec) {
            $x = $padL + ($count > 1 ? ($i / ($count - 1)) * $innerW : $innerW / 2);
            $y = $padT + $innerH - (((float)$rec->weight_kg - $minW) / $rangeW) * $innerH;
            $points[] = round($x, 1) . ',' . round($y, 1);
          }
          $polyline = implode(' ', $points);

          // Area fill
          $firstX = $padL;
          $lastX = $padL + ($count > 1 ? $innerW : $innerW / 2);
          $bottomY = $padT + $innerH;
          $areaPoints = $polyline . ' ' . round($lastX,1) . ',' . $bottomY . ' ' . round($firstX,1) . ',' . $bottomY;
        @endphp
        <svg width="{{ $chartW }}" height="{{ $chartH }}" viewBox="0 0 {{ $chartW }} {{ $chartH }}" xmlns="http://www.w3.org/2000/svg">
          <!-- Grid lines -->
          @for($i = 0; $i <= 4; $i++)
            @php
              $gy = $padT + ($innerH / 4) * $i;
              $gval = round($maxW - ($rangeW / 4) * $i, 1);
            @endphp
            <line x1="{{ $padL }}" y1="{{ $gy }}" x2="{{ $chartW - $padR }}" y2="{{ $gy }}" stroke="rgba(126,232,232,0.08)" stroke-width="1"/>
            <text x="{{ $padL - 6 }}" y="{{ $gy + 3 }}" fill="#5a7070" font-size="8" text-anchor="end">{{ $gval }}</text>
          @endfor

          <!-- Area fill -->
          <polygon points="{{ $areaPoints }}" fill="rgba(126,232,232,0.06)"/>

          <!-- Line -->
          <polyline points="{{ $polyline }}" fill="none" stroke="#7ee8e8" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>

          <!-- Dots -->
          @foreach($sorted as $i => $rec)
            @php
              $x = $padL + ($count > 1 ? ($i / ($count - 1)) * $innerW : $innerW / 2);
              $y = $padT + $innerH - (((float)$rec->weight_kg - $minW) / $rangeW) * $innerH;
            @endphp
            <circle cx="{{ round($x,1) }}" cy="{{ round($y,1) }}" r="4" fill="#070c0c" stroke="#7ee8e8" stroke-width="2"/>
            @if($i === 0 || $i === $count - 1)
              <text x="{{ round($x,1) }}" y="{{ round($y,1) - 8 }}" fill="#7ee8e8" font-size="9" font-weight="bold" text-anchor="middle">{{ number_format($rec->weight_kg, 1) }}</text>
            @endif
          @endforeach

          <!-- Date labels: first and last -->
          <text x="{{ $padL }}" y="{{ $chartH - 3 }}" fill="#5a7070" font-size="7" text-anchor="start">{{ \Carbon\Carbon::parse($sorted->first()->recorded_at)->format('d/m') }}</text>
          <text x="{{ $chartW - $padR }}" y="{{ $chartH - 3 }}" fill="#5a7070" font-size="7" text-anchor="end">{{ \Carbon\Carbon::parse($sorted->last()->recorded_at)->format('d/m') }}</text>
        </svg>
      </div>
    </div>
    @endif

  @endif

  <!-- RECORDS TABLE -->
  <div class="table-section">
    <div class="table-title">Historial completo de pesajes</div>
    <table class="records">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Peso</th>
          <th>% Grasa</th>
          <th>% Musculo</th>
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
            <td class="weight">{{ number_format($r->weight_kg, 1) }} kg</td>
            <td>{{ $r->fat_percentage ? number_format($r->fat_percentage, 1) . '%' : '—' }}</td>
            <td>{{ $r->muscle_percentage ? number_format($r->muscle_percentage, 1) . '%' : '—' }}</td>
            <td>
              @if($diff !== null)
                <span class="{{ $diff <= 0 ? 'change-neg' : 'change-pos' }}">
                  {{ $diff > 0 ? '+' : '' }}{{ number_format($diff, 1) }} kg
                </span>
              @else —
              @endif
            </td>
            <td>{{ $r->notes ?? '' }}</td>
          </tr>
        @empty
          <tr><td colspan="6" style="text-align: center; padding: 24px; color: #5a7070;">No hay pesajes registrados.</td></tr>
        @endforelse
      </tbody>
    </table>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    ONE LIFE ONE BODY · FITNESS CENTER · BENIDORM, ALICANTE · &copy; {{ date('Y') }} · DOCUMENTO CONFIDENCIAL
  </div>

</body>
</html>
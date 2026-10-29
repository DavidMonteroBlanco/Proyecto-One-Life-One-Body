@php
    $niveles = ['beginner' => 'Iniciación', 'intermediate' => 'Intermedio', 'advanced' => 'Avanzado'];
    $nombre = explode(' ', trim($user->name))[0];
@endphp
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#070c0c;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#070c0c;padding:40px 20px;">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

  <tr>
    <td style="height:3px;background:linear-gradient(90deg,#1a9e9e,#7ee8e8,#1a9e9e);border-radius:4px 4px 0 0;"></td>
  </tr>

  <tr>
    <td style="background-color:#111c1c;padding:40px 36px 36px;border:1px solid rgba(126,232,232,0.12);border-top:none;border-radius:0 0 4px 4px;">

      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="font-size:22px;font-weight:bold;color:#eaf7f7;letter-spacing:3px;padding-bottom:6px;">ONE LIFE</td></tr>
        <tr><td style="font-size:22px;font-weight:bold;color:#7ee8e8;letter-spacing:3px;padding-bottom:30px;">ONE BODY</td></tr>
      </table>

      <p style="font-size:16px;color:#eaf7f7;margin:0 0 8px;">Hola <strong>{{ $nombre }}</strong>,</p>
      <p style="font-size:14px;color:#8fb8b8;margin:0 0 24px;line-height:1.6;">
        Tienes un entreno nuevo preparado. Lo llevas adjunto en PDF y también lo
        tienes en tu área de cliente.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
        <tr>
          <td style="background:rgba(126,232,232,0.06);border-left:3px solid #1a9e9e;padding:16px 18px;border-radius:0 6px 6px 0;">
            <p style="font-size:11px;color:#4a6a6a;margin:0 0 4px;letter-spacing:1.5px;text-transform:uppercase;">Tu entreno</p>
            <p style="font-size:16px;color:#7ee8e8;margin:0 0 8px;font-weight:bold;">{{ $workout->title }}</p>
            <p style="font-size:13px;color:#8fb8b8;margin:0;">
              {{ $workout->duration_minutes }} min ·
              {{ $niveles[$workout->level] ?? $workout->level }}
              @if ($workout->goal) · {{ $workout->goal }} @endif
            </p>
          </td>
        </tr>
      </table>

      @if ($workout->exercises->isNotEmpty())
        <p style="font-size:11px;color:#4a6a6a;margin:0 0 10px;letter-spacing:1.5px;text-transform:uppercase;">
          {{ $workout->exercises->count() }} ejercicios
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          @foreach ($workout->exercises as $ex)
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid rgba(126,232,232,0.08);">
                <span style="font-size:14px;color:#eaf7f7;">{{ $ex->name }}</span>
                <span style="font-size:13px;color:#8fb8b8;float:right;">
                  {{ $ex->sets }} × {{ $ex->reps }}@if ($ex->weight) · {{ $ex->weight }}@endif
                </span>
              </td>
            </tr>
          @endforeach
        </table>
      @endif

      @if ($workout->notes)
        <p style="font-size:14px;color:#8fb8b8;margin:0 0 24px;line-height:1.6;">{{ $workout->notes }}</p>
      @endif

      <hr style="border:none;border-top:1px solid rgba(126,232,232,0.1);margin:0 0 20px;">

      <p style="font-size:11px;color:#4a6a6a;margin:0 0 12px;line-height:1.5;">
        Calienta antes de empezar y para si notas dolor. Ante cualquier molestia o
        lesión previa, consúltalo conmigo antes de continuar.
      </p>

      <p style="font-size:12px;color:#4a6a6a;margin:0;line-height:1.5;">
        {{ config('olob.nombre') }} · {{ config('olob.direccion') }}
      </p>

    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>

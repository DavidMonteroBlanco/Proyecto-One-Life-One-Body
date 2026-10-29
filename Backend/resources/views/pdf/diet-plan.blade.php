<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Plan de alimentación — {{ $user->name ?? 'Cliente' }}</title>
    @include('pdf._estilos')
</head>
<body>

    @include('pdf._marca', [
        'titulo' => $plan->title,
        'sujeto' => 'Plan de alimentación para ' . ($user->name ?? 'el cliente')
                  . ' · Generado el ' . $generatedAt,
    ])

    <div class="cuerpo">

        @if ($plan->notes)
            <div class="notas">{{ $plan->notes }}</div>
        @endif

        @forelse ($plan->meals as $meal)
            <div class="bloque">
                <div class="bloque__cab">
                    @if ($meal->calories || $meal->macros)
                        <span class="bloque__meta">
                            {{ $meal->calories }}@if ($meal->calories && $meal->macros) · @endif{{ $meal->macros }}
                        </span>
                    @endif
                    <span class="bloque__nombre">
                        {{ $mealLabels[$meal->meal_type] ?? $meal->meal_type }}
                    </span>
                </div>
                <div class="bloque__cuerpo">{!! nl2br(e($meal->foods)) !!}</div>
            </div>
        @empty
            <div class="notas">Este plan todavía no tiene comidas asignadas.</div>
        @endforelse

    </div>

    <div class="pie">
        <strong>{{ $centro['nombre'] }}</strong> · Plan personalizado, no transferible.<br>
        Este plan es orientativo y no sustituye el consejo de un médico o un dietista-nutricionista
        colegiado. Si tienes cualquier patología, alergia o estás embarazada, consúltalo antes de seguirlo.
    </div>

</body>
</html>

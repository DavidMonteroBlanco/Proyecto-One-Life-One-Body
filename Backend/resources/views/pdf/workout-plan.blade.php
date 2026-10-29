<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Entreno — {{ $user->name ?? 'Cliente' }}</title>
    @include('pdf._estilos')
</head>
<body>

    @php
        $niveles = ['beginner' => 'Iniciación', 'intermediate' => 'Intermedio', 'advanced' => 'Avanzado'];
    @endphp

    @include('pdf._marca', [
        'titulo' => $workout->title,
        'sujeto' => 'Entreno para ' . ($user->name ?? 'el cliente')
                  . ' · Generado el ' . $generatedAt,
    ])

    <div class="cuerpo">

        <div class="bloque">
            <div class="bloque__cab">
                <span class="bloque__meta">
                    {{ $workout->duration_minutes }} min · {{ $niveles[$workout->level] ?? $workout->level }}
                </span>
                <span class="bloque__nombre">{{ $workout->goal ?: 'Sesión de entrenamiento' }}</span>
            </div>

            @if ($workout->notes)
                <div class="bloque__cuerpo">{!! nl2br(e($workout->notes)) !!}</div>
            @endif
        </div>

        @if ($workout->exercises->isNotEmpty())
            <table class="series">
                <thead>
                    <tr>
                        <th>Ejercicio</th>
                        <th>Series</th>
                        <th>Reps</th>
                        <th>Peso</th>
                        <th>Descanso</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($workout->exercises as $ex)
                        <tr>
                            <td>
                                <strong>{{ $ex->name }}</strong>
                                @if ($ex->notes)
                                    <br><span style="font-size:9px;color:#6a8281">{{ $ex->notes }}</span>
                                @endif
                            </td>
                            <td class="num">{{ $ex->sets }}</td>
                            <td class="num">{{ $ex->reps }}</td>
                            <td class="num">{{ $ex->weight ?: '—' }}</td>
                            <td class="num">{{ $ex->rest_seconds }}s</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <div class="notas">Este entreno todavía no tiene ejercicios asignados.</div>
        @endif

    </div>

    <div class="pie">
        <strong>{{ $centro['nombre'] }}</strong> · Entreno personalizado, no transferible.<br>
        Calienta antes de empezar y para si notas dolor. Ante cualquier molestia o lesión previa,
        consúltalo con tu entrenador antes de continuar.
    </div>

</body>
</html>

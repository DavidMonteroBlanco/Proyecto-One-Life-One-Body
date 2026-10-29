{{--
    Cabecera y pie compartidos por todos los PDF del centro.
    Se incluye con @include('pdf._marca', ['titulo' => …, 'sujeto' => …]).

    La banda es oscura a propósito: el logotipo es blanco sobre negro,
    así que sobre papel blanco quedaría un recuadro negro suelto. Con
    la banda, ese negro pasa a ser parte del diseño.
--}}

<div class="marca">
    @if (!empty($logo))
        <img src="{{ $logo }}" class="marca__logo" alt="">
    @else
        <div class="marca__texto">ONE LIFE ONE BODY</div>
    @endif

    <div class="marca__datos">
        <div class="marca__nombre">{{ $centro['nombre'] }}</div>
        <div class="marca__linea">{{ $centro['direccion'] }}</div>
        <div class="marca__linea">{{ $centro['telefono'] }} · {{ $centro['web'] }}</div>
    </div>
</div>

<div class="doc">
    <div class="doc__titulo">{{ $titulo }}</div>
    <div class="doc__sujeto">{{ $sujeto }}</div>
</div>

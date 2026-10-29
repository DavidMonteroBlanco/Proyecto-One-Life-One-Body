// src/components/charts/EvolutionChart.tsx

import { useId, useMemo, useRef, useState, useCallback } from "react";
import {
  curvaSuave, areaDesdeCurva, rangoVertical, marcasEje,
  indiceMasCercano, tendencia,
} from "../../lib/charts";
import type { Punto } from "../../lib/charts";
import "./EvolutionChart.css";

/* ══════════════════════════════════════════════════════════
   GRÁFICA DE EVOLUCIÓN

   Una sola métrica a la vez, nunca dos ejes distintos en el
   mismo dibujo: mezclar kilos y porcentajes en una gráfica hace
   que dos líneas se cruzen por casualidad de la escala y parezca
   que significa algo.

   Se puede recorrer con el ratón, con el dedo y con el teclado.
   ══════════════════════════════════════════════════════════ */

export type PuntoSerie = {
  fecha: string;
  valor: number;
};

type Props = {
  puntos: PuntoSerie[];
  unidad: string;
  /** Si bajar es bueno (peso, grasa) o malo (músculo). Tiñe el delta. */
  bajarEsBueno?: boolean;
  /** Dibuja la recta de mínimos cuadrados. */
  mostrarTendencia?: boolean;
  etiqueta: string;
};

const W = 720;
const H = 300;
const PAD = { top: 24, right: 20, bottom: 36, left: 46 };

const fechaCorta = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });

const fechaLarga = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

export default function EvolutionChart({
  puntos, unidad, bajarEsBueno = true, mostrarTendencia = false, etiqueta,
}: Props) {
  const gradId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [activo, setActivo] = useState<number | null>(null);

  /* ── Geometría ── */
  const geo = useMemo(() => {
    const valores = puntos.map((p) => p.valor);
    const [min, max] = rangoVertical(valores, unidad === "kg" ? 2 : 3);
    const rango = max - min || 1;

    const x = (i: number) =>
      puntos.length === 1
        ? PAD.left + (W - PAD.left - PAD.right) / 2
        : PAD.left + (i / (puntos.length - 1)) * (W - PAD.left - PAD.right);

    const y = (v: number) =>
      PAD.top + (1 - (v - min) / rango) * (H - PAD.top - PAD.bottom);

    const coords: Punto[] = puntos.map((p, i) => ({ x: x(i), y: y(p.valor) }));
    const curva = curvaSuave(coords);

    // Índices del mínimo y el máximo reales, para marcarlos.
    let iMin = 0, iMax = 0;
    puntos.forEach((p, i) => {
      if (p.valor < puntos[iMin].valor) iMin = i;
      if (p.valor > puntos[iMax].valor) iMax = i;
    });

    const recta = mostrarTendencia ? tendencia(coords) : null;

    return {
      min, max, x, y, coords, curva,
      area: areaDesdeCurva(curva, coords, H - PAD.bottom),
      marcas: marcasEje(min, max, 4),
      xs: coords.map((c) => c.x),
      iMin, iMax,
      recta,
    };
  }, [puntos, unidad, mostrarTendencia]);

  /* ── Puntero: del píxel de pantalla a la coordenada del dibujo ── */
  const alMover = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const caja = svg.getBoundingClientRect();
    if (caja.width === 0) return;
    const xDibujo = ((e.clientX - caja.left) / caja.width) * W;
    setActivo(indiceMasCercano(geo.xs, xDibujo));
  }, [geo.xs]);

  /* ── Teclado: las flechas recorren los pesajes ── */
  const alPulsar = useCallback((e: React.KeyboardEvent) => {
    const ultimo = puntos.length - 1;
    const actual = activo ?? ultimo;
    let siguiente: number | null = null;

    if (e.key === "ArrowRight") siguiente = Math.min(ultimo, actual + 1);
    else if (e.key === "ArrowLeft") siguiente = Math.max(0, actual - 1);
    else if (e.key === "Home") siguiente = 0;
    else if (e.key === "End") siguiente = ultimo;
    else if (e.key === "Escape") { setActivo(null); return; }
    else return;

    e.preventDefault();
    setActivo(siguiente);
  }, [activo, puntos.length]);

  if (puntos.length === 0) return null;

  const sel = activo !== null ? puntos[activo] : null;
  const anterior = activo !== null && activo > 0 ? puntos[activo - 1] : null;
  const delta = sel && anterior ? sel.valor - anterior.valor : null;

  // La curva se vuelve a dibujar cuando cambian los datos: la clave
  // fuerza a React a recrear el nodo y la animación del CSS arranca
  // otra vez. Sin esto, cambiar de rango no se notaría.
  const clave = `${puntos.length}-${puntos[0]?.fecha}-${unidad}`;

  // Cuántas fechas caben abajo sin solaparse.
  const salto = Math.max(1, Math.ceil(puntos.length / 6));

  return (
    <div className="ev">
      <div className="ev__lienzo">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="ev__svg"
          onPointerMove={alMover}
          onPointerDown={alMover}
          onPointerLeave={() => setActivo(null)}
          onKeyDown={alPulsar}
          onBlur={() => setActivo(null)}
          tabIndex={0}
          role="img"
          aria-label={`${etiqueta}. ${puntos.length} registros, de ${puntos[0].valor} a ${puntos[puntos.length - 1].valor} ${unidad}. Usa las flechas para recorrer los datos.`}
        >
          <defs>
            <linearGradient id={`${gradId}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand-400)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--brand-400)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* ── Rejilla y eje vertical ── */}
          {geo.marcas.map((v) => (
            <g key={v}>
              <line
                x1={PAD.left} x2={W - PAD.right}
                y1={geo.y(v)} y2={geo.y(v)}
                className="ev__rejilla"
              />
              <text x={PAD.left - 9} y={geo.y(v) + 4} className="ev__eje-y">
                {formatear(v, unidad)}
              </text>
            </g>
          ))}

          {/* ── Tendencia ── */}
          {geo.recta && puntos.length > 2 && (
            <line
              x1={geo.xs[0]}
              y1={geo.recta.m * geo.xs[0] + geo.recta.b}
              x2={geo.xs[geo.xs.length - 1]}
              y2={geo.recta.m * geo.xs[geo.xs.length - 1] + geo.recta.b}
              className="ev__tendencia"
            />
          )}

          {/* ── Relleno y curva ── */}
          <path key={`a-${clave}`} d={geo.area} fill={`url(#${gradId}-area)`} className="chart-svg__area" />
          <path
            key={`l-${clave}`}
            d={geo.curva}
            className="ev__linea chart-svg__line"
            pathLength={1}
          />

          {/* ── Mínimo y máximo, solo si no coinciden ── */}
          {puntos.length > 2 && geo.iMin !== geo.iMax && (
            <>
              <Extremo cx={geo.xs[geo.iMin]} cy={geo.y(puntos[geo.iMin].valor)}
                texto={formatear(puntos[geo.iMin].valor, unidad)} arriba={false} />
              <Extremo cx={geo.xs[geo.iMax]} cy={geo.y(puntos[geo.iMax].valor)}
                texto={formatear(puntos[geo.iMax].valor, unidad)} arriba />
            </>
          )}

          {/* ── Puntos ── */}
          {geo.coords.map((c, i) => (
            <circle
              key={i} cx={c.x} cy={c.y}
              r={activo === i ? 6 : 3.5}
              className={`ev__punto ${activo === i ? "ev__punto--activo" : ""}`}
            />
          ))}

          {/* ── Cruz del punto seleccionado ── */}
          {activo !== null && (
            <line
              x1={geo.xs[activo]} x2={geo.xs[activo]}
              y1={PAD.top} y2={H - PAD.bottom}
              className="ev__cruz"
            />
          )}

          {/* ── Eje horizontal ── */}
          {puntos.map((p, i) =>
            i % salto === 0 || i === puntos.length - 1 ? (
              <text key={i} x={geo.xs[i]} y={H - PAD.bottom + 18} className="ev__eje-x">
                {fechaCorta(p.fecha)}
              </text>
            ) : null
          )}
        </svg>

        {/* ── Globo de datos ──
            Va en HTML y no dentro del SVG: así hereda la tipografía y
            los colores del sistema sin reimplementarlos a mano. */}
        {sel && (
          <div
            className="ev__globo"
            style={{
              left: `${(geo.xs[activo!] / W) * 100}%`,
              // Se pega al borde cuando el punto está en un extremo,
              // para que no se salga del recuadro.
              transform: `translateX(${
                geo.xs[activo!] / W < 0.15 ? "0%" : geo.xs[activo!] / W > 0.85 ? "-100%" : "-50%"
              })`,
            }}
            role="status"
            aria-live="polite"
          >
            <span className="ev__globo-fecha">{fechaLarga(sel.fecha)}</span>
            <span className="ev__globo-valor">
              {formatear(sel.valor, unidad)}<small>{unidad}</small>
            </span>
            {delta !== null && (
              <span className={`ev__globo-delta ${
                delta === 0 ? "" : (delta < 0) === bajarEsBueno ? "ev__globo-delta--bien" : "ev__globo-delta--mal"
              }`}>
                {delta > 0 ? "+" : ""}{formatear(delta, unidad)} {unidad} desde el anterior
              </span>
            )}
          </div>
        )}
      </div>

      {/* Los datos en texto, para lectores de pantalla y para quien
          no pueda usar el puntero. */}
      <table className="sr-only">
        <caption>{etiqueta}</caption>
        <thead>
          <tr><th scope="col">Fecha</th><th scope="col">Valor en {unidad}</th></tr>
        </thead>
        <tbody>
          {puntos.map((p) => (
            <tr key={p.fecha}>
              <td>{fechaLarga(p.fecha)}</td>
              <td>{formatear(p.valor, unidad)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="ev__pista">
        Pasa el ratón o el dedo por la gráfica para ver cada pesaje.
      </p>
    </div>
  );
}

/** Marca del mínimo o del máximo. */
function Extremo({ cx, cy, texto, arriba }: { cx: number; cy: number; texto: string; arriba: boolean }) {
  return (
    <text x={cx} y={cy + (arriba ? -12 : 19)} className="ev__extremo">
      {texto}
    </text>
  );
}

/** Un decimal para kilos y porcentajes; sin decimales no se ve nada. */
function formatear(v: number, unidad: string): string {
  return unidad === "kg" || unidad === "%"
    ? v.toFixed(1).replace(".", ",")
    : String(Math.round(v));
}

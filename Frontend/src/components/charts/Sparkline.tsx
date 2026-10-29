// src/components/charts/Sparkline.tsx

import { useId } from "react";
import { curvaSuave, areaDesdeCurva, rangoVertical } from "../../lib/charts";
import type { Punto } from "../../lib/charts";

/* ══════════════════════════════════════════════════════════
   SPARKLINE

   La miniatura que va dentro de una tarjeta de dato. Sin ejes,
   sin números y sin interacción: solo la forma de la evolución.
   Un número suelto no dice si vas bien; el mismo número con la
   silueta de los dos últimos meses al lado, sí.
   ══════════════════════════════════════════════════════════ */

type Props = {
  valores: number[];
  /** Color del trazo. Por defecto el acento de la marca. */
  color?: string;
  alto?: number;
};

const W = 120;

export default function Sparkline({ valores, color = "var(--brand-400)", alto = 34 }: Props) {
  const gradId = useId();

  if (valores.length < 2) return null;

  const [min, max] = rangoVertical(valores, 0.5);
  const rango = max - min || 1;

  const coords: Punto[] = valores.map((v, i) => ({
    x: (i / (valores.length - 1)) * W,
    y: (1 - (v - min) / rango) * alto,
  }));

  const curva = curvaSuave(coords);

  return (
    <svg
      viewBox={`0 0 ${W} ${alto}`}
      className="spark"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaDesdeCurva(curva, coords, alto)} fill={`url(#${gradId})`} />
      <path
        d={curva}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        /* `non-scaling-stroke` mantiene el grosor pese al
           preserveAspectRatio="none", que si no lo deformaría. */
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={coords[coords.length - 1].x}
        cy={coords[coords.length - 1].y}
        r="2.5"
        fill={color}
      />
    </svg>
  );
}

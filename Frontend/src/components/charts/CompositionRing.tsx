// src/components/charts/CompositionRing.tsx

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../lib/motion";
import "./CompositionRing.css";

/* ══════════════════════════════════════════════════════════
   COMPOSICIÓN CORPORAL

   Grasa, músculo y el resto, en un anillo.

   Es el único sitio donde tiene sentido ver grasa y músculo
   juntos: son dos partes del mismo cuerpo y suman, al contrario
   que en una gráfica de evolución, donde compartir eje sería
   casualidad de la escala.
   ══════════════════════════════════════════════════════════ */

type Props = {
  grasa: number | null;
  musculo: number | null;
};

const R = 54;          // radio del anillo
const GROSOR = 13;
const CIRCUNFERENCIA = 2 * Math.PI * R;

export default function CompositionRing({ grasa, musculo }: Props) {
  // Sin ninguno de los dos datos no hay nada que dibujar.
  if (grasa === null && musculo === null) return null;

  const g = Math.max(0, grasa ?? 0);
  const m = Math.max(0, musculo ?? 0);

  /*
   * Las básculas de bioimpedancia a veces dan porcentajes que suman
   * más de 100. En lugar de dibujar un anillo imposible, se avisa y
   * se reparte proporcionalmente: es mejor un anillo honesto con una
   * nota que un gráfico que se solapa consigo mismo.
   */
  const suma = g + m;
  const excede = suma > 100;
  const factor = excede ? 100 / suma : 1;
  const gVis = g * factor;
  const mVis = m * factor;
  const resto = Math.max(0, 100 - gVis - mVis);

  return (
    <div className="ring">
      <svg viewBox="0 0 140 140" className="ring__svg" aria-hidden="true" focusable="false">
        {/* Base */}
        <circle cx="70" cy="70" r={R} className="ring__base" strokeWidth={GROSOR} />

        {/* Los arcos empiezan arriba y van en el sentido del reloj.
            Cada uno arranca donde acaba el anterior. */}
        <Arco porcentaje={mVis} desplazamiento={0} clase="ring__musculo" />
        <Arco porcentaje={gVis} desplazamiento={mVis} clase="ring__grasa" />
        <Arco porcentaje={resto} desplazamiento={mVis + gVis} clase="ring__resto" />
      </svg>

      <div className="ring__leyenda">
        {musculo !== null && (
          <Dato clase="ring__punto--musculo" etiqueta="Músculo" valor={m} />
        )}
        {grasa !== null && (
          <Dato clase="ring__punto--grasa" etiqueta="Grasa" valor={g} />
        )}
        {!excede && resto > 0 && (
          <Dato clase="ring__punto--resto" etiqueta="Resto" valor={resto} />
        )}
      </div>

      {excede && (
        <p className="ring__aviso">
          Grasa y músculo suman {suma.toFixed(1)} %. El anillo lo muestra
          proporcional; revisa la medición con tu entrenador.
        </p>
      )}
    </div>
  );
}

/** Un tramo del anillo, que crece desde cero al aparecer. */
function Arco({ porcentaje, desplazamiento, clase }: { porcentaje: number; desplazamiento: number; clase: string }) {
  const reducido = useReducedMotion();
  const [arrancado, setArrancado] = useState(false);
  const pedido = useRef(0);

  useEffect(() => {
    // Con movimiento reducido no hay nada que arrancar: el arco sale
    // ya a su tamaño, porque `crecido` lo deriva más abajo.
    if (reducido) return;

    // Dos fotogramas de margen: en el primero el navegador aún no ha
    // pintado el estado inicial, y sin él la transición no se ve.
    pedido.current = requestAnimationFrame(() => {
      pedido.current = requestAnimationFrame(() => setArrancado(true));
    });
    return () => cancelAnimationFrame(pedido.current);
  }, [reducido]);

  const crecido = reducido || arrancado;

  const largo = (crecido ? porcentaje : 0) / 100 * CIRCUNFERENCIA;

  return (
    <circle
      cx="70" cy="70" r={R}
      className={`ring__arco ${clase}`}
      strokeWidth={GROSOR}
      strokeDasharray={`${largo} ${CIRCUNFERENCIA}`}
      strokeDashoffset={-(desplazamiento / 100) * CIRCUNFERENCIA}
      transform="rotate(-90 70 70)"
    />
  );
}

function Dato({ clase, etiqueta, valor }: { clase: string; etiqueta: string; valor: number }) {
  return (
    <div className="ring__dato">
      <span className={`ring__punto ${clase}`} aria-hidden="true" />
      <span className="ring__dato-etiqueta">{etiqueta}</span>
      <span className="ring__dato-valor">{valor.toFixed(1)} %</span>
    </div>
  );
}

// src/components/charts/ConsistencyStrip.tsx

import { useMemo } from "react";
import { ultimasSemanas, racha } from "../../lib/semanas";
import "./ConsistencyStrip.css";

/* ══════════════════════════════════════════════════════════
   CONSTANCIA

   Las últimas 12 semanas, una casilla cada una, encendida si
   hubo pesaje. Los huecos son el dato: una gráfica de peso no
   enseña las semanas en las que no se fue al gimnasio.
   ══════════════════════════════════════════════════════════ */

type Props = {
  fechas: string[];
  semanas?: number;
};

export default function ConsistencyStrip({ fechas, semanas = 12 }: Props) {
  const datos = useMemo(() => {
    const lista = ultimasSemanas(fechas, semanas);
    return { lista, seguidas: racha(lista) };
  }, [fechas, semanas]);

  const conPesaje = datos.lista.filter((s) => s.registros > 0).length;

  return (
    <div className="cs">
      <div className="cs__cabecera">
        <div className="cs__resumen">
          <span className="cs__numero">{conPesaje}</span>
          <span className="cs__de">de {semanas} semanas</span>
        </div>
        {datos.seguidas > 1 && (
          <span className="badge badge--brand cs__racha">
            {datos.seguidas} seguidas
          </span>
        )}
      </div>

      <div className="cs__tira" role="img"
        aria-label={`Constancia: pesaje en ${conPesaje} de las últimas ${semanas} semanas.`}>
        {datos.lista.map((s, i) => (
          <span
            key={s.inicio}
            className={`cs__celda ${s.registros > 0 ? "cs__celda--si" : ""} ${
              i === datos.lista.length - 1 ? "cs__celda--actual" : ""
            }`}
            /* El retardo escalonado hace que la tira se encienda de
               izquierda a derecha en vez de toda de golpe. */
            style={{ animationDelay: `${i * 45}ms` }}
            title={
              s.registros > 0
                ? `Semana del ${s.etiqueta}: ${s.registros} ${s.registros === 1 ? "pesaje" : "pesajes"}`
                : `Semana del ${s.etiqueta}: sin pesaje`
            }
          />
        ))}
      </div>

      <div className="cs__pie">
        <span>{datos.lista[0]?.etiqueta}</span>
        <span>Esta semana</span>
      </div>
    </div>
  );
}

// src/lib/useCountUp.ts

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./motion";

/**
 * Cuenta hasta un número en vez de plantarlo de golpe.
 *
 * Se usa solo en los datos grandes de cabecera. Es un efecto barato
 * (un `requestAnimationFrame` y un `setState` por fotograma durante
 * menos de un segundo), pero puesto en veinte sitios a la vez dejaría
 * de serlo, así que no va en las filas del historial.
 *
 * Con movimiento reducido no cuenta: devuelve el valor final y ya.
 */
export function useCountUp(destino: number | null, duracion = 850): number {
  const reducido = useReducedMotion();

  /* El último fotograma pintado. `para` lo ata a SU destino, así que
     si el destino cambia a mitad de cuenta el fotograma viejo deja de
     valer como resultado, pero sigue sirviendo de punto de partida. */
  const [anim, setAnim] = useState<{ valor: number; para: number } | null>(null);

  /* Desde dónde empieza la próxima cuenta. Va en una referencia y no
     en el estado a propósito: si fuera estado, el efecto tendría que
     depender de él y se reiniciaría en cada fotograma. Solo se escribe
     dentro del rAF y solo se lee dentro del efecto, nunca al pintar. */
  const desde = useRef(0);
  const pedido = useRef(0);

  useEffect(() => {
    if (destino === null || reducido || duracion <= 0) {
      desde.current = destino ?? 0;
      return;
    }

    // Se arranca desde lo que ya se veía: si el número pasa de 80,1 a
    // 79,8, contar desde cero sería absurdo.
    const inicio = desde.current;
    const delta = destino - inicio;

    // Diferencia invisible a un decimal: no merece una animación.
    if (Math.abs(delta) < 0.01) {
      desde.current = destino;
      return;
    }

    let t0 = 0;
    const paso = (t: number) => {
      if (!t0) t0 = t;
      const avance = Math.min(1, (t - t0) / duracion);
      // Suavizado de salida: rápido al principio, frena al final.
      const suave = 1 - Math.pow(1 - avance, 3);
      const valor = inicio + delta * suave;

      desde.current = valor;
      setAnim({ valor, para: destino });

      if (avance < 1) pedido.current = requestAnimationFrame(paso);
    };

    pedido.current = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(pedido.current);
  }, [destino, duracion, reducido]);

  if (destino === null) return 0;
  if (reducido) return destino;

  // El último fotograma pintado. En el primer renderizado todavía no
  // hay ninguno, así que la cuenta arranca desde cero.
  return anim ? anim.valor : 0;
}

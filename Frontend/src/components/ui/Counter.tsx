// src/components/ui/Counter.tsx
//
// Cifra que cuenta hacia arriba la primera vez que entra en pantalla.
//
// Acepta el valor tal cual está escrito ("+200", "98%", "5+", "Benidorm")
// y solo anima la parte numérica, conservando lo que lleve delante y
// detrás. Si el valor no tiene números —un nombre de ciudad— se pinta
// tal cual sin animar nada, igual que si el sistema pide movimiento
// reducido.

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../lib/motion";

type Props = {
  /** Valor final, con su prefijo y sufijo: "+200", "98%", "5+". */
  value: string;
  /** Duración de la cuenta en milisegundos. */
  duration?: number;
  className?: string;
};

type Parsed = { prefix: string; numeric: number; suffix: string; decimals: number };

/** Parte "+200" en { prefix: "+", numeric: 200, suffix: "" }. */
function parse(value: string): Parsed | null {
  const match = value.match(/^(\D*)(\d[\d.,]*)(.*)$/);
  if (!match) return null;

  const [, prefix, digits, suffix] = match;
  const numeric = Number(digits.replace(/\./g, "").replace(",", "."));
  if (!Number.isFinite(numeric)) return null;

  const decimals = digits.includes(",") ? digits.split(",")[1].length : 0;
  return { prefix, numeric, suffix, decimals };
}

function format(p: Parsed, n: number) {
  return (
    p.prefix +
    n.toLocaleString("es-ES", {
      minimumFractionDigits: p.decimals,
      maximumFractionDigits: p.decimals,
    }) +
    p.suffix
  );
}

export default function Counter({ value, duration = 1600, className }: Props) {
  const parsed = parse(value);
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);

  // Solo guardamos el valor mientras dura la cuenta. Fuera de ella el
  // texto se deriva directamente de las props, así que no hace falta
  // sincronizar estado desde el efecto.
  const [counting, setCounting] = useState<string | null>(null);

  const animate = Boolean(parsed) && !reduced;
  const display = animate
    ? counting ?? format(parsed as Parsed, 0)
    : value;

  const numeric = parsed?.numeric ?? 0;
  const prefix = parsed?.prefix ?? "";
  const suffix = parsed?.suffix ?? "";
  const decimals = parsed?.decimals ?? 0;

  useEffect(() => {
    if (!animate) return;

    const node = ref.current;
    if (!node) return;

    const shape: Parsed = { prefix, numeric, suffix, decimals };
    let raf = 0;

    const run = () => {
      const start = performance.now();

      const step = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        // easeOutExpo: arranca rápido y frena al final
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setCounting(format(shape, shape.numeric * eased));
        if (t < 1) raf = requestAnimationFrame(step);
      };

      raf = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          run();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [animate, numeric, prefix, suffix, decimals, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

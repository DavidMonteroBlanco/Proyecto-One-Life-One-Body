// src/lib/motion.ts
//
// ══════════════════════════════════════════════════════════
// UTILIDADES DE MOVIMIENTO
//
// Sustituyen a framer-motion, que se estaba usando solo para un
// efecto: aparecer con desplazamiento. La animación la hace el
// CSS; JavaScript solo decide CUÁNDO añadir la clase.
//
// El marcado no necesita refs ni componentes especiales: basta
// con poner el atributo `data-reveal` en el elemento.
// ══════════════════════════════════════════════════════════

import { useEffect, useState } from "react";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function prefersReduced(): boolean {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_QUERY).matches;
}

/** Equivalente al hook homónimo de framer-motion, sin la librería. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(prefersReduced);

  useEffect(() => {
    const mq = window.matchMedia(REDUCED_QUERY);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/* Un único observer para toda la aplicación. Crear uno por
   elemento con 30 secciones por página sería tirar rendimiento. */
let observer: IntersectionObserver | null = null;

function sharedObserver(): IntersectionObserver {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            // Una vez revelado ya no interesa seguirlo
            observer?.unobserve(entry.target);
          }
        }
      },
      // Se dispara un poco antes de que esté centrado, para que la
      // animación acabe justo cuando el usuario llega al elemento.
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );
  }
  return observer;
}

/**
 * Activa el revelado de todos los `[data-reveal]` de la página.
 *
 * Se llama UNA vez por página, no por elemento:
 *
 *   export default function Home() {
 *     useReveal();
 *     return <section data-reveal>…</section>;
 *   }
 *
 * En páginas cuyo contenido llega por petición, pásale algo que
 * cambie cuando lleguen los datos, para que vuelva a escanear:
 *
 *   useReveal(exercises.length);
 */
export function useReveal(rescanKey: unknown = null): void {
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)")
    );

    // Con movimiento reducido el contenido aparece ya colocado.
    if (prefersReduced()) {
      nodes.forEach((n) => n.classList.add("is-visible"));
      return;
    }

    const obs = sharedObserver();
    nodes.forEach((n) => obs.observe(n));

    return () => nodes.forEach((n) => obs.unobserve(n));
  }, [rescanKey]);
}

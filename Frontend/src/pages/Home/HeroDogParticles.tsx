// src/pages/Home/HeroDogParticles.tsx
//
// ══════════════════════════════════════════════════════════
// EL PITBULL HECHO DE PARTÍCULAS — fondo del hero
//
// En vez de pintar el logo, se leen sus píxeles: se dibuja el
// recorte del perro en un canvas fuera de pantalla, se recorre
// el mapa de bits y cada píxel claro se convierte en una
// partícula con su posición de destino.
//
// El perro NUNCA se queda quieto. Sobre la figura formada corren
// cuatro movimientos a la vez, cada uno con su propio ritmo:
//
//   1. Deriva      — cada partícula flota por su cuenta
//   2. Respiración — la figura entera se hincha y se deshincha
//   3. Destello    — una onda de brillo recorre el cuerpo
//   4. Sacudida    — cada cierto tiempo se sacude, como un perro
//
// ── RENDIMIENTO ───────────────────────────────────────────
// Lo caro de un canvas con miles de partículas no es dibujar,
// es CAMBIAR DE ESTADO. La primera versión asignaba fillStyle y
// globalAlpha una vez por partícula: ~4.800 cambios de estado
// por fotograma, y ahí se iba la fluidez en móvil.
//
// Ahora:
//   · La opacidad base de cada partícula no cambia nunca, así que
//     se agrupan por opacidad UNA vez y se pintan por lotes:
//     ~12 cambios de fillStyle por fotograma en vez de 2.400.
//   · Los senos salen de una tabla precalculada.
//   · En móvil se muestrean menos partículas y se limita el DPR.
//   · Sin puntero fino (móvil) no se calcula la repulsión: es
//     trabajo por fotograma para un efecto que allí no existe.
//   · Cuando el hero sale de pantalla, el bucle se detiene.
// ══════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../lib/motion";
import logo from "../../assets/icons/logo-bw.jpg";

/* Caja del perro dentro del logotipo de 1208x1409 */
const CROP = { x: 280, y: 130, w: 650, h: 720 };

/* Resolución de muestreo: más alto = más partículas y más detalle */
const SAMPLE_W = 168;

/* Un píxel se convierte en partícula si es más claro que esto (0-255) */
const BRIGHTNESS = 130;

/* ── Ritmos de la animación continua (segundos) ── */
const BREATH_CYCLE = 5.2;
const SWEEP_CYCLE  = 7;
const SHAKE_EVERY  = 11;
const SHAKE_TIME   = 0.9;

/* ── Lotes de opacidad ── */
const BUCKETS = 12;

/* ── Cursor ──
   Radio de influencia en píxeles y fuerza del empuje. Súbelo o bájalo
   para que las partículas se aparten más o menos; con 0.045 y un
   amortiguado de 0.88 se separan unos 18 px como máximo. */
const POINTER_R = 110;
const POINTER_R2 = POINTER_R * POINTER_R;
const POINTER_PUSH = 0.045;

/* ── Tabla de senos ──
   Un seno cuesta poco, pero cuatro por partícula y por fotograma
   son ~10.000 llamadas por segundo por cada mil partículas. */
const SIN_N = 2048;
const SIN_TABLE = new Float32Array(SIN_N);
for (let i = 0; i < SIN_N; i++) {
  SIN_TABLE[i] = Math.sin((i / SIN_N) * Math.PI * 2);
}
const TO_INDEX = SIN_N / (Math.PI * 2);

function fastSin(x: number): number {
  return SIN_TABLE[((x * TO_INDEX) | 0) & (SIN_N - 1)];
}
function fastCos(x: number): number {
  return SIN_TABLE[(((x * TO_INDEX) | 0) + (SIN_N >> 2)) & (SIN_N - 1)];
}

type Particle = {
  tx: number; ty: number;
  x: number; y: number;
  nx: number; ny: number;
  ox: number; oy: number;
  dp: number; ds: number; da: number;
  size: number;
  alpha: number;
  bucket: number;
};

export default function HeroDogParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let cancelled = false;
    let cleanup: (() => void) | null = null;

    let particles: Particle[] = [];
    /* Índice donde empieza cada lote dentro del array ya ordenado */
    let bucketStart = new Int32Array(BUCKETS + 1);
    /* Partículas alcanzadas por el destello en este fotograma */
    let glowIdx = new Int32Array(0);

    let w = 0;
    let h = 0;
    let centerX = 0;
    let centerY = 0;
    /* Caja que ocupa la figura, para descartar el puntero de un vistazo */
    let dogL = 0, dogR = 0, dogT = 0, dogB = 0;
    let rect = { left: 0, top: 0 };
    let shakeAt = SHAKE_EVERY;
    let visible = true;

    /* ── Ajuste automático de calidad ──
       No hay forma de saber de antemano la potencia del aparato, así
       que se mide el tiempo real de fotograma y se pinta 1 de cada
       `stride` partículas. Si el móvil no llega, baja la densidad solo;
       si va sobrado, la recupera. Más vale un perro menos denso que
       una web que se arrastra. */
    let stride = 1;
    let frameAcc = 0;
    let frameCount = 0;
    let lastTime = 0;

    /* El móvil pide menos carga: menos partículas y menos píxeles. */
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const isSmall = window.innerWidth < 900;
    const step = isSmall ? 3 : 2;
    const dpr = Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 2);

    /* Paleta precalculada: una cadena de color por nivel de opacidad,
       para no construir cadenas ni reasignar fillStyle por partícula. */
    const palette: string[] = [];
    for (let i = 0; i < BUCKETS; i++) {
      const a = ((i + 0.5) / BUCKETS) * 0.55;
      palette.push(`rgba(111,222,220,${a.toFixed(3)})`);
    }
    const GLOW_COLOR = "rgba(189,245,244,0.85)";

    /* ── Muestreo del logo ────────────────────────────────── */
    const sample = (img: HTMLImageElement) => {
      const sh = Math.round((SAMPLE_W * CROP.h) / CROP.w);
      const off = document.createElement("canvas");
      off.width = SAMPLE_W;
      off.height = sh;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return [];

      octx.drawImage(img, CROP.x, CROP.y, CROP.w, CROP.h, 0, 0, SAMPLE_W, sh);
      const { data } = octx.getImageData(0, 0, SAMPLE_W, sh);

      const points: { nx: number; ny: number; b: number }[] = [];
      for (let y = 0; y < sh; y += step) {
        for (let x = 0; x < SAMPLE_W; x += step) {
          const i = (y * SAMPLE_W + x) * 4;
          const b = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (b > BRIGHTNESS) {
            points.push({ nx: x / SAMPLE_W, ny: y / sh, b });
          }
        }
      }
      return points;
    };

    /* ── Colocación en pantalla ───────────────────────────── */
    const layout = (points: { nx: number; ny: number; b: number }[]) => {
      const r = canvas.getBoundingClientRect();
      rect = { left: r.left, top: r.top };
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const dogH = h * (w > 900 ? 0.82 : 0.62);
      const dogW = dogH * (CROP.w / CROP.h);
      centerX = w > 900 ? w * 0.68 : w * 0.5;
      centerY = h * 0.5;
      const originX = centerX - dogW / 2;
      const originY = centerY - dogH / 2;

      dogL = originX; dogR = originX + dogW;
      dogT = originY; dogB = originY + dogH;

      particles = points.map((p) => {
        const alpha = 0.18 + (p.b / 255) * 0.34;
        const tx = originX + p.nx * dogW;
        const ty = originY + p.ny * dogH;
        return {
          tx, ty,
          x: tx + (Math.random() - 0.5) * w * 1.6,
          y: ty + (Math.random() - 0.5) * h * 1.6,
          nx: p.nx,
          ny: p.ny,
          ox: 0, oy: 0,
          dp: Math.random() * Math.PI * 2,
          ds: 0.5 + Math.random() * 1.1,
          da: 0.7 + Math.random() * 1.6,
          size: 0.9 + (p.b / 255) * 1.1,
          alpha,
          // La opacidad base no cambia nunca, así que el lote
          // se decide aquí y no en cada fotograma.
          bucket: Math.min(BUCKETS - 1, ((alpha / 0.55) * BUCKETS) | 0),
        };
      });

      // Ordenar por lote permite pintar tramos contiguos del array
      // con un solo fillStyle por lote.
      particles.sort((a, b) => a.bucket - b.bucket);

      bucketStart = new Int32Array(BUCKETS + 1);
      for (const p of particles) bucketStart[p.bucket + 1]++;
      for (let i = 1; i <= BUCKETS; i++) bucketStart[i] += bucketStart[i - 1];

      glowIdx = new Int32Array(particles.length);
    };

    /* ── Dibujo ───────────────────────────────────────────── */
    const draw = (elapsedMs: number, assemble: number) => {
      const t = elapsedMs / 1000;
      ctx.clearRect(0, 0, w, h);

      // 2. Respiración
      const scale = 1 + fastSin((t / BREATH_CYCLE) * Math.PI * 2) * 0.016;

      // 3. Destello
      const sweep = ((t % SWEEP_CYCLE) / SWEEP_CYCLE) * 1.9 - 0.3;

      // 4. Sacudida
      let shake = 0;
      if (t >= shakeAt) {
        const k = (t - shakeAt) / SHAKE_TIME;
        if (k >= 1) shakeAt = t + SHAKE_EVERY;
        else shake = fastSin(k * Math.PI * 7) * (1 - k) * 7;
      }

      const ease = 0.012 + assemble * 0.05;
      let glowCount = 0;

      /* ── Repulsión del cursor ──
         Antes esto costaba una raíz cuadrada y dos divisiones por
         partícula dentro del radio (unas 700 por fotograma), y además
         amortiguaba las 3.000 aunque el puntero estuviera al otro lado
         de la pantalla. Ahora:

           · Una sola comprobación de caja descarta el puntero lejano
           · La caída se calcula con la distancia AL CUADRADO, sin raíz
           · La dirección sale de dx,dy tal cual, sin normalizar
           · Solo se amortigua lo que está realmente desplazado       */
      const px = pointer.x;
      const py = pointer.y;
      const near =
        !isCoarse &&
        px > dogL - POINTER_R && px < dogR + POINTER_R &&
        py > dogT - POINTER_R && py < dogB + POINTER_R;

      // Una sola asignación de opacidad para todo el fotograma:
      // el nivel real va dentro del color de cada lote.
      ctx.globalAlpha = assemble;

      for (let b = 0; b < BUCKETS; b++) {
        const from = bucketStart[b];
        const to = bucketStart[b + 1];
        if (from === to) continue;

        ctx.fillStyle = palette[b];

        // Un solo fill() por lote. Acumular los rectángulos en el trazado
        // y rellenarlos de golpe evita ~3.000 llamadas de dibujo por
        // fotograma, que es lo que de verdad pesa en un canvas 2D.
        ctx.beginPath();

        for (let i = from; i < to; i += stride) {
          const p = particles[i];

          p.x += (p.tx - p.x) * ease;
          p.y += (p.ty - p.y) * ease;

          // 1. Deriva propia
          const driftX = fastSin(t * p.ds + p.dp) * p.da;
          const driftY = fastCos(t * p.ds * 0.78 + p.dp) * p.da;

          if (near) {
            const dx = p.x - px;
            const dy = p.y - py;
            const d2 = dx * dx + dy * dy;
            if (d2 < POINTER_R2) {
              // dx y dy ya apuntan en la dirección correcta y crecen
              // con la distancia, así que normalizar sobraba.
              const f = (1 - d2 / POINTER_R2) * POINTER_PUSH;
              p.ox += dx * f;
              p.oy += dy * f;
            }
          }

          // Amortiguado solo de lo desplazado. Al llegar a cero se fija
          // exacto, para que a partir de ahí esta rama sea una comparación.
          if (p.ox !== 0 || p.oy !== 0) {
            p.ox *= 0.88;
            p.oy *= 0.88;
            if (p.ox < 0.02 && p.ox > -0.02) p.ox = 0;
            if (p.oy < 0.02 && p.oy > -0.02) p.oy = 0;
          }

          const bx = centerX + (p.x - centerX) * scale;
          const by = centerY + (p.y - centerY) * scale;

          // Las alcanzadas por el destello se apartan a una
          // segunda pasada, para no romper el lote de color.
          const band = (p.nx + p.ny) * 0.5 - sweep;
          if (band > -0.1 && band < 0.1) {
            glowIdx[glowCount++] = i;
            continue;
          }

          const shakeHere = shake * (1 - p.ny * 0.65);
          ctx.rect(bx + p.ox + driftX + shakeHere, by + p.oy + driftY, p.size, p.size);
        }

        ctx.fill();
      }

      // Segunda pasada: las del destello, todas del mismo color
      if (glowCount > 0) {
        ctx.fillStyle = GLOW_COLOR;
        ctx.beginPath();
        for (let g = 0; g < glowCount; g++) {
          const p = particles[glowIdx[g]];
          const bx = centerX + (p.x - centerX) * scale;
          const by = centerY + (p.y - centerY) * scale;
          const driftX = fastSin(t * p.ds + p.dp) * p.da;
          const driftY = fastCos(t * p.ds * 0.78 + p.dp) * p.da;
          const shakeHere = shake * (1 - p.ny * 0.65);
          const s = p.size + 0.8;
          ctx.rect(bx + p.ox + driftX + shakeHere, by + p.oy + driftY, s, s);
        }
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    const pointer = { x: -9999, y: -9999 };

    /* ── Arranque ─────────────────────────────────────────── */
    const img = new Image();
    img.src = logo;

    img
      .decode()
      .then(() => {
        if (cancelled) return;

        const points = sample(img);
        layout(points);

        if (reduced) {
          for (const p of particles) {
            p.x = p.tx;
            p.y = p.ty;
          }
          draw(0, 1);
          return;
        }

        const start = performance.now();
        const loop = (now: number) => {
          const elapsed = now - start;

          // Media móvil del tiempo entre fotogramas, en tandas de 40.
          if (lastTime) {
            frameAcc += now - lastTime;
            frameCount++;
            if (frameCount === 40) {
              const avg = frameAcc / 40;
              // 22 ms ≈ por debajo de 45 fps: aligerar
              if (avg > 22 && stride < 4) stride++;
              // 13 ms ≈ por encima de 75 fps: hay margen para recuperar
              else if (avg < 13 && stride > 1) stride--;
              frameAcc = 0;
              frameCount = 0;
            }
          }
          lastTime = now;

          draw(elapsed, Math.min(elapsed / 1500, 1));
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);

        /* Cuando el hero sale de pantalla no hay nada que animar:
           se para el bucle y el resto de la página va más suelta. */
        const io = new IntersectionObserver(
          ([entry]) => {
            const nowVisible = entry.isIntersecting;
            if (nowVisible === visible) return;
            visible = nowVisible;

            if (visible) {
              shakeAt = (performance.now() - start) / 1000 + SHAKE_EVERY;
              // Al reanudar, el primer salto de tiempo es enorme y
              // falsearía la medida de rendimiento.
              lastTime = 0;
              frameAcc = 0;
              frameCount = 0;
              raf = requestAnimationFrame(loop);
            } else {
              cancelAnimationFrame(raf);
            }
          },
          { threshold: 0 }
        );
        io.observe(canvas);

        const onResize = () => {
          const prev = particles.map((p) => ({ x: p.x, y: p.y }));
          layout(points);
          particles.forEach((p, i) => {
            if (prev[i]) {
              p.x = prev[i].x;
              p.y = prev[i].y;
            }
          });
        };

        // getBoundingClientRect en cada movimiento del ratón fuerza
        // al navegador a recalcular el layout. Se cachea y se
        // refresca solo al redimensionar o hacer scroll.
        const refreshRect = () => {
          const r = canvas.getBoundingClientRect();
          rect = { left: r.left, top: r.top };
        };

        const onMove = (e: PointerEvent) => {
          pointer.x = e.clientX - rect.left;
          pointer.y = e.clientY - rect.top;
        };
        const onLeave = () => {
          pointer.x = -9999;
          pointer.y = -9999;
        };

        window.addEventListener("resize", onResize);
        window.addEventListener("scroll", refreshRect, { passive: true });

        if (!isCoarse) {
          window.addEventListener("pointermove", onMove, { passive: true });
          window.addEventListener("pointerleave", onLeave);
        }

        cleanup = () => {
          io.disconnect();
          window.removeEventListener("resize", onResize);
          window.removeEventListener("scroll", refreshRect);
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("pointerleave", onLeave);
        };
      })
      .catch(() => {
        // Si el logo no carga, el hero se queda sin fondo y ya está:
        // el titular y los botones siguen siendo legibles.
      });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cleanup?.();
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="hero-particles" aria-hidden="true" />;
}

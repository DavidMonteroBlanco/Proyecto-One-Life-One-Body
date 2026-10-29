// src/lib/charts.ts

/**
 * Matemáticas de las gráficas. Todo funciones puras, sin React, para
 * poder probarlas por separado: si una curva miente, miente sobre el
 * peso de una persona.
 */

export type Punto = { x: number; y: number };

/* ══════════════════════════════════════════════════════════
   CURVA SUAVE
   ══════════════════════════════════════════════════════════ */

/**
 * Curva cúbica **monótona** (Fritsch–Carlson) que pasa por todos los
 * puntos y, entre dos de ellos, nunca se sale de su rango.
 *
 * No es un detalle estético. Con una curva normal (Catmull-Rom o una
 * Bézier a ojo) el trazo se pasa de largo en los cambios bruscos: entre
 * un pesaje de 80 kg y otro de 78 la línea bajaría visualmente hasta
 * 77,4 antes de subir. El cliente leería un peso que nunca tuvo.
 *
 * Con esta, entre 80 y 78 la curva se queda siempre entre 80 y 78.
 */
export function curvaSuave(puntos: Punto[]): string {
  if (puntos.length === 0) return "";
  if (puntos.length === 1) return `M ${puntos[0].x} ${puntos[0].y}`;
  if (puntos.length === 2) {
    return `M ${puntos[0].x} ${puntos[0].y} L ${puntos[1].x} ${puntos[1].y}`;
  }

  const n = puntos.length;

  // Pendiente de cada tramo.
  const secante: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const dx = puntos[i + 1].x - puntos[i].x;
    secante.push(dx === 0 ? 0 : (puntos[i + 1].y - puntos[i].y) / dx);
  }

  // Tangente en cada punto. En un pico o un valle se pone a cero, que
  // es lo que evita que la curva se pase de largo.
  const tangente: number[] = new Array(n);
  tangente[0] = secante[0];
  tangente[n - 1] = secante[n - 2];
  for (let i = 1; i < n - 1; i++) {
    tangente[i] = secante[i - 1] * secante[i] <= 0
      ? 0
      : (secante[i - 1] + secante[i]) / 2;
  }

  // Limitador de Fritsch–Carlson: recorta las tangentes que harían que
  // el tramo dejara de ser monótono.
  for (let i = 0; i < n - 1; i++) {
    if (secante[i] === 0) {
      tangente[i] = 0;
      tangente[i + 1] = 0;
      continue;
    }
    const a = tangente[i] / secante[i];
    const b = tangente[i + 1] / secante[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      tangente[i] = t * a * secante[i];
      tangente[i + 1] = t * b * secante[i];
    }
  }

  let d = `M ${r(puntos[0].x)} ${r(puntos[0].y)}`;
  for (let i = 0; i < n - 1; i++) {
    const dx = puntos[i + 1].x - puntos[i].x;
    const c1x = puntos[i].x + dx / 3;
    const c1y = puntos[i].y + (tangente[i] * dx) / 3;
    const c2x = puntos[i + 1].x - dx / 3;
    const c2y = puntos[i + 1].y - (tangente[i + 1] * dx) / 3;
    d += ` C ${r(c1x)} ${r(c1y)}, ${r(c2x)} ${r(c2y)}, ${r(puntos[i + 1].x)} ${r(puntos[i + 1].y)}`;
  }
  return d;
}

/** Redondeo a 2 decimales: el SVG no necesita más y el path pesa la mitad. */
function r(v: number): number {
  return Math.round(v * 100) / 100;
}

/** Cierra una curva contra la base para poder rellenarla. */
export function areaDesdeCurva(d: string, puntos: Punto[], base: number): string {
  if (!d || puntos.length === 0) return "";
  const ultimo = puntos[puntos.length - 1];
  return `${d} L ${r(ultimo.x)} ${r(base)} L ${r(puntos[0].x)} ${r(base)} Z`;
}

/* ══════════════════════════════════════════════════════════
   ESCALAS Y EJES
   ══════════════════════════════════════════════════════════ */

/**
 * Rango vertical con un margen proporcional a la variación real.
 *
 * El peso de una persona se mueve poco: de 78,2 a 80,1 en tres meses.
 * Un eje que empezara en cero dejaría esa evolución como una línea
 * plana, así que se ajusta a los datos. Cuando la variación es casi
 * nula se fuerza un mínimo de 2 kg de alto para que el ruido de la
 * báscula no se vea como una montaña.
 */
export function rangoVertical(valores: number[], minimoAlto = 2): [number, number] {
  if (valores.length === 0) return [0, 1];

  let min = Math.min(...valores);
  let max = Math.max(...valores);

  if (max - min < minimoAlto) {
    const centro = (max + min) / 2;
    min = centro - minimoAlto / 2;
    max = centro + minimoAlto / 2;
  } else {
    const margen = (max - min) * 0.15;
    min -= margen;
    max += margen;
  }

  return [min, max];
}

/** Marcas "redondas" para el eje vertical, con el paso que toque. */
export function marcasEje(min: number, max: number, deseadas = 4): number[] {
  const bruto = (max - min) / deseadas;
  const magnitud = Math.pow(10, Math.floor(Math.log10(bruto || 1)));
  const normal = bruto / magnitud;
  const paso = (normal >= 5 ? 5 : normal >= 2 ? 2 : 1) * magnitud;

  const marcas: number[] = [];
  for (let v = Math.ceil(min / paso) * paso; v <= max + 1e-9; v += paso) {
    marcas.push(Math.round(v * 1000) / 1000);
  }
  return marcas;
}

/* ══════════════════════════════════════════════════════════
   UTILIDADES
   ══════════════════════════════════════════════════════════ */

/**
 * Índice del punto más cercano a una posición horizontal.
 * Es lo que hace que el puntero "se enganche" al pesaje de al lado en
 * vez de exigir precisión de cirujano, sobre todo con el dedo.
 */
export function indiceMasCercano(xs: number[], x: number): number {
  if (xs.length === 0) return -1;
  let mejor = 0;
  let distancia = Math.abs(xs[0] - x);
  for (let i = 1; i < xs.length; i++) {
    const d = Math.abs(xs[i] - x);
    if (d < distancia) { distancia = d; mejor = i; }
  }
  return mejor;
}

/**
 * Recta de tendencia por mínimos cuadrados.
 * Devuelve null cuando no hay suficientes puntos o cuando todos caen en
 * la misma fecha, caso en el que la pendiente no significa nada.
 */
export function tendencia(puntos: Punto[]): { m: number; b: number } | null {
  const n = puntos.length;
  if (n < 2) return null;

  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (const p of puntos) {
    sx += p.x; sy += p.y; sxy += p.x * p.y; sxx += p.x * p.x;
  }

  const denominador = n * sxx - sx * sx;
  if (Math.abs(denominador) < 1e-9) return null;

  const m = (n * sxy - sx * sy) / denominador;
  return { m, b: (sy - m * sx) / n };
}

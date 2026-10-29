// src/lib/semanas.ts

/**
 * Reparto de pesajes por semana.
 *
 * La semana empieza en **lunes**, que es como se cuenta aquí, no en
 * domingo. Todo se compara a mediodía local para que el cambio de hora
 * de marzo y octubre no mueva un pesaje a la semana de al lado: a las
 * 00:00 una hora de diferencia cruza el límite, a las 12:00 no.
 */

const DIA_MS = 86_400_000;

/** Lunes a mediodía de la semana a la que pertenece esa fecha. */
export function inicioDeSemana(fecha: Date): number {
  const d = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 12, 0, 0, 0);
  // getDay(): 0 es domingo. Se convierte a "días desde el lunes".
  const desdeLunes = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - desdeLunes);
  return d.getTime();
}

export type Semana = {
  /** Marca de tiempo del lunes de esa semana. */
  inicio: number;
  /** Cuántos pesajes hubo. */
  registros: number;
  /** Etiqueta corta para el eje, p. ej. "6 oct". */
  etiqueta: string;
};

/**
 * Las últimas `cuantas` semanas, de la más antigua a la actual.
 * Las semanas sin pesaje salen con `registros: 0`: el hueco es
 * justamente el dato que interesa ver.
 */
export function ultimasSemanas(fechasISO: string[], cuantas = 12, hoy = new Date()): Semana[] {
  const actual = inicioDeSemana(hoy);

  const conteo = new Map<number, number>();
  for (const iso of fechasISO) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) continue;      // fecha ilegible: se ignora
    const semana = inicioDeSemana(d);
    conteo.set(semana, (conteo.get(semana) ?? 0) + 1);
  }

  const salida: Semana[] = [];
  for (let i = cuantas - 1; i >= 0; i--) {
    // Restar 7 días en milisegundos y renormalizar: así el resultado
    // sigue siendo mediodía aunque haya cambio de hora en medio.
    const inicio = inicioDeSemana(new Date(actual - i * 7 * DIA_MS));
    salida.push({
      inicio,
      registros: conteo.get(inicio) ?? 0,
      etiqueta: new Date(inicio).toLocaleDateString("es-ES", { day: "numeric", month: "short" }),
    });
  }
  return salida;
}

/**
 * Semanas seguidas con al menos un pesaje, contando hacia atrás.
 *
 * La semana en curso no rompe la racha si todavía está vacía: es
 * lunes y aún no ha habido pesaje, y eso no es haber fallado.
 */
export function racha(semanas: Semana[]): number {
  if (semanas.length === 0) return 0;

  let i = semanas.length - 1;
  if (semanas[i].registros === 0) i--;   // la semana en curso, de gracia

  let total = 0;
  for (; i >= 0; i--) {
    if (semanas[i].registros === 0) break;
    total++;
  }
  return total;
}

// src/lib/pesos.ts

/**
 * El peso se guarda como texto libre a propósito: el entrenador escribe
 * "40 kg", "12,5", "corporal" o "banda roja" según el ejercicio, y
 * forzarlo a número dejaría fuera la mitad de los casos.
 *
 * Para la progresión semanal sí hace falta tocar el número, así que
 * aquí se separa en tres partes: lo de antes, el número y lo de después.
 * Si no hay número, se devuelve el texto tal cual.
 */

/** Coma decimal: en España se escribe "12,5", no "12.5". */
const NUMERO = /-?\d+(?:[.,]\d+)?/;

/**
 * Suma `delta` al primer número que aparezca en el texto, conservando
 * todo lo demás (unidades, notas) y el separador decimal original.
 *
 *   subirPeso("40 kg", 2.5)      -> "42,5 kg"
 *   subirPeso("12,5", 2.5)       -> "15"
 *   subirPeso("corporal", 2.5)   -> "corporal"   (no hay nada que subir)
 *   subirPeso("", 2.5)           -> ""
 */
export function subirPeso(texto: string | null | undefined, delta: number): string {
  const original = texto ?? "";
  const encaje = original.match(NUMERO);
  if (!encaje) return original;

  // Coma salvo que el entrenador haya escrito punto: aquí se escribe
  // "42,5", y "40 kg" + 2,5 debe salir "42,5 kg", no "42.5 kg".
  const usaPunto = encaje[0].includes(".");
  const valor = parseFloat(encaje[0].replace(",", "."));
  if (!Number.isFinite(valor)) return original;

  // Nunca por debajo de cero: un peso negativo no significa nada y
  // sería un dato raro viajando hasta el PDF del cliente.
  const nuevo = Math.max(0, valor + delta);

  // Dos decimales como mucho, y sin ceros de relleno: 42.50 -> "42,5".
  let salida = String(Math.round(nuevo * 100) / 100);
  if (!usaPunto) salida = salida.replace(".", ",");

  return original.slice(0, encaje.index) + salida + original.slice(encaje.index! + encaje[0].length);
}

/** Etiqueta en español para el nivel que guarda el backend. */
export const NIVELES = [
  { value: "beginner",     label: "Iniciación" },
  { value: "intermediate", label: "Intermedio" },
  { value: "advanced",     label: "Avanzado" },
] as const;

export type Nivel = (typeof NIVELES)[number]["value"];

export function nivelLabel(valor: string): string {
  return NIVELES.find((n) => n.value === valor)?.label ?? valor;
}

/** "90" -> "1 min 30 s", para que el descanso se lea de un vistazo. */
export function descansoLabel(segundos: number): string {
  if (!segundos) return "sin descanso";
  if (segundos < 60) return `${segundos} s`;
  const min = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return resto ? `${min} min ${resto} s` : `${min} min`;
}

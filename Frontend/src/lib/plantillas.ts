// src/lib/plantillas.ts

/**
 * Plantillas de arranque para la tabla de ejercicios.
 *
 * No son "el entreno": son el esqueleto que el entrenador rellena en
 * cuatro clics en vez de escribir ocho filas desde cero. Los pesos van
 * vacíos a propósito, porque dependen de la persona.
 */

export type EjercicioPlantilla = {
  name: string;
  sets: string;
  reps: string;
  rest_seconds: string;
};

export type Plantilla = {
  clave: string;
  nombre: string;
  titulo: string;
  objetivo: string;
  ejercicios: EjercicioPlantilla[];
};

export const PLANTILLAS: Plantilla[] = [
  {
    clave: "empuje",
    nombre: "Empuje",
    titulo: "Empuje",
    objetivo: "Hipertrofia",
    ejercicios: [
      { name: "Press banca", sets: "4", reps: "8-10", rest_seconds: "120" },
      { name: "Press inclinado con mancuernas", sets: "3", reps: "10-12", rest_seconds: "90" },
      { name: "Press militar", sets: "4", reps: "8-10", rest_seconds: "120" },
      { name: "Elevaciones laterales", sets: "3", reps: "12-15", rest_seconds: "60" },
      { name: "Fondos en paralelas", sets: "3", reps: "10", rest_seconds: "90" },
      { name: "Extensión de tríceps en polea", sets: "3", reps: "12-15", rest_seconds: "60" },
    ],
  },
  {
    clave: "tiron",
    nombre: "Tirón",
    titulo: "Tirón",
    objetivo: "Hipertrofia",
    ejercicios: [
      { name: "Dominadas", sets: "4", reps: "6-8", rest_seconds: "120" },
      { name: "Remo con barra", sets: "4", reps: "8-10", rest_seconds: "120" },
      { name: "Jalón al pecho", sets: "3", reps: "10-12", rest_seconds: "90" },
      { name: "Remo en polea baja", sets: "3", reps: "12", rest_seconds: "90" },
      { name: "Curl con barra", sets: "3", reps: "10-12", rest_seconds: "60" },
      { name: "Curl martillo", sets: "3", reps: "12", rest_seconds: "60" },
    ],
  },
  {
    clave: "pierna",
    nombre: "Pierna",
    titulo: "Pierna",
    objetivo: "Fuerza",
    ejercicios: [
      { name: "Sentadilla", sets: "4", reps: "6-8", rest_seconds: "180" },
      { name: "Peso muerto rumano", sets: "4", reps: "8-10", rest_seconds: "150" },
      { name: "Prensa", sets: "3", reps: "10-12", rest_seconds: "120" },
      { name: "Zancadas con mancuernas", sets: "3", reps: "12 por pierna", rest_seconds: "90" },
      { name: "Curl femoral", sets: "3", reps: "12-15", rest_seconds: "60" },
      { name: "Gemelo de pie", sets: "4", reps: "15-20", rest_seconds: "45" },
    ],
  },
  {
    clave: "fullbody",
    nombre: "Cuerpo completo",
    titulo: "Cuerpo completo",
    objetivo: "Acondicionamiento",
    ejercicios: [
      { name: "Sentadilla", sets: "3", reps: "10", rest_seconds: "120" },
      { name: "Press banca", sets: "3", reps: "10", rest_seconds: "120" },
      { name: "Remo con barra", sets: "3", reps: "10", rest_seconds: "120" },
      { name: "Press militar", sets: "3", reps: "10", rest_seconds: "90" },
      { name: "Peso muerto rumano", sets: "3", reps: "10", rest_seconds: "120" },
      { name: "Plancha", sets: "3", reps: "45 s", rest_seconds: "45" },
    ],
  },
];

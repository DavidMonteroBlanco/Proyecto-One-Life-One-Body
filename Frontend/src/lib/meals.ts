// src/lib/meals.ts
//
// Tipos de comida de un plan de alimentación. Viven aquí porque
// los usan tanto "Mi dieta" (cliente) como "Dietas" (admin), y
// antes estaban duplicados en los dos sitios con riesgo de
// desincronizarse.

import type { IconName } from "../components/ui/Icon";

export type MealDefinition = {
  value: string;
  label: string;
  icon: IconName;
};

export const MEALS: MealDefinition[] = [
  { value: "desayuno",      label: "Desayuno",      icon: "sunrise" },
  { value: "media_manana",  label: "Media mañana",  icon: "apple" },
  { value: "comida",        label: "Comida",        icon: "plate" },
  { value: "merienda",      label: "Merienda",      icon: "cup" },
  { value: "pre_entreno",   label: "Pre-entreno",   icon: "bolt" },
  { value: "post_entreno",  label: "Post-entreno",  icon: "dumbbell" },
  { value: "cena",          label: "Cena",          icon: "moon" },
];

export function mealLabel(value: string): string {
  return MEALS.find((m) => m.value === value)?.label ?? value;
}

export function mealIcon(value: string): IconName {
  return MEALS.find((m) => m.value === value)?.icon ?? "plate";
}

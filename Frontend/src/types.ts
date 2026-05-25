export type Service = {
  id: number;
  title: string;
  description: string | null;
  sort_order: number;
};

export type MethodStep = {
  id: number;
  title: string;
  description: string | null;
  sort_order: number;
};

export type Collaborator = {
  id: number;
  name: string;
  role: string | null;
  bio: string | null;
  image_url: string | null;
  sort_order: number;
};

export type SiteSetting = {
  id: number;
  key: string;
  value: string | null;
};

export type Workout = {
  id: number;
  title: string;
  duration_minutes: number;
  level: "beginner" | "intermediate" | "advanced";
  created_at?: string;
  updated_at?: string;
};

export type ExternalDrink = {
  idDrink: string;
  strDrink: string;
  strDrinkThumb: string;
  strCategory?: string;
  strAlcoholic?: string;
  strGlass?: string;
  strInstructions?: string;
};
export type WgerExercise = {
  id: number;
  name: string;
  description?: string;
  category?: string | null;
  muscles?: string[];
  images?: string[];
};

export type WgerExerciseDetail = {
  id: number;
  name: string;
  description: string;
  category?: string | null;
  muscles?: string[];
  equipment?: string[];
  images?: string[];
  videoId?: string | null;
};

export type WgerListResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

import api from "./api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  phone?: string;
  birth_date?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  birth_date?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ── LOGIN ──────────────────────────────────────────────────────
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/login", payload);
  localStorage.setItem("token", data.token);
  return data;
}

// ── REGISTER ───────────────────────────────────────────────────
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/register", payload);
  localStorage.setItem("token", data.token);
  return data;
}

// ── LOGOUT ─────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  try {
    await api.post("/logout");
  } finally {
    localStorage.removeItem("token");
  }
}

// ── ME ─────────────────────────────────────────────────────────
export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/me");
  return data;
}
// src/context/Authcontext.tsx

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import api from "../services/api";

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
  isAdmin: boolean;
  loading: boolean;
  login: (creds: { email: string; password: string }) => Promise<{ user: User }>;
  register: (data: { name: string; email: string; password: string; password_confirmation: string; phone?: string; birth_date?: string }) => Promise<{ user: User }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth on mount — fast, only if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    api.get("/me")
      .then(({ data }) => {
        const u = data.user ?? data;
        setUser(u);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (creds: { email: string; password: string }) => {
    const { data } = await api.post("/login", creds);
    localStorage.setItem("token", data.token);
    const u = data.user;
    setUser(u);
    return { user: u };
  }, []);

  const register = useCallback(async (regData: any) => {
    const { data } = await api.post("/register", regData);
    localStorage.setItem("token", data.token);
    const u = data.user;
    setUser(u);
    return { user: u };
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/logout");
    } catch {
      // Even if the API call fails (expired token, network error),
      // we still clear local state
    }
    localStorage.removeItem("token");
    sessionStorage.removeItem("olob_access");
    setUser(null);
  }, []);

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, setUser, isAdmin, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
import { api, setAuthToken } from "./services/api";
import { clearToken } from "./services/auth";

export type MeUser = {
  id: number;
  name: string;
  email: string;
  role?: string;
};

export async function fetchMe(): Promise<MeUser> {
  const res = await api.get("/api/me");
  return res.data?.user ?? res.data;
}

export async function logout() {
  try {
    await api.post("/api/logout");
  } catch {

  } finally {
    clearToken();
    setAuthToken(null);
  }
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageShell from "../components/PageShell";
import { api, setAuthToken } from "../api";
import { saveToken, saveUser } from "../auth";
import "./login.css";
export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const res = await api.post("/api/login", { email, password });
      const token = res.data?.token;
      const user = res.data?.user;

      if (user) localStorage.setItem("olob_user", JSON.stringify(user));
      if (!token || !user) {
        setMsg("No se pudo iniciar sesión");
        return;
      }

      saveToken(token);
      setAuthToken(token);
      if (user) saveUser(user);

      nav("/", { replace: true });
    } catch (err: any) {
      const m = err?.response?.data?.message;
      setMsg(m ?? "Email o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
        {/* Fondo sutil con gradiente premium */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-black" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md px-6 py-12"
        >
          <div className="bg-black/70 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl">
            
            {/* Logo / Título */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-black">OL</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter text-white">
                  ONE LIFE<br />
                  <span className="text-cyan-400">ONE BODY</span>
                </h1>
              </div>
              <p className="text-white/60 text-sm tracking-wider">TRANSFORMA TU MEJOR VERSIÓN</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all duration-300"
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-2xl text-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-cyan-500/30 disabled:opacity-70"
              >
                {loading ? "Iniciando sesión..." : "INICIAR SESIÓN"}
              </motion.button>

              {msg && (
                <p className="text-center text-red-400 text-sm mt-2">{msg}</p>
              )}

              <div className="flex justify-between text-sm text-white/70 pt-4">
                <Link to="/forgot" className="hover:text-cyan-400 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
                <Link to="/register" className="hover:text-cyan-400 transition-colors">
                  Crear cuenta
                </Link>
              </div>
            </form>
          </div>

          <p className="text-center text-white/40 text-xs mt-10 tracking-widest">
            ONE LIFE ONE BODY © 2026
          </p>
        </motion.div>
      </div>
    </PageShell>
  );
}
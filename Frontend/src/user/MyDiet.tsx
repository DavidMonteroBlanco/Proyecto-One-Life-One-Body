// src/user/MyDiet.tsx

import { useState, useEffect } from "react";
import { useAuth } from "../context/Authcontext";
import api from "../services/api";
import "./Tracking.css";

type Meal = { id: number; meal_type: string; foods: string; calories: string | null; macros: string | null };
type Plan = { id: number; title: string; notes: string | null; meals: Meal[] };

const MEAL_ICONS: Record<string, string> = {
  desayuno: "🌅", media_manana: "🍎", comida: "🍽", merienda: "🥤",
  pre_entreno: "⚡", post_entreno: "💪", cena: "🌙",
};

const MEAL_LABELS: Record<string, string> = {
  desayuno: "Desayuno", media_manana: "Media mañana", comida: "Comida", merienda: "Merienda",
  pre_entreno: "Pre-entreno", post_entreno: "Post-entreno", cena: "Cena",
};

export default function MyDiet() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/my-diet");
        setPlan(data.plan || null);
      } catch { /* */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const firstName = user?.name?.split(" ")[0] || "Usuario";

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="tracking-header">
        <div>
          <h1 className="tracking-title">Mi dieta</h1>
          <p className="tracking-sub">Tu plan de alimentación, {firstName}</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.8rem", padding: "4rem", fontFamily: "var(--font-condensed)", color: "var(--text-muted)" }}>
          <span className="tracking-spinner" /> Cargando...
        </div>
      ) : !plan ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16 }}>
          <span style={{ fontSize: "3rem", opacity: 0.3, display: "block", marginBottom: "1rem" }}>🍽</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "var(--text-primary)", letterSpacing: "0.04em", marginBottom: "0.5rem" }}>Sin dieta asignada</h2>
          <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
            Tu entrenador asignará tu plan de alimentación personalizado. Contacta con él para más información.
          </p>
        </div>
      ) : (
        <>
          {/* Plan header */}
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.5rem", marginBottom: "1.5rem", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, var(--accent), var(--primary), transparent)" }} />
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--text-primary)", letterSpacing: "0.04em" }}>{plan.title}</h2>
            {plan.notes && <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "0.4rem", lineHeight: 1.6 }}>{plan.notes}</p>}
            <span style={{ display: "inline-block", marginTop: "0.6rem", fontSize: "0.6rem", fontFamily: "var(--font-condensed)", fontWeight: 800, letterSpacing: "0.15em", padding: "0.2rem 0.6rem", background: "rgba(16,185,129,0.1)", color: "#6ee7b7", borderRadius: 4 }}>PLAN ACTIVO</span>
          </div>

          {/* Meals */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {plan.meals.map((meal) => (
              <div key={meal.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.3rem 1.5rem", transition: "border-color 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.8rem" }}>
                  <span style={{ fontSize: "1.4rem" }}>{MEAL_ICONS[meal.meal_type] || "🍽"}</span>
                  <span style={{ fontFamily: "var(--font-condensed)", fontSize: "0.95rem", fontWeight: 700, color: "var(--primary)", letterSpacing: "0.06em" }}>
                    {MEAL_LABELS[meal.meal_type] || meal.meal_type}
                  </span>
                  {(meal.calories || meal.macros) && (
                    <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-condensed)" }}>
                      {meal.calories}{meal.calories && meal.macros ? " · " : ""}{meal.macros}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "0.92rem", color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{meal.foods}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
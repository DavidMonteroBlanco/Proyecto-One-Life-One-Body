// src/user/MyWorkouts.tsx

import { useState, useEffect } from "react";
import { useAuth } from "../context/Authcontext";
import api from "../services/api";
import Icon from "../components/ui/Icon";
import { nivelLabel, descansoLabel } from "../lib/pesos";
import "./Tracking.css";
import "./MyWorkouts.css";

/* ══════════════════════════════════════════════════════════
   MIS ENTRENOS

   Lo que el cliente abre desde el aviso del email. Está pensado
   para mirarlo en el móvil entre series, así que el entreno más
   reciente viene desplegado y los anteriores plegados.
   ══════════════════════════════════════════════════════════ */

type Ejercicio = {
  id: number; name: string; sets: number; reps: string;
  weight: string | null; rest_seconds: number; notes: string | null;
};

type Workout = {
  id: number; title: string; goal: string | null;
  duration_minutes: number; level: string; notes: string | null;
  exercises: Ejercicio[];
  created_at: string;
};

export default function MyWorkouts() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [abierto, setAbierto] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/workouts");
        const lista: Workout[] = Array.isArray(data) ? data : [];
        setWorkouts(lista);
        // El más reciente abierto: es el que se viene a mirar.
        if (lista.length > 0) setAbierto(lista[0].id);
      } catch { /* la pantalla ya enseña el estado vacío */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const firstName = user?.name?.split(" ")[0] || "Usuario";

  return (
    <div className="mw">
      <div className="tracking-header">
        <div>
          <h1 className="tracking-title">Mis entrenos</h1>
          <p className="tracking-sub">Tus sesiones y pesos, {firstName}</p>
        </div>
      </div>

      {loading ? (
        <div className="route-loader" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" /> Cargando...
        </div>
      ) : workouts.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon"><Icon name="dumbbell" size={44} strokeWidth={1.2} /></span>
          <h2 className="empty-state__title">Sin entrenos todavía</h2>
          <p>
            Tu entrenador te asignará tus sesiones. Cuando lo haga te llegará
            un aviso por email y lo verás aquí.
          </p>
        </div>
      ) : (
        <div className="mw__lista">
          {workouts.map((w, i) => {
            const desplegado = abierto === w.id;
            return (
              <article key={w.id} className={`mw__item ${desplegado ? "mw__item--abierto" : ""}`}>
                <button
                  className="mw__cab"
                  onClick={() => setAbierto(desplegado ? null : w.id)}
                  aria-expanded={desplegado}
                >
                  <div className="mw__cab-texto">
                    <div className="mw__cab-titulo-fila">
                      <span className="mw__titulo">{w.title}</span>
                      {i === 0 && <span className="badge badge--brand">El más reciente</span>}
                    </div>
                    <span className="mw__meta">
                      {nivelLabel(w.level)} · {w.duration_minutes} min · {w.exercises.length}{" "}
                      {w.exercises.length === 1 ? "ejercicio" : "ejercicios"}
                      {w.goal ? ` · ${w.goal}` : ""}
                    </span>
                  </div>
                  <span className={`mw__chevron ${desplegado ? "mw__chevron--abierto" : ""}`}>
                    <Icon name="chevron-right" size={18} />
                  </span>
                </button>

                {desplegado && (
                  <div className="mw__cuerpo">
                    {w.notes && (
                      <p className="mw__notas">
                        <Icon name="info" size={14} /> {w.notes}
                      </p>
                    )}

                    {w.exercises.length === 0 ? (
                      <p className="mw__sin-ejercicios">
                        Este entreno todavía no tiene ejercicios detallados.
                      </p>
                    ) : (
                      <ol className="mw__ejercicios">
                        {w.exercises.map((e) => (
                          <li key={e.id} className="mw__ej">
                            <div className="mw__ej-nombre">{e.name}</div>
                            <div className="mw__ej-datos">
                              <span className="mw__dato">
                                <span className="mw__dato-label">Series</span>
                                <span className="mw__dato-valor">{e.sets}</span>
                              </span>
                              <span className="mw__dato">
                                <span className="mw__dato-label">Reps</span>
                                <span className="mw__dato-valor">{e.reps}</span>
                              </span>
                              <span className="mw__dato mw__dato--peso">
                                <span className="mw__dato-label">Peso</span>
                                <span className="mw__dato-valor">{e.weight || "—"}</span>
                              </span>
                              <span className="mw__dato">
                                <span className="mw__dato-label">Descanso</span>
                                <span className="mw__dato-valor">{descansoLabel(e.rest_seconds)}</span>
                              </span>
                            </div>
                            {e.notes && <div className="mw__ej-nota">{e.notes}</div>}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

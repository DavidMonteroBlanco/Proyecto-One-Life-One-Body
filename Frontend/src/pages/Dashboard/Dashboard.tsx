// src/pages/Dashboard/Dashboard.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/Authcontext";
import api from "../../services/api";
import "./Dashboard.css";

type Stats = {
  total_records: number;
  current_weight: number | null;
  start_weight: number | null;
  total_change: number | null;
  last_week_change: number | null;
  current_fat: number | null;
  current_muscle: number | null;
};

type WeightRecord = {
  id: number; weight_kg: number; fat_percentage: number | null;
  muscle_percentage: number | null; recorded_at: string;
};

function n(v: any) { return Number(v || 0); }

/* ── Frases motivadoras (se elige una al día) ── */
const QUOTES = [
  { text: "El dolor que sientes hoy sera la fuerza que sentiras mañana.", author: "Arnold Schwarzenegger" },
  { text: "No cuentes los dias. Haz que los dias cuenten.", author: "Muhammad Ali" },
  { text: "Tu cuerpo puede soportar casi todo. Es tu mente la que tienes que convencer.", author: "Andrew Murphy" },
  { text: "El exito no se mide por lo que logras, sino por los obstaculos que superas.", author: "Booker T. Washington" },
  { text: "La disciplina es el puente entre tus metas y tus logros.", author: "Jim Rohn" },
  { text: "No tienes que ser extremo, solo constante.", author: "One Life One Body" },
  { text: "Un año a partir de ahora desearas haber empezado hoy.", author: "Karen Lamb" },
  { text: "El mejor proyecto en el que puedes trabajar eres tu mismo.", author: "Sonny Franco" },
  { text: "Cada repeticion te acerca a tu mejor version.", author: "One Life One Body" },
  { text: "El cuerpo logra lo que la mente cree.", author: "Napoleon Hill" },
  { text: "Entrena como si tu vida dependiera de ello. Porque asi es.", author: "One Life One Body" },
  { text: "La unica mala sesion de entrenamiento es la que no se hizo.", author: "Desconocido" },
  { text: "Fuerte no es aquel que nunca cae, sino el que siempre se levanta.", author: "One Life One Body" },
  { text: "Tu unico limite eres tu mismo.", author: "One Life One Body" },
];

function getDailyQuote() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}

/* ── Mini chart SVG ── */
function MiniChart({ records }: { records: WeightRecord[] }) {
  const sorted = [...records].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
  if (sorted.length < 2) return null;

  const w = 280, h = 80, pad = 8;
  const weights = sorted.map(r => n(r.weight_kg));
  const min = Math.min(...weights) - 0.5;
  const max = Math.max(...weights) + 0.5;
  const range = max - min || 1;

  const points = sorted.map((_, i) => {
    const x = pad + (i / (sorted.length - 1)) * (w - pad * 2);
    const y = pad + (h - pad * 2) - ((weights[i] - min) / range) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const areaPoints = points.join(" ") + ` ${(pad + (w - pad * 2)).toFixed(1)},${(h - pad).toFixed(1)} ${pad},${(h - pad).toFixed(1)}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="dash-chart__svg">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#chartGrad)" />
      <polyline points={points.join(" ")} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {sorted.length <= 12 && points.map((p, i) => {
        const [cx, cy] = p.split(",");
        return <circle key={i} cx={cx} cy={cy} r="3" fill="var(--bg-deep)" stroke="var(--primary)" strokeWidth="1.5" />;
      })}
    </svg>
  );
}

/* ── Greeting by time of day ── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos dias";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const quote = getDailyQuote();

  useEffect(() => {
    const load = async () => {
      try {
        const [statRes, recRes] = await Promise.all([
          api.get("/weight-records/stats"),
          api.get("/weight-records"),
        ]);
        setStats(statRes.data);
        setRecords(Array.isArray(recRes.data) ? recRes.data : []);
      } catch { /* */ }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const firstName = user?.name?.split(" ")[0] || "Usuario";
  const hasData = stats && stats.total_records > 0;
  const lastRecord = records.length > 0 ? records[0] : null;
  const daysSinceLastRecord = lastRecord
    ? Math.floor((Date.now() - new Date(lastRecord.recorded_at).getTime()) / 86400000)
    : null;

  return (
    <div className="dash">
      {/* ── Header ── */}
      <div className="dash__header">
        <div>
          <p className="dash__greeting">{getGreeting()}</p>
          <h1 className="dash__name">{firstName}</h1>
        </div>
        <div className="dash__date">
          {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
        </div>
      </div>

      {/* ── Frase motivadora ── */}
      <div className="dash__quote">
        <span className="dash__quote-mark">"</span>
        <p className="dash__quote-text">{quote.text}</p>
        <span className="dash__quote-author">— {quote.author}</span>
      </div>

      {loading ? (
        <div className="dash__loading"><span className="dash__spinner" /> Cargando tu progreso...</div>
      ) : !hasData ? (
        /* ── Sin datos ── */
        <div className="dash__empty">
          <span className="dash__empty-icon">⚖</span>
          <h2>Tu viaje empieza aqui</h2>
          <p>Tu entrenador registrara tu primer pesaje pronto. Mientras tanto, contacta con David para empezar.</p>
          <div className="dash__empty-links">
            <a href="https://wa.me/34631986391" target="_blank" rel="noreferrer" className="btn-primary">WhatsApp Muky</a>
            <Link to="/my-profile" className="btn-ghost">Mi perfil</Link>
          </div>
        </div>
      ) : (
        <>
          {/* ── Stats cards ── */}
          <div className="dash__stats">
            <div className="dash__stat dash__stat--big">
              <span className="dash__stat-label">Peso actual</span>
              <span className="dash__stat-value">{n(stats.current_weight).toFixed(1)}<small>kg</small></span>
              {stats.last_week_change !== null && (
                <span className={`dash__stat-change ${n(stats.last_week_change) <= 0 ? "dash__stat-change--good" : "dash__stat-change--bad"}`}>
                  {n(stats.last_week_change) > 0 ? "+" : ""}{n(stats.last_week_change).toFixed(1)} kg esta semana
                </span>
              )}
            </div>

            <div className="dash__stat">
              <span className="dash__stat-label">Cambio total</span>
              <span className={`dash__stat-value ${n(stats.total_change) <= 0 ? "dash__stat-value--green" : "dash__stat-value--red"}`}>
                {n(stats.total_change) > 0 ? "+" : ""}{n(stats.total_change).toFixed(1)}<small>kg</small>
              </span>
              <span className="dash__stat-sub">desde {n(stats.start_weight).toFixed(1)} kg</span>
            </div>

            {stats.current_fat !== null && (
              <div className="dash__stat">
                <span className="dash__stat-label">Grasa corporal</span>
                <span className="dash__stat-value dash__stat-value--amber">{n(stats.current_fat).toFixed(1)}<small>%</small></span>
              </div>
            )}

            {stats.current_muscle !== null && (
              <div className="dash__stat">
                <span className="dash__stat-label">Masa muscular</span>
                <span className="dash__stat-value dash__stat-value--green">{n(stats.current_muscle).toFixed(1)}<small>%</small></span>
              </div>
            )}
          </div>

          {/* ── Chart ── */}
          {records.length >= 2 && (
            <div className="dash__chart-card">
              <div className="dash__chart-header">
                <h2>Evolucion de peso</h2>
                <Link to="/my-tracking" className="dash__chart-link">Ver completo →</Link>
              </div>
              <MiniChart records={records.slice(0, 20)} />
            </div>
          )}

          {/* ── Info row ── */}
          <div className="dash__info-row">
            <div className="dash__info-card">
              <span className="dash__info-icon">📅</span>
              <div>
                <span className="dash__info-label">Total pesajes</span>
                <span className="dash__info-value">{stats.total_records}</span>
              </div>
            </div>

            <div className="dash__info-card">
              <span className="dash__info-icon">⏱</span>
              <div>
                <span className="dash__info-label">Ultimo pesaje</span>
                <span className="dash__info-value">
                  {daysSinceLastRecord !== null
                    ? daysSinceLastRecord === 0 ? "Hoy" : daysSinceLastRecord === 1 ? "Ayer" : `Hace ${daysSinceLastRecord} dias`
                    : "—"}
                </span>
              </div>
            </div>

            <div className="dash__info-card">
              <span className="dash__info-icon">🎯</span>
              <div>
                <span className="dash__info-label">Peso inicial</span>
                <span className="dash__info-value">{n(stats.start_weight).toFixed(1)} kg</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Quick links ── */}
      <div className="dash__links">
        <Link to="/my-tracking" className="dash__link-card">
          <span className="dash__link-icon">📊</span>
          <span className="dash__link-title">Seguimiento</span>
          <span className="dash__link-sub">Grafica y historial</span>
        </Link>
        <Link to="/my-profile" className="dash__link-card">
          <span className="dash__link-icon">👤</span>
          <span className="dash__link-title">Mi perfil</span>
          <span className="dash__link-sub">Datos y contraseña</span>
        </Link>
        <a href="https://wa.me/34631986391" target="_blank" rel="noreferrer" className="dash__link-card">
          <span className="dash__link-icon">💬</span>
          <span className="dash__link-title">WhatsApp</span>
          <span className="dash__link-sub">Contacta con Muky</span>
        </a>
      </div>
    </div>
  );
}
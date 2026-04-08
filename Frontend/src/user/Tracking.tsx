// src/user/Tracking.tsx

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/Authcontext";
import api from "../services/api";
import "./Tracking.css";

/* ── Tipos ── */
type WeightRecord = {
  id: number;
  weight_kg: number;
  fat_percentage: number | null;
  muscle_percentage: number | null;
  notes: string | null;
  recorded_at: string;
};

type Stats = {
  total_records: number;
  current_weight: number | null;
  start_weight: number | null;
  total_change: number | null;
  last_week_change: number | null;
  current_fat: number | null;
  current_muscle: number | null;
};

/* ══════════════════════════════════════════════════════════════
   MINI CHART — SVG line chart (no dependencies)
   ══════════════════════════════════════════════════════════════ */
function WeightChart({ records }: { records: WeightRecord[] }) {
  const sorted = [...records].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  if (sorted.length < 2) {
    return (
      <div className="chart-empty">
        <span className="chart-empty__icon">◎</span>
        <p>Necesitas al menos 2 pesajes para ver la gráfica</p>
      </div>
    );
  }

  const W = 700;
  const H = 280;
  const PAD = { top: 30, right: 30, bottom: 40, left: 55 };

  const weights = sorted.map((r) => r.weight_kg);
  const minW = Math.floor(Math.min(...weights) - 1);
  const maxW = Math.ceil(Math.max(...weights) + 1);
  const rangeW = maxW - minW || 1;

  const xScale = (i: number) => PAD.left + (i / (sorted.length - 1)) * (W - PAD.left - PAD.right);
  const yScale = (v: number) => PAD.top + (1 - (v - minW) / rangeW) * (H - PAD.top - PAD.bottom);

  // Build path
  const points = sorted.map((r, i) => ({ x: xScale(i), y: yScale(r.weight_kg) }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Gradient area
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${H - PAD.bottom} L ${points[0].x} ${H - PAD.bottom} Z`;

  // Y axis labels
  const yTicks = 5;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => minW + (rangeW / yTicks) * i);

  // X axis labels (show ~6 dates max)
  const xStep = Math.max(1, Math.floor(sorted.length / 6));

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(126,232,232,0.25)" />
            <stop offset="100%" stopColor="rgba(126,232,232,0)" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yLabels.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left} x2={W - PAD.right}
              y1={yScale(v)} y2={yScale(v)}
              stroke="rgba(126,232,232,0.06)" strokeWidth="1"
            />
            <text x={PAD.left - 10} y={yScale(v) + 4}
              fill="rgba(143,184,184,0.5)" fontSize="11" textAnchor="end"
              fontFamily="'Barlow Condensed', sans-serif">
              {v.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#chartGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#7ee8e8" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#0d1515" stroke="#7ee8e8" strokeWidth="2" />
            {/* Tooltip on hover area */}
            <title>{`${sorted[i].recorded_at}: ${sorted[i].weight_kg} kg`}</title>
            <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
          </g>
        ))}

        {/* X axis labels */}
        {sorted.map((r, i) =>
          i % xStep === 0 || i === sorted.length - 1 ? (
            <text key={i} x={xScale(i)} y={H - PAD.bottom + 20}
              fill="rgba(143,184,184,0.5)" fontSize="10" textAnchor="middle"
              fontFamily="'Barlow Condensed', sans-serif">
              {formatDateShort(r.recorded_at)}
            </text>
          ) : null
        )}

        {/* "kg" label */}
        <text x={12} y={PAD.top - 10} fill="rgba(143,184,184,0.4)"
          fontSize="11" fontFamily="'Barlow Condensed', sans-serif">
          kg
        </text>
      </svg>
    </div>
  );
}

/* ── Helpers ── */
function formatDateShort(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function formatDateFull(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════ */
export default function Tracking() {
  const { user } = useAuth();

  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  /* ── Load data ── */
  const loadData = async () => {
    try {
      const [recRes, statRes] = await Promise.all([
        api.get("/weight-records"),
        api.get("/weight-records/stats"),
      ]);
      setRecords(recRes.data);
      setStats(statRes.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  /* ── Render ── */
  if (loading) {
    return (
      <div className="tracking-loading">
        <span className="tracking-spinner" />
        <p>Cargando seguimiento...</p>
      </div>
    );
  }

  return (
    <div className="tracking-page">

      {/* ── Header ── */}
      <div className="tracking-header">
        <div>
          <h1 className="tracking-title">Seguimiento</h1>
          <p className="tracking-sub">
            Tu evolución de peso semana a semana,{" "}
            {user?.name?.split(" ")[0] || "Usuario"}
          </p>
        </div>
      </div>

      {/* ── Stats cards ── */}
      {stats && stats.total_records > 0 && (
        <div className="tracking-stats">
          <div className="stat-card">
            <span className="stat-card__label">Peso actual</span>
            <span className="stat-card__value">
              {stats.current_weight?.toFixed(1)} <small>kg</small>
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Cambio total</span>
            <span className={`stat-card__value ${(stats.total_change ?? 0) <= 0 ? "stat-card__value--positive" : "stat-card__value--negative"}`}>
              {(stats.total_change ?? 0) > 0 ? "+" : ""}{stats.total_change?.toFixed(1)} <small>kg</small>
            </span>
          </div>
          {stats.current_fat !== null && (
            <div className="stat-card">
              <span className="stat-card__label">% Grasa</span>
              <span className="stat-card__value stat-card__value--fat">
                {stats.current_fat.toFixed(1)}<small>%</small>
              </span>
            </div>
          )}
          {stats.current_muscle !== null && (
            <div className="stat-card">
              <span className="stat-card__label">% Musculo</span>
              <span className="stat-card__value stat-card__value--muscle">
                {stats.current_muscle.toFixed(1)}<small>%</small>
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Chart ── */}
      <div className="tracking-chart-card">
        <h2 className="tracking-section-title">Evolución de peso</h2>
        <WeightChart records={records} />
      </div>

      {/* ── Records list ── */}
      <div className="tracking-records">
        <h2 className="tracking-section-title">Historial de pesajes</h2>

        {records.length === 0 ? (
          <div className="tracking-empty">
            <span className="tracking-empty__icon">⚖</span>
            <p>No tienes pesajes registrados todavía.</p>
            <p className="tracking-empty__hint">Tu entrenador registrará tus pesajes semanales.</p>
          </div>
        ) : (
          <div className="tracking-records__list">
            {records.map((r, i) => {
              const prev = records[i + 1];
              const diff = prev ? r.weight_kg - prev.weight_kg : null;
              return (
                <div key={r.id} className="record-row">
                  <div className="record-row__date">
                    <span className="record-row__day">{formatDateFull(r.recorded_at)}</span>
                  </div>
                  <div className="record-row__weight">
                    {r.weight_kg.toFixed(1)} <small>kg</small>
                  </div>
                  {diff !== null && (
                    <div className={`record-row__diff ${diff <= 0 ? "record-row__diff--down" : "record-row__diff--up"}`}>
                      {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                    </div>
                  )}
                  {r.fat_percentage !== null && (
                    <div className="record-row__comp record-row__comp--fat">
                      {r.fat_percentage.toFixed(1)}% grasa
                    </div>
                  )}
                  {r.muscle_percentage !== null && (
                    <div className="record-row__comp record-row__comp--muscle">
                      {r.muscle_percentage.toFixed(1)}% musc
                    </div>
                  )}
                  {r.notes && (
                    <div className="record-row__notes">{r.notes}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
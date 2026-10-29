// src/user/Tracking.tsx

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/Authcontext";
import api from "../services/api";
import Icon from "../components/ui/Icon";
import EvolutionChart from "../components/charts/EvolutionChart";
import type { PuntoSerie } from "../components/charts/EvolutionChart";
import Sparkline from "../components/charts/Sparkline";
import CompositionRing from "../components/charts/CompositionRing";
import ConsistencyStrip from "../components/charts/ConsistencyStrip";
import { useCountUp } from "../lib/useCountUp";
import { useReveal } from "../lib/motion";
import "./Tracking.css";

/* ══════════════════════════════════════════════════════════
   SEGUIMIENTO

   Lo que el cliente abre para ver cómo va. El orden de la página
   responde a las preguntas en el orden en que se hacen:

     1. ¿Cuánto peso hoy y cómo voy?      -> cabecera
     2. ¿Qué forma tiene mi evolución?     -> gráfica
     3. ¿Cómo estoy de grasa y músculo?    -> anillo
     4. ¿Estoy siendo constante?           -> tira de semanas
     5. ¿Qué pasó cada día?                -> historial
   ══════════════════════════════════════════════════════════ */

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

/* ── Métricas que se pueden graficar ── */
type ClaveMetrica = "peso" | "grasa" | "musculo";

const METRICAS: {
  clave: ClaveMetrica;
  nombre: string;
  unidad: string;
  bajarEsBueno: boolean;
  campo: keyof Pick<WeightRecord, "weight_kg" | "fat_percentage" | "muscle_percentage">;
}[] = [
  { clave: "peso",    nombre: "Peso",    unidad: "kg", bajarEsBueno: true,  campo: "weight_kg" },
  { clave: "grasa",   nombre: "Grasa",   unidad: "%",  bajarEsBueno: true,  campo: "fat_percentage" },
  { clave: "musculo", nombre: "Músculo", unidad: "%",  bajarEsBueno: false, campo: "muscle_percentage" },
];

/* ── Rangos de tiempo ── */
const RANGOS: { clave: string; nombre: string; dias: number | null }[] = [
  { clave: "1m",   nombre: "1 mes",   dias: 31 },
  { clave: "3m",   nombre: "3 meses", dias: 92 },
  { clave: "6m",   nombre: "6 meses", dias: 183 },
  { clave: "todo", nombre: "Todo",    dias: null },
];

const num = (v: number | string | null | undefined) => Number(v ?? 0);
const dec = (v: number, d = 1) => v.toFixed(d).replace(".", ",");

export default function Tracking() {
  const { user } = useAuth();
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [metrica, setMetrica] = useState<ClaveMetrica>("peso");
  const [rango, setRango] = useState("3m");
  const [notaAbierta, setNotaAbierta] = useState<number | null>(null);

  useReveal(loading);

  useEffect(() => {
    const load = async () => {
      try {
        const [rec, est] = await Promise.all([
          api.get("/weight-records"),
          api.get("/weight-records/stats"),
        ]);
        setRecords(Array.isArray(rec.data) ? rec.data : []);
        setStats(est.data);
      } catch {
        // La pantalla ya tiene su estado vacío; no hay nada que decir aquí.
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* La API los da del más reciente al más antiguo. La gráfica necesita
     lo contrario, así que se ordena una vez y se reutiliza. */
  const antiguosPrimero = useMemo(
    () => [...records].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at)),
    [records]
  );

  /* Métricas con datos de verdad: si nadie ha medido la grasa, su
     pestaña no debe existir en vez de abrir una gráfica vacía. */
  const disponibles = useMemo(
    () => METRICAS.filter((m) =>
      m.campo === "weight_kg" || antiguosPrimero.some((r) => r[m.campo] !== null)
    ),
    [antiguosPrimero]
  );

  const metricaActual = disponibles.find((m) => m.clave === metrica) ?? METRICAS[0];

  /* Puntos de la gráfica, ya filtrados por rango. */
  const puntos = useMemo<PuntoSerie[]>(() => {
    const dias = RANGOS.find((r) => r.clave === rango)?.dias ?? null;
    const desde = dias === null ? 0 : Date.now() - dias * 86_400_000;

    return antiguosPrimero
      .filter((r) => r[metricaActual.campo] !== null)
      .filter((r) => new Date(r.recorded_at).getTime() >= desde)
      .map((r) => ({ fecha: r.recorded_at, valor: num(r[metricaActual.campo]) }));
  }, [antiguosPrimero, metricaActual, rango]);

  /* Rangos que de verdad contienen algo, para no ofrecer "1 mes"
     cuando en el último mes no hubo ni un pesaje. */
  const rangosUtiles = useMemo(() => {
    const conDato = antiguosPrimero.filter((r) => r[metricaActual.campo] !== null);
    return RANGOS.filter((r) => {
      if (r.dias === null) return true;
      const desde = Date.now() - r.dias * 86_400_000;
      return conDato.some((x) => new Date(x.recorded_at).getTime() >= desde);
    });
  }, [antiguosPrimero, metricaActual]);

  // Si el rango elegido se queda sin datos al cambiar de métrica,
  // se cae al más amplio en vez de enseñar una gráfica vacía.
  const rangoActivo = rangosUtiles.some((r) => r.clave === rango) ? rango : "todo";

  const puntosVisibles = useMemo<PuntoSerie[]>(() => {
    if (rangoActivo === rango) return puntos;
    return antiguosPrimero
      .filter((r) => r[metricaActual.campo] !== null)
      .map((r) => ({ fecha: r.recorded_at, valor: num(r[metricaActual.campo]) }));
  }, [puntos, rangoActivo, rango, antiguosPrimero, metricaActual]);

  /* Para las miniaturas: los últimos 12 valores de cada métrica. */
  const ultimosPesos = useMemo(
    () => antiguosPrimero.slice(-12).map((r) => num(r.weight_kg)),
    [antiguosPrimero]
  );

  const sinDatos = !loading && records.length === 0;

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

      <div className="tracking-header">
        <div>
          <h1 className="tracking-title">Seguimiento</h1>
          <p className="tracking-sub">
            Tu evolución semana a semana, {user?.name?.split(" ")[0] || "Usuario"}
          </p>
        </div>
      </div>

      {sinDatos ? (
        <div className="empty-state">
          <span className="empty-state__icon"><Icon name="scale" size={44} strokeWidth={1.2} /></span>
          <h2 className="empty-state__title">Aún no hay pesajes</h2>
          <p>
            Tu entrenador registrará tus pesajes semanales y aquí verás la
            gráfica de tu evolución, la composición corporal y tu constancia.
          </p>
        </div>
      ) : (
        <>
          {/* ══ 1. CABECERA DE DATOS ══ */}
          {stats && (
            <div className="tk__hero stagger">
              <div className="tk__hero-principal" data-reveal>
                <span className="tk__hero-label">Peso actual</span>
                <Contador valor={stats.current_weight} unidad="kg" grande />
                {stats.last_week_change !== null && (
                  <Delta
                    valor={num(stats.last_week_change)}
                    bajarEsBueno
                    sufijo="esta semana"
                  />
                )}
                {ultimosPesos.length >= 2 && (
                  <div className="tk__hero-spark">
                    <Sparkline valores={ultimosPesos} alto={40} />
                  </div>
                )}
              </div>

              <div className="tk__hero-lado">
                <TarjetaDato
                  etiqueta="Cambio total"
                  valor={stats.total_change}
                  unidad="kg"
                  conSigno
                  bajarEsBueno
                  pie={`desde ${dec(num(stats.start_weight))} kg`}
                  data-reveal
                />
                <TarjetaDato
                  etiqueta="Pesajes"
                  valor={stats.total_records}
                  unidad=""
                  decimales={0}
                  pie={textoUltimo(antiguosPrimero)}
                  data-reveal
                />
              </div>
            </div>
          )}

          {/* ══ 2. GRÁFICA ══ */}
          <div className="tracking-chart-card" data-reveal>
            <div className="tk__grafica-cab">
              <h2 className="tracking-section-title tracking-section-title--flush">
                Evolución
              </h2>

              <div className="tk__controles">
                {disponibles.length > 1 && (
                  <div className="tk__tabs" role="tablist" aria-label="Métrica">
                    {disponibles.map((m) => (
                      <button
                        key={m.clave}
                        role="tab"
                        aria-selected={metricaActual.clave === m.clave}
                        className={`tk__tab ${metricaActual.clave === m.clave ? "tk__tab--activa" : ""}`}
                        onClick={() => setMetrica(m.clave)}
                      >
                        {m.nombre}
                      </button>
                    ))}
                  </div>
                )}

                {rangosUtiles.length > 1 && (
                  <div className="tk__tabs" role="tablist" aria-label="Periodo">
                    {rangosUtiles.map((r) => (
                      <button
                        key={r.clave}
                        role="tab"
                        aria-selected={rangoActivo === r.clave}
                        className={`tk__tab ${rangoActivo === r.clave ? "tk__tab--activa" : ""}`}
                        onClick={() => setRango(r.clave)}
                      >
                        {r.nombre}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {puntosVisibles.length < 2 ? (
              <div className="chart-empty">
                <span className="chart-empty__icon">
                  <Icon name="chart" size={30} strokeWidth={1.3} />
                </span>
                <p>Hacen falta al menos dos medidas para dibujar la evolución</p>
              </div>
            ) : (
              <EvolutionChart
                puntos={puntosVisibles}
                unidad={metricaActual.unidad}
                bajarEsBueno={metricaActual.bajarEsBueno}
                mostrarTendencia={puntosVisibles.length >= 4}
                etiqueta={`Evolución de ${metricaActual.nombre.toLowerCase()}`}
              />
            )}
          </div>

          {/* ══ 3 y 4. COMPOSICIÓN Y CONSTANCIA ══ */}
          <div className="tk__fila-doble">
            {(stats?.current_fat !== null || stats?.current_muscle !== null) && (
              <div className="tracking-chart-card" data-reveal>
                <h2 className="tracking-section-title">Composición corporal</h2>
                <CompositionRing
                  grasa={stats?.current_fat ?? null}
                  musculo={stats?.current_muscle ?? null}
                />
              </div>
            )}

            <div className="tracking-chart-card" data-reveal>
              <h2 className="tracking-section-title">Constancia</h2>
              <ConsistencyStrip fechas={records.map((r) => r.recorded_at)} />
            </div>
          </div>

          {/* ══ 5. HISTORIAL ══ */}
          <div className="tracking-records">
            <h2 className="tracking-section-title">Historial de pesajes</h2>
            <div className="tk__historial">
              {records.map((r, i) => {
                const anterior = records[i + 1];     // el siguiente es el más antiguo
                const diff = anterior ? num(r.weight_kg) - num(anterior.weight_kg) : null;
                const abierta = notaAbierta === r.id;

                return (
                  <div key={r.id} className="tk__fila">
                    <div className="tk__fila-fecha">
                      <span className="tk__fila-dia">{diaMes(r.recorded_at)}</span>
                      <span className="tk__fila-anio">{anio(r.recorded_at)}</span>
                    </div>

                    <div className="tk__fila-peso">
                      {dec(num(r.weight_kg))}<small>kg</small>
                    </div>

                    {/* Barra del cambio: el ancho es proporcional al kilo
                        y medio, que es un cambio semanal ya grande. Más
                        allá se queda al 100 % en vez de desbordar. */}
                    <div className="tk__fila-barra">
                      {diff !== null && Math.abs(diff) > 0.001 && (
                        <span
                          className={`tk__barra ${diff < 0 ? "tk__barra--baja" : "tk__barra--sube"}`}
                          style={{ width: `${Math.min(100, (Math.abs(diff) / 1.5) * 100)}%` }}
                        />
                      )}
                    </div>

                    <div className="tk__fila-delta">
                      {diff === null ? (
                        <span className="tk__inicio">inicio</span>
                      ) : (
                        <span className={diff <= 0 ? "tk__delta--baja" : "tk__delta--sube"}>
                          {diff > 0 ? "+" : ""}{dec(diff)}
                        </span>
                      )}
                    </div>

                    <div className="tk__fila-comp">
                      {r.fat_percentage !== null && (
                        <span className="tk__pastilla tk__pastilla--grasa">
                          {dec(num(r.fat_percentage))}% grasa
                        </span>
                      )}
                      {r.muscle_percentage !== null && (
                        <span className="tk__pastilla tk__pastilla--musculo">
                          {dec(num(r.muscle_percentage))}% músculo
                        </span>
                      )}
                    </div>

                    {r.notes && (
                      <button
                        className="tk__nota-btn"
                        onClick={() => setNotaAbierta(abierta ? null : r.id)}
                        aria-expanded={abierta}
                      >
                        <Icon name="quote" size={13} />
                        {abierta ? "Ocultar nota" : "Ver nota"}
                      </button>
                    )}

                    {r.notes && abierta && <p className="tk__nota">{r.notes}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PIEZAS
   ══════════════════════════════════════════════════════════ */

/** Número que cuenta hasta su valor al aparecer. */
function Contador({ valor, unidad, grande = false, decimales = 1, conSigno = false }: {
  valor: number | null; unidad: string; grande?: boolean; decimales?: number; conSigno?: boolean;
}) {
  const animado = useCountUp(valor);
  if (valor === null) return <span className="tk__valor">—</span>;

  const signo = conSigno && valor > 0 ? "+" : "";

  return (
    <span className={`tk__valor ${grande ? "tk__valor--grande" : ""}`}>
      {signo}{dec(animado, decimales)}
      {unidad && <small>{unidad}</small>}
    </span>
  );
}

/** Pastilla de cambio, teñida según si va en la dirección buena. */
function Delta({ valor, bajarEsBueno, sufijo }: { valor: number; bajarEsBueno: boolean; sufijo: string }) {
  if (Math.abs(valor) < 0.05) {
    return <span className="tk__delta tk__delta--igual">Sin cambios {sufijo}</span>;
  }
  const bien = (valor < 0) === bajarEsBueno;
  return (
    <span className={`tk__delta ${bien ? "tk__delta--bien" : "tk__delta--mal"}`}>
      <span className={`tk__flecha ${valor < 0 ? "tk__flecha--abajo" : ""}`}>
        <Icon name="arrow-right" size={13} />
      </span>
      {valor > 0 ? "+" : ""}{dec(valor)} kg {sufijo}
    </span>
  );
}

function TarjetaDato({ etiqueta, valor, unidad, pie, conSigno = false, bajarEsBueno, decimales = 1 }: {
  etiqueta: string; valor: number | null; unidad: string; pie?: string;
  conSigno?: boolean; bajarEsBueno?: boolean; decimales?: number;
}) {
  const tono =
    bajarEsBueno === undefined || valor === null || Math.abs(valor) < 0.05
      ? ""
      : (valor < 0) === bajarEsBueno ? "tk__tarjeta--bien" : "tk__tarjeta--mal";

  return (
    <div className={`tk__tarjeta ${tono}`}>
      <span className="tk__tarjeta-label">{etiqueta}</span>
      <Contador valor={valor} unidad={unidad} conSigno={conSigno} decimales={decimales} />
      {pie && <span className="tk__tarjeta-pie">{pie}</span>}
    </div>
  );
}

/* ── Fechas ── */

const diaMes = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });

const anio = (iso: string) => String(new Date(iso).getFullYear());

function textoUltimo(antiguosPrimero: WeightRecord[]): string {
  const ultimo = antiguosPrimero[antiguosPrimero.length - 1];
  if (!ultimo) return "";

  // Se compara por día natural, no por horas: un pesaje de ayer por la
  // tarde debe decir "ayer", no "hace 0 días".
  const hoy = new Date();
  const a = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const d = new Date(ultimo.recorded_at);
  const b = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dias = Math.round((a.getTime() - b.getTime()) / 86_400_000);

  if (dias <= 0) return "el último, hoy";
  if (dias === 1) return "el último, ayer";
  if (dias < 7) return `el último, hace ${dias} días`;
  const semanas = Math.round(dias / 7);
  return `el último, hace ${semanas} ${semanas === 1 ? "semana" : "semanas"}`;
}

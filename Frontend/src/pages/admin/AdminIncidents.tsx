// src/pages/admin/AdminIncidents.tsx

import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import Icon from "../../components/ui/Icon";
import "./AdminPages.css";
import "./AdminIncidents.css";

/* ══════════════════════════════════════════════════════════
   INCIDENCIAS

   Aquí aparece lo que ha fallado al entregar algo a un cliente,
   casi siempre un email que no ha salido.

   El sistema lo reintenta solo, con esperas cada vez más largas
   (2, 10, 60 y 240 minutos). Esta pantalla sirve para dos cosas:
   ver lo que sigue en cola y empujar a mano lo que ya agotó los
   intentos.

   Importante: cuando un envío falla, el aviso dentro de la web se
   crea igualmente. El cliente nunca se queda sin ver su plan por
   un problema de correo; lo que falta es solo el email.
   ══════════════════════════════════════════════════════════ */

type Incidencia = {
  id: number;
  operation: string;
  summary: string;
  last_error: string | null;
  attempts: number;
  next_attempt_at: string | null;
  agotada: boolean;
  cliente: string | null;
  created_at: string;
};

/** Nombres legibles para lo que el backend guarda como clave. */
const OPERACIONES: Record<string, string> = {
  enviar_dieta: "Envío de dieta",
  enviar_entreno: "Envío de entreno",
};

function nombreOperacion(clave: string): string {
  return OPERACIONES[clave] ?? clave.replace(/_/g, " ");
}

function fecha(valor: string | null): string {
  if (!valor) return "—";
  return new Date(valor).toLocaleString("es-ES", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminIncidents() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [pendientes, setPendientes] = useState(0);
  const [agotadas, setAgotadas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [abierta, setAbierta] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/incidents");
      setIncidencias(data.incidents || []);
      setPendientes(data.pending ?? 0);
      setAgotadas(data.exhausted ?? 0);
    } catch {
      setMsg({ type: "err", text: "No se han podido cargar las incidencias." });
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRetry = async (inc: Incidencia) => {
    if (busyId) return;
    setBusyId(inc.id); setMsg(null);
    try {
      const { data } = await api.post(`/admin/incidents/${inc.id}/retry`);
      setMsg({ type: "ok", text: data.message });
    } catch (err) {
      const res = (err as { response?: { data?: { message?: string } } })?.response;
      setMsg({ type: "err", text: res?.data?.message || "El reintento ha vuelto a fallar." });
    } finally {
      setBusyId(null);
      await load();
    }
  };

  const handleDismiss = async (inc: Incidencia) => {
    if (!window.confirm(`¿Descartar esta incidencia?\n\n${inc.summary}\n\nSolo hazlo si ya lo has resuelto por otra vía.`)) return;
    try {
      await api.post(`/admin/incidents/${inc.id}/dismiss`);
      setMsg({ type: "ok", text: "Incidencia descartada." });
      await load();
    } catch {
      setMsg({ type: "err", text: "No se ha podido descartar." });
    }
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">Incidencias</h1>
      <p className="admin-page__sub">Envíos que han fallado y lo que el sistema está reintentando</p>

      {msg && <div className={`admin-msg admin-msg--${msg.type}`}>{msg.text}</div>}

      {/* ── Resumen ── */}
      <div className="inc__resumen">
        <div className="inc__kpi">
          <span className="inc__kpi-num">{pendientes}</span>
          <span className="inc__kpi-label">En cola de reintento</span>
        </div>
        <div className={`inc__kpi ${agotadas > 0 ? "inc__kpi--alerta" : ""}`}>
          <span className="inc__kpi-num">{agotadas}</span>
          <span className="inc__kpi-label">Necesitan tu atención</span>
        </div>
        <button className="admin-btn admin-btn--ghost inc__recargar" onClick={load}>
          <Icon name="refresh" size={14} /> Actualizar
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">Cargando...</div>
        ) : incidencias.length === 0 ? (
          <div className="admin-empty">
            <span className="admin-empty__icon"><Icon name="check" size={34} strokeWidth={1.3} /></span>
            Todo ha salido. No hay nada fallando.
          </div>
        ) : (
          <div className="inc__lista">
            {incidencias.map((inc) => (
              <div key={inc.id} className={`inc__item ${inc.agotada ? "inc__item--agotada" : ""}`}>
                <div className="inc__item-head">
                  <div className="inc__item-id">
                    <div className="inc__item-title-row">
                      <span className="inc__item-op">{nombreOperacion(inc.operation)}</span>
                      {inc.agotada ? (
                        <span className="badge badge--danger">
                          <Icon name="alert" size={11} /> Agotada
                        </span>
                      ) : (
                        <span className="badge badge--warning">
                          <Icon name="clock" size={11} /> Reintento {fecha(inc.next_attempt_at)}
                        </span>
                      )}
                      <span className="badge">
                        {inc.attempts} {inc.attempts === 1 ? "intento" : "intentos"}
                      </span>
                    </div>
                    <span className="inc__item-sum">{inc.summary}</span>
                    <span className="inc__item-meta">
                      {inc.cliente ? `Cliente: ${inc.cliente} · ` : ""}Falló el {fecha(inc.created_at)}
                    </span>
                  </div>

                  <div className="inc__item-actions">
                    <button
                      className="admin-btn admin-btn--primary admin-btn--sm"
                      onClick={() => handleRetry(inc)} disabled={busyId === inc.id}
                    >
                      <Icon name="send" size={13} /> {busyId === inc.id ? "Enviando..." : "Reintentar"}
                    </button>
                    <button
                      className="admin-btn admin-btn--ghost admin-btn--sm"
                      onClick={() => handleDismiss(inc)}
                    >
                      Descartar
                    </button>
                  </div>
                </div>

                {inc.last_error && (
                  <>
                    <button
                      className="inc__detalle-btn"
                      onClick={() => setAbierta(abierta === inc.id ? null : inc.id)}
                      aria-expanded={abierta === inc.id}
                    >
                      <Icon name={abierta === inc.id ? "minus" : "plus"} size={12} />
                      {abierta === inc.id ? "Ocultar el error" : "Ver el error"}
                    </button>
                    {abierta === inc.id && <pre className="inc__error">{inc.last_error}</pre>}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="inc__nota">
        Cuando un email no sale, el aviso dentro de la web se crea igualmente: el
        cliente ve su plan al entrar aunque el correo se haya quedado por el camino.
        Los reintentos van solos a los 2, 10, 60 y 240 minutos.
      </p>
    </div>
  );
}

// src/pages/admin/AdminNutritionAI.tsx

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import api from "../../services/api";
import Icon from "../../components/ui/Icon";
import { mealLabel } from "../../lib/meals";
import type { DraftPlan } from "./AiDietAssistant";
import "./AdminPages.css";
import "./AdminNutritionAI.css";

/* ══════════════════════════════════════════════════════════
   NUTRICIÓN CON IA

   Pantalla de una sola cosa: montar la alimentación de un
   cliente hablando.

   Se elige el cliente arriba y a la izquierda queda su ficha a la
   vista: peso, evolución y el plan que tiene ahora. Ese mismo
   contexto es el que recibe el asistente, así que cuando el
   entrenador dice "súbele las proteínas del desayuno", sabe de qué
   desayuno le habla.
   ══════════════════════════════════════════════════════════ */

type Cliente = {
  id: number;
  name: string;
  email: string;
  has_diet: boolean;
  diet_title: string | null;
};

type Comida = {
  id?: number;
  meal_type: string;
  foods: string;
  calories: string | null;
  macros: string | null;
};

type Plan = {
  id: number;
  title: string;
  notes: string | null;
  active: boolean;
  meals: Comida[];
  sent_at: string | null;
};

type Stats = {
  total_records: number;
  current_weight: number | null;
  start_weight: number | null;
  total_change: number | null;
  current_fat: number | null;
  current_muscle: number | null;
};

type Msg = { role: "user" | "model"; text: string };

const SUGERENCIAS_NUEVO = [
  "Plan de definición de 5 comidas, unas 1900 kcal",
  "Volumen limpio para alguien que entrena 4 días",
  "Algo sencillo de preparar, come fuera a mediodía",
];

const SUGERENCIAS_AJUSTE = [
  "Súbele las proteínas del desayuno",
  "Quítale el pescado, no le gusta",
  "Baja unas 200 kcal, se ha estancado",
  "Cámbiale las cenas por algo más ligero",
];

const dec = (v: number | null | undefined) =>
  v === null || v === undefined ? "—" : v.toFixed(1).replace(".", ",");

export default function AdminNutritionAI() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);

  const [planActual, setPlanActual] = useState<Plan | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [cargandoFicha, setCargandoFicha] = useState(false);

  const [mensajes, setMensajes] = useState<Msg[]>([]);
  const [entrada, setEntrada] = useState("");
  const [pensando, setPensando] = useState(false);
  const [montando, setMontando] = useState(false);
  const [borrador, setBorrador] = useState<DraftPlan | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const listaRef = useRef<HTMLDivElement>(null);
  const primeraVez = useRef(true);

  /* Mueve solo el panel del chat, nunca la página. */
  useEffect(() => {
    if (primeraVez.current) { primeraVez.current = false; return; }
    const l = listaRef.current;
    if (l) l.scrollTop = l.scrollHeight;
  }, [mensajes, borrador]);

  /* ── Clientes ── */
  useEffect(() => {
    api.get("/admin/diet/users")
      .then(({ data }) => setClientes(Array.isArray(data) ? data : []))
      .catch(() => setMsg({ type: "err", text: "No se ha podido cargar la lista de clientes." }))
      .finally(() => setCargandoClientes(false));
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return clientes;
    return clientes.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [clientes, busqueda]);

  /* ── Ficha del cliente elegido ── */
  const cargarFicha = useCallback(async (id: number) => {
    setCargandoFicha(true);
    setPlanActual(null);
    setStats(null);
    try {
      const [dietas, pesos] = await Promise.all([
        api.get(`/admin/diet/users/${id}`),
        api.get(`/admin/users/${id}/weight-records/stats`),
      ]);
      const planes: Plan[] = dietas.data?.plans ?? [];
      setPlanActual(planes.find((p) => p.active) ?? planes[0] ?? null);
      setStats(pesos.data ?? null);
    } catch {
      // La ficha es de apoyo: si falla, el chat sigue sirviendo.
    } finally {
      setCargandoFicha(false);
    }
  }, []);

  const elegir = (c: Cliente) => {
    setCliente(c);
    setMensajes([]);
    setBorrador(null);
    setMsg(null);
    cargarFicha(c.id);
  };

  /* ── Chat ── */
  const errorDe = (err: unknown, porDefecto: string) => {
    const res = (err as { response?: { data?: { message?: string } } })?.response;
    return res?.data?.message || porDefecto;
  };

  const enviar = async (texto: string) => {
    const t = texto.trim();
    if (!t || pensando || !cliente) return;

    const historial = mensajes.slice(-20);
    setMensajes((p) => [...p, { role: "user", text: t }]);
    setEntrada("");
    setPensando(true);
    setMsg(null);

    try {
      const { data } = await api.post("/admin/ai/chat", {
        message: t,
        history: historial,
        user_id: cliente.id,
      });
      setMensajes((p) => [...p, { role: "model", text: data.reply }]);
    } catch (err) {
      setMsg({ type: "err", text: errorDe(err, "El asistente no ha contestado.") });
    } finally {
      setPensando(false);
    }
  };

  const montarPlan = async () => {
    if (montando || !cliente || mensajes.length === 0) return;
    setMontando(true);
    setMsg(null);
    try {
      const { data } = await api.post("/admin/ai/draft", {
        message: "Convierte en un plan estructurado lo que hemos acordado.",
        history: mensajes.slice(-20),
        user_id: cliente.id,
      });
      setBorrador(data.plan);
    } catch (err) {
      setMsg({ type: "err", text: errorDe(err, "No ha podido montar el plan.") });
    } finally {
      setMontando(false);
    }
  };

  /**
   * Guarda el plan y lo manda, en un paso.
   *
   * La confirmación lleva el nombre y el correo delante a propósito: lo
   * ha redactado una IA y es la alimentación de una persona, así que la
   * última palabra la tiene alguien que ve a quién se lo está enviando.
   */
  const crearYEnviar = async () => {
    if (!borrador || !cliente) return;

    const meals = borrador.meals.filter((m) => m.foods.trim());
    if (meals.length === 0) {
      setMsg({ type: "err", text: "El borrador no tiene ninguna comida con contenido." });
      return;
    }

    if (!window.confirm(
      `Se va a crear "${borrador.title}" y enviarlo a:\n\n`
      + `${cliente.name}\n${cliente.email}\n\n`
      + `Lo ha redactado la IA. ¿Enviar?`
    )) return;

    setEnviando(true);
    setMsg(null);
    try {
      const { data: creado } = await api.post(`/admin/diet/users/${cliente.id}`, {
        title: borrador.title,
        notes: borrador.notes || null,
        meals,
      });

      const planId = creado?.plan?.id;
      if (!planId) throw new Error("El plan se ha creado pero no ha devuelto identificador.");

      const { data: envio } = await api.post(`/admin/diet/plans/${planId}/send`);

      setBorrador(null);
      setMensajes([]);
      setMsg({ type: "ok", text: envio?.message ?? "Plan creado y enviado." });
      await cargarFicha(cliente.id);
      // La lista guarda el título de la dieta activa de cada uno.
      api.get("/admin/diet/users").then(({ data }) => setClientes(data)).catch(() => {});
    } catch (err) {
      setMsg({
        type: "err",
        text: errorDe(err, "No se ha podido completar. Mira si el plan ya aparece antes de repetir."),
      });
    } finally {
      setEnviando(false);
    }
  };

  const sugerencias = planActual ? SUGERENCIAS_AJUSTE : SUGERENCIAS_NUEVO;

  return (
    <div className="admin-page admin-page--wide">
      <h1 className="admin-page__title">Nutrición con IA</h1>
      <p className="admin-page__sub">
        Elige el cliente y dile qué quieres. El asistente ve sus pesajes y su plan actual
      </p>

      {msg && <div className={`admin-msg admin-msg--${msg.type}`}>{msg.text}</div>}

      <div className="admin-split">

        {/* ══ CLIENTES ══ */}
        <div className="admin-card admin-card--flush admin-split__aside">
          <div className="admin-split__search">
            <input
              type="text" className="aw-search" placeholder="Buscar cliente..."
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar cliente"
            />
          </div>
          {cargandoClientes ? (
            <div className="admin-empty">Cargando...</div>
          ) : filtrados.length === 0 ? (
            <div className="admin-empty">Sin resultados</div>
          ) : (
            <div className="admin-split__list">
              {filtrados.map((c) => (
                <button
                  key={c.id} onClick={() => elegir(c)}
                  className={`aw-user-card ${cliente?.id === c.id ? "aw-user-card--active" : ""}`}
                >
                  <div className="aw-user-card__avatar">
                    {c.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="aw-user-card__info">
                    <span className="aw-user-card__name">{c.name}</span>
                    <span className="aw-user-card__meta">
                      {c.has_diet ? c.diet_title : "Sin dieta"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ══ CHAT ══ */}
        <div className="admin-card admin-split__detail nia">
          {!cliente ? (
            <div className="admin-empty">
              <span className="admin-empty__icon"><Icon name="user" size={34} strokeWidth={1.3} /></span>
              Elige un cliente para empezar
            </div>
          ) : (
            <>
              {/* ── Ficha ── */}
              <div className="nia__ficha">
                <div className="nia__ficha-quien">
                  <span className="nia__ficha-nombre">{cliente.name}</span>
                  <span className="nia__ficha-mail">{cliente.email}</span>
                </div>

                {cargandoFicha ? (
                  <span className="nia__ficha-cargando">Cargando ficha...</span>
                ) : (
                  <div className="nia__ficha-datos">
                    <span className="nia__dato">
                      <span className="nia__dato-label">Peso</span>
                      <span className="nia__dato-valor">{dec(stats?.current_weight)} kg</span>
                    </span>
                    <span className="nia__dato">
                      <span className="nia__dato-label">Cambio</span>
                      <span className="nia__dato-valor">
                        {stats?.total_change != null && stats.total_change > 0 ? "+" : ""}
                        {dec(stats?.total_change)} kg
                      </span>
                    </span>
                    {stats?.current_fat != null && (
                      <span className="nia__dato">
                        <span className="nia__dato-label">Grasa</span>
                        <span className="nia__dato-valor">{dec(stats.current_fat)} %</span>
                      </span>
                    )}
                    <span className="nia__dato">
                      <span className="nia__dato-label">Pesajes</span>
                      <span className="nia__dato-valor">{stats?.total_records ?? 0}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* ── Plan actual ── */}
              {!cargandoFicha && (
                <details className="nia__plan" open={!!planActual}>
                  <summary className="nia__plan-cab">
                    {planActual
                      ? <>Plan actual: <strong>{planActual.title}</strong></>
                      : <>Sin plan todavía — será el primero</>}
                  </summary>
                  {planActual && (
                    <ul className="nia__plan-comidas">
                      {planActual.meals.map((m, i) => (
                        <li key={m.id ?? i}>
                          <span className="nia__plan-tipo">{mealLabel(m.meal_type)}</span>
                          <span className="nia__plan-foods">{m.foods}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </details>
              )}

              {/* ── Conversación ── */}
              <div className="nia__chat" ref={listaRef}>
                {mensajes.length === 0 && (
                  <div className="nia__sugerencias">
                    <span className="nia__sugerencias-label">
                      {planActual ? "Pídele un ajuste" : "Empieza por"}
                    </span>
                    {sugerencias.map((s) => (
                      <button key={s} className="nia__sugerencia" onClick={() => enviar(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {mensajes.map((m, i) => (
                  <div key={i} className={`nia__msg nia__msg--${m.role}`}>{m.text}</div>
                ))}

                {pensando && (
                  <div className="nia__msg nia__msg--model nia__msg--pensando">
                    <span className="nia__punto" /><span className="nia__punto" /><span className="nia__punto" />
                  </div>
                )}

                {/* ── Borrador ── */}
                {borrador && (
                  <div className="nia__borrador">
                    <div className="nia__borrador-cab">
                      <Icon name="plate" size={15} />
                      <strong>{borrador.title}</strong>
                    </div>
                    {borrador.notes && <p className="nia__borrador-notas">{borrador.notes}</p>}
                    <ul className="nia__borrador-comidas">
                      {borrador.meals.map((m, i) => (
                        <li key={i}>
                          <span className="nia__plan-tipo">{mealLabel(m.meal_type)}</span>
                          <span className="nia__plan-foods">{m.foods}</span>
                          {(m.calories || m.macros) && (
                            <span className="nia__borrador-macros">
                              {m.calories}{m.calories && m.macros ? " · " : ""}{m.macros}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                    <div className="nia__borrador-acciones">
                      <button
                        className="admin-btn admin-btn--primary admin-btn--sm"
                        onClick={crearYEnviar} disabled={enviando}
                      >
                        <Icon name="send" size={14} />
                        {enviando ? "Enviando..." : "Crear y enviar al cliente"}
                      </button>
                      <button
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        onClick={() => setBorrador(null)} disabled={enviando}
                      >
                        Descartar y seguir hablando
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Entrada ── */}
              <div className="nia__entrada">
                <input
                  type="text" value={entrada} maxLength={2000}
                  placeholder={planActual
                    ? `Dile qué cambiar del plan de ${cliente.name.split(" ")[0]}...`
                    : `Dile qué plan quieres para ${cliente.name.split(" ")[0]}...`}
                  onChange={(e) => setEntrada(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(entrada); } }}
                  disabled={pensando}
                  aria-label="Mensaje para el asistente"
                />
                <button
                  className="admin-btn admin-btn--primary"
                  onClick={() => enviar(entrada)}
                  disabled={pensando || !entrada.trim()}
                  aria-label="Enviar mensaje"
                >
                  <Icon name="send" size={15} />
                </button>
              </div>

              {mensajes.length > 0 && !borrador && (
                <button
                  className="admin-btn admin-btn--ghost admin-btn--sm nia__montar"
                  onClick={montarPlan} disabled={montando}
                >
                  <Icon name="check" size={14} />
                  {montando ? "Montando el plan..." : "Montar el plan con lo hablado"}
                </button>
              )}

              <p className="nia__aviso">
                <Icon name="alert" size={13} />
                Lo redacta una IA. Repásalo antes de enviarlo: le llega al cliente tal cual.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

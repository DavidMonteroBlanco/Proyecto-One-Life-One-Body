// src/pages/admin/AiDietAssistant.tsx
//
// Asistente de IA del panel: David conversa con él para redactar un plan
// de alimentación y, cuando le convence, tiene dos salidas:
//
//   "Crear y enviar al cliente"  -> lo guarda y lo manda, en un paso
//   "Revisar antes"              -> lo vuelca en el formulario para
//                                   ajustarlo a mano
//
// La vía corta sigue pidiendo confirmación con el nombre del cliente
// delante. Lo redacta una IA y son datos de salud: la última palabra la
// tiene una persona que ve a quién se lo manda.

import { useState, useRef, useEffect, useCallback } from "react";
import api from "../../services/api";
import Icon from "../../components/ui/Icon";
import { mealLabel } from "../../lib/meals";
import "./AiDietAssistant.css";

export type DraftMeal = {
  meal_type: string;
  foods: string;
  calories: string;
  macros: string;
};

export type DraftPlan = {
  title: string;
  notes: string;
  meals: DraftMeal[];
};

type Msg = { role: "user" | "model"; text: string };

type Props = {
  /** Cliente seleccionado: da contexto de pesajes al asistente. */
  userId: number | null;
  userName: string | null;
  /** Carga el borrador en el formulario de dietas. */
  onUsePlan: (plan: DraftPlan) => void;
  /** Avisa al panel de que el plan ya se ha creado y enviado. */
  onSent?: (mensaje: string) => void;
};

const SUGGESTIONS = [
  "Plan de definición de 5 comidas, unas 1900 kcal",
  "Necesito una dieta de volumen limpio para alguien que entrena 4 días",
  "Dame opciones de cena ligera para toda la semana",
  "Ajusta el plan anterior para alguien que no come pescado",
];

export default function AiDietAssistant({ userId, userName, onUsePlan, onSent }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState<DraftPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const scrollToEnd = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  useEffect(() => { scrollToEnd(); }, [messages, draft, scrollToEnd]);

  const errorFrom = (err: unknown, fallback: string) => {
    const res = (err as { response?: { data?: { message?: string } } })?.response;
    return res?.data?.message || fallback;
  };

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || loading) return;

    const history = messages.slice(-20);
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post("/admin/ai/chat", {
        message,
        history,
        user_id: userId ?? undefined,
      });
      setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
    } catch (err) {
      setError(errorFrom(err, "No se ha podido contactar con el asistente."));
    } finally {
      setLoading(false);
    }
  };

  // Pide el plan en formato estructurado, listo para el formulario.
  const generateDraft = async () => {
    if (drafting || messages.length === 0) return;
    setDrafting(true);
    setError(null);

    try {
      const { data } = await api.post("/admin/ai/draft", {
        message:
          "Convierte en un plan estructurado lo que hemos acordado en esta conversación.",
        history: messages.slice(-20),
        user_id: userId ?? undefined,
      });
      setDraft(data.plan);
    } catch (err) {
      setError(errorFrom(err, "El asistente no ha podido montar el plan."));
    } finally {
      setDrafting(false);
    }
  };

  const useDraft = () => {
    if (!draft) return;
    onUsePlan(draft);
    setDraft(null);
    setOpen(false);
  };

  /**
   * Camino corto: guarda el plan y lo manda, en un paso.
   *
   * Pide confirmación con el nombre y el correo delante. No es por
   * ceremonia: lo que sale de aquí lo ha escrito una IA y son datos de
   * salud, así que la última palabra la tiene una persona que ve a quién
   * se lo está enviando. Un envío sin ese paso acaba antes o después en
   * la dieta de alguien que no era.
   */
  const crearYEnviar = async () => {
    if (!draft || !userId) return;

    const meals = draft.meals.filter((m) => m.foods.trim());
    if (meals.length === 0) {
      setError("El borrador no tiene ninguna comida con contenido.");
      return;
    }

    if (!window.confirm(
      `Se va a crear el plan "${draft.title}" y enviarlo a ${userName}.\n\n`
      + `Lo ha redactado la IA: repásalo antes si no lo has hecho.\n\n`
      + `¿Enviar?`
    )) return;

    setSending(true);
    setError(null);

    try {
      const { data: creado } = await api.post(`/admin/diet/users/${userId}`, {
        title: draft.title,
        notes: draft.notes || null,
        meals,
      });

      const planId = creado?.plan?.id;
      if (!planId) throw new Error("El plan se ha creado pero no ha devuelto su identificador.");

      const { data: envio } = await api.post(`/admin/diet/plans/${planId}/send`);

      setDraft(null);
      setOpen(false);
      onSent?.(envio?.message ?? "Plan creado y enviado.");
    } catch (err) {
      // El plan puede haberse creado y haber fallado solo el correo. Se
      // avisa para que David lo busque en la lista en vez de volver a
      // crearlo y dejar dos planes iguales.
      setError(errorFrom(
        err,
        "No se ha podido completar. Mira si el plan aparece ya en la lista antes de repetir."
      ));
    } finally {
      setSending(false);
    }
  };

  if (!open) {
    return (
      <button className="admin-btn admin-btn--ghost aia__open" onClick={() => setOpen(true)}>
        <Icon name="chat" size={15} /> Asistente de IA
      </button>
    );
  }

  return (
    <div className="aia">
      <div className="aia__head">
        <h3 className="aia__title">
          <Icon name="chat" size={16} /> Asistente de dietas
          {userName && <span className="aia__subject">para {userName.split(" ")[0]}</span>}
        </h3>
        <button className="aia__close" onClick={() => setOpen(false)} aria-label="Cerrar asistente">
          <Icon name="close" size={16} />
        </button>
      </div>

      <p className="aia__disclaimer">
        <Icon name="alert" size={14} />
        Lo que genere es un borrador. Repásalo: si le das a enviar, le llega
        al cliente por email y a su área tal cual está.
      </p>

      <div className="aia__messages">
        {messages.length === 0 && (
          <div className="aia__suggestions">
            <span className="aia__suggestions-label">Prueba con</span>
            {SUGGESTIONS.map((s) => (
              <button key={s} className="aia__suggestion" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`aia__msg aia__msg--${m.role}`}>
            {m.text}
          </div>
        ))}

        {loading && (
          <div className="aia__msg aia__msg--model aia__msg--typing">
            <span className="aia__dot" /><span className="aia__dot" /><span className="aia__dot" />
          </div>
        )}

        {draft && (
          <div className="aia__draft">
            <div className="aia__draft-head">
              <span className="badge badge--brand">Borrador</span>
              <strong className="aia__draft-title">{draft.title}</strong>
            </div>
            {draft.notes && <p className="aia__draft-notes">{draft.notes}</p>}
            <ul className="aia__draft-meals">
              {draft.meals.map((m, i) => (
                <li key={i}>
                  <span className="aia__draft-meal-type">{mealLabel(m.meal_type)}</span>
                  <span className="aia__draft-meal-foods">{m.foods}</span>
                  {(m.calories || m.macros) && (
                    <span className="aia__draft-meal-macros">
                      {m.calories}{m.calories && m.macros ? " · " : ""}{m.macros}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <div className="aia__draft-actions">
              <button
                className="admin-btn admin-btn--primary admin-btn--sm"
                onClick={crearYEnviar}
                disabled={sending || !userId}
              >
                <Icon name="send" size={14} /> {sending ? "Enviando..." : "Crear y enviar al cliente"}
              </button>
              <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={useDraft} disabled={sending}>
                <Icon name="pencil" size={14} /> Revisar antes
              </button>
              <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setDraft(null)} disabled={sending}>
                Descartar
              </button>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {error && <div className="admin-msg admin-msg--err">{error}</div>}

      <div className="aia__composer">
        <textarea
          className="aia__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Describe el plan que necesitas… (Enter envía, Mayús+Enter salta de línea)"
          rows={2}
          maxLength={2000}
          disabled={loading}
        />
        <button
          className="admin-btn admin-btn--primary aia__send"
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          aria-label="Enviar"
        >
          <Icon name="send" size={15} />
        </button>
      </div>

      <div className="aia__footer">
        <button
          className="admin-btn admin-btn--ghost admin-btn--sm"
          onClick={generateDraft}
          disabled={drafting || messages.length === 0}
        >
          {drafting ? "Montando plan…" : <><Icon name="file" size={14} /> Convertir en plan</>}
        </button>
        {messages.length > 0 && (
          <button
            className="admin-btn admin-btn--ghost admin-btn--sm"
            onClick={() => { setMessages([]); setDraft(null); setError(null); }}
          >
            Empezar de cero
          </button>
        )}
      </div>
    </div>
  );
}

// src/pages/admin/AiDietAssistant.tsx
//
// Asistente de IA del panel: David conversa con él para redactar un plan
// de alimentación y, cuando le convence, lo vuelca en el formulario de
// dietas con un botón. Lo que devuelve es SIEMPRE un borrador: no sale
// nada hacia el cliente hasta que David guarda y pulsa enviar.

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
};

const SUGGESTIONS = [
  "Plan de definición de 5 comidas, unas 1900 kcal",
  "Necesito una dieta de volumen limpio para alguien que entrena 4 días",
  "Dame opciones de cena ligera para toda la semana",
  "Ajusta el plan anterior para alguien que no come pescado",
];

export default function AiDietAssistant({ userId, userName, onUsePlan }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [draft, setDraft] = useState<DraftPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
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
        Lo que genere es un borrador. Revísalo antes de guardarlo: no sale nada al
        cliente hasta que tú le des a enviar.
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
              <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={useDraft}>
                <Icon name="check" size={14} /> Cargar en el formulario
              </button>
              <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setDraft(null)}>
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

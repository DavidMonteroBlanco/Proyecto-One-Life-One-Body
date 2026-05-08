// src/user/MyAppointments.tsx

import { useState, useEffect } from "react";
import api from "../services/api";
import "./Tracking.css";

type Appointment = {
  id: number; appointment_date: string; appointment_time: string;
  status: string; notes: string | null; created_at: string;
};

type SlotData = { date: string; slots: string[]; day_name: string };

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pendiente",  color: "#fbbf24", bg: "rgba(245,158,11,0.1)" },
  confirmed: { label: "Confirmada", color: "#6ee7b7", bg: "rgba(16,185,129,0.1)" },
  cancelled: { label: "Cancelada",  color: "#fca5a5", bg: "rgba(239,68,68,0.08)" },
  completed: { label: "Completada", color: "#7ee8e8", bg: "rgba(126,232,232,0.1)" },
};

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAY_HEADERS = ["L", "M", "X", "J", "V", "S", "D"];

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function formatDateLong(d: string) {
  return new Date(d).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}

function isWeekday(d: Date) {
  const dow = d.getDay();
  return dow >= 1 && dow <= 5;
}

function isFutureOrToday(d: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today;
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Monday = 0 in our grid
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const days: (Date | null)[] = [];

  // Empty cells before first day
  for (let i = 0; i < startOffset; i++) days.push(null);

  // Days of month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  return days;
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  // Booking
  const [showBook, setShowBook] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [slotData, setSlotData] = useState<SlotData | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [bookNotes, setBookNotes] = useState("");
  const [booking, setBooking] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = async () => {
    try { const { data } = await api.get("/my-appointments"); setAppointments(Array.isArray(data) ? data : []); }
    catch { /* */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const loadSlots = async (date: string) => {
    setSelectedDate(date); setSelectedTime(""); setSlotsLoading(true); setSlotData(null);
    try {
      const { data } = await api.get(`/appointments/slots?date=${date}`);
      setSlotData(data);
    } catch { /* */ }
    finally { setSlotsLoading(false); }
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) return;
    setBooking(true); setMsg(null);
    try {
      await api.post("/appointments/book", {
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        notes: bookNotes || null,
      });
      setMsg({ type: "ok", text: "Reserva confirmada. Tu entrenador ha sido notificado." });
      setShowBook(false); setSelectedDate(""); setSelectedTime(""); setBookNotes("");
      await load();
    } catch (err: any) {
      setMsg({ type: "err", text: err?.response?.data?.message || "Error al reservar." });
    } finally { setBooking(false); }
  };

  const handleCancel = async (id: number) => {
    if (!window.confirm("Cancelar esta reserva?")) return;
    try { await api.patch(`/appointments/${id}/cancel`); await load(); setMsg({ type: "ok", text: "Reserva cancelada." }); }
    catch { setMsg({ type: "err", text: "Error al cancelar." }); }
  };

  const prevMonth = () => {
    const today = new Date();
    if (calYear === today.getFullYear() && calMonth === today.getMonth()) return; // Can't go before current month
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
    setSelectedDate(""); setSlotData(null);
  };

  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
    setSelectedDate(""); setSlotData(null);
  };

  const canGoPrev = !(calYear === now.getFullYear() && calMonth === now.getMonth());
  const calendarDays = getCalendarDays(calYear, calMonth);

  const upcoming = appointments.filter(a => a.status === "pending" || a.status === "confirmed");
  const past = appointments.filter(a => a.status === "completed" || a.status === "cancelled");

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="tracking-header">
        <div>
          <h1 className="tracking-title">Reservas</h1>
          <p className="tracking-sub">Reserva tu pesaje semanal</p>
        </div>
        {!showBook && (
          <button className="tracking-add-btn" onClick={() => setShowBook(true)}>
            + Reservar pesaje
          </button>
        )}
      </div>

      {msg && (
        <div style={{
          fontFamily: "var(--font-condensed)", fontSize: "0.85rem", fontWeight: 600,
          padding: "0.6rem 1rem", borderRadius: 8, marginBottom: "1.5rem",
          background: msg.type === "ok" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
          borderLeft: `3px solid ${msg.type === "ok" ? "#10b981" : "#ef4444"}`,
          color: msg.type === "ok" ? "#6ee7b7" : "#fca5a5",
        }}>{msg.text}</div>
      )}

      {/* ══ BOOKING FORM ══ */}
      {showBook && (
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 14, padding: "1.5rem", marginBottom: "1.5rem",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, var(--accent), transparent)" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
            <h2 style={{ fontFamily: "var(--font-condensed)", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.06em" }}>
              Reservar pesaje
            </h2>
            <button onClick={() => { setShowBook(false); setSelectedDate(""); setSlotData(null); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
          </div>

          {/* ── Calendar ── */}
          <div style={{ background: "rgba(13,21,21,0.5)", border: "1px solid var(--border)", borderRadius: 12, padding: "1rem", marginBottom: "1.2rem" }}>
            {/* Month navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
              <button onClick={prevMonth} disabled={!canGoPrev} style={{
                background: "none", border: "1px solid var(--border)", borderRadius: 6,
                color: canGoPrev ? "var(--text-primary)" : "var(--text-muted)", cursor: canGoPrev ? "pointer" : "default",
                padding: "0.3rem 0.6rem", fontSize: "0.85rem", opacity: canGoPrev ? 1 : 0.3,
              }}>←</button>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--text-primary)", letterSpacing: "0.06em" }}>
                {MONTH_NAMES[calMonth]} {calYear}
              </span>
              <button onClick={nextMonth} style={{
                background: "none", border: "1px solid var(--border)", borderRadius: 6,
                color: "var(--text-primary)", cursor: "pointer", padding: "0.3rem 0.6rem", fontSize: "0.85rem",
              }}>→</button>
            </div>

            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: "0.3rem" }}>
              {DAY_HEADERS.map(d => (
                <div key={d} style={{
                  textAlign: "center", fontFamily: "var(--font-condensed)", fontSize: "0.65rem",
                  fontWeight: 700, letterSpacing: "0.12em", color: "var(--text-muted)", padding: "0.3rem 0",
                }}>{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
              {calendarDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;

                const dateStr = toDateStr(day);
                const isWorkday = isWeekday(day);
                const isFuture = isFutureOrToday(day);
                const isSelectable = isWorkday && isFuture;
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === toDateStr(new Date());

                return (
                  <button
                    key={dateStr}
                    onClick={() => isSelectable ? loadSlots(dateStr) : null}
                    disabled={!isSelectable}
                    style={{
                      padding: "0.45rem 0", borderRadius: 8, border: "none",
                      fontFamily: "var(--font-condensed)", fontSize: "0.82rem", fontWeight: 600,
                      cursor: isSelectable ? "pointer" : "default",
                      background: isSelected ? "var(--primary)" : isToday ? "rgba(126,232,232,0.1)" : "transparent",
                      color: isSelected ? "var(--bg-deep)" : !isSelectable ? "var(--text-muted)" : "var(--text-primary)",
                      opacity: !isSelectable ? 0.25 : 1,
                      transition: "all 0.15s",
                      outline: isToday && !isSelected ? "1px solid rgba(126,232,232,0.3)" : "none",
                    }}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: "0.6rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "var(--font-condensed)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", border: "1px solid rgba(126,232,232,0.3)", display: "inline-block" }} /> Hoy
              </span>
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "var(--font-condensed)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", display: "inline-block" }} /> Seleccionado
              </span>
            </div>
          </div>

          {/* Time slots */}
          {selectedDate && (
            <>
              <p style={{ fontFamily: "var(--font-condensed)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                {slotData?.day_name || ""} {new Date(selectedDate).getDate()} — Horarios disponibles
              </p>
              {slotsLoading ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Cargando horarios...</p>
              ) : slotData && slotData.slots.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No hay horarios disponibles para este dia.</p>
              ) : (
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.2rem" }}>
                  {slotData?.slots.map(s => (
                    <button key={s} onClick={() => setSelectedTime(s)}
                      style={{
                        padding: "0.45rem 0.7rem", borderRadius: 6, cursor: "pointer",
                        fontFamily: "var(--font-condensed)", fontSize: "0.82rem", fontWeight: 700,
                        border: selectedTime === s ? "1px solid var(--primary)" : "1px solid var(--border)",
                        background: selectedTime === s ? "rgba(126,232,232,0.15)" : "rgba(13,21,21,0.5)",
                        color: selectedTime === s ? "var(--primary)" : "var(--text-secondary)",
                        transition: "all 0.15s",
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Notes + Submit */}
          {selectedTime && (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontFamily: "var(--font-condensed)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "var(--text-muted)", display: "block", marginBottom: "0.3rem" }}>
                  Notas (opcional)
                </label>
                <input type="text" value={bookNotes} onChange={e => setBookNotes(e.target.value)} placeholder="Ej: vengo en ayunas..."
                  style={{ width: "100%", background: "rgba(13,21,21,0.85)", border: "1px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-body)", fontSize: "0.85rem", padding: "0.55rem 0.8rem", borderRadius: 8, outline: "none" }} />
              </div>

              <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                <button onClick={handleBook} disabled={booking}
                  style={{
                    padding: "0.65rem 1.4rem", background: "var(--primary)", color: "var(--bg-deep)",
                    fontFamily: "var(--font-condensed)", fontSize: "0.85rem", fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase" as const, border: "none", borderRadius: 8,
                    cursor: booking ? "not-allowed" : "pointer", opacity: booking ? 0.5 : 1,
                  }}>
                  {booking ? "Reservando..." : "Confirmar reserva"}
                </button>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  {formatDateLong(selectedDate)} a las {selectedTime}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ UPCOMING ══ */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontFamily: "var(--font-condensed)" }}>Cargando...</div>
      ) : upcoming.length === 0 && past.length === 0 && !showBook ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16 }}>
          <span style={{ fontSize: "3rem", opacity: 0.3, display: "block", marginBottom: "1rem" }}>📅</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "var(--text-primary)", letterSpacing: "0.04em", marginBottom: "0.5rem" }}>Sin reservas</h2>
          <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
            Reserva tu pesaje semanal para que tu entrenador te espere en el centro.
          </p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontFamily: "var(--font-condensed)", fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.06em", marginBottom: "0.8rem" }}>
                Proximas reservas
              </h2>
              {upcoming.map(a => {
                const st = STATUS_LABELS[a.status] || STATUS_LABELS.pending;
                return (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, marginBottom: "0.6rem" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-condensed)", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {formatDateLong(a.appointment_date)}
                      </div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", color: "var(--primary)", marginTop: "0.1rem" }}>
                        {a.appointment_time.substring(0, 5)}
                      </div>
                      {a.notes && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>{a.notes}</div>}
                    </div>
                    <span style={{ fontFamily: "var(--font-condensed)", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", padding: "0.2rem 0.6rem", borderRadius: 4, background: st.bg, color: st.color }}>{st.label}</span>
                    {(a.status === "pending" || a.status === "confirmed") && (
                      <button onClick={() => handleCancel(a.id)} style={{ background: "none", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 6, color: "#fca5a5", cursor: "pointer", padding: "0.3rem 0.6rem", fontSize: "0.72rem", fontFamily: "var(--font-condensed)", fontWeight: 700 }}>Cancelar</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 style={{ fontFamily: "var(--font-condensed)", fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", marginBottom: "0.8rem" }}>
                Historial
              </h2>
              {past.map(a => {
                const st = STATUS_LABELS[a.status] || STATUS_LABELS.cancelled;
                return (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.8rem 1rem", borderBottom: "1px solid rgba(126,232,232,0.04)" }}>
                    <span style={{ fontFamily: "var(--font-condensed)", fontSize: "0.82rem", color: "var(--text-secondary)", minWidth: 140 }}>{formatDateLong(a.appointment_date)}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--text-muted)" }}>{a.appointment_time.substring(0, 5)}</span>
                    <span style={{ marginLeft: "auto", fontFamily: "var(--font-condensed)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", padding: "0.15rem 0.5rem", borderRadius: 4, background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
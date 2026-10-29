// src/user/MyAppointments.tsx

import { useState, useEffect } from "react";
import api from "../services/api";
import "./Tracking.css";
import Icon from "../components/ui/Icon";
import "./MyAppointments.css";

type Appointment = {
  id: number; appointment_date: string; appointment_time: string;
  status: string; notes: string | null; created_at: string;
};

type SlotData = { date: string; slots: string[]; day_name: string };

/* Cada estado se pinta con un modificador de la insignia global */
const STATUS_LABELS: Record<string, { label: string; variant: string }> = {
  pending:   { label: "Pendiente",  variant: "badge--warning" },
  confirmed: { label: "Confirmada", variant: "badge--success" },
  cancelled: { label: "Cancelada",  variant: "badge--danger" },
  completed: { label: "Completada", variant: "badge--brand" },
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
    <div className="appts">
      <div className="tracking-header">
        <div>
          <h1 className="tracking-title">Reservas</h1>
          <p className="tracking-sub">Reserva tu pesaje semanal</p>
        </div>
        {!showBook && (
          <button className="tracking-add-btn" onClick={() => setShowBook(true)}>
            <Icon name="plus" size={15} /> Reservar pesaje
          </button>
        )}
      </div>

      {msg && (
        <div className={`tracking-msg tracking-msg--${msg.type}`} role="status">{msg.text}</div>
      )}

      {/* ══ FORMULARIO DE RESERVA ══ */}
      {showBook && (
        <div className="appts__booker">
          <div className="appts__booker-head">
            <h2 className="appts__booker-title">Reservar pesaje</h2>
            <button
              className="appts__booker-close"
              onClick={() => { setShowBook(false); setSelectedDate(""); setSlotData(null); }}
              aria-label="Cerrar"
            ><Icon name="close" size={18} /></button>
          </div>

          {/* ── Calendario ── */}
          <div className="appts__calendar">
            <div className="appts__cal-nav">
              <button className="appts__cal-nav-btn" onClick={prevMonth} disabled={!canGoPrev} aria-label="Mes anterior"><Icon name="chevron-left" size={16} /></button>
              <span className="appts__cal-month">{MONTH_NAMES[calMonth]} {calYear}</span>
              <button className="appts__cal-nav-btn" onClick={nextMonth} aria-label="Mes siguiente"><Icon name="chevron-right" size={16} /></button>
            </div>

            <div className="appts__cal-headers" aria-hidden="true">
              {DAY_HEADERS.map(d => (
                <div key={d} className="appts__cal-header">{d}</div>
              ))}
            </div>

            <div className="appts__cal-grid">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;

                const dateStr = toDateStr(day);
                const isSelectable = isWeekday(day) && isFutureOrToday(day);
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === toDateStr(new Date());

                const classes = [
                  "appts__day",
                  isToday ? "appts__day--today" : "",
                  isSelected ? "appts__day--selected" : "",
                ].filter(Boolean).join(" ");

                return (
                  <button
                    key={dateStr}
                    className={classes}
                    onClick={() => loadSlots(dateStr)}
                    disabled={!isSelectable}
                    aria-pressed={isSelected}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="appts__cal-legend">
              <span className="appts__legend-item">
                <span className="appts__legend-dot appts__legend-dot--today" /> Hoy
              </span>
              <span className="appts__legend-item">
                <span className="appts__legend-dot appts__legend-dot--selected" /> Seleccionado
              </span>
            </div>
          </div>

          {/* ── Horarios ── */}
          {selectedDate && (
            <>
              <p className="appts__slots-label">
                {slotData?.day_name || ""} {new Date(selectedDate).getDate()} — Horarios disponibles
              </p>
              {slotsLoading ? (
                <p className="appts__hint">Cargando horarios...</p>
              ) : slotData && slotData.slots.length === 0 ? (
                <p className="appts__hint">No hay horarios disponibles para este día.</p>
              ) : (
                <div className="appts__slots">
                  {slotData?.slots.map(s => (
                    <button
                      key={s}
                      className={`appts__slot ${selectedTime === s ? "appts__slot--active" : ""}`}
                      onClick={() => setSelectedTime(s)}
                      aria-pressed={selectedTime === s}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Notas y confirmación ── */}
          {selectedTime && (
            <>
              <div className="appts__notes">
                <label htmlFor="book-notes">Notas (opcional)</label>
                <input
                  id="book-notes"
                  type="text"
                  value={bookNotes}
                  onChange={e => setBookNotes(e.target.value)}
                  placeholder="Ej: vengo en ayunas..."
                />
              </div>

              <div className="appts__confirm">
                <button className="tracking-submit-btn" onClick={handleBook} disabled={booking}>
                  {booking ? "Reservando..." : "Confirmar reserva"}
                </button>
                <span className="appts__confirm-meta">
                  {formatDateLong(selectedDate)} a las {selectedTime}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══ LISTADOS ══ */}
      {loading ? (
        <div className="route-loader" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" /> Cargando...
        </div>
      ) : upcoming.length === 0 && past.length === 0 && !showBook ? (
        <div className="empty-state">
          <span className="empty-state__icon"><Icon name="calendar" size={44} strokeWidth={1.2} /></span>
          <h2 className="empty-state__title">Sin reservas</h2>
          <p>Reserva tu pesaje semanal para que tu entrenador te espere en el centro.</p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="appts__section">
              <h2 className="appts__section-title">Próximas reservas</h2>
              {upcoming.map(a => {
                const st = STATUS_LABELS[a.status] || STATUS_LABELS.pending;
                return (
                  <div key={a.id} className="appts__card">
                    <div className="appts__card-info">
                      <div className="appts__card-date">{formatDateLong(a.appointment_date)}</div>
                      <div className="appts__card-time">{a.appointment_time.substring(0, 5)}</div>
                      {a.notes && <div className="appts__card-notes">{a.notes}</div>}
                    </div>
                    <span className={`badge ${st.variant}`}>{st.label}</span>
                    {(a.status === "pending" || a.status === "confirmed") && (
                      <button className="appts__cancel" onClick={() => handleCancel(a.id)}>Cancelar</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {past.length > 0 && (
            <div className="appts__section">
              <h2 className="appts__section-title appts__section-title--muted">Historial</h2>
              {past.map(a => {
                const st = STATUS_LABELS[a.status] || STATUS_LABELS.cancelled;
                return (
                  <div key={a.id} className="appts__history-row">
                    <span className="appts__history-date">{formatDateLong(a.appointment_date)}</span>
                    <span className="appts__history-time">{a.appointment_time.substring(0, 5)}</span>
                    <span className={`badge ${st.variant}`}>{st.label}</span>
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

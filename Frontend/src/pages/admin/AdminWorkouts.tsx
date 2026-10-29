// src/pages/admin/AdminWorkouts.tsx

import { useState, useEffect, useMemo, useRef } from "react";
import api from "../../services/api";
import Icon from "../../components/ui/Icon";
import { NIVELES, nivelLabel, descansoLabel, subirPeso } from "../../lib/pesos";
import { PLANTILLAS } from "../../lib/plantillas";
import "./AdminPages.css";
import "./AdminWorkouts.css";

/* ══════════════════════════════════════════════════════════
   ENTRENOS

   La pantalla está pensada para lo que de verdad se hace cada
   semana: coger el entreno anterior, subir los pesos y mandarlo.
   De ahí los atajos de arriba —repetir el último, plantillas y
   subida de pesos en bloque— en vez de rellenar la tabla entera
   a mano otra vez.
   ══════════════════════════════════════════════════════════ */

type UserItem = {
  id: number; name: string; email: string;
  workouts_count: number; last_title: string | null;
};

type Ejercicio = {
  name: string; sets: string; reps: string;
  weight: string; rest_seconds: string; notes: string;
};

type Workout = {
  id: number; title: string; goal: string | null;
  duration_minutes: number; level: string; notes: string | null;
  exercises: {
    id: number; name: string; sets: number; reps: string;
    weight: string | null; rest_seconds: number; notes: string | null;
  }[];
  created_at: string; sent_at: string | null;
};

const filaVacia = (): Ejercicio => ({
  name: "", sets: "4", reps: "10", weight: "", rest_seconds: "90", notes: "",
});

/** Del formato del backend al del formulario: todo texto, para los inputs. */
function aFormulario(w: Workout): Ejercicio[] {
  return w.exercises.map((e) => ({
    name: e.name,
    sets: String(e.sets),
    reps: e.reps,
    weight: e.weight ?? "",
    rest_seconds: String(e.rest_seconds),
    notes: e.notes ?? "",
  }));
}

/**
 * "Empuje semana 12" -> "Empuje semana 13".
 * Si no acaba en número se deja igual: es solo una ayuda para no
 * renombrar a mano la repetición de cada semana.
 */
function siguienteTitulo(titulo: string): string {
  return titulo.replace(/(\d+)\s*$/, (_, n) => String(Number(n) + 1));
}

export default function AdminWorkouts() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // Formulario
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [duration, setDuration] = useState("60");
  const [level, setLevel] = useState<string>("intermediate");
  const [notes, setNotes] = useState("");
  const [filas, setFilas] = useState<Ejercicio[]>([filaVacia()]);
  const [saving, setSaving] = useState(false);

  const ultimaFilaRef = useRef<HTMLInputElement | null>(null);
  const enfocarUltima = useRef(false);

  /* ══ Carga ══ */

  const loadUsers = async () => {
    try {
      const { data } = await api.get("/admin/workouts/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setMsg({ type: "err", text: "No se ha podido cargar la lista de clientes." });
    } finally { setUsersLoading(false); }
  };
  useEffect(() => { loadUsers(); }, []);

  const loadWorkouts = async (userId: number) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/workouts/users/${userId}`);
      setWorkouts(data.workouts || []);
    } catch { setWorkouts([]); } finally { setLoading(false); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, search]);

  /* Nombres ya usados con este cliente: alimentan el autocompletado
     para no reescribir "Press banca inclinado" cada semana. */
  const nombresUsados = useMemo(() => {
    const vistos = new Set<string>();
    workouts.forEach((w) => w.exercises.forEach((e) => vistos.add(e.name)));
    return [...vistos].sort();
  }, [workouts]);

  const selectUser = (u: UserItem) => {
    setSelectedUser(u);
    setShowForm(false); setEditId(null); setMsg(null);
    loadWorkouts(u.id);
  };

  /* ══ Abrir el formulario ══ */

  const openNew = () => {
    setEditId(null);
    setTitle(""); setGoal(""); setDuration("60");
    setLevel("intermediate"); setNotes("");
    setFilas([filaVacia()]);
    setShowForm(true);
  };

  const openEdit = (w: Workout) => {
    setEditId(w.id);
    setTitle(w.title); setGoal(w.goal || "");
    setDuration(String(w.duration_minutes)); setLevel(w.level);
    setNotes(w.notes || "");
    setFilas(w.exercises.length ? aFormulario(w) : [filaVacia()]);
    setShowForm(true);
  };

  /**
   * Repetir el último. Es el camino más corto a lo de cada semana:
   * sale un entreno NUEVO (editId en null) con los mismos ejercicios,
   * para subir pesos y mandarlo sin tocar el que ya tiene el cliente.
   */
  const repetirUltimo = () => {
    const ultimo = workouts[0];
    if (!ultimo) return;
    setEditId(null);
    setTitle(siguienteTitulo(ultimo.title));
    setGoal(ultimo.goal || "");
    setDuration(String(ultimo.duration_minutes));
    setLevel(ultimo.level);
    setNotes(ultimo.notes || "");
    setFilas(ultimo.exercises.length ? aFormulario(ultimo) : [filaVacia()]);
    setShowForm(true);
    setMsg({ type: "ok", text: "Copiado del último entreno. Ajusta los pesos y guarda." });
  };

  const aplicarPlantilla = (clave: string) => {
    const p = PLANTILLAS.find((x) => x.clave === clave);
    if (!p) return;
    const hayAlgo = filas.some((f) => f.name.trim());
    if (hayAlgo && !window.confirm("Esto reemplaza los ejercicios de la tabla. ¿Seguir?")) return;
    if (!title.trim()) setTitle(p.titulo);
    if (!goal.trim()) setGoal(p.objetivo);
    setFilas(p.ejercicios.map((e) => ({ ...filaVacia(), ...e })));
  };

  /* ══ Tabla de ejercicios ══ */

  const setFila = (i: number, campo: keyof Ejercicio, valor: string) => {
    setFilas((prev) => prev.map((f, j) => (j === i ? { ...f, [campo]: valor } : f)));
  };

  const addFila = () => {
    enfocarUltima.current = true;
    setFilas((prev) => [...prev, filaVacia()]);
  };

  const duplicarFila = (i: number) => {
    setFilas((prev) => [...prev.slice(0, i + 1), { ...prev[i] }, ...prev.slice(i + 1)]);
  };

  const quitarFila = (i: number) => {
    setFilas((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : prev));
  };

  const moverFila = (i: number, dir: -1 | 1) => {
    setFilas((prev) => {
      const destino = i + dir;
      if (destino < 0 || destino >= prev.length) return prev;
      const copia = [...prev];
      [copia[i], copia[destino]] = [copia[destino], copia[i]];
      return copia;
    });
  };

  /** Progresión semanal: toca el número de todos los pesos a la vez. */
  const subirTodos = (delta: number) => {
    setFilas((prev) => prev.map((f) => ({ ...f, weight: subirPeso(f.weight, delta) })));
  };

  // El foco al final solo cuando se ha pulsado "Añadir ejercicio",
  // nunca al cargar ni al escribir: si no, el cursor saltaría solo.
  useEffect(() => {
    if (!enfocarUltima.current) return;
    enfocarUltima.current = false;
    ultimaFilaRef.current?.focus();
  }, [filas.length]);

  /* ══ Guardar, borrar, enviar ══ */

  const cuerpo = () => ({
    title: title.trim(),
    goal: goal.trim() || null,
    duration_minutes: Number(duration) || 60,
    level,
    notes: notes.trim() || null,
    exercises: filas
      .filter((f) => f.name.trim())
      .map((f) => ({
        name: f.name.trim(),
        sets: Number(f.sets) || 1,
        reps: f.reps.trim() || "10",
        weight: f.weight.trim() || null,
        rest_seconds: Number(f.rest_seconds) || 0,
        notes: f.notes.trim() || null,
      })),
  });

  const handleSave = async () => {
    if (!selectedUser) return;
    if (!title.trim()) { setMsg({ type: "err", text: "Ponle un título al entreno." }); return; }

    const datos = cuerpo();
    if (datos.exercises.length === 0) {
      setMsg({ type: "err", text: "Añade al menos un ejercicio." });
      return;
    }

    setSaving(true); setMsg(null);
    try {
      if (editId) await api.put(`/admin/workouts/${editId}`, datos);
      else await api.post(`/admin/workouts/users/${selectedUser.id}`, datos);
      setMsg({ type: "ok", text: editId ? "Entreno actualizado." : "Entreno creado. Ya puedes enviarlo." });
      setShowForm(false); setEditId(null);
      await loadWorkouts(selectedUser.id); loadUsers();
    } catch (err) {
      const res = (err as { response?: { data?: { message?: string } } })?.response;
      setMsg({ type: "err", text: res?.data?.message || "No se ha podido guardar." });
    } finally { setSaving(false); }
  };

  const handleDuplicate = async (w: Workout) => {
    if (!selectedUser || busyId) return;
    setBusyId(w.id);
    try {
      await api.post(`/admin/workouts/${w.id}/duplicate`);
      await loadWorkouts(selectedUser.id); loadUsers();
      setMsg({ type: "ok", text: "Entreno duplicado." });
    } catch {
      setMsg({ type: "err", text: "No se ha podido duplicar." });
    } finally { setBusyId(null); }
  };

  const handleDelete = async (w: Workout) => {
    if (!selectedUser) return;
    if (!window.confirm(`¿Eliminar "${w.title}"?`)) return;
    try {
      await api.delete(`/admin/workouts/${w.id}`);
      await loadWorkouts(selectedUser.id); loadUsers();
      setMsg({ type: "ok", text: "Entreno eliminado." });
    } catch {
      setMsg({ type: "err", text: "No se ha podido eliminar." });
    }
  };

  const handlePdf = async (w: Workout) => {
    if (busyId) return;
    setBusyId(w.id);
    try {
      const { data } = await api.get(`/admin/workouts/${w.id}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `entreno-${w.title.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setMsg({ type: "err", text: "No se ha podido generar el PDF." });
    } finally { setBusyId(null); }
  };

  const handleSend = async (w: Workout) => {
    if (!selectedUser || busyId) return;
    const aviso = w.sent_at
      ? `Ya se envió el ${new Date(w.sent_at).toLocaleDateString("es-ES")}. ¿Volver a enviarlo a ${selectedUser.email}?`
      : `¿Enviar "${w.title}" por email a ${selectedUser.email}?`;
    if (!window.confirm(aviso)) return;

    setBusyId(w.id); setMsg(null);
    try {
      const { data } = await api.post(`/admin/workouts/${w.id}/send`);
      setMsg({ type: "ok", text: data.message });
      await loadWorkouts(selectedUser.id);
    } catch (err) {
      const res = (err as { response?: { data?: { message?: string } } })?.response;
      setMsg({ type: "err", text: res?.data?.message || "No se ha podido enviar." });
    } finally { setBusyId(null); }
  };

  /* ══════════════════════════════════════════════════════ */

  return (
    <div className="admin-page admin-page--wide">
      <h1 className="admin-page__title">Entrenos</h1>
      <p className="admin-page__sub">Monta la sesión, sube los pesos y envíala al cliente</p>

      {msg && <div className={`admin-msg admin-msg--${msg.type}`}>{msg.text}</div>}

      <div className="admin-split">

        {/* ══ CLIENTES ══ */}
        <div className="admin-card admin-card--flush admin-split__aside">
          <div className="admin-split__search">
            <input
              type="text" className="aw-search" placeholder="Buscar cliente..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar cliente"
            />
          </div>
          {usersLoading ? (
            <div className="admin-empty">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="admin-empty">Sin resultados</div>
          ) : (
            <div className="admin-split__list">
              {filtered.map((u) => (
                <button
                  key={u.id} onClick={() => selectUser(u)}
                  className={`aw-user-card ${selectedUser?.id === u.id ? "aw-user-card--active" : ""}`}
                >
                  <div className="aw-user-card__avatar">
                    {u.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="aw-user-card__info">
                    <span className="aw-user-card__name">{u.name}</span>
                    <span className="aw-user-card__meta">
                      {u.workouts_count === 0
                        ? "Sin entrenos"
                        : `${u.workouts_count} ${u.workouts_count === 1 ? "entreno" : "entrenos"}`}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ══ DETALLE ══ */}
        <div className="admin-card admin-split__detail">
          {!selectedUser ? (
            <div className="admin-empty">
              <span className="admin-empty__icon"><Icon name="user" size={34} strokeWidth={1.3} /></span>
              Selecciona un cliente para ver sus entrenos
            </div>
          ) : showForm ? (
            /* ══ FORMULARIO ══ */
            <div>
              <div className="wk__head">
                <h2 className="admin-card__title admin-card__title--flush">
                  <span className="admin-card__title-icon"><Icon name="dumbbell" size={18} /></span>
                  {editId ? "Editar entreno" : "Nuevo entreno"} — {selectedUser.name.split(" ")[0]}
                </h2>
                <button
                  className="admin-btn admin-btn--ghost"
                  onClick={() => { setShowForm(false); setEditId(null); }}
                >
                  <Icon name="close" size={14} /> Cancelar
                </button>
              </div>

              {/* Las plantillas solo se ofrecen al crear: al editar un
                  entreno ya existente, borrar su tabla no es lo que se busca. */}
              {!editId && (
                <div className="wk__chips">
                  <span className="wk__chips-label">Empezar desde</span>
                  {PLANTILLAS.map((p) => (
                    <button key={p.clave} className="wk__chip" onClick={() => aplicarPlantilla(p.clave)}>
                      {p.nombre}
                    </button>
                  ))}
                </div>
              )}

              <div className="admin-form admin-form--row">
                <div className="admin-field">
                  <label htmlFor="wk-title">Título</label>
                  <input
                    id="wk-title" value={title} maxLength={100}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Empuje semana 12"
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="wk-goal">Objetivo</label>
                  <input
                    id="wk-goal" value={goal} maxLength={100}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="Fuerza, hipertrofia..."
                  />
                </div>
                <div className="admin-field wk__field--corta">
                  <label htmlFor="wk-dur">Duración (min)</label>
                  <input
                    id="wk-dur" type="number" min={10} max={300}
                    value={duration} onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                <div className="admin-field wk__field--corta">
                  <label htmlFor="wk-level">Nivel</label>
                  <select id="wk-level" value={level} onChange={(e) => setLevel(e.target.value)}>
                    {NIVELES.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
                  </select>
                </div>
              </div>

              {/* ══ Tabla de ejercicios ══ */}
              <div className="wk__tabla-head">
                <span className="wk__tabla-titulo">
                  Ejercicios
                  <span className="wk__contador">{filas.filter((f) => f.name.trim()).length}</span>
                </span>
                <div className="wk__pesos">
                  <span className="wk__chips-label">Pesos de toda la tabla</span>
                  <button className="wk__chip wk__chip--peso" onClick={() => subirTodos(-2.5)} title="Bajar 2,5 a todos">−2,5</button>
                  <button className="wk__chip wk__chip--peso" onClick={() => subirTodos(2.5)} title="Subir 2,5 a todos">+2,5</button>
                  <button className="wk__chip wk__chip--peso" onClick={() => subirTodos(5)} title="Subir 5 a todos">+5</button>
                </div>
              </div>

              <div className="wk__tabla-wrap">
                <table className="wk__tabla">
                  <thead>
                    <tr>
                      <th className="wk__th-num">#</th>
                      <th>Ejercicio</th>
                      <th className="wk__th-mini">Series</th>
                      <th className="wk__th-mini">Reps</th>
                      <th className="wk__th-mini">Peso</th>
                      <th className="wk__th-mini">Descanso</th>
                      <th>Notas</th>
                      <th className="wk__th-acc"><span className="sr-only">Acciones</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filas.map((f, i) => (
                      <tr key={i}>
                        <td className="wk__td-num">{i + 1}</td>
                        <td>
                          <input
                            ref={i === filas.length - 1 ? ultimaFilaRef : undefined}
                            list="wk-ejercicios" value={f.name} maxLength={120}
                            onChange={(e) => setFila(i, "name", e.target.value)}
                            placeholder="Press banca"
                            aria-label={`Nombre del ejercicio ${i + 1}`}
                          />
                        </td>
                        <td>
                          <input
                            type="number" min={1} max={20} value={f.sets}
                            onChange={(e) => setFila(i, "sets", e.target.value)}
                            aria-label={`Series del ejercicio ${i + 1}`}
                          />
                        </td>
                        <td>
                          <input
                            value={f.reps} maxLength={30} placeholder="8-10"
                            onChange={(e) => setFila(i, "reps", e.target.value)}
                            aria-label={`Repeticiones del ejercicio ${i + 1}`}
                          />
                        </td>
                        <td>
                          <input
                            value={f.weight} maxLength={30} placeholder="40 kg"
                            onChange={(e) => setFila(i, "weight", e.target.value)}
                            aria-label={`Peso del ejercicio ${i + 1}`}
                          />
                        </td>
                        <td>
                          <input
                            type="number" min={0} max={600} step={15} value={f.rest_seconds}
                            onChange={(e) => setFila(i, "rest_seconds", e.target.value)}
                            aria-label={`Descanso en segundos del ejercicio ${i + 1}`}
                          />
                        </td>
                        <td>
                          <input
                            value={f.notes} maxLength={300} placeholder="Bajada lenta"
                            onChange={(e) => setFila(i, "notes", e.target.value)}
                            aria-label={`Notas del ejercicio ${i + 1}`}
                          />
                        </td>
                        <td className="wk__td-acc">
                          <button
                            className="admin-item__btn" onClick={() => moverFila(i, -1)}
                            disabled={i === 0} title="Subir" aria-label="Subir ejercicio"
                          >
                            <Icon name="chevron-left" size={13} />
                          </button>
                          <button
                            className="admin-item__btn" onClick={() => moverFila(i, 1)}
                            disabled={i === filas.length - 1} title="Bajar" aria-label="Bajar ejercicio"
                          >
                            <Icon name="chevron-right" size={13} />
                          </button>
                          <button
                            className="admin-item__btn" onClick={() => duplicarFila(i)}
                            title="Duplicar fila" aria-label="Duplicar ejercicio"
                          >
                            <Icon name="copy" size={13} />
                          </button>
                          <button
                            className="admin-item__btn admin-item__btn--del" onClick={() => quitarFila(i)}
                            disabled={filas.length === 1} title="Quitar" aria-label="Quitar ejercicio"
                          >
                            <Icon name="trash" size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Autocompletado con lo ya usado con este cliente */}
              <datalist id="wk-ejercicios">
                {nombresUsados.map((n) => <option key={n} value={n} />)}
              </datalist>

              <button className="admin-btn admin-btn--ghost admin-btn--sm wk__add" onClick={addFila}>
                <Icon name="plus" size={14} /> Añadir ejercicio
              </button>

              <div className="admin-field admin-field--full">
                <label htmlFor="wk-notes">Notas para el cliente</label>
                <textarea
                  id="wk-notes" rows={3} value={notes} maxLength={2000}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Calienta 10 minutos antes. Si el último set sale fácil, sube 2,5 kg la semana que viene."
                />
              </div>

              <div className="admin-btn-row">
                <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Guardando..." : editId ? "Actualizar entreno" : "Crear entreno"}
                </button>
              </div>
            </div>
          ) : (
            /* ══ LISTADO ══ */
            <div>
              <div className="wk__head">
                <h2 className="admin-card__title admin-card__title--flush">
                  <span className="admin-card__title-icon"><Icon name="dumbbell" size={18} /></span>
                  Entrenos de {selectedUser.name}
                </h2>
                <div className="wk__head-actions">
                  {workouts.length > 0 && (
                    <button className="admin-btn admin-btn--ghost" onClick={repetirUltimo}>
                      <Icon name="refresh" size={14} /> Repetir el último
                    </button>
                  )}
                  <button className="admin-btn admin-btn--primary" onClick={openNew}>
                    <Icon name="plus" size={14} /> Nuevo entreno
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="admin-empty">Cargando...</div>
              ) : workouts.length === 0 ? (
                <div className="admin-empty">
                  <span className="admin-empty__icon"><Icon name="dumbbell" size={34} strokeWidth={1.3} /></span>
                  Este cliente aún no tiene entrenos
                </div>
              ) : (
                <div className="wk__lista">
                  {workouts.map((w) => (
                    <div key={w.id} className="wk__item">
                      <div className="wk__item-head">
                        <div className="wk__item-id">
                          <div className="wk__item-title-row">
                            <span className="wk__item-title">{w.title}</span>
                            {w.sent_at ? (
                              <span
                                className="badge badge--success"
                                title={`Enviado el ${new Date(w.sent_at).toLocaleString("es-ES")}`}
                              >
                                <Icon name="check" size={11} /> Enviado
                              </span>
                            ) : (
                              <span className="badge">Sin enviar</span>
                            )}
                          </div>
                          <span className="wk__item-meta">
                            {nivelLabel(w.level)} · {w.duration_minutes} min · {w.exercises.length}{" "}
                            {w.exercises.length === 1 ? "ejercicio" : "ejercicios"}
                            {w.goal ? ` · ${w.goal}` : ""}
                          </span>
                        </div>
                        <div className="wk__item-actions">
                          <button
                            className="admin-item__btn" onClick={() => handlePdf(w)}
                            disabled={busyId === w.id} title="Descargar PDF"
                          >
                            <Icon name="download" size={15} />
                          </button>
                          <button
                            className="admin-item__btn" onClick={() => handleSend(w)}
                            disabled={busyId === w.id} title="Enviar al cliente"
                          >
                            <Icon name="send" size={15} />
                          </button>
                          <button
                            className="admin-item__btn" onClick={() => handleDuplicate(w)}
                            disabled={busyId === w.id} title="Duplicar"
                          >
                            <Icon name="copy" size={15} />
                          </button>
                          <button className="admin-item__btn" onClick={() => openEdit(w)} title="Editar">
                            <Icon name="pencil" size={15} />
                          </button>
                          <button
                            className="admin-item__btn admin-item__btn--del"
                            onClick={() => handleDelete(w)} title="Eliminar"
                          >
                            <Icon name="trash" size={15} />
                          </button>
                        </div>
                      </div>

                      {w.exercises.length > 0 && (
                        <div className="wk__tabla-wrap">
                          <table className="wk__tabla wk__tabla--lectura">
                            <thead>
                              <tr>
                                <th>Ejercicio</th>
                                <th className="wk__th-mini">Series</th>
                                <th className="wk__th-mini">Reps</th>
                                <th className="wk__th-mini">Peso</th>
                                <th className="wk__th-mini">Descanso</th>
                              </tr>
                            </thead>
                            <tbody>
                              {w.exercises.map((e) => (
                                <tr key={e.id}>
                                  <td>
                                    {e.name}
                                    {e.notes && <span className="wk__ex-nota">{e.notes}</span>}
                                  </td>
                                  <td>{e.sets}</td>
                                  <td>{e.reps}</td>
                                  <td>{e.weight || "—"}</td>
                                  <td>{descansoLabel(e.rest_seconds)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {w.notes && <p className="wk__item-notes">{w.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

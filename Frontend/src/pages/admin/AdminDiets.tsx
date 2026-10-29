
import { useState, useEffect } from "react";
import api from "../../services/api";
import Icon from "../../components/ui/Icon";
import { MEALS, mealIcon, mealLabel } from "../../lib/meals";
import AiDietAssistant from "./AiDietAssistant";
import type { DraftPlan } from "./AiDietAssistant";
import "./AdminPages.css";
import "./AdminDiets.css";

type UserItem = { id: number; name: string; email: string; has_diet: boolean; diet_title: string | null };
type Meal = { id?: number; meal_type: string; foods: string; calories: string; macros: string };
type Plan = {
  id: number; title: string; notes: string | null; active: boolean;
  meals: Meal[]; created_at: string; sent_at: string | null;
};

const emptyMeal = (): Meal => ({ meal_type: "desayuno", foods: "", calories: "", macros: "" });

export default function AdminDiets() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editPlanId, setEditPlanId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formMeals, setFormMeals] = useState<Meal[]>([emptyMeal()]);
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try { const { data } = await api.get("/admin/diet/users"); setUsers(Array.isArray(data) ? data : []); }
    catch { /* */ } finally { setUsersLoading(false); }
  };
  useEffect(() => { loadUsers(); }, []);

  const loadPlans = async (userId: number) => {
    setPlansLoading(true);
    try { const { data } = await api.get(`/admin/diet/users/${userId}`); setPlans(data.plans || []); }
    catch { setPlans([]); } finally { setPlansLoading(false); }
  };

  const selectUser = (u: UserItem) => { setSelectedUser(u); setShowForm(false); setEditPlanId(null); setMsg(null); loadPlans(u.id); };

  const openNew = () => {
    setEditPlanId(null);
    setFormTitle(""); setFormNotes("");
    setFormMeals(MEALS.map(m => ({ meal_type: m.value, foods: "", calories: "", macros: "" })));
    setShowForm(true);
  };

  const openEdit = (p: Plan) => {
    setEditPlanId(p.id);
    setFormTitle(p.title); setFormNotes(p.notes || "");
    setFormMeals(p.meals.length > 0 ? p.meals.map(m => ({ ...m })) : [emptyMeal()]);
    setShowForm(true);
  };

  const updateMeal = (i: number, field: keyof Meal, val: string) => {
    const next = [...formMeals]; next[i] = { ...next[i], [field]: val }; setFormMeals(next);
  };

  const addMeal = () => setFormMeals([...formMeals, emptyMeal()]);
  const removeMeal = (i: number) => { if (formMeals.length > 1) setFormMeals(formMeals.filter((_, j) => j !== i)); };

  const handleSave = async () => {
    if (!selectedUser || !formTitle.trim()) return;
    const meals = formMeals.filter(m => m.foods.trim());
    if (meals.length === 0) { setMsg({ type: "err", text: "Añade al menos una comida." }); return; }
    setSaving(true); setMsg(null);
    try {
      if (editPlanId) {
        await api.put(`/admin/diet/plans/${editPlanId}`, { title: formTitle.trim(), notes: formNotes.trim() || null, meals });
      } else {
        await api.post(`/admin/diet/users/${selectedUser.id}`, { title: formTitle.trim(), notes: formNotes.trim() || null, meals });
      }
      setMsg({ type: "ok", text: editPlanId ? "Dieta actualizada." : "Dieta creada." });
      setShowForm(false); setEditPlanId(null);
      await loadPlans(selectedUser.id); loadUsers();
    } catch (err: any) {
      setMsg({ type: "err", text: err?.response?.data?.message || "Error al guardar." });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!selectedUser || !window.confirm("Eliminar esta dieta?")) return;
    try { await api.delete(`/admin/diet/plans/${id}`); await loadPlans(selectedUser.id); loadUsers(); setMsg({ type: "ok", text: "Eliminada." }); }
    catch { setMsg({ type: "err", text: "Error." }); }
  };

  const handleToggle = async (id: number) => {
    if (!selectedUser) return;
    try { await api.patch(`/admin/diet/plans/${id}/toggle`); await loadPlans(selectedUser.id); loadUsers(); }
    catch { /* */ }
  };

  /* Carga en el formulario el borrador que ha montado el asistente. */
  const handleUseDraft = (plan: DraftPlan) => {
    setEditPlanId(null);
    setFormTitle(plan.title);
    setFormNotes(plan.notes || "");
    setFormMeals(
      plan.meals.length > 0
        ? plan.meals.map(m => ({
            meal_type: m.meal_type,
            foods: m.foods,
            calories: m.calories || "",
            macros: m.macros || "",
          }))
        : [emptyMeal()]
    );
    setShowForm(true);
    setMsg({ type: "ok", text: "Borrador cargado. Revísalo antes de guardar." });
  };

  /* Descarga el PDF del plan con la cabecera de sesión, sin token en la URL. */
  const [busyPlanId, setBusyPlanId] = useState<number | null>(null);

  const handleDownloadPdf = async (plan: Plan) => {
    if (busyPlanId) return;
    setBusyPlanId(plan.id);
    try {
      const { data } = await api.get(`/admin/diet/plans/${plan.id}/pdf`, { responseType: "blob" });
      const url = URL.createObjectURL(data as Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plan-${plan.title.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setMsg({ type: "err", text: "No se ha podido generar el PDF." });
    } finally { setBusyPlanId(null); }
  };

  /* Envía el plan por email al cliente dueño del plan, y solo a él. */
  const handleSendPlan = async (plan: Plan) => {
    if (!selectedUser || busyPlanId) return;
    const warning = plan.sent_at
      ? `Ya se envió el ${new Date(plan.sent_at).toLocaleDateString("es-ES")}. ¿Volver a enviarlo a ${selectedUser.email}?`
      : `Enviar "${plan.title}" por email a ${selectedUser.email}?`;
    if (!window.confirm(warning)) return;

    setBusyPlanId(plan.id);
    setMsg(null);
    try {
      const { data } = await api.post(`/admin/diet/plans/${plan.id}/send`);
      setMsg({ type: "ok", text: data.message });
      await loadPlans(selectedUser.id);
    } catch (err) {
      const res = (err as { response?: { data?: { message?: string } } })?.response;
      setMsg({ type: "err", text: res?.data?.message || "No se ha podido enviar." });
    } finally { setBusyPlanId(null); }
  };

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="admin-page admin-page--wide">
      <h1 className="admin-page__title">Dietas</h1>
      <p className="admin-page__sub">Gestiona los planes de alimentación de cada cliente</p>

      {msg && <div className={`admin-msg admin-msg--${msg.type}`}>{msg.text}</div>}

      <div className="diets-layout">

        {/* ── LISTA DE CLIENTES ── */}
        <div className="admin-card admin-card--flush diets__users">
          <div className="diets__users-search">
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="aw-search"
              aria-label="Buscar cliente"
            />
          </div>
          {usersLoading ? (
            <div className="admin-empty">Cargando...</div>
          ) : (
            <div className="diets__users-list">
              {filtered.map(u => (
                <button key={u.id} onClick={() => selectUser(u)}
                  className={`aw-user-card ${selectedUser?.id === u.id ? "aw-user-card--active" : ""}`}>
                  <div className="aw-user-card__avatar">{u.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</div>
                  <div className="aw-user-card__info">
                    <span className="aw-user-card__name">{u.name}</span>
                    <span className="aw-user-card__meta">{u.has_diet ? u.diet_title : "Sin dieta"}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── DETALLE ── */}
        <div className="admin-card diets__detail">
          {!selectedUser ? (
            <div className="admin-empty"><span className="admin-empty__icon"><Icon name="user" size={34} strokeWidth={1.3} /></span>Selecciona un usuario</div>
          ) : showForm ? (
            /* ── FORMULARIO ── */
            <div>
              <div className="diets__panel-head">
                <h2 className="admin-card__title admin-card__title--flush">
                  <span className="admin-card__title-icon"><Icon name="plate" size={18} /></span>
                  {editPlanId ? "Editar dieta" : "Nueva dieta"} — {selectedUser.name.split(" ")[0]}
                </h2>
                <button className="admin-btn admin-btn--ghost" onClick={() => setShowForm(false)}><Icon name="close" size={14} /> Cancelar</button>
              </div>

              <div className="admin-form">
                <div className="admin-form--row">
                  <div className="admin-field"><label>Título del plan</label>
                    <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Ej: Plan definición - Mayo" required />
                  </div>
                  <div className="admin-field"><label>Notas generales</label>
                    <input value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Opcional..." />
                  </div>
                </div>

                <div className="diets__meals-editor">
                  <div className="diets__meals-head">
                    <h3>Comidas ({formMeals.length})</h3>
                    <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={addMeal}><Icon name="plus" size={14} /> Añadir comida</button>
                  </div>

                  {formMeals.map((meal, i) => (
                    <div key={i} className="diets__meal-editor">
                      <div className="diets__meal-editor-head">
                        <select
                          className="diets__meal-select"
                          value={meal.meal_type}
                          onChange={e => updateMeal(i, "meal_type", e.target.value)}
                          aria-label="Tipo de comida"
                        >
                          {MEALS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                        {formMeals.length > 1 && (
                          <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => removeMeal(i)}><Icon name="close" size={13} /></button>
                        )}
                      </div>
                      <div className="admin-field">
                        <label>Alimentos</label>
                        <textarea value={meal.foods} onChange={e => updateMeal(i, "foods", e.target.value)} rows={2}
                          placeholder="Ej: 2 huevos revueltos, 60g avena con leche, 1 plátano" />
                      </div>
                      <div className="diets__meal-numbers">
                        <div className="admin-field"><label>Calorías</label>
                          <input value={meal.calories} onChange={e => updateMeal(i, "calories", e.target.value)} placeholder="450 kcal" />
                        </div>
                        <div className="admin-field"><label>Macros</label>
                          <input value={meal.macros} onChange={e => updateMeal(i, "macros", e.target.value)} placeholder="40P / 30C / 20G" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="admin-btn-row">
                  <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
                    {saving ? "Guardando..." : editPlanId ? "Actualizar dieta" : "Crear dieta"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── LISTADO DE DIETAS ── */
            <div>
              <div className="diets__panel-head">
                <h2 className="admin-card__title admin-card__title--flush">
                  <span className="admin-card__title-icon"><Icon name="plate" size={18} /></span> Dietas de {selectedUser.name}
                </h2>
                <div className="diets__panel-actions">
                  <AiDietAssistant
                    userId={selectedUser.id}
                    userName={selectedUser.name}
                    onUsePlan={handleUseDraft}
                  />
                  <button className="admin-btn admin-btn--primary" onClick={openNew}><Icon name="plus" size={14} /> Nueva dieta</button>
                </div>
              </div>

              {plansLoading ? (
                <div className="admin-empty">Cargando...</div>
              ) : plans.length === 0 ? (
                <div className="admin-empty"><span className="admin-empty__icon"><Icon name="plate" size={34} strokeWidth={1.3} /></span>No hay dietas asignadas</div>
              ) : (
                <div className="diets__plans">
                  {plans.map(p => (
                    <div key={p.id} className={`diets__plan ${p.active ? "diets__plan--active" : ""}`}>
                      <div className="diets__plan-head">
                        <div>
                          <div className="diets__plan-title-row">
                            <span className="diets__plan-title">{p.title}</span>
                            {p.active && <span className="badge badge--success">Activa</span>}
                            {p.sent_at && (
                              <span className="badge" title={`Enviado el ${new Date(p.sent_at).toLocaleString("es-ES")}`}>
                                <Icon name="check" size={11} /> Enviado
                              </span>
                            )}
                          </div>
                          {p.notes && <p className="diets__plan-notes">{p.notes}</p>}
                        </div>
                        <div className="diets__plan-actions">
                          <button className="admin-item__btn" onClick={() => handleDownloadPdf(p)} disabled={busyPlanId === p.id} title="Descargar PDF"><Icon name="download" size={15} /></button>
                          <button className="admin-item__btn" onClick={() => handleSendPlan(p)} disabled={busyPlanId === p.id} title="Enviar por email al cliente"><Icon name="send" size={15} /></button>
                          <button className="admin-item__btn" onClick={() => handleToggle(p.id)} title={p.active ? "Desactivar" : "Activar"}><Icon name={p.active ? "toggle-on" : "toggle-off"} size={15} /></button>
                          <button className="admin-item__btn" onClick={() => openEdit(p)} title="Editar"><Icon name="pencil" size={15} /></button>
                          <button className="admin-item__btn admin-item__btn--del" onClick={() => handleDelete(p.id)} title="Eliminar"><Icon name="trash" size={15} /></button>
                        </div>
                      </div>

                      <div className="diets__plan-meals">
                        {p.meals.map((m, i) => (
                          <div key={i} className="diets__plan-meal">
                            <div className="diets__plan-meal-type"><Icon name={mealIcon(m.meal_type)} size={14} />{mealLabel(m.meal_type)}</div>
                            <div className="diets__plan-meal-foods">{m.foods}</div>
                            {(m.calories || m.macros) && (
                              <div className="diets__plan-meal-macros">
                                {m.calories}{m.calories && m.macros ? " · " : ""}{m.macros}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
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

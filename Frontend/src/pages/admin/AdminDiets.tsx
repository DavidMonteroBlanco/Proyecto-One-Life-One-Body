
import { useState, useEffect } from "react";
import api from "../../services/api";
import "./AdminPages.css";

type UserItem = { id: number; name: string; email: string; has_diet: boolean; diet_title: string | null };
type Meal = { id?: number; meal_type: string; foods: string; calories: string; macros: string };
type Plan = { id: number; title: string; notes: string | null; active: boolean; meals: Meal[]; created_at: string };

const MEAL_TYPES = [
  { value: "desayuno", label: "🌅 Desayuno" },
  { value: "media_manana", label: "🍎 Media mañana" },
  { value: "comida", label: "🍽 Comida" },
  { value: "merienda", label: "🥤 Merienda" },
  { value: "pre_entreno", label: "⚡ Pre-entreno" },
  { value: "post_entreno", label: "💪 Post-entreno" },
  { value: "cena", label: "🌙 Cena" },
];

function mealLabel(type: string) { return MEAL_TYPES.find(m => m.value === type)?.label || type; }

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
    setFormMeals(MEAL_TYPES.map(m => ({ meal_type: m.value, foods: "", calories: "", macros: "" })));
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

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="admin-page" style={{ maxWidth: 1100 }}>
      <h1 className="admin-page__title">Dietas</h1>
      <p className="admin-page__sub">Gestiona los planes de alimentación de cada cliente</p>

      {msg && <div className={`admin-msg admin-msg--${msg.type}`}>{msg.text}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem", alignItems: "start" }}>

        {/* Users list */}
        <div className="admin-card" style={{ padding: 0, position: "sticky", top: "1rem" }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid var(--border)" }}>
            <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="aw-search" />
          </div>
          {usersLoading ? (
            <div className="admin-empty">Cargando...</div>
          ) : (
            <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
              {filtered.map(u => (
                <button key={u.id} onClick={() => selectUser(u)}
                  className={`aw-user-card ${selectedUser?.id === u.id ? "aw-user-card--active" : ""}`}>
                  <div className="aw-user-card__avatar">{u.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}</div>
                  <div className="aw-user-card__info">
                    <span className="aw-user-card__name">{u.name}</span>
                    <span className="aw-user-card__meta">{u.has_diet ? `✓ ${u.diet_title}` : "Sin dieta"}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="admin-card" style={{ minHeight: 400 }}>
          {!selectedUser ? (
            <div className="admin-empty"><span className="admin-empty__icon">🍽</span>Selecciona un usuario</div>
          ) : showForm ? (
            /* ── FORMULARIO ── */
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 className="admin-card__title" style={{ marginBottom: 0 }}>
                  <span className="admin-card__title-icon">🍽</span>
                  {editPlanId ? "Editar dieta" : "Nueva dieta"} — {selectedUser.name.split(" ")[0]}
                </h2>
                <button className="admin-btn admin-btn--ghost" onClick={() => setShowForm(false)}>✕ Cancelar</button>
              </div>

              <div className="admin-form">
                <div className="admin-form--row">
                  <div className="admin-field"><label>Titulo del plan</label>
                    <input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Ej: Plan definición - Mayo" required />
                  </div>
                  <div className="admin-field"><label>Notas generales</label>
                    <input value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="Opcional..." />
                  </div>
                </div>

                <div style={{ marginTop: "1.2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
                    <h3 style={{ fontFamily: "var(--font-condensed)", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.06em" }}>
                      Comidas ({formMeals.length})
                    </h3>
                    <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={addMeal}>+ Añadir comida</button>
                  </div>

                  {formMeals.map((meal, i) => (
                    <div key={i} style={{ background: "rgba(126,232,232,0.02)", border: "1px solid var(--border)", borderRadius: 10, padding: "1rem", marginBottom: "0.8rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                        <select value={meal.meal_type} onChange={e => updateMeal(i, "meal_type", e.target.value)}
                          style={{ background: "rgba(13,21,21,0.85)", border: "1px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-condensed)", fontSize: "0.85rem", padding: "0.4rem 0.6rem", borderRadius: 6, colorScheme: "dark" }}>
                          {MEAL_TYPES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                        {formMeals.length > 1 && (
                          <button className="admin-btn admin-btn--danger admin-btn--sm" onClick={() => removeMeal(i)}>✕</button>
                        )}
                      </div>
                      <div className="admin-field" style={{ marginBottom: "0.5rem" }}>
                        <label>Alimentos</label>
                        <textarea value={meal.foods} onChange={e => updateMeal(i, "foods", e.target.value)} rows={2}
                          placeholder="Ej: 2 huevos revueltos, 60g avena con leche, 1 plátano" />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                        <div className="admin-field"><label>Calorias</label>
                          <input value={meal.calories} onChange={e => updateMeal(i, "calories", e.target.value)} placeholder="450 kcal" />
                        </div>
                        <div className="admin-field"><label>Macros</label>
                          <input value={meal.macros} onChange={e => updateMeal(i, "macros", e.target.value)} placeholder="40P / 30C / 20G" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="admin-btn-row" style={{ marginTop: "1rem" }}>
                  <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
                    {saving ? "Guardando..." : editPlanId ? "Actualizar dieta" : "Crear dieta"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ── LISTADO DE DIETAS ── */
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 className="admin-card__title" style={{ marginBottom: 0 }}>
                  <span className="admin-card__title-icon">🍽</span> Dietas de {selectedUser.name}
                </h2>
                <button className="admin-btn admin-btn--primary" onClick={openNew}>+ Nueva dieta</button>
              </div>

              {plansLoading ? (
                <div className="admin-empty">Cargando...</div>
              ) : plans.length === 0 ? (
                <div className="admin-empty"><span className="admin-empty__icon">🍽</span>No hay dietas asignadas</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {plans.map(p => (
                    <div key={p.id} style={{ background: p.active ? "rgba(126,232,232,0.03)" : "transparent", border: "1px solid var(--border)", borderRadius: 12, padding: "1.2rem", borderLeft: p.active ? "3px solid var(--primary)" : undefined }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.8rem" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontFamily: "var(--font-condensed)", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>{p.title}</span>
                            {p.active && <span style={{ fontSize: "0.6rem", fontFamily: "var(--font-condensed)", fontWeight: 800, letterSpacing: "0.15em", padding: "0.15rem 0.5rem", background: "rgba(16,185,129,0.1)", color: "#6ee7b7", borderRadius: 4 }}>ACTIVA</span>}
                          </div>
                          {p.notes && <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>{p.notes}</p>}
                        </div>
                        <div style={{ display: "flex", gap: "0.3rem" }}>
                          <button className="admin-item__btn" onClick={() => handleToggle(p.id)} title={p.active ? "Desactivar" : "Activar"}>{p.active ? "◉" : "○"}</button>
                          <button className="admin-item__btn" onClick={() => openEdit(p)} title="Editar">✎</button>
                          <button className="admin-item__btn admin-item__btn--del" onClick={() => handleDelete(p.id)} title="Eliminar">✕</button>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.6rem" }}>
                        {p.meals.map((m, i) => (
                          <div key={i} style={{ background: "rgba(13,21,21,0.5)", border: "1px solid rgba(126,232,232,0.04)", borderRadius: 8, padding: "0.7rem 0.9rem" }}>
                            <div style={{ fontFamily: "var(--font-condensed)", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--primary-dim)", marginBottom: "0.3rem" }}>{mealLabel(m.meal_type)}</div>
                            <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>{m.foods}</div>
                            {(m.calories || m.macros) && (
                              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                                {m.calories && <span>{m.calories}</span>}
                                {m.calories && m.macros && <span> · </span>}
                                {m.macros && <span>{m.macros}</span>}
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
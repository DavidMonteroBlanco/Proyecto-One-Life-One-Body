// src/pages/admin/AdminUsersWeight.tsx

import { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import "./AdminUsersWeight.css";

type UserSummary = {
  id: number; name: string; email: string; phone: string | null;
  created_at: string; total_records: number;
  last_weight: number | null; last_fat: number | null; last_muscle: number | null;
  last_record_at: string | null;
};

type WeightRecord = {
  id: number; weight_kg: number; fat_percentage: number | null;
  muscle_percentage: number | null; notes: string | null; recorded_at: string;
};

type Stats = {
  total_records: number; current_weight: number | null; start_weight: number | null;
  total_change: number | null; last_week_change: number | null;
  current_fat: number | null; current_muscle: number | null;
};

function getToday() { return new Date().toISOString().split("T")[0]; }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminUsersWeight() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recordsLoading, setRecordsLoading] = useState(false);

  /* Add form */
  const [showAdd, setShowAdd] = useState(false);
  const [addWeight, setAddWeight] = useState("");
  const [addFat, setAddFat] = useState("");
  const [addMuscle, setAddMuscle] = useState("");
  const [addDate, setAddDate] = useState(getToday());
  const [addNotes, setAddNotes] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  /* Edit */
  const [editId, setEditId] = useState<number | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [editFat, setEditFat] = useState("");
  const [editMuscle, setEditMuscle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const addRef = useRef<HTMLInputElement>(null);

  const loadUsers = async () => {
    try { const { data } = await api.get("/admin/users"); setUsers(data); }
    catch { /* */ } finally { setUsersLoading(false); }
  };

  useEffect(() => { loadUsers(); }, []);

  const loadRecords = async (userId: number) => {
    setRecordsLoading(true);
    try {
      const [recRes, statRes] = await Promise.all([
        api.get(`/admin/users/${userId}/weight-records`),
        api.get(`/admin/users/${userId}/weight-records/stats`),
      ]);
      setRecords(recRes.data.records);
      setStats(statRes.data);
    } catch { /* */ } finally { setRecordsLoading(false); }
  };

  const selectUser = (u: UserSummary) => {
    setSelectedUser(u); setEditId(null); setShowAdd(false); loadRecords(u.id);
  };

  /* Add */
  const handleAdd = async () => {
    if (!selectedUser || !addWeight) return;
    setAddLoading(true); setAddMsg(null);
    try {
      await api.post(`/admin/users/${selectedUser.id}/weight-records`, {
        weight_kg: parseFloat(addWeight),
        fat_percentage: addFat ? parseFloat(addFat) : null,
        muscle_percentage: addMuscle ? parseFloat(addMuscle) : null,
        recorded_at: addDate, notes: addNotes || null,
      });
      setAddMsg({ type: "ok", text: "Pesaje registrado." });
      setAddWeight(""); setAddFat(""); setAddMuscle(""); setAddNotes(""); setAddDate(getToday());
      await loadRecords(selectedUser.id); await loadUsers();
      setTimeout(() => { setShowAdd(false); setAddMsg(null); }, 1000);
    } catch (err: any) {
      setAddMsg({ type: "err", text: err?.response?.data?.message || "Error." });
    } finally { setAddLoading(false); }
  };

  /* Edit */
  const startEdit = (r: WeightRecord) => {
    setEditId(r.id); setEditWeight(r.weight_kg.toString());
    setEditFat(r.fat_percentage?.toString() || "");
    setEditMuscle(r.muscle_percentage?.toString() || "");
    setEditDate(r.recorded_at); setEditNotes(r.notes || "");
  };

  const handleEdit = async () => {
    if (!editId || !selectedUser) return;
    setEditLoading(true);
    try {
      await api.put(`/admin/weight-records/${editId}`, {
        weight_kg: parseFloat(editWeight),
        fat_percentage: editFat ? parseFloat(editFat) : null,
        muscle_percentage: editMuscle ? parseFloat(editMuscle) : null,
        recorded_at: editDate, notes: editNotes || null,
      });
      setEditId(null); await loadRecords(selectedUser.id); await loadUsers();
    } catch { /* */ } finally { setEditLoading(false); }
  };

  /* Delete */
  const handleDelete = async (id: number) => {
    if (!selectedUser || !window.confirm("Eliminar este pesaje?")) return;
    setDeletingId(id);
    try { await api.delete(`/admin/weight-records/${id}`); await loadRecords(selectedUser.id); await loadUsers(); }
    catch { /* */ } finally { setDeletingId(null); }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="aw-page">
      <h1 className="aw-title">Usuarios y Pesajes</h1>
      <p className="aw-sub">Gestiona los pesajes de todos los clientes</p>

      <div className="aw-layout">
        {/* Users list */}
        <div className="aw-users">
          <div className="aw-users__header">
            <input type="text" placeholder="Buscar usuario..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="aw-search" />
            <span className="aw-users__count">{users.length} clientes</span>
          </div>

          {usersLoading ? (
            <div className="aw-loading"><span className="aw-spinner" /> Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="aw-empty">No hay usuarios</div>
          ) : (
            <div className="aw-users__list">
              {filtered.map((u) => (
                <button key={u.id}
                  className={`aw-user-card ${selectedUser?.id === u.id ? "aw-user-card--active" : ""}`}
                  onClick={() => selectUser(u)}>
                  <div className="aw-user-card__avatar">
                    {u.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="aw-user-card__info">
                    <span className="aw-user-card__name">{u.name}</span>
                    <span className="aw-user-card__meta">
                      {u.total_records > 0
                        ? `${Number(u.last_weight).toFixed(1)} kg · ${u.total_records} pesajes`
                        : "Sin pesajes"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="aw-detail">
          {!selectedUser ? (
            <div className="aw-detail__empty">
              <span className="aw-detail__empty-icon">◈</span>
              <p>Selecciona un usuario para ver y gestionar sus pesajes</p>
            </div>
          ) : (
            <>
              <div className="aw-detail__header">
                <div>
                  <h2 className="aw-detail__name">{selectedUser.name}</h2>
                  <p className="aw-detail__email">{selectedUser.email}</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {records.length > 0 && (
                    <a
                      href={`${api.defaults.baseURL}/admin/users/${selectedUser.id}/weight-records/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="aw-pdf-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        const token = localStorage.getItem("token");
                        window.open(
                          `${api.defaults.baseURL}/admin/users/${selectedUser.id}/weight-records/pdf?token=${token}`,
                          "_blank"
                        );
                      }}
                    >
                      📄 PDF
                    </a>
                  )}
                  <button className="aw-add-btn"
                    onClick={() => { setShowAdd(true); setTimeout(() => addRef.current?.focus(), 100); }}>
                    + Nuevo pesaje
                  </button>
                </div>
              </div>

              {/* Stats */}
              {stats && stats.total_records > 0 && (
                <div className="aw-stats">
                  <div className="aw-stat">
                    <span className="aw-stat__label">Peso actual</span>
                    <span className="aw-stat__value">{Number(stats.current_weight).toFixed(1)} kg</span>
                  </div>
                  <div className="aw-stat">
                    <span className="aw-stat__label">Cambio total</span>
                    <span className={`aw-stat__value ${(stats.total_change ?? 0) <= 0 ? "aw-stat__value--green" : "aw-stat__value--red"}`}>
                      {(stats.total_change ?? 0) > 0 ? "+" : ""}{Number(stats.total_change).toFixed(1)} kg
                    </span>
                  </div>
                  {stats.current_fat !== null && (
                    <div className="aw-stat">
                      <span className="aw-stat__label">Grasa</span>
                      <span className="aw-stat__value">{Number(stats.current_fat).toFixed(1)}%</span>
                    </div>
                  )}
                  {stats.current_muscle !== null && (
                    <div className="aw-stat">
                      <span className="aw-stat__label">Musculo</span>
                      <span className="aw-stat__value">{Number(stats.current_muscle).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              )}

              {/* Add form */}
              {showAdd && (
                <div className="aw-add-form">
                  <h3>Nuevo pesaje para {selectedUser.name.split(" ")[0]}</h3>
                  <div className="aw-add-form__fields">
                    <div className="aw-field">
                      <label>Peso (kg)</label>
                      <input ref={addRef} type="number" step="0.1" min="30" max="300"
                        value={addWeight} onChange={(e) => setAddWeight(e.target.value)} placeholder="82.4" />
                    </div>
                    <div className="aw-field">
                      <label>% Grasa</label>
                      <input type="number" step="0.1" min="1" max="60"
                        value={addFat} onChange={(e) => setAddFat(e.target.value)} placeholder="18.5" />
                    </div>
                    <div className="aw-field">
                      <label>% Musculo</label>
                      <input type="number" step="0.1" min="10" max="100"
                        value={addMuscle} onChange={(e) => setAddMuscle(e.target.value)} placeholder="42.3" />
                    </div>
                    <div className="aw-field">
                      <label>Fecha</label>
                      <input type="date" value={addDate} max={getToday()}
                        onChange={(e) => setAddDate(e.target.value)} />
                    </div>
                    <div className="aw-field aw-field--wide">
                      <label>Notas</label>
                      <input type="text" value={addNotes}
                        onChange={(e) => setAddNotes(e.target.value)} placeholder="Opcional..." />
                    </div>
                  </div>
                  {addMsg && <div className={`aw-msg aw-msg--${addMsg.type}`}>{addMsg.text}</div>}
                  <div className="aw-add-form__actions">
                    <button className="aw-btn aw-btn--ghost" onClick={() => setShowAdd(false)}>Cancelar</button>
                    <button className="aw-btn aw-btn--primary" onClick={handleAdd} disabled={addLoading}>
                      {addLoading ? "..." : "Guardar"}
                    </button>
                  </div>
                </div>
              )}

              {/* Records */}
              {recordsLoading ? (
                <div className="aw-loading"><span className="aw-spinner" /> Cargando...</div>
              ) : records.length === 0 ? (
                <div className="aw-empty" style={{ marginTop: "2rem" }}>Sin pesajes registrados.</div>
              ) : (
                <div className="aw-records">
                  <h3 className="aw-records__title">Historial ({records.length} pesajes)</h3>
                  {records.map((r, i) => {
                    const prev = records[i + 1];
                    const diff = prev ? r.weight_kg - prev.weight_kg : null;
                    const isEditing = editId === r.id;

                    return (
                      <div key={r.id} className={`aw-record ${isEditing ? "aw-record--editing" : ""}`}>
                        {isEditing ? (
                          <div className="aw-record__edit">
                            <input type="number" step="0.1" value={editWeight}
                              onChange={(e) => setEditWeight(e.target.value)} className="aw-record__edit-weight" placeholder="kg" />
                            <input type="number" step="0.1" value={editFat}
                              onChange={(e) => setEditFat(e.target.value)} placeholder="% grasa" style={{width:"75px"}} />
                            <input type="number" step="0.1" value={editMuscle}
                              onChange={(e) => setEditMuscle(e.target.value)} placeholder="% musc" style={{width:"75px"}} />
                            <input type="date" value={editDate} max={getToday()}
                              onChange={(e) => setEditDate(e.target.value)} />
                            <input type="text" value={editNotes} placeholder="Notas..."
                              onChange={(e) => setEditNotes(e.target.value)} />
                            <button className="aw-btn aw-btn--sm aw-btn--primary" onClick={handleEdit} disabled={editLoading}>
                              {editLoading ? "..." : "✓"}
                            </button>
                            <button className="aw-btn aw-btn--sm aw-btn--ghost" onClick={() => setEditId(null)}>✕</button>
                          </div>
                        ) : (
                          <>
                            <span className="aw-record__date">{formatDate(r.recorded_at)}</span>
                            <span className="aw-record__weight">{Number(r.weight_kg).toFixed(1)} kg</span>
                            {r.fat_percentage !== null && (
                              <span className="aw-record__body-comp">🔥 {Number(r.fat_percentage).toFixed(1)}%</span>
                            )}
                            {r.muscle_percentage !== null && (
                              <span className="aw-record__body-comp aw-record__body-comp--muscle">💪 {Number(r.muscle_percentage).toFixed(1)}%</span>
                            )}
                            {diff !== null && (
                              <span className={`aw-record__diff ${diff <= 0 ? "aw-record__diff--down" : "aw-record__diff--up"}`}>
                                {diff > 0 ? "+" : ""}{Number(diff).toFixed(1)}
                              </span>
                            )}
                            {r.notes && <span className="aw-record__notes">{r.notes}</span>}
                            <div className="aw-record__actions">
                              <button className="aw-record__btn" onClick={() => startEdit(r)} title="Editar">✎</button>
                              <button className="aw-record__btn aw-record__btn--del"
                                onClick={() => handleDelete(r.id)} disabled={deletingId === r.id} title="Eliminar">
                                {deletingId === r.id ? "..." : "✕"}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
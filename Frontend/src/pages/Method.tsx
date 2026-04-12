// src/pages/Method.tsx
import { useEffect, useState } from "react";
import api from "../services/api";
import "./admin/AdminPages.css";

type Step = { id: number; title: string; description: string | null; sort_order: number };

export default function Method() {
  const [items, setItems] = useState<Step[]>([]);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [sortOrder, setSortOrder] = useState(1);
  const [editId, setEditId] = useState<number | null>(null);
  const [eTitle, setETitle] = useState(""); const [eDesc, setEDesc] = useState(""); const [eSort, setESort] = useState(1);

  const load = async () => { try { const r = await api.get("/method-steps"); setItems(r.data || []); } catch { setMsg({ type: "err", text: "Error cargando" }); } };
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); if (!title.trim()) return; setLoading(true); setMsg(null);
    try { await api.post("/method-steps", { title: title.trim(), description: description.trim() || null, sort_order: sortOrder }); setTitle(""); setDescription(""); setSortOrder(1); await load(); setMsg({ type: "ok", text: "Paso creado" }); }
    catch (err: any) { setMsg({ type: "err", text: err?.response?.data?.message || "Error" }); } finally { setLoading(false); }
  };

  const save = async () => {
    if (!editId || !eTitle.trim()) return; setLoading(true); setMsg(null);
    try { await api.put(`/method-steps/${editId}`, { title: eTitle.trim(), description: eDesc.trim() || null, sort_order: eSort }); setEditId(null); await load(); setMsg({ type: "ok", text: "Actualizado" }); }
    catch { setMsg({ type: "err", text: "Error al actualizar" }); } finally { setLoading(false); }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Eliminar este paso?")) return; setLoading(true);
    try { await api.delete(`/method-steps/${id}`); await load(); setMsg({ type: "ok", text: "Eliminado" }); }
    catch { setMsg({ type: "err", text: "Error" }); } finally { setLoading(false); }
  };

  const startEdit = (s: Step) => { setEditId(s.id); setETitle(s.title); setEDesc(s.description || ""); setESort(s.sort_order); };

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">Metodo OLOB</h1>
      <p className="admin-page__sub">Define los pasos del metodo One Life One Body</p>

      {msg && <div className={`admin-msg admin-msg--${msg.type}`}>{msg.text}</div>}

      <div className="admin-card">
        <h2 className="admin-card__title"><span className="admin-card__title-icon">◈</span> Nuevo paso</h2>
        <form className="admin-form" onSubmit={create}>
          <div className="admin-form--row">
            <div className="admin-field"><label>Titulo</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Evaluación inicial" required /></div>
            <div className="admin-field"><label>Orden</label><input type="number" min={1} max={99} value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} /></div>
          </div>
          <div className="admin-field"><label>Descripcion</label><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe este paso del método..." rows={3} /></div>
          <div className="admin-btn-row"><button className="admin-btn admin-btn--primary" disabled={loading}>{loading ? "..." : "Crear paso"}</button></div>
        </form>
      </div>

      <div className="admin-card">
        <h2 className="admin-card__title"><span className="admin-card__title-icon">◎</span> Pasos del metodo ({items.length})</h2>
        {items.length === 0 ? (
          <div className="admin-empty"><span className="admin-empty__icon">◈</span>No hay pasos definidos</div>
        ) : (
          <div className="admin-list">
            {items.map(s => (
              <div key={s.id} className={`admin-item ${editId === s.id ? "admin-item--editing" : ""}`}>
                {editId === s.id ? (
                  <div className="admin-form" style={{ width: "100%" }}>
                    <div className="admin-form--row">
                      <div className="admin-field"><label>Titulo</label><input value={eTitle} onChange={e => setETitle(e.target.value)} /></div>
                      <div className="admin-field"><label>Orden</label><input type="number" min={1} value={eSort} onChange={e => setESort(Number(e.target.value))} /></div>
                    </div>
                    <div className="admin-field"><label>Descripcion</label><textarea value={eDesc} onChange={e => setEDesc(e.target.value)} rows={3} /></div>
                    <div className="admin-btn-row">
                      <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={save}>Guardar</button>
                      <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setEditId(null)}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="admin-item__order">{String(s.sort_order).padStart(2, "0")}</span>
                    <div className="admin-item__body">
                      <div className="admin-item__title">{s.title}</div>
                      {s.description && <div className="admin-item__desc">{s.description}</div>}
                    </div>
                    <div className="admin-item__actions">
                      <button className="admin-item__btn" onClick={() => startEdit(s)} title="Editar">✎</button>
                      <button className="admin-item__btn admin-item__btn--del" onClick={() => remove(s.id)} title="Eliminar">✕</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
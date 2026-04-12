// src/pages/admin/CollaboratorsAdmin.tsx
import { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminPages.css";

type Collaborator = { id: number; name: string; role: string | null; bio: string | null; image_url: string | null; sort_order: number };

export default function CollaboratorsAdmin() {
  const [items, setItems] = useState<Collaborator[]>([]);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(""); const [role, setRole] = useState(""); const [bio, setBio] = useState(""); const [imageUrl, setImageUrl] = useState(""); const [sortOrder, setSortOrder] = useState(1);
  const [editId, setEditId] = useState<number | null>(null);
  const [eName, setEName] = useState(""); const [eRole, setERole] = useState(""); const [eBio, setEBio] = useState(""); const [eImage, setEImage] = useState(""); const [eSort, setESort] = useState(1);

  const load = async () => { try { const r = await api.get("/collaborators"); setItems(r.data || []); } catch { setMsg({ type: "err", text: "Error cargando" }); } };
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault(); if (!name.trim()) return; setLoading(true); setMsg(null);
    try { await api.post("/collaborators", { name: name.trim(), role: role.trim() || null, bio: bio.trim() || null, image_url: imageUrl.trim() || null, sort_order: sortOrder }); setName(""); setRole(""); setBio(""); setImageUrl(""); setSortOrder(1); await load(); setMsg({ type: "ok", text: "Colaborador creado" }); }
    catch (err: any) { setMsg({ type: "err", text: err?.response?.data?.message || "Error" }); } finally { setLoading(false); }
  };

  const save = async () => {
    if (!editId || !eName.trim()) return; setLoading(true); setMsg(null);
    try { await api.put(`/collaborators/${editId}`, { name: eName.trim(), role: eRole.trim() || null, bio: eBio.trim() || null, image_url: eImage.trim() || null, sort_order: eSort }); setEditId(null); await load(); setMsg({ type: "ok", text: "Actualizado" }); }
    catch { setMsg({ type: "err", text: "Error al actualizar" }); } finally { setLoading(false); }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Eliminar colaborador?")) return; setLoading(true);
    try { await api.delete(`/collaborators/${id}`); await load(); setMsg({ type: "ok", text: "Eliminado" }); }
    catch { setMsg({ type: "err", text: "Error" }); } finally { setLoading(false); }
  };

  const startEdit = (c: Collaborator) => { setEditId(c.id); setEName(c.name); setERole(c.role || ""); setEBio(c.bio || ""); setEImage(c.image_url || ""); setESort(c.sort_order); };

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">Colaboradores</h1>
      <p className="admin-page__sub">Gestiona el equipo de One Life One Body</p>

      {msg && <div className={`admin-msg admin-msg--${msg.type}`}>{msg.text}</div>}

      <div className="admin-card">
        <h2 className="admin-card__title"><span className="admin-card__title-icon">◉</span> Nuevo colaborador</h2>
        <form className="admin-form" onSubmit={create}>
          <div className="admin-form--row">
            <div className="admin-field"><label>Nombre</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre completo" required /></div>
            <div className="admin-field"><label>Cargo</label><input value={role} onChange={e => setRole(e.target.value)} placeholder="Ej: Entrenador, Fisio..." /></div>
          </div>
          <div className="admin-field"><label>Biografia</label><textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Breve descripción..." rows={3} /></div>
          <div className="admin-form--row">
            <div className="admin-field"><label>URL imagen</label><input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." /></div>
            <div className="admin-field"><label>Orden</label><input type="number" min={1} max={999} value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} /></div>
          </div>
          <div className="admin-btn-row"><button className="admin-btn admin-btn--primary" disabled={loading}>{loading ? "..." : "Crear colaborador"}</button></div>
        </form>
      </div>

      <div className="admin-card">
        <h2 className="admin-card__title"><span className="admin-card__title-icon">◎</span> Equipo ({items.length})</h2>
        {items.length === 0 ? (
          <div className="admin-empty"><span className="admin-empty__icon">◉</span>No hay colaboradores</div>
        ) : (
          <div className="admin-list">
            {items.map(c => (
              <div key={c.id} className={`admin-item ${editId === c.id ? "admin-item--editing" : ""}`}>
                {editId === c.id ? (
                  <div className="admin-form" style={{ width: "100%" }}>
                    <div className="admin-form--row">
                      <div className="admin-field"><label>Nombre</label><input value={eName} onChange={e => setEName(e.target.value)} /></div>
                      <div className="admin-field"><label>Cargo</label><input value={eRole} onChange={e => setERole(e.target.value)} /></div>
                    </div>
                    <div className="admin-field"><label>Biografia</label><textarea value={eBio} onChange={e => setEBio(e.target.value)} rows={3} /></div>
                    <div className="admin-form--row">
                      <div className="admin-field"><label>URL imagen</label><input value={eImage} onChange={e => setEImage(e.target.value)} /></div>
                      <div className="admin-field"><label>Orden</label><input type="number" min={1} value={eSort} onChange={e => setESort(Number(e.target.value))} /></div>
                    </div>
                    <div className="admin-btn-row">
                      <button className="admin-btn admin-btn--primary admin-btn--sm" onClick={save}>Guardar</button>
                      <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setEditId(null)}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="admin-item__order">{c.sort_order}</span>
                    <div className="admin-item__body">
                      <div className="admin-item__title">{c.name} {c.role && <span style={{ color: "var(--primary-dim)", fontWeight: 400, fontSize: "0.82rem" }}>· {c.role}</span>}</div>
                      {c.bio && <div className="admin-item__desc">{c.bio}</div>}
                    </div>
                    <div className="admin-item__actions">
                      <button className="admin-item__btn" onClick={() => startEdit(c)} title="Editar">✎</button>
                      <button className="admin-item__btn admin-item__btn--del" onClick={() => remove(c.id)} title="Eliminar">✕</button>
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
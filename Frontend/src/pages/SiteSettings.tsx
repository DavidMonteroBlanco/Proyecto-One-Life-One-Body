// src/pages/SiteSettings.tsx
import { useEffect, useState } from "react";
import api from "../services/api";
import "./admin/AdminPages.css";

type Setting = { id: number; key: string; value: string | null };

export default function SiteSettingsPage() {
  const [items, setItems] = useState<Setting[]>([]);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState(""); const [value, setValue] = useState("");

  const load = async () => { try { const r = await api.get("/site-settings"); setItems(r.data || []); } catch { setMsg({ type: "err", text: "Error cargando" }); } };
  useEffect(() => { load(); }, []);

  const upsert = async (e: React.FormEvent) => {
    e.preventDefault(); if (!key.trim()) return; setLoading(true); setMsg(null);
    try { await api.post("/site-settings", { key: key.trim(), value: value.trim() || null }); setKey(""); setValue(""); await load(); setMsg({ type: "ok", text: "Configuración guardada" }); }
    catch (err: any) { setMsg({ type: "err", text: err?.response?.data?.message || "Error" }); } finally { setLoading(false); }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Eliminar esta configuración?")) return; setLoading(true);
    try { await api.delete(`/site-settings/${id}`); await load(); setMsg({ type: "ok", text: "Eliminada" }); }
    catch { setMsg({ type: "err", text: "Error" }); } finally { setLoading(false); }
  };

  return (
    <div className="admin-page">
      <h1 className="admin-page__title">Configuracion</h1>
      <p className="admin-page__sub">Ajustes generales del sistema</p>

      {msg && <div className={`admin-msg admin-msg--${msg.type}`}>{msg.text}</div>}

      <div className="admin-card">
        <h2 className="admin-card__title"><span className="admin-card__title-icon">⊕</span> Nueva configuracion</h2>
        <form className="admin-form" onSubmit={upsert}>
          <div className="admin-form--row">
            <div className="admin-field"><label>Clave</label><input value={key} onChange={e => setKey(e.target.value)} placeholder="Ej: site_name, phone..." required /></div>
            <div className="admin-field"><label>Valor</label><input value={value} onChange={e => setValue(e.target.value)} placeholder="Valor de la configuración" /></div>
          </div>
          <div className="admin-btn-row"><button className="admin-btn admin-btn--primary" disabled={loading}>{loading ? "..." : "Guardar"}</button></div>
        </form>
        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.8rem", opacity: 0.6 }}>
          Si la clave ya existe, se actualiza el valor. Si no, se crea nueva.
        </p>
      </div>

      <div className="admin-card">
        <h2 className="admin-card__title"><span className="admin-card__title-icon">◎</span> Configuraciones ({items.length})</h2>
        {items.length === 0 ? (
          <div className="admin-empty"><span className="admin-empty__icon">⊕</span>No hay configuraciones</div>
        ) : (
          <div className="admin-list">
            {items.map(s => (
              <div key={s.id} className="admin-item">
                <div className="admin-item__body">
                  <div className="admin-item__title" style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{s.key}</div>
                  <div className="admin-item__desc">{s.value || <span style={{ opacity: 0.4 }}>sin valor</span>}</div>
                </div>
                <div className="admin-item__actions">
                  <button className="admin-item__btn" onClick={() => { setKey(s.key); setValue(s.value || ""); }} title="Editar">✎</button>
                  <button className="admin-item__btn admin-item__btn--del" onClick={() => remove(s.id)} title="Eliminar">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import  api  from "../services/api";
import type { Service } from "../types";

export default function Services() {
  const [items, setItems] = useState<Service[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eDescription, setEDescription] = useState("");
  const [eSortOrder, setESortOrder] = useState(0);

  async function load() {
    const res = await api.get("/api/services");
    setItems(res.data || []);
  }

  useEffect(() => {
    load().catch(() => setMsg("No se pudieron cargar servicios"));
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    try {
      await api.post("/api/services", {
        title: title.trim(),
        description: description.trim() || null,
        sort_order: sortOrder,
      });

      setTitle("");
      setDescription("");
      setSortOrder(0);
      setMsg("Servicio creado ✅");
      load();
    } catch (err: any) {
      setMsg(err?.response?.data?.message ?? "Error creando servicio");
    }
  }

  function startEdit(s: Service) {
    setEditingId(s.id);
    setETitle(s.title);
    setEDescription(s.description ?? "");
    setESortOrder(s.sort_order ?? 0);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function update(id: number) {
    setMsg(null);
    try {
      await api.put(`/api/services/${id}`, {
        title: eTitle.trim(),
        description: eDescription.trim() || null,
        sort_order: eSortOrder,
      });

      setEditingId(null);
      setMsg("Servicio actualizado ✅");
      load();
    } catch {
      setMsg("Error actualizando servicio");
    }
  }

  async function remove(id: number) {
    const ok = confirm("¿Eliminar este servicio?");
    if (!ok) return;

    setMsg(null);
    try {
      await api.delete(`/api/services/${id}`);
      setMsg("Servicio eliminado");
      load();
    } catch {
      setMsg("Error eliminando servicio");
    }
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="olob-card">
          <h1 className="text-2xl font-bold" style={{ color: "var(--blue-dark)" }}>
            Servicios (web pública)
          </h1>

          <form onSubmit={create} className="mt-4 grid gap-3">
            <input
              className="rounded border p-2"
              placeholder="Título (ej: Entrenamiento Personal)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              className="rounded border p-2"
              placeholder="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            <input
              className="rounded border p-2"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              placeholder="Orden"
            />

            <button className="rounded p-2 text-white" style={{ backgroundColor: "var(--blue-light)" }}>
              Crear
            </button>

            {msg && <p className="text-sm">{msg}</p>}
          </form>
        </div>

        <div className="olob-card">
          <h2 className="text-lg font-bold" style={{ color: "var(--blue-dark)" }}>
            Lista de servicios
          </h2>

          <ul className="mt-3 space-y-2">
            {items.map((s) => (
              <li key={s.id} className="rounded border p-3">
                {editingId === s.id ? (
                  <div className="space-y-2">
                    <input className="w-full rounded border p-2" value={eTitle} onChange={(e) => setETitle(e.target.value)} />
                    <textarea className="w-full rounded border p-2" rows={3} value={eDescription} onChange={(e) => setEDescription(e.target.value)} />
                    <input className="w-32 rounded border p-2" type="number" value={eSortOrder} onChange={(e) => setESortOrder(Number(e.target.value))} />

                    <div className="flex gap-2">
                      <button type="button" onClick={() => update(s.id)} className="rounded bg-green-600 px-3 py-1 text-sm text-white">
                        Guardar
                      </button>
                      <button type="button" onClick={cancelEdit} className="rounded bg-gray-300 px-3 py-1 text-sm">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{s.title}</div>
                      {s.description && <div className="text-sm opacity-80">{s.description}</div>}
                      <div className="text-xs opacity-60">Orden: {s.sort_order}</div>
                    </div>

                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEdit(s)} className="rounded bg-blue-600 px-3 py-1 text-sm text-white">
                        Editar
                      </button>
                      <button type="button" onClick={() => remove(s.id)} className="rounded bg-red-600 px-3 py-1 text-sm text-white">
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageShell>
  );
}

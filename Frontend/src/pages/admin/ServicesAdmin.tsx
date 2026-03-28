import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import { api } from "../../api";

type Service = {
  id: number;
  title: string;
  description: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export default function ServicesAdmin() {
  const [items, setItems] = useState<Service[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(1);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eDescription, setEDescription] = useState("");
  const [eSortOrder, setESortOrder] = useState<number>(1);

  async function load() {
    const res = await api.get<Service[]>("/api/services");
    setItems(res.data || []);
  }

  useEffect(() => {
    load().catch(() => setMsg("No se pudieron cargar servicios"));
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!title.trim() || !description.trim()) {
      setMsg("Rellena título y descripción");
      return;
    }

    try {
      setLoading(true);
      await api.post("/api/services", {
        title: title.trim(),
        description: description.trim(),
        sort_order: sortOrder,
      });

      setTitle("");
      setDescription("");
      setSortOrder(1);

      await load();
      setMsg("Servicio creado ");
    } catch (err: any) {
      setMsg(err?.response?.data?.message ?? "Error creando servicio");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(s: Service) {
    setEditingId(s.id);
    setETitle(s.title);
    setEDescription(s.description);
    setESortOrder(s.sort_order ?? 1);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: number) {
    setMsg(null);

    if (!eTitle.trim() || !eDescription.trim()) {
      setMsg("El título y la descripción no pueden estar vacíos");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/api/services/${id}`, {
        title: eTitle.trim(),
        description: eDescription.trim(),
        sort_order: eSortOrder,
      });

      setEditingId(null);
      await load();
      setMsg("Servicio actualizado ");
    } catch (err: any) {
      setMsg(err?.response?.data?.message ?? "Error actualizando servicio");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: number) {
    const ok = confirm("¿Eliminar este servicio?");
    if (!ok) return;

    try {
      setLoading(true);
      await api.delete(`/api/services/${id}`);
      await load();
      setMsg("Servicio eliminado ");
    } catch {
      setMsg("Error eliminando servicio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="olob-card">
          <h1 className="text-2xl font-bold" style={{ color: "var(--blue-dark)" }}>
            Servicios (Admin)
          </h1>
          <p className="mt-1 text-sm opacity-80">
            Aquí el entrenador/admin puede crear, editar y borrar servicios.
          </p>
          {msg && <p className="mt-2 text-sm">{msg}</p>}
        </div>

        <div className="olob-card">
          <h2 className="text-lg font-bold" style={{ color: "var(--blue-dark)" }}>
            Crear servicio
          </h2>

          <form onSubmit={create} className="mt-3 grid gap-3">
            <input
              className="rounded border p-2"
              placeholder="Título (ej: Entrenamiento personal)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="rounded border p-2"
              placeholder="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            <input
              className="w-32 rounded border p-2"
              type="number"
              min={1}
              max={999}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />

            <button
              className="rounded px-4 py-2 text-white"
              style={{ backgroundColor: "var(--blue-light)" }}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Crear"}
            </button>
          </form>
        </div>

        <div className="olob-card">
          <h2 className="text-lg font-bold" style={{ color: "var(--blue-dark)" }}>
            Lista de servicios
          </h2>

          {items.length === 0 ? (
            <p className="mt-3 text-sm opacity-80">No hay servicios todavía.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {items.map((s) => (
                <li key={s.id} className="rounded border p-3">
                  {editingId === s.id ? (
                    <div className="space-y-2">
                      <input
                        className="w-full rounded border p-2"
                        value={eTitle}
                        onChange={(e) => setETitle(e.target.value)}
                      />

                      <textarea
                        className="w-full rounded border p-2"
                        value={eDescription}
                        onChange={(e) => setEDescription(e.target.value)}
                        rows={3}
                      />

                      <div className="flex items-center gap-2">
                        <span className="text-sm opacity-70">Orden:</span>
                        <input
                          className="w-28 rounded border p-2"
                          type="number"
                          min={1}
                          max={999}
                          value={eSortOrder}
                          onChange={(e) => setESortOrder(Number(e.target.value))}
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(s.id)}
                          className="rounded bg-green-600 px-3 py-1 text-sm text-white"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="rounded bg-gray-300 px-3 py-1 text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold">
                          {s.title} <span className="text-sm opacity-60">· #{s.sort_order}</span>
                        </div>
                        <div className="mt-1 text-sm opacity-80">{s.description}</div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(s)}
                          className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(s.id)}
                          className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageShell>
  );
}

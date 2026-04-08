import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import  api  from "../../services/api";

type Collaborator = {
  id: number;
  name: string;
  role_title: string;
  bio: string;
  image_url?: string | null;
};

export default function CollaboratorsAdmin() {
  const [items, setItems] = useState<Collaborator[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [eName, setEName] = useState("");
  const [eRoleTitle, setERoleTitle] = useState("");
  const [eDescription, setEDescription] = useState("");
  const [eImageUrl, setEImageUrl] = useState("");

  async function load() {
    const res = await api.get<Collaborator[]>("/collaborators");
    setItems(res.data || []);
  }

  useEffect(() => {
    load().catch(() => setMsg("No se pudieron cargar colaboradores"));
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!name.trim() || !roleTitle.trim() || !description.trim()) {
      setMsg("Rellena nombre, puesto y descripción");
      return;
    }

    try {
      setLoading(true);
      await api.post("/collaborators", {
        name: name.trim(),
        role_title: roleTitle.trim(),
        description: description.trim(),
        image_url: imageUrl.trim() ? imageUrl.trim() : null,
      });

      setName("");
      setRoleTitle("");
      setDescription("");
      setImageUrl("");

      await load();
      setMsg("Colaborador creado ");
    } catch (err: any) {
      setMsg(err?.response?.data?.message ?? "Error creando colaborador");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(c: Collaborator) {
    setEditingId(c.id);
    setEName(c.name);
    setERoleTitle(c.role_title);
    setEDescription(c.bio);
    setEImageUrl(c.image_url ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: number) {
    setMsg(null);

    if (!eName.trim() || !eRoleTitle.trim() || !eDescription.trim()) {
      setMsg("Nombre, puesto y descripción son obligatorios");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/collaborators/${id}`, {
        name: eName.trim(),
        role_title: eRoleTitle.trim(),
        description: eDescription.trim(),
        image_url: eImageUrl.trim() ? eImageUrl.trim() : null,
      });

      setEditingId(null);
      await load();
      setMsg("Colaborador actualizado ");
    } catch (err: any) {
      setMsg(err?.response?.data?.message ?? "Error actualizando colaborador");
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: number) {
    const ok = confirm("¿Eliminar este colaborador?");
    if (!ok) return;

    try {
      setLoading(true);
      await api.delete(`/collaborators/${id}`);
      await load();
      setMsg("Colaborador eliminado ");
    } catch {
      setMsg("Error eliminando colaborador");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="olob-card">
          <h1 className="text-2xl font-bold" style={{ color: "var(--blue-dark)" }}>
            Colaboradores (Admin)
          </h1>
          <p className="mt-1 text-sm opacity-80">
            Alta/edición/borrado de colaboradores que salen en la web pública.
          </p>
          {msg && <p className="mt-2 text-sm">{msg}</p>}
        </div>

        <div className="olob-card">
          <h2 className="text-lg font-bold" style={{ color: "var(--blue-dark)" }}>
            Crear colaborador
          </h2>

          <form onSubmit={create} className="mt-3 grid gap-3">
            <input
              className="rounded border p-2"
              placeholder="Nombre (ej: Asier)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="rounded border p-2"
              placeholder="Puesto (ej: Nutricionista)"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
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
              placeholder="URL imagen (opcional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
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
            Lista de colaboradores
          </h2>

          {items.length === 0 ? (
            <p className="mt-3 text-sm opacity-80">No hay colaboradores todavía.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {items.map((c) => (
                <li key={c.id} className="rounded border p-3">
                  {editingId === c.id ? (
                    <div className="space-y-2">
                      <input
                        className="w-full rounded border p-2"
                        value={eName}
                        onChange={(e) => setEName(e.target.value)}
                      />

                      <input
                        className="w-full rounded border p-2"
                        value={eRoleTitle}
                        onChange={(e) => setERoleTitle(e.target.value)}
                      />

                      <textarea
                        className="w-full rounded border p-2"
                        value={eDescription}
                        onChange={(e) => setEDescription(e.target.value)}
                        rows={3}
                      />

                      <input
                        className="w-full rounded border p-2"
                        value={eImageUrl}
                        onChange={(e) => setEImageUrl(e.target.value)}
                      />

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(c.id)}
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
                          {c.name} <span className="text-sm opacity-70">· {c.role_title}</span>
                        </div>
                        <div className="mt-1 text-sm opacity-80">{c.bio}</div>
                        {c.image_url ? (
                          <div className="mt-2 text-xs opacity-60">img: {c.image_url}</div>
                        ) : null}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(c.id)}
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
import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import  api  from "../services/api";
import type { Collaborator } from "../types";

export default function Collaborators() {
  const [items, setItems] = useState<Collaborator[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [eName, setEName] = useState("");
  const [eRole, setERole] = useState("");
  const [eBio, setEBio] = useState("");
  const [eImageUrl, setEImageUrl] = useState("");
  const [eSortOrder, setESortOrder] = useState(0);

  async function load() {
    const res = await api.get("/api/collaborators");
    setItems(res.data || []);
  }

  useEffect(() => {
    load().catch(() => setMsg("No se pudieron cargar colaboradores"));
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!name.trim()) {
      setMsg("El nombre es obligatorio");
      return;
    }

    try {
      await api.post("/api/collaborators", {
        name: name.trim(),
        role: role.trim() || null,
        bio: bio.trim() || null,
        image_url: imageUrl.trim() || null,
        sort_order: sortOrder,
      });

      setName("");
      setRole("");
      setBio("");
      setImageUrl("");
      setSortOrder(0);

      setMsg("Colaborador creado ");
      load();
    } catch (err: any) {
      setMsg(err?.response?.data?.message ?? "Error creando colaborador");
    }
  }

  function startEdit(c: Collaborator) {
    setEditingId(c.id);
    setEName(c.name);
    setERole(c.role ?? "");
    setEBio(c.bio ?? "");
    setEImageUrl(c.image_url ?? "");
    setESortOrder(c.sort_order ?? 0);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function update(id: number) {
    setMsg(null);

    if (!eName.trim()) {
      setMsg("El nombre no puede estar vacío");
      return;
    }

    try {
      await api.put(`/api/collaborators/${id}`, {
        name: eName.trim(),
        role: eRole.trim() || null,
        bio: eBio.trim() || null,
        image_url: eImageUrl.trim() || null,
        sort_order: eSortOrder,
      });

      setEditingId(null);
      setMsg("Colaborador actualizado ");
      load();
    } catch {
      setMsg("Error actualizando colaborador");
    }
  }

  async function remove(id: number) {
    const ok = confirm("¿Eliminar este colaborador?");
    if (!ok) return;

    setMsg(null);
    try {
      await api.delete(`/api/collaborators/${id}`);
      setMsg("Colaborador eliminado");
      load();
    } catch {
      setMsg("Error eliminando colaborador");
    }
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="olob-card">
          <h1 className="text-2xl font-bold" style={{ color: "var(--blue-dark)" }}>
            Colaboradores (web pública)
          </h1>

          <form onSubmit={create} className="mt-4 grid gap-3">
            <input
              className="rounded border p-2"
              placeholder="Nombre (ej: Laura Pérez)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              className="rounded border p-2"
              placeholder="Rol (ej: Nutricionista / Fisio)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />

            <textarea
              className="rounded border p-2"
              placeholder="Bio corta"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />

            <input
              className="rounded border p-2"
              placeholder="URL imagen (opcional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
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
            Lista de colaboradores
          </h2>

          <ul className="mt-3 space-y-2">
            {items.map((c) => (
              <li key={c.id} className="rounded border p-3">
                {editingId === c.id ? (
                  <div className="space-y-2">
                    <input className="w-full rounded border p-2" value={eName} onChange={(e) => setEName(e.target.value)} />
                    <input className="w-full rounded border p-2" value={eRole} onChange={(e) => setERole(e.target.value)} />
                    <textarea className="w-full rounded border p-2" rows={3} value={eBio} onChange={(e) => setEBio(e.target.value)} />
                    <input className="w-full rounded border p-2" value={eImageUrl} onChange={(e) => setEImageUrl(e.target.value)} />
                    <input className="w-32 rounded border p-2" type="number" value={eSortOrder} onChange={(e) => setESortOrder(Number(e.target.value))} />

                    <div className="flex gap-2">
                      <button type="button" onClick={() => update(c.id)} className="rounded bg-green-600 px-3 py-1 text-sm text-white">
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
                      <div className="font-semibold">{c.name}</div>
                      {c.role && <div className="text-sm opacity-80">{c.role}</div>}
                      {c.bio && <div className="text-sm opacity-70">{c.bio}</div>}
                      {c.image_url && <div className="text-xs opacity-60">Img: {c.image_url}</div>}
                      <div className="text-xs opacity-60">Orden: {c.sort_order}</div>
                    </div>

                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEdit(c)} className="rounded bg-blue-600 px-3 py-1 text-sm text-white">
                        Editar
                      </button>
                      <button type="button" onClick={() => remove(c.id)} className="rounded bg-red-600 px-3 py-1 text-sm text-white">
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

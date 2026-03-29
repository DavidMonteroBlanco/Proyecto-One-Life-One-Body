import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import  api  from "../services/api";

type SavedExercise = {
  id: number;
  source: string;
  external_id: number;
  name: string;
  description?: string | null;
  created_at?: string;
};

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").trim();
}

export default function SavedExercises() {
  const [items, setItems] = useState<SavedExercise[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await api.get("/api/saved-exercises");
    setItems(res.data || []);
  }

  useEffect(() => {
    load().catch(() => setMsg("No se pudieron cargar favoritos"));
  }, []);

  async function remove(id: number) {
    const ok = confirm("¿Quitar de favoritos?");
    if (!ok) return;

    try {
      await api.delete(`/api/saved-exercises/${id}`);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setMsg("Error quitando favorito");
    }
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="olob-card">
          <h1 className="text-2xl font-bold" style={{ color: "var(--blue-dark)" }}>
            Favoritos
          </h1>
          <p className="mt-1 text-sm opacity-80">
            Ejercicios guardados desde la API externa (wger).
          </p>
          {msg && <p className="mt-2 text-sm">{msg}</p>}
        </div>

        <div className="olob-card">
          {items.length === 0 ? (
            <p className="text-sm opacity-80">No tienes favoritos todavía.</p>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {items.map((x) => (
                <li key={x.id} className="rounded border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold">{x.name}</div>
                      <div className="mt-1 text-xs opacity-70">
                        {stripHtml(x.description || "").slice(0, 140) || "Sin descripción"}
                        {stripHtml(x.description || "").length > 140 ? "…" : ""}
                      </div>
                      <div className="mt-2 text-xs opacity-60">
                        source: {x.source} · external_id: {x.external_id}
                      </div>
                    </div>

                    <button
                      onClick={() => remove(x.id)}
                      className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageShell>
  );
}

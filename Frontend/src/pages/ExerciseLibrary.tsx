import { useEffect, useMemo, useState } from "react";
import PageShell from "../components/PageShell";
import  api  from "../services/api";
import type { WgerExercise, WgerListResponse } from "../types";

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").trim();
}


type WgerDetail = {
  id: number;
  name: string;
  description?: string;

  translations?: Array<{ description?: string; name?: string }>;
};

function pickDescription(obj: { description?: string; translations?: any[] } | null | undefined) {
  if (!obj) return "";
  const direct = stripHtml(obj.description || "");
  if (direct) return direct;

  const t0 = obj.translations?.[0]?.description ? stripHtml(obj.translations[0].description) : "";
  if (t0) return t0;

  return "";
}

export default function ExerciseLibrary() {
  const [q, setQ] = useState("press");
  const [items, setItems] = useState<WgerExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [onlyWithDesc, setOnlyWithDesc] = useState(false);
  const [sort, setSort] = useState<"none" | "asc" | "desc">("asc");

  const [detail, setDetail] = useState<WgerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [savingId, setSavingId] = useState<number | null>(null);

  async function search(term: string) {
    setLoading(true);
    setMsg(null);

    try {
      const res = await api.get<WgerListResponse<WgerExercise>>(
        "/api/public/external/wger/exercises",
        { params: { search: term, limit: 30 } }
      );

      const list = res.data.results ?? [];
      setItems(list);

      if (!list.length) setMsg("No se encontraron ejercicios");
    } catch {
      setItems([]);
      setMsg("Error consultando la API externa");
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(id: number) {
    setDetailLoading(true);
    setMsg(null);

    try {
      const res = await api.get<WgerDetail>(`/api/public/external/wger/exerciseinfo/${id}`);
      setDetail(res.data);
    } catch {
      setMsg("No se pudo cargar el detalle");
    } finally {
      setDetailLoading(false);
    }
  }

  async function saveToDb(ex: { id: number; name?: string; description?: string }) {
    setMsg(null);
    setSavingId(ex.id);

    try {
      await api.post("/api/saved-exercises", {
        source: "wger",
        external_id: ex.id,
        name: ex.name || `Ejercicio #${ex.id}`,
        description: ex.description || "",
      });

      setMsg("Guardado en BD ");
    } catch (e: any) {
      setMsg(e?.response?.data?.message ?? "No se pudo guardar en BD");
    } finally {
      setSavingId(null);
    }
  }

  useEffect(() => {
    search(q);
  }, []);

  const view = useMemo(() => {
    let list = [...items];

    if (onlyWithDesc) {
      list = list.filter((x) => stripHtml(x.description || "").length > 0);
    }

    if (sort !== "none") {
      list.sort((a, b) => {
        const aa = (a.name || "").toLowerCase();
        const bb = (b.name || "").toLowerCase();
        if (aa < bb) return sort === "asc" ? -1 : 1;
        if (aa > bb) return sort === "asc" ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [items, onlyWithDesc, sort]);

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="olob-card">
          <h1 className="text-2xl font-bold">Biblioteca de ejercicios</h1>
          <p className="mt-1 text-sm opacity-70">
            API externa (wger) con búsqueda, filtros, orden, detalle y guardado en BD.
          </p>

          <form
            className="mt-4 flex flex-col gap-3 md:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              const term = q.trim();
              if (term.length < 2) {
                setMsg("Escribe al menos 2 caracteres");
                return;
              }
              search(term);
            }}
          >
            <input
              className="flex-1 rounded border p-2"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="press, squat..."
            />

            <button
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={onlyWithDesc}
                onChange={(e) => setOnlyWithDesc(e.target.checked)}
              />
              Solo con descripción
            </label>

            <label className="flex items-center gap-2">
              Orden:
              <select
                className="rounded border p-1"
                value={sort}
                onChange={(e) => setSort(e.target.value as "none" | "asc" | "desc")}
              >
                <option value="none">Sin</option>
                <option value="asc">A-Z</option>
                <option value="desc">Z-A</option>
              </select>
            </label>
          </div>

          {msg && <p className="mt-3 text-sm">{msg}</p>}
        </div>

        <div className="olob-card">
          <h2 className="text-lg font-bold">Resultados ({view.length})</h2>

          {view.length === 0 ? (
            <p className="mt-3 text-sm opacity-70">Sin resultados</p>
          ) : (
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {view.map((ex) => {
                const desc = stripHtml(ex.description || "");
                const short = desc.slice(0, 120);

                return (
                  <li key={ex.id} className="rounded border p-3">
                    <div className="flex items-start gap-3 overflow-hidden">
                      <img
                        src="/LOGO-OLB CHICA.jpg"
                        alt="One Life One Body"
                        loading="lazy"
                        style={{
                          width: "56px",
                          height: "56px",
                          objectFit: "contain",
                          borderRadius: "10px",
                          background: "white",
                          padding: "4px",
                          flex: "0 0 auto",
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{ex.name || `Ejercicio #${ex.id}`}</div>

                        <div className="mt-1 text-xs opacity-70">
                          {short || "Descripción no disponible en la lista. Pulsa “Ver” para detalle."}
                          {desc.length > 120 ? "…" : ""}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => loadDetail(ex.id)}
                            className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:opacity-90"
                          >
                            Ver
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              saveToDb({
                                id: ex.id,
                                name: ex.name || `Ejercicio #${ex.id}`,
                                description: desc || "",
                              })
                            }
                            disabled={savingId === ex.id}
                            className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-60"
                          >
                            {savingId === ex.id ? "Guardando..." : "Guardar en BD"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {detail && (
          <div className="olob-card border-2 border-blue-600">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">{detail.name}</h3>
                <p className="text-xs opacity-70">ID externo: {detail.id}</p>
              </div>

              <button
                type="button"
                onClick={() => setDetail(null)}
                className="text-sm text-red-600 hover:underline"
              >
                Cerrar
              </button>
            </div>

            {detailLoading ? (
              <p className="mt-3">Cargando...</p>
            ) : (
              (() => {
                const clean = pickDescription(detail);

                return (
                  <div className="mt-3 space-y-3">
                    <p className="text-sm leading-relaxed">
                      {clean ||
                        "Este ejercicio no trae descripción en la base externa. Aun así puedes guardarlo y describirlo en tu plan (series, repeticiones, técnica y descanso)."}
                    </p>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          saveToDb({
                            id: detail.id,
                            name: detail.name || `Ejercicio #${detail.id}`,
                            description: clean || "",
                          })
                        }
                        disabled={savingId === detail.id}
                        className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-60"
                      >
                        {savingId === detail.id ? "Guardando..." : "Guardar en BD"}
                      </button>
                    </div>

                    {!clean && (
                      <div className="rounded border p-3 text-sm opacity-90">
                        <div className="font-semibold">Sugerencia rápida</div>
                        <ul className="mt-2 list-disc pl-5">
                          <li>Calienta 5–10 min</li>
                          <li>1 serie ligera para técnica</li>
                          <li>3–4 series de 8–12 reps</li>
                          <li>Descanso 60–90s y control del movimiento</li>
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}

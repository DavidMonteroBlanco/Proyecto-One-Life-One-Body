import { useEffect, useRef, useState, useCallback } from "react";
import api from "../services/api";
import type { WgerExercise, WgerExerciseDetail, WgerListResponse } from "../types";
import "./ExerciseLibrary.css";

/* ── Categorías wger con sus IDs ── */
const CATEGORIES = [
  { id: null,  label: "Todos" },
  { id: 11,    label: "Pecho" },
  { id: 12,    label: "Espalda" },
  { id: 13,    label: "Hombros" },
  { id: 8,     label: "Brazos" },
  { id: 9,     label: "Piernas" },
  { id: 10,    label: "Abdomen" },
  { id: 14,    label: "Gemelos" },
];

/* ── Animación entre 2 imágenes (efecto demo) ── */
function ExerciseAnim({ images, className = "" }: { images: string[]; className?: string }) {
  const [errors, setErrors] = useState<Record<number, boolean>>({});
  const valid = (images ?? []).filter((_, i) => !errors[i]);

  const onErr = (i: number) => setErrors((p) => ({ ...p, [i]: true }));

  if (valid.length === 0) {
    return (
      <div className={`exlib__img-placeholder ${className}`}>
        <div className="exlib__img-placeholder-icon">◎</div>
        <div className="exlib__img-placeholder-text">Sin imagen</div>
      </div>
    );
  }
  if (valid.length === 1) {
    return (
      <img
        src={valid[0]} alt="" loading="lazy" referrerPolicy="no-referrer"
        className={`exlib__img ${className}`}
        onError={() => onErr(images.indexOf(valid[0]))}
      />
    );
  }
  return (
    <>
      <img src={valid[0]} alt="" loading="lazy" referrerPolicy="no-referrer"
        className={`exlib__img exlib__img--a ${className}`}
        onError={() => onErr(images.indexOf(valid[0]))} />
      <img src={valid[1]} alt="" loading="lazy" referrerPolicy="no-referrer"
        className={`exlib__img exlib__img--b ${className}`}
        onError={() => onErr(images.indexOf(valid[1]))} />
      <span className="exlib__anim-badge">● DEMO</span>
    </>
  );
}

/* ── Modal de detalle ── */
function DetailModal({
  exerciseId,
  onClose,
  savedIds,
  onToggleSave,
}: {
  exerciseId: number;
  onClose: () => void;
  savedIds: Set<number>;
  onToggleSave: (id: number, name: string, desc: string) => void;
}) {
  const [detail, setDetail] = useState<WgerExerciseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const isSaved = savedIds.has(exerciseId);

  useEffect(() => {
    setLoading(true);
    api
      .get<WgerExerciseDetail>(`/public/external/wger/exerciseinfo/${exerciseId}`)
      .then((r) => setDetail(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [exerciseId]);

  // Cerrar con Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="exlib__overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="exlib__modal">
        <button className="exlib__modal-close" onClick={onClose} aria-label="Cerrar">✕</button>

        <div className="exlib__modal-img-wrap">
          {loading ? (
            <div className="exlib__modal-img-placeholder">◎</div>
          ) : detail?.images?.length ? (
            <>
              {detail.images.length === 1 ? (
                <img src={detail.images[0]} alt="" className="exlib__modal-img"
                  referrerPolicy="no-referrer"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
              ) : (
                <>
                  <img src={detail.images[0]} alt="" className="exlib__modal-img exlib__modal-img--a"
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  <img src={detail.images[1]} alt="" className="exlib__modal-img exlib__modal-img--b"
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                </>
              )}
            </>
          ) : detail?.videoId ? (
            <iframe
              className="exlib__modal-video"
              src={`https://www.youtube.com/embed/${detail.videoId}?autoplay=1&mute=1&loop=1&playlist=${detail.videoId}&controls=0&rel=0&modestbranding=1&playsinline=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen={false}
              title={detail.name}
            />
          ) : (
            <div className="exlib__modal-img-placeholder">◎</div>
          )}
        </div>

        <div className="exlib__modal-body">
          {loading ? (
            <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-condensed)", fontSize: "0.9rem" }}>
              Cargando...
            </div>
          ) : !detail ? (
            <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-condensed)", fontSize: "0.9rem" }}>
              No se pudo cargar el ejercicio.
            </div>
          ) : (
            <>
              <h2 className="exlib__modal-name">{detail.name}</h2>

              <div className="exlib__modal-meta">
                {detail.category && <span className="exlib__badge exlib__badge--cat">{detail.category}</span>}
                {detail.muscles?.slice(0, 3).map((m) => (
                  <span key={m} className="exlib__badge exlib__badge--muscle">{m}</span>
                ))}
              </div>

              {detail.description && (
                <p className="exlib__modal-desc">{detail.description}</p>
              )}

              {detail.muscles && detail.muscles.length > 0 && (
                <div className="exlib__modal-section">
                  <div className="exlib__modal-section-title">Músculos trabajados</div>
                  <div className="exlib__modal-tags">
                    {detail.muscles.map((m) => (
                      <span key={m} className="exlib__modal-tag">{m}</span>
                    ))}
                  </div>
                </div>
              )}

              {detail.equipment && detail.equipment.length > 0 && (
                <div className="exlib__modal-section">
                  <div className="exlib__modal-section-title">Material necesario</div>
                  <div className="exlib__modal-tags">
                    {detail.equipment.map((e) => (
                      <span key={e} className="exlib__modal-tag">{e}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="exlib__modal-actions">
                <button
                  className={`exlib__modal-save-btn ${isSaved ? "exlib__modal-save-btn--saved" : ""}`}
                  onClick={() => onToggleSave(detail.id, detail.name, detail.description)}
                >
                  {isSaved ? "✓ Guardado en favoritos" : "♡ Guardar en favoritos"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Componente principal ── */
export default function ExerciseLibrary() {
  const [exercises, setExercises]   = useState<WgerExercise[]>([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState("");
  const [activecat, setActiveCat]   = useState<number | null>(null);
  const [status, setStatus]         = useState<string>("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [savedIds, setSavedIds]     = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchExercises = useCallback(async (q: string, cat: number | null) => {
    setLoading(true);
    setStatus("");
    try {
      const params: Record<string, string | number> = { limit: 24 };
      if (q.trim())  params.search   = q.trim();
      if (cat)       params.category = cat;

      const res = await api.get<WgerListResponse<WgerExercise>>(
        "/public/external/wger/exercises", { params }
      );
      const list = res.data.results ?? [];
      setExercises(list);
      setStatus(list.length === 0 ? "Sin resultados para esa búsqueda." : `${list.length} ejercicios`);
    } catch {
      setExercises([]);
      setStatus("Error conectando con la API. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar favoritos del usuario
  useEffect(() => {
    api.get("/saved-exercises")
      .then((r) => {
        const ids = new Set<number>(
          (r.data ?? []).map((x: { external_id: number }) => x.external_id)
        );
        setSavedIds(ids);
      })
      .catch(() => {});
  }, []);

  // Carga inicial con categoría "Todos"
  useEffect(() => { fetchExercises("", null); }, [fetchExercises]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExercises(search, activecat);
  };

  const handleCat = (id: number | null) => {
    setActiveCat(id);
    fetchExercises(search, id);
  };

  const handleToggleSave = async (id: number, name: string, desc: string) => {
    try {
      if (savedIds.has(id)) {
        // Buscar el ID local del saved exercise para borrarlo
        const res = await api.get("/saved-exercises");
        const found = (res.data ?? []).find((x: { external_id: number; id: number }) => x.external_id === id);
        if (found) await api.delete(`/saved-exercises/${found.id}`);
        setSavedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
      } else {
        await api.post("/saved-exercises", { source: "wger", external_id: id, name, description: desc });
        setSavedIds((prev) => new Set(prev).add(id));
      }
    } catch { /* silent */ }
  };

  return (
    <div className="exlib">
      {/* Header */}
      <div className="exlib__header">
        <h1 className="exlib__title">BIBLIOTECA DE<br />EJERCICIOS</h1>
        <p className="exlib__sub">Demostraciones animadas</p>
      </div>

      {/* Búsqueda */}
      <form className="exlib__search-row" onSubmit={handleSearch}>
        <div className="exlib__search-wrap">
          <span className="exlib__search-icon">⌕</span>
          <input
            ref={inputRef}
            className="exlib__search-input"
            type="text"
            placeholder="Buscar ejercicio... (press, squat, curl...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="exlib__search-btn" type="submit" disabled={loading}>
          {loading ? "..." : "Buscar"}
        </button>
      </form>

      {/* Categorías */}
      <div className="exlib__cats">
        {CATEGORIES.map((c) => (
          <button
            key={c.id ?? "all"}
            className={`exlib__cat-pill ${activecat === c.id ? "exlib__cat-pill--active" : ""}`}
            onClick={() => handleCat(c.id)}
            type="button"
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Estado */}
      <div className="exlib__status">{status}</div>

      {/* Grid */}
      {loading ? (
        <div className="exlib__skeleton-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="exlib__skeleton-card">
              <div className="exlib__skeleton-img" />
              <div className="exlib__skeleton-body">
                <div className="exlib__skeleton-line" />
                <div className="exlib__skeleton-line exlib__skeleton-line--short" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="exlib__grid">
          {exercises.length === 0 ? (
            <div className="exlib__empty">
              <div className="exlib__empty-icon">◎</div>
              <div className="exlib__empty-text">Sin resultados</div>
            </div>
          ) : (
            exercises.map((ex) => (
              <div
                key={ex.id}
                className={`exlib__card ${savedIds.has(ex.id) ? "exlib__card--saved" : ""}`}
                onClick={() => setSelectedId(ex.id)}
              >
                <div className="exlib__img-wrap">
                  <ExerciseAnim images={ex.images ?? []} />
                </div>
                <button
                  className={`exlib__save-btn ${savedIds.has(ex.id) ? "exlib__save-btn--saved" : ""}`}
                  title={savedIds.has(ex.id) ? "Quitar de favoritos" : "Guardar en favoritos"}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleSave(ex.id, ex.name, "");
                  }}
                >
                  {savedIds.has(ex.id) ? "♥" : "♡"}
                </button>
                <div className="exlib__card-body">
                  <div className="exlib__card-name">{ex.name}</div>
                  <div className="exlib__card-meta">
                    {ex.category && (
                      <span className="exlib__badge exlib__badge--cat">{ex.category}</span>
                    )}
                    {ex.muscles?.slice(0, 2).map((m) => (
                      <span key={m} className="exlib__badge exlib__badge--muscle">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de detalle */}
      {selectedId !== null && (
        <DetailModal
          exerciseId={selectedId}
          onClose={() => setSelectedId(null)}
          savedIds={savedIds}
          onToggleSave={handleToggleSave}
        />
      )}
    </div>
  );
}

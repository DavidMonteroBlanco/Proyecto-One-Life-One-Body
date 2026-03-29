import { useEffect, useState } from "react";
import  api  from "../services/api";
import type { Workout } from "../types";
import PageShell from "../components/PageShell";

export default function Workouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(45);
  const [level, setLevel] = useState<Workout["level"]>("beginner");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDuration, setEditDuration] = useState<number>(45);
  const [editLevel, setEditLevel] = useState<Workout["level"]>("beginner");

  async function loadWorkouts() {
    try {
      const res = await api.get("/api/workouts");
      setWorkouts(res.data || []);
    } catch {
      setMsg("No se pudieron cargar entrenos");
    }
  }

  useEffect(() => {
    loadWorkouts();
  }, []);

  async function createWorkout(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!title.trim()) {
      setMsg("Pon un título");
      return;
    }

    try {
      await api.post("/api/workouts", {
        title: title.trim(),
        duration_minutes: duration,
        level,
      });

      setTitle("");
      setDuration(45);
      setLevel("beginner");
      setMsg("Entreno creado ");
      loadWorkouts();
    } catch (err: any) {
      setMsg(err?.response?.data?.message ?? "Error creando entreno");
    }
  }

  async function deleteWorkout(id: number) {
    const ok = confirm("¿Seguro que quieres eliminar este entrenamiento?");
    if (!ok) return;

    setMsg(null);
    try {
      await api.delete(`/api/workouts/${id}`);
      setMsg("Entreno eliminado");
      loadWorkouts();
    } catch {
      setMsg("Error al eliminar el entrenamiento");
    }
  }

  function startEdit(w: Workout) {
    setEditingId(w.id);
    setEditTitle(w.title);
    setEditDuration(w.duration_minutes);
    setEditLevel(w.level);
    setMsg(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function updateWorkout(id: number) {
    if (!editTitle.trim()) {
      setMsg("El título no puede estar vacío");
      return;
    }

    setMsg(null);
    try {
      await api.put(`/api/workouts/${id}`, {
        title: editTitle.trim(),
        duration_minutes: editDuration,
        level: editLevel,
      });

      setEditingId(null);
      setMsg("Entreno actualizado ");
      loadWorkouts();
    } catch {
      setMsg("Error al actualizar el entreno");
    }
  }

  return (
  <PageShell>
    <div className="space-y-6">
      <div className="olob-card">
        <h1 className="text-2xl font-bold">Entrenamientos</h1>

        <form onSubmit={createWorkout} className="mt-4 grid gap-3">
          <input
            className="rounded border p-2"
            placeholder="Título (ej: Pierna A)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            className="rounded border p-2"
            type="number"
            min={10}
            max={300}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />

          <select
            className="rounded border p-2"
            value={level}
            onChange={(e) => setLevel(e.target.value as Workout["level"])}
          >
            <option value="beginner">principiante</option>
            <option value="intermediate">intermedio</option>
            <option value="advanced">avanzado</option>
          </select>

          <button className="rounded bg-black p-2 text-white">Crear</button>

          {msg && <p className="text-sm">{msg}</p>}
        </form>
      </div>

      <div className="olob-card">
        <h2 className="text-lg font-bold">Mis entrenos</h2>

        {workouts.length === 0 ? (
          <p className="mt-3 text-sm opacity-80">
            No tienes entrenos todavía.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {workouts.map((w) => (
              <li key={w.id} className="rounded border p-3">
                {editingId === w.id ? (
                  <div className="space-y-2">
                    <input
                      className="w-full rounded border p-2"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />

                    <div className="flex gap-2">
                      <input
                        className="w-24 rounded border p-2"
                        type="number"
                        min={10}
                        max={300}
                        value={editDuration}
                        onChange={(e) =>
                          setEditDuration(Number(e.target.value))
                        }
                      />

                      <select
                        className="rounded border p-2"
                        value={editLevel}
                        onChange={(e) =>
                          setEditLevel(
                            e.target.value as Workout["level"]
                          )
                        }
                      >
                        <option value="beginner">principiante</option>
                        <option value="intermediate">intermedio</option>
                        <option value="advanced">avanzado</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => updateWorkout(w.id)}
                        className="rounded bg-green-600 px-3 py-1 text-sm text-white"
                      >
                        Guardar
                      </button>

                      <button
                        onClick={cancelEdit}
                        className="rounded bg-gray-300 px-3 py-1 text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{w.title}</div>
                      <div className="text-sm opacity-80">
                        {w.duration_minutes} min · {w.level}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(w)}
                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => deleteWorkout(w.id)}
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
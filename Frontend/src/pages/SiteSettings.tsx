import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import  api  from "../services/api";
import type { SiteSetting } from "../types";

type SettingKey = "phone" | "email" | "address" | "instagram";

const DEFAULT_KEYS: { key: SettingKey; label: string; placeholder: string }[] = [
  { key: "phone", label: "Teléfono", placeholder: "+34 600 000 000" },
  { key: "email", label: "Email", placeholder: "contacto@onelifeonebody.com" },
  { key: "address", label: "Dirección", placeholder: "Calle ... / Ciudad" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
];

export default function SiteSettingsPage() {
  const [items, setItems] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await api.get("/site-settings");
    const list: SiteSetting[] = res.data || [];

    const map: Record<string, string> = {};
    for (const it of list) map[it.key] = it.value ?? "";
    setItems(map);
  }

  useEffect(() => {
    load().catch(() => setMsg("No se pudo cargar la configuración"));
  }, []);

  async function saveOne(key: string, value: string) {
    setMsg(null);
    setLoading(true);
    try {
      await api.post("/site-settings", { key, value: value.trim() || null });
      setMsg("Guardado ");
      load();
    } catch {
      setMsg("Error guardando");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="space-y-6">
        <div className="olob-card">
          <h1 className="text-2xl font-bold" style={{ color: "var(--blue-dark)" }}>
            Contacto / Configuración (web pública)
          </h1>
          <p className="mt-1 text-sm opacity-80">
            Esto se usa en la sección de Contacto del PHP.
          </p>

          {msg && <p className="mt-3 text-sm">{msg}</p>}
        </div>

        <div className="olob-card">
          <h2 className="text-lg font-bold" style={{ color: "var(--blue-dark)" }}>
            Datos de contacto
          </h2>

          <div className="mt-4 grid gap-4">
            {DEFAULT_KEYS.map((f) => (
              <div key={f.key} className="grid gap-2">
                <label className="text-sm font-semibold">{f.label}</label>

                <div className="flex gap-2">
                  <input
                    className="w-full rounded border p-2"
                    placeholder={f.placeholder}
                    value={items[f.key] ?? ""}
                    onChange={(e) =>
                      setItems((prev) => ({ ...prev, [f.key]: e.target.value }))
                    }
                  />

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => saveOne(f.key, items[f.key] ?? "")}
                    className="rounded px-3 py-2 text-sm text-white"
                    style={{ backgroundColor: "var(--blue-light)" }}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
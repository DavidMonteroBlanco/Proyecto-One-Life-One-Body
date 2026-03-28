const WGER = import.meta.env.VITE_WGER_API as string;

export async function wgerGet<T>(path: string): Promise<T> {
  const url = `${WGER}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`WGER error ${res.status}`);
  return res.json();
}

// yt-relatorio — relatórios do YouTube Analytics de um canal conectado (para análises sob medida).
// POST { canal, relatorios: [{ nome, metrics, dimensions?, startDate, endDate, sort?, maxResults?, filters? }] }
// Autorização: x-ingest-token ou login de admin. Usa o refresh token salvo em Integrações (yt_<canal>_refresh).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function autorizado(db: SupabaseClient, req: Request) {
  const { data: tk } = await db.from("app_config").select("value").eq("key", "ingest_token").maybeSingle();
  if (tk && req.headers.get("x-ingest-token") === tk.value) return true;
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return false;
  const u = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data } = await u.rpc("is_admin");
  return data === true;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { ok: false });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  if (!(await autorizado(db, req))) return json(401, { ok: false });
  const { canal, relatorios } = await req.json().catch(() => ({}));
  if (!/^[a-z0-9-]+$/.test(String(canal || "")) || !Array.isArray(relatorios)) return json(400, { ok: false, erro: "canal ou relatorios inválidos" });
  const { data } = await db.from("app_config").select("key,value").in("key", ["yt_oauth_client_id", "yt_oauth_client_secret", `yt_${canal}_refresh`]);
  const m = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
  if (!m[`yt_${canal}_refresh`]) return json(400, { ok: false, erro: "conta do YouTube não conectada" });
  const t = await (await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: m.yt_oauth_client_id, client_secret: m.yt_oauth_client_secret, refresh_token: m[`yt_${canal}_refresh`], grant_type: "refresh_token" }),
  })).json().catch(() => ({}));
  if (!t.access_token) return json(400, { ok: false, erro: t.error || "sem token" });
  const out: Record<string, unknown> = {};
  for (const r of relatorios.slice(0, 20)) {
    const p: Record<string, string> = { ids: "channel==MINE", metrics: r.metrics, startDate: r.startDate, endDate: r.endDate };
    for (const k of ["dimensions", "sort", "maxResults", "filters"]) if (r[k]) p[k] = String(r[k]);
    const res = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${new URLSearchParams(p)}`, { headers: { Authorization: `Bearer ${t.access_token}` } });
    const x = await res.json().catch(() => ({}));
    if (!res.ok || x.error) { out[r.nome] = { erro: x.error?.message || `HTTP ${res.status}` }; continue; }
    const cols = (x.columnHeaders ?? []).map((h: { name: string }) => h.name);
    out[r.nome] = ((x.rows ?? []) as unknown[][]).map((row) => Object.fromEntries(cols.map((c: string, i: number) => [c, row[i]])));
  }
  return json(200, { ok: true, canal, relatorios: out });
});

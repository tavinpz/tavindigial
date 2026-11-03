// jogo-evento — recebe eventos anônimos de dentro dos jogos (abriu, começou, fase, fim, pulso) e grava em jogo_eventos.
// Público (o jogo roda em portais de terceiros). Aceita só jogos cadastrados e tipos conhecidos, no máximo 40 eventos por envio.
// Vem por navigator.sendBeacon (text/plain, sem preflight) ou fetch JSON.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};
const TIPOS = new Set(["abriu", "comecou", "fase", "fim", "pulso"]);
const PORTAIS = new Set(["crazygames", "poki", "itch", "playgama", "gamedistribution", "gamemonetize", "y8", "telegram", "tavindigital", "local", "outro"]);
const ID = /^[a-z0-9-]{1,40}$/;
const ANON = /^[a-zA-Z0-9_-]{6,40}$/;
let jogosOk: { ids: Set<string>; em: number } | null = null;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return new Response(null, { status: 405, headers: cors });
  const ua = req.headers.get("user-agent") ?? "";
  if (/bot|crawl|spider|headless|python|curl|wget/i.test(ua)) return new Response(null, { status: 204, headers: cors });

  let b: Record<string, unknown> = {};
  try { b = JSON.parse(await req.text()); } catch { return new Response(null, { status: 400, headers: cors }); }
  const jogo = String(b.j ?? ""), jogador = String(b.u ?? ""), sessao = String(b.s ?? "");
  let portal = String(b.p ?? "outro");
  if (!PORTAIS.has(portal)) portal = "outro";
  if (!ID.test(jogo) || !ANON.test(jogador) || !ANON.test(sessao) || !Array.isArray(b.e)) return new Response(null, { status: 400, headers: cors });

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  if (!jogosOk || Date.now() - jogosOk.em > 60000) {
    const { data } = await db.from("jogos").select("id").neq("status", "pausado");
    jogosOk = { ids: new Set((data ?? []).map((r: { id: string }) => r.id)), em: Date.now() };
  }
  if (!jogosOk.ids.has(jogo)) return new Response(null, { status: 204, headers: cors });

  const linhas = (b.e as Record<string, unknown>[]).slice(0, 40).filter((e) => TIPOS.has(String(e?.t))).map((e) => {
    const v = (e.v && typeof e.v === "object" ? e.v : {}) as Record<string, unknown>;
    const valor: Record<string, number> = {};
    for (const k of ["seg", "fase", "pontos", "partida"]) if (Number.isFinite(Number(v[k]))) valor[k] = Math.max(0, Math.min(1e9, Math.round(Number(v[k]))));
    return { jogo, portal, jogador, sessao, tipo: String(e.t), valor };
  });
  if (linhas.length) await db.from("jogo_eventos").insert(linhas);
  return new Response(null, { status: 204, headers: cors });
});

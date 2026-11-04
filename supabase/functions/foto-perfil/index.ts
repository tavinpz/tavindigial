// foto-perfil — copia a foto de perfil do Instagram do canal para o Storage (videos/marca/<canal>.jpg),
// para o painel usar a mesma imagem do perfil. Sem Instagram ligado, usa a foto do YouTube e depois a do TikTok. POST { canal } com x-ingest-token ou login de admin.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

const VERSAO = "v23.0";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info, x-ingest-token",
};
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

async function autorizado(db: SupabaseClient, req: Request) {
  const { data: cfg } = await db.from("app_config").select("value").eq("key", "ingest_token").maybeSingle();
  if (cfg && req.headers.get("x-ingest-token") === cfg.value) return true;
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return false;
  const u = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data } = await u.rpc("is_admin");
  return data === true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  if (!(await autorizado(db, req))) return json(401, { ok: false });
  const { canal } = await req.json().catch(() => ({}));
  if (!/^[a-z0-9-]+$/.test(String(canal || ""))) return json(400, { ok: false, erro: "canal inválido" });
  const principal = canal === "tavin-digital";
  const kt = principal ? "instagram_token" : `ig_${canal}_token`, ku = principal ? "instagram_user_id" : `ig_${canal}_user_id`;
  const { data } = await db.from("app_config").select("key,value").in("key", [kt, ku, `yt_${canal}_ref`, `yt_${canal}_channel_id`, `tt_${canal}_avatar`]);
  const m = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
  // 1º Instagram; sem Instagram ligado, a foto do canal do YouTube; depois a do TikTok
  let foto = "", de = "", nome = "";
  if (m[kt]) {
    const host = m[kt].startsWith("IG") ? "graph.instagram.com" : "graph.facebook.com";
    const alvo = host === "graph.instagram.com" ? "me" : m[ku];
    const p = await (await fetch(`https://${host}/${VERSAO}/${alvo}?fields=username,profile_picture_url&access_token=${m[kt]}`)).json().catch(() => ({}));
    if (p.profile_picture_url) { foto = p.profile_picture_url; de = "Instagram"; nome = p.username; }
  }
  const ytRef = m[`yt_${canal}_channel_id`] ? `channel/${m[`yt_${canal}_channel_id`]}` : (m[`yt_${canal}_ref`] || "").replace(/^https?:\/\/(www\.)?youtube\.com\//, "").replace(/^(?!@|channel\/)/, "@");
  if (!foto && ytRef && ytRef !== "@") {
    try {
      const html = await (await fetch(`https://www.youtube.com/${ytRef}`, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36", Cookie: "CONSENT=YES+1; SOCS=CAI" } })).text();
      const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
      if (og) { foto = og.replace(/=s\d+[^"]*$/, "=s400-c-k-c0x00ffffff-no-rj"); de = "YouTube"; nome = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ?? ""; }
    } catch { /* tenta o TikTok */ }
  }
  if (!foto && m[`tt_${canal}_avatar`]) { foto = m[`tt_${canal}_avatar`]; de = "TikTok"; }
  if (!foto) return json(200, { ok: false, erro: "Instagram não conectado e sem foto no YouTube/TikTok" });
  const img = await fetch(foto, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!img.ok) return json(200, { ok: false, erro: `foto respondeu ${img.status}` });
  const bytes = new Uint8Array(await img.arrayBuffer());
  const caminho = `marca/${canal}.jpg`;
  const { error } = await db.storage.from("videos").upload(caminho, bytes, { contentType: "image/jpeg", upsert: true, cacheControl: "3600" });
  if (error) return json(200, { ok: false, erro: error.message });
  const url = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/videos/${caminho}`;
  await db.from("canais").update({ logo: `${url}?v=${Date.now()}` }).eq("id", canal);
  return json(200, { ok: true, de, username: nome, url, bytes: bytes.length });
});

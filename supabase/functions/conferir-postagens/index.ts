// conferir-postagens — descobre sozinho o que já saiu nas redes e atualiza a aba Vídeos.
//   YouTube: lê o feed público do canal (sem senha). Vídeo com o mesmo título = postado, com link e views.
//   Instagram: com a conta do canal conectada, lê os posts recentes. Legenda igual = postado, com link e views.
//   TikTok não tem leitura pública: lá vale o horário programado (videos_virar_postados no banco).
// Chamado pelo pg_cron a cada 30 min (x-ingest-token) e pelo botão "Conferir agora" do painel (login do dono).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info, x-ingest-token",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const VERSAO = "v23.0";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const ent = (s: string) => s.replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
// compara títulos/legendas ignorando caixa, acentos, emoji e pontuação
const norm = (s: string) => ent(s || "").normalize("NFD").toLowerCase().replace(/#\w+/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
const parecido = (a: string, b: string) => {
  const x = norm(a), y = norm(b);
  if (!x || !y) return false;
  return x === y || (x.length >= 20 && y.startsWith(x)) || (y.length >= 20 && x.startsWith(y));
};
const primeiraLinha = (s: string | null) => (s || "").split("\n").find((l) => l.trim()) || "";

const salvarCfg = (db: SupabaseClient, key: string, value: string) =>
  db.from("app_config").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

type Video = {
  id: string; canal: string; yt_titulo: string | null; yt_status: string; yt_confirmado: boolean; yt_postado_em: string | null;
  ig_legenda: string | null; ig_status: string; ig_confirmado: boolean; ig_media_id: string | null; ig_postado_em: string | null;
};

// ---------- YouTube ----------
async function canalId(db: SupabaseClient, canal: string): Promise<string | null> {
  const { data } = await db.from("app_config").select("key,value").in("key", [`yt_${canal}_ref`, `yt_${canal}_channel_id`]);
  const m = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
  if (m[`yt_${canal}_channel_id`]) return m[`yt_${canal}_channel_id`];
  const ref = (m[`yt_${canal}_ref`] || "").trim();
  if (!ref) return null;
  let id = ref.match(/UC[\w-]{22}/)?.[0] ?? null;
  if (!id) {
    const url = ref.startsWith("http") ? ref : `https://www.youtube.com/${ref.startsWith("@") ? ref : "@" + ref}`;
    const html = await (await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "en", Cookie: "CONSENT=YES+1; SOCS=CAI" } })).text();
    id = html.match(/"externalId":"(UC[\w-]{22})"/)?.[1] ?? html.match(/channel\/(UC[\w-]{22})/)?.[1] ?? null;
  }
  if (id) await salvarCfg(db, `yt_${canal}_channel_id`, id);
  return id;
}

async function conferirYouTube(db: SupabaseClient, canal: string, videos: Video[]) {
  const id = await canalId(db, canal);
  if (!id) return { youtube: "canal não configurado" };
  const xml = await (await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`, { headers: { "User-Agent": UA } })).text();
  const itens = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => ({
    vid: m[1].match(/<yt:videoId>([^<]+)/)?.[1] ?? "",
    titulo: ent(m[1].match(/<title>([^<]*)/)?.[1] ?? ""),
    publicado: m[1].match(/<published>([^<]+)/)?.[1] ?? null,
    views: Number(m[1].match(/<media:statistics views="(\d+)"/)?.[1] ?? NaN),
  }));
  let achados = 0;
  for (const v of videos) {
    const e = itens.find((i) => parecido(i.titulo, v.yt_titulo || ""));
    if (!e) continue;
    achados++;
    await db.from("videos").update({
      yt_status: "postado", yt_confirmado: true, yt_link: `https://youtube.com/shorts/${e.vid}`,
      yt_postado_em: v.yt_confirmado && v.yt_postado_em ? v.yt_postado_em : e.publicado,
      ...(Number.isFinite(e.views) ? { yt_views: e.views } : {}),
    }).eq("id", v.id);
  }
  return { youtube: `${itens.length} no feed, ${achados} batem com o painel` };
}

// ---------- Instagram ----------
async function contaIG(db: SupabaseClient, canal: string) {
  const kt = `ig_${canal}_token`, ku = `ig_${canal}_user_id`;
  const { data } = await db.from("app_config").select("key,value,updated_at").in("key", [kt, ku]);
  const linhas = (data ?? []) as { key: string; value: string; updated_at: string }[];
  const m = Object.fromEntries(linhas.map((r) => [r.key, r.value]));
  if (!m[kt]) return null;
  const host = m[kt].startsWith("IG") ? "graph.instagram.com" : "graph.facebook.com";
  let token = m[kt], userId = m[ku] ?? "";
  if (host === "graph.instagram.com") {
    if (!userId) {
      const me = await (await fetch(`https://graph.instagram.com/${VERSAO}/me?fields=user_id&access_token=${token}`)).json().catch(() => ({}));
      if (me.user_id) { userId = String(me.user_id); await salvarCfg(db, ku, userId); }
    }
    const salvoEm = new Date(linhas.find((r) => r.key === kt)?.updated_at ?? 0).getTime();
    if (Date.now() - salvoEm > 15 * 86400000) {
      const r = await (await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`)).json().catch(() => ({}));
      if (r.access_token) { token = r.access_token; await salvarCfg(db, kt, token); }
    }
  }
  return userId ? { host, token, userId } : null;
}

async function conferirInstagram(db: SupabaseClient, canal: string, videos: Video[]) {
  const c = await contaIG(db, canal);
  if (!c) return { instagram: "conta não conectada" };
  const get = async (caminho: string, params: Record<string, string>) => {
    const r = await fetch(`https://${c.host}/${VERSAO}/${caminho}?${new URLSearchParams({ ...params, access_token: c.token })}`);
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.error) throw new Error(d.error?.message || `HTTP ${r.status}`);
    return d;
  };
  const lista = await get(`${c.userId}/media`, { fields: "id,caption,permalink,timestamp", limit: "40" });
  const posts = (lista.data ?? []) as { id: string; caption?: string; permalink: string; timestamp: string }[];
  let achados = 0;
  for (const v of videos) {
    const p = posts.find((x) => (v.ig_media_id && x.id === v.ig_media_id) || parecido(primeiraLinha(x.caption ?? ""), primeiraLinha(v.ig_legenda)));
    if (!p) continue;
    achados++;
    let views: number | undefined;
    try {
      const ins = await get(`${p.id}/insights`, { metric: "views" });
      views = Number(ins.data?.[0]?.values?.[0]?.value ?? ins.data?.[0]?.total_value?.value);
    } catch { /* conta sem permissão de insights: segue sem views */ }
    await db.from("videos").update({
      ig_status: "publicado", ig_confirmado: true, ig_media_id: p.id, ig_link: p.permalink, ig_erro: null,
      ig_postado_em: v.ig_confirmado && v.ig_postado_em ? v.ig_postado_em : p.timestamp,
      ...(views !== undefined && Number.isFinite(views) ? { ig_views: views } : {}),
    }).eq("id", v.id);
  }
  return { instagram: `${posts.length} posts lidos, ${achados} batem com o painel` };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json(405, { ok: false });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  let autorizado = false;
  const { data: cfg } = await db.from("app_config").select("value").eq("key", "ingest_token").maybeSingle();
  if (cfg && req.headers.get("x-ingest-token") === cfg.value) autorizado = true;
  const auth = req.headers.get("authorization") ?? "";
  if (!autorizado && auth.startsWith("Bearer ")) {
    const u = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data } = await u.rpc("is_admin");
    autorizado = data === true;
  }
  if (!autorizado) return json(401, { ok: false, erro: "não autorizado" });

  await db.rpc("videos_virar_postados").then(() => {}, () => {});
  const { data } = await db.from("videos")
    .select("id,canal,yt_titulo,yt_status,yt_confirmado,yt_postado_em,ig_legenda,ig_status,ig_confirmado,ig_media_id,ig_postado_em");
  const todos = (data ?? []) as Video[];
  const resultado: Record<string, unknown> = {};
  for (const canal of [...new Set(todos.map((v) => v.canal))]) {
    const doCanal = todos.filter((v) => v.canal === canal);
    try { Object.assign(resultado, await conferirYouTube(db, canal, doCanal)); } catch (e) { resultado.youtube = `erro: ${(e as Error).message}`; }
    try { Object.assign(resultado, await conferirInstagram(db, canal, doCanal)); } catch (e) { resultado.instagram = `erro: ${(e as Error).message}`; }
    await db.from("videos").update({ conferido_em: new Date().toISOString() }).eq("canal", canal);
  }
  return json(200, { ok: true, ...resultado });
});

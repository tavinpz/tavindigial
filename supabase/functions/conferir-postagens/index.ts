// conferir-postagens — descobre sozinho o que já saiu nas redes e atualiza a aba Vídeos.
//   YouTube: lê o feed público do canal (sem senha). Vídeo com o mesmo título = postado, com link e views.
//   Instagram: com a conta do canal conectada, lê os posts recentes. Legenda igual = postado, com link e views.
//   TikTok não tem leitura pública: lá vale o horário programado (videos_virar_postados no banco).
// Chamado pelo pg_cron a cada 10 min (x-ingest-token) e pelo botão "Conferir agora" do painel (login do dono).
//   { perfil: true } devolve só os números das contas (seguidores, posts).
//   { conta: canal, dias } devolve as métricas completas de UM canal (Instagram + YouTube) para o popup de Métricas dele.
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
  id: string; canal: string; titulo: string | null; yt_titulo: string | null; yt_status: string; yt_confirmado: boolean; yt_postado_em: string | null;
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
    // título do YouTube; sem ele, o título do painel ou a 1ª linha da legenda
    const e = itens.find((i) => [v.yt_titulo, v.titulo, primeiraLinha(v.ig_legenda)].some((t) => t && parecido(i.titulo, t)));
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
  // a Tavin Digital usa a conta principal do painel (a mesma dos carrosséis); os outros canais têm a sua
  const principal = canal === "tavin-digital";
  const kt = principal ? "instagram_token" : `ig_${canal}_token`, ku = principal ? "instagram_user_id" : `ig_${canal}_user_id`;
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

// ---------- Métricas de uma conta (popup de cada canal) ----------
async function metricasInstagram(db: SupabaseClient, canal: string, dias: number) {
  const c = await contaIG(db, canal);
  if (!c) return { conectado: false };
  const get = async (caminho: string, params: Record<string, string>) => {
    const r = await fetch(`https://${c.host}/${VERSAO}/${caminho}?${new URLSearchParams({ ...params, access_token: c.token })}`);
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.error) throw new Error(d.error?.message || `HTTP ${r.status}`);
    return d;
  };
  const avisos: string[] = [];
  const alvoPerfil = c.host === "graph.instagram.com" ? "me" : c.userId;
  const p = await get(alvoPerfil, { fields: "username,name,profile_picture_url,followers_count,follows_count,media_count,biography" });

  const ate = Math.floor(Date.now() / 1000), desde = ate - dias * 86400;
  const janela = { period: "day", since: String(desde), until: String(ate) };
  // um pedido por métrica: se a conta não tiver uma delas, as outras continuam
  const total = async (metrica: string, extra: Record<string, string> = {}) => {
    try {
      const d = await get(`${c.userId}/insights`, { metric: metrica, metric_type: "total_value", ...janela, ...extra });
      return d.data?.[0]?.total_value ?? null;
    } catch (e) { avisos.push(`${metrica}: ${(e as Error).message}`); return null; }
  };
  const nomes = ["reach", "views", "accounts_engaged", "total_interactions", "profile_views", "likes", "comments", "shares", "saves", "profile_links_taps"];
  const valores = await Promise.all(nomes.map((m) => total(m)));
  const periodo: Record<string, number | null> = Object.fromEntries(nomes.map((m, i) => [m, valores[i]?.value ?? null]));
  const fu = await total("follows_and_unfollows", { breakdown: "follow_type" });
  const res = (fu?.breakdowns?.[0]?.results ?? []) as { dimension_values: string[]; value: number }[];
  periodo.seguiu = res.find((r) => r.dimension_values?.[0] === "FOLLOWER")?.value ?? (fu ? 0 : null);
  periodo.deixou = res.find((r) => r.dimension_values?.[0] === "NON_FOLLOWER")?.value ?? (fu ? 0 : null);

  // alcance dia a dia (série) e seguidores ganhos por dia
  const serie = async (metrica: string) => {
    try {
      const d = await get(`${c.userId}/insights`, { metric: metrica, ...janela });
      return ((d.data?.[0]?.values ?? []) as { value: number; end_time: string }[]).map((v) => ({ dia: v.end_time.slice(0, 10), n: v.value }));
    } catch { return []; }
  };
  const [alcanceDia, seguidoresDia] = await Promise.all([serie("reach"), serie("follower_count")]);

  // posts recentes, com os números de cada um
  const lista = await get(`${c.userId}/media`, { fields: "id,caption,media_type,media_product_type,permalink,timestamp,thumbnail_url,media_url,like_count,comments_count", limit: "12" });
  const posts = await Promise.all(((lista.data ?? []) as Record<string, string | number>[]).map(async (m) => {
    const num: Record<string, number> = {};
    const ler = (d: { data?: { name: string; values?: { value: number }[]; total_value?: { value: number } }[] }) => {
      for (const x of d.data ?? []) num[x.name] = Number(x.values?.[0]?.value ?? x.total_value?.value ?? 0);
    };
    try { ler(await get(`${m.id}/insights`, { metric: "views,reach,saved,shares,total_interactions" })); }
    catch { try { ler(await get(`${m.id}/insights`, { metric: "reach" })); } catch { /* sem insights para este post */ } }
    if (m.media_product_type === "REELS") {
      try { ler(await get(`${m.id}/insights`, { metric: "ig_reels_avg_watch_time" })); } catch { /* nem toda conta tem */ }
    }
    return {
      id: m.id, tipo: m.media_product_type === "REELS" ? "reel" : m.media_type === "CAROUSEL_ALBUM" ? "carrossel" : m.media_type === "VIDEO" ? "vídeo" : "foto",
      legenda: String(m.caption ?? "").split("\n").find((l) => l.trim()) ?? "", link: m.permalink, quando: m.timestamp,
      capa: m.thumbnail_url ?? (m.media_type === "IMAGE" || m.media_type === "CAROUSEL_ALBUM" ? m.media_url : null),
      curtidas: m.like_count ?? null, comentarios: m.comments_count ?? null,
      views: num.views ?? null, alcance: num.reach ?? null, salvos: num.saved ?? null, compart: num.shares ?? null,
      interacoes: num.total_interactions ?? null, tempo_medio: num.ig_reels_avg_watch_time ? Math.round(num.ig_reels_avg_watch_time / 100) / 10 : null,
    };
  }));
  return {
    conectado: true,
    perfil: { username: p.username, nome: p.name, foto: p.profile_picture_url ?? null, seguidores: p.followers_count ?? null, seguindo: p.follows_count ?? null, posts: p.media_count ?? null, bio: p.biography ?? "" },
    periodo, alcance_dia: alcanceDia, seguidores_dia: seguidoresDia, posts,
    sem_insights: valores.every((v) => v === null), avisos: avisos.slice(0, 3),
  };
}

async function metricasYouTube(db: SupabaseClient, canal: string) {
  const id = await canalId(db, canal);
  if (!id) return { conectado: false };
  const xml = await (await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`, { headers: { "User-Agent": UA } })).text();
  const nome = ent(xml.match(/<author>\s*<name>([^<]*)/)?.[1] ?? "");
  const videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => {
    const vid = m[1].match(/<yt:videoId>([^<]+)/)?.[1] ?? "";
    const curt = Number(m[1].match(/<media:starRating count="(\d+)"/)?.[1] ?? NaN);
    const views = Number(m[1].match(/<media:statistics views="(\d+)"/)?.[1] ?? NaN);
    return {
      titulo: ent(m[1].match(/<title>([^<]*)/)?.[1] ?? ""), link: `https://youtube.com/shorts/${vid}`, quando: m[1].match(/<published>([^<]+)/)?.[1] ?? null,
      capa: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`, views: Number.isFinite(views) ? views : null, curtidas: Number.isFinite(curt) ? curt : null,
    };
  });
  // inscritos: o YouTube só mostra o texto ("1,2 mil inscritos"); vem como texto mesmo
  let inscritos: string | null = null;
  try {
    const html = await (await fetch(`https://www.youtube.com/channel/${id}`, { headers: { "User-Agent": UA, "Accept-Language": "pt-BR", Cookie: "CONSENT=YES+1; SOCS=CAI" } })).text();
    inscritos = html.match(/"content":"([^"]{1,24}?(?:inscritos?|subscribers?))"/)?.[1] ?? html.match(/"subscriberCountText":\{[^}]*?"simpleText":"([^"]+)"/)?.[1] ?? null;
  } catch { /* segue sem inscritos */ }
  return { conectado: true, nome, link: `https://youtube.com/channel/${id}`, inscritos, videos, views: videos.reduce((a, v) => a + (v.views ?? 0), 0) };
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

  const body = await req.json().catch(() => ({}));
  if (body.conta) {
    // popup de Métricas de UM canal: a conta do Instagram e o canal do YouTube dele, ao vivo
    const canal = String(body.conta);
    const dias = [7, 14, 28].includes(Number(body.dias)) ? Number(body.dias) : 28;
    const [instagram, youtube] = await Promise.all([
      metricasInstagram(db, canal, dias).catch((e) => ({ conectado: true, erro: (e as Error).message })),
      metricasYouTube(db, canal).catch((e) => ({ conectado: true, erro: (e as Error).message })),
    ]);
    return json(200, { ok: true, dias, instagram, youtube });
  }
  if (body.perfil) {
    // números das contas conectadas, para o popup de Métricas
    const canais: string[] = Array.isArray(body.canais) ? body.canais : [];
    const perfis: Record<string, unknown> = {};
    for (const canal of canais) {
      try {
        const c = await contaIG(db, canal);
        if (!c) { perfis[canal] = { conectado: false }; continue; }
        const alvo = c.host === "graph.instagram.com" ? "me" : c.userId;
        const r = await fetch(`https://${c.host}/${VERSAO}/${alvo}?fields=username,followers_count,media_count&access_token=${c.token}`);
        const d = await r.json().catch(() => ({}));
        perfis[canal] = d.error ? { conectado: true, erro: d.error.message } : { conectado: true, username: d.username, seguidores: d.followers_count, posts: d.media_count };
      } catch (e) { perfis[canal] = { conectado: true, erro: (e as Error).message }; }
    }
    return json(200, { ok: true, perfis });
  }

  await db.rpc("videos_virar_postados").then(() => {}, () => {});
  const { data } = await db.from("videos")
    .select("id,canal,titulo,yt_titulo,yt_status,yt_confirmado,yt_postado_em,ig_legenda,ig_status,ig_confirmado,ig_media_id,ig_postado_em");
  const todos = (data ?? []) as Video[];
  const canais: Record<string, Record<string, unknown>> = {};
  for (const canal of [...new Set(todos.map((v) => v.canal))]) {
    const doCanal = todos.filter((v) => v.canal === canal);
    const r: Record<string, unknown> = {};
    try { Object.assign(r, await conferirYouTube(db, canal, doCanal)); } catch (e) { r.youtube = `erro: ${(e as Error).message}`; }
    try { Object.assign(r, await conferirInstagram(db, canal, doCanal)); } catch (e) { r.instagram = `erro: ${(e as Error).message}`; }
    canais[canal] = r;
    await db.from("videos").update({ conferido_em: new Date().toISOString() }).eq("canal", canal);
  }
  return json(200, { ok: true, canais });
});

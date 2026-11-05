// metricas — números das contas de cada canal, direto das APIs, para a página de Métricas do painel.
//   { acao: "canal", canal, dias, forcar? }  → Instagram completo (perfil, período x período anterior, séries, público,
//                                             posts com números) + YouTube (Data API com a chave; sem chave, feed público)
//   { acao: "resumo", canais: [...], forcar? } → números principais de todos os canais (visão geral)
//   { acao: "foto" }                           → grava o dia no histórico (pg_cron 1x por dia)
//   { acao: "views" }                          → views das últimas 24 h de cada canal (pg_cron a cada 30 min; o menu ordena por isso)
// Os números de cada vídeo (YouTube e Instagram) também ficam guardados por dia em videos_metricas_dia, para análise.
// Toda resposta fica 15 min em metricas_cache (a Meta e o Google limitam chamadas) e o dia vai para metricas_diarias.
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
const CACHE_MIN = 15;
// canais ativos do painel (tabela canais)
async function canaisAtivos(db: SupabaseClient): Promise<string[]> {
  const { data } = await db.from("canais").select("id").eq("ativo", true);
  return (data ?? []).map((c: { id: string }) => c.id);
}
const ent = (s: string) => s.replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const hojeSP = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
type Num = number | null;

async function cfg(db: SupabaseClient, keys: string[]) {
  const { data } = await db.from("app_config").select("key,value").in("key", keys);
  return Object.fromEntries(((data ?? []) as { key: string; value: string }[]).map((r) => [r.key, r.value])) as Record<string, string>;
}

// ───────────────────────── Instagram ─────────────────────────
async function contaIG(db: SupabaseClient, canal: string) {
  const principal = canal === "tavin-digital";
  const kt = principal ? "instagram_token" : `ig_${canal}_token`, ku = principal ? "instagram_user_id" : `ig_${canal}_user_id`;
  const m = await cfg(db, [kt, ku]);
  if (!m[kt]) return null;
  const host = m[kt].startsWith("IG") ? "graph.instagram.com" : "graph.facebook.com";
  let userId = m[ku] ?? "";
  if (!userId && host === "graph.instagram.com") {
    const me = await (await fetch(`https://graph.instagram.com/${VERSAO}/me?fields=user_id&access_token=${m[kt]}`)).json().catch(() => ({}));
    userId = me.user_id ? String(me.user_id) : "";
  }
  if (!userId) return null;
  const get = async (caminho: string, params: Record<string, string>) => {
    const r = await fetch(`https://${host}/${VERSAO}/${caminho}?${new URLSearchParams({ ...params, access_token: m[kt] })}`);
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.error) throw new Error(d.error?.message || `HTTP ${r.status}`);
    return d;
  };
  return { host, userId, get, perfilAlvo: host === "graph.instagram.com" ? "me" : userId };
}
type IG = NonNullable<Awaited<ReturnType<typeof contaIG>>>;

const TOTAIS = ["reach", "views", "accounts_engaged", "total_interactions", "profile_views", "likes", "comments", "shares", "saves", "profile_links_taps", "website_clicks"];

// totais de uma janela [desde, ate] (segundos). Tenta tudo de uma vez; se a Meta recusar, uma métrica por vez.
async function totaisIG(c: IG, desde: number, ate: number, nomes = TOTAIS) {
  const janela = { period: "day", metric_type: "total_value", since: String(desde), until: String(ate) };
  const out: Record<string, Num> = Object.fromEntries(nomes.map((n) => [n, null]));
  try {
    const d = await c.get(`${c.userId}/insights`, { metric: nomes.join(","), ...janela });
    for (const x of d.data ?? []) out[x.name] = x.total_value?.value ?? null;
  } catch {
    await Promise.all(nomes.map(async (n) => {
      try { const d = await c.get(`${c.userId}/insights`, { metric: n, ...janela }); out[n] = d.data?.[0]?.total_value?.value ?? null; } catch { /* conta sem essa métrica */ }
    }));
  }
  try {
    const fu = await c.get(`${c.userId}/insights`, { metric: "follows_and_unfollows", breakdown: "follow_type", ...janela });
    const res = (fu.data?.[0]?.total_value?.breakdowns?.[0]?.results ?? []) as { dimension_values: string[]; value: number }[];
    out.seguiu = res.find((r) => r.dimension_values?.[0] === "FOLLOWER")?.value ?? 0;
    out.deixou = res.find((r) => r.dimension_values?.[0] === "NON_FOLLOWER")?.value ?? 0;
  } catch { out.seguiu = null; out.deixou = null; }
  return out;
}

// uma métrica quebrada por dimensão (ex.: views por tipo de conteúdo, alcance seguidor x não seguidor)
async function quebraIG(c: IG, metrica: string, breakdown: string, desde: number, ate: number) {
  try {
    const d = await c.get(`${c.userId}/insights`, { metric: metrica, breakdown, period: "day", metric_type: "total_value", since: String(desde), until: String(ate) });
    const res = (d.data?.[0]?.total_value?.breakdowns?.[0]?.results ?? []) as { dimension_values: string[]; value: number }[];
    return res.map((r) => ({ k: r.dimension_values?.[0] ?? "?", n: r.value })).sort((a, b) => b.n - a.n);
  } catch { return null; }
}

async function serieIG(c: IG, metrica: string, desde: number, ate: number) {
  try {
    const d = await c.get(`${c.userId}/insights`, { metric: metrica, period: "day", since: String(desde), until: String(ate) });
    return ((d.data?.[0]?.values ?? []) as { value: number; end_time: string }[]).map((v) => ({ dia: v.end_time.slice(0, 10), n: v.value }));
  } catch { return []; }
}

// público (só aparece com 100+ seguidores)
async function publicoIG(c: IG) {
  const um = async (breakdown: string) => {
    for (const extra of [{}, { timeframe: "this_month" }, { timeframe: "last_30_days" }] as Record<string, string>[]) {
      try {
        const d = await c.get(`${c.userId}/insights`, { metric: "follower_demographics", period: "lifetime", metric_type: "total_value", breakdown, ...extra });
        const res = (d.data?.[0]?.total_value?.breakdowns?.[0]?.results ?? []) as { dimension_values: string[]; value: number }[];
        if (res.length) return res.map((r) => ({ k: r.dimension_values.join(" "), n: r.value })).sort((a, b) => b.n - a.n).slice(0, 8);
      } catch { /* tenta o próximo formato */ }
    }
    return null;
  };
  const [idade, genero, cidade, pais] = await Promise.all(["age", "gender", "city", "country"].map(um));
  let online: { hora: number; n: number }[] | null = null;
  try {
    const d = await c.get(`${c.userId}/insights`, { metric: "online_followers", period: "lifetime" });
    const vals = (d.data?.[0]?.values ?? []) as { value: Record<string, number> }[];
    const soma: number[] = Array(24).fill(0);
    let dias = 0;
    for (const v of vals) { if (!v.value || !Object.keys(v.value).length) continue; dias++; for (const [h, n] of Object.entries(v.value)) soma[Number(h)] += n; }
    // a Meta manda em horário do Pacífico (UTC-8/-7); São Paulo fica 4–5 h à frente: uso 5
    if (dias) online = soma.map((n, h) => ({ hora: (h + 5) % 24, n: Math.round(n / dias) })).sort((a, b) => a.hora - b.hora);
  } catch { /* sem dado */ }
  if (!idade && !genero && !cidade && !pais && !online) return null;
  return { idade, genero, cidade, pais, online };
}

async function postsIG(c: IG, limite: number) {
  const lista = await c.get(`${c.userId}/media`, { fields: "id,caption,media_type,media_product_type,permalink,timestamp,thumbnail_url,media_url,like_count,comments_count", limit: String(limite) });
  return Promise.all(((lista.data ?? []) as Record<string, string | number>[]).map(async (m) => {
    const num: Record<string, number> = {};
    const ler = (d: { data?: { name: string; values?: { value: number }[]; total_value?: { value: number } }[] }) => {
      for (const x of d.data ?? []) num[x.name] = Number(x.values?.[0]?.value ?? x.total_value?.value ?? 0);
    };
    const reel = m.media_product_type === "REELS";
    try { ler(await c.get(`${m.id}/insights`, { metric: "views,reach,saved,shares,total_interactions" })); }
    catch { try { ler(await c.get(`${m.id}/insights`, { metric: "reach" })); } catch { /* sem insights */ } }
    await Promise.all([
      (reel ? ["ig_reels_avg_watch_time,ig_reels_video_view_total_time", "reels_skip_rate"] : ["follows,profile_visits"])
        .map((ms) => c.get(`${m.id}/insights`, { metric: ms }).then(ler).catch(() => {})),
    ].flat());
    const views = num.views ?? null, alcance = num.reach ?? null;
    const inter = num.total_interactions ?? ((Number(m.like_count) || 0) + (Number(m.comments_count) || 0) + (num.saved || 0) + (num.shares || 0));
    return {
      id: m.id, tipo: reel ? "reel" : m.media_type === "CAROUSEL_ALBUM" ? "carrossel" : m.media_type === "VIDEO" ? "vídeo" : "foto",
      legenda: String(m.caption ?? "").split("\n").find((l) => l.trim()) ?? "", link: m.permalink, quando: m.timestamp,
      capa: m.thumbnail_url ?? (m.media_type !== "VIDEO" ? m.media_url : null) ?? null,
      curtidas: m.like_count ?? null, comentarios: m.comments_count ?? null,
      views, alcance, salvos: num.saved ?? null, compart: num.shares ?? null, interacoes: inter,
      engaj: alcance ? Math.round((inter / alcance) * 1000) / 10 : null,
      tempo_medio: num.ig_reels_avg_watch_time ? Math.round(num.ig_reels_avg_watch_time / 100) / 10 : null,
      tempo_total_h: num.ig_reels_video_view_total_time ? Math.round(num.ig_reels_video_view_total_time / 36000) / 100 : null,
      pulos: num.reels_skip_rate ?? null, seguiu: num.follows ?? null, visitas: num.profile_visits ?? null,
    };
  }));
}

async function instagramCompleto(db: SupabaseClient, canal: string, dias: number) {
  const c = await contaIG(db, canal);
  if (!c) return { conectado: false };
  const p = await c.get(c.perfilAlvo, { fields: "username,name,profile_picture_url,followers_count,follows_count,media_count,biography,website" });
  const ate = Math.floor(Date.now() / 1000), desde = ate - dias * 86400, antes = desde - dias * 86400;
  const [atual, anterior, alcanceDia, seguidoresDia, tipoViews, tipoInter, alcanceQuem, publico, posts] = await Promise.all([
    totaisIG(c, desde, ate), totaisIG(c, antes, desde, ["reach", "views", "accounts_engaged", "total_interactions", "profile_views", "profile_links_taps"]),
    serieIG(c, "reach", desde, ate), serieIG(c, "follower_count", desde, ate),
    quebraIG(c, "views", "media_product_type", desde, ate), quebraIG(c, "total_interactions", "media_product_type", desde, ate),
    quebraIG(c, "reach", "follow_type", desde, ate), publicoIG(c), postsIG(c, 30),
  ]);
  const r = {
    conectado: true,
    perfil: { username: p.username, nome: p.name ?? null, foto: p.profile_picture_url ?? null, seguidores: p.followers_count ?? null, seguindo: p.follows_count ?? null, posts: p.media_count ?? null, bio: p.biography ?? "", site: p.website ?? null },
    periodo: atual, anterior, alcance_dia: alcanceDia, seguidores_dia: seguidoresDia,
    por_tipo: { views: tipoViews, interacoes: tipoInter }, alcance_quem: alcanceQuem, publico, posts,
    sem_insights: Object.values(atual).every((v) => v === null),
  };
  await gravarDia(db, canal, "instagram", { seguidores: r.perfil.seguidores, seguindo: r.perfil.seguindo, posts: r.perfil.posts, alcance: alcanceDia.at(-1)?.n ?? null });
  await gravarVideos(db, canal, "instagram", (posts as Record<string, unknown>[]).map((p) => ({ id: p.id, titulo: p.legenda, quando: p.quando, views: p.views, curtidas: p.curtidas, comentarios: p.comentarios })));
  return r;
}

async function instagramResumo(db: SupabaseClient, canal: string) {
  const c = await contaIG(db, canal);
  if (!c) return { conectado: false };
  const p = await c.get(c.perfilAlvo, { fields: "username,profile_picture_url,followers_count,media_count" });
  const ate = Math.floor(Date.now() / 1000);
  const [t28, t7, ultimo] = await Promise.all([
    totaisIG(c, ate - 28 * 86400, ate, ["reach", "views", "total_interactions", "profile_views"]),
    totaisIG(c, ate - 7 * 86400, ate, ["reach", "views"]),
    c.get(`${c.userId}/media`, { fields: "timestamp,permalink", limit: "1" }).catch(() => ({ data: [] })),
  ]);
  await gravarDia(db, canal, "instagram", { seguidores: p.followers_count ?? null, posts: p.media_count ?? null });
  return {
    conectado: true, username: p.username, foto: p.profile_picture_url ?? null, seguidores: p.followers_count ?? null, posts: p.media_count ?? null,
    d28: t28, d7: t7, ultimo_post: ultimo.data?.[0]?.timestamp ?? null,
  };
}

// ───────────────────────── YouTube ─────────────────────────
async function canalYT(db: SupabaseClient, canal: string): Promise<string | null> {
  const m = await cfg(db, [`yt_${canal}_ref`, `yt_${canal}_channel_id`]);
  if (m[`yt_${canal}_channel_id`]) return m[`yt_${canal}_channel_id`];
  const ref = (m[`yt_${canal}_ref`] || "").trim();
  if (!ref) return null;
  let id = ref.match(/UC[\w-]{22}/)?.[0] ?? null;
  if (!id) {
    const url = ref.startsWith("http") ? ref : `https://www.youtube.com/${ref.startsWith("@") ? ref : "@" + ref}`;
    const html = await (await fetch(url, { headers: { "User-Agent": UA, Cookie: "CONSENT=YES+1; SOCS=CAI" } })).text();
    id = html.match(/"externalId":"(UC[\w-]{22})"/)?.[1] ?? html.match(/channel\/(UC[\w-]{22})/)?.[1] ?? null;
  }
  if (id) await db.from("app_config").upsert({ key: `yt_${canal}_channel_id`, value: id, updated_at: new Date().toISOString() }, { onConflict: "key" });
  return id;
}

const segundos = (iso: string) => {
  const m = iso?.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return m ? (+(m[1] || 0)) * 86400 + (+(m[2] || 0)) * 3600 + (+(m[3] || 0)) * 60 + (+(m[4] || 0)) : null;
};

async function youtubeAPI(id: string, chave: string, limite: number, token: string | null = null) {
  const g = async (rec: string, p: Record<string, string>) => {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/${rec}?${new URLSearchParams(token ? p : { ...p, key: chave })}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.error) throw new Error(d.error?.message || `HTTP ${r.status}`);
    return d;
  };
  const ch = (await g("channels", { part: "snippet,statistics,contentDetails", id })).items?.[0];
  if (!ch) throw new Error("canal não encontrado no YouTube");
  const uploads = ch.contentDetails?.relatedPlaylists?.uploads;
  const ids: string[] = [];
  let pagina: string | undefined;
  while (uploads && ids.length < limite) {
    const pl = await g("playlistItems", { part: "contentDetails", playlistId: uploads, maxResults: "50", ...(pagina ? { pageToken: pagina } : {}) }).catch(() => ({ items: [] }));
    ids.push(...((pl.items ?? []) as { contentDetails: { videoId: string } }[]).map((i) => i.contentDetails.videoId));
    pagina = pl.nextPageToken; if (!pagina) break;
  }
  const videos: Record<string, unknown>[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const v = await g("videos", { part: "snippet,statistics,contentDetails,status", id: ids.slice(i, i + 50).join(",") });
    for (const x of v.items ?? []) {
      const views = Number(x.statistics?.viewCount ?? 0), curt = x.statistics?.likeCount != null ? Number(x.statistics.likeCount) : null, com = x.statistics?.commentCount != null ? Number(x.statistics.commentCount) : null;
      const dur = segundos(x.contentDetails?.duration);
      videos.push({
        id: x.id, titulo: x.snippet?.title ?? "", quando: x.snippet?.publishedAt ?? null,
        capa: x.snippet?.thumbnails?.medium?.url ?? `https://i.ytimg.com/vi/${x.id}/mqdefault.jpg`,
        link: dur != null && dur <= 180 ? `https://youtube.com/shorts/${x.id}` : `https://youtu.be/${x.id}`,
        short: dur != null && dur <= 180, duracao: dur, views, curtidas: curt, comentarios: com,
        privacidade: x.status?.privacyStatus ?? null, publicar_em: x.status?.publishAt ?? null,
        engaj: views ? Math.round((((curt || 0) + (com || 0)) / views) * 1000) / 10 : null,
      });
    }
  }
  const s = ch.statistics ?? {};
  return {
    nome: ch.snippet?.title ?? "", foto: ch.snippet?.thumbnails?.default?.url ?? null, handle: ch.snippet?.customUrl ?? null,
    inscritos: s.hiddenSubscriberCount ? null : Number(s.subscriberCount ?? 0), inscritos_ocultos: !!s.hiddenSubscriberCount,
    views_total: Number(s.viewCount ?? 0), total_videos: Number(s.videoCount ?? 0), criado: ch.snippet?.publishedAt ?? null, videos,
    privados: videos.filter((v) => v.privacidade && v.privacidade !== "public" && !v.publicar_em).length,
    programados: videos.filter((v) => v.publicar_em && new Date(v.publicar_em as string).getTime() > Date.now()).length,
  };
}

async function youtubeFeed(id: string) {
  const xml = await (await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`, { headers: { "User-Agent": UA } })).text();
  const videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => {
    const vid = m[1].match(/<yt:videoId>([^<]+)/)?.[1] ?? "";
    const curt = Number(m[1].match(/<media:starRating count="(\d+)"/)?.[1] ?? NaN), views = Number(m[1].match(/<media:statistics views="(\d+)"/)?.[1] ?? NaN);
    return {
      id: vid, titulo: ent(m[1].match(/<title>([^<]*)/)?.[1] ?? ""), quando: m[1].match(/<published>([^<]+)/)?.[1] ?? null,
      capa: `https://i.ytimg.com/vi/${vid}/mqdefault.jpg`, link: `https://youtube.com/shorts/${vid}`, short: null, duracao: null,
      views: Number.isFinite(views) ? views : null, curtidas: Number.isFinite(curt) ? curt : null, comentarios: null,
      engaj: Number.isFinite(views) && views ? Math.round(((Number.isFinite(curt) ? curt : 0) / views) * 1000) / 10 : null,
    };
  });
  let inscritosTxt: string | null = null;
  try {
    const html = await (await fetch(`https://www.youtube.com/channel/${id}`, { headers: { "User-Agent": UA, "Accept-Language": "pt-BR", Cookie: "CONSENT=YES+1; SOCS=CAI" } })).text();
    inscritosTxt = html.match(/"content":"([^"]{1,24}?(?:inscritos?|subscribers?))"/)?.[1] ?? null;
  } catch { /* sem */ }
  return { nome: ent(xml.match(/<author>\s*<name>([^<]*)/)?.[1] ?? ""), foto: null, handle: null, inscritos: null, inscritos_txt: inscritosTxt, views_total: null, total_videos: null, videos };
}

// acesso da conta do YouTube do canal (quando conectada pelo painel, em Integrações)
async function tokenYT(db: SupabaseClient, canal: string) {
  const m = await cfg(db, ["yt_oauth_client_id", "yt_oauth_client_secret", `yt_${canal}_refresh`]);
  if (!m[`yt_${canal}_refresh`] || !m.yt_oauth_client_id) return null;
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: m.yt_oauth_client_id, client_secret: m.yt_oauth_client_secret, refresh_token: m[`yt_${canal}_refresh`], grant_type: "refresh_token" }),
  });
  const d = await r.json().catch(() => ({}));
  if (!d.access_token) throw new Error(d.error === "invalid_grant" ? "acesso da conta expirou: conecte de novo em Integrações" : d.error_description || d.error || `HTTP ${r.status}`);
  return d.access_token as string;
}

// YouTube Analytics (só com a conta conectada): tempo assistido, retenção, origem das views, público
async function youtubeAnalytics(token: string, dias: number, videos: Record<string, unknown>[]) {
  const d = (n: number) => new Date(Date.now() - n * 86400000).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  const ini = d(dias - 1), fim = d(0), antIni = d(dias * 2 - 1), antFim = d(dias);
  const rep = async (p: Record<string, string>) => {
    const r = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${new URLSearchParams({ ids: "channel==MINE", startDate: ini, endDate: fim, ...p })}`, { headers: { Authorization: `Bearer ${token}` } });
    const x = await r.json().catch(() => ({}));
    if (!r.ok || x.error) throw new Error(x.error?.message || `HTTP ${r.status}`);
    const cols = (x.columnHeaders ?? []).map((h: { name: string }) => h.name);
    return ((x.rows ?? []) as unknown[][]).map((row) => Object.fromEntries(cols.map((c: string, i: number) => [c, row[i]])));
  };
  const M = "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost,likes,comments,shares";
  const nada = (e: unknown) => ({ erro: (e as Error).message });
  const [tot, ant, dia, fontes, top, paises, idade] = await Promise.all([
    rep({ metrics: M }), rep({ metrics: M, startDate: antIni, endDate: antFim }),
    rep({ metrics: "views,estimatedMinutesWatched,subscribersGained,subscribersLost", dimensions: "day", sort: "day" }),
    rep({ metrics: "views,estimatedMinutesWatched", dimensions: "insightTrafficSourceType", sort: "-views" }),
    rep({ metrics: "views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,likes,shares", dimensions: "video", sort: "-views", maxResults: "15" }),
    rep({ metrics: "views", dimensions: "country", sort: "-views", maxResults: "8" }),
    rep({ metrics: "viewerPercentage", dimensions: "ageGroup,gender" }),
  ].map((p) => p.catch(nada)));
  const lista = (x: unknown) => (Array.isArray(x) ? x : []) as Record<string, any>[];
  if (!Array.isArray(tot)) return { erro: (tot as { erro: string }).erro };
  const titulo = Object.fromEntries(videos.map((v) => [v.id, v]));
  return {
    de: ini, ate: fim, totais: lista(tot)[0] ?? {}, anterior: lista(ant)[0] ?? {}, dia: lista(dia), fontes: lista(fontes),
    top: lista(top).map((t) => ({ ...t, titulo: (titulo[t.video] as any)?.titulo ?? t.video, capa: (titulo[t.video] as any)?.capa ?? `https://i.ytimg.com/vi/${t.video}/mqdefault.jpg`, link: (titulo[t.video] as any)?.link ?? `https://youtu.be/${t.video}` })),
    paises: lista(paises), idade: lista(idade),
  };
}

// vídeos que você subiu no YouTube Studio (inclusive privados) viram o mesmo vídeo do painel, pelo título:
// assim, programar pelo painel só muda a data do que já está lá, sem subir de novo (não duplica)
async function vincularYT(db: SupabaseClient, canal: string, vids: Record<string, unknown>[]) {
  const { data } = await db.from("videos").select("id,yt_titulo,titulo").eq("canal", canal).is("yt_id", null);
  if (!data?.length) return;
  // o nome do arquivo perde ? . : | e espaços duplos; compara só letras, números e emojis
  const norm = (x: unknown) => String(x ?? "").toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}\p{Extended_Pictographic}]+/gu, " ").trim();
  const { data: usados } = await db.from("videos").select("yt_id").eq("canal", canal).not("yt_id", "is", null);
  const ja = new Set((usados ?? []).map((u: { yt_id: string }) => u.yt_id));
  const por = new Map<string, string>();
  for (const v of data) { const k = norm(v.yt_titulo || v.titulo); if (k && !por.has(k)) por.set(k, v.id); }
  for (const y of vids) {
    const k = norm(y.titulo), id = por.get(k);
    if (!id || ja.has(String(y.id))) continue;
    await db.from("videos").update({ yt_id: y.id, yt_link: `https://youtube.com/shorts/${y.id}` }).eq("id", id);
    por.delete(k);
  }
}

async function youtube(db: SupabaseClient, canal: string, limite: number, dias = 0) {
  const id = await canalYT(db, canal);
  if (!id) return { conectado: false };
  const { yt_api_key: chave } = await cfg(db, ["yt_api_key"]);
  let token: string | null = null, erroConta = "";
  try { token = await tokenYT(db, canal); } catch (e) { erroConta = (e as Error).message; }
  let base: Record<string, unknown>;
  let via = "api";
  if (chave || token) {
    try { base = await youtubeAPI(id, chave, limite, token); }
    catch (e) { base = { ...(await youtubeFeed(id)), erro_api: (e as Error).message }; via = "feed"; }
  } else { base = await youtubeFeed(id); via = "feed"; }
  if (token && base.videos) await vincularYT(db, canal, base.videos as Record<string, unknown>[]).catch(() => {});
  if (token && dias) base.analytics = await youtubeAnalytics(token, dias, (base.videos as Record<string, unknown>[]) ?? []).catch((e) => ({ erro: (e as Error).message }));
  base.conta = !!token; if (erroConta) base.erro_conta = erroConta;
  if (via === "api") await gravarDia(db, canal, "youtube", { seguidores: base.inscritos as Num, posts: base.total_videos as Num, views_total: base.views_total as Num });
  await gravarVideos(db, canal, "youtube", (base.videos as Record<string, unknown>[] | undefined) ?? []);
  return { conectado: true, via, sem_chave: !chave && !token, link: `https://youtube.com/channel/${id}`, ...base };
}

// ───────────────────────── histórico e cache ─────────────────────────
async function gravarDia(db: SupabaseClient, canal: string, rede: string, v: Record<string, Num>) {
  const linha: Record<string, unknown> = { canal, rede, dia: hojeSP(), atualizado_em: new Date().toISOString() };
  for (const [k, x] of Object.entries(v)) if (x != null) linha[k] = x;
  await db.from("metricas_diarias").upsert(linha, { onConflict: "canal,rede,dia" }).then(() => {}, () => {});
}

// números de cada vídeo no dia (um registro por vídeo por dia)
async function gravarVideos(db: SupabaseClient, canal: string, rede: string, lista: Record<string, unknown>[]) {
  const dia = hojeSP();
  const linhas = lista.filter((v) => v.id).map((v) => ({
    canal, rede, video_id: String(v.id), dia, titulo: String(v.titulo ?? "").slice(0, 300), publicado_em: v.quando ?? null,
    duracao: v.duracao ?? null, views: v.views ?? null, curtidas: v.curtidas ?? null, comentarios: v.comentarios ?? null,
  }));
  if (linhas.length) await db.from("videos_metricas_dia").upsert(linhas, { onConflict: "canal,rede,video_id,dia" }).then(() => {}, () => {});
}

// Guarda o total de agora e devolve quanto cresceu desde a foto de 24 h atrás. Sem foto tão antiga, mede desde a mais
// antiga que existe e devolve esse início (desde), para o painel dizer a janela de verdade, sem estimar nada.
async function cresceu24h(db: SupabaseClient, canal: string, rede: string, total: number) {
  const agora = Date.now();
  await db.from("views_snap").insert({ canal, rede, em: new Date(agora).toISOString(), total });
  const lim = new Date(agora - 86400000).toISOString();
  let { data: ref } = await db.from("views_snap").select("total,em").eq("canal", canal).eq("rede", rede).lte("em", lim).order("em", { ascending: false }).limit(1).maybeSingle();
  if (!ref) ({ data: ref } = await db.from("views_snap").select("total,em").eq("canal", canal).eq("rede", rede).order("em", { ascending: true }).limit(1).maybeSingle());
  await db.from("views_snap").delete().eq("canal", canal).eq("rede", rede).lt("em", new Date(agora - 3 * 86400000).toISOString());
  return { v: Math.max(0, total - Number(ref?.total ?? total)), desde: ref?.em ?? new Date(agora).toISOString() };
}

// Views das últimas 24 h de um canal (o menu mostra isso; fica em views_dia.views_hoje do dia de hoje):
//   Instagram: soma das views dos 50 posts mais recentes agora − a mesma soma 24 h atrás
//   YouTube: soma das views de todos os vídeos agora − a mesma soma 24 h atrás (o total do canal no YouTube atrasa horas)
async function viewsHoje(db: SupabaseClient, canal: string) {
  const dia = hojeSP();
  const r: Record<string, unknown> = {};
  const c = await contaIG(db, canal).catch(() => null);
  if (c) {
    try {
      // soma das views (vida toda) dos 50 posts mais recentes agora − a mesma soma 24 h atrás: é o que entrou nas últimas 24 h
      const lista = await c.get(`${c.userId}/media`, { fields: "id", limit: "50" });
      const ids = ((lista.data ?? []) as { id: string }[]).map((m) => m.id);
      let total = 0, lidos = 0;
      for (let i = 0; i < ids.length; i += 10) {
        const vs = await Promise.all(ids.slice(i, i + 10).map((m) => c.get(`${m}/insights`, { metric: "views" })
          .then((d) => Number(d.data?.[0]?.values?.[0]?.value ?? d.data?.[0]?.total_value?.value ?? 0)).catch(() => null)));
        for (const v of vs) if (v != null) { total += v; lidos++; }
      }
      if (lidos) {
        const { v, desde } = await cresceu24h(db, canal, "instagram", total);
        await db.from("views_dia").upsert({ canal, rede: "instagram", dia, total_atual: total, views_hoje: v, desde, atualizado_em: new Date().toISOString() }, { onConflict: "canal,rede,dia" });
        r.instagram = v;
      }
    } catch (e) { r.instagram_erro = (e as Error).message; }
  }
  const id = await canalYT(db, canal).catch(() => null);
  if (id) {
    let total: number | null = null;
    const { yt_api_key: chave } = await cfg(db, ["yt_api_key"]);
    if (chave) {
      try {
        const b = await youtubeAPI(id, chave, 500);
        total = (b.videos as { views: number }[]).reduce((a, v) => a + (Number(v.views) || 0), 0);
      } catch { /* cai no feed */ }
    }
    if (total == null) {
      const f = await youtubeFeed(id).catch(() => null);
      if (f) total = f.videos.reduce((a, v) => a + (Number(v.views) || 0), 0);
    }
    if (total != null) {
      const { v, desde } = await cresceu24h(db, canal, "youtube", total);
      await db.from("views_dia").upsert({ canal, rede: "youtube", dia, total_atual: total, views_hoje: v, desde, atualizado_em: new Date().toISOString() }, { onConflict: "canal,rede,dia" });
      r.youtube = v;
    }
  }
  return r;
}

async function comCache<T>(db: SupabaseClient, canal: string, chave: string, forcar: boolean, gerar: () => Promise<T>) {
  if (!forcar) {
    const { data } = await db.from("metricas_cache").select("payload,gerado_em").eq("canal", canal).eq("chave", chave).maybeSingle();
    if (data && Date.now() - new Date(data.gerado_em).getTime() < CACHE_MIN * 60000) return { ...(data.payload as object), gerado_em: data.gerado_em } as T;
  }
  const payload = await gerar();
  const gerado_em = new Date().toISOString();
  await db.from("metricas_cache").upsert({ canal, chave, payload, gerado_em }, { onConflict: "canal,chave" });
  return { ...(payload as object), gerado_em } as T;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json(405, { ok: false });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  let autorizado = false;
  const { data: tk } = await db.from("app_config").select("value").eq("key", "ingest_token").maybeSingle();
  if (tk && req.headers.get("x-ingest-token") === tk.value) autorizado = true;
  const auth = req.headers.get("authorization") ?? "";
  if (!autorizado && auth.startsWith("Bearer ")) {
    const u = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data } = await u.rpc("is_admin");
    autorizado = data === true;
  }
  if (!autorizado) return json(401, { ok: false, erro: "não autorizado" });

  const body = await req.json().catch(() => ({}));
  const forcar = !!body.forcar;
  const erro = (e: unknown) => ({ conectado: true, erro: (e as Error).message });

  if (body.acao === "canal") {
    const canal = String(body.canal || "");
    if (!/^[a-z0-9-]+$/.test(canal)) return json(400, { ok: false, erro: "canal inválido" });
    const dias = [7, 14, 28, 30].includes(Number(body.dias)) ? Number(body.dias) : 28;
    const r = await comCache(db, canal, `canal:${dias}`, forcar, async () => {
      const [instagram, yt] = await Promise.all([instagramCompleto(db, canal, dias).catch(erro), youtube(db, canal, 100, dias).catch(erro)]);
      return { instagram, youtube: yt };
    });
    return json(200, { ok: true, dias, ...r });
  }

  if (body.acao === "views") {
    const canais = await canaisAtivos(db);
    const r: Record<string, unknown> = {};
    await Promise.all(canais.map(async (canal) => { r[canal] = await viewsHoje(db, canal).catch((e) => ({ erro: (e as Error).message })); }));
    return json(200, { ok: true, canais: r });
  }

  if (body.acao === "resumo" || body.acao === "foto") {
    const canais: string[] = (Array.isArray(body.canais) && body.canais.length ? body.canais : await canaisAtivos(db)).filter((c: string) => /^[a-z0-9-]+$/.test(c));
    const perfis: Record<string, unknown> = {};
    await Promise.all(canais.map(async (canal) => {
      perfis[canal] = await comCache(db, canal, "resumo", forcar || body.acao === "foto", async () => {
        const [instagram, yt] = await Promise.all([instagramResumo(db, canal).catch(erro), youtube(db, canal, 50).catch(erro)]);
        // no resumo, do YouTube só vão os números e os 3 vídeos mais recentes
        const y = yt as Record<string, unknown>;
        const vids = (y.videos as Record<string, unknown>[] | undefined) ?? [];
        const d28 = Date.now() - 28 * 86400000;
        const recentes = vids.filter((v) => v.quando && new Date(v.quando as string).getTime() >= d28);
        return {
          instagram,
          youtube: { ...y, videos: undefined, ultimos: vids.slice(0, 3), ultimo_video: vids[0]?.quando ?? null,
            videos_28d: recentes.length, views_28d_novos: recentes.reduce((a, v) => a + (Number(v.views) || 0), 0) },
        };
      });
    }));
    return json(200, { ok: true, perfis });
  }

  return json(400, { ok: false, erro: "acao desconhecida" });
});

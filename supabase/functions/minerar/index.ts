// minerar — acha canais novos que estão explodindo (método "canal validado"):
//   vídeos mais vistos publicados nos últimos N dias, por idioma/país e duração, e fica só com os canais
//   cujo PRIMEIRO vídeo saiu há N dias ou menos. Usa a chave da Data API (app_config yt_api_key).
//   { buscas: [{ lang, regiao, dur: "long"|"medium"|"short"|"any", q?, paginas? }], dias?: 21, min_views?: 30000 }
// Custo: 100 unidades por página de busca + ~1 por lote de 50 (vídeos, canais, playlists).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const API = "https://www.googleapis.com/youtube/v3";

type Busca = { lang: string; regiao: string; dur?: string; q?: string; paginas?: number };

async function yt(path: string, p: Record<string, string>, chave: string) {
  const u = new URL(`${API}/${path}`);
  for (const [k, v] of Object.entries(p)) if (v) u.searchParams.set(k, v);
  u.searchParams.set("key", chave);
  const r = await fetch(u);
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message ?? `HTTP ${r.status}`);
  return j;
}
const lotes = <T,>(a: T[], n = 50) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));
const seg = (iso: string) => {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso ?? "") ?? [];
  return (+(m[1] ?? 0)) * 3600 + (+(m[2] ?? 0)) * 60 + (+(m[3] ?? 0));
};

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { ok: false });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: tk } = await db.from("app_config").select("value").eq("key", "ingest_token").maybeSingle();
  if (!tk || req.headers.get("x-ingest-token") !== tk.value) return json(401, { ok: false });
  const { data: ch } = await db.from("app_config").select("value").eq("key", "yt_api_key").maybeSingle();
  if (!ch?.value) return json(400, { ok: false, erro: "sem yt_api_key" });
  const chave = ch.value;

  const body = await req.json().catch(() => ({}));
  const dias = Number(body.dias) || 21;
  const minViews = Number(body.min_views) || 30000;
  const buscas: Busca[] = Array.isArray(body.buscas) ? body.buscas.slice(0, 20) : [];
  const desde = new Date(Date.now() - dias * 864e5).toISOString();
  const erros: string[] = [];

  // 1) busca: vídeos mais vistos do período
  const achados = new Map<string, { busca: string }>();
  for (const b of buscas) {
    let token = "";
    for (let p = 0; p < Math.min(b.paginas ?? 1, 3); p++) {
      try {
        const r = await yt("search", {
          part: "snippet", type: "video", order: "viewCount", maxResults: "50", publishedAfter: desde,
          regionCode: b.regiao, relevanceLanguage: b.lang, videoDuration: b.dur && b.dur !== "any" ? b.dur : "", q: b.q ?? "", pageToken: token,
        }, chave);
        for (const it of r.items ?? []) if (it.id?.videoId) achados.set(it.id.videoId, { busca: `${b.lang}-${b.regiao}-${b.dur ?? "any"}${b.q ? `:${b.q}` : ""}` });
        token = r.nextPageToken ?? "";
        if (!token) break;
      } catch (e) { erros.push(`busca ${b.lang}/${b.dur}: ${(e as Error).message}`); break; }
    }
  }

  // 2) números dos vídeos
  const vids: Record<string, any> = {};
  for (const l of lotes([...achados.keys()])) {
    try {
      const r = await yt("videos", { part: "snippet,statistics,contentDetails", id: l.join(",") }, chave);
      for (const v of r.items ?? []) vids[v.id] = v;
    } catch (e) { erros.push(`videos: ${(e as Error).message}`); }
  }
  const porCanal = new Map<string, any[]>();
  for (const v of Object.values(vids)) {
    if (+(v.statistics?.viewCount ?? 0) < minViews) continue;
    const c = v.snippet.channelId;
    porCanal.set(c, [...(porCanal.get(c) ?? []), v]);
  }

  // 3) canais: poucos vídeos = candidato a canal novo
  const canais: Record<string, any> = {};
  for (const l of lotes([...porCanal.keys()])) {
    try {
      const r = await yt("channels", { part: "snippet,statistics,contentDetails", id: l.join(",") }, chave);
      for (const c of r.items ?? []) canais[c.id] = c;
    } catch (e) { erros.push(`canais: ${(e as Error).message}`); }
  }
  const candidatos = Object.values(canais).filter((c) => +(c.statistics?.videoCount ?? 999) <= 120);

  // 4) data do primeiro vídeo (playlist de uploads, mais antigo = último da lista)
  const saida: any[] = [];
  for (const c of candidatos) {
    try {
      const pl = c.contentDetails?.relatedPlaylists?.uploads;
      let token = "", itens: any[] = [];
      for (let p = 0; p < 3; p++) {
        const r = await yt("playlistItems", { part: "contentDetails,snippet", playlistId: pl, maxResults: "50", pageToken: token }, chave);
        itens = itens.concat(r.items ?? []);
        token = r.nextPageToken ?? "";
        if (!token) break;
      }
      if (token) continue; // mais de 150 vídeos: não é canal novo
      const datas = itens.map((i) => i.contentDetails?.videoPublishedAt).filter(Boolean).sort();
      const primeiro = datas[0];
      if (!primeiro || primeiro < desde) continue;
      const top = (porCanal.get(c.id) ?? []).sort((a, b) => +b.statistics.viewCount - +a.statistics.viewCount);
      saida.push({
        canal: c.snippet.title, handle: c.snippet.customUrl ?? null, id: c.id, pais: c.snippet.country ?? null,
        idioma: top[0]?.snippet?.defaultAudioLanguage ?? top[0]?.snippet?.defaultLanguage ?? null,
        inscritos: +(c.statistics.subscriberCount ?? 0), views_canal: +(c.statistics.viewCount ?? 0), videos: itens.length,
        primeiro_video: primeiro.slice(0, 10), criado: c.snippet.publishedAt?.slice(0, 10), busca: achados.get(top[0]?.id)?.busca,
        top: top.slice(0, 3).map((v) => ({ titulo: v.snippet.title, views: +v.statistics.viewCount, min: Math.round(seg(v.contentDetails.duration) / 60), em: v.snippet.publishedAt.slice(0, 10), id: v.id })),
        recentes: itens.slice(0, 8).map((i) => i.snippet?.title),
      });
    } catch (e) { erros.push(`playlist ${c.id}: ${(e as Error).message}`); }
  }
  saida.sort((a, b) => b.top[0].views - a.top[0].views);
  return json(200, { ok: true, desde: desde.slice(0, 10), videos_achados: achados.size, canais_vistos: Object.keys(canais).length, novos: saida.length, canais: saida, erros });
});

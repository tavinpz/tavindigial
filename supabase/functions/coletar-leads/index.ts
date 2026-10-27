// coletar-leads — coleta própria pela API oficial do Google Places (Text Search, New).
// A Google cobra por BUSCA (até 20 negócios por página), não por negócio: 1.000 páginas/mês grátis.
// Automático (pg_cron, 7h): escolhe termo x bairro ainda não buscados, priorizando os termos que mais
// trazem negócio sem site ou com link fraco. Manual (painel): { termo, nicho, bairros[], ... }.
// Só grava quem interessa (sem site ou link fraco), nunca repete place_id nem traz de volta quem foi apagado.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info, x-ingest-token",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

// ── classificação (mesma regra do ingest-leads) ──
const FALSOS = [
  "linktr.ee", "instagram.com", "wa.me", "api.whatsapp.com", "whatsapp.com", "facebook.com", "fb.com",
  "m.facebook.com", "beacons.ai", "bio.link", "linkin.bio", "taplink.cc", "taplink.at", "lnk.bio",
  "campsite.bio", "linkbio", "msha.ke", "linkme.bio", "solo.to", "tiktok.com", "linkr.bio", "bio.site",
  "contate.me", "comunidade.ifood", "ifood.com.br", "goo.gl", "g.page", "business.site", "linklist.bio",
  "bit.ly", "tinyurl.com", "sites.google.com", "avec.app", "booksy.com", "trinks.com", "appbarber.com.br",
  "gestaoparabarbearia.com.br", "bemp.online", "bethelapp.com.br", "agendasalao.com.br", "simplesagenda.com.br",
  "agendaedu", "linkagenda", "calendly.com", "wixsite.com", "negocio.site", "cashbarber", "salaovip", "fresha.com",
];
export function classificar(site: string): "sem_site" | "site_falso" | "site_ok" {
  const s = site.trim().toLowerCase();
  if (!s) return "sem_site";
  let host = s;
  try { host = new URL(s.startsWith("http") ? s : `https://${s}`).hostname.replace(/^www\./, ""); } catch { /* bruto */ }
  return FALSOS.some((d) => host === d || host.endsWith(`.${d}`) || host.includes(d)) ? "site_falso" : "site_ok";
}
const IG_RESERVADOS = new Set(["p", "reel", "reels", "explore", "accounts", "stories", "tv", "direct", "about", "developer", "legal", "web", "sharer", "share", "_u"]);
export function instagramDe(site: string): string | null {
  const re = /instagram\.com(?:\.br)?\/(?:@)?([A-Za-z0-9_.]{2,30})/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(site))) {
    const h = m[1].replace(/\.+$/, "").toLowerCase();
    if (!IG_RESERVADOS.has(h) && !/^\d+$/.test(h)) return `@${h}`;
  }
  return null;
}
export function normalizarTelefone(raw: string): { whatsapp: string | null; fixo: boolean } {
  let d = raw.replace(/\D/g, "");
  if (!d) return { whatsapp: null, fixo: false };
  if (d.startsWith("0") && !d.startsWith("0800")) d = d.replace(/^0+/, "");
  if (d.startsWith("0800") || d.startsWith("400") || d.startsWith("300")) return { whatsapp: null, fixo: false };
  if (d.length === 10 || d.length === 11) d = `55${d}`;
  if (!d.startsWith("55")) return { whatsapp: null, fixo: false };
  if (d.length === 13 && d[4] === "9") return { whatsapp: d, fixo: false };
  if (d.length === 12) return { whatsapp: d, fixo: true };
  return { whatsapp: null, fixo: false };
}

type Lugar = {
  id: string; displayName?: { text?: string }; formattedAddress?: string;
  addressComponents?: { longText?: string; types?: string[] }[];
  nationalPhoneNumber?: string; internationalPhoneNumber?: string; websiteUri?: string;
  rating?: number; userRatingCount?: number; businessStatus?: string;
  primaryTypeDisplayName?: { text?: string }; googleMapsUri?: string;
};
type Busca = { termo: string; nicho: string; bairro: string | null; cidade: string; min: number };

const comp = (l: Lugar, ...tipos: string[]) =>
  l.addressComponents?.find((c) => tipos.some((t) => c.types?.includes(t)))?.longText ?? null;

// Lugar do Google -> linha de lead (ou null se não serve)
export function paraLead(l: Lugar, b: Busca) {
  if (!l.id || !l.displayName?.text) return null;
  if (l.businessStatus && l.businessStatus !== "OPERATIONAL") return null;
  if ((l.userRatingCount ?? 0) < b.min) return null;
  const site = (l.websiteUri ?? "").trim();
  const tipo = classificar(site);
  const tel = l.internationalPhoneNumber ?? l.nationalPhoneNumber ?? "";
  const { whatsapp, fixo } = normalizarTelefone(tel);
  return {
    place_id: l.id,
    nome: l.displayName.text.trim(),
    categoria: l.primaryTypeDisplayName?.text ?? null,
    nicho: b.nicho,
    cidade: comp(l, "administrative_area_level_2", "locality") ?? b.cidade.split(",")[0],
    bairro: comp(l, "sublocality_level_1", "sublocality", "neighborhood") ?? b.bairro,
    endereco: l.formattedAddress ?? null,
    telefone: tel || null,
    whatsapp,
    telefone_fixo: fixo,
    site_raw: site || null,
    tipo_site: tipo,
    instagram: instagramDe(site),
    avaliacoes: l.userRatingCount ?? 0,
    nota: l.rating ?? null,
    origem_dado: "google_places",
    observacoes: l.googleMapsUri ? `Maps: ${l.googleMapsUri}` : null,
  };
}

const CAMPOS = [
  "places.id", "places.displayName", "places.formattedAddress", "places.addressComponents",
  "places.nationalPhoneNumber", "places.internationalPhoneNumber", "places.websiteUri", "places.rating",
  "places.userRatingCount", "places.businessStatus", "places.primaryTypeDisplayName", "places.googleMapsUri",
  "nextPageToken",
].join(",");

async function pagina(chave: string, consulta: string, token?: string) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": chave, "X-Goog-FieldMask": CAMPOS },
    body: JSON.stringify({ textQuery: consulta, languageCode: "pt-BR", regionCode: "BR", pageSize: 20, ...(token ? { pageToken: token } : {}) }),
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d.error?.message || `Google respondeu ${res.status}`);
  return d as { places?: Lugar[]; nextPageToken?: string };
}

async function rodarBusca(db: SupabaseClient, chave: string, b: Busca, maxPaginas: number, origem: string) {
  const r = { termo: b.termo, bairro: b.bairro, paginas: 0, retornados: 0, novos: 0, qualificados: 0, erro: null as string | null };
  const consulta = b.bairro ? `${b.termo} em ${b.bairro}, ${b.cidade}` : `${b.termo} em ${b.cidade}`;
  let token: string | undefined;
  try {
    do {
      const d = await pagina(chave, consulta, token);
      r.paginas++;
      const lugares = d.places ?? [];
      r.retornados += lugares.length;
      const ids = lugares.map((l) => l.id);
      const [{ data: ja }, { data: apag }] = await Promise.all([
        db.from("leads").select("place_id").in("place_id", ids),
        db.from("leads_apagados").select("place_id").in("place_id", ids),
      ]);
      const conhecidos = new Set([...(ja ?? []), ...(apag ?? [])].map((x: { place_id: string }) => x.place_id));
      const novos = lugares.filter((l) => !conhecidos.has(l.id));
      r.novos += novos.length;
      const bons = novos.map((l) => paraLead(l, b)).filter((x) => x && x.tipo_site !== "site_ok" && (x.whatsapp || x.instagram || x.telefone));
      if (bons.length) {
        const { data, error } = await db.from("leads").upsert(bons, { onConflict: "place_id", ignoreDuplicates: true }).select("id");
        if (error) throw new Error(error.message);
        r.qualificados += data?.length ?? 0;
      }
      token = d.nextPageToken;
      // Página sem nada novo: as próximas também não vão ter, não paga por elas
      if (!novos.length || lugares.length < 20) break;
    } while (token && r.paginas < maxPaginas);
  } catch (e) {
    r.erro = (e as Error).message.slice(0, 300);
  }
  await db.from("coleta_buscas").insert({
    termo: b.termo, nicho: b.nicho, bairro: b.bairro, cidade: b.cidade, origem,
    paginas: r.paginas, retornados: r.retornados, novos: r.novos, qualificados: r.qualificados, erro: r.erro,
  });
  return r;
}

// Plano do dia: combinações termo x bairro sem busca nos últimos 60 dias.
// Termos que rendem mais ganham mais buscas por rodada; os novos começam com nota média.
async function planoDoDia(db: SupabaseClient, quantas: number): Promise<Busca[]> {
  const desde = new Date(Date.now() - 60 * 86400000).toISOString();
  const [{ data: termos }, { data: bairros }, { data: feitas }] = await Promise.all([
    db.from("v_coleta_termos").select("termo,nicho,min_avaliacoes,taxa").eq("ativo", true),
    db.from("coleta_bairros").select("bairro,cidade").eq("ativo", true).order("id"),
    db.from("coleta_buscas").select("termo,bairro").gte("feita_em", desde),
  ]);
  const feito = new Set((feitas ?? []).map((f: { termo: string; bairro: string }) => `${f.termo}|${f.bairro}`));
  const fila = (termos ?? [])
    .map((t: { termo: string; nicho: string; min_avaliacoes: number; taxa: number | null }) => ({
      ...t,
      nota: (t.taxa ?? 0.45) + Math.random() * 0.08,
      livres: (bairros ?? []).filter((b: { bairro: string }) => !feito.has(`${t.termo}|${b.bairro}`)),
    }))
    .filter((t) => t.livres.length)
    .sort((a, b) => b.nota - a.nota);
  const plano: Busca[] = [];
  while (plano.length < quantas && fila.some((t) => t.livres.length)) {
    for (const t of fila) {
      const vezes = Math.max(1, Math.round(t.nota * 4)); // rende mais, busca mais
      for (let i = 0; i < vezes && t.livres.length && plano.length < quantas; i++) {
        const b = t.livres.shift()!;
        plano.push({ termo: t.termo, nicho: t.nicho, bairro: b.bairro, cidade: b.cidade, min: t.min_avaliacoes });
      }
    }
  }
  return plano;
}

async function autorizado(db: SupabaseClient, req: Request) {
  const { data: cfg } = await db.from("app_config").select("value").eq("key", "ingest_token").maybeSingle();
  if (cfg && req.headers.get("x-ingest-token") === cfg.value) return true;
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return false;
  const usuario = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data } = await usuario.rpc("is_admin");
  return data === true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json(405, { ok: false });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  if (!(await autorizado(db, req))) return json(401, { ok: false, erro: "não autorizado" });
  const body = await req.json().catch(() => ({}));

  const { data: cfg } = await db.from("app_config").select("key,value").in("key", ["google_places_key", "coleta_buscas_dia", "coleta_limite_mes"]);
  const c = Object.fromEntries((cfg ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
  if (!c.google_places_key) return json(200, { ok: false, erro: "Cole a chave da API do Google em Coleta de leads" });

  // Teto do mês: para de buscar antes de sair do grátis
  const inicioMes = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  inicioMes.setDate(1); inicioMes.setHours(0, 0, 0, 0);
  const { data: mes } = await db.from("coleta_buscas").select("paginas").gte("feita_em", new Date(inicioMes.getTime() + 3 * 3600000).toISOString());
  const usadas = (mes ?? []).reduce((s: number, x: { paginas: number }) => s + x.paginas, 0);
  const limite = Number(c.coleta_limite_mes || 950);
  let saldo = Math.max(0, limite - usadas);
  if (!saldo) return json(200, { ok: false, erro: `Limite do mês atingido (${usadas}/${limite} páginas)` });

  if (body.verificar) {
    try { await pagina(c.google_places_key, "barbearia em Moema, São Paulo"); return json(200, { ok: true }); }
    catch (e) { return json(200, { ok: false, erro: (e as Error).message }); }
  }

  let buscas: Busca[];
  const origem = body.auto ? "auto" : "manual";
  if (body.auto) {
    const porDia = Math.min(Number(c.coleta_buscas_dia || 30), saldo);
    buscas = await planoDoDia(db, Math.ceil(porDia / 1.5)); // em média 1,5 página por busca
    saldo = porDia;
  } else {
    const termo = String(body.termo ?? "").trim();
    if (!termo) return json(400, { ok: false, erro: "Informe o termo da busca" });
    const bairros = (Array.isArray(body.bairros) ? body.bairros : []).map((x: unknown) => String(x).trim()).filter(Boolean);
    const cidade = String(body.cidade || "São Paulo, SP").trim();
    buscas = (bairros.length ? bairros : [null]).slice(0, 20).map((bairro: string | null) => ({
      termo, nicho: String(body.nicho || "geral").trim().toLowerCase(), bairro, cidade, min: Number(body.min_avaliacoes ?? 5),
    }));
  }

  const maxPaginas = Math.min(3, Math.max(1, Number(body.paginas ?? 3)));
  const resultado = [];
  for (const b of buscas) {
    if (saldo <= 0) break;
    const r = await rodarBusca(db, c.google_places_key, b, Math.min(maxPaginas, saldo), origem);
    saldo -= r.paginas;
    resultado.push(r);
    if (r.erro && /API key|PERMISSION|billing|not been used|disabled/i.test(r.erro)) break; // chave com problema: para tudo
  }
  const soma = (k: "paginas" | "novos" | "qualificados") => resultado.reduce((s, r) => s + r[k], 0);
  return json(200, { ok: true, buscas: resultado.length, paginas: soma("paginas"), novos: soma("novos"), qualificados: soma("qualificados"), detalhes: resultado });
});

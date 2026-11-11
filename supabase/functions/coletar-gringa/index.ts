// coletar-gringa — leads de negócios brasileiros (e de língua portuguesa) fora do Brasil.
// Motor: OpenStreetMap (Overpass), grátis e sem chave. Busca nomes com marcas brasileiras
// ("Brazil", "Brasil", "padaria", "salão", "pão de queijo", culinária brasileira...) em volta de
// cidades com muita gente do Brasil (EUA) e, em Portugal, também pequenos negócios sem site.
// Depois visita o site de quem tem um e procura o e-mail de contato (para a sequência de e-mail).
// Grava em leads com mercado = 'us' | 'pt'. Nunca repete place_id nem traz de volta quem foi apagado.
// Chamadas: { cidades: ['framingham', ...] } (painel ou x-ingest-token) | { emails: true } (só enriquece)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info, x-ingest-token",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

type Cidade = { id: string; nome: string; pais: "US" | "PT"; lat: number; lon: number; raio: number; fuso: string };
export const CIDADES: Cidade[] = [
  { id: "framingham", nome: "Framingham, MA", pais: "US", lat: 42.2793, lon: -71.4162, raio: 14000, fuso: "America/New_York" },
  { id: "boston", nome: "Boston, MA", pais: "US", lat: 42.383, lon: -71.08, raio: 11000, fuso: "America/New_York" },
  { id: "marlborough", nome: "Marlborough e Hudson, MA", pais: "US", lat: 42.37, lon: -71.55, raio: 10000, fuso: "America/New_York" },
  { id: "newark", nome: "Newark, NJ", pais: "US", lat: 40.728, lon: -74.155, raio: 9000, fuso: "America/New_York" },
  { id: "astoria", nome: "Astoria, NY", pais: "US", lat: 40.764, lon: -73.923, raio: 6000, fuso: "America/New_York" },
  { id: "danbury", nome: "Danbury, CT", pais: "US", lat: 41.394, lon: -73.454, raio: 9000, fuso: "America/New_York" },
  { id: "pompano", nome: "Pompano e Deerfield Beach, FL", pais: "US", lat: 26.27, lon: -80.12, raio: 16000, fuso: "America/New_York" },
  { id: "miami", nome: "Miami, FL", pais: "US", lat: 25.79, lon: -80.2, raio: 18000, fuso: "America/New_York" },
  { id: "orlando", nome: "Orlando e Kissimmee, FL", pais: "US", lat: 28.42, lon: -81.43, raio: 26000, fuso: "America/New_York" },
  { id: "atlanta", nome: "Marietta, GA (Atlanta)", pais: "US", lat: 33.95, lon: -84.52, raio: 18000, fuso: "America/New_York" },
  { id: "longbranch", nome: "Long Branch, NJ", pais: "US", lat: 40.304, lon: -73.992, raio: 9000, fuso: "America/New_York" },
  { id: "tampa", nome: "Tampa, FL", pais: "US", lat: 27.95, lon: -82.46, raio: 20000, fuso: "America/New_York" },
  { id: "charlotte", nome: "Charlotte, NC", pais: "US", lat: 35.227, lon: -80.843, raio: 20000, fuso: "America/New_York" },
  { id: "houston", nome: "Houston, TX", pais: "US", lat: 29.76, lon: -95.37, raio: 25000, fuso: "America/Chicago" },
  { id: "dallas", nome: "Dallas, TX", pais: "US", lat: 32.78, lon: -96.8, raio: 25000, fuso: "America/Chicago" },
  { id: "austin", nome: "Austin, TX", pais: "US", lat: 30.27, lon: -97.74, raio: 20000, fuso: "America/Chicago" },
  { id: "phoenix", nome: "Phoenix, AZ", pais: "US", lat: 33.45, lon: -112.07, raio: 25000, fuso: "America/Phoenix" },
  { id: "losangeles", nome: "Los Angeles, CA", pais: "US", lat: 34.05, lon: -118.25, raio: 25000, fuso: "America/Los_Angeles" },
  { id: "lisboa", nome: "Lisboa", pais: "PT", lat: 38.722, lon: -9.14, raio: 9000, fuso: "Europe/Lisbon" },
  { id: "gaia", nome: "Vila Nova de Gaia", pais: "PT", lat: 41.124, lon: -8.611, raio: 6000, fuso: "Europe/Lisbon" },
  { id: "matosinhos", nome: "Matosinhos", pais: "PT", lat: 41.185, lon: -8.69, raio: 5000, fuso: "Europe/Lisbon" },
  { id: "braga", nome: "Braga", pais: "PT", lat: 41.551, lon: -8.423, raio: 6000, fuso: "Europe/Lisbon" },
  { id: "coimbra", nome: "Coimbra", pais: "PT", lat: 40.205, lon: -8.419, raio: 6000, fuso: "Europe/Lisbon" },
  { id: "aveiro", nome: "Aveiro", pais: "PT", lat: 40.641, lon: -8.653, raio: 5000, fuso: "Europe/Lisbon" },
  { id: "faro", nome: "Faro e Loulé (Algarve)", pais: "PT", lat: 37.06, lon: -7.98, raio: 14000, fuso: "Europe/Lisbon" },
  { id: "albufeira", nome: "Albufeira e Portimão (Algarve)", pais: "PT", lat: 37.11, lon: -8.39, raio: 18000, fuso: "Europe/Lisbon" },
  { id: "porto", nome: "Porto", pais: "PT", lat: 41.157, lon: -8.62, raio: 7000, fuso: "Europe/Lisbon" },
];

// Marcas de negócio brasileiro no nome (EUA). Palavras que o espanhol também usa ficam de fora.
const BR = "brazil|brasil|brasileir|carioca|mineir|baian|gauch|gaúch|capixab|goian|paulist|nordestin|pão de queijo|pao de queijo|açaí|acai|coxinha|tapioca|rodízio|rodizio|feijoada|brigadeiro|churrascaria|padaria|salão|cabeleireir|beleza|cantinho|lanchonete|saudade|gostoso|guaraná|guarana|picanha";
// Em Portugal todo mundo fala português: além das marcas, pequenos negócios sem site
const PT_SEM_SITE = '["shop"~"^(hairdresser|beauty|nails|cosmetics|bakery|pastry|clothes|florist|optician|pet|pet_grooming)$"]';

function consulta(c: Cidade) {
  // caixa em volta do centro (bbox é bem mais rápido que "around" no Overpass)
  const dLat = c.raio / 111000, dLon = c.raio / (111000 * Math.cos((c.lat * Math.PI) / 180));
  const bb = [c.lat - dLat, c.lon - dLon, c.lat + dLat, c.lon + dLon].map((x) => x.toFixed(4)).join(",");
  const nome = `["name"~"${BR}",i]`;
  const extra = c.pais === "PT"
    ? `nwr${PT_SEM_SITE}[name][!website][!"contact:website"]["phone"];
  nwr["amenity"~"^(restaurant|cafe)$"][name][!website][!"contact:website"]["phone"];`
    : "";
  return `[out:json][timeout:55][bbox:${bb}];
(
  nwr["amenity"]${nome};
  nwr["shop"]${nome};
  nwr["craft"]${nome};
  nwr["office"]${nome};
  nwr["cuisine"~"brazil",i];
  ${extra}
);
out center tags 400;`;
}

const FALSOS = ["linktr.ee", "instagram.com", "wa.me", "whatsapp.com", "facebook.com", "fb.com", "beacons.ai", "bio.link", "linkin.bio", "taplink", "lnk.bio", "tiktok.com", "bit.ly", "business.site", "sites.google.com", "wixsite.com", "yelp.com", "doordash.com", "ubereats.com", "grubhub.com", "toasttab.com", "square.site", "vagaro.com", "booksy.com", "fresha.com", "styleseat.com", "schedulicity.com"];
function classificar(site: string): "sem_site" | "site_falso" | "site_ok" {
  const s = site.trim().toLowerCase();
  if (!s) return "sem_site";
  let host = s;
  try { host = new URL(s.startsWith("http") ? s : `https://${s}`).hostname.replace(/^www\./, ""); } catch { /* bruto */ }
  return FALSOS.some((d) => host === d || host.endsWith(`.${d}`) || host.includes(d)) ? "site_falso" : "site_ok";
}

// Telefone em formato internacional (só dígitos). WhatsApp: EUA qualquer número; Portugal só celular (9xx).
function telefone(raw: string, pais: "US" | "PT") {
  const bruto = String(raw || "").split(/[;,/]| or /i)[0];
  let d = bruto.replace(/\D/g, "");
  if (!d) return { tel: null, whatsapp: null, fixo: false };
  if (bruto.trim().startsWith("+") || d.startsWith("00")) d = d.replace(/^00/, "");
  else if (pais === "US" && d.length === 10) d = `1${d}`;
  else if (pais === "PT" && d.length === 9) d = `351${d}`;
  if (pais === "US" && d.length === 11 && d.startsWith("1")) return { tel: `+${d}`, whatsapp: d, fixo: false };
  if (d.startsWith("351") && d.length === 12) {
    const cel = d[3] === "9";
    return { tel: `+${d}`, whatsapp: cel ? d : null, fixo: !cel };
  }
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) return { tel: `+${d}`, whatsapp: d.length === 13 ? d : null, fixo: d.length === 12 };
  if (d.length >= 10 && d.length <= 15) return { tel: `+${d}`, whatsapp: d, fixo: false };
  return { tel: null, whatsapp: null, fixo: false };
}

function nichoDe(t: Record<string, string>, nome: string): [string, string] {
  const n = nome.toLowerCase();
  const am = t.amenity, sh = t.shop, cr = t.craft, of = t.office, hc = t.healthcare;
  if (/barber|barbearia/.test(n) || sh === "barber") return ["barbearia", "Barbearia"];
  if (am === "cafe") return ["cafeteria", "Cafeteria"];
  if (["restaurant", "fast_food", "food_court", "bar", "pub", "ice_cream"].includes(am)) return ["restaurante", "Restaurante"];
  if (["bakery", "pastry", "confectionery"].includes(sh)) return ["padaria", "Padaria"];
  if (sh === "hairdresser") return ["salão de beleza", "Salão de beleza"];
  if (["beauty", "nails", "cosmetics", "massage"].includes(sh) || am === "spa") return ["estética", "Estética"];
  if (["supermarket", "convenience", "greengrocer", "butcher", "deli", "grocery", "food"].includes(sh)) return ["mercado", "Mercado brasileiro"];
  if (sh === "clothes" || sh === "shoes" || sh === "boutique") return ["loja", "Loja de roupas"];
  if (am === "dentist" || hc === "dentist") return ["odontologia", "Dentista"];
  if (am === "clinic" || am === "doctors" || hc) return ["clínica", "Clínica"];
  if (sh === "pet" || sh === "pet_grooming" || am === "veterinary") return ["pet", "Pet"];
  if (/clean|limpeza|maid/.test(n) || cr === "cleaning" || of === "cleaning") return ["limpeza", "Limpeza"];
  if (/construct|remodel|painting|pintura|carpent|floor|roof/.test(n) || cr) return ["construção", "Construção e reformas"];
  if (sh === "travel_agency" || of === "travel_agent") return ["viagens", "Agência de viagens"];
  if (sh) return ["loja", `Loja (${sh})`];
  if (of) return ["serviços", "Escritório"];
  return ["geral", am || "Negócio"];
}
// Redes grandes e o que não é cliente (academia de jiu-jitsu, chá de bolhas, igreja, consulado...)
const FORA = /jiu|jitsu|bjj|capoeira|church|igreja|consulat|consulado|onezo|bubble|boba|fogo de ch|texas de brazil|worker center|brazilian wax|brazilian blowout/i;
const IGNORAR = /^(place_of_worship|school|kindergarten|college|university|bank|atm|fuel|parking|social_facility|community_centre|townhall|post_office|bus_station|money_transfer|car_wash)$/;

function handleIg(v: string | undefined) {
  if (!v) return null;
  const m = v.match(/instagram\.com\/([A-Za-z0-9_.]{2,30})/i) || v.match(/^@?([A-Za-z0-9_.]{2,30})$/);
  return m ? `@${m[1].replace(/\.+$/, "").toLowerCase()}` : null;
}

type Elemento = { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };

// O Overpass recusa chamadas vindas das edge functions: o pedido sai pelo banco (pg_net, função gringa_pedir)
// e o resultado volta para cá com { acao: 'gravar' } (função gringa_processar, a cada minuto).
const urlOverpass = (q: string) => `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`;

function paraLead(e: Elemento, c: Cidade) {
  const t = e.tags ?? {};
  const nome = (t.name || t["name:pt"] || t["name:en"] || "").trim();
  if (!nome || IGNORAR.test(t.amenity || "") || FORA.test(nome) || t.leisure || t.sport) return null;
  if (t.disused || t["disused:shop"] || t.abandoned) return null;
  const site = (t.website || t["contact:website"] || t.url || "").trim();
  const tel = telefone(t.phone || t["contact:phone"] || t["contact:mobile"] || t.mobile || t["contact:whatsapp"] || "", c.pais);
  const email = (t.email || t["contact:email"] || "").trim().toLowerCase() || null;
  if (!tel.tel && !email && !site) return null;
  const [nicho, categoria] = nichoDe(t, nome);
  const endereco = [[t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" "), t["addr:city"], t["addr:state"] || t["addr:postcode"]].filter(Boolean).join(", ") || null;
  const lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon;
  return {
    place_id: `osm:${e.type}/${e.id}`,
    nome,
    categoria,
    nicho,
    cidade: t["addr:city"] || c.nome.split(",")[0].split(" e ")[0],
    bairro: c.nome,
    endereco,
    telefone: tel.tel,
    whatsapp: tel.whatsapp,
    telefone_fixo: tel.fixo,
    site_raw: site || null,
    tipo_site: classificar(site),
    instagram: handleIg(t["contact:instagram"] || t.instagram),
    email: email && /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(email) ? email : null,
    avaliacoes: 0,
    nota: null,
    origem_dado: "osm",
    mercado: c.pais.toLowerCase(),
    pais: c.pais,
    fuso: c.fuso,
    observacoes: lat && lon ? `Maps: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${nome} ${lat},${lon}`)}` : null,
  };
}

// ── e-mail no site ──
const LIXO = /\.(png|jpe?g|gif|webp|svg|css|js)$|example\.|sentry|wixpress|@2x|domain\.com|email\.com|yourdomain|godaddy|squarespace|wix\.com|u003e/i;
function emailsDo(html: string, host: string) {
  const achados = new Set<string>();
  for (const m of html.matchAll(/mailto:([^"'?\s>]+)/gi)) achados.add(decodeURIComponent(m[1]).toLowerCase());
  for (const m of html.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) achados.add(m[0].toLowerCase());
  const bons = [...achados].filter((e) => !LIXO.test(e) && e.length < 80);
  const base = host.replace(/^www\./, "").split(".").slice(-2).join(".");
  bons.sort((a, b) => Number(b.endsWith(base)) - Number(a.endsWith(base)) || Number(/^(info|contact|hello|contato|oi|ola)@/.test(b)) - Number(/^(info|contact|hello|contato|oi|ola)@/.test(a)));
  return bons[0] ?? null;
}
async function buscarEmail(site: string) {
  let url: URL;
  try { url = new URL(site.startsWith("http") ? site : `https://${site}`); } catch { return null; }
  for (const caminho of ["", "/contact", "/contact-us", "/contato"]) {
    try {
      const r = await fetch(new URL(caminho || url.pathname, url), { headers: { "User-Agent": "Mozilla/5.0 (compatible; TavinDigital/1.0)" }, redirect: "follow", signal: AbortSignal.timeout(7000) });
      if (!r.ok || !(r.headers.get("content-type") || "").includes("html")) continue;
      const e = emailsDo((await r.text()).slice(0, 600000), url.hostname);
      if (e) return e;
    } catch { /* site fora do ar */ }
  }
  return null;
}
async function enriquecerEmails(db: SupabaseClient, limite = 40) {
  const { data } = await db.from("leads").select("id,site_raw").neq("mercado", "br").is("email", null).is("email_status", null)
    .not("site_raw", "is", null).eq("tipo_site", "site_ok").limit(limite);
  let achados = 0;
  const fila = [...(data ?? [])];
  const trabalhador = async () => {
    for (let l = fila.shift(); l; l = fila.shift()) {
      const email = await buscarEmail(l.site_raw);
      if (email) achados++;
      await db.from("leads").update(email ? { email, email_status: "achado_no_site" } : { email_status: "sem_email" }).eq("id", l.id);
    }
  };
  await Promise.all(Array.from({ length: 6 }, trabalhador));
  return { sites: data?.length ?? 0, achados };
}

// ── Google Places (precisa da chave salva em Coleta): negócios americanos em inglês e brasileiros nos EUA ──
// Só grava quem não tem site bom (é quem compra) e prioriza negócio estabelecido (muitas avaliações).
const BR_NOME = /brazil|brasil|brasileir|carioca|mineir|baian|ga[uú]ch|capixab|goian|paulist|nordestin|p[aã]o de queijo|a[cç]a[ií]|coxinha|tapioca|rod[ií]zio|feijoada|brigadeiro|churrascaria|guaran[aá]|picanha/i;
export const TERMOS_EN = ["med spa", "dentist", "hair salon", "nail salon", "barber shop", "house cleaning service", "landscaping", "general contractor", "auto repair", "pet grooming", "bakery", "restaurant", "real estate agent", "personal trainer"];
export const TERMOS_BR = ["brazilian restaurant", "brazilian bakery", "brazilian hair salon", "brazilian market", "brazilian cleaning service", "brazilian construction"];
const NICHO_TERMO: Record<string, string> = { "med spa": "estética", "dentist": "odontologia", "hair salon": "salão de beleza", "nail salon": "estética", "barber shop": "barbearia", "house cleaning service": "limpeza", "landscaping": "serviços", "general contractor": "construção", "auto repair": "serviços", "pet grooming": "pet", "bakery": "padaria", "restaurant": "restaurante", "real estate agent": "serviços", "personal trainer": "serviços", "brazilian restaurant": "restaurante", "brazilian bakery": "padaria", "brazilian hair salon": "salão de beleza", "brazilian market": "mercado", "brazilian cleaning service": "limpeza", "brazilian construction": "construção" };
type Lugar = { id: string; displayName?: { text: string }; formattedAddress?: string; internationalPhoneNumber?: string; websiteUri?: string; rating?: number; userRatingCount?: number; businessStatus?: string; primaryTypeDisplayName?: { text: string }; googleMapsUri?: string };
const CAMPOS_G = ["places.id", "places.displayName", "places.formattedAddress", "places.internationalPhoneNumber", "places.websiteUri", "places.rating", "places.userRatingCount", "places.businessStatus", "places.primaryTypeDisplayName", "places.googleMapsUri", "nextPageToken"].join(",");

async function google(db: SupabaseClient, chave: string, c: Cidade, termo: string, ingles: boolean) {
  const r = { cidade: c.nome, termo, encontrados: 0, novos: 0, gravados: 0, erro: null as string | null };
  try {
    const lugares: Lugar[] = [];
    let token: string | undefined;
    for (let pag = 0; pag < 2; pag++) {
      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Goog-Api-Key": chave, "X-Goog-FieldMask": CAMPOS_G },
        body: JSON.stringify({ textQuery: `${termo} in ${c.nome}`, languageCode: c.pais === "PT" ? "pt-PT" : "en", regionCode: c.pais, pageSize: 20,
          locationBias: { circle: { center: { latitude: c.lat, longitude: c.lon }, radius: Math.min(50000, c.raio * 1.5) } }, ...(token ? { pageToken: token } : {}) }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error?.message || `Google respondeu ${res.status}`);
      lugares.push(...(d.places ?? []));
      token = d.nextPageToken;
      if (!token) break;
    }
    r.encontrados = lugares.length;
    const leads = lugares.filter((l) => l.businessStatus !== "CLOSED_PERMANENTLY" && l.displayName?.text && !FORA.test(l.displayName.text))
      .map((l) => {
        const nome = l.displayName!.text.trim();
        const tel = telefone(l.internationalPhoneNumber || "", c.pais);
        const tipo = classificar(l.websiteUri || "");
        const cat = l.primaryTypeDisplayName?.text || termo;
        return {
          place_id: l.id, nome, categoria: cat, nicho: NICHO_TERMO[termo] || "geral",
          cidade: c.nome.split(",")[0], bairro: c.nome, endereco: l.formattedAddress || null,
          telefone: tel.tel, whatsapp: tel.whatsapp, telefone_fixo: tel.fixo, site_raw: l.websiteUri || null, tipo_site: tipo,
          instagram: null, email: null, avaliacoes: l.userRatingCount ?? 0, nota: l.rating ?? null, origem_dado: "google_places",
          mercado: c.pais.toLowerCase(), pais: c.pais, fuso: c.fuso,
          idioma: ingles && !BR_NOME.test(nome) ? "en" : "pt",
          observacoes: l.googleMapsUri ? `Maps: ${l.googleMapsUri}` : null,
        };
      })
      // quem compra: sem site bom, com telefone, e já com algum movimento (5+ avaliações)
      .filter((l) => l.tipo_site !== "site_ok" && l.telefone && (l.avaliacoes ?? 0) >= 5);
    const pids = leads.map((l) => l.place_id);
    const [{ data: ja }, { data: apag }] = await Promise.all([
      db.from("leads").select("place_id").in("place_id", pids),
      db.from("leads_apagados").select("place_id").in("place_id", pids),
    ]);
    const conhecidos = new Set([...(ja ?? []), ...(apag ?? [])].map((x: { place_id: string }) => x.place_id));
    const novos = leads.filter((l) => !conhecidos.has(l.place_id));
    r.novos = novos.length;
    if (novos.length) {
      const { data, error } = await db.from("leads").upsert(novos, { onConflict: "place_id", ignoreDuplicates: true }).select("id");
      if (error) throw new Error(error.message);
      r.gravados = data?.length ?? 0;
    }
  } catch (e) { r.erro = (e as Error).message.slice(0, 300); }
  await db.from("coleta_buscas").insert({ termo, nicho: "gringa", bairro: c.id, cidade: c.nome, origem: "google-gringa", paginas: 0, retornados: r.encontrados, novos: r.novos, qualificados: r.gravados, erro: r.erro });
  return r;
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

  if (body.listar) return json(200, { ok: true, cidades: CIDADES.map(({ id, nome, pais }) => ({ id, nome, pais })), termos_en: TERMOS_EN, termos_br: TERMOS_BR });

  // Google Places: { acao: 'google', cidades: [...], publico: 'en' | 'br' }
  if (body.acao === "google") {
    const { data: k } = await db.from("app_config").select("value").eq("key", "google_places_key").maybeSingle();
    if (!k?.value) return json(200, { ok: false, erro: "Falta a chave do Google Places: cole em Coleta → Google." });
    const ingles = body.publico !== "br";
    const termos = ingles ? TERMOS_EN : TERMOS_BR;
    const cidades = CIDADES.filter((c) => c.pais === "US" && (body.cidades || []).includes(c.id)).slice(0, 1);
    if (!cidades.length) return json(400, { ok: false, erro: "Escolha uma cidade dos EUA" });
    const res = [];
    for (const c of cidades) for (const t of termos) res.push(await google(db, k.value, c, t, ingles));
    const gravados = res.reduce((s, x) => s + x.gravados, 0);
    const erro = res.find((x) => x.erro)?.erro ?? null;
    return json(200, { ok: !erro || gravados > 0, gravados, buscas: res.length, erro });
  }
  if (body.emails) return json(200, { ok: true, ...(await enriquecerEmails(db, Number(body.limite) || 40)) });

  // 2) volta do Overpass (via banco): grava os leads
  if (body.acao === "gravar") {
    const c = CIDADES.find((x) => x.id === body.cidade);
    if (!c) return json(400, { ok: false, erro: "cidade desconhecida" });
    const r = { cidade: c.nome, encontrados: 0, novos: 0, gravados: 0, erro: null as string | null };
    try {
      const els: Elemento[] = Array.isArray(body.elementos) ? body.elementos : [];
      const vistos = new Set<string>();
      const leads = els.map((e) => paraLead(e, c)).filter((x): x is NonNullable<typeof x> => !!x)
        .filter((l) => { const k = l.nome.toLowerCase(); if (vistos.has(k)) return false; vistos.add(k); return true; });
      r.encontrados = leads.length;
      const pids = leads.map((l) => l.place_id);
      const [{ data: ja }, { data: apag }] = await Promise.all([
        db.from("leads").select("place_id").in("place_id", pids),
        db.from("leads_apagados").select("place_id").in("place_id", pids),
      ]);
      const conhecidos = new Set([...(ja ?? []), ...(apag ?? [])].map((x: { place_id: string }) => x.place_id));
      const novos = leads.filter((l) => !conhecidos.has(l.place_id));
      r.novos = novos.length;
      for (let i = 0; i < novos.length; i += 200) {
        const { data, error } = await db.from("leads").upsert(novos.slice(i, i + 200), { onConflict: "place_id", ignoreDuplicates: true }).select("id");
        if (error) throw new Error(error.message);
        r.gravados += data?.length ?? 0;
      }
    } catch (e) { r.erro = (e as Error).message.slice(0, 300); }
    await db.from("coleta_buscas").insert({ termo: "negócios brasileiros", nicho: "gringa", bairro: c.id, cidade: c.nome, origem: "osm-gringa", paginas: 0, retornados: r.encontrados, novos: r.novos, qualificados: r.gravados, erro: r.erro });
    const emails = await enriquecerEmails(db, 20);
    if (body.pedido) await db.from("gringa_pedidos").update({ status: r.erro ? "erro" : "feito", erro: r.erro, resultado: { ...r, emails } }).eq("id", body.pedido);
    return json(200, { ok: !r.erro, ...r, emails });
  }

  // 1) pedido do painel: manda a busca de cada cidade pelo banco e devolve os números dos pedidos
  const ids: string[] = (Array.isArray(body.cidades) ? body.cidades : []).map(String);
  const escolhidas = CIDADES.filter((c) => ids.includes(c.id));
  if (!escolhidas.length) return json(400, { ok: false, erro: "Escolha uma cidade" });
  const pedidos = [];
  for (const c of escolhidas) {
    const { data, error } = await db.rpc("gringa_pedir", { p_cidade: c.id, p_url: urlOverpass(consulta(c)) });
    if (error) return json(200, { ok: false, erro: error.message });
    pedidos.push({ cidade: c.id, pedido: data });
  }
  return json(200, { ok: true, pedidos, aviso: "Buscando no OpenStreetMap: os leads chegam em 1 a 3 minutos." });
});

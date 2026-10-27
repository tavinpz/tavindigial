// ingest-leads — o n8n manda os resultados do Google Maps (Apify) para cá.
// Protegido pelo header x-ingest-token (valor guardado em app_config).
// Classifica o site (sem_site / site_falso / site_ok), normaliza o WhatsApp
// e grava sem duplicar (place_id). Nunca sobrescreve um lead já existente.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type Item = Record<string, unknown>;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// Domínios que não são site de verdade: viram "site_falso"
const FALSOS = [
  "linktr.ee", "instagram.com", "wa.me", "api.whatsapp.com", "whatsapp.com", "facebook.com", "fb.com",
  "m.facebook.com", "beacons.ai", "bio.link", "linkin.bio", "taplink.cc", "taplink.at", "lnk.bio",
  "campsite.bio", "linkbio", "msha.ke", "linkme.bio", "solo.to", "tiktok.com", "linkr.bio", "bio.site",
  "contate.me", "comunidade.ifood", "ifood.com.br", "goo.gl", "g.page", "business.site", "linklist.bio",
  // Encurtadores e páginas de app de agendamento: o cliente cai numa tela genérica, não num site da marca
  "bit.ly", "tinyurl.com", "sites.google.com", "avec.app", "booksy.com", "trinks.com", "appbarber.com.br",
  "gestaoparabarbearia.com.br", "bemp.online", "bethelapp.com.br", "agendasalao.com.br", "simplesagenda.com.br",
  "agendaedu", "linkagenda", "calendly.com", "wixsite.com", "negocio.site",
];

function classificar(site: string): "sem_site" | "site_falso" | "site_ok" {
  const s = site.trim().toLowerCase();
  if (!s) return "sem_site";
  let host = s;
  try { host = new URL(s.startsWith("http") ? s : `https://${s}`).hostname.replace(/^www\./, ""); } catch { /* usa bruto */ }
  return FALSOS.some((d) => host === d || host.endsWith(`.${d}`) || host.includes(d)) ? "site_falso" : "site_ok";
}

// Caminhos do Instagram que não são perfil
const IG_RESERVADOS = new Set(["p", "reel", "reels", "explore", "accounts", "stories", "tv", "direct", "about", "developer", "legal", "web", "sharer", "share", "_u"]);

function instagramDe(site: string): string | null {
  const re = /instagram\.com(?:\.br)?\/(?:@)?([A-Za-z0-9_.]{2,30})/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(site))) {
    const h = m[1].replace(/\.+$/, "").toLowerCase();
    if (!IG_RESERVADOS.has(h) && !/^\d+$/.test(h)) return `@${h}`;
  }
  return null;
}

// Retorna { whatsapp, fixo }. Celular BR = 55 + DDD + 9 + 8 dígitos (13 dígitos).
function normalizarTelefone(raw: string): { whatsapp: string | null; fixo: boolean } {
  let d = raw.replace(/\D/g, "");
  if (!d) return { whatsapp: null, fixo: false };
  if (d.startsWith("0") && !d.startsWith("0800")) d = d.replace(/^0+/, "");
  if (d.startsWith("0800") || d.startsWith("400") || d.startsWith("300")) return { whatsapp: null, fixo: false };
  if (d.length === 10 || d.length === 11) d = `55${d}`;
  if (!d.startsWith("55")) return { whatsapp: null, fixo: false };
  if (d.length === 13 && d[4] === "9") return { whatsapp: d, fixo: false };
  if (d.length === 12) return { whatsapp: d, fixo: true }; // fixo: pode ter WhatsApp Business, conferir
  return { whatsapp: null, fixo: false };
}

const s = (v: unknown) => (typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim());
const n = (v: unknown) => { const x = Number(v); return Number.isFinite(x) ? x : null; };

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { ok: false });

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: cfg } = await db.from("app_config").select("value").eq("key", "ingest_token").maybeSingle();
  if (!cfg || req.headers.get("x-ingest-token") !== cfg.value) return json(401, { ok: false, erro: "token inválido" });

  const body = await req.json().catch(() => null);
  if (!body) return json(400, { ok: false, erro: "corpo inválido" });

  const nicho = s(body.nicho).toLowerCase() || "geral";
  const cidadePadrao = s(body.cidade);
  const minAval = n(body.min_avaliacoes) ?? 0;
  const itens: Item[] = Array.isArray(body) ? body : Array.isArray(body.leads) ? body.leads : Array.isArray(body.items) ? body.items : [];

  const stats = { recebidos: itens.length, inseridos: 0, duplicados: 0, descartados: 0, sem_site: 0, site_falso: 0, site_ok: 0 };
  const linhas: Record<string, unknown>[] = [];

  for (const it of itens) {
    const nome = s(it.title ?? it.nome);
    const placeId = s(it.placeId ?? it.place_id);
    if (!nome || !placeId) { stats.descartados++; continue; }
    if (it.permanentlyClosed === true || it.temporarilyClosed === true) { stats.descartados++; continue; }

    const site = s(it.website ?? it.site_raw);
    const tipo = classificar(site);
    stats[tipo]++;

    const avaliacoes = n(it.reviewsCount ?? it.avaliacoes) ?? 0;
    if (avaliacoes < minAval) { stats.descartados++; continue; }

    const tel = s(it.phoneUnformatted ?? it.phone ?? it.telefone);
    const { whatsapp, fixo } = normalizarTelefone(tel);

    linhas.push({
      place_id: placeId,
      nome,
      categoria: s(it.categoryName ?? it.categoria) || null,
      nicho,
      cidade: s(it.city ?? it.cidade) || cidadePadrao || "—",
      bairro: s(it.neighborhood ?? it.bairro) || null,
      endereco: s(it.address ?? it.endereco) || null,
      telefone: tel || null,
      whatsapp,
      telefone_fixo: fixo,
      site_raw: site || null,
      tipo_site: tipo,
      instagram: s(it.instagram) || (Array.isArray(it.instagrams) ? instagramDe(it.instagrams.map(String).join(" ")) : null) || instagramDe(site),
      avaliacoes,
      nota: n(it.totalScore ?? it.nota),
      origem_dado: "google_maps_apify",
      observacoes: s(it.url) ? `Maps: ${s(it.url)}` : null,
    });
  }

  // Quem foi apagado no painel não volta
  const ids = linhas.map((l) => l.place_id as string);
  const apagados = new Set<string>();
  for (let i = 0; i < ids.length; i += 150) {
    const { data } = await db.from("leads_apagados").select("place_id").in("place_id", ids.slice(i, i + 150));
    (data ?? []).forEach((r: { place_id: string }) => apagados.add(r.place_id));
  }
  if (apagados.size) {
    stats.descartados += apagados.size;
    linhas.splice(0, linhas.length, ...linhas.filter((l) => !apagados.has(l.place_id as string)));
  }

  for (let i = 0; i < linhas.length; i += 200) {
    const lote = linhas.slice(i, i + 200);
    const { data, error } = await db
      .from("leads")
      .upsert(lote, { onConflict: "place_id", ignoreDuplicates: true })
      .select("id");
    if (error) return json(500, { ok: false, erro: error.message, ...stats });
    stats.inseridos += data?.length ?? 0;
    stats.duplicados += lote.length - (data?.length ?? 0);
  }

  return json(200, { ok: true, nicho, ...stats });
});

// enriquecer-instagram — acha o @ do Instagram do lead no link que ELE colocou no Google
// (Linktree, site, página de agenda). Não acessa o Instagram: só lê a página do próprio negócio.
// Chamado a cada 10 min pelo pg_cron (header x-ingest-token). Processa até 40 leads por vez.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// Caminhos do Instagram que não são perfil
const RESERVADOS = new Set(["p", "reel", "reels", "explore", "accounts", "stories", "tv", "direct", "about", "developer", "legal", "web", "sharer", "share", "_u", "linktr", "rsrc.php", "static", "emails", "privacy", "terms"]);
// Perfis das próprias plataformas (aparecem no rodapé do Linktree, da agenda etc.): nunca são o negócio
const PLATAFORMAS = /^(whatsapp|instagram|facebook|meta|avec\.?app|avecapp|linktree|linktr\.ee|booksy.*|trinks.*|appbarber.*|beacons.*|taplink.*|bio\.?link|biolink|linkme.*|solo\.?to|tiktok|youtube|google|ifood.*|calendly|wix|bemp.*|agendasalao|simplesagenda|bethelapp|gestaoparabarbearia|cashbarber|bestbarbers|salaovip|agendapro.*|fresha.*|nuvemshop|hotmart|canva)$/;

const semAcento = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

export function candidatos(texto: string): string[] {
  const re = /instagram\.com(?:\.br)?\/(?:@)?([A-Za-z0-9_.]{2,30})/gi;
  const achados: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    const h = m[1].replace(/\.+$/, "").toLowerCase();
    if (RESERVADOS.has(h) || /^\d+$/.test(h) || PLATAFORMAS.test(h) || /\.(php|js|css|png|jpe?g|svg|webp)$/.test(h)) continue;
    if (!achados.includes(h)) achados.push(h);
  }
  return achados;
}

// Entre os @ achados, fica o que mais se parece com o nome do negócio ou com o caminho do link
export function handleDe(texto: string, nome = "", link = ""): string | null {
  const cs = candidatos(texto);
  if (!cs.length) return null;
  let caminho = "";
  try { caminho = new URL(link.startsWith("http") ? link : `https://${link}`).pathname; } catch { /* sem caminho */ }
  const alvos = [semAcento(nome), semAcento(caminho)].filter((a) => a.length >= 3);
  const nota = (h: string) => {
    const x = semAcento(h);
    let melhor = 0;
    for (const a of alvos) {
      // maior pedaço em comum (4+ letras) entre o @ e o nome/caminho
      for (let t = Math.min(x.length, a.length); t >= 4; t--) {
        let ok = false;
        for (let i = 0; i + t <= x.length && !ok; i++) if (a.includes(x.slice(i, i + t))) ok = true;
        if (ok) { melhor = Math.max(melhor, t); break; }
      }
    }
    return melhor;
  };
  const ordem = cs.map((h) => ({ h, n: nota(h) })).sort((a, b) => b.n - a.n);
  // Página com vários @ e nenhum parecido com o negócio: melhor não chutar
  if (cs.length > 1 && ordem[0].n === 0) return null;
  return `@${ordem[0].h}`;
}

async function baixar(url: string): Promise<string> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 7000);
  try {
    const res = await fetch(url.startsWith("http") ? url : `https://${url}`, {
      redirect: "follow",
      signal: ctl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TavinDigitalBot/1.0; +https://tavindigital.online)", "Accept-Language": "pt-BR,pt;q=0.9" },
    });
    // segue também o destino final (bit.ly, tinyurl) pela URL
    const corpo = (await res.text()).slice(0, 600_000);
    return `${res.url}\n${corpo}`;
  } finally {
    clearTimeout(t);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { ok: false });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: cfg } = await db.from("app_config").select("value").eq("key", "ingest_token").maybeSingle();
  if (!cfg || req.headers.get("x-ingest-token") !== cfg.value) return json(401, { ok: false });

  const { data: leads } = await db.from("leads")
    .select("id,nome,site_raw")
    .is("instagram", null).is("ig_checado_em", null).not("site_raw", "is", null).neq("tipo_site", "site_ok")
    .in("status", ["novo", "na_fila"])
    .limit(40);

  const stats = { verificados: 0, achados: 0 };
  await Promise.all((leads ?? []).map(async (l: { id: string; nome: string; site_raw: string }) => {
    let ig = handleDe(l.site_raw, l.nome, l.site_raw);
    // Link do WhatsApp não tem Instagram do negócio: nem abre
    if (!ig && !/(wa\.me|whatsapp\.com)/i.test(l.site_raw)) {
      try { ig = handleDe(await baixar(l.site_raw), l.nome, l.site_raw); } catch { /* página fora do ar ou lenta */ }
    }
    stats.verificados++;
    if (ig) stats.achados++;
    await db.from("leads").update({ instagram: ig, ig_checado_em: new Date().toISOString() }).eq("id", l.id);
  }));

  return json(200, { ok: true, ...stats });
});

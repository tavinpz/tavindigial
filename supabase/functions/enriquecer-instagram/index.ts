// enriquecer-instagram — acha o @ do Instagram do lead no link que ELE colocou no Google
// (Linktree, site, página de agenda). Não acessa o Instagram: só lê a página do próprio negócio.
// Chamado a cada 10 min pelo pg_cron (header x-ingest-token). Processa até 40 leads por vez.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// Caminhos do Instagram que não são perfil
const RESERVADOS = new Set(["p", "reel", "reels", "explore", "accounts", "stories", "tv", "direct", "about", "developer", "legal", "web", "sharer", "share", "_u", "linktr"]);

export function handleDe(texto: string): string | null {
  const re = /instagram\.com(?:\.br)?\/(?:@)?([A-Za-z0-9_.]{2,30})/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    const h = m[1].replace(/\.+$/, "").toLowerCase();
    if (!RESERVADOS.has(h) && !/^\d+$/.test(h)) return `@${h}`;
  }
  return null;
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
    .select("id,site_raw")
    .is("instagram", null).is("ig_checado_em", null).not("site_raw", "is", null).neq("tipo_site", "site_ok")
    .in("status", ["novo", "na_fila"])
    .limit(40);

  const stats = { verificados: 0, achados: 0 };
  await Promise.all((leads ?? []).map(async (l: { id: string; site_raw: string }) => {
    let ig = handleDe(l.site_raw);
    if (!ig) {
      try { ig = handleDe(await baixar(l.site_raw)); } catch { /* página fora do ar ou lenta */ }
    }
    stats.verificados++;
    if (ig) stats.achados++;
    await db.from("leads").update({ instagram: ig, ig_checado_em: new Date().toISOString() }).eq("id", l.id);
  }));

  return json(200, { ok: true, ...stats });
});

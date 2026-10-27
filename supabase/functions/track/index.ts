// track — registra que o lead abriu a página de modelos.
// Público (sem JWT). Só aceita o evento "abriu_pagina" para não deixar
// ninguém de fora mexer no funil. Repetições em 30 min são ignoradas.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  let r = "";
  let pagina = "";
  let modelo = "";
  try {
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      r = String(body.r ?? "");
      pagina = String(body.pagina ?? "").slice(0, 120);
      modelo = String(body.modelo ?? "").slice(0, 120);
    } else {
      const u = new URL(req.url);
      r = u.searchParams.get("r") ?? "";
      pagina = (u.searchParams.get("p") ?? "").slice(0, 120);
    }
  } catch { /* ignora */ }

  if (!UUID.test(r)) return new Response(null, { status: 204, headers: cors });

  // Robôs que abrem links sozinhos (verificação de segurança do Instagram/WhatsApp, buscadores)
  const ua = req.headers.get("user-agent") ?? "";
  if (/bot|crawl|spider|facebookexternalhit|meta-external|whatsapp|headless|preview|slurp|bingpreview|python|curl|wget/i.test(ua)) {
    return new Response(null, { status: 204, headers: cors });
  }

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // Ninguém recebe, lê, abre e mexe na página em menos de 30 s: isso é o verificador de links
  const { data: ultimo } = await db.from("envios").select("enviado_em").eq("lead_id", r).order("enviado_em", { ascending: false }).limit(1).maybeSingle();
  if (ultimo && Date.now() - new Date(ultimo.enviado_em).getTime() < 30_000) {
    return new Response(null, { status: 204, headers: cors });
  }

  const { data: lead } = await db.from("leads").select("id").eq("id", r).maybeSingle();
  if (!lead) return new Response(null, { status: 204, headers: cors });

  const desde = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { count } = await db
    .from("eventos")
    .select("id", { count: "exact", head: true })
    .eq("lead_id", r)
    .eq("tipo", "abriu_pagina")
    .gte("created_at", desde);

  if (!count) {
    await db.from("eventos").insert({
      lead_id: r,
      tipo: "abriu_pagina",
      meta: { pagina, modelo, ua: ua.slice(0, 200), humano: true },
    });
  }

  return new Response(null, { status: 204, headers: cors });
});

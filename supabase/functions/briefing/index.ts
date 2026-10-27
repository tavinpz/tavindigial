// briefing — recebe o formulário público do site (cliente que fechou).
// Público (sem JWT). Valida, grava em "briefings" e, se veio de um lead
// rastreado (?r=), marca no funil que ele respondeu.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const txt = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json(405, { ok: false, erro: "método não permitido" });

  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return json(400, { ok: false, erro: "corpo inválido" });

  // honeypot anti-robô: campo escondido que humano não preenche
  if (txt(b.site_empresa)) return json(200, { ok: true });

  const negocio = txt(b.negocio, 200);
  const responsavel = txt(b.responsavel, 200);
  const whatsapp = txt(b.whatsapp, 40).replace(/\D/g, "");
  if (!negocio || !responsavel || whatsapp.length < 10) {
    return json(422, { ok: false, erro: "Preencha negócio, seu nome e WhatsApp com DDD." });
  }
  if (b.aceite_termos !== true) {
    return json(422, { ok: false, erro: "É preciso aceitar os termos para continuar." });
  }

  const produto = ["site", "bio", "outro"].includes(b.produto) ? b.produto : "site";
  const r = typeof b.r === "string" && UUID.test(b.r) ? b.r : null;

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  let leadId: string | null = null;
  if (r) {
    const { data } = await db.from("leads").select("id").eq("id", r).maybeSingle();
    leadId = data?.id ?? null;
  }

  const { data: br, error } = await db
    .from("briefings")
    .insert({
      lead_id: leadId,
      produto,
      negocio,
      responsavel,
      whatsapp: whatsapp.startsWith("55") ? whatsapp : `55${whatsapp}`,
      email: txt(b.email, 200) || null,
      cidade: txt(b.cidade, 120) || null,
      endereco: txt(b.endereco, 300) || null,
      instagram: txt(b.instagram, 120) || null,
      servicos: txt(b.servicos) || null,
      horarios: txt(b.horarios, 500) || null,
      diferenciais: txt(b.diferenciais) || null,
      cores: txt(b.cores, 300) || null,
      referencias: txt(b.referencias, 1000) || null,
      modelo_escolhido: txt(b.modelo_escolhido, 200) || null,
      observacoes: txt(b.observacoes) || null,
      aceite_termos: true,
    })
    .select("id")
    .single();

  if (error) return json(500, { ok: false, erro: "Não foi possível salvar agora. Tente de novo." });

  if (leadId) {
    await db.from("eventos").insert({ lead_id: leadId, tipo: "respondeu", meta: { briefing_id: br.id } });
  }

  return json(200, { ok: true, id: br.id });
});

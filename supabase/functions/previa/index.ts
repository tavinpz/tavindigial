// previa — resolve o link curto da prévia (/p/<nome>-<código>) para os dados públicos do negócio.
// Público (sem JWT): devolve só o que já está no Google (nome, categoria, bairro, nota, avaliações)
// e o id usado para registrar que a pessoa abriu.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  const body = await req.json().catch(() => ({}));
  const c = String(body.c ?? "").toLowerCase();
  if (!/^[0-9a-f]{8}$/.test(c)) return json(400, { ok: false });

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  // o código é o começo do id do lead: procura no intervalo de ids que começam com ele
  const { data } = await db.from("leads")
    .select("id,nome,nicho,categoria,bairro,cidade,endereco,instagram,whatsapp,nota,avaliacoes,status")
    .gte("id", `${c}-0000-0000-0000-000000000000`).lte("id", `${c}-ffff-ffff-ffff-ffffffffffff`)
    .limit(2);
  if (!data || data.length !== 1 || ["nao_contatar", "arquivado"].includes(data[0].status)) return json(404, { ok: false });
  const l = data[0];
  // a resposta do lead vai para o mesmo WhatsApp que falou com ele (Web ou App)
  const [{ data: env }, { data: cfg }] = await Promise.all([
    db.from("envios").select("origem").eq("lead_id", l.id).eq("canal", "whatsapp").order("enviado_em", { ascending: false }).limit(1).maybeSingle(),
    db.from("app_config").select("key,value").in("key", ["wa_numero_web", "wa_numero_app"]),
  ]);
  const num = Object.fromEntries((cfg ?? []).map((x: { key: string; value: string }) => [x.key, x.value]));
  const wa = (env?.origem === "app" && num.wa_numero_app) ? num.wa_numero_app : (num.wa_numero_web || null);
  return json(200, {
    ok: true, r: l.id, nome: l.nome, nicho: l.nicho, categoria: l.categoria, bairro: l.bairro, cidade: l.cidade,
    endereco: l.endereco, instagram: l.instagram, telefone: l.whatsapp, nota: l.nota, avaliacoes: l.avaliacoes, wa,
  });
});

// publicar-instagram — publica no @tavindigital os carrosséis agendados que já passaram do horário.
// Chamado a cada 15 min pelo pg_cron (header x-ingest-token). O painel também chama com o login
// do dono para testar a conexão ({ verificar: true }) ou publicar na hora ({ id }).
// Token e ID da conta ficam em app_config (instagram_token, instagram_user_id), nunca no código.
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
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Conta = { token: string; userId: string; host: string };

async function conta(db: SupabaseClient): Promise<Conta | null> {
  const { data } = await db.from("app_config").select("key,value").in("key", ["instagram_token", "instagram_user_id"]);
  const m = Object.fromEntries((data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]));
  if (!m.instagram_token || !m.instagram_user_id) return null;
  // Token do "Login do Instagram" começa com IG; token de Página do Facebook (EAA...) usa graph.facebook.com
  const host = m.instagram_token.startsWith("IG") ? "graph.instagram.com" : "graph.facebook.com";
  return { token: m.instagram_token, userId: m.instagram_user_id, host };
}

async function graph(c: Conta, caminho: string, params: Record<string, string>, metodo = "POST") {
  const url = new URL(`https://${c.host}/${VERSAO}/${caminho}`);
  const corpo = new URLSearchParams({ ...params, access_token: c.token });
  const res = metodo === "GET"
    ? await fetch(`${url}?${corpo}`)
    : await fetch(url, { method: "POST", body: corpo });
  const d = await res.json().catch(() => ({}));
  if (!res.ok || d.error) throw new Error(d.error?.message || `HTTP ${res.status}`);
  return d;
}

// Espera o container ficar pronto (o Instagram baixa e processa as imagens)
async function aguardar(c: Conta, id: string) {
  for (let i = 0; i < 12; i++) {
    const d = await graph(c, id, { fields: "status_code" }, "GET");
    if (d.status_code === "FINISHED") return
    if (d.status_code === "ERROR" || d.status_code === "EXPIRED") throw new Error(`container ${d.status_code}`);
    await espera(2500);
  }
  throw new Error("o Instagram demorou demais para processar as imagens");
}

async function publicar(c: Conta, imagens: string[], legenda: string) {
  if (imagens.length === 1) {
    const unico = await graph(c, `${c.userId}/media`, { image_url: imagens[0], caption: legenda });
    await aguardar(c, unico.id);
    return (await graph(c, `${c.userId}/media_publish`, { creation_id: unico.id })).id as string;
  }
  const filhos: string[] = [];
  for (const url of imagens) {
    const d = await graph(c, `${c.userId}/media`, { image_url: url, is_carousel_item: "true" });
    filhos.push(d.id);
  }
  for (const f of filhos) await aguardar(c, f);
  const carrossel = await graph(c, `${c.userId}/media`, { media_type: "CAROUSEL", children: filhos.join(","), caption: legenda });
  await aguardar(c, carrossel.id);
  return (await graph(c, `${c.userId}/media_publish`, { creation_id: carrossel.id })).id as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json(405, { ok: false });

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const body = await req.json().catch(() => ({}));

  // Quem pode chamar: o cron (token de ingestão) ou o dono logado no painel
  let autorizado = false;
  const { data: cfg } = await db.from("app_config").select("value").eq("key", "ingest_token").maybeSingle();
  if (cfg && req.headers.get("x-ingest-token") === cfg.value) autorizado = true;
  const auth = req.headers.get("authorization") ?? "";
  if (!autorizado && auth.startsWith("Bearer ")) {
    const usuario = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data } = await usuario.rpc("is_admin");
    autorizado = data === true;
  }
  if (!autorizado) return json(401, { ok: false, erro: "não autorizado" });

  const c = await conta(db);
  if (!c) return json(200, { ok: false, erro: "Instagram ainda não conectado no painel" });

  if (body.verificar) {
    try {
      const d = await graph(c, c.userId, { fields: "username" }, "GET");
      return json(200, { ok: true, username: d.username });
    } catch (e) {
      return json(200, { ok: false, erro: (e as Error).message });
    }
  }

  // Um carrossel por chamada: o vencido mais antigo (ou o pedido pelo painel)
  let q = db.from("conteudo").select("id,legenda,imagens").eq("status", "agendado");
  // Atrasado mais de 6 h (ex.: Instagram estava desconectado) não sai sozinho: evita postar vários de uma vez
  const seisHoras = new Date(Date.now() - 6 * 3600 * 1000).toISOString();
  q = body.id ? q.eq("id", body.id) : q.lte("agendado_para", new Date().toISOString()).gte("agendado_para", seisHoras);
  const { data: item } = await q.order("agendado_para", { ascending: true }).limit(1).maybeSingle();
  if (!item) return json(200, { ok: true, publicado: null });

  // Trava contra publicação dupla se duas chamadas chegarem juntas
  const { data: travado } = await db.from("conteudo").update({ status: "publicando" })
    .eq("id", item.id).eq("status", "agendado").select("id").maybeSingle();
  if (!travado) return json(200, { ok: true, publicado: null });

  try {
    if (!item.imagens?.length) throw new Error("sem imagens: abra o carrossel no painel e clique em Agendar");
    const mediaId = await publicar(c, item.imagens, item.legenda ?? "");
    await db.from("conteudo").update({ status: "publicado", publicado_em: new Date().toISOString(), ig_media_id: mediaId, erro: null }).eq("id", item.id);
    return json(200, { ok: true, publicado: item.id, ig_media_id: mediaId });
  } catch (e) {
    await db.from("conteudo").update({ status: "erro", erro: (e as Error).message.slice(0, 500) }).eq("id", item.id);
    return json(200, { ok: false, erro: (e as Error).message });
  }
});

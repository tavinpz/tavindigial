// publicar-reels — publica os vídeos do painel (aba Vídeos) como Reels no Instagram do canal.
// O Instagram processa o vídeo antes de publicar, então são 2 passos:
//   1) cria o "container" com a URL pública do vídeo  -> ig_status = 'processando'
//   2) quando o container fica FINISHED, publica         -> ig_status = 'publicado'
// Chamado a cada 5 min pelo pg_cron (x-ingest-token) e pelo painel com o login do dono:
//   { verificar: true, canal }  testa a conexão
//   { id }                      publica agora esse vídeo
// Token da conta: app_config ig_<canal>_token / ig_<canal>_user_id (Tavin Digital: instagram_token), nunca no código.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

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

const salvar = (db: SupabaseClient, key: string, value: string) =>
  db.from("app_config").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

async function conta(db: SupabaseClient, canal: string): Promise<Conta | null> {
  // A Tavin Digital usa a conta principal do painel (a mesma dos carrosséis); os outros canais têm a sua
  const principal = canal === "tavin-digital";
  const kt = principal ? "instagram_token" : `ig_${canal}_token`, ku = principal ? "instagram_user_id" : `ig_${canal}_user_id`;
  const { data } = await db.from("app_config").select("key,value,updated_at").in("key", [kt, ku]);
  const linhas = (data ?? []) as { key: string; value: string; updated_at: string }[];
  const m = Object.fromEntries(linhas.map((r) => [r.key, r.value]));
  if (!m[kt]) return null;
  const host = m[kt].startsWith("IG") ? "graph.instagram.com" : "graph.facebook.com";
  const c: Conta = { token: m[kt], userId: m[ku] ?? "", host };
  if (host === "graph.instagram.com") {
    if (!c.userId) {
      try {
        const me = await (await fetch(`https://graph.instagram.com/${VERSAO}/me?fields=user_id,username&access_token=${c.token}`)).json();
        if (me.user_id) { c.userId = String(me.user_id); await salvar(db, ku, c.userId); }
      } catch { /* segue */ }
    }
    // token de 60 dias: renova sozinho a cada 15 dias
    const salvoEm = new Date(linhas.find((r) => r.key === kt)?.updated_at ?? 0).getTime();
    if (Date.now() - salvoEm > 15 * 86400000) {
      try {
        const r = await (await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${c.token}`)).json();
        if (r.access_token) { c.token = r.access_token; await salvar(db, kt, r.access_token); }
      } catch { /* tenta na próxima */ }
    }
  }
  return c.userId ? c : null;
}

async function graph(c: Conta, caminho: string, params: Record<string, string>, metodo = "POST") {
  const url = new URL(`https://${c.host}/${VERSAO}/${caminho}`);
  const corpo = new URLSearchParams({ ...params, access_token: c.token });
  const res = metodo === "GET" ? await fetch(`${url}?${corpo}`) : await fetch(url, { method: "POST", body: corpo });
  const d = await res.json().catch(() => ({}));
  if (!res.ok || d.error) throw new Error(d.error?.error_user_msg || d.error?.message || `HTTP ${res.status}`);
  return d;
}

type Video = { id: string; canal: string; video_url: string | null; capa_url: string | null; ig_legenda: string | null; ig_container_id: string | null;
  ig_feed?: boolean; ig_story?: boolean; ig_story_status?: string; ig_story_container?: string | null };

async function criarContainer(db: SupabaseClient, c: Conta, v: Video) {
  if (!v.video_url) throw new Error("vídeo sem arquivo no painel");
  const d = await graph(c, `${c.userId}/media`, {
    media_type: "REELS", video_url: v.video_url, caption: v.ig_legenda ?? "", share_to_feed: v.ig_feed === false ? "false" : "true", // false = só na aba Reels, fora do feed
    ...(v.capa_url ? { cover_url: v.capa_url } : {}),
  });
  await db.from("videos").update({ ig_status: "processando", ig_container_id: d.id, ig_erro: null }).eq("id", v.id);
  return d.id as string;
}

// Stories: o mesmo vídeo vai também para os Stories logo depois do Reel (mesmo fluxo de 2 passos)
async function criarStory(db: SupabaseClient, c: Conta, v: Video) {
  try {
    const d = await graph(c, `${c.userId}/media`, { media_type: "STORIES", video_url: v.video_url ?? "" });
    await db.from("videos").update({ ig_story_status: "processando", ig_story_container: d.id, ig_story_erro: null }).eq("id", v.id);
  } catch (e) {
    await db.from("videos").update({ ig_story_status: "erro", ig_story_erro: (e as Error).message.slice(0, 500) }).eq("id", v.id);
  }
}
async function tentarStory(db: SupabaseClient, c: Conta, v: Video) {
  const st = await graph(c, v.ig_story_container!, { fields: "status_code,status" }, "GET");
  if (st.status_code === "ERROR" || st.status_code === "EXPIRED") throw new Error(`o Instagram recusou o Stories (${st.status || st.status_code})`);
  if (st.status_code !== "FINISHED") return false;
  const { data: trava } = await db.from("videos").update({ ig_story_status: "publicado", ig_story_postado_em: new Date().toISOString() })
    .eq("id", v.id).eq("ig_story_status", "processando").select("id").maybeSingle();
  if (!trava) return true;
  try {
    const pub = await graph(c, `${c.userId}/media_publish`, { creation_id: v.ig_story_container! });
    await db.from("videos").update({ ig_story_media_id: pub.id }).eq("id", v.id);
  } catch (e) {
    await db.from("videos").update({ ig_story_status: "processando", ig_story_postado_em: null }).eq("id", v.id);
    throw e;
  }
  return true;
}

// devolve true se publicou, false se ainda está processando
async function tentarPublicar(db: SupabaseClient, c: Conta, v: Video, container: string) {
  const st = await graph(c, container, { fields: "status_code,status" }, "GET");
  if (st.status_code === "ERROR" || st.status_code === "EXPIRED") throw new Error(`o Instagram recusou o vídeo (${st.status || st.status_code})`);
  if (st.status_code !== "FINISHED") return false;
  // trava contra publicar duas vezes
  const { data: trava } = await db.from("videos").update({ ig_status: "publicado", ig_postado_em: new Date().toISOString() })
    .eq("id", v.id).eq("ig_status", "processando").select("id").maybeSingle();
  if (!trava) return true;
  try {
    const pub = await graph(c, `${c.userId}/media_publish`, { creation_id: container });
    await db.from("videos").update({ ig_media_id: pub.id, ig_erro: null }).eq("id", v.id);
    if (v.ig_story && (v.ig_story_status ?? "pendente") === "pendente") await criarStory(db, c, v).catch(() => {});
  } catch (e) {
    await db.from("videos").update({ ig_status: "processando", ig_postado_em: null }).eq("id", v.id);
    throw e;
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json(405, { ok: false });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const body = await req.json().catch(() => ({}));

  let autorizado = false;
  const { data: cfg } = await db.from("app_config").select("value").eq("key", "ingest_token").maybeSingle();
  if (cfg && req.headers.get("x-ingest-token") === cfg.value) autorizado = true;
  const auth = req.headers.get("authorization") ?? "";
  if (!autorizado && auth.startsWith("Bearer ")) {
    const u = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data } = await u.rpc("is_admin");
    autorizado = data === true;
  }
  if (!autorizado) return json(401, { ok: false, erro: "não autorizado" });

  if (body.verificar) {
    const c = await conta(db, body.canal || "concrete-atlas");
    if (!c) return json(200, { ok: false, erro: "Instagram do canal ainda não conectado" });
    try {
      const d = await graph(c, c.userId, { fields: "username" }, "GET");
      try { await graph(c, `${c.userId}/content_publishing_limit`, { fields: "quota_usage" }, "GET"); }
      catch (e) { return json(200, { ok: false, username: d.username, erro: `Conectado como @${d.username}, mas sem permissão de publicar: ${(e as Error).message}` }); }
      return json(200, { ok: true, username: d.username });
    } catch (e) { return json(200, { ok: false, erro: (e as Error).message }); }
  }

  const campos = "id,canal,video_url,capa_url,ig_legenda,ig_container_id,ig_feed,ig_story,ig_story_status,ig_story_container";
  const resultado: unknown[] = [];

  // 1) publicar agora (painel)
  if (body.id) {
    const { data: v } = await db.from("videos").select(campos).eq("id", body.id).maybeSingle();
    if (!v) return json(404, { ok: false, erro: "vídeo não encontrado" });
    const c = await conta(db, v.canal);
    if (!c) return json(200, { ok: false, erro: "Instagram do canal ainda não conectado" });
    try {
      const container = v.ig_container_id && body.reaproveitar ? v.ig_container_id : await criarContainer(db, c, v);
      for (let i = 0; i < 16; i++) {          // até ~80 s esperando o Instagram processar
        if (await tentarPublicar(db, c, v, container)) return json(200, { ok: true, publicado: v.id });
        await espera(5000);
      }
      return json(200, { ok: true, processando: v.id, aviso: "O Instagram ainda está processando o vídeo; ele sai sozinho em alguns minutos." });
    } catch (e) {
      await db.from("videos").update({ ig_status: "erro", ig_erro: (e as Error).message.slice(0, 500) }).eq("id", v.id);
      return json(200, { ok: false, erro: (e as Error).message });
    }
  }

  // 2) cron: termina os que estavam processando
  const { data: proc } = await db.from("videos").select(campos).eq("ig_status", "processando").limit(5);
  for (const v of proc ?? []) {
    const c = await conta(db, v.canal); if (!c || !v.ig_container_id) continue;
    try { resultado.push({ id: v.id, publicado: await tentarPublicar(db, c, v, v.ig_container_id) }); }
    catch (e) { await db.from("videos").update({ ig_status: "erro", ig_erro: (e as Error).message.slice(0, 500) }).eq("id", v.id); }
  }

  // 2b) cron: termina os Stories que estavam processando
  const { data: stp } = await db.from("videos").select(campos).eq("ig_story_status", "processando").not("ig_story_container", "is", null).limit(5);
  for (const v of stp ?? []) {
    const c = await conta(db, v.canal); if (!c) continue;
    try { resultado.push({ id: v.id, story: await tentarStory(db, c, v) }); }
    catch (e) { await db.from("videos").update({ ig_story_status: "erro", ig_story_erro: (e as Error).message.slice(0, 500) }).eq("id", v.id); }
  }

  // 3) cron: inicia o agendado vencido mais antigo (no máximo 1 por rodada; atrasado > 6 h não sai sozinho)
  const seis = new Date(Date.now() - 6 * 3600 * 1000).toISOString();
  const { data: ag } = await db.from("videos").select(campos).eq("ig_status", "agendado")
    .lte("ig_agendado_para", new Date().toISOString()).gte("ig_agendado_para", seis)
    .order("ig_agendado_para", { ascending: true }).limit(1);
  for (const v of ag ?? []) {
    const c = await conta(db, v.canal); if (!c) continue;
    try {
      const container = await criarContainer(db, c, v);
      for (let i = 0; i < 12; i++) {
        if (await tentarPublicar(db, c, v, container)) break;
        await espera(5000);
      }
      resultado.push({ id: v.id, iniciado: true });
    } catch (e) {
      await db.from("videos").update({ ig_status: "erro", ig_erro: (e as Error).message.slice(0, 500) }).eq("id", v.id);
    }
  }
  return json(200, { ok: true, resultado });
});

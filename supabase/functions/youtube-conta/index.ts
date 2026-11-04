// youtube-conta — a conta do YouTube de cada canal, ligada pela conta Google (OAuth).
//   GET  ?code&state             → volta do Google: guarda o acesso do canal e mostra "conectado"
//   POST { acao: "processar" }   → (pg_cron a cada 5 min) sobe no YouTube o que foi programado pelo painel,
//                                  com a data de publicação (o YouTube solta sozinho no horário);
//                                  muda o horário de quem já subiu e tira do ar programado quando cancela
//   POST { acao: "testar", canal } → confere a conta ligada
// O app do Google (client id e secret) e o acesso de cada canal ficam em app_config; nada disso vai para o navegador.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info, x-ingest-token",
};
const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const REDIRECT = "https://vvlzverpxojrecxysmhm.supabase.co/functions/v1/youtube-conta";
const PAINEL = "https://tavindigital.online/painel";
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

function pagina(ok: boolean, titulo: string, texto: string) {
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(titulo)}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#F3EFF6;font:16px/1.5 system-ui,sans-serif;color:#1D1622;padding:16px}
main{max-width:420px;background:#fff;border-radius:18px;padding:28px 24px;box-shadow:0 20px 50px -30px rgba(30,10,40,.4)}
h1{font-size:21px;margin:0 0 8px}p{margin:0 0 18px;color:#5B5163}a{display:inline-block;background:${ok ? "#B600F6" : "#1D1622"};color:#fff;text-decoration:none;padding:10px 18px;border-radius:999px;font-weight:600}</style></head>
<body><main><h1>${esc(titulo)}</h1><p>${esc(texto)}</p><a href="${PAINEL}">Voltar ao painel</a></main>
${ok ? "<script>try{window.opener&&window.opener.postMessage('youtube-conectado','*')}catch(e){}</script>" : ""}</body></html>`;
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

async function cfg(db: SupabaseClient, keys: string[]) {
  const { data } = await db.from("app_config").select("key,value").in("key", keys);
  return Object.fromEntries(((data ?? []) as { key: string; value: string }[]).map((r) => [r.key, r.value])) as Record<string, string>;
}
async function guardar(db: SupabaseClient, key: string, value: string) {
  await db.from("app_config").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
}

// acesso de 1 hora a partir do refresh token guardado do canal
export async function tokenDe(db: SupabaseClient, canal: string) {
  const m = await cfg(db, ["yt_oauth_client_id", "yt_oauth_client_secret", `yt_${canal}_refresh`]);
  if (!m[`yt_${canal}_refresh`]) throw new Error("YouTube do canal não conectado");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: m.yt_oauth_client_id, client_secret: m.yt_oauth_client_secret, refresh_token: m[`yt_${canal}_refresh`], grant_type: "refresh_token" }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.access_token) throw new Error(d.error === "invalid_grant" ? "acesso do YouTube expirou: conecte de novo em Integrações" : (d.error_description || d.error || `HTTP ${r.status}`));
  return d.access_token as string;
}

async function google(token: string, url: string, init: RequestInit = {}) {
  const r = await fetch(url, { ...init, headers: { Authorization: `Bearer ${token}`, ...(init.headers || {}) } });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.error) {
    const e = new Error(d.error?.errors?.[0]?.reason ? `${d.error.errors[0].reason}: ${d.error.message}` : d.error?.message || `HTTP ${r.status}`);
    (e as Error & { motivo?: string }).motivo = d.error?.errors?.[0]?.reason;
    throw e;
  }
  return d;
}

// volta do Google depois de autorizar
async function retorno(db: SupabaseClient, url: URL) {
  const code = url.searchParams.get("code"), state = url.searchParams.get("state") ?? "";
  if (url.searchParams.get("error")) return pagina(false, "YouTube não conectado", "A autorização foi cancelada no Google. Tente de novo pelo painel.");
  const { data: est } = await db.from("yt_oauth_estado").select("canal,criado_em").eq("state", state).maybeSingle();
  if (!code || !est || Date.now() - new Date(est.criado_em).getTime() > 30 * 60000) return pagina(false, "Link vencido", "Abra de novo pelo painel: Integrações → YouTube → Conectar conta.");
  await db.from("yt_oauth_estado").delete().eq("state", state);
  const canal = est.canal as string;
  const m = await cfg(db, ["yt_oauth_client_id", "yt_oauth_client_secret", `yt_${canal}_ref`]);
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: m.yt_oauth_client_id, client_secret: m.yt_oauth_client_secret, redirect_uri: REDIRECT, grant_type: "authorization_code" }),
  });
  const t = await r.json().catch(() => ({}));
  if (!r.ok || !t.access_token) return pagina(false, "Não deu para conectar", `O Google respondeu: ${t.error_description || t.error || r.status}`);
  if (!t.refresh_token) return pagina(false, "Falta permissão", "O Google não mandou o acesso permanente. Em myaccount.google.com/permissions, remova o app e conecte de novo.");
  let ch: Record<string, any> | undefined;
  try { ch = (await google(t.access_token, "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true")).items?.[0]; } catch { /* sem canal */ }
  if (!ch) return pagina(false, "Essa conta não tem canal", "A conta Google escolhida não tem canal no YouTube. Conecte com a conta (ou a conta de marca) do canal.");
  await guardar(db, `yt_${canal}_refresh`, t.refresh_token);
  await guardar(db, `yt_${canal}_channel_id`, ch.id);
  await guardar(db, `yt_${canal}_conta`, ch.snippet?.title ?? ch.id);
  if (!m[`yt_${canal}_ref`]) await guardar(db, `yt_${canal}_ref`, ch.snippet?.customUrl || ch.id);
  const { data: c } = await db.from("canais").select("youtube").eq("id", canal).maybeSingle();
  if (c && !c.youtube && ch.snippet?.customUrl) await db.from("canais").update({ youtube: ch.snippet.customUrl }).eq("id", canal);
  await db.from("metricas_cache").delete().eq("canal", canal);
  return pagina(true, "YouTube conectado", `${ch.snippet?.title ?? "Canal"} está ligado ao painel. Agora o painel sobe e programa os vídeos e traz as métricas completas. Pode fechar esta aba.`);
}

// sobe um vídeo com a data de publicação
async function subir(db: SupabaseClient, v: Record<string, any>) {
  const token = await tokenDe(db, v.canal);
  const { data: c } = await db.from("canais").select("yt_sintetico").eq("id", v.canal).maybeSingle();
  const quando = v.yt_programado_para ? new Date(v.yt_programado_para) : null;
  const futuro = quando && quando.getTime() > Date.now() + 5 * 60000;
  let tags: string[] = [], soma = 0;
  for (const t of String(v.yt_tags || "").split(",").map((x) => x.trim()).filter(Boolean)) { if (soma + t.length + 2 > 480) break; tags.push(t); soma += t.length + 2; }
  const meta = {
    snippet: { title: String(v.yt_titulo || v.titulo || "Vídeo").slice(0, 100), description: String(v.yt_descricao || "").slice(0, 4900), tags, categoryId: "22" },
    status: { privacyStatus: futuro ? "private" : "public", ...(futuro ? { publishAt: quando!.toISOString() } : {}), selfDeclaredMadeForKids: false, containsSyntheticMedia: c?.yt_sintetico ?? true },
  };
  const arq = await fetch(v.video_url);
  if (!arq.ok) throw new Error(`não consegui baixar o vídeo (${arq.status})`);
  const bytes = new Uint8Array(await arq.arrayBuffer());
  const ini = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8", "X-Upload-Content-Length": String(bytes.length), "X-Upload-Content-Type": "video/mp4" },
    body: JSON.stringify(meta),
  });
  if (!ini.ok) { const d = await ini.json().catch(() => ({})); const e = new Error(d.error?.message || `HTTP ${ini.status}`); (e as Error & { motivo?: string }).motivo = d.error?.errors?.[0]?.reason; throw e; }
  const destino = ini.headers.get("location");
  if (!destino) throw new Error("o YouTube não abriu o envio");
  const fim = await fetch(destino, { method: "PUT", headers: { "Content-Type": "video/mp4" }, body: bytes });
  const d = await fim.json().catch(() => ({}));
  if (!fim.ok || !d.id) throw new Error(d.error?.message || `envio falhou (${fim.status})`);
  await db.from("videos").update({
    yt_id: d.id, yt_link: `https://youtube.com/shorts/${d.id}`, yt_erro: null, yt_tentativas: 0,
    ...(futuro ? { yt_status: "programado" } : { yt_status: "postado", yt_postado_em: new Date().toISOString() }),
  }).eq("id", v.id);
  return futuro ? `programado ${quando!.toISOString()}` : "publicado agora";
}

// muda o horário (ou tira do ar) de um vídeo que já subiu
async function mudarStatus(db: SupabaseClient, v: Record<string, any>, cancelar: boolean) {
  const token = await tokenDe(db, v.canal);
  const quando = v.yt_programado_para ? new Date(v.yt_programado_para) : null;
  const futuro = !cancelar && quando && quando.getTime() > Date.now() + 5 * 60000;
  const status = cancelar ? { privacyStatus: "private", selfDeclaredMadeForKids: false } : futuro ? { privacyStatus: "private", publishAt: quando!.toISOString(), selfDeclaredMadeForKids: false } : { privacyStatus: "public", selfDeclaredMadeForKids: false };
  await google(token, "https://www.googleapis.com/youtube/v3/videos?part=status", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: v.yt_id, status }) });
  await db.from("videos").update(cancelar ? { yt_status: "pendente", yt_programado_para: null, yt_erro: null } : futuro ? { yt_status: "programado", yt_erro: null } : { yt_status: "postado", yt_postado_em: new Date().toISOString(), yt_erro: null }).eq("id", v.id);
  return cancelar ? "tirado do ar (privado)" : "horário mudado";
}

async function processar(db: SupabaseClient) {
  const { data } = await db.from("videos").select("id,canal,titulo,yt_titulo,yt_descricao,yt_tags,yt_programado_para,yt_status,yt_id,yt_tentativas,video_url")
    .in("yt_status", ["agendado", "cancelar"]).order("yt_programado_para", { ascending: true, nullsFirst: false }).limit(3);
  const r: Record<string, string> = {};
  for (const v of data ?? []) {
    try {
      if (v.yt_status === "cancelar") r[v.id] = v.yt_id ? await mudarStatus(db, v, true) : (await db.from("videos").update({ yt_status: "pendente", yt_programado_para: null }).eq("id", v.id), "cancelado");
      else r[v.id] = v.yt_id ? await mudarStatus(db, v, false) : await subir(db, v);
    } catch (e) {
      const msg = (e as Error).message, motivo = (e as Error & { motivo?: string }).motivo ?? "";
      const cota = /quota|uploadLimitExceeded|rateLimit/i.test(motivo + msg);
      const n = (v.yt_tentativas || 0) + (cota ? 0 : 1);
      await db.from("videos").update({ yt_erro: cota ? `cota do YouTube cheia hoje, tento de novo depois (${msg})` : msg, yt_tentativas: n, ...(n >= 3 ? { yt_status: "erro" } : {}) }).eq("id", v.id);
      r[v.id] = `erro: ${msg}`;
      if (cota) break;
    }
  }
  return r;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const url = new URL(req.url);
  if (req.method === "GET") {
    if (url.searchParams.has("code") || url.searchParams.has("error")) return retorno(db, url);
    return pagina(false, "YouTube", "Abra pelo painel: Integrações → YouTube → Conectar conta.");
  }

  let ok = false;
  const { data: tk } = await db.from("app_config").select("value").eq("key", "ingest_token").maybeSingle();
  if (tk && req.headers.get("x-ingest-token") === tk.value) ok = true;
  const auth = req.headers.get("authorization") ?? "";
  if (!ok && auth.startsWith("Bearer ")) {
    const u = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    ok = (await u.rpc("is_admin")).data === true;
  }
  if (!ok) return json(401, { ok: false, erro: "não autorizado" });

  const body = await req.json().catch(() => ({}));
  if (body.acao === "processar") return json(200, { ok: true, videos: await processar(db) });
  if (body.acao === "testar") {
    const canal = String(body.canal || "");
    if (!/^[a-z0-9-]+$/.test(canal)) return json(400, { ok: false, erro: "canal inválido" });
    try {
      const token = await tokenDe(db, canal);
      const ch = (await google(token, "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true")).items?.[0];
      return json(200, { ok: true, nome: ch?.snippet?.title, inscritos: ch?.statistics?.subscriberCount, videos: ch?.statistics?.videoCount });
    } catch (e) { return json(200, { ok: false, erro: (e as Error).message }); }
  }
  return json(400, { ok: false, erro: "acao desconhecida" });
});

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

// avisos mostrados no painel
const AVISO_COTA_APP = "a cota diária do Google acabou (vale para todos os canais); volta às 5h e sobe sozinho";
const AVISO_LIMITE_CANAL = "o canal chegou no limite de envios do YouTube; sobe sozinho quando liberar";

// o domínio das funções não mostra página HTML (vira texto): volta para o painel com o resultado na URL
function pagina(ok: boolean, titulo: string, texto: string, canal = "") {
  const q = new URLSearchParams({ yt: ok ? "ok" : "erro", msg: `${titulo}: ${texto}`, ...(canal ? { canal } : {}) });
  return new Response(null, { status: 302, headers: { Location: `${PAINEL}?${q}` } });
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
  const m = await cfg(db, ["yt_oauth_client_id", "yt_oauth_client_secret", `yt_${canal}_ref`, `yt_${canal}_channel_id`]);
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: m.yt_oauth_client_id, client_secret: m.yt_oauth_client_secret, redirect_uri: REDIRECT, grant_type: "authorization_code" }),
  });
  const t = await r.json().catch(() => ({}));
  if (!r.ok || !t.access_token) return pagina(false, "Não deu para conectar", `O Google respondeu: ${t.error_description || t.error || r.status}`, canal);
  if (!t.refresh_token) return pagina(false, "Falta permissão", "O Google não mandou o acesso permanente. Em myaccount.google.com/permissions, remova o app e conecte de novo.", canal);
  let ch: Record<string, any> | undefined;
  try { ch = (await google(t.access_token, "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true")).items?.[0]; } catch { /* sem canal */ }
  if (!ch) return pagina(false, "Essa conta não tem canal", "A conta Google escolhida não tem canal no YouTube. Conecte com a conta (ou a conta de marca) do canal.", canal);
  // conta com mais de um canal: se escolheu um canal diferente do que este canal do painel já usa, não liga
  if (m[`yt_${canal}_channel_id`] && m[`yt_${canal}_channel_id`] !== ch.id) return pagina(false, "Canal errado", `Você escolheu "${ch.snippet?.title ?? ch.id}", que não é o canal deste painel. Clique em Conectar de novo e, no Google, escolha o canal certo.`, canal);
  await guardar(db, `yt_${canal}_refresh`, t.refresh_token);
  await guardar(db, `yt_${canal}_escopos`, String(t.scope ?? ""));
  await guardar(db, `yt_${canal}_channel_id`, ch.id);
  await guardar(db, `yt_${canal}_conta`, ch.snippet?.title ?? ch.id);
  if (!m[`yt_${canal}_ref`]) await guardar(db, `yt_${canal}_ref`, ch.snippet?.customUrl || ch.id);
  const { data: c } = await db.from("canais").select("youtube").eq("id", canal).maybeSingle();
  if (c && !c.youtube && ch.snippet?.customUrl) await db.from("canais").update({ youtube: ch.snippet.customUrl }).eq("id", canal);
  await db.from("metricas_cache").delete().eq("canal", canal);
  return pagina(true, "YouTube conectado", `${ch.snippet?.title ?? "Canal"} ligado: o painel sobe e programa os vídeos e traz as métricas completas.`, canal);
}

// quantos vídeos o canal subiu nas últimas 24 h (o YouTube limita envios por dia em cada canal)
async function enviados24h(token: string) {
  const ch = (await google(token, "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true")).items?.[0];
  const up = ch?.contentDetails?.relatedPlaylists?.uploads;
  if (!up) return 0;
  const pl = await google(token, `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${up}`);
  const desde = Date.now() - 24 * 3600000;
  return ((pl.items ?? []) as { snippet?: { publishedAt?: string } }[]).filter((i) => i.snippet?.publishedAt && new Date(i.snippet.publishedAt).getTime() > desde).length;
}

// horário que já passou (vídeo atrasado por cota/limite): vai para o mesmo horário no próximo dia possível
function proximoMesmoHorario(quando: Date) {
  const d = new Date(quando);
  while (d.getTime() <= Date.now() + 15 * 60000) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

// vídeo deitado / longo (mais de 3 min): link normal e capa própria; curto vai como Short
const ehLongo = (v: Record<string, any>) => v.formato === "horizontal" || (v.formato !== "vertical" && Number(v.duracao) > 180);

// capa 1 do vídeo longo (canal precisa ter o telefone verificado); se falhar, o vídeo fica com a capa automática
async function porCapa(token: string, v: Record<string, any>, id: string) {
  const url = (Array.isArray(v.capas) && v.capas[0]?.url) || v.capa_url;
  if (!url) return "";
  try {
    const img = await fetch(url);
    if (!img.ok) return "capa não baixou";
    const r = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${id}`, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": img.headers.get("content-type") || "image/jpeg" }, body: new Uint8Array(await img.arrayBuffer()),
    });
    if (!r.ok) { const d = await r.json().catch(() => ({})); return `capa não entrou: ${d.error?.message || r.status}`; }
    return "";
  } catch (e) { return `capa não entrou: ${(e as Error).message}`; }
}

// partes da versão em alta, na ordem, como um fluxo só (sem carregar na memória)
async function partesHD(db: SupabaseClient, id: string) {
  const { data } = await db.storage.from("videos").list(`hd/${id}`, { limit: 100, sortBy: { column: "name", order: "asc" } });
  const ps = ((data ?? []) as { name: string; metadata?: { size?: number } }[]).filter((f) => /^part_\d+$/.test(f.name)).sort((x, y) => x.name.localeCompare(y.name));
  if (!ps.length) return null;
  const base = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/videos/hd/${id}/`;
  const total = ps.reduce((t, f) => t + Number(f.metadata?.size || 0), 0);
  let i = 0, leitor: ReadableStreamDefaultReader<Uint8Array> | null = null;
  const corpo = new ReadableStream<Uint8Array>({
    async pull(ctl) {
      while (true) {
        if (!leitor) {
          if (i >= ps.length) { ctl.close(); return; }
          const r = await fetch(base + ps[i++].name);
          if (!r.ok || !r.body) { ctl.error(new Error(`parte ${i - 1} não baixou (${r.status})`)); return; }
          leitor = r.body.getReader();
        }
        const { done, value } = await leitor.read();
        if (done) { leitor = null; continue; }
        ctl.enqueue(value); return;
      }
    },
  });
  return { corpo, total };
}

// sobe um vídeo: com data (o YouTube publica no horário) ou, em "rascunho", privado e sem data para programar depois
async function subir(db: SupabaseClient, v: Record<string, any>, rascunho = false) {
  const token = await tokenDe(db, v.canal);
  const { data: c } = await db.from("canais").select("yt_sintetico").eq("id", v.canal).maybeSingle();
  let quando = v.yt_programado_para ? new Date(v.yt_programado_para) : null;
  // perdeu o horário (passou mais de 10 min): não publica de surpresa, remarca para o mesmo horário do próximo dia
  let remarcado = false;
  if (!rascunho && quando && quando.getTime() < Date.now() - 10 * 60000) { quando = proximoMesmoHorario(quando); remarcado = true; }
  const futuro = !rascunho && quando && quando.getTime() > Date.now() + 5 * 60000;
  const longo = ehLongo(v);
  let tags: string[] = [], soma = 0;
  for (const t of String(v.yt_tags || "").split(",").map((x) => x.trim()).filter(Boolean)) { if (soma + t.length + 2 > 480) break; tags.push(t); soma += t.length + 2; }
  const meta = {
    snippet: { title: String((longo && Array.isArray(v.yt_titulos) && v.yt_titulos[0]) || v.yt_titulo || v.titulo || "Vídeo").slice(0, 100), description: String(v.yt_descricao || "").slice(0, 4900), tags, categoryId: "22" },
    status: { privacyStatus: futuro || rascunho ? "private" : "public", ...(futuro ? { publishAt: quando!.toISOString() } : {}), selfDeclaredMadeForKids: false, containsSyntheticMedia: c?.yt_sintetico ?? true },
  };
  // versão em alta (o armazenamento aceita até 50 MB por arquivo): partes em videos/hd/<id>/part_NN, juntadas em fluxo;
  // sem partes, vai o video_url (a versão do painel)
  const hd = await partesHD(db, v.id);
  let corpo: BodyInit, total: number;
  if (hd) { corpo = hd.corpo; total = hd.total; }
  else {
    const arq = await fetch(v.video_url);
    if (!arq.ok) throw new Error(`não consegui baixar o vídeo (${arq.status})`);
    const tam = Number(arq.headers.get("content-length") || 0);
    corpo = tam > 0 && arq.body ? arq.body : new Uint8Array(await arq.arrayBuffer());
    total = tam > 0 && arq.body ? tam : (corpo as Uint8Array).length;
  }
  const ini = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8", "X-Upload-Content-Length": String(total), "X-Upload-Content-Type": "video/mp4" },
    body: JSON.stringify(meta),
  });
  if (!ini.ok) { const d = await ini.json().catch(() => ({})); const e = new Error(d.error?.message || `HTTP ${ini.status}`); (e as Error & { motivo?: string }).motivo = d.error?.errors?.[0]?.reason; throw e; }
  const destino = ini.headers.get("location");
  if (!destino) throw new Error("o YouTube não abriu o envio");
  const fim = await fetch(destino, { method: "PUT", headers: { "Content-Type": "video/mp4", "Content-Length": String(total) }, body: corpo, ...(corpo instanceof ReadableStream ? { duplex: "half" } : {}) } as RequestInit);
  const d = await fim.json().catch(() => ({}));
  if (!fim.ok || !d.id) throw new Error(d.error?.message || `envio falhou (${fim.status})`);
  const avisoCapa = longo ? await porCapa(token, v, d.id) : "";
  await db.from("videos").update({
    yt_id: d.id, yt_link: longo ? `https://youtube.com/watch?v=${d.id}` : `https://youtube.com/shorts/${d.id}`, yt_erro: avisoCapa || null, yt_tentativas: 0, yt_subido_em: new Date().toISOString(),
    ...(remarcado && quando ? { yt_programado_para: quando.toISOString() } : {}),
    ...(rascunho ? { yt_status: "pendente" } : futuro ? { yt_status: "programado" } : { yt_status: "postado", yt_postado_em: new Date().toISOString() }),
  }).eq("id", v.id);
  return rascunho ? "privado no YouTube (falta programar)" : futuro ? `programado ${quando!.toISOString()}${remarcado ? " (remarcado: tinha perdido o horário)" : ""}` : "publicado agora";
}

// muda o horário (ou tira do ar) de um vídeo que já subiu
async function mudarStatus(db: SupabaseClient, v: Record<string, any>, cancelar: boolean) {
  const token = await tokenDe(db, v.canal);
  const quando = v.yt_programado_para ? new Date(v.yt_programado_para) : null;
  const futuro = !cancelar && quando && quando.getTime() > Date.now() + 5 * 60000;
  // o YouTube troca o bloco "status" inteiro: lê o atual e só muda privacidade e data (mantém o resto, ex.: conteúdo sintético)
  const atual = (await google(token, `https://www.googleapis.com/youtube/v3/videos?part=status&id=${v.yt_id}`)).items?.[0]?.status;
  if (!atual) throw new Error("vídeo não encontrado no YouTube (apagado?)");
  const manter = { embeddable: atual.embeddable, license: atual.license, publicStatsViewable: atual.publicStatsViewable, selfDeclaredMadeForKids: atual.selfDeclaredMadeForKids ?? false, ...(atual.containsSyntheticMedia != null ? { containsSyntheticMedia: atual.containsSyntheticMedia } : {}) };
  const status = cancelar ? { ...manter, privacyStatus: "private" } : futuro ? { ...manter, privacyStatus: "private", publishAt: quando!.toISOString() } : { ...manter, privacyStatus: "public" };
  const res = await google(token, "https://www.googleapis.com/youtube/v3/videos?part=status", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: v.yt_id, status }) });
  // confere na resposta do YouTube se a data entrou mesmo
  if (futuro && !res.status?.publishAt) throw new Error(`o YouTube não aceitou a data (está como ${res.status?.privacyStatus ?? "?"}); confira no Studio se o vídeo terminou de processar`);
  await db.from("videos").update(cancelar ? { yt_status: "pendente", yt_programado_para: null, yt_erro: null } : futuro ? { yt_status: "programado", yt_erro: null } : { yt_status: "postado", yt_postado_em: new Date().toISOString(), yt_erro: null }).eq("id", v.id);
  return cancelar ? "tirado do ar (privado)" : "horário mudado";
}

async function processar(db: SupabaseClient) {
  const sel = "id,canal,titulo,yt_titulo,yt_descricao,yt_tags,yt_programado_para,yt_status,yt_id,yt_tentativas,video_url,duracao,capa_url,capas,yt_titulos";
  // primeiro o que tem data (programar, mudar horário, cancelar), do mais próximo ao mais longe; depois os novos que vão como privados
  // quem já está no YouTube (só muda data) vem separado, para não ficar atrás da fila de envios
  const { data: a1 } = await db.from("videos").select(sel).in("yt_status", ["agendado", "cancelar"]).not("yt_id", "is", null).order("yt_programado_para", { ascending: true, nullsFirst: false }).limit(40);
  const { data: a2 } = await db.from("videos").select(sel).in("yt_status", ["agendado", "cancelar"]).is("yt_id", null).order("yt_programado_para", { ascending: true, nullsFirst: false }).limit(80);
  // fila justa entre canais: intercala os envios novos por canal (o mais próximo de cada canal primeiro),
  // para a fila grande de um canal não segurar o vídeo do dia de outro
  const porCanal: Record<string, Record<string, any>[]> = {};
  for (const v of a2 ?? []) (porCanal[v.canal] ??= []).push(v);
  const filas = Object.values(porCanal).sort((x, y) => new Date(x[0].yt_programado_para ?? 8.64e15).getTime() - new Date(y[0].yt_programado_para ?? 8.64e15).getTime());
  const novos: Record<string, any>[] = [];
  for (let i = 0; filas.some((q) => q.length > i); i++) for (const q of filas) if (q[i]) novos.push(q[i]);
  const a = [...(a1 ?? []), ...novos];
  const { data: b } = await db.from("videos").select(sel).eq("yt_status", "subir").order("created_at", { ascending: true }).limit(40);
  const { yt_limite_dia } = await cfg(db, ["yt_limite_dia"]);
  const limite = Number(yt_limite_dia) || 15;
  const enviados: Record<string, number> = {};
  const r: Record<string, string> = {};
  let envios = 0, mudancas = 0, cotaProjeto = false;
  const semPermissao = new Set<string>();
  for (const v of [...(a ?? []), ...(b ?? [])]) {
    try {
      if (v.yt_status === "cancelar" || v.yt_id) {
        if (semPermissao.has(v.canal) || cotaProjeto) continue;
        // só muda o status de quem já está no YouTube (rápido): até 15 por rodada
        if (mudancas >= 15) continue;
        mudancas++;
        if (v.yt_status === "cancelar") r[v.id] = v.yt_id ? await mudarStatus(db, v, true) : (await db.from("videos").update({ yt_status: "pendente", yt_programado_para: null }).eq("id", v.id), "cancelado");
        else r[v.id] = await mudarStatus(db, v, false);
        continue;
      }
      // envio novo (arquivo inteiro): até 3 por rodada e respeitando o limite de envios do canal nas últimas 24 h
      if (envios >= 3 || cotaProjeto) continue;
      if (enviados[v.canal] == null) enviados[v.canal] = await enviados24h(await tokenDe(db, v.canal));
      if (enviados[v.canal] >= limite) {
        await db.from("videos").update({ yt_erro: "o canal chegou no limite de envios do dia no YouTube; sobe sozinho quando liberar" }).eq("id", v.id);
        r[v.id] = "aguardando limite do dia"; continue;
      }
      envios++;
      r[v.id] = await subir(db, v, v.yt_status === "subir");
      enviados[v.canal]++;
    } catch (e) {
      const msg = (e as Error).message, motivo = (e as Error & { motivo?: string }).motivo ?? "";
      // cota do app do Google (todos os canais juntos) x limite de envios do próprio canal
      const cotaApp = /quotaExceeded|dailyLimitExceeded|for consumer 'project|exceeded your quota/i.test(motivo + " " + msg);
      const limiteCanal = !cotaApp && /uploadLimitExceeded|rateLimit|exceeded the number of videos/i.test(motivo + " " + msg);
      const permissao = /insufficientPermissions|insufficient authentication scopes|conecte de novo/i.test(motivo + msg);
      const n = (v.yt_tentativas || 0) + (cotaApp || limiteCanal || permissao ? 0 : 1);
      const aviso = cotaApp ? AVISO_COTA_APP : limiteCanal ? AVISO_LIMITE_CANAL : permissao ? "falta reconectar a conta do YouTube (permissão nova)" : msg;
      await db.from("videos").update({ yt_erro: aviso, yt_tentativas: n, ...(n >= 3 ? { yt_status: "erro" } : {}) }).eq("id", v.id);
      r[v.id] = `erro: ${msg}`;
      if (limiteCanal) enviados[v.canal] = limite;
      // cota do app acabou: vale para todos os canais, para de chamar o YouTube nesta rodada
      if (cotaApp) cotaProjeto = true;
      if (permissao) semPermissao.add(v.canal);
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
  // diagnóstico: o que está na lista de envios do canal e a situação de cada vídeo (processando, recusado, etc.)
  if (body.acao === "uploads") {
    const canal = String(body.canal || "");
    if (!/^[a-z0-9-]+$/.test(canal)) return json(400, { ok: false, erro: "canal inválido" });
    try {
      const token = await tokenDe(db, canal);
      const ch = (await google(token, "https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true")).items?.[0];
      const up = ch?.contentDetails?.relatedPlaylists?.uploads;
      const pl = await google(token, `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,status&maxResults=50&playlistId=${up}`);
      const itens = ((pl.items ?? []) as any[]).map((i) => ({ id: i.snippet?.resourceId?.videoId, titulo: i.snippet?.title, quando: i.snippet?.publishedAt, priv: i.status?.privacyStatus }));
      const det = itens.length ? (await google(token, `https://www.googleapis.com/youtube/v3/videos?part=status,processingDetails&id=${itens.map((i) => i.id).join(",")}`)).items ?? [] : [];
      const por = Object.fromEntries((det as any[]).map((d) => [d.id, d]));
      return json(200, { ok: true, videos: itens.map((i) => ({ ...i, envio: por[i.id]?.status?.uploadStatus ?? "não aparece em videos.list", recusa: por[i.id]?.status?.rejectionReason ?? null, falha: por[i.id]?.status?.failureReason ?? null, processamento: por[i.id]?.processingDetails?.processingStatus ?? null, publicar_em: por[i.id]?.status?.publishAt ?? null })) });
    } catch (e) { return json(200, { ok: false, erro: (e as Error).message }); }
  }
  return json(400, { ok: false, erro: "acao desconhecida" });
});

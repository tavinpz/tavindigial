// email-prospeccao — sequência de e-mail para os leads gringos (3 e-mails: dia 0, dia 3, dia 7).
// Envia pela caixa do Tavin (SMTP, porta 465), só em horário comercial do fuso do lead (seg–sex, 9h–17h),
// com teto diário e poucos por rodada para não parecer disparo em massa.
// Para sozinho quando o lead responde, recebe proposta, fecha, é descartado ou pede para sair.
//   POST { acao: 'enfileirar', ids: [...] }  → agenda a sequência (painel)
//   POST { acao: 'enviar' }                   → manda o que está na hora (pg_cron a cada 10 min)
//   POST { acao: 'teste', para }              → manda o 1º e-mail de exemplo para você
//   POST { acao: 'status' }                   → números para a tela
//   GET  ?sair=<token>                        → descadastro (link no rodapé de todo e-mail)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.16";

const URL_SB = Deno.env.get("SUPABASE_URL")!;
const SITE = "https://tavindigital.online";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info, x-ingest-token",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));
const DIAS = [0, 3, 7];
const ATIVOS = ["novo", "na_fila", "enviado", "abriu"];

type Smtp = { host?: string; porta?: number; usuario?: string; senha?: string; nome?: string; email?: string; endereco?: string; limite_dia?: number; assinatura?: string };

// ── texto ──
const semAcento = (s = "") => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
function nomeCurto(nome = "") {
  const partes = String(nome).trim().split(/\s[|\-–—/•·]\s?|\s?[|/•·]\s|[“”"(,]/).map((p) => p.trim()).filter(Boolean);
  let c = partes[0] || String(nome).trim();
  if (c.length > 40) c = c.slice(0, 40).replace(/\s+\S*$/, "");
  if (c === c.toUpperCase() && /[A-ZÀ-Ú]{3}/.test(c)) c = c.toLowerCase().replace(/(^|\s)(\S)/g, (_, e, l) => e + l.toUpperCase());
  return c;
}
const linkPrevia = (l: { id: string; nome: string }) =>
  `${SITE}/p/${(semAcento(nomeCurto(l.nome)).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32).replace(/-+$/, "") || "previa")}-${l.id.slice(0, 8)}`;

function preencher(modelo: string, l: Record<string, string>, cfg: Smtp) {
  const vars: Record<string, string> = {
    negocio: nomeCurto(l.nome) || "sua empresa",
    cidade: l.cidade || "",
    moeda: l.pais === "PT" ? "€" : "US$",
    link: linkPrevia(l as { id: string; nome: string }),
    portfolio: SITE,
    remetente: cfg.nome || "Gustavo",
  };
  let s = String(modelo).replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
  for (let i = 0; i < 5 && /\{[^{}]*\|[^{}]*\}/.test(s); i++) s = s.replace(/\{([^{}]*\|[^{}]*)\}/g, (_m, op) => { const o = op.split("|"); return o[Math.floor(Math.random() * o.length)]; });
  return s;
}
// 1ª linha "Assunto: ..." vira o assunto; o resto é o corpo
function separar(texto: string) {
  const m = texto.match(/^\s*Assunto:\s*(.+)\n+/i);
  return m ? { assunto: m[1].trim(), corpo: texto.slice(m[0].length).trim() } : { assunto: "Uma ideia para o seu negócio", corpo: texto.trim() };
}
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function html(corpo: string, rodape: string, sair: string, en = false) {
  const ps = esc(corpo).split(/\n{2,}/).map((p) => `<p style="margin:0 0 14px">${p.replace(/\n/g, "<br>").replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')}</p>`).join("");
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#222;max-width:560px">${ps}` +
    `<p style="margin:22px 0 0;font-size:12px;color:#888">${esc(rodape).replace(/\n/g, "<br>")}<br><a href="${sair}" style="color:#888">${en ? "Unsubscribe" : "Não quero receber mais e-mails"}</a></p></div>`;
}

async function config(db: SupabaseClient): Promise<Smtp> {
  const { data } = await db.from("app_config").select("value").eq("key", "email_smtp").maybeSingle();
  try { return data?.value ? JSON.parse(data.value) : {}; } catch { return {}; }
}
const pronto = (c: Smtp) => !!(c.host && c.usuario && c.senha && c.email && c.endereco);
function transporte(c: Smtp) {
  const porta = Number(c.porta || 465);
  return nodemailer.createTransport({
    host: c.host, port: porta, secure: porta === 465, requireTLS: porta !== 465,
    auth: { user: c.usuario, pass: c.senha },
    connectionTimeout: 12000, greetingTimeout: 10000, socketTimeout: 25000,
  });
}

async function mandar(tr: ReturnType<typeof transporte>, c: Smtp, para: string, texto: string, token: string, en = false) {
  const { assunto, corpo } = separar(texto);
  const sair = `${URL_SB}/functions/v1/email-prospeccao?sair=${token}`;
  const rodape = `${c.assinatura || `${c.nome || "Gustavo"} · Tavin Digital`}\n${c.endereco}`;
  return await tr.sendMail({
    from: { name: c.nome || "Gustavo · Tavin Digital", address: c.email! },
    to: para,
    subject: assunto,
    text: `${corpo}\n\n--\n${rodape}\n${en ? "Unsubscribe:" : "Não quer receber mais e-mails?"} ${sair}`,
    html: html(corpo, rodape, sair, en),
    headers: { "List-Unsubscribe": `<${sair}>, <mailto:${c.email}?subject=sair>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  });
}

const BR_NOME = /brazil|brasil|brasileir|carioca|mineir|baian|ga[uú]ch|capixab|goian|paulist|nordestin|p[aã]o de queijo|a[cç]a[ií]|coxinha|tapioca|rod[ií]zio|feijoada|brigadeiro|churrascaria|guaran[aá]|picanha/i;

function variante(id: string, vs: string[]) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return vs[h % vs.length];
}

async function enfileirar(db: SupabaseClient, ids: string[]) {
  const [{ data: leads }, { data: modelos }, { data: sairam }, { data: ja }] = await Promise.all([
    db.from("leads").select("id,email,status,mercado,pais,nome,idioma").in("id", ids),
    db.from("mensagens").select("id,etapa,variante,publico").eq("ativo", true).in("etapa", ["email_1", "email_2", "email_3"]),
    db.from("email_descadastros").select("email"),
    db.from("email_envios").select("lead_id").in("lead_id", ids),
  ]);
  const fora = new Set((sairam ?? []).map((x) => x.email));
  const tem = new Set((ja ?? []).map((x) => x.lead_id));
  // texto por público: inglês (americano), Portugal (negócio português) ou brasileiro fora; Portugal cai no de brasileiro onde não tiver
  const doPublico = (pub: string, etapa: string) => (modelos ?? []).filter((m) => m.publico === pub && m.etapa === etapa);
  const publicoDe = (l: { idioma?: string; pais?: string; nome?: string }) =>
    l.idioma === "en" ? "gringa_en" : l.pais === "PT" && !BR_NOME.test(l.nome || "") ? "portugal" : "gringa";
  if (!doPublico("gringa", "email_1").length) return { ok: false, erro: "Não há modelo ativo de e-mail (Mensagens → E-mail 1)" };
  const linhas = [];
  let pulados = 0;
  for (const l of leads ?? []) {
    const email = String(l.email || "").toLowerCase();
    if (!email || fora.has(email) || tem.has(l.id) || !ATIVOS.includes(l.status) || l.mercado === "br") { pulados++; continue; }
    const pub = publicoDe(l);
    const vs = [...new Set(doPublico(pub, "email_1").map((m) => m.variante))].sort();
    const v = variante(l.id, vs.length ? vs : ["A"]);
    DIAS.forEach((d, i) => {
      const etapa = `email_${i + 1}`;
      const lista = doPublico(pub, etapa).length ? doPublico(pub, etapa) : doPublico(pub === "gringa_en" ? "gringa_en" : "gringa", etapa);
      const m = lista.find((x) => x.variante === v) || lista[0];
      if (m) linhas.push({ lead_id: l.id, email, passo: i + 1, mensagem_id: m.id, enviar_em: new Date(Date.now() + d * 86400000).toISOString() });
    });
  }
  if (linhas.length) {
    const { error } = await db.from("email_envios").upsert(linhas, { onConflict: "lead_id,passo", ignoreDuplicates: true });
    if (error) return { ok: false, erro: error.message };
  }
  return { ok: true, leads: new Set(linhas.map((x) => x.lead_id)).size, pulados };
}

// Hora local do lead: só seg–sex, 9h às 17h
function noHorario(fuso: string | null) {
  const agora = new Date();
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: fuso || "America/New_York", weekday: "short", hour: "numeric", hour12: false }).formatToParts(agora).map((x) => [x.type, x.value]));
  const h = Number(p.hour) % 24;
  return !["Sat", "Sun"].includes(p.weekday) && h >= 9 && h < 17;
}

async function enviar(db: SupabaseClient) {
  const c = await config(db);
  if (!pronto(c)) return { ok: false, erro: "Configure a caixa de e-mail no CRM Gringa" };
  const limite = Number(c.limite_dia || 40);
  const hoje = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  hoje.setHours(0, 0, 0, 0);
  const inicioHoje = new Date(hoje.getTime() + 3 * 3600000).toISOString();
  const { count: feitos } = await db.from("email_envios").select("id", { count: "exact", head: true }).eq("status", "enviado").gte("enviado_em", inicioHoje);
  let saldo = Math.min(5, limite - (feitos ?? 0));
  if (saldo <= 0) return { ok: true, enviados: 0, aviso: "teto do dia" };

  const { data: fila } = await db.from("email_envios")
    .select("id,lead_id,email,passo,token,tentativas,mensagem_id,leads(id,nome,cidade,pais,fuso,status,idioma),mensagens(texto)")
    .eq("status", "pendente").lte("enviar_em", new Date().toISOString()).order("enviar_em").limit(60);
  if (!fila?.length) return { ok: true, enviados: 0 };
  const { data: sairam } = await db.from("email_descadastros").select("email").in("email", fila.map((f) => f.email));
  const fora = new Set((sairam ?? []).map((x) => x.email));

  const tr = transporte(c);
  let enviados = 0;
  const erros: string[] = [];
  try {
    for (const f of fila) {
      if (saldo <= 0) break;
      // deno-lint-ignore no-explicit-any
      const l = f.leads as any;
      // deno-lint-ignore no-explicit-any
      const modelo = (f.mensagens as any)?.texto;
      if (!l || !ATIVOS.includes(l.status) || fora.has(f.email) || !modelo) {
        await db.from("email_envios").update({ status: "cancelado" }).eq("id", f.id); continue;
      }
      if (!noHorario(l.fuso)) continue;
      if (f.passo > 1) {
        const { data: ant } = await db.from("email_envios").select("status").eq("lead_id", f.lead_id).eq("passo", f.passo - 1).maybeSingle();
        if (ant && ant.status === "pendente") continue;
        if (ant && ant.status !== "enviado") { await db.from("email_envios").update({ status: "cancelado" }).eq("id", f.id); continue; }
      }
      const texto = preencher(modelo, l, c);
      try {
        const info = await mandar(tr, c, f.email, texto, f.token, l.idioma === "en");
        if ((info.rejected || []).length) throw Object.assign(new Error("O servidor recusou o destinatário"), { responseCode: 550 });
        await db.from("email_envios").update({ status: "enviado", enviado_em: new Date().toISOString(), erro: null }).eq("id", f.id);
        await db.from("envios").insert({ lead_id: f.lead_id, mensagem_id: f.mensagem_id, etapa: `email_${f.passo}`, canal: "email", texto_enviado: texto });
        enviados++; saldo--;
        await dormir(4000 + Math.random() * 9000);
      } catch (e) {
        // deno-lint-ignore no-explicit-any
        const err = e as any;
        const code = Number(err?.responseCode || 0);
        const msg = String(err?.response || err?.message || e).slice(0, 280);
        if (err?.code === "EAUTH" || code === 535 || code === 534) { erros.push("A caixa recusou o login (senha de app errada ou revogada)"); break; }
        const definitivo = code >= 500 || f.tentativas >= 2;
        await db.from("email_envios").update({ status: definitivo ? "erro" : "pendente", erro: msg, tentativas: f.tentativas + 1 }).eq("id", f.id);
        if (definitivo && code >= 550) {
          await db.from("leads").update({ email_status: "invalido" }).eq("id", f.lead_id);
          await db.from("email_envios").update({ status: "cancelado" }).eq("lead_id", f.lead_id).eq("status", "pendente");
        }
        erros.push(msg);
      }
    }
  } finally { try { tr.close(); } catch { /* ignora */ } }
  return { ok: !erros.length || enviados > 0, enviados, erros };
}

async function autorizado(db: SupabaseClient, req: Request) {
  const { data: cfg } = await db.from("app_config").select("value").eq("key", "ingest_token").maybeSingle();
  if (cfg && req.headers.get("x-ingest-token") === cfg.value) return true;
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return false;
  const usuario = createClient(URL_SB, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data } = await usuario.rpc("is_admin");
  return data === true;
}

const pagina = (titulo: string, txt: string) => new Response(
  `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${titulo}</title>` +
  `<body style="font-family:Arial,sans-serif;background:#f6f3f8;margin:0;display:grid;place-items:center;min-height:100vh"><main style="background:#fff;padding:32px 28px;border-radius:16px;max-width:420px;margin:16px"><h1 style="font-size:22px;margin:0 0 10px">${titulo}</h1><p style="color:#555;line-height:1.6;margin:0">${txt}</p></main></body></html>`,
  { headers: { "Content-Type": "text/html; charset=utf-8" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  const db = createClient(URL_SB, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const u = new URL(req.url);
  const token = u.searchParams.get("sair");
  if (token) {
    const { data: env } = await db.from("email_envios").select("lead_id,email").eq("token", token).maybeSingle();
    if (env) {
      await db.from("email_descadastros").upsert({ email: env.email }, { onConflict: "email", ignoreDuplicates: true });
      await db.from("email_envios").update({ status: "cancelado" }).eq("lead_id", env.lead_id).eq("status", "pendente");
      await db.from("eventos").insert({ lead_id: env.lead_id, tipo: "saiu", meta: { canal: "email" } });
    }
    return pagina("Pronto", "Você não vai receber mais nenhum e-mail nosso. Desculpe o incômodo e sucesso por aí!");
  }
  if (req.method !== "POST") return json(405, { ok: false });
  if (!(await autorizado(db, req))) return json(401, { ok: false, erro: "não autorizado" });
  const body = await req.json().catch(() => ({}));

  if (body.acao === "enfileirar") return json(200, await enfileirar(db, (body.ids || []).map(String).slice(0, 500)));
  if (body.acao === "enviar") return json(200, await enviar(db));
  if (body.acao === "status") {
    const c = await config(db);
    const conta = async (st: string, desde?: string) => {
      let q = db.from("email_envios").select("id", { count: "exact", head: true }).eq("status", st);
      if (desde) q = q.gte(st === "enviado" ? "enviado_em" : "created_at", desde);
      return (await q).count ?? 0;
    };
    const ontem = new Date(Date.now() - 86400000).toISOString();
    const [pendentes, enviados, hoje, erros, { count: sairam }] = await Promise.all([
      conta("pendente"), conta("enviado"), conta("enviado", ontem), conta("erro"),
      db.from("email_descadastros").select("email", { count: "exact", head: true }),
    ]);
    return json(200, { ok: true, configurado: pronto(c), limite_dia: Number(c.limite_dia || 40), pendentes, enviados, ultimas_24h: hoje, erros, descadastros: sairam ?? 0 });
  }
  if (body.acao === "teste") {
    const c = await config(db);
    if (!pronto(c)) return json(200, { ok: false, erro: "Preencha servidor, usuário, senha de app, e-mail e endereço" });
    const { data: m } = await db.from("mensagens").select("texto").eq("ativo", true).eq("etapa", body.etapa || "email_1").eq("publico", "gringa").order("variante").limit(1).maybeSingle();
    if (!m) return json(200, { ok: false, erro: "Não há modelo ativo de e-mail" });
    const exemplo = { id: "00000000-teste", nome: "Padaria Pão de Queijo", cidade: "Framingham", pais: "US" };
    const tr = transporte(c);
    try {
      await mandar(tr, c, String(body.para || c.email), preencher(m.texto, exemplo, c), "teste");
      return json(200, { ok: true });
    } catch (e) {
      // deno-lint-ignore no-explicit-any
      const err = e as any;
      return json(200, { ok: false, erro: err?.code === "EAUTH" ? "A caixa recusou o login: use uma senha de app (não a senha normal)" : String(err?.response || err?.message || e).slice(0, 300) });
    } finally { try { tr.close(); } catch { /* ignora */ } }
  }
  return json(400, { ok: false, erro: "ação desconhecida" });
});

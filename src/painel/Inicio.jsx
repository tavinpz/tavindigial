import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CONFIG, brl } from '../config'
import { ETAPAS, STATUS, dataCurta, tempoAtras } from './api'
import { usePainel } from './Painel'

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)

// Frase de cada evento no feed
const FRASE = {
  abriu_pagina: (m) => `abriu a página${m?.modelo ? ` do modelo ${m.modelo}` : ''}`,
  respondeu: () => 'respondeu',
  pediu_preco: () => 'pediu o preço',
  proposta_enviada: () => 'recebeu a proposta',
  pagou: (m) => `fechou${m?.valor ? ` · ${brl(m.valor)}` : ''}`,
  perdeu: () => 'foi marcado como perdido',
  saiu: () => 'pediu para sair',
}

function saudacao() {
  const h = Number(new Date().toLocaleString('pt-BR', { hour: '2-digit', hour12: false, timeZone: 'America/Sao_Paulo' }))
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

// Anel de progresso da meta do dia
function Anel({ valor, meta }) {
  const p = Math.min(1, valor / meta)
  const c = 2 * Math.PI * 34
  return (
    <svg viewBox="0 0 80 80" className="p-anel" aria-hidden="true">
      <circle cx="40" cy="40" r="34" className="fundo" />
      <circle cx="40" cy="40" r="34" className="cheio" strokeDasharray={c} strokeDashoffset={c * (1 - p)} />
    </svg>
  )
}

export default function Inicio() {
  const { abrirLead, irPara, versao } = usePainel()
  const [d, setD] = useState(null)

  useEffect(() => {
    const desde = new Date(Date.now() - 13 * 86400000)
    desde.setHours(0, 0, 0, 0)
    Promise.all([
      supabase.from('v_resumo').select('*').single(),
      supabase.from('eventos').select('id,tipo,meta,created_at,leads(id,nome,nicho,bairro)').order('created_at', { ascending: false }).limit(30),
      supabase.from('leads').select('id,nome,status,nicho,bairro,updated_at,eventos(tipo,meta,created_at)')
        .in('status', ['respondeu', 'proposta']).order('updated_at', { ascending: false })
        .order('created_at', { referencedTable: 'eventos', ascending: false }).limit(1, { referencedTable: 'eventos' }).limit(12),
      supabase.from('envios').select('enviado_em').gte('enviado_em', desde.toISOString()),
      supabase.from('v_funil').select('*'),
      supabase.from('v_ab').select('*'),
      supabase.from('briefings').select('id', { count: 'exact', head: true }).eq('status', 'novo'),
      supabase.from('v_prospeccao').select('*'),
      supabase.from('v_prospeccao_7d').select('*'),
    ]).then(([r, ev, resp, env, funil, ab, brief, etapas, semana]) => {
      // envios por dia (14 dias, horário local)
      const dias = Array.from({ length: 14 }, (_, i) => { const x = new Date(desde); x.setDate(x.getDate() + i); return x })
      const porDia = dias.map((x) => ({
        dia: x, n: (env.data || []).filter((e) => new Date(e.enviado_em).toDateString() === x.toDateString()).length,
      }))
      const tot = (funil.data || []).reduce((a, f) => ({
        enviados: a.enviados + f.enviados, abriram: a.abriram + f.abriram, responderam: a.responderam + f.responderam,
        preco: a.preco + f.pediram_preco, pagaram: a.pagaram + f.pagaram,
      }), { enviados: 0, abriram: 0, responderam: 0, preco: 0, pagaram: 0 })
      const porGrupo = (lista) => Object.fromEntries((lista || []).map((x) => [x.grupo, x]))
      setD({ r: r.data || {}, feed: ev.data || [], resp: resp.data || [], porDia, tot, funil: funil.data || [], ab: ab.data || [], briefings: brief.count || 0, etapas: porGrupo(etapas.data), semana: porGrupo(semana.data) })
    })
  }, [versao])

  if (!d) return <p className="p-vazio">Carregando…</p>
  const { r, tot } = d
  const maxDia = Math.max(1, ...d.porDia.map((x) => x.n))
  const etapasFunil = [
    ['Abordados', tot.enviados], ['Responderam', tot.responderam], ['Pediram preço', tot.preco], ['Fecharam', tot.pagaram],
  ]
  const soma = (k) => (d.semana.br?.[k] || 0) + (d.semana.gringa?.[k] || 0)
  const fups = (d.etapas.br?.followups_hoje || 0) + (d.etapas.gringa?.followups_hoje || 0)
  const ETAPAS_CRM = [['na_fila', 'Na fila (não chamados)'], ['contato1', '1º contato'], ['fup1', 'Follow-up 1'], ['fup2', 'Follow-up 2'], ['abriu', 'Abriram o link'], ['respondeu', 'Responderam'], ['proposta', 'Proposta'], ['fechou', 'Fecharam'], ['perdido', 'Perdidos']]

  return (
    <section className="p-inicio">
      <div className="p-cab">
        <div>
          <h1>{saudacao()}, Tavin</h1>
          <p className="p-sub">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} · {r.fila ?? 0} na fila do WhatsApp · {r.fila_dm ?? 0} com Instagram{r.followups_pendentes ? ` · ${r.followups_pendentes} follow-ups para hoje` : ''}</p>
        </div>
        <button className="p-btn p-btn--forte p-btn--grande" onClick={() => irPara('prospectar')}>Prospectar agora</button>
      </div>

      {d.briefings > 0 && (
        <button className="p-aviso" onClick={() => irPara('briefings')}>
          {d.briefings === 1 ? '1 cliente mandou o formulário.' : `${d.briefings} clientes mandaram o formulário.`} Ver briefing
        </button>
      )}

      <div className="p-kpis p-kpis--5">
        <div className="p-kpi p-kpi--meta">
          <Anel valor={r.envios_hoje || 0} meta={CONFIG.META_DIARIA} />
          <div><strong>{r.envios_hoje || 0}<span>/{CONFIG.META_DIARIA}</span></strong><small>mensagens hoje</small><em>WhatsApp {r.envios_hoje_wa || 0}/{CONFIG.META_WHATS} · DM {r.envios_hoje_dm || 0}/{CONFIG.META_DM}</em></div>
        </div>
        <button type="button" className={`p-kpi p-kpi--btn ${fups ? 'p-kpi--alerta' : ''}`} onClick={() => irPara('crm')}><strong>{fups}</strong><small>follow-ups para hoje</small><em>{fups ? 'Abrir o CRM e mandar' : 'Nada atrasado'}</em></button>
        <div className="p-kpi"><strong>{pct(soma('responderam'), soma('abordados'))}%</strong><small>responderam</small><em>{soma('responderam')} de {soma('abordados')} abordados em 7 dias</em></div>
        <div className="p-kpi"><strong>{pct(soma('abriram'), soma('receberam_link'))}%</strong><small>abriram o link</small><em>{soma('abriram')} de {soma('receberam_link')} que receberam o link em 7 dias</em></div>
        <div className="p-kpi p-kpi--dinheiro"><strong>{brl(r.vendido_mes || 0)}</strong><small>vendido no mês</small><em>{r.vendas_mes || 0} vendas · {brl(r.mrr || 0)}/mês recorrente</em></div>
      </div>

      <div className="p-dash">
        <div className="p-dash-col">
          <article className="p-painel">
            <header><h2>Precisa de você</h2><span>{d.resp.length}</span></header>
            {d.resp.length === 0 ? <p className="p-meta">Ninguém esperando resposta. Quando alguém responder, registre no lead e ele aparece aqui.</p> : (
              <ul className="p-espera">
                {d.resp.map((l) => {
                  const ev = l.eventos?.[0]
                  return (
                    <li key={l.id}>
                      <button onClick={() => abrirLead(l.id)}>
                        <span className={`p-bola st-${l.status}`} aria-hidden="true">{l.nome.slice(0, 1)}</span>
                        <span className="p-espera-txt">
                          <b>{l.nome}</b>
                          <small>{STATUS[l.status]} · há {tempoAtras(l.updated_at)}</small>
                          {ev?.meta?.resumo && <q>{ev.meta.resumo}</q>}
                        </span>
                        <span className="p-espera-ir">Responder</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </article>

          <article className="p-painel">
            <header><h2>Atividade recente</h2></header>
            {d.feed.length === 0 ? <p className="p-meta">Assim que os leads abrirem a página ou responderem, aparece aqui.</p> : (
              <ol className="p-feed">
                {d.feed.map((e) => (
                  <li key={e.id} className={`ev-${e.tipo}`}>
                    <button onClick={() => e.leads && abrirLead(e.leads.id)}>
                      <i aria-hidden="true" />
                      <span><b>{e.leads?.nome || 'Lead'}</b> {(FRASE[e.tipo] || (() => e.tipo))(e.meta)}
                        {e.meta?.resumo && <q>{e.meta.resumo}</q>}
                      </span>
                      <time dateTime={e.created_at} title={dataCurta(e.created_at)}>{tempoAtras(e.created_at)}</time>
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </article>
        </div>

        <div className="p-dash-col">
          <article className="p-painel">
            <header><h2>Onde estão os leads</h2><span>agora</span></header>
            <div className="p-tabela-wrap"><table className="p-tabela p-etapas">
              <thead><tr><th>Etapa</th><th>Brasil</th><th>Gringos</th></tr></thead>
              <tbody>{ETAPAS_CRM.map(([k, n]) => (
                <tr key={k} className={`et-${k}`}><td>{n}</td><td>{d.etapas.br?.[k] || 0}</td><td>{d.etapas.gringa?.[k] || 0}</td></tr>
              ))}</tbody>
            </table></div>
            <p className="p-meta">Últimos 7 dias: {d.semana.br?.wa || 0} no WhatsApp e {d.semana.br?.dm || 0} no Instagram (Brasil) · {d.semana.gringa?.wa || 0} no WhatsApp e {d.semana.gringa?.email || 0} e-mails (gringos). A 1ª mensagem do WhatsApp não leva link, então "abriram o link" só conta quem recebeu um.</p>
          </article>

          <article className="p-painel">
            <header><h2>Funil</h2><span>desde o início</span></header>
            <div className="p-funil">
              {etapasFunil.map(([n, v], i) => (
                <div key={n} className="p-funil-linha">
                  <span>{n}</span>
                  <div className="p-funil-barra"><i style={{ width: `${Math.max(tot.enviados ? (v / tot.enviados) * 100 : 0, v ? 3 : 0)}%`, '--i': i }} /></div>
                  <b>{v}</b><small>{i ? `${pct(v, tot.enviados)}%` : ''}</small>
                </div>
              ))}
            </div>
          </article>

          <article className="p-painel">
            <header><h2>Mensagens por dia</h2><span>14 dias</span></header>
            <div className="p-barras" role="img" aria-label="Mensagens enviadas por dia nos últimos 14 dias">
              {d.porDia.map(({ dia, n }) => (
                <div key={dia.toISOString()} className="p-barra-dia" title={`${dia.toLocaleDateString('pt-BR')}: ${n}`}>
                  <span style={{ height: `${(n / maxDia) * 100}%` }}>{n > 0 && <em>{n}</em>}</span>
                  <small>{dia.toLocaleDateString('pt-BR', { weekday: 'narrow' })}</small>
                </div>
              ))}
            </div>
            <p className="p-meta">Meta: {CONFIG.META_DIARIA} por dia. Última coleta: {r.ultima_coleta ? dataCurta(r.ultima_coleta) : 'nenhuma'} ({r.leads_24h || 0} novos em 24h).</p>
          </article>

          <details className="p-painel p-detalhes">
            <summary>Detalhes: teste A/B e resultado por nicho</summary>
            {d.ab.length > 0 && (
              <div className="p-tabela-wrap"><table className="p-tabela">
                <thead><tr><th>Mensagem</th><th>Var.</th><th>Env.</th><th>Abriram</th><th>Resp.</th></tr></thead>
                <tbody>{d.ab.map((a) => (
                  <tr key={`${a.etapa}-${a.publico}-${a.variante}`}><td>{ETAPAS[a.etapa] || a.etapa} <small>{a.publico}</small></td><td>{a.variante}</td><td>{a.enviados}</td><td>{pct(a.abriram, a.enviados)}%</td><td>{pct(a.responderam, a.enviados)}%</td></tr>
                ))}</tbody>
              </table></div>
            )}
            {d.funil.length > 0 && (
              <div className="p-tabela-wrap"><table className="p-tabela">
                <thead><tr><th>Nicho</th><th>Env.</th><th>Abriram</th><th>Resp.</th><th>Fecharam</th></tr></thead>
                <tbody>{d.funil.map((f) => (
                  <tr key={`${f.nicho}-${f.cidade}`}><td>{f.nicho} <small>{f.cidade}</small></td><td>{f.enviados}</td><td>{pct(f.abriram, f.enviados)}%</td><td>{pct(f.responderam, f.enviados)}%</td><td>{f.pagaram}</td></tr>
                ))}</tbody>
              </table></div>
            )}
            {d.ab.length === 0 && d.funil.length === 0 && <p className="p-meta">Aparece depois dos primeiros envios.</p>}
          </details>
        </div>
      </div>
    </section>
  )
}

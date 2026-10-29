import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatTel, igHandle } from '../lib/msg'
import { ETAPAS, STATUS, registrarEvento } from './api'
import { usePainel } from './Painel'
import { abrirCanal } from './envio'

const FUSO = 'America/Sao_Paulo'
const diaBR = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: FUSO })
// dias de calendário (Brasília) entre a data e hoje: hoje = 0, ontem = 1…
export const diasDesde = (iso) => iso ? Math.round((new Date(diaBR(Date.now())) - new Date(diaBR(iso))) / 86400000) : null
const diasAte = (iso) => iso ? Math.round((new Date(diaBR(iso)) - new Date(diaBR(Date.now()))) / 86400000) : null
const fmtData = (iso) => iso ? new Date(iso).toLocaleDateString('pt-BR', { timeZone: FUSO, day: '2-digit', month: '2-digit' }) : ''
export const haDias = (iso) => {
  const d = diasDesde(iso)
  return d == null ? '' : d === 0 ? 'hoje' : d === 1 ? 'ontem' : `há ${d} dias`
}

const ULTIMA = { abertura: '1ª mensagem', abertura_dm: '1ª mensagem (DM)', followup_1: 'Follow-up 1', followup_2: 'Follow-up 2 (último)' }
const nomeEtapa = (e) => ULTIMA[e] || ETAPAS[e] || e

// O que vem depois, pela regra do banco: 1ª msg → follow-up 1 em 3 dias → follow-up 2 em 4 dias → fim
export function proximoPasso(l) {
  if (respondeu(l)) return { txt: 'Responder / combinar', quando: 'agora', urgente: true }
  if (!l.proximo_contato) return { txt: 'Sequência terminou', quando: '', fim: true }
  const qual = (l.total_envios || 0) <= 1 ? 'Follow-up 1' : l.status === 'proposta' ? 'Follow-up da proposta' : 'Follow-up 2'
  const d = diasAte(l.proximo_contato)
  const quando = d <= 0 ? 'hoje' : d === 1 ? 'amanhã' : `em ${d} dias (${fmtData(l.proximo_contato)})`
  return { txt: qual, quando, urgente: d <= 0 }
}
const respondeu = (l) => l.status === 'respondeu' || l.status === 'proposta' || (l.ultima_resposta && l.ultima_resposta > l.ultimo_envio)

const GRUPOS = [
  ['resp', 'Responderam', 'Já falaram com você: responda e combine.'],
  ['d0', 'Enviados hoje', ''],
  ['d1', 'Ontem', ''],
  ['d2', 'Há 2 dias', 'Follow-up 1 amanhã.'],
  ['d3', 'Há 3 dias', 'Dia do follow-up 1.'],
  ['d4', 'De 4 a 7 dias', 'Esperando o follow-up 2.'],
  ['d8', 'Mais de 7 dias', 'Sequência no fim: se não responderam, pode encerrar.'],
]
const grupoDe = (l) => {
  if (respondeu(l)) return 'resp'
  const d = diasDesde(l.ultimo_envio)
  return d <= 0 ? 'd0' : d === 1 ? 'd1' : d === 2 ? 'd2' : d === 3 ? 'd3' : d <= 7 ? 'd4' : 'd8'
}

function Linha({ l, destino, recarregar }) {
  const { abrirLead, avisar } = usePainel()
  const p = proximoPasso(l)
  const wa = l.ultimo_canal !== 'instagram' && l.whatsapp
  async function marcar(e) {
    e.stopPropagation()
    try { await registrarEvento(l.id, 'respondeu', { origem: 'acompanhamento' }); avisar(`${l.nome}: respondeu`); recarregar() } catch { avisar('Não deu certo') }
  }
  return (
    <li className="a-linha">
      <button type="button" className="a-quem" onClick={() => abrirLead(l.id)}>
        <strong>{l.nome}</strong>
        <span>{wa ? formatTel(l.whatsapp) : l.instagram ? `@${igHandle(l.instagram)}` : formatTel(l.whatsapp)} · {[l.categoria, l.bairro].filter(Boolean).join(' · ')}</span>
      </button>
      <div className="a-hist">
        <span className={`a-canal a-canal--${l.ultimo_canal}`}>{l.ultimo_canal === 'instagram' ? 'DM' : 'WhatsApp'}</span>
        <span><b>{nomeEtapa(l.ultima_etapa)}</b> {haDias(l.ultimo_envio)}</span>
        {l.total_envios > 1 && <span className="a-sub">1ª em {fmtData(l.primeiro_envio)} · {l.total_envios} msgs</span>}
      </div>
      <div className={`a-prox ${p.urgente ? 'a-prox--hoje' : ''} ${p.fim ? 'a-prox--fim' : ''}`}>
        <small>Próximo</small>
        <span>{p.txt}{p.quando ? ` ${p.quando}` : ''}</span>
      </div>
      <div className="a-acoes">
        {!respondeu(l) && <button className="p-btn p-btn--mini" onClick={marcar}>Respondeu</button>}
        {wa && <button className="p-btn p-btn--mini" onClick={() => abrirCanal('whatsapp', l, '', destino)}>Abrir conversa</button>}
        {!wa && l.instagram && <button className="p-btn p-btn--mini" onClick={() => abrirCanal('instagram', l, '', destino)}>Abrir DM</button>}
      </div>
    </li>
  )
}

// Todo mundo que já foi chamado, separado por quantos dias faz a última mensagem
export default function Acompanhamento({ destino }) {
  const { versao } = usePainel()
  const [lista, setLista] = useState(null)
  const [canal, setCanal] = useState('todos')
  const [abertos, setAbertos] = useState(() => new Set(['resp', 'd0', 'd1', 'd2', 'd3']))
  const carregar = async () => {
    const { data } = await supabase.from('v_acompanhamento').select('*').order('ultimo_envio', { ascending: false }).limit(2000)
    setLista(data || [])
  }
  useEffect(() => { carregar() }, [versao]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtrada = useMemo(() => (lista || []).filter((l) => canal === 'todos' || (canal === 'instagram' ? l.ultimo_canal === 'instagram' : l.ultimo_canal !== 'instagram')), [lista, canal])
  const grupos = useMemo(() => {
    const g = Object.fromEntries(GRUPOS.map(([k]) => [k, []]))
    for (const l of filtrada) g[grupoDe(l)].push(l)
    return g
  }, [filtrada])

  if (lista === null) return <p className="p-vazio">Carregando…</p>
  const n = filtrada.length
  const nResp = grupos.resp.length
  const fupHoje = filtrada.filter((l) => !respondeu(l) && l.proximo_contato && diasAte(l.proximo_contato) <= 0).length
  const taxa = n ? Math.round((nResp / n) * 100) : 0
  const alternar = (k) => setAbertos((s) => { const x = new Set(s); x.has(k) ? x.delete(k) : x.add(k); return x })

  return (
    <div className="a-wrap">
      <div className="a-numeros">
        <div><b>{n}</b><span>já chamados</span></div>
        <div><b>{grupos.d0.length}</b><span>enviados hoje</span></div>
        <div className={fupHoje ? 'a-num--hoje' : ''}><b>{fupHoje}</b><span>follow-up hoje</span></div>
        <div><b>{nResp}</b><span>responderam ({taxa}%)</span></div>
      </div>
      <div className="p-filtros a-filtro" role="group" aria-label="Canal">
        {[['todos', 'Todos'], ['whatsapp', 'WhatsApp'], ['instagram', 'Instagram']].map(([k, t]) => (
          <button key={k} className={canal === k ? 'ativa' : ''} onClick={() => setCanal(k)}>{t}</button>
        ))}
        <button onClick={carregar}>Atualizar</button>
      </div>
      {n === 0 && <div className="p-vazio"><p>Ninguém chamado ainda. Comece pela aba Hoje.</p></div>}
      {GRUPOS.filter(([k]) => grupos[k].length).map(([k, nome, dica]) => (
        <section key={k} className={`a-grupo a-grupo--${k}`}>
          <button type="button" className="a-grupo-cab" aria-expanded={abertos.has(k)} onClick={() => alternar(k)}>
            <h3>{nome} <span className="p-conta">{grupos[k].length}</span></h3>
            {dica && <small>{dica}</small>}
            <i aria-hidden="true">{abertos.has(k) ? '−' : '+'}</i>
          </button>
          {abertos.has(k) && <ul className="a-lista">{grupos[k].map((l) => <Linha key={l.id} l={l} destino={destino} recarregar={carregar} />)}</ul>}
        </section>
      ))}
    </div>
  )
}

// Busca por nome ou número em todos os leads (inclusive os que ainda não foram chamados)
export function BuscaLead({ destino }) {
  const { abrirLead } = usePainel()
  const [q, setQ] = useState('')
  const [res, setRes] = useState(null)
  useEffect(() => {
    const termo = q.trim()
    if (termo.length < 3) { setRes(null); return }
    const t = setTimeout(async () => {
      const dig = termo.replace(/\D/g, '')
      const limpo = termo.replace(/[,()%*]/g, ' ').trim()
      let qb = supabase.from('leads').select('id,nome,whatsapp,instagram,status,categoria,bairro,envios(enviado_em,etapa,canal)')
      qb = dig.length >= 4 && dig.length >= limpo.replace(/\s/g, '').length - 4
        ? qb.or(`whatsapp.ilike.%${dig}%,telefone.ilike.%${dig}%`)
        : qb.or(`nome.ilike.%${limpo}%,instagram.ilike.%${limpo.replace(/^@/, '')}%`)
      const { data } = await qb.order('updated_at', { ascending: false }).limit(12)
      setRes((data || []).map((l) => {
        const ev = [...(l.envios || [])].sort((a, b) => (a.enviado_em < b.enviado_em ? 1 : -1))
        return { ...l, ultimo: ev[0], total: ev.length }
      }))
    }, 250)
    return () => clearTimeout(t)
  }, [q])
  return (
    <div className="a-busca">
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, número ou @" aria-label="Buscar lead por nome, número ou @" />
      {res && (
        <div className="a-busca-res" role="listbox">
          {res.length === 0 && <p className="p-meta">Nenhum lead com “{q}”.</p>}
          {res.map((l) => (
            <div key={l.id} className="a-busca-item">
              <button type="button" onClick={() => { abrirLead(l.id); setQ('') }}>
                <strong>{l.nome}</strong>
                <span>{formatTel(l.whatsapp)}{l.instagram ? ` · @${igHandle(l.instagram)}` : ''} · {STATUS[l.status] || l.status}</span>
                <small>{l.ultimo ? `${nomeEtapa(l.ultimo.etapa)} ${haDias(l.ultimo.enviado_em)} pelo ${l.ultimo.canal === 'instagram' ? 'Instagram' : 'WhatsApp'} · ${l.total} ${l.total === 1 ? 'mensagem' : 'mensagens'}` : 'Ainda não chamado'}</small>
              </button>
              {l.whatsapp && <button type="button" className="p-btn p-btn--mini" onClick={() => abrirCanal('whatsapp', l, '', destino)}>Abrir conversa</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

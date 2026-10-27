import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { preencher, waLink, formatTel, linkModelos } from '../lib/msg'
import { brl, CONFIG } from '../config'
import { STATUS, ETAPAS, EVENTOS, PRODUTOS, COLUNAS, escolherMensagem, registrarEnvio, registrarEvento, moverEtapa, linkMaps, dataCurta } from './api'
import { usePainel } from './Painel'

const RESPOSTAS = ['resp_preco', 'resp_pensar', 'resp_ja_tenho', 'followup_proposta', 'pos_venda', 'upsell_30d', 'followup_1', 'followup_2', 'abertura']

export default function LeadDrawer({ id, fechar, iniciarPagamento = false }) {
  const { mensagens, avisar, atualizar } = usePainel()
  const [lead, setLead] = useState(null)
  const [hist, setHist] = useState([])
  const [negocios, setNegocios] = useState([])
  const [etapa, setEtapa] = useState('resp_preco')
  const [texto, setTexto] = useState('')
  const [obs, setObs] = useState('')
  const [pagando, setPagando] = useState(iniciarPagamento)
  const [resumo, setResumo] = useState('')
  const [venda, setVenda] = useState({ produto: 'bio', valor: CONFIG.PRECO_BIO, valor_mensal: CONFIG.HOSPEDAGEM_BIO })

  async function carregar() {
    const [{ data: l }, { data: en }, { data: ev }, { data: ng }] = await Promise.all([
      supabase.from('leads').select('*').eq('id', id).single(),
      supabase.from('envios').select('*').eq('lead_id', id).order('enviado_em', { ascending: false }),
      supabase.from('eventos').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
      supabase.from('negocios').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
    ])
    setLead(l)
    setObs(l?.observacoes || '')
    setNegocios(ng || [])
    const h = [
      ...(en || []).map((x) => ({ quando: x.enviado_em, titulo: `Enviado: ${ETAPAS[x.etapa] || x.etapa}`, detalhe: x.texto_enviado })),
      ...(ev || []).map((x) => ({ quando: x.created_at, titulo: EVENTOS[x.tipo] || x.tipo, detalhe: x.meta?.resumo ? `“${x.meta.resumo}”` : x.meta?.modelo ? `Modelo: ${x.meta.modelo}` : '' })),
    ].sort((a, b) => new Date(b.quando) - new Date(a.quando))
    setHist(h)
  }
  useEffect(() => { carregar() }, [id])

  const publico = lead?.tipo_site === 'site_falso' ? 'site_falso' : 'sem_site'
  const modelo = useMemo(() => (lead ? escolherMensagem(mensagens, etapa, publico, 'A') : null), [mensagens, etapa, publico, lead])
  useEffect(() => { if (lead && modelo) setTexto(preencher(modelo.texto, lead)) }, [modelo, lead])

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && fechar()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [fechar])

  async function enviar() {
    window.open(waLink(lead.whatsapp, texto), '_blank', 'noopener')
    await registrarEnvio({ lead, mensagem: modelo, etapa, texto })
    avisar('Envio registrado')
    carregar(); atualizar()
  }

  async function evento(tipo) {
    if (tipo === 'pagou') { setPagando(true); return }
    if (tipo === 'saiu' && !confirm('Bloquear este número para sempre?')) return
    await registrarEvento(lead.id, tipo, { origem: 'painel', ...(resumo.trim() ? { resumo: resumo.trim().slice(0, 300) } : {}) })
    // sugere a resposta certa para o que ele disse
    if (tipo === 'pediu_preco') setEtapa('resp_preco')
    setResumo('')
    avisar(EVENTOS[tipo])
    carregar(); atualizar()
  }

  async function confirmarPagamento(e) {
    e.preventDefault()
    const mensal = Number(venda.valor_mensal) || 0
    const { error } = await supabase.from('negocios').insert({
      lead_id: lead.id, produto: venda.produto, valor: Number(venda.valor) || 0, valor_mensal: mensal,
      recorrente: mensal > 0, status: 'ganho', fechado_em: new Date().toISOString(),
    })
    if (error) { avisar('Não salvou a venda'); return }
    await registrarEvento(lead.id, 'pagou', { produto: venda.produto, valor: venda.valor })
    setPagando(false)
    avisar('Venda registrada')
    carregar(); atualizar()
  }

  async function salvarObs() {
    await supabase.from('leads').update({ observacoes: obs }).eq('id', lead.id)
    avisar('Observação salva')
  }

  async function marcarRecorrente() {
    await supabase.from('leads').update({ status: 'recorrente' }).eq('id', lead.id)
    avisar('Marcado como recorrente'); carregar(); atualizar()
  }

  if (!lead) return <div className="p-drawer-fundo" onClick={fechar}><aside className="p-drawer" onClick={(e) => e.stopPropagation()}><p>Carregando…</p></aside></div>

  const maps = linkMaps(lead)

  return (
    <div className="p-drawer-fundo" onClick={fechar}>
      <aside className="p-drawer" role="dialog" aria-modal="true" aria-label={lead.nome} onClick={(e) => e.stopPropagation()}>
        <div className="p-drawer-cab">
          <div>
            <h2>{lead.nome}</h2>
            <p className="p-meta">{STATUS[lead.status]} · {[lead.categoria, lead.bairro, lead.cidade].filter(Boolean).join(' · ')}</p>
          </div>
          <button className="p-btn p-btn--fraco" onClick={fechar} aria-label="Fechar">Fechar</button>
        </div>

        <p className="p-links">
          {lead.whatsapp && <a href={waLink(lead.whatsapp)} target="_blank" rel="noreferrer">{formatTel(lead.whatsapp)}</a>}
          {maps && <a href={maps} target="_blank" rel="noreferrer">Google Maps</a>}
          {lead.instagram && <a href={`https://instagram.com/${lead.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">Instagram</a>}
          <a href={linkModelos(lead, { rastrear: false })} target="_blank" rel="noreferrer">Página de modelos dele</a>
        </p>
        {lead.nota != null && <p className="p-meta">★ {String(lead.nota).replace('.', ',')} · {lead.avaliacoes} avaliações · {lead.tipo_site === 'site_falso' ? `Link atual: ${lead.site_raw}` : 'Sem site'}</p>}

        <h3>Registrar</h3>
        <input className="p-resumo" value={resumo} onChange={(e) => setResumo(e.target.value)} placeholder="O que ele disse? (opcional, aparece no Início)" maxLength={300} />
        <div className="p-acoes p-acoes--quebra">
          {['respondeu', 'pediu_preco', 'proposta_enviada', 'pagou', 'perdeu', 'saiu'].map((t) => (
            <button key={t} className={`p-btn ${t === 'pagou' ? 'p-btn--forte' : ''}`} onClick={() => evento(t)}>{EVENTOS[t]}</button>
          ))}
          {lead.status === 'ganho' && <button className="p-btn" onClick={marcarRecorrente}>Virou recorrente</button>}
        </div>
        <label className="p-etapa">Etapa no CRM
          <select value={COLUNAS.some(([k]) => k === lead.status) ? lead.status : ''} onChange={async (e) => {
            const alvo = e.target.value
            if (!alvo) return
            if (alvo === 'ganho') { setPagando(true); return }
            await moverEtapa(lead.id, alvo); avisar(`Movido para ${STATUS[alvo]}`); carregar(); atualizar()
          }}>
            <option value="">Fora do CRM ({STATUS[lead.status]})</option>
            {COLUNAS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
          </select>
        </label>

        {pagando && (
          <form className="p-venda" onSubmit={confirmarPagamento}>
            <label>Produto
              <select value={venda.produto} onChange={(e) => setVenda((v) => ({ ...v, produto: e.target.value }))}>
                {Object.entries(PRODUTOS).map(([k, n]) => <option key={k} value={k}>{n}</option>)}
              </select>
            </label>
            <label>Valor pago (R$)<input type="number" min="0" step="1" value={venda.valor} onChange={(e) => setVenda((v) => ({ ...v, valor: e.target.value }))} /></label>
            <label>Mensalidade (R$)<input type="number" min="0" step="1" value={venda.valor_mensal} onChange={(e) => setVenda((v) => ({ ...v, valor_mensal: e.target.value }))} /></label>
            <div className="p-acoes"><button className="p-btn p-btn--forte">Salvar venda</button><button type="button" className="p-btn p-btn--fraco" onClick={() => setPagando(false)}>Cancelar</button></div>
          </form>
        )}

        <h3>Responder</h3>
        <select className="p-select" value={etapa} onChange={(e) => setEtapa(e.target.value)}>
          {RESPOSTAS.map((k) => <option key={k} value={k}>{ETAPAS[k]}</option>)}
        </select>
        {modelo ? <textarea className="p-texto" rows={5} value={texto} onChange={(e) => setTexto(e.target.value)} /> : <p className="p-erro">Sem mensagem ativa para esta etapa.</p>}
        <div className="p-acoes">
          <button className="p-btn p-btn--forte" disabled={!lead.whatsapp || !texto} onClick={enviar}>Enviar no WhatsApp</button>
          <button className="p-btn" onClick={() => navigator.clipboard.writeText(texto).then(() => avisar('Copiado'))}>Copiar</button>
        </div>

        {negocios.length > 0 && (
          <>
            <h3>Vendas</h3>
            <ul className="p-hist">
              {negocios.map((n) => (
                <li key={n.id}><strong>{PRODUTOS[n.produto] || n.produto}</strong> · {brl(n.valor)}{n.valor_mensal > 0 ? ` + ${brl(n.valor_mensal)}/mês` : ''}<small>{dataCurta(n.fechado_em)}</small></li>
              ))}
            </ul>
          </>
        )}

        <h3>Observações</h3>
        <textarea className="p-texto" rows={3} value={obs} onChange={(e) => setObs(e.target.value)} />
        <div className="p-acoes"><button className="p-btn" onClick={salvarObs}>Salvar observação</button></div>

        <h3>Histórico</h3>
        {hist.length === 0 ? <p className="p-meta">Nenhum contato ainda.</p> : (
          <ul className="p-hist">
            {hist.map((h, i) => (
              <li key={i}><strong>{h.titulo}</strong><small>{dataCurta(h.quando)}</small>{h.detalhe && <p>{h.detalhe}</p>}</li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  )
}

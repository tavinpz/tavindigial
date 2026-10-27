import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CONFIG } from '../config'
import { dataCurta } from './api'
import CartaoEnvio from './CartaoEnvio'
import Rajada from './Rajada'
import { usePainel } from './Painel'
import { canalDe, separarFilas } from './envio'

const coletaAtrasada = (iso) => !iso || Date.now() - new Date(iso).getTime() > 30 * 3600 * 1000

// Qual mensagem de follow-up cada lead recebe
const etapaDo = (l) => {
  if (l.status === 'proposta' || l.status === 'respondeu') return 'followup_proposta'
  if (l.status === 'ganho') return 'upsell_30d'
  return (l.total_envios || 0) <= 1 ? 'followup_1' : 'followup_2'
}

// Uma tela para o dia inteiro: primeiro os follow-ups, depois as primeiras mensagens
export default function Prospectar() {
  const { irPara } = usePainel()
  const [dados, setDados] = useState(null)
  const [feitos, setFeitos] = useState({ whatsapp: 0, instagram: 0 })
  const [ocultos, setOcultos] = useState(() => new Set())
  const [filtro, setFiltro] = useState('todos')
  const [canal, setCanal] = useState('whatsapp')
  const [qtd, setQtd] = useState(20)
  const [rajada, setRajada] = useState(false)
  const [erro, setErro] = useState('')

  async function carregar() {
    setErro('')
    const [fila, filaDm, follow, resumo, brief] = await Promise.all([
      supabase.from('v_fila_hoje').select('*'),
      supabase.from('v_fila_dm').select('*'),
      supabase.from('v_followups').select('*'),
      supabase.from('v_resumo').select('envios_hoje_wa,envios_hoje_dm,ultima_coleta,leads_24h').single(),
      supabase.from('briefings').select('id', { count: 'exact', head: true }).eq('status', 'novo'),
    ])
    if (fila.error) setErro(fila.error.message)
    // quem abriu a página e não respondeu vem primeiro
    const fups = (follow.data || []).sort((a, b) => (b.status === 'abriu') - (a.status === 'abriu'))
    const { wa, dm } = separarFilas(fila.data || [], filaDm.data || [], CONFIG.META_DM)
    setDados({ wa, dm, fups, resumo: resumo.data || {}, briefings: brief.count || 0 })
    setFeitos({ whatsapp: resumo.data?.envios_hoje_wa || 0, instagram: resumo.data?.envios_hoje_dm || 0 })
    setOcultos(new Set())
  }
  useEffect(() => { carregar() }, [])

  const concluir = (c) => (id, modo) => {
    setOcultos((s) => new Set(s).add(id))
    if (!modo) setFeitos((f) => ({ ...f, [c]: f[c] + 1 })) // só conta envio de verdade (não pular nem descartar)
  }

  if (dados === null) return <p className="p-vazio">Carregando…</p>

  const { resumo } = dados
  const fups = dados.fups.filter((l) => !ocultos.has(l.id))
  const dm = canal === 'instagram'
  const novos = (dm ? dados.dm : dados.wa).filter((l) => !ocultos.has(l.id) && (filtro === 'todos' || l.tipo_site === filtro))
  const META = { whatsapp: CONFIG.META_WHATS, instagram: CONFIG.META_DM }
  const total = feitos.whatsapp + feitos.instagram
  const pct = Math.min(100, Math.round((total / CONFIG.META_DIARIA) * 100))
  const atrasada = coletaAtrasada(resumo.ultima_coleta)

  return (
    <section>
      <div className="p-cab">
        <div>
          <h1>Prospectar</h1>
          <p className={`p-coleta ${atrasada ? 'p-coleta--alerta' : ''}`}>
            {resumo.ultima_coleta
              ? `Última coleta ${dataCurta(resumo.ultima_coleta)}, ${resumo.leads_24h} leads novos em 24h.`
              : 'Nenhuma coleta ainda.'}
            {atrasada && ' A coleta das 7h não trouxe nada há mais de 30 horas: veja em Coleta de leads.'}
          </p>
        </div>
        <div className="p-meta-dia" aria-label={`${total} de ${CONFIG.META_DIARIA} envios hoje`}>
          <strong>{total}<span>/{CONFIG.META_DIARIA}</span></strong>
          <div className="p-barra"><div style={{ width: `${pct}%` }} /></div>
          <small>WhatsApp {feitos.whatsapp}/{CONFIG.META_WHATS} · DM {feitos.instagram}/{CONFIG.META_DM}</small>
        </div>
      </div>

      {erro && <p className="p-erro">{erro}</p>}

      {dados.briefings > 0 && (
        <button className="p-aviso" onClick={() => irPara('briefings')}>
          {dados.briefings === 1 ? '1 cliente mandou o formulário.' : `${dados.briefings} clientes mandaram o formulário.`} Ver briefing
        </button>
      )}

      {fups.length > 0 && (
        <>
          <h2 className="p-h2">Follow-ups <span className="p-conta">{fups.length}</span></h2>
          <div className="p-lista">
            {fups.map((l) => <CartaoEnvio key={l.id} lead={l} etapa={etapaDo(l)} canal={canalDe(l)} mostrarStatus onFeito={concluir(canalDe(l))} />)}
          </div>
        </>
      )}

      <div className="p-h2-linha">
        <h2 className="p-h2">Primeira mensagem <span className="p-conta">{novos.length}</span></h2>
        <div className="p-canais" role="tablist" aria-label="Canal">
          {[['whatsapp', 'WhatsApp'], ['instagram', 'Instagram']].map(([c, n]) => (
            <button key={c} role="tab" aria-selected={canal === c} className={canal === c ? 'ativa' : ''} onClick={() => { setCanal(c); setQtd(20) }}>
              {n} <b>{feitos[c]}/{META[c]}</b>
            </button>
          ))}
        </div>
        <button className="p-btn p-btn--forte p-rajada-abrir" onClick={() => setRajada(true)} disabled={!novos.length}>Modo rajada</button>
        <div className="p-filtros" role="group" aria-label="Filtrar">
          {[['todos', 'Todos'], ['site_falso', 'Link fraco'], ['sem_site', 'Sem site']].map(([v, n]) => (
            <button key={v} className={filtro === v ? 'ativa' : ''} onClick={() => setFiltro(v)}>{n}</button>
          ))}
          <button onClick={carregar}>Atualizar</button>
        </div>
      </div>
      {dm && feitos.instagram >= CONFIG.META_DM && <p className="p-meta">Meta de DMs batida. Mais que isso por dia aumenta a chance de o Instagram limitar a conta.</p>}
      {!dm && feitos.whatsapp >= CONFIG.META_WHATS && <p className="p-meta">Meta do WhatsApp batida. Em número não oficial, passar disso aumenta o risco de bloqueio.</p>}
      {rajada && (
        <Rajada lista={novos} canal={canal} feitos={feitos[canal]} meta={META[canal]}
          onFeito={(id, modo) => concluir(canal)(id, modo)} fechar={() => setRajada(false)} />
      )}
      {novos.length === 0 ? (
        <div className="p-vazio"><p>{dm
          ? <><strong>Nenhum negócio com Instagram na fila.</strong> O @ é buscado sozinho a cada 10 minutos no link que o negócio colocou no Google. Você também pode colar o @ na ficha do lead.</>
          : <><strong>Fila vazia.</strong> A coleta roda sozinha todo dia às 7h. Para buscar agora, abra “Coleta de leads” no menu.</>}</p></div>
      ) : (
        <div className="p-lista">
          {novos.slice(0, qtd).map((l) => <CartaoEnvio key={`${canal}-${l.id}`} lead={l} etapa="abertura" canal={canal} onFeito={concluir(canal)} />)}
        </div>
      )}
      {novos.length > qtd && (
        <button className="p-btn p-mais" onClick={() => setQtd((n) => n + 20)}>Mostrar mais ({novos.length - qtd} restantes)</button>
      )}
    </section>
  )
}

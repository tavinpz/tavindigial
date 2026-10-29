import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CONFIG } from '../config'
import { dataCurta } from './api'
import CartaoEnvio from './CartaoEnvio'
import Rajada from './Rajada'
import { usePainel } from './Painel'
import { DESTINOS_WA, canalDe, salvarWaDestino, separarFilas, waDestino } from './envio'
import Acompanhamento, { BuscaLead } from './Acompanhamento'
import { ehCelular } from '../lib/msg'

const coletaAtrasada = (iso) => !iso || Date.now() - new Date(iso).getTime() > 30 * 3600 * 1000

// Qual mensagem de follow-up cada lead recebe
const etapaDo = (l) => {
  if (l.status === 'proposta' || l.status === 'respondeu') return 'followup_proposta'
  if (l.status === 'ganho') return 'upsell_30d'
  return (l.total_envios || 0) <= 1 ? 'followup_1' : 'followup_2'
}

const etapaResp = (l) => (l.tipo_resposta === 'pediu_preco' ? 'resp_preco' : 'resp_link')

// Uma tela para o dia inteiro: primeiro os follow-ups, depois as primeiras mensagens
export default function Prospectar() {
  const { irPara, versao } = usePainel()
  const [dados, setDados] = useState(null)
  const [feitos, setFeitos] = useState({ whatsapp: 0, instagram: 0 })
  const [ocultos, setOcultos] = useState(() => new Set())
  const [filtro, setFiltro] = useState('todos')
  const [canal, setCanal] = useState('whatsapp')
  const [qtd, setQtd] = useState(20)
  const [rajada, setRajada] = useState(null) // 'novos' | 'fups' | 'resp'
  const [destino, setDestinoSt] = useState(waDestino)
  const setDestino = (d) => { setDestinoSt(d); salvarWaDestino(d) }
  const [vista, setVistaSt] = useState(() => { try { return localStorage.getItem('p-prosp-vista') || 'hoje' } catch { return 'hoje' } })
  const setVista = (v) => { setVistaSt(v); try { localStorage.setItem('p-prosp-vista', v) } catch { /* sem storage */ } }
  const [erro, setErro] = useState('')

  async function carregar() {
    setErro('')
    const [fila, filaDm, follow, resumo, brief, resp] = await Promise.all([
      supabase.from('v_fila_hoje').select('*'),
      supabase.from('v_fila_dm').select('*'),
      supabase.from('v_followups').select('*'),
      supabase.from('v_resumo').select('envios_hoje_wa,envios_hoje_dm,ultima_coleta,leads_24h').single(),
      supabase.from('briefings').select('id', { count: 'exact', head: true }).eq('status', 'novo'),
      supabase.from('v_responderam').select('*'),
    ])
    if (fila.error) setErro(fila.error.message)
    // quem abriu a página e não respondeu vem primeiro
    const fups = (follow.data || []).sort((a, b) => (b.status === 'abriu') - (a.status === 'abriu'))
    const { wa, dm } = separarFilas(fila.data || [], filaDm.data || [], CONFIG.META_DM)
    setDados({ wa, dm, fups, resp: resp.data || [], resumo: resumo.data || {}, briefings: brief.count || 0 })
    setFeitos({ whatsapp: resumo.data?.envios_hoje_wa || 0, instagram: resumo.data?.envios_hoje_dm || 0 })
  }
  useEffect(() => { carregar() }, [versao]) // eslint-disable-line react-hooks/exhaustive-deps

  const concluir = (c) => (id, modo) => {
    if (modo === 'respondeu') { carregar(); return } // sobe para "Responderam"
    setOcultos((s) => new Set(s).add(id))
    if (!modo) setFeitos((f) => ({ ...f, [c]: f[c] + 1 })) // só conta envio de verdade (não pular nem descartar)
  }

  if (dados === null) return <p className="p-vazio">Carregando…</p>

  const { resumo } = dados
  const fups = dados.fups.filter((l) => !ocultos.has(l.id))
  const resp = dados.resp.filter((l) => !ocultos.has(l.id))
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

      <div className="a-barra">
        <BuscaLead destino={destino} />
        {!ehCelular() && (
          <div className="p-canais a-destino" role="group" aria-label="Onde abrir o WhatsApp">
            <span>WhatsApp abre no</span>
            {Object.entries(DESTINOS_WA).map(([k, t]) => (
              <button key={k} aria-pressed={destino === k} className={destino === k ? 'ativa' : ''} onClick={() => setDestino(k)}>{t}</button>
            ))}
          </div>
        )}
      </div>
      <div className="p-canais a-vistas" role="tablist" aria-label="Ver">
        {[['hoje', 'Hoje'], ['acomp', 'Acompanhamento']].map(([k, t]) => (
          <button key={k} role="tab" aria-selected={vista === k} className={vista === k ? 'ativa' : ''} onClick={() => setVista(k)}>{t}</button>
        ))}
      </div>
      {vista === 'acomp' ? <Acompanhamento destino={destino} /> : <>

      {erro && <p className="p-erro">{erro}</p>}

      {dados.briefings > 0 && (
        <button className="p-aviso" onClick={() => irPara('briefings')}>
          {dados.briefings === 1 ? '1 cliente mandou o formulário.' : `${dados.briefings} clientes mandaram o formulário.`} Ver briefing
        </button>
      )}

      <ol className="p-roteiro" aria-label="Ordem do dia">
        {[
          ['Responderam', resp.length ? `${resp.length} esperando` : 'em dia', !resp.length],
          ['Follow-ups', fups.length ? `${fups.length} para hoje` : 'em dia', !fups.length],
          ['WhatsApp', `${feitos.whatsapp}/${CONFIG.META_WHATS}`, feitos.whatsapp >= CONFIG.META_WHATS],
          ['Instagram', `${feitos.instagram}/${CONFIG.META_DM}`, feitos.instagram >= CONFIG.META_DM],
        ].map(([t, v, ok]) => <li key={t} className={ok ? 'ok' : ''}><b>{t}</b><span>{v}</span></li>)}
      </ol>

      {resp.length > 0 && (
        <>
          <div className="p-h2-linha">
            <h2 className="p-h2">Responderam <span className="p-conta">{resp.length}</span></h2>
            {resp.length > 1 && <button className="p-btn p-btn--forte p-rajada-abrir" onClick={() => setRajada('resp')}>Responder em sequência</button>}
          </div>
          <p className="p-meta">Responda primeiro: quem disse "pode mandar" recebe o link; quem perguntou o preço recebe o preço.</p>
          <div className="p-lista">
            {resp.map((l) => <CartaoEnvio key={l.id} lead={l} etapa={etapaResp(l)} canal={canalDe(l)} destino={destino} onFeito={concluir(canalDe(l))} />)}
          </div>
        </>
      )}

      {fups.length > 0 && (
        <>
          <div className="p-h2-linha">
            <h2 className="p-h2">Follow-ups <span className="p-conta">{fups.length}</span></h2>
            <button className="p-btn p-btn--forte p-rajada-abrir" onClick={() => setRajada('fups')}>Modo rajada</button>
          </div>
          <p className="p-meta">Um por vez com o texto pronto: Enter abre a conversa, R marca que respondeu, S pula.</p>
          <div className="p-lista">
            {fups.map((l) => <CartaoEnvio key={l.id} lead={l} etapa={etapaDo(l)} canal={canalDe(l)} destino={destino} mostrarStatus marcarResposta onFeito={concluir(canalDe(l))} />)}
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
        <button className="p-btn p-btn--forte p-rajada-abrir" onClick={() => setRajada('novos')} disabled={!novos.length}>Modo rajada</button>
        <div className="p-filtros" role="group" aria-label="Filtrar">
          {[['todos', 'Todos'], ['site_falso', 'Link fraco'], ['sem_site', 'Sem site']].map(([v, n]) => (
            <button key={v} className={filtro === v ? 'ativa' : ''} onClick={() => setFiltro(v)}>{n}</button>
          ))}
          <button onClick={carregar}>Atualizar</button>
        </div>
      </div>
      <p className="p-meta p-dica-canal">{dm
        ? 'Antes de cada DM: siga o perfil e curta 2 posts. Na rajada, a espera entre uma DM e outra começa em 90 s (dá para mudar no topo dela). Quando responderem, marque "Respondeu": o link vai depois.'
        : 'Melhor horário: dia útil, das 9h às 11h ou das 14h às 16h. Na rajada, a espera entre um envio e outro começa em 20 s (dá para mudar no topo dela). Quando responderem, marque "Respondeu": o link vai depois.'}</p>
      {dm && feitos.instagram >= CONFIG.META_DM && <p className="p-meta">Meta de DMs batida. Mais que isso por dia aumenta a chance de o Instagram limitar a conta.</p>}
      {!dm && feitos.whatsapp >= CONFIG.META_WHATS && <p className="p-meta">Meta do WhatsApp batida. Em número não oficial, passar disso aumenta o risco de bloqueio.</p>}
      {rajada === 'novos' && (
        <Rajada lista={novos} canal={canal} feitos={feitos[canal]} meta={META[canal]} destino={destino}
          onFeito={(id, modo) => concluir(canal)(id, modo)} fechar={() => setRajada(null)} />
      )}
      {rajada === 'fups' && (
        <Rajada lista={fups} etapaDe={etapaDo} tipo="followup" titulo="Rajada de follow-ups" destino={destino} marcarResposta
          onFeito={(id, modo) => { const l = fups.find((x) => x.id === id); concluir(l ? canalDe(l) : 'whatsapp')(id, modo) }} fechar={() => { setRajada(null); carregar() }} />
      )}
      {rajada === 'resp' && (
        <Rajada lista={resp} etapaDe={etapaResp} tipo="followup" titulo="Responder quem respondeu" destino={destino}
          onFeito={(id, modo) => { const l = resp.find((x) => x.id === id); concluir(l ? canalDe(l) : 'whatsapp')(id, modo) }} fechar={() => { setRajada(null); carregar() }} />
      )}
      {novos.length === 0 ? (
        <div className="p-vazio"><p>{dm
          ? <><strong>Nenhum negócio com Instagram na fila.</strong> O @ é buscado sozinho a cada 10 minutos no link que o negócio colocou no Google. Você também pode colar o @ na ficha do lead.</>
          : <><strong>Fila vazia.</strong> A coleta roda sozinha todo dia às 7h. Para buscar agora, abra “Coleta de leads” no menu.</>}</p></div>
      ) : (
        <div className="p-lista">
          {novos.slice(0, qtd).map((l) => <CartaoEnvio key={`${canal}-${l.id}`} lead={l} etapa="abertura" canal={canal} destino={destino} onFeito={concluir(canal)} />)}
        </div>
      )}
      {novos.length > qtd && (
        <button className="p-btn p-mais" onClick={() => setQtd((n) => n + 20)}>Mostrar mais ({novos.length - qtd} restantes)</button>
      )}
      </>}
    </section>
  )
}

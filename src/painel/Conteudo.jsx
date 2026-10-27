import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { dataCurta } from './api'
import { usePainel } from './Painel'

const ESTADOS = { ideia: 'Ideia', pronto: 'Pronto', agendado: 'Agendado', publicado: 'Publicado' }
const FORMATOS = { post: 'Post', carrossel: 'Carrossel', reel: 'Reel', story: 'Story' }
const IDEIAS = [
  ['carrossel', 'Antes e depois: Linktree → site', 'Mostre o link de bio antigo e a página nova do cliente (com permissão).'],
  ['reel', 'Site no celular em 15 segundos', 'Grave a tela rolando o site entregue. Legenda: pronto em 48 horas.'],
  ['post', 'Quanto custa um site de verdade', 'R$ 297 uma vez. Você só paga se aprovar.'],
  ['carrossel', '3 sinais de que o seu negócio perde cliente no Google', 'Sem site, link quebrado, Linktree no lugar do site.'],
]

export default function Conteudo() {
  const { avisar } = usePainel()
  const [lista, setLista] = useState(null)
  const [novo, setNovo] = useState({ formato: 'post', titulo: '', legenda: '', agendado_para: '' })

  async function carregar() {
    const { data } = await supabase.from('conteudo').select('*').order('agendado_para', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false })
    setLista(data || [])
  }
  useEffect(() => { carregar() }, [])

  async function adicionar(item) {
    const { error } = await supabase.from('conteudo').insert({
      formato: item.formato, titulo: item.titulo, legenda: item.legenda || null,
      agendado_para: item.agendado_para ? new Date(item.agendado_para).toISOString() : null,
      status: item.agendado_para ? 'agendado' : 'ideia',
    })
    if (error) { avisar('Não salvou'); return }
    avisar('Conteúdo adicionado'); setNovo({ formato: 'post', titulo: '', legenda: '', agendado_para: '' }); carregar()
  }
  async function mudar(c, status) { await supabase.from('conteudo').update({ status }).eq('id', c.id); carregar() }
  async function apagar(c) { if (!confirm('Apagar este conteúdo?')) return; await supabase.from('conteudo').delete().eq('id', c.id); carregar() }

  return (
    <section>
      <div className="p-cab"><div><h1>Conteúdo do @tavindigital</h1><p className="p-sub">Cada entrega vira um post. Agende no Meta Business Suite e marque aqui.</p></div></div>

      <form className="p-venda" onSubmit={(e) => { e.preventDefault(); if (novo.titulo) adicionar(novo) }}>
        <label>Formato
          <select value={novo.formato} onChange={(e) => setNovo({ ...novo, formato: e.target.value })}>
            {Object.entries(FORMATOS).map(([k, n]) => <option key={k} value={k}>{n}</option>)}
          </select>
        </label>
        <label>Título<input required value={novo.titulo} onChange={(e) => setNovo({ ...novo, titulo: e.target.value })} /></label>
        <label>Quando publicar<input type="datetime-local" value={novo.agendado_para} onChange={(e) => setNovo({ ...novo, agendado_para: e.target.value })} /></label>
        <label className="p-largo">Legenda<textarea rows={3} value={novo.legenda} onChange={(e) => setNovo({ ...novo, legenda: e.target.value })} /></label>
        <div className="p-acoes"><button className="p-btn p-btn--forte">Adicionar</button></div>
      </form>

      {lista && lista.length === 0 && (
        <div className="p-grupo">
          <h2>Ideias para começar</h2>
          <div className="p-lista">
            {IDEIAS.map(([formato, titulo, legenda]) => (
              <article key={titulo} className="p-cartao">
                <div className="p-cartao-topo"><strong className="p-nome-fixo">{titulo}</strong><span className="p-tag">{FORMATOS[formato]}</span></div>
                <p className="p-meta">{legenda}</p>
                <div className="p-acoes"><button className="p-btn" onClick={() => adicionar({ formato, titulo, legenda })}>Usar esta ideia</button></div>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="p-lista">
        {(lista || []).map((c) => (
          <article key={c.id} className="p-cartao">
            <div className="p-cartao-topo">
              <strong className="p-nome-fixo">{c.titulo}</strong>
              <span className="p-tag">{FORMATOS[c.formato] || c.formato}</span>
              <span className="p-tag">{ESTADOS[c.status]}</span>
            </div>
            {c.agendado_para && <p className="p-meta">Publicar em {dataCurta(c.agendado_para)}</p>}
            {c.legenda && <p className="p-legenda">{c.legenda}</p>}
            <div className="p-acoes p-acoes--quebra">
              {Object.entries(ESTADOS).filter(([k]) => k !== c.status).map(([k, n]) => <button key={k} className="p-btn" onClick={() => mudar(c, k)}>{n}</button>)}
              {c.legenda && <button className="p-btn p-btn--fraco" onClick={() => navigator.clipboard.writeText(c.legenda).then(() => avisar('Legenda copiada'))}>Copiar legenda</button>}
              <button className="p-btn p-btn--fraco" onClick={() => apagar(c)}>Apagar</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

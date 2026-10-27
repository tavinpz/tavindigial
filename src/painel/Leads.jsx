import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatTel } from '../lib/msg'
import { STATUS } from './api'
import { usePainel } from './Painel'

const NOVO = { nome: '', whatsapp: '', instagram: '', nicho: '', cidade: '', tipo_site: 'site_falso', site_raw: '' }

export default function Leads() {
  const { abrirLead, avisar } = usePainel()
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')
  const [tipo, setTipo] = useState('')
  const [lista, setLista] = useState(null)
  const [total, setTotal] = useState(0)
  const [novo, setNovo] = useState(null)

  async function carregar() {
    let q = supabase.from('leads').select('id,nome,nicho,cidade,bairro,whatsapp,instagram,tipo_site,status,avaliacoes,nota', { count: 'exact' })
    if (busca) q = q.ilike('nome', `%${busca}%`)
    if (status) q = q.eq('status', status)
    if (tipo) q = q.eq('tipo_site', tipo)
    const { data, count } = await q.order('created_at', { ascending: false }).limit(200)
    setLista(data || []); setTotal(count || 0)
  }
  useEffect(() => { const t = setTimeout(carregar, 250); return () => clearTimeout(t) }, [busca, status, tipo])

  async function salvarNovo(e) {
    e.preventDefault()
    let w = novo.whatsapp.replace(/\D/g, '')
    if (w && !w.startsWith('55')) w = `55${w}`
    const { error } = await supabase.from('leads').insert({
      nome: novo.nome, whatsapp: w || null, instagram: novo.instagram || null, nicho: novo.nicho || 'geral',
      cidade: novo.cidade || '—', tipo_site: novo.tipo_site, site_raw: novo.site_raw || null, origem_dado: 'manual',
    })
    if (error) { avisar('Não salvou: confira os campos'); return }
    avisar('Lead adicionado à fila'); setNovo(null); carregar()
  }

  return (
    <section>
      <div className="p-cab">
        <div><h1>Leads</h1><p className="p-sub">{total} no total. Os do Instagram você adiciona à mão aqui.</p></div>
        <button className="p-btn p-btn--forte" onClick={() => setNovo({ ...NOVO })}>Adicionar lead</button>
      </div>

      {novo && (
        <form className="p-venda" onSubmit={salvarNovo}>
          <label>Nome do negócio<input required value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} /></label>
          <label>WhatsApp<input inputMode="tel" value={novo.whatsapp} onChange={(e) => setNovo({ ...novo, whatsapp: e.target.value })} /></label>
          <label>Instagram<input value={novo.instagram} onChange={(e) => setNovo({ ...novo, instagram: e.target.value })} placeholder="@perfil" /></label>
          <label>Nicho<input value={novo.nicho} onChange={(e) => setNovo({ ...novo, nicho: e.target.value })} placeholder="estetica, odontologia…" /></label>
          <label>Cidade<input value={novo.cidade} onChange={(e) => setNovo({ ...novo, cidade: e.target.value })} /></label>
          <label>Situação
            <select value={novo.tipo_site} onChange={(e) => setNovo({ ...novo, tipo_site: e.target.value })}>
              <option value="site_falso">Link fraco (Linktree, Insta, app de agenda)</option>
              <option value="sem_site">Sem site</option>
            </select>
          </label>
          <label>Link atual (opcional)<input value={novo.site_raw} onChange={(e) => setNovo({ ...novo, site_raw: e.target.value })} placeholder="linktr.ee/..." /></label>
          <div className="p-acoes"><button className="p-btn p-btn--forte">Salvar</button><button type="button" className="p-btn p-btn--fraco" onClick={() => setNovo(null)}>Cancelar</button></div>
        </form>
      )}

      <div className="p-filtros">
        <input className="p-busca" placeholder="Buscar pelo nome" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar pelo nome" />
        <select className="p-select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option value="">Todos os status</option>
          {Object.entries(STATUS).map(([k, n]) => <option key={k} value={k}>{n}</option>)}
        </select>
        <select className="p-select" value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Situação do site">
          <option value="">Qualquer site</option>
          <option value="site_falso">Link fraco</option>
          <option value="sem_site">Sem site</option>
          <option value="site_ok">Já tem site</option>
        </select>
      </div>

      {lista === null ? <p className="p-vazio">Carregando…</p> : lista.length === 0 ? (
        <div className="p-vazio"><p>Nenhum lead com esses filtros.</p></div>
      ) : (
        <div className="p-tabela-wrap">
          <table className="p-tabela">
            <thead><tr><th>Negócio</th><th>Status</th><th>Site</th><th>Nota</th><th>WhatsApp</th><th>Instagram</th><th>Local</th></tr></thead>
            <tbody>
              {lista.map((l) => (
                <tr key={l.id} onClick={() => abrirLead(l.id)} tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && abrirLead(l.id)}>
                  <td><strong>{l.nome}</strong></td>
                  <td>{STATUS[l.status]}</td>
                  <td>{l.tipo_site === 'site_falso' ? 'Link fraco' : l.tipo_site === 'sem_site' ? 'Sem site' : 'Tem site'}</td>
                  <td>{l.nota != null ? `${String(l.nota).replace('.', ',')} (${l.avaliacoes})` : '—'}</td>
                  <td>{formatTel(l.whatsapp) || '—'}</td>
                  <td>{l.instagram || '—'}</td>
                  <td>{[l.bairro, l.cidade].filter(Boolean).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

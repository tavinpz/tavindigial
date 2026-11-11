import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { usePainel } from './Painel'
import { CANAIS, slugCanal } from './canais'

// Contas de cortes de um perfil central. Cada corte é um canal completo (integrações, quadro e métricas próprias);
// aqui fica a soma de todas e o número de cada uma, das últimas 24 h.
const num = (n) => Number(n || 0).toLocaleString('pt-BR')
const arroba = (s) => { const h = String(s || '').trim().replace(/^https?:\/\/(www\.)?[^/]+\/@?/, '').replace(/^@/, '').replace(/[/?].*$/, ''); return h ? `@${h}` : null }

export default function Cortes({ canal }) {
  const { views = {}, irPara, recarregarCanais, avisar } = usePainel()
  const filhos = CANAIS.filter((c) => c.pai === canal.id)
  const [f, setF] = useState({ nome: '', tiktok: '', instagram: '', youtube: '' })
  const [indo, setIndo] = useState(false)

  const v = (id) => views[id] || {}
  const total = filhos.reduce((s, c) => ({ views: s.views + (v(c.id).views || 0), curtidas: s.curtidas + (v(c.id).curtidas || 0) }), { views: 0, curtidas: 0 })
  const ranking = [...filhos].sort((a, b) => (v(b.id).views || 0) - (v(a.id).views || 0))
  const melhor = ranking[0] && (v(ranking[0].id).views || 0) > 0 ? ranking[0] : null

  async function criar(e) {
    e.preventDefault()
    const nome = f.nome.trim()
    if (!nome) return avisar('Dê um nome para a conta de cortes')
    setIndo(true)
    const id = slugCanal(nome) || `cortes-${Date.now()}`
    const sigla = nome.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'CT'
    const { error } = await supabase.from('canais').insert({ id, nome, tipo: 'shorts', cor: canal.cor || '#B600F6', sigla, pai: canal.id,
      tiktok: arroba(f.tiktok), instagram: arroba(f.instagram), youtube: f.youtube.trim() || null })
    if (error) { setIndo(false); return avisar(error.code === '23505' ? 'Já existe um canal com esse nome' : 'Não criou a conta') }
    if (f.tiktok.trim()) await supabase.rpc('salvar_tiktok_canal', { p_canal: id, p_handle: f.tiktok.trim() })
    if (f.youtube.trim()) await supabase.rpc('salvar_youtube_canal', { p_canal: id, p_ref: f.youtube.trim() })
    await recarregarCanais()
    setIndo(false)
    setF({ nome: '', tiktok: '', instagram: '', youtube: '' })
    avisar(`${nome} criada dentro de ${canal.nome}. Abra a conta → Integrações para ligar o Instagram e o YouTube.`)
  }

  return (
    <div className="ct">
      <div className="ct-resumo">
        <div><b>{num(total.views)}</b><span>views nas últimas 24 h, somando os cortes</span></div>
        <div><b>{num(total.curtidas)}</b><span>curtidas no TikTok hoje</span></div>
        <div><b>{filhos.length}</b><span>{filhos.length === 1 ? 'conta de cortes' : 'contas de cortes'}</span></div>
        <div><b>{melhor ? melhor.nome : '–'}</b><span>conta que mais cresceu hoje</span></div>
      </div>

      {filhos.length > 0 && (
        <ul className="ct-lista">
          {ranking.map((c, i) => {
            const x = v(c.id)
            const redes = x.por_rede || {}
            return (
              <li key={c.id}>
                <button type="button" onClick={() => irPara(`canal:${c.id}`)} aria-label={`Abrir ${c.nome}`}>
                  <span className="ct-pos">{i + 1}</span>
                  {c.logo ? <img src={c.logo} alt="" /> : <span className="ct-sigla" style={{ background: c.cor }}>{c.sigla}</span>}
                  <span className="ct-nome"><b>{c.nome}</b><small>{[c.tiktok && `TikTok ${c.tiktok}`, c.instagram && `IG ${c.instagram}`, c.youtube && 'YouTube'].filter(Boolean).join(' · ') || 'Sem rede ligada ainda'}</small></span>
                  <span className="ct-num"><b>{num(x.views)}</b><small>views 24 h</small></span>
                  <span className="ct-num ct-num--rede"><small>IG {num(redes.instagram)} · YT {num(redes.youtube)}</small><small>TikTok {num(x.curtidas)} curtidas</small></span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <form className="ct-nova" onSubmit={criar}>
        <h3>Nova conta de cortes</h3>
        <p className="p-meta">Vira um canal completo dentro de {canal.nome}: quadro de vídeos, integrações e métricas próprias.</p>
        <div className="ct-campos">
          <input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} placeholder="Nome (ex.: Tavin Cortes 1)" aria-label="Nome da conta" required />
          <input value={f.tiktok} onChange={(e) => setF({ ...f, tiktok: e.target.value })} placeholder="@ do TikTok" aria-label="@ do TikTok" />
          <input value={f.instagram} onChange={(e) => setF({ ...f, instagram: e.target.value })} placeholder="@ do Instagram" aria-label="@ do Instagram" />
          <input value={f.youtube} onChange={(e) => setF({ ...f, youtube: e.target.value })} placeholder="Link do YouTube" aria-label="Link do YouTube" />
        </div>
        <button type="submit" className="p-btn p-btn--forte" disabled={indo}>{indo ? 'Criando…' : 'Criar conta de cortes'}</button>
      </form>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { brl } from '../config'
import { ETAPAS } from './api'

const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '—')

export default function Metricas() {
  const [d, setD] = useState(null)

  useEffect(() => {
    Promise.all([
      supabase.from('v_resumo').select('*').single(),
      supabase.from('v_funil').select('*'),
      supabase.from('v_ab').select('*'),
      supabase.from('v_receita').select('*'),
    ]).then(([resumo, funil, ab, receita]) => {
      setD({ r: resumo.data || {}, funil: funil.data || [], ab: ab.data || [], receita: receita.data || [] })
    })
  }, [])

  if (!d) return <p className="p-vazio">Carregando…</p>
  const r = d.r

  return (
    <section>
      <div className="p-cab"><div><h1>Métricas</h1><p className="p-sub">Meta da primeira semana: 30% abrem a página e 10% respondem. Dia e mês no horário de Brasília.</p></div></div>

      <div className="p-numeros">
        <div><strong>{r.envios_hoje ?? 0}</strong><small>mensagens enviadas hoje</small></div>
        <div><strong>{r.abordados_7d ?? 0}</strong><small>negócios abordados em 7 dias</small></div>
        <div><strong>{pct(r.abriram_7d, r.abordados_7d)}</strong><small>abriram a página ({r.abriram_7d ?? 0})</small></div>
        <div><strong>{pct(r.responderam_7d, r.abordados_7d)}</strong><small>responderam ({r.responderam_7d ?? 0})</small></div>
        <div><strong>{pct(r.sairam_7d, r.abordados_7d)}</strong><small>pediram para sair ({r.sairam_7d ?? 0})</small></div>
        <div><strong>{brl(r.vendido_mes || 0)}</strong><small>vendido no mês ({r.vendas_mes ?? 0} vendas)</small></div>
        <div><strong>{brl(r.mrr || 0)}</strong><small>recorrente por mês</small></div>
        <div><strong>{r.fila ?? 0}</strong><small>na fila para abordar</small></div>
        <div><strong>{r.followups_pendentes ?? 0}</strong><small>follow-ups para hoje</small></div>
      </div>

      <h2 className="p-h2">Funil por nicho e cidade</h2>
      {d.funil.length === 0 ? <p className="p-meta">Sem envios ainda.</p> : (
        <div className="p-tabela-wrap">
          <table className="p-tabela">
            <thead><tr><th>Nicho</th><th>Cidade</th><th>Enviados</th><th>Abriram</th><th>Responderam</th><th>Pediram preço</th><th>Pagaram</th><th>Saíram</th></tr></thead>
            <tbody>
              {d.funil.map((f) => (
                <tr key={`${f.nicho}-${f.cidade}`}>
                  <td>{f.nicho}</td><td>{f.cidade}</td><td>{f.enviados}</td>
                  <td>{f.abriram} <small>{pct(f.abriram, f.enviados)}</small></td>
                  <td>{f.responderam} <small>{pct(f.responderam, f.enviados)}</small></td>
                  <td>{f.pediram_preco}</td>
                  <td>{f.pagaram} <small>{pct(f.pagaram, f.enviados)}</small></td>
                  <td>{f.sairam} <small>{pct(f.sairam, f.enviados)}</small></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="p-h2">Teste A/B das mensagens</h2>
      {d.ab.length === 0 ? <p className="p-meta">Aparece depois dos primeiros envios.</p> : (
        <div className="p-tabela-wrap">
          <table className="p-tabela">
            <thead><tr><th>Etapa</th><th>Público</th><th>Variante</th><th>Enviados</th><th>Abriram</th><th>Responderam</th><th>Pagaram</th></tr></thead>
            <tbody>
              {d.ab.map((a) => (
                <tr key={`${a.etapa}-${a.publico}-${a.variante}`}>
                  <td>{ETAPAS[a.etapa] || a.etapa}</td><td>{a.publico}</td><td>{a.variante}</td><td>{a.enviados}</td>
                  <td>{pct(a.abriram, a.enviados)}</td><td>{pct(a.responderam, a.enviados)}</td><td>{a.pagaram}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="p-h2">Receita por mês</h2>
      {d.receita.length === 0 ? <p className="p-meta">Registre a primeira venda no lead (botão “Pagou”).</p> : (
        <div className="p-tabela-wrap">
          <table className="p-tabela">
            <thead><tr><th>Mês</th><th>Vendido</th><th>Recorrente ativo</th></tr></thead>
            <tbody>
              {d.receita.map((r) => (
                <tr key={r.mes}><td>{new Date(r.mes).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</td><td>{brl(r.receita_avulsa)}</td><td>{brl(r.mrr_ativo)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

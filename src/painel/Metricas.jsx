import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { brl } from '../config'
import { ETAPAS, inicioDoDia } from './api'

const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : '—')

export default function Metricas() {
  const [d, setD] = useState(null)

  useEffect(() => {
    const semana = new Date(Date.now() - 7 * 86400000).toISOString()
    Promise.all([
      supabase.from('v_funil').select('*'),
      supabase.from('v_ab').select('*'),
      supabase.from('v_receita').select('*'),
      supabase.from('envios').select('id', { count: 'exact', head: true }).gte('enviado_em', inicioDoDia()),
      supabase.from('envios').select('id', { count: 'exact', head: true }).gte('enviado_em', semana),
      supabase.from('eventos').select('id', { count: 'exact', head: true }).eq('tipo', 'respondeu').gte('created_at', semana),
      supabase.from('negocios').select('valor_mensal').eq('status', 'ganho').eq('recorrente', true).eq('ativo', true),
      supabase.from('leads').select('id', { count: 'exact', head: true }).in('status', ['novo', 'na_fila']),
    ]).then(([funil, ab, receita, hoje, sem, resp, mrr, fila]) => {
      setD({
        funil: funil.data || [], ab: ab.data || [], receita: receita.data || [],
        hoje: hoje.count || 0, semana: sem.count || 0, respostas: resp.count || 0,
        mrr: (mrr.data || []).reduce((s, x) => s + Number(x.valor_mensal || 0), 0),
        fila: fila.count || 0,
      })
    })
  }, [])

  if (!d) return <p className="p-vazio">Carregando…</p>
  const mesAtual = d.receita[0]

  return (
    <section>
      <div className="p-cab"><div><h1>Métricas</h1><p className="p-sub">Meta da semana 1: 30% abrem a página, 10% respondem.</p></div></div>

      <div className="p-numeros">
        <div><strong>{d.hoje}</strong><small>envios hoje</small></div>
        <div><strong>{d.semana}</strong><small>envios em 7 dias</small></div>
        <div><strong>{pct(d.respostas, d.semana)}</strong><small>responderam (7 dias)</small></div>
        <div><strong>{brl(mesAtual?.receita_avulsa || 0)}</strong><small>vendido no mês</small></div>
        <div><strong>{brl(d.mrr)}</strong><small>recorrente por mês</small></div>
        <div><strong>{d.fila}</strong><small>leads na fila</small></div>
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
            <thead><tr><th>Mês</th><th>Vendas avulsas</th><th>Recorrente novo</th></tr></thead>
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

const N = ['Ana P.', 'Bruno L.', 'Carla M.', 'Diego S.', 'Elisa R.', 'Fábio T.', 'Gabi N.', 'Hugo A.', 'Íris C.', 'João V.', 'Karen D.', 'Léo F.', 'Marina C.', 'Nina B.', 'Otávio R.', 'Paula G.', 'Rafael D.', 'Sofia M.', 'Tiago L.', 'Vera S.', 'Lucas P.', 'Bia F.']
const proc = ['Limpeza', 'Clareamento', 'Manutenção do aparelho', 'Limpeza']
window.__DB.procedimentos = []
window.__RPC.instancias_para_envio = [{ id: 'i1', nome: 'Recepção Aurora', instance_name: 'recepcao_aurora', api_type: 'evolution', status: 'open' }]
window.__RPC.lembretes_conversa_painel = { lista: [] }
window.__RPC.procedimentos_resumo = [
  { id: 'p1', nome: 'Limpeza', intervalo_dias: 180, hora_envio: '09:00', ativo: true, instancia_id: 'i1', mensagem: 'Oi, {{nome}}! Já faz 6 meses da sua {{procedimento}}. Vamos marcar a próxima?', pacientes: 64, vencem_no_mes: 14, vencem_hoje: 1, atrasados: 0 },
  { id: 'p2', nome: 'Manutenção do aparelho', intervalo_dias: 30, hora_envio: '09:00', ativo: true, instancia_id: 'i1', mensagem: 'Oi, {{nome}}! Está na hora da {{procedimento}}. Qual dia fica bom?', pacientes: 22, vencem_no_mes: 6, vencem_hoje: 0, atrasados: 0 },
  { id: 'p3', nome: 'Clareamento', intervalo_dias: 365, hora_envio: '10:00', ativo: true, instancia_id: 'i1', mensagem: 'Oi, {{nome}}! Já faz um ano do seu {{procedimento}}. Quer fazer a manutenção?', pacientes: 18, vencem_no_mes: 2, vencem_hoje: 0, atrasados: 0 },
]
const ymd = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
window.__RPC.retorno_painel = (a) => {
  const [y, m] = String(a?.p_mes || '2026-11-01').split('-').map(Number)
  const passado = m === 10
  const dias = [1, 3, 4, 6, 8, 10, 11, 13, 15, 17, 18, 20, 22, 24, 25, 27, 29, 3, 10, 17, 24, 6]
  const st = (i) => passado ? ['agendou', 'respondeu', 'enviado', 'agendou', 'enviado', 'respondeu', 'agendou', 'enviado'][i % 8] : (dias[i] === 1 ? 'hoje' : i % 9 === 4 ? 'ja_agendado' : 'proximo')
  const lista = N.map((nome, i) => ({ lead_id: 'l' + i, nome, telefone: '5511900001' + String(i).padStart(3, '0'), procedimento: proc[i % 4], vence: ymd(y, m, dias[i]), status: st(i), realizado_em: ymd(y - (i % 3 === 1 ? 1 : 0), ((m + 5) % 12) + 1, dias[i]), enviado: passado, entregue: passado, enviado_em: passado ? ymd(y, m, dias[i]) + 'T12:00:00Z' : null }))
  return passado ? { no_mes: 22, hoje: 0, proximos_7: 0, enviados: 22, responderam: 11, agendaram: 6, falharam: 0, atrasados: 0, total_com_data: 104, lista }
    : { no_mes: 22, hoje: 1, proximos_7: 5, enviados: 0, responderam: 0, agendaram: 0, falharam: 0, atrasados: 0, total_com_data: 104, lista }
}

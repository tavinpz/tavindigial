const agora = Date.now()
const P = [
  ['Mariana Costa', 'outbound', 142, true, 'Mariana confirmou interesse no clareamento e agendou avaliação para amanhã às 9h. Vai levar a filha, que também quer avaliar.', 'AI: Oi, Mariana! Aqui é a Thata, assistente virtual da Clínica Aurora. Tudo bem?\nUser: Oi, tudo sim!\nAI: Você pediu informação sobre clareamento. Quer que eu veja um horário de avaliação?\nUser: Quero sim. Amanhã de manhã dá?\nAI: Tenho amanhã às 9h. Posso reservar?\nUser: Pode. Minha filha também quer avaliar, dá pra ir junto?\nAI: Dá sim! Reservo as duas às 9h, uma depois da outra. Te mando a confirmação por WhatsApp.\nUser: Perfeito, obrigada!'],
  ['Rafael Souza', 'outbound', 96, true, 'Rafael quer avaliação de implante. Agendado para quinta às 15h com o Dr. Henrique.', 'AI: Oi, Rafael! Aqui é a Thata, da Clínica Aurora.\nUser: Oi.\nAI: Posso marcar sua avaliação de implante?\nUser: Pode ser quinta à tarde.'],
  ['Juliana Prado', 'inbound', 64, false, 'Juliana ligou para tirar dúvida sobre limpeza. Pediu para ver horário na próxima semana.', 'User: Oi, queria saber da limpeza.\nAI: Claro, Juliana! Quer que eu veja um horário?'],
  ['Pedro Almeida', 'outbound', 0, false, '', ''],
  ['Camila Ferreira', 'outbound', 48, true, 'Camila confirmou a consulta de amanhã às 14h.', 'AI: Oi, Camila! Passando pra confirmar sua consulta amanhã às 14h.\nUser: Confirmado!'],
  ['Lucas Martins', 'outbound', 118, false, 'Lucas pediu para retornar no mês que vem.', 'AI: Oi, Lucas!\nUser: Oi, me liga mês que vem?'],
  ['Beatriz Lima', 'inbound', 75, true, 'Beatriz com dor de dente, encaixada hoje às 17h.', 'User: Tô com dor num dente.\nAI: Sinto muito, Beatriz! Tenho hoje às 17h.'],
  ['Thiago Rocha', 'outbound', 0, false, '', ''],
]
const itens = P.map(([nome, dir, dur, ok, resumo, tr], i) => ({ id: 'c' + i, vapi_call_id: 'v' + i, assistant_name: 'Thata', client_phone: '+5511987' + String(1000 + i * 137).padStart(6, '0'), call_direction: dir, duration_seconds: dur, success_evaluation: ok, started_at: new Date(agora - (i * 47 + 12) * 6e4).toISOString(), created_at: new Date(agora - (i * 47 + 12) * 6e4).toISOString(), summary: resumo, transcript: tr, status: dur ? 'ok' : 'falha', motivo_fim: dur ? null : 'customer-did-not-answer', gravacao_url: dur ? 'https://sb.mock/gravacao' + i + '.mp3' : null, number_id: 'n1', lead_id: 'm' + i, leads: { nome, foto_perfil: '' }, total_chamadas_lead: 1 }))
window.__RPC = { ...(window.__RPC || {}),
  ligacoes_listar: { itens, total: itens.length, agregados: { tempo_medio_seg: 92, hoje: 8, conversoes: 4 } },
  ligacoes_metricas: { total: 248, tempo_medio_conversa: 94, tempo_total_min: 312, sucessos: 61 },
  ligacoes_historico_lead: (a) => itens.filter((c) => c.lead_id === a.p_lead_id),
  ligacoes_transcript: (a) => ({ transcript: (itens.find((c) => c.id === a.p_id || c.id === a.p_call_id) || {}).transcript || '' }),
}
window.__DB.numeros = [{ number_id: 'n1', tipo: 'voz', provider: 'vapi', number_name: 'Recepção', tenant_id: 't1' }]
window.__DB.calls = itens

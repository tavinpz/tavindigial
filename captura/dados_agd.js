const d = new Date(); const h = (hh, mm = 0) => { const x = new Date(d); x.setHours(hh, mm, 0, 0); return x.toISOString() }
const enviado = (hh, mm) => { const x = new Date(d); x.setDate(x.getDate() - 1); x.setHours(hh, mm, 0, 0); return x.toISOString() }
const P = [
  ['Ana P.', 8, 0, { lembrete_enviado_em: enviado(9, 2), lembrete_entregue: true, respondeu_depois: true }],
  ['Bruno L.', 8, 40, { lembrete_enviado_em: enviado(9, 3), lembrete_entregue: true, respondeu_depois: true }],
  ['Carla M.', 9, 20, { lembrete_enviado_em: enviado(9, 3), lembrete_entregue: true, respondeu_depois: false }],
  ['Diego S.', 10, 0, { lembrete_enviado_em: enviado(9, 4), lembrete_entregue: true, respondeu_depois: true }],
  ['Elisa R.', 11, 20, { lembrete_enviado_em: enviado(9, 4), lembrete_entregue: true, respondeu_depois: true }],
  ['Fábio T.', 14, 0, { lembrete_proximo_em: h(12, 0) }],
  ['Gabi N.', 15, 30, { lembrete_proximo_em: h(13, 30) }],
  ['Hugo A.', 16, 10, { lembrete_enviado_em: enviado(9, 5), lembrete_entregue: true, respondeu_depois: true }],
]
window.__RPC.agenda_dia = P.map(([nome, hh, mm, x], i) => ({ evento_id: 'ev' + i, lead_id: 'l' + i, nome, telefone: '5511900001' + String(i).padStart(3, '0'), inicio: h(hh, mm), fim: h(hh, mm + 40), agenda: i % 2 ? 'Avaliação — Dra. Beatriz' : 'Limpeza — Dr. Rafael', status: 'confirmado', presenca: null, lembrete_entregue: false, respondeu_depois: false, lembretes_falharam: 0, remarcacoes: 0, minutos_ate: 60, ...x }))
window.__RPC.agenda_saude = null
window.__RPC.agenda_ocupacao = null
window.__RPC.agenda_saude = { marcados: 164, pela_ia: 97, cancelados: 9, remarcados: 14, compareceram: 131, faltaram: 8, sem_presenca: 6, antecedencia_media_h: 52, lembretes_enviados: 158, lembretes_entregues: 155, lembretes_falharam: 3 }
window.__RPC.agenda_contexto_envio = { mensagem_sugerida: 'Oi, Carla! Passando pra lembrar da sua consulta hoje às 9h20 com o Dr. Rafael. Posso confirmar sua presença?', conectado: true, instancia: 'Recepção Aurora', oficial: false, janela_aberta: true, precisa_modelo: false, ia_pausada: false, nao_perturbe: false, modelos: [] }
window.__RPC.agenda_lembrar_agora = { ok: true }

const agora = Date.now()
const hoje = new Date(); const dd = String(hoje.getDate()).padStart(2,'0'), mm = String(hoje.getMonth()+1).padStart(2,'0'), yy = hoje.getFullYear()
const hm = (ms) => { const d = new Date(ms); return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0') }
const H = (txt, horas) => txt.map(([q, t, min]) => `"${q}": ${t}\n${hm(agora - horas * 36e5 - min * 6e4)} - ${dd}/${mm}/${yy}`).join('\n---\n')
const conversas = [
  ['Mariana Costa', 'anuncio', H([['Lead', 'Oi! Vi o anúncio do clareamento. Quanto custa?', 8], ['Agent', 'Oi, Mariana! Aqui é a Thata, assistente virtual da Clínica Aurora 😊 O valor depende da avaliação. Quer que eu veja um horário pra você?', 6], ['Lead', 'Quero sim. Tem amanhã de manhã?', 4], ['Agent', 'Tenho amanhã às 9h ou às 10h30. Qual fica melhor?', 2], ['Lead', 'Posso levar minha filha junto? Ela também quer avaliar', 0]], 0.2), 0.2],
  ['Rafael Souza', 'whatsapp', H([['Lead', 'Oi, vocês fazem implante?', 6], ['Agent', 'Oi, Rafael! Fazemos sim. Posso marcar uma avaliação com o Dr. Henrique?', 4], ['Lead', 'Pode ser quinta', 2], ['Agent', 'Fechado! Quinta às 15h. Te mando a confirmação um dia antes 😊', 0]], 1), 1],
  ['Juliana Prado', 'indicacao', H([['Lead', 'A Paula me indicou, quero marcar limpeza', 2], ['Agent', 'Que bom, Juliana! Tenho sexta às 11h. Pode ser?', 0]], 2), 2],
  ['Pedro Almeida', 'anuncio', H([['Lead', 'Aparelho invisível vocês têm?', 2], ['Agent', 'Temos sim, Pedro! Quer saber como funciona a avaliação?', 0]], 3), 3],
  ['Camila Ferreira', 'whatsapp', H([['Agent', 'Oi, Camila! Passando pra confirmar sua consulta amanhã às 14h. Posso confirmar?', 2], ['Lead', 'Confirmado!', 0]], 4), 4],
  ['Lucas Martins', 'site', H([['Lead', 'Quanto tempo dura a consulta?', 2], ['Agent', 'Em média 40 minutos, Lucas.', 0]], 5), 5],
  ['Beatriz Lima', 'anuncio', H([['Lead', 'Tenho dor num dente, tem horário hoje?', 2], ['Agent', 'Sinto muito, Beatriz! Tenho hoje às 17h. Reservo pra você?', 0]], 6), 6],
  ['Thiago Rocha', 'importado', H([['Agent', 'Oi, Thiago! Faz 6 meses da sua última limpeza. Vamos agendar a revisão?', 0]], 7), 7],
]
window.__DB.leads = conversas.map(([nome, origem, h, horas], i) => ({ id: 'm' + i, tenant_id: 't1', nome, telefone: '5511987' + String(1000 + i * 137).padStart(6, '0'), origem, ultima_origem: i === 0 ? (window.__humano ? 'humano' : 'lead') : 'ia', etapa: i === 1 ? 'agendamento' : 'novo', ativo: true, arquivado: false, ia_pausada: !!window.__pausada && i === 0, ia_retorna_em: (window.__pausada && i === 0) ? (() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(8, 0, 0, 0); return d.toISOString() })() : null, nao_lida: i < 3, historico_mensagens: (window.__humano && i === 0) ? h + '\n---\n"Humano🟢": ' + window.__humano + '\n' + hm(agora) + ' - ' + dd + '/' + mm + '/' + yy : h, created_at: new Date(agora - 864e5 * (i + 1)).toISOString(), ultima_atividade: new Date(agora - 36e5 * horas).toISOString(), whatsapp_instance_id: 'wi1', tags: [], summary: JSON.stringify({ lead_summary: { resumo: 'Quer avaliar clareamento, pediu horário de manhã.', score: { valor: 82, nivel: 'quente' } } }) }))
window.__DB.whatsapp_instances = [{ id: 'wi1', tenant_id: 't1', nome: 'Recepção', instance_name: 'recepcao', numero: '5511940000000', status: 'connected', ativo: true, id_assistente: 'a1', tipo: 'evolution' }]
window.__DB.calls = []
window.__DB.dispatch_logs = []
window.__DB.calendar_events = []
window.__DB.vw_instance_assistente_foto = []
window.__RPC = { ...(window.__RPC || {}), fn_janela_wpp_aberta: true, origem_anuncio_opcoes: [] }

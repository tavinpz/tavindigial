const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
const dia = (d, h, m = 0) => { const x = new Date(hoje); x.setDate(x.getDate() + d); x.setHours(h, m, 0, 0); return x.toISOString() }
window.__DB.calendars = [
  { id: 'cal1', tenant_id: 't1', nome: 'Dr. Henrique — Implantes', cor: '#1BC371', ativo: true, duracao_minutos: 60, cadencia_agendamento_id: 'cd2', instancia_wpp_id: 'wi1', created_at: dia(-90, 9) },
  { id: 'cal2', tenant_id: 't1', nome: 'Dra. Paula — Clínico geral', cor: '#3B82F6', ativo: true, duracao_minutos: 30, cadencia_agendamento_id: 'cd2', instancia_wpp_id: 'wi1', created_at: dia(-80, 9) },
]
const P = ['Mariana Costa', 'Rafael Souza', 'Juliana Prado', 'Pedro Almeida', 'Camila Ferreira', 'Lucas Martins', 'Beatriz Lima', 'Thiago Rocha', 'Ana Paula', 'Bruno Lopes', 'Carla Nunes', 'Diego Santos', 'Elisa Ramos', 'Fábio Teixeira']
const T = ['Avaliação de implante', 'Limpeza', 'Avaliação de clareamento', 'Consulta de rotina', 'Retorno']
const ev = []
let k = 0
for (let d = -12; d <= 18; d++) {
  const n = [2, 3, 1, 4, 2, 0, 3][(d + 40) % 7]
  const wd = new Date(dia(d, 12)).getDay(); if (wd === 0 || wd === 6 || d === 10) continue
  for (let j = 0; j < n; j++) { const c = (k % 3 === 0) ? 'cal1' : 'cal2'; const h = 9 + ((k * 3 + j * 2) % 8); ev.push({ id: 'e' + k, tenant_id: 't1', calendar_id: c, titulo: T[k % T.length], lead_name: P[k % P.length], lead_nome: P[k % P.length], inicio: dia(d, h), fim: dia(d, h, c === 'cal1' ? 60 : 30), status: d < 0 ? 'concluido' : 'confirmado', origem: k % 4 === 3 ? 'manual' : 'ia', criado_por: k % 2 ? 'ia' : 'humano', lead_id: 'm' + (k % 8) }); k++ }
}
window.__DB.calendar_events = ev
const hr = []
for (const c of ['cal1', 'cal2']) for (let s = 1; s <= 5; s++) hr.push({ id: c + s, calendar_id: c, dia_semana: s, horario_inicio: '08:00', horario_fim: '18:00', ativo: true })
window.__DB.calendar_horarios = hr
window.__DB.calendar_bloqueios = window.__trava ? [{ id: 'b1', calendar_id: 'cal1', inicio: dia(10, 0), fim: dia(10, 23, 59), motivo: 'Congresso', ativo: true }] : []
window.__DB.calendar_intervalos = []
window.__DB.cadencias = [{ id: 'cd2', tenant_id: 't1', nome: 'Confirmação de consulta', tipo: 'agendamento', ativo: true }]
window.__DB.whatsapp_instances = [{ id: 'wi1', instance_name: 'recepcao', phone_number: '5511940000000', status: 'connected', api_type: 'evolution', ativo: true, deletado: false, tenant_id: 't1' }]
window.__DB.google_calendar_connections = []
window.__DB.clinicorp_accounts = []; window.__DB.clinica_experts_accounts = []; window.__DB.controle_odonto_accounts = []
window.__DB.tools = []

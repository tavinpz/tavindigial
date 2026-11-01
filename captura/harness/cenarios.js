// dados ficticios: Clinica Aurora (clinica e pacientes inventados)
const hoje = new Date()
const iso = (d = 0, h = 9, m = 0) => { const x = new Date(hoje); x.setDate(x.getDate() + d); x.setHours(h, m, 0, 0); return x.toISOString() }
export const ASSIST = [
  { id: 'a1', tenant_id: 't1', nome: 'Thata', name: 'Thata', assistant_name: 'Thata', vapi_id: 'v1', ativo: true, tipo: 'inbound', status: 'ativo', foto_url: '', canal: 'whatsapp', created_at: iso(-60) },
  { id: 'a2', tenant_id: 't1', nome: 'Lia', name: 'Lia', assistant_name: 'Lia', vapi_id: 'v2', ativo: true, tipo: 'campanha', status: 'ativo', foto_url: '', canal: 'voz', created_at: iso(-30) },
]
export function aplicar(c) {
  window.__DB = {
    assistentes: ASSIST,
    whatsapp_instances: [],
    numeros: [],
    calendars: [],
    leads: [],
    client_login: [{ tenant_id: 't1', empresa: 'Clínica Aurora', email: 'carla@clinicaaurora.com.br', plano_tipo: 'thata' }],
  }
  window.__RPC = { limite_estado_conta: null, fn_checar_nome_instancia: { ok: true, slug: 'recepcao_aurora' } }
  window.__FN = {}
  window.__FETCH = {}
}

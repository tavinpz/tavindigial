const fluxo = {
  start: 'b1',
  blocks: {
    b1: { say: 'Oi, {{nome}}! Aqui é a Thata, assistente virtual da Clínica Aurora 😊 Como posso te ajudar?', nota: '', wait: true, conditions: [{ if: 'Quer agendar avaliação', next: 'b2' }, { if: 'Pergunta preço', next: 'b3' }, { else: 'b4' }] },
    b2: { say: 'Perfeito! Tenho horários amanhã de manhã ou à tarde. Qual fica melhor pra você?', nota: 'Consultar a agenda antes de oferecer horários.', wait: true, conditions: [{ if: 'Escolheu horário', next: 'b5' }, { else: 'b4' }] },
    b3: { say: 'O valor depende da avaliação, que é rapidinha. Quer que eu veja um horário pra você?', nota: '', wait: true, conditions: [{ if: 'Aceitou', next: 'b2' }, { else: 'b4' }] },
    b4: { say: 'Sem problema! Fico à disposição se quiser agendar depois.', nota: '', wait: false, conditions: [{ else: 'b6' }] },
    b5: { say: 'Agendado! Te mando a confirmação um dia antes 😊', nota: 'Criar o evento na agenda.', wait: false, conditions: [{ else: 'b6' }] },
    b6: { tool: [{ tool_name: 'end_call_tool' }] },
  },
}
const pw = { identity: { name: 'Thata', company: 'Clínica Aurora', persona: 'Simpática, objetiva e acolhedora. Fala como a recepção da clínica.', tone: 'informal e direto', business: { description: 'Clínica odontológica em São Paulo', product: 'Implantes, clareamento, ortodontia e limpeza', differentials: 'Avaliação rápida e atendimento humanizado', address: 'Av. Paulista, 1000 · São Paulo' }, context: [] },
  flow: fluxo,
  rules: { max_chars: 300, limits: [{ title: 'Não passar valores sem avaliação' }, { title: 'Não dar diagnóstico' }], objections: [{ objection: 'Está caro', response: 'Entendo! Na avaliação o dentista monta o plano e mostra as opções de pagamento.' }, { objection: 'Vou pensar', response: 'Claro! Posso deixar um horário reservado pra você até amanhã?' }] } }
const pv = JSON.parse(JSON.stringify(pw)); pv.flow.blocks.b1.say = 'Oi, {{nome}}! Aqui é a Lia, assistente virtual da Clínica Aurora. Tudo bem?'
const iso = (d) => new Date(Date.now() + d * 864e5).toISOString()
window.__DB.assistentes = [
  { id: 'a1', tenant_id: 't1', tipo: 'thata', assistant_name: 'Thata', username: '@thata.aurora', vapi_id: 'v1', ativo: true, first_message: 'Oi! Aqui é a Thata, da Clínica Aurora.', assistant_prompt: JSON.stringify(pv), assistant_prompt_wpp: JSON.stringify(pw), foto_perfil: '', created_at: iso(-60), updated_at: iso(-1), number_id: 'n1' },
  { id: 'a2', tenant_id: 't1', tipo: 'lia', assistant_name: 'Lia', username: '@lia.aurora', vapi_id: 'v2', ativo: true, first_message: 'Oi! Aqui é a Lia, da Clínica Aurora.', assistant_prompt: JSON.stringify(pv), assistant_prompt_wpp: null, foto_perfil: '', created_at: iso(-30), updated_at: iso(-2), number_id: 'n2' },
  { id: 'a3', tenant_id: 't1', tipo: 'iris', assistant_name: 'Iris', username: '@iris.aurora', vapi_id: 'v3', ativo: true, first_message: 'Oi! Aqui é a Iris.', assistant_prompt: JSON.stringify(pv), assistant_prompt_wpp: JSON.stringify(pw), foto_perfil: '', created_at: iso(-20), updated_at: iso(-3), number_id: null },
]
window.__DB.whatsapp_instances = [{ id: 'wi1', tenant_id: 't1', nome: 'Recepção', instance_name: 'recepcao', numero: '5511940000000', status: 'connected', ativo: true, id_assistente: 'a1', deletado: false }]
window.__DB.tools = []
window.__DB.calendars = [{ id: 'cal1', tenant_id: 't1', nome: 'Dr. Henrique', ativo: true }]
window.__DB.numeros = [{ number_id: 'n1', tenant_id: 't1', tipo: 'telefonia', phone_number: '+551140000000', number_name: 'Recepção', deletado: false }, { number_id: 'n2', tenant_id: 't1', tipo: 'telefonia', phone_number: '+551140000001', number_name: 'Campanhas', deletado: false }]
window.__DB.assistente_webhooks = []

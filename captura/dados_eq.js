const iso = (d) => new Date(Date.now() + d * 864e5).toISOString()
window.__DB.tenant_membros = [
  { id: 'mb1', tenant_id: 't1', nome: 'Juliana Reis', cargo: 'Recepção', email: 'juliana@clinicaaurora.com.br', ativo: true, paginas: ['mensagens', 'agenda-do-dia', 'calendario', 'lista'], agendas: null, numeros: null, created_at: iso(-40), removido_em: null },
  { id: 'mb2', tenant_id: 't1', nome: 'Dr. Henrique Lopes', cargo: 'Dentista', email: 'henrique@clinicaaurora.com.br', ativo: true, paginas: ['calendario', 'agenda-do-dia'], agendas: ['cal1'], numeros: [], created_at: iso(-30), removido_em: null },
]
window.__DB.calendars = [{ id: 'cal1', tenant_id: 't1', nome: 'Dr. Henrique — Implantes', ativo: true }, { id: 'cal2', tenant_id: 't1', nome: 'Dra. Paula — Clínico geral', ativo: true }]
window.__DB.whatsapp_instances = [{ id: 'wi1', tenant_id: 't1', instance_name: 'recepcao', phone_number: '5511940000000', status: 'conectada', api_type: 'evolution', deletado: false }]
window.__FN = { ...(window.__FN || {}), equipe: { ok: true } }

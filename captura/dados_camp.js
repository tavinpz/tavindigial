const agora = new Date().toISOString()
window.__DB.whatsapp_instances = [{ id: 'i1', tenant_id: 't1', instance_name: 'recepcao_aurora', display_name: 'Recepção Aurora', status: 'open', api_type: 'evolution', phone_number: '5511987654321', deletado: false, configurado: true, assistente_id: 'a1' }]
window.__DB.cadencias = [{ id: 'cd1', tenant_id: 't1', nome: 'Reativação 3 toques', tipo: 'padrao', ativo: true, created_at: agora }]
window.__RPC.campanha_checar_contatos = []
window.__FETCH['cria-campanha-thata-v3'] = () => {
  const agora = new Date().toISOString()
  window.__DB.campanhas = [{ id: 'cp1', tenant_id: 't1', nome: 'Reativação de pacientes', tipo: 'whatsapp', status: 'rodando', deletado: false, start_at: agora, created_at: agora, cadencia_id: 'cd1', cadencia_nome: 'Reativação 3 toques', instance_id: 'i1', total_contatos: 312 }]
  const st = (i) => i < 186 ? 'executado' : i < 300 ? 'pendente' : 'agendado'
  window.__DB.campanha_leads = Array.from({ length: 312 }, (_, i) => ({ id: 'cl' + i, campanha_id: 'cp1', status: st(i) }))
  window.__RPC.campanhas_resumo = [{ campanha_id: 'cp1', enviados: 186, respostas: 41, respondeu: 41, agendou: 12, taxa_resposta: 22, taxa_agendamento: 6.5 }]; window.__RPC.get_conversas_campanhas = [{ campanha_id: 'cp1', conversas: 41 }]
  return { success: true, ok: true, campanha_id: 'cp1' }
}
window.__RPC.melhor_horario_disparo = []
window.__RPC.campanha_diagnostico_cadencia = null

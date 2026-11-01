const N = ['Ana P.', 'Bruno L.', 'Carla M.', 'Diego S.', 'Elisa R.', 'Fábio T.', 'Gabi N.', 'Hugo A.', 'Íris C.', 'João V.']
const agora = Date.now()
window.__DB.leads = N.map((nome, i) => ({ id: 'l' + i, tenant_id: 't1', nome, telefone: '5511900001' + String(i).padStart(3, '0'), etapa: 'novo', origem: 'whatsapp', ativo: true, arquivado: false, created_at: new Date(agora - i * 36e5 * 5).toISOString(), ultima_atividade: new Date(agora - i * 36e5 * 2).toISOString(), tags: [] }))
window.__DB.whatsapp_instances = [{ id: 'wi1', tenant_id: 't1', instance_name: 'recepcao', nome: 'Recepção', phone_number: '5511940000000', status: 'conectada', ativo: true, deletado: false }]
window.__DB.cadencias = [{ id: 'cd9', tenant_id: 't1', nome: 'Reativação de pacientes', tipo: 'padrao', ativo: true }]
window.__FETCH = { ...(window.__FETCH || {}), 'mapear-colunas-planilha': { origem: 'ia', mapeamento: { nome: 'Paciente', telefone: 'Celular', email: 'E-mail', data_entrada: 'Último atendimento', observacoes: 'Procedimento' }, campos: [
  { campo: 'nome', desc: 'Nome completo do lead', obrigatorio: true }, { campo: 'telefone', desc: 'Número de telefone ou WhatsApp', obrigatorio: true }, { campo: 'email', desc: 'Endereço de e-mail', obrigatorio: false },
  { campo: 'data_entrada', desc: 'Data de entrada no sistema', obrigatorio: false }, { campo: 'observacoes', desc: 'Observações ou notas', obrigatorio: false }] } }
window.__RPC = { ...(window.__RPC || {}), aniversario_publicos_resumo: [], criar_importacao_lote: 'imp1', importar_leads_lote: { inseridos: 236, duplicados: 3, invalidos: 1 }, finalizar_importacao_lote: true }

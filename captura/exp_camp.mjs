import { iniciar } from './lib.mjs'
const a = await iniciar()
await a.preparar(() => {
  window.__DB.whatsapp_instances = [{ id: 'i1', tenant_id: 't1', instance_name: 'recepcao_aurora', display_name: 'Recepção Aurora', status: 'open', api_type: 'evolution', phone_number: '5511987654321', deletado: false, configurado: true }]
  window.__DB.cadencias = [{ id: 'cd1', tenant_id: 't1', nome: 'Reativação 3 toques', tipo: 'padrao', ativo: true, created_at: new Date().toISOString() }]
})
await a.abrir('/campanhas', 'base', 1440, 1500)
await a.clicar('Nova Campanha')
await a.foto('c1', {}); await a.botoes()
await a.fim('exp')

const hoje = new Date(); const iso = (d) => { const x = new Date(hoje); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10) }
const semanas = []; for (let i = 8; i >= 1; i--) semanas.push({ inicio: iso(-7 * i).split('-').reverse().slice(0, 2).join('/'), fechada: true, atendidos: 150 + (8 - i) * 9 + (i % 3) * 12, agendaram: 34 + (8 - i) * 3 + (i % 2) * 4 })
const ph = Array.from({ length: 24 }, (_, h) => h < 7 || h > 21 ? [h === 23 ? 6 : 2, 0] : [Math.round(30 + 40 * Math.sin((h - 7) / 14 * Math.PI)), Math.round(7 + 12 * Math.sin((h - 7) / 14 * Math.PI))])
window.__RPC = { ...(window.__RPC || {}),
  dashboard_data: { metrics: { total_leads: 3184, leads_semana: 212, total_chamadas: 248, ag_hoje: 0, ag_semana: 61, camp_ativas: 3, leads_hoje: 0, chamadas_hoje: 0, campanhas_hoje: 0 }, metrics_por_periodo: { '7d': { leads: 212, chamadas: 41, campanhas: 2, agendamentos: 58 }, '14d': { leads: 401, chamadas: 77, campanhas: 3, agendamentos: 109 }, '30d': { leads: 864, chamadas: 158, campanhas: 3, agendamentos: 236 }, sempre: { leads: 3184, chamadas: 248, campanhas: 9, agendamentos: 812 } }, notificacoes: [], grafico_calls: [] },
  dashboard_resumo: (a) => { const dias = a.p_ini ? (Date.now() - new Date(a.p_ini).getTime()) / 864e5 : 999; const k = dias < 2 ? 0.04 : dias < 8 ? 0.25 : dias < 15 ? 0.5 : dias < 31 ? 1 : 3; const R = (v) => Math.round(v * k); return { resumo: { atendidos: R(642), novos: R(418), leads: R(864), marcadas: R(236), agendaram: R(191), marcadas_ia: R(204), pela_ia: R(204), taxa: 29.8, qualidade: 8.7, avaliadas: R(512) }, anterior: { taxa: 26.1 }, hoje: { total: 0, lista: [] }, horario_comercial: { inicio: 8, fim: 18, dias: [1, 2, 3, 4, 5] }, por_semana: semanas, por_hora: ph, por_dia: [[18, 3], [132, 41], [128, 39], [121, 35], [119, 37], [104, 29], [40, 7]], wpp_dias: [], wpp_semanas: {}, wpp_24h: null } },
  dashboard_ultimos_agendados: [
    { id: 'u1', nome: 'Mariana Costa', consulta: new Date(Date.now() + 864e5 + 36e5 * 2).toISOString(), pela_ia: true, quando: new Date(Date.now() - 36e5).toISOString() },
    { id: 'u2', nome: 'Rafael Souza', consulta: new Date(Date.now() + 864e5 * 3).toISOString(), pela_ia: true, quando: new Date(Date.now() - 36e5 * 3).toISOString() },
    { id: 'u3', nome: 'Juliana Prado', consulta: new Date(Date.now() + 864e5 * 4).toISOString(), pela_ia: false, quando: new Date(Date.now() - 36e5 * 5).toISOString() },
    { id: 'u4', nome: 'Camila Ferreira', consulta: new Date(Date.now() + 864e5 * 2).toISOString(), pela_ia: true, quando: new Date(Date.now() - 36e5 * 8).toISOString() },
  ],
  dashboard_padroes: { melhor_horario: { hora: 10, taxa: 34.2 }, hora_pico: { hora: 15, taxa: 22.8 }, qualidade: { nota: 8.7, avaliadas: 512 } },
}
window.__DB.notificacoes = []
window.__DB.clinica_perfil = [{ tenant_id: 't1', ticket_medio: 1800, taxa_conversao: 35 }]
window.__DB.insights_diarios = []
window.__DB.atividade_recente = []
const O = ['inbound_wpp', 'inbound_wpp', 'inbound_wpp', 'campanha', 'campanha', 'importado', 'inbound_voz', 'webhook', 'manual']
window.__DB.leads = Array.from({ length: 300 }, (_, i) => ({ id: 'd' + i, tenant_id: 't1', origem: O[i % O.length], arquivado: false, ativo: true, assistente_nome: 'Thata', created_at: new Date(Date.now() - (i % 30) * 864e5).toISOString() }))

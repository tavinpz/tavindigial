import { supabase } from '../lib/supabase'

export const STATUS = {
  novo: 'Novo', na_fila: 'Na fila', enviado: 'Enviado', abriu: 'Abriu a página', respondeu: 'Respondeu',
  proposta: 'Proposta', ganho: 'Fechou', recorrente: 'Recorrente', perdido: 'Perdido', nao_contatar: 'Não contatar',
}

export const ETAPAS = {
  abertura: 'Abertura',
  followup_1: 'Follow-up 1 (D+2)',
  followup_2: 'Follow-up 2 (último)',
  followup_proposta: 'Follow-up da proposta',
  resp_preco: 'Resposta: preço',
  resp_pensar: 'Resposta: vou pensar',
  resp_ja_tenho: 'Resposta: já tenho',
  pos_venda: 'Pós-venda',
  upsell_30d: 'Upsell 30 dias',
}

export const EVENTOS = {
  abriu_pagina: 'Abriu a página', respondeu: 'Respondeu', pediu_preco: 'Pediu preço',
  proposta_enviada: 'Proposta enviada', pagou: 'Pagou', perdeu: 'Perdido', saiu: 'Pediu para sair',
}

export const PRODUTOS = {
  bio: 'Bio animada', site: 'Site completo', hospedagem: 'Hospedagem', google: 'Kit Google',
  criativos: 'Criativos com IA', conteudo: 'Conteúdo com IA', ia_whatsapp: 'Atendente IA',
}

export async function carregarMensagens() {
  const { data, error } = await supabase.from('mensagens').select('*').order('etapa').order('variante')
  if (error) throw error
  return data || []
}

// Escolhe o template: mesma etapa, público do lead (ou "todos"), variante pedida (ou a primeira)
export function escolherMensagem(mensagens, etapa, publico = 'todos', variante = 'A') {
  const daEtapa = mensagens.filter((m) => m.ativo && m.etapa === etapa)
  const doPublico = daEtapa.filter((m) => m.publico === publico)
  const base = doPublico.length ? doPublico : daEtapa.filter((m) => m.publico === 'todos')
  return base.find((m) => m.variante === variante) || base[0] || null
}

export const variantesDe = (mensagens, etapa, publico) => {
  const base = mensagens.filter((m) => m.ativo && m.etapa === etapa && (m.publico === publico || m.publico === 'todos'))
  return [...new Set(base.map((m) => m.variante))].sort()
}

export async function registrarEnvio({ lead, mensagem, etapa, texto, canal = 'whatsapp' }) {
  const { error } = await supabase.from('envios').insert({
    lead_id: lead.id, mensagem_id: mensagem?.id ?? null, etapa, canal, texto_enviado: texto,
  })
  if (error) throw error
}

export async function registrarEvento(leadId, tipo, meta = {}) {
  const { error } = await supabase.from('eventos').insert({ lead_id: leadId, tipo, meta })
  if (error) throw error
}

export function inicioDoDia() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

// Dia de Brasília, calculado no banco (mesmo número da tela Métricas)
export async function enviosHoje() {
  const { data } = await supabase.from('v_resumo').select('envios_hoje').single()
  return data?.envios_hoje || 0
}

export const linkMaps = (lead) => {
  const m = String(lead?.observacoes || '').match(/Maps:\s*(\S+)/)
  if (m) return m[1]
  if (lead?.place_id) return `https://www.google.com/maps/place/?q=place_id:${lead.place_id}`
  return null
}

export const dataCurta = (iso) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''

export const tempoAtras = (iso) => {
  if (!iso) return ''
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 60) return `${min} min`
  const h = Math.round(min / 60)
  if (h < 48) return `${h} h`
  return `${Math.round(h / 24)} dias`
}

import { ehCelular, igDm, preencher, varianteDe, waLink } from '../lib/msg'
import { escolherMensagem, variantesDe } from './api'

// Canal padrão de um lead: o do último contato, senão WhatsApp se tiver, senão Instagram
export const canalDe = (lead) => lead.ultimo_canal || (lead.whatsapp ? 'whatsapp' : lead.instagram ? 'instagram' : 'whatsapp')

// A abertura por DM tem texto próprio
export const etapaNoCanal = (etapa, canal) => (etapa === 'abertura' && canal === 'instagram' ? 'abertura_dm' : etapa)

export function mensagemPara(mensagens, lead, etapa, variante) {
  const publico = lead.tipo_site === 'site_falso' ? 'site_falso' : 'sem_site'
  const vs = variantesDe(mensagens, etapa, publico)
  const pref = variante || varianteDe(lead.id)
  const v = vs.includes(pref) ? pref : vs[0] || 'A'
  const modelo = escolherMensagem(mensagens, etapa, publico, v)
  return { modelo, texto: modelo ? preencher(modelo.texto, lead) : '', variante: v, variantes: vs }
}

// O que fazer depois que a DM abre
export const dicaDm = (lead) => (ehCelular()
  ? `Texto copiado. Na conversa com ${lead.instagram}, segure e cole.`
  : `Texto copiado. No perfil ${lead.instagram}, clique em "Enviar mensagem" e cole (Ctrl+V).`)

// Abre o canal SEM await antes (o navegador só deixa abrir janela dentro do clique/soltar).
// No Instagram, copia o texto e abre a DM: é só colar e enviar.
export function abrirCanal(canal, lead, texto) {
  if (canal === 'instagram') {
    try { navigator.clipboard?.writeText(texto) } catch { /* sem permissão de cópia */ }
    // sempre na mesma aba do Instagram (não abre uma aba nova a cada DM)
    window.open(igDm(lead.instagram), 'tavin-instagram')
  } else {
    window.open(waLink(lead.whatsapp, texto), '_blank', 'noopener')
  }
}

// Todo o estoque nos dois canais. Os primeiros da DM (a meta do dia) saem da lista do WhatsApp
// para você não gastar no WhatsApp quem já está separado para a DM. Chamou por um canal, sai dos dois.
export function separarFilas(filaWa = [], filaDm = [], metaDm = 20) {
  const naDm = new Set(filaDm.slice(0, metaDm).map((l) => l.id))
  return { wa: filaWa.filter((l) => !naDm.has(l.id)), dm: filaDm }
}

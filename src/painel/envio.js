import { ehCelular, igDm, preencher, varianteDe, waLink } from '../lib/msg'
import { escolherMensagem, variantesDe } from './api'

// Canal padrão de um lead: o do último contato, senão WhatsApp se tiver, senão Instagram
export const canalDe = (lead) => lead.ultimo_canal || (lead.whatsapp ? 'whatsapp' : lead.instagram ? 'instagram' : 'whatsapp')

// A abertura por DM tem texto próprio
export const etapaNoCanal = (etapa, canal) => (etapa === 'abertura' && canal === 'instagram' ? 'abertura_dm' : etapa)

// Lead de fora do Brasil (EUA, Portugal): textos próprios, com preço em dólar/euro
export const ehGringo = (lead) => !!lead?.mercado && lead.mercado !== 'br'
export const extrasGringo = (lead) => (ehGringo(lead) ? { moeda: lead.pais === 'PT' ? '€' : 'US$', cidade: lead.cidade || lead.bairro || '' } : {})

// Qual texto o gringo recebe: inglês (americano), português de Portugal (negócio português) ou o de brasileiro fora
const BR_NOME = /brazil|brasil|brasileir|carioca|mineir|baian|ga[uú]ch|capixab|goian|paulist|nordestin|p[aã]o de queijo|a[cç]a[ií]|coxinha|tapioca|rod[ií]zio|feijoada|brigadeiro|churrascaria|guaran[aá]|picanha/i
export const publicoGringo = (lead) => (lead?.idioma === 'en' ? 'gringa_en' : lead?.pais === 'PT' && !BR_NOME.test(lead?.nome || '') ? 'portugal' : 'gringa')

export function mensagemPara(mensagens, lead, etapa, variante) {
  let publico = ehGringo(lead) ? publicoGringo(lead) : lead.tipo_site === 'site_falso' ? 'site_falso' : 'sem_site'
  // Portugal só tem textos próprios em algumas etapas: no resto usa o de gringo
  if (publico === 'portugal' && !mensagens.some((m) => m.ativo && m.etapa === etapa && m.publico === 'portugal')) publico = 'gringa'
  const vs = variantesDe(mensagens, etapa, publico)
  const pref = variante || varianteDe(lead.id, vs)
  const v = vs.includes(pref) ? pref : vs[0] || 'A'
  const modelo = escolherMensagem(mensagens, etapa, publico, v)
  return { modelo, texto: modelo ? preencher(modelo.texto, lead, extrasGringo(lead)) : '', variante: v, variantes: vs }
}

// O que fazer depois que a DM abre
export const dicaDm = (lead) => (ehCelular()
  ? `Texto copiado. Na conversa com ${lead.instagram}, segure e cole.`
  : `Texto copiado. No perfil ${lead.instagram}, clique em "Enviar mensagem" e cole (Ctrl+V).`)

// Onde abrir o WhatsApp (escolha fica salva neste navegador e vale para CRM, Prospectar e fichas):
//   'web' = na aba do WhatsApp Web que já está aberta (com a extensão "Tavin Painel · WhatsApp")
//   'app' = no app do WhatsApp do computador, direto, sem abrir página
export const DESTINOS_WA = { web: 'WhatsApp Web', app: 'App do WhatsApp' }
export const EVENTO_DESTINO = 'tavin-wa-destino'
export const waDestino = () => {
  if (ehCelular()) return 'app'
  try { return localStorage.getItem('wa-destino') === 'app' ? 'app' : 'web' } catch { return 'web' }
}
export const salvarWaDestino = (d) => {
  try { localStorage.setItem('wa-destino', d) } catch { /* sem storage */ }
  window.dispatchEvent(new CustomEvent(EVENTO_DESTINO, { detail: d }))
}
export const outroDestino = (d) => (d === 'web' ? 'app' : 'web')
// a extensão marca o <html> quando está instalada
export const temExtensao = () => typeof document !== 'undefined' && !!document.documentElement.dataset.tavinWa
// a 1ª versão recarregava a aba; a partir da 1.1 a conversa abre direto
export const extensaoVelha = () => typeof document !== 'undefined' && document.documentElement.dataset.tavinWa === '1'

const digitos = (n) => String(n || '').replace(/\D/g, '')
const waWeb = (numero, texto = '') => `https://web.whatsapp.com/send?phone=${digitos(numero)}${texto ? `&text=${encodeURIComponent(texto)}` : ''}`
const waApp = (numero, texto = '') => `whatsapp://send?phone=${digitos(numero)}${texto ? `&text=${encodeURIComponent(texto)}` : ''}`

// Abre o canal SEM await antes (o navegador só deixa abrir janela dentro do clique/soltar).
// No Instagram, copia o texto e abre a DM: é só colar e enviar.
let ultimo = null
export const ultimoDestinoWa = () => ultimo || waDestino()

export function abrirCanal(canal, lead, texto, destino) {
  if (canal === 'instagram') {
    try { navigator.clipboard?.writeText(texto) } catch { /* sem permissão de cópia */ }
    // sempre na mesma aba do Instagram (não abre uma aba nova a cada DM)
    window.open(igDm(lead.instagram), 'tavin-instagram')
    return
  }
  if (ehCelular()) { window.open(waLink(lead.whatsapp, texto), '_blank', 'noopener'); return }
  const d = destino || waDestino()
  ultimo = d
  if (d === 'app') {
    // abre o app do WhatsApp do computador direto (na 1ª vez o Chrome pergunta: marque "Sempre permitir")
    window.location.href = waApp(lead.whatsapp, texto)
  } else if (temExtensao()) {
    // a extensão leva a aba do WhatsApp Web que já está aberta até a conversa, com o texto pronto
    window.postMessage({ tipo: 'tavin-wa', phone: digitos(lead.whatsapp), text: texto || '' }, window.location.origin)
  } else {
    window.open(waWeb(lead.whatsapp, texto), 'tavin-whatsapp')
  }
}

// Todo o estoque nos dois canais. Os primeiros da DM (a meta do dia) saem da lista do WhatsApp
// para você não gastar no WhatsApp quem já está separado para a DM. Chamou por um canal, sai dos dois.
export function separarFilas(filaWa = [], filaDm = [], metaDm = 20) {
  const naDm = new Set(filaDm.slice(0, metaDm).map((l) => l.id))
  return { wa: filaWa.filter((l) => !naDm.has(l.id)), dm: filaDm }
}

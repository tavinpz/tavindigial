import { ehCelular, igDm, preencher, varianteDe, waLink } from '../lib/msg'
import { escolherMensagem, variantesDe } from './api'

// Canal padrão de um lead: o do último contato, senão WhatsApp se tiver, senão Instagram
export const canalDe = (lead) => lead.ultimo_canal || (lead.whatsapp ? 'whatsapp' : lead.instagram ? 'instagram' : 'whatsapp')

// A abertura por DM tem texto próprio
export const etapaNoCanal = (etapa, canal) => (etapa === 'abertura' && canal === 'instagram' ? 'abertura_dm' : etapa)

export function mensagemPara(mensagens, lead, etapa, variante) {
  const publico = lead.tipo_site === 'site_falso' ? 'site_falso' : 'sem_site'
  const vs = variantesDe(mensagens, etapa, publico)
  const pref = variante || varianteDe(lead.id, vs)
  const v = vs.includes(pref) ? pref : vs[0] || 'A'
  const modelo = escolherMensagem(mensagens, etapa, publico, v)
  return { modelo, texto: modelo ? preencher(modelo.texto, lead) : '', variante: v, variantes: vs }
}

// O que fazer depois que a DM abre
export const dicaDm = (lead) => (ehCelular()
  ? `Texto copiado. Na conversa com ${lead.instagram}, segure e cole.`
  : `Texto copiado. No perfil ${lead.instagram}, clique em "Enviar mensagem" e cole (Ctrl+V).`)

// Onde abrir o WhatsApp (escolha fica salva neste navegador):
//   'web'  = WhatsApp Web numa aba só do painel, reaproveitada a cada lead (não abre aba nova)
//   'link' = link wa.me, que abre o app do WhatsApp (o outro número)
export const DESTINOS_WA = { web: 'WhatsApp Web', link: 'App (link)' }
export const waDestino = () => {
  if (ehCelular()) return 'link'
  try { return localStorage.getItem('wa-destino') === 'link' ? 'link' : 'web' } catch { return 'web' }
}
export const salvarWaDestino = (d) => { try { localStorage.setItem('wa-destino', d) } catch { /* sem storage */ } }
export const outroDestino = (d) => (d === 'web' ? 'link' : 'web')

const waWeb = (numero, texto = '') =>
  `https://web.whatsapp.com/send?phone=${String(numero || '').replace(/\D/g, '')}${texto ? `&text=${encodeURIComponent(texto)}` : ''}`

// Abre o canal SEM await antes (o navegador só deixa abrir janela dentro do clique/soltar).
// No Instagram, copia o texto e abre a DM: é só colar e enviar.
export function abrirCanal(canal, lead, texto, destino) {
  if (canal === 'instagram') {
    try { navigator.clipboard?.writeText(texto) } catch { /* sem permissão de cópia */ }
    // sempre na mesma aba do Instagram (não abre uma aba nova a cada DM)
    window.open(igDm(lead.instagram), 'tavin-instagram')
  } else if ((destino || waDestino()) === 'web' && !ehCelular()) {
    // sempre a mesma aba: a conversa abre com o texto pronto, é só dar Enter
    window.open(waWeb(lead.whatsapp, texto), 'tavin-whatsapp')
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

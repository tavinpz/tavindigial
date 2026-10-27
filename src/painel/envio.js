import { igDm, preencher, varianteDe, waLink } from '../lib/msg'
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

// Abre o canal SEM await antes (o navegador só deixa abrir janela dentro do clique/soltar).
// No Instagram, copia o texto e abre a DM: é só colar e enviar.
export function abrirCanal(canal, lead, texto) {
  if (canal === 'instagram') {
    try { navigator.clipboard?.writeText(texto) } catch { /* sem permissão de cópia */ }
    window.open(igDm(lead.instagram), '_blank', 'noopener')
  } else {
    window.open(waLink(lead.whatsapp, texto), '_blank', 'noopener')
  }
}

// Divide a fila do dia entre os canais sem chamar o mesmo negócio duas vezes:
// quem tem Instagram vai para a DM (até a meta), o resto vai para o WhatsApp.
export function separarFilas(filaWa = [], filaDm = [], metaDm = 20) {
  const dm = filaDm.slice(0, metaDm)
  const naDm = new Set(dm.map((l) => l.id))
  const wa = filaWa.filter((l) => !naDm.has(l.id))
  // sobra de DM (além da meta) que não tem WhatsApp continua disponível no fim da lista de DM
  return { wa, dm: [...dm, ...filaDm.slice(metaDm).filter((l) => !l.whatsapp)] }
}

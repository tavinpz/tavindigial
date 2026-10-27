import { CONFIG } from '../config'

// Nichos que têm página de modelos própria. O resto cai em "geral".
const NICHOS = {
  tatuagem: ['tatua', 'tattoo', 'piercing'], // antes de saude: "estúdio" contém "studio"
  odontologia: ['odonto', 'dentista', 'dental', 'odontologia', 'ortodont', 'implante'],
  estetica: ['estetica', 'beleza', 'harmoniza', 'depila', 'sobrancelha', 'cilios', 'spa', 'salao', 'cabelo', 'unha', 'manicure', 'nail', 'lash', 'micropigment'],
  barbearia: ['barbearia', 'barbeiro', 'barber'],
  pet: ['pet', 'veterin', 'banho e tosa', 'tosa', 'animal'],
  saude: ['clinica', 'fisioterap', 'nutri', 'psicolog', 'medic', 'pilates', 'fono', 'academia', 'crossfit', 'personal', 'studio', 'funcional'],
  alimentacao: ['restaurante', 'lanchonete', 'pizzaria', 'hamburguer', 'doceria', 'confeitaria', 'cafeteria', 'padaria', 'acai', 'marmita'],
}

export const semAcento = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export function nichoSlug(nicho = '', categoria = '') {
  const alvo = semAcento(`${nicho} ${categoria}`)
  for (const [slug, termos] of Object.entries(NICHOS)) {
    if (termos.some((t) => alvo.includes(t))) return slug
  }
  return 'geral'
}

// Link curto para a página de modelos, personalizado e rastreado
export function linkModelos(lead, { rastrear = true } = {}) {
  const slug = nichoSlug(lead.nicho, lead.categoria)
  const n = encodeURIComponent(lead.nome || '')
  return `${CONFIG.SITE_URL}/m/${slug}?n=${n}${rastrear ? `&r=${lead.id}` : ''}`
}

// Para onde o link do Google leva hoje (usado nas mensagens de quem tem "site falso")
const DESTINOS = [
  [/linktr\.ee|beacons|bio\.link|linkin\.bio|taplink|lnk\.bio|linkme|solo\.to|linkr|bio\.site|linklist|campsite/, 'um Linktree'],
  [/instagram\./, 'o Instagram'],
  [/facebook\.|fb\.com/, 'o Facebook'],
  [/wa\.me|whatsapp\./, 'o WhatsApp direto, sem uma página'],
  [/tiktok\./, 'o TikTok'],
  [/ifood/, 'o iFood'],
  [/trinks|avec\.app|booksy|appbarber|gestaoparabarbearia|bemp\.online|bethelapp|agendasalao|simplesagenda|calendly/, 'a tela do app de agendamento'],
  [/bit\.ly|tinyurl|goo\.gl/, 'um link encurtado'],
  [/sites\.google|wixsite|business\.site|negocio\.site|g\.page/, 'uma página genérica'],
]
export function destinoDoLink(site = '') {
  const s = String(site || '').toLowerCase()
  if (!s) return 'lugar nenhum'
  const achado = DESTINOS.find(([re]) => re.test(s))
  return achado ? achado[1] : 'uma página que não é sua'
}

const nota = (v) => (v == null ? '' : String(Number(v).toFixed(1)).replace('.', ','))

export function preencher(texto, lead, extra = {}) {
  const vars = {
    negocio: lead?.nome || 'sua empresa',
    avaliacoes: lead?.avaliacoes ?? '',
    nota: nota(lead?.nota),
    link: lead ? linkModelos(lead) : CONFIG.SITE_URL,
    destino: destinoDoLink(lead?.site_raw),
    link_avaliacao: CONFIG.LINK_AVALIACAO || CONFIG.SITE_URL,
    ...extra,
  }
  return String(texto).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== '' ? String(vars[k]) : m))
}

// DM do Instagram: abre a conversa (o Instagram não aceita texto pronto no link)
export const igHandle = (ig = '') => String(ig || '').replace(/^@/, '').trim()
export const ehCelular = () => typeof navigator !== 'undefined'
  && (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches))
// Celular: ig.me abre a conversa direto no app. Computador: ig.me cai numa tela preta,
// então abre o perfil, que tem o botão "Enviar mensagem".
export const igDm = (ig) => (ehCelular() ? `https://ig.me/m/${igHandle(ig)}` : `https://www.instagram.com/${igHandle(ig)}/`)
export const igPerfil = (ig) => `https://instagram.com/${igHandle(ig)}`

export const waLink = (numero, texto = '') =>
  `https://wa.me/${String(numero || '').replace(/\D/g, '')}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`

// Divide os leads entre A e B de forma estável (o mesmo lead sempre cai na mesma variante)
export const varianteDe = (id = '') => (parseInt(String(id).replace(/-/g, '').slice(-2), 16) % 2 === 0 ? 'A' : 'B')

export const formatTel = (d = '') => {
  const x = String(d).replace(/\D/g, '').replace(/^55/, '')
  if (x.length === 11) return `(${x.slice(0, 2)}) ${x.slice(2, 7)}-${x.slice(7)}`
  if (x.length === 10) return `(${x.slice(0, 2)}) ${x.slice(2, 6)}-${x.slice(6)}`
  return d
}

export const slugDominio = (nome = '') =>
  semAcento(nome).replace(/[^a-z0-9]+/g, '').slice(0, 28) || 'suaempresa'

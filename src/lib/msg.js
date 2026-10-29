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

// Nome do jeito que uma pessoa escreveria: o Google vem com SEO no nome
// ("Pet Salon Aclimação - Banho & Tosa, Clínica Veterinária, Medicamentos..."), o que denuncia automação.
const GENERICAS = new Set(['tattoo', 'tatuagem', 'piercing', 'body', 'e', '&', 'de', 'do', 'da', 'pet', 'shop', 'banho', 'tosa', 'estudio', 'studio', 'design', 'sobrancelhas', 'clinica', 'veterinaria', 'barbearia', 'barber', 'barbershop', 'estetica', 'salao', 'beleza', 'odontologia', 'na', 'no', 'em'])
export function nomeCurto(nome = '') {
  const original = String(nome || '').trim()
  if (!original) return ''
  const partes = original.split(/\s[|\-–—/•·]\s?|\s?[|/•·]\s|[“”"(,]/).map((p) => p.trim()).filter(Boolean)
  const temNome = (p) => semAcento(p).split(/\s+/).some((w) => w && !GENERICAS.has(w))
  let curto = partes.find(temNome) || partes[0] || original
  if (curto.length > 40) curto = curto.slice(0, 40).replace(/\s+\S*$/, '')
  // TUDO EM MAIÚSCULA vira Nome Próprio
  if (curto === curto.toUpperCase() && /[A-ZÀ-Ú]{3}/.test(curto)) curto = curto.toLowerCase().replace(/(^|\s)(\S)/g, (_, e, l) => e + l.toUpperCase())
  return curto
}

// Link curto para a página de modelos, personalizado e rastreado
// Link curto e limpo da prévia: tavindigital.online/p/cilios-do-poder-00e3d653
// (o final é o começo do id do lead: serve para mostrar o nome certo e saber que a pessoa abriu)
export function linkModelos(lead, { rastrear = true } = {}) {
  if (lead?.id && /^[0-9a-f]{8}-/i.test(lead.id)) {
    const nome = semAcento(nomeCurto(lead.nome)).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32).replace(/-+$/, '') || 'previa'
    return `${CONFIG.SITE_URL}/p/${nome}-${lead.id.slice(0, 8).toLowerCase()}`
  }
  const slug = nichoSlug(lead.nicho, lead.categoria)
  const n = encodeURIComponent(nomeCurto(lead.nome))
  return `${CONFIG.SITE_URL}/m/${slug}?n=${n}${rastrear && lead.id ? `&r=${lead.id}` : ''}`
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

// "a {negocio}" com o artigo certo para o nome:
// "O Barbeiro da Esquina" -> "o Barbeiro da Esquina" | "Studio Kellynha" -> "o Studio Kellynha" |
// "Clínica Lumi" -> "a Clínica Lumi" | nome próprio sem pista ("Benbonzinho") -> sem artigo, "de Benbonzinho"
const MASCULINOS = ['barbeiro', 'studio', 'estudio', 'espaco', 'salao', 'pet', 'petshop', 'instituto', 'centro', 'consultorio', 'atelie', 'atelier', 'clube', 'grupo', 'ponto', 'canto', 'recanto', 'mundo', 'universo', 'laboratorio', 'hospital', 'dr', 'dr.', 'restaurante', 'bar', 'cafe', 'empório', 'emporio', 'box', 'lar', 'hotel', 'spa', 'shopping', 'mercado', 'jardim', 'cantinho', 'refugio', 'nucleo']
const FEMININOS = ['barbearia', 'clinica', 'casa', 'academia', 'estetica', 'loja', 'padaria', 'pizzaria', 'hamburgueria', 'doceria', 'confeitaria', 'cafeteria', 'farmacia', 'escola', 'oficina', 'dra', 'dra.', 'odonto', 'odontologia', 'vila', 'toca', 'boutique', 'agencia', 'tattoo', 'tatuagem', 'esmalteria', 'sorveteria', 'lanchonete', 'adega', 'distribuidora', 'rede', 'unidade', 'beauty']
function artigoDe(nome = '') {
  const m = String(nome).match(/^(o|a|os|as)\s+(.+)$/i)
  if (m) return [m[1].toLowerCase(), m[2]]
  const primeira = semAcento(String(nome).split(/\s+/)[0] || '')
  if (MASCULINOS.includes(primeira)) return ['o', nome]
  if (FEMININOS.includes(primeira)) return ['a', nome]
  return ['', nome]
}
function ajustarArtigo(texto, nome = '') {
  const [art, resto] = artigoDe(nome)
  const de = { o: 'do', a: 'da', os: 'dos', as: 'das', '': 'de' }[art]
  const pra = { o: 'pro', a: 'pra', os: 'pros', as: 'pras', '': 'pra' }[art]
  const cap = (w) => w[0].toUpperCase() + w.slice(1)
  return String(texto)
    .replace(/\b([Dd])a \{negocio\}/g, (_, d) => `${d === 'D' ? cap(de) : de} ${resto}`)
    .replace(/\bpra \{negocio\}/g, `${pra} ${resto}`)
    .replace(/\b([Aa]) \{negocio\}/g, (_, x) => (art ? `${x === 'A' ? cap(art) : art} ${resto}` : resto))
}

// Nome com artigo para frases fora das mensagens: comArtigo('O Barbeiro', 'da') -> 'do Barbeiro'
export const comArtigo = (nome = '', forma = 'a') => ajustarArtigo(`${forma} {negocio}`, nome).replace('{negocio}', nome)

export function preencher(texto, lead, extra = {}) {
  const nome = nomeCurto(lead?.nome)
  texto = ajustarArtigo(texto, nome)
  const vars = {
    negocio: nome || 'sua empresa',
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

// Divide os leads entre as variantes ativas (A, B, C, D...) de forma estável: o mesmo lead sempre cai na mesma
export const varianteDe = (id = '', variantes = ['A', 'B']) => {
  const vs = variantes.length ? variantes : ['A']
  const h = parseInt(String(id).replace(/-/g, '').slice(-6), 16) || 0
  return vs[h % vs.length]
}

export const formatTel = (d = '') => {
  const x = String(d).replace(/\D/g, '').replace(/^55/, '')
  if (x.length === 11) return `(${x.slice(0, 2)}) ${x.slice(2, 7)}-${x.slice(7)}`
  if (x.length === 10) return `(${x.slice(0, 2)}) ${x.slice(2, 6)}-${x.slice(6)}`
  return d
}

export const slugDominio = (nome = '') =>
  semAcento(nome).replace(/[^a-z0-9]+/g, '').slice(0, 28) || 'suaempresa'

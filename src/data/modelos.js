// =============================================================
// MODELOS E PORTFÓLIO
// - "url": link da demo ao vivo (seu projeto real). Vazio = mostra só a prévia.
// - "imagem": print do modelo (coloque em /public/modelos/ e use '/modelos/arquivo.jpg').
//   Vazio = o site desenha uma prévia automática com a cor do modelo.
// - "nichos": em quais páginas /m/<nicho> o modelo aparece. 'geral' aparece em todas.
// =============================================================

export const MODELOS = [
  { id: 'bio-estetica', titulo: 'Lumi', tipo: 'bio', nichos: ['estetica', 'saude'], cor: '#C77DD1', destaque: 'Bio animada em tons de seda', url: '/demo/estetica', imagem: '/modelos/bio-estetica.webp' },
  { id: 'bio-odonto', titulo: 'Prime', tipo: 'bio', nichos: ['odontologia', 'saude'], cor: '#0B8A86', destaque: 'Bio animada clara e confiável', url: '/demo/odontologia', imagem: '/modelos/bio-odonto.webp' },
  { id: 'bio-barbearia', titulo: 'Navalha', tipo: 'bio', nichos: ['barbearia', 'geral'], cor: '#C9A04A', destaque: 'Bio animada com poste de barbeiro', url: '/demo/barbearia', imagem: '/modelos/bio-barbearia.webp' },
  { id: 'sorriso', titulo: 'Clínica Clara', tipo: 'site', nichos: ['odontologia', 'saude'], cor: '#1F6FB2', destaque: 'Agendamento direto no WhatsApp', url: '', imagem: '' },
  { id: 'consultorio', titulo: 'Consultório', tipo: 'site', nichos: ['odontologia', 'saude'], cor: '#0F7B6C', destaque: 'Convênios, equipe e mapa', url: '', imagem: '' },
  { id: 'studio', titulo: 'Studio Beleza', tipo: 'site', nichos: ['estetica'], cor: '#B4456E', destaque: 'Tabela de serviços e antes/depois', url: '', imagem: '' },
  { id: 'navalha', titulo: 'Navalha', tipo: 'site', nichos: ['barbearia'], cor: '#2B2B2B', destaque: 'Horários, cortes e preços', url: '', imagem: '' },
  { id: 'patas', titulo: 'Patas', tipo: 'site', nichos: ['pet'], cor: '#E07A1F', destaque: 'Banho e tosa com agendamento', url: '', imagem: '' },
  { id: 'cardapio', titulo: 'Cardápio Vivo', tipo: 'site', nichos: ['alimentacao'], cor: '#C0392B', destaque: 'Cardápio, delivery e WhatsApp', url: '', imagem: '' },
  { id: 'local', titulo: 'Negócio Local', tipo: 'site', nichos: ['geral'], cor: '#1F2BC9', destaque: 'Serviços, avaliações e mapa', url: '', imagem: '' },
  { id: 'bio-geral', titulo: 'Bio Essencial', tipo: 'bio', nichos: ['geral'], cor: '#14866D', destaque: 'Todos os links numa página sua', url: '', imagem: '' },
]

export const NOMES_NICHO = {
  odontologia: 'clínicas odontológicas',
  estetica: 'estética e beleza',
  barbearia: 'barbearias',
  pet: 'pet shops e veterinárias',
  saude: 'clínicas e consultórios',
  alimentacao: 'restaurantes e delivery',
  geral: 'negócios locais',
}

export function modelosDoNicho(slug) {
  const doNicho = MODELOS.filter((m) => m.nichos.includes(slug))
  const gerais = MODELOS.filter((m) => m.nichos.includes('geral') && !doNicho.includes(m))
  return slug === 'geral' ? MODELOS : [...doNicho, ...gerais]
}

// Projetos reais entregues (com permissão do cliente). Aparece na home quando tiver itens.
// Ex.: { cliente: 'Clínica X', tipo: 'site', antes: 'Linktree', imagem: '/portfolio/clinica-x.jpg', url: 'https://...' }
export const PORTFOLIO = []

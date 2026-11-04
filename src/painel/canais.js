import { supabase } from '../lib/supabase'

// Canais de conteúdo do painel. A lista vem do banco (tabela `canais`): canal novo entra pelo Cofre → "Canais",
// sem mexer no código. Esta lista fixa é só o ponto de partida enquanto o banco carrega (ou se ele falhar).
//   tipo 'marca'  → carrosséis, estáticos e vídeos (Estudio), Instagram principal da Tavin Digital
//   tipo 'shorts' → vídeos curtos nas 3 redes (YouTube, TikTok, Instagram)
export const CANAIS = [
  { id: 'tavin-digital', nome: 'Tavin Digital', tipo: 'marca', cor: '#B600F6', sigla: 'TD', logo: '/marca/canais/tavin-digital.png' },
  { id: 'thata', nome: 'Thata', tipo: 'shorts', cor: '#15A763', sigla: 'TH', logo: 'https://imagens.thata.online/u/EG4ITp.png' },
  { id: 'concrete-atlas', nome: 'Concrete Atlas', tipo: 'shorts', cor: '#F2B33D', sigla: 'CA', logo: '/marca/canais/concrete-atlas.png' },
  { id: 'zerando', nome: 'Zerando', tipo: 'shorts', cor: '#FFC83D', sigla: 'ZE', logo: 'https://vvlzverpxojrecxysmhm.supabase.co/storage/v1/object/public/videos/marca/zerando.jpg' },
  { id: 'loadbearing', nome: 'LOADBEARING', tipo: 'shorts', cor: '#FF4D00', sigla: 'LB', logo: '/marca/canais/loadbearing.png' },
  { id: 'pawslated', nome: 'PAWSLATED', tipo: 'shorts', cor: '#C9F03A', sigla: 'PW', logo: '/marca/canais/pawslated.png' },
]

// Troca o conteúdo da lista (mesma referência: quem importou CANAIS vê a lista nova)
export async function carregarCanais() {
  const { data, error } = await supabase.from('canais').select('id,nome,tipo,cor,sigla,logo,instagram,youtube,tiktok,ativo').eq('ativo', true).order('criado_em')
  if (error || !data?.length) return CANAIS
  const novos = data.map((c) => ({ ...c, sigla: c.sigla || c.nome.slice(0, 2).toUpperCase() }))
  CANAIS.splice(0, CANAIS.length, ...novos)
  return CANAIS
}

export const slugCanal = (nome) => nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)

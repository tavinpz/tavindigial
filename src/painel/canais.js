// Canais de conteúdo do painel. Para criar um canal novo, é só adicionar uma linha:
//   tipo 'marca'  → carrosséis, estáticos e vídeos (Estudio), Instagram principal da Tavin Digital
//   tipo 'shorts' → vídeos curtos nas 3 redes (YouTube, TikTok, Instagram), como a Thata, o Concrete Atlas, o Zerando, a LOADBEARING e o PAWSLATED
// Os dois usam o mesmo pipeline (Pipeline.jsx): Prontos → Programados → Postados.
export const CANAIS = [
  { id: 'tavin-digital', nome: 'Tavin Digital', tipo: 'marca', cor: '#B600F6', sigla: 'TD', logo: '/marca/canais/tavin-digital.png' },
  { id: 'thata', nome: 'Thata', tipo: 'shorts', cor: '#15A763', sigla: 'TH', logo: 'https://imagens.thata.online/u/EG4ITp.png' },
  { id: 'concrete-atlas', nome: 'Concrete Atlas', tipo: 'shorts', cor: '#F2B33D', sigla: 'CA', logo: '/marca/canais/concrete-atlas.png' },
  { id: 'zerando', nome: 'Zerando', tipo: 'shorts', cor: '#FFC83D', sigla: 'ZE', logo: 'https://vvlzverpxojrecxysmhm.supabase.co/storage/v1/object/public/videos/marca/zerando.jpg' },
  { id: 'loadbearing', nome: 'LOADBEARING', tipo: 'shorts', cor: '#FF4D00', sigla: 'LB', logo: '/marca/canais/loadbearing.png' },
  { id: 'pawslated', nome: 'PAWSLATED', tipo: 'shorts', cor: '#C9F03A', sigla: 'PW', logo: '/marca/canais/pawslated.png' },
]

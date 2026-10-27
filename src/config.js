// =============================================================
// CONFIGURAÇÃO DA TAVIN DIGITAL — edite aqui e faça o deploy.
// Tudo que está marcado com PREENCHER precisa do seu dado real.
// =============================================================

export const CONFIG = {
  // Endereço público do site (sem barra no final). Sem VITE_SITE_URL, usa o endereço
  // onde o painel está aberto: assim o link da mensagem sempre funciona (workers.dev hoje, domínio depois).
  SITE_URL: import.meta.env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://tavindigital.online'),

  // WhatsApp de vendas (o chip), só números, com 55 + DDD
  WHATSAPP_VENDAS: import.meta.env.VITE_WHATSAPP_VENDAS || '5527992886950',

  INSTAGRAM: 'tavindigital',

  // PREENCHER: dados legais que aparecem no rodapé e nos termos
  RAZAO_SOCIAL: 'Tavin Digital',
  CNPJ: '',
  EMAIL: 'contato@tavindigital.online',
  CIDADE: 'São Paulo, SP',

  // PREENCHER quando criar o Perfil da Empresa no Google
  LINK_AVALIACAO: '',

  // Preços (aparecem no site e nas mensagens)
  // Bio animada = oferta de entrada. Site completo = upgrade.
  PRECO_BIO: 147,
  PRAZO_BIO_HORAS: 24,
  HOSPEDAGEM_BIO: 39,
  PRECO_SITE: 497,
  PRAZO_HORAS: 48,
  HOSPEDAGEM_SITE: 59,

  // Meta diária de envios mostrada no painel
  META_DIARIA: 40,

  // Supabase (a chave anon é pública por natureza; o acesso aos dados é travado por RLS)
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://vvlzverpxojrecxysmhm.supabase.co',
  SUPABASE_ANON_KEY:
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2bHp2ZXJweG9qcmVjeHlzbWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNzA1NDksImV4cCI6MjEwODY0NjU0OX0.cA1O58YolYHqmqTEu_IYvjiMk7UfAOcJ28QjKtErcPg',
}

export const brl = (v) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

import { Link } from 'react-router-dom'
import { waVendas } from './Layout'
import Logo from './Logo'
import '../styles/home.css'
import '../styles/servicos.css'

// Esteira de serviços da Tavin Digital: cada degrau prepara o próximo.
// Preço fixo só onde existe preço fixo; o resto é orçamento pelo WhatsApp.
const DEGRAUS = [
  {
    id: 'encontrado',
    titulo: 'Ser encontrado',
    resumo: 'O cliente procura no Google, no Instagram ou numa IA e cai numa página que passa confiança e leva direto para o seu WhatsApp.',
    itens: [
      { nome: 'Bio animada', desc: 'Substitui o Linktree com a sua marca: serviços, avaliações, mapa e botão de agendar. Pronta em 24 horas.' },
      { nome: 'Site completo', desc: 'Várias seções, galeria, equipe, horários e mapa, rápido no celular e feito para aparecer no Google.' },
      { nome: 'Landing page de venda', desc: 'Uma página focada numa oferta, num lançamento ou num anúncio, com o botão certo no lugar certo.' },
      { nome: 'Cardápio e catálogo digital', desc: 'Pratos, produtos ou serviços com foto e preço, com pedido pelo WhatsApp.' },
      { nome: 'Perfil do Google', desc: 'Criar ou arrumar o perfil da empresa: fotos, categorias, serviços, horários e respostas às avaliações.' },
      { nome: 'SEO para Google e IAs', desc: 'Organizar o site para o Google e o ChatGPT entenderem, confiarem e recomendarem o seu negócio.' },
    ],
  },
  {
    id: 'atencao',
    titulo: 'Chamar atenção',
    resumo: 'Conteúdo que faz parar o dedo: vídeo com ritmo, motion que explica e arte com a cara da sua marca.',
    itens: [
      { nome: 'Edição de vídeos e Reels', desc: 'Cortes, legendas animadas, ritmo, trilha e capa. Pacotes mensais para postar todo dia.' },
      { nome: 'Vídeos em motion', desc: 'Animações para explicar um serviço, lançar uma oferta ou abrir um anúncio.' },
      { nome: 'Criativos para anúncios', desc: 'Roteiros, vídeos e artes pensados para Meta Ads, com variações para testar.' },
      { nome: 'Design para redes', desc: 'Carrosséis, posts e stories no padrão da sua identidade visual.' },
      { nome: 'Identidade visual', desc: 'Logo, cores, tipografia e um guia para tudo sair com a mesma cara.' },
      { nome: 'Cortes e canais de vídeo', desc: 'Contas de cortes, canais no YouTube e vídeos longos produzidos e programados para você.' },
    ],
  },
  {
    id: 'sistema',
    titulo: 'Vender no automático',
    resumo: 'Um sistema completo de vendas no GoHighLevel: nenhum contato se perde, o follow-up acontece sozinho e você vê tudo num painel.',
    itens: [
      { nome: 'CRM com funil de vendas', desc: 'Cada contato numa etapa, do primeiro oi ao cliente fechado, com valor e próximo passo.' },
      { nome: 'Caixa de entrada única', desc: 'WhatsApp, Instagram, Facebook, e-mail e SMS no mesmo lugar, para a equipe toda.' },
      { nome: 'Agenda online com lembretes', desc: 'O cliente marca sozinho e recebe confirmação e lembrete, e as faltas caem.' },
      { nome: 'Follow-up e reativação', desc: 'Sequências automáticas para quem não respondeu e campanhas para trazer clientes antigos de volta.' },
      { nome: 'Avaliações no Google no automático', desc: 'Depois do atendimento o cliente recebe o link para avaliar, e a sua nota sobe.' },
      { nome: 'Funis, formulários e pagamentos', desc: 'Páginas de captura, quizzes, propostas e cobrança ligados direto no funil.' },
      { nome: 'E-mail e WhatsApp em massa', desc: 'Campanhas segmentadas para a sua base, com resultado medido.' },
      { nome: 'Relatórios de vendas', desc: 'Quantos leads entraram, de onde vieram, quantos fecharam e quanto entrou.' },
    ],
  },
  {
    id: 'medida',
    titulo: 'Feito sob medida',
    resumo: 'Quando o pronto não serve: automações, inteligência artificial e sistemas desenhados para a sua operação.',
    itens: [
      { nome: 'Atendente com IA no WhatsApp', desc: 'Responde na hora, tira dúvidas, qualifica e agenda, 24 horas por dia.' },
      { nome: 'Atendente com IA por voz', desc: 'Liga e atende ligações com voz natural para confirmar, remarcar e vender.' },
      { nome: 'Automações e integrações', desc: 'Planilha, CRM, WhatsApp, e-mail, agenda e pagamentos conversando entre si.' },
      { nome: 'Postagem automática', desc: 'Conteúdo programado e publicado sozinho no Instagram, TikTok e YouTube.' },
      { nome: 'Painéis e sistemas internos', desc: 'Painéis de gestão, métricas e ferramentas com a regra do seu negócio.' },
      { nome: 'Prospecção automatizada', desc: 'Lista de clientes ideais, mensagens e e-mails saindo sozinhos, com respostas no seu CRM.' },
    ],
  },
]

const PASSOS = [
  ['Conversa rápida', 'Você conta o que precisa pelo WhatsApp. Sem reunião longa.'],
  ['Prévia grátis', 'Você vê a página ou a proposta pronta antes de pagar.'],
  ['Aprova e começa', 'Você só segue se gostar do que viu.'],
  ['No ar', 'Entregamos, ajustamos e você acompanha o resultado.'],
]

export default function Servicos() {
  return (
    <div className="td pronto sv">
      <header className="sv-topo">
        <div className="td-sec">
          <Link to="/" className="sv-logo" aria-label="Tavin Digital, página inicial"><Logo /></Link>
          <a className="td-btn td-btn--p td-btn--sm" href={waVendas('Oi! Vi a página de serviços e quero conversar.')} target="_blank" rel="noreferrer">Falar no WhatsApp</a>
        </div>
      </header>

      <main>
        <section className="sv-heroi">
          <div className="td-sec">
            <h1 className="td-h1 sv-h1">Do primeiro clique<em>ao cliente fechado.</em></h1>
            <p className="td-lede">Uma esteira completa para negócios locais: começa pela página, cresce com vídeo e Google, e vira um sistema que vende sozinho. Você entra no degrau que faz sentido hoje.</p>
            <div className="sv-cta">
              <a className="td-btn td-btn--p td-btn--lg" href={waVendas('Oi! Quero entender qual serviço faz sentido para o meu negócio.')} target="_blank" rel="noreferrer">Conversar no WhatsApp</a>
              <a className="td-btn td-btn--s td-btn--lg" href="#esteira">Ver os serviços</a>
            </div>
          </div>
          <ol className="sv-escada" aria-label="Os quatro degraus">
            {DEGRAUS.map((d, i) => (
              <li key={d.id} style={{ '--i': i }}><a href={`#${d.id}`}><b>{i + 1}</b>{d.titulo}</a></li>
            ))}
          </ol>
        </section>

        <section className="sv-esteira td-claro" id="esteira" aria-label="Serviços">
          <div className="td-sec">
            {DEGRAUS.map((d, i) => (
              <article key={d.id} id={d.id} className="sv-degrau">
                <header className="sv-degrau-cab">
                  <span className="sv-num" aria-hidden="true">{i + 1}</span>
                  <div>
                    <h2>{d.titulo}</h2>
                    <p>{d.resumo}</p>
                  </div>
                </header>
                <ul className="sv-itens">
                  {d.itens.map((it) => (
                    <li key={it.nome}>
                      <h3>{it.nome}</h3>
                      <p>{it.desc}</p>
                      <a className="sv-quero" href={waVendas(`Oi! Tenho interesse em: ${it.nome}.`)} target="_blank" rel="noreferrer">Quero este</a>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="sv-passos">
          <div className="td-sec">
            <h2 className="td-h2">Como funciona<em>em qualquer degrau.</em></h2>
            <ol>
              {PASSOS.map(([t, p]) => <li key={t}><h3>{t}</h3><p>{p}</p></li>)}
            </ol>
          </div>
        </section>

        <section className="sv-fim">
          <div className="td-sec">
            <h2 className="td-h2 td-h2--xl">Não sabe por onde começar?<em>Me conta o seu negócio.</em></h2>
            <a className="td-btn td-btn--p td-btn--lg" href={waVendas('Oi! Não sei por onde começar, pode me ajudar?')} target="_blank" rel="noreferrer">Conversar no WhatsApp</a>
          </div>
        </section>
      </main>

      <footer className="sv-rodape">
        <div className="td-sec">
          <span>Tavin Digital · CNPJ 51.314.254/0001-15</span>
          <span><Link to="/">Início</Link> · <Link to="/termos">Termos</Link> · <Link to="/privacidade">Privacidade</Link></span>
        </div>
      </footer>
    </div>
  )
}

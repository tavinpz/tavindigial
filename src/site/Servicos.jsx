import { Link } from 'react-router-dom'
import { CONFIG, brl } from '../config'
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
    resumo: 'O cliente procura no Google, no Instagram ou numa IA e encontra uma página que passa confiança e leva para o WhatsApp.',
    itens: [
      { nome: 'Bio animada', desc: 'Substitui o Linktree: serviços, preços, avaliações e botão de agendar.', preco: `${brl(CONFIG.PRECO_BIO)}`, nota: `pronta em ${CONFIG.PRAZO_BIO_HORAS}h · + ${brl(CONFIG.HOSPEDAGEM_BIO)}/mês` },
      { nome: 'Site completo', desc: 'Várias seções, fotos, equipe, mapa e horários, feito para aparecer no Google.', preco: `${brl(CONFIG.PRECO_SITE)}`, nota: `pronto em ${CONFIG.PRAZO_HORAS}h · + ${brl(CONFIG.HOSPEDAGEM_SITE)}/mês` },
      { nome: 'Perfil no Google', desc: 'Criar ou arrumar o perfil da empresa: fotos, categorias, serviços e horários certos.' },
      { nome: 'SEO para IAs', desc: 'Organizar o seu site para o ChatGPT e o Google entenderem e recomendarem o seu negócio.' },
    ],
  },
  {
    id: 'atencao',
    titulo: 'Chamar atenção',
    resumo: 'Conteúdo que faz parar o dedo: vídeo bem editado, motion e arte com a cara da sua marca.',
    itens: [
      { nome: 'Edição de vídeos e Reels', desc: 'Cortes, legendas, ritmo e capa. Pacotes por quantidade no mês.' },
      { nome: 'Vídeos em motion', desc: 'Animações para explicar um serviço, lançar uma oferta ou abrir um anúncio.' },
      { nome: 'Design para redes', desc: 'Carrosséis, posts e artes no padrão da sua identidade visual.' },
    ],
  },
  {
    id: 'sistema',
    titulo: 'Vender no automático',
    resumo: 'Um sistema completo de vendas no GoHighLevel: nenhum contato se perde e o follow-up acontece sozinho.',
    itens: [
      { nome: 'CRM com funil de vendas', desc: 'Cada contato numa etapa, do primeiro oi ao cliente fechado.' },
      { nome: 'Agenda online com lembretes', desc: 'O cliente marca sozinho e recebe lembrete no WhatsApp e no e-mail.' },
      { nome: 'Caixa de entrada única', desc: 'WhatsApp, Instagram, Facebook, e-mail e SMS no mesmo lugar.' },
      { nome: 'Follow-up e reativação', desc: 'Mensagens automáticas para quem não respondeu e para clientes antigos.' },
      { nome: 'Pedido de avaliação', desc: 'Depois do atendimento, o cliente recebe o link para avaliar no Google.' },
      { nome: 'Páginas de captura', desc: 'Formulários e landing pages ligados direto no funil.' },
    ],
  },
  {
    id: 'medida',
    titulo: 'Feito sob medida',
    resumo: 'Quando o pronto não serve: automações, integrações e sistemas desenhados para a sua operação.',
    itens: [
      { nome: 'Automações e integrações', desc: 'Planilha, CRM, WhatsApp, e-mail e pagamentos conversando entre si.' },
      { nome: 'Assistentes com IA', desc: 'Atendimento e triagem no WhatsApp com inteligência artificial.' },
      { nome: 'Sistemas e painéis', desc: 'Painéis de gestão e ferramentas internas com a sua regra de negócio.' },
    ],
  },
]

const PASSOS = [
  ['Conversa rápida', 'Você conta o que precisa pelo WhatsApp. Sem reunião longa.'],
  ['Prévia grátis', 'Você vê a página ou a proposta pronta antes de pagar.'],
  ['Aprova e começa', 'Metade para começar, metade na entrega.'],
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
                      {it.preco
                        ? <p className="sv-preco"><b>{it.preco}</b><small>{it.nota}</small></p>
                        : <p className="sv-preco sv-preco--orc">Orçamento pelo WhatsApp</p>}
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

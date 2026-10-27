import { Link } from 'react-router-dom'
import { CONFIG, brl } from '../config'
import { MODELOS, PORTFOLIO } from '../data/modelos'
import { Header, Footer, Dominio, Previa, waVendas } from './Layout'

const EXTRAS = [
  ['Perfil no Google otimizado + pedido de avaliação automático', `${brl(97)}/mês`],
  ['Criativos com IA (10 artes ou fotos de produto)', brl(197)],
  ['Conteúdo com IA (12 posts no mês, agendados)', `${brl(297)}/mês`],
  ['Atendente com IA no WhatsApp', 'sob consulta'],
]

const DUVIDAS = [
  ['Preciso pagar antes de ver?', `Não. Você escolhe o modelo, preenche um formulário de 3 minutos e recebe a versão com a cara do seu negócio. Só paga 50% quando aprovar o começo, e os outros 50% quando o site estiver no ar.`],
  ['O que vem no site?', 'Página completa no celular e no computador: apresentação, serviços, fotos, avaliações, horários, mapa e botão direto para o seu WhatsApp. Domínio próprio (.com.br) incluso na hospedagem.'],
  ['E a mensalidade, é obrigatória?', `A hospedagem de ${brl(CONFIG.HOSPEDAGEM_SITE)}/mês mantém o site no ar com domínio, segurança e 1 ajuste por mês. Sem fidelidade: cancele quando quiser.`],
  ['Já tenho Instagram. Por que um site?', 'Quem te procura no Google encontra endereço, telefone e avaliações, mas não tem onde ver seus serviços e preços. O site responde isso e leva a pessoa direto para o WhatsApp.'],
  ['Quanto tempo leva?', `Até ${CONFIG.PRAZO_HORAS} horas depois que você manda as informações e as fotos.`],
]

export default function Home() {
  const vitrine = MODELOS.slice(0, 6)
  return (
    <>
      <Header />
      <main>
        <section className="s-hero">
          <div className="s-wrap">
            <Dominio antes="linktr.ee/suaclinica" depois="suaclinica.com.br" />
            <h1>Troque o Linktree por um site de verdade, pronto em {CONFIG.PRAZO_HORAS} horas.</h1>
            <p className="s-lead">
              {brl(CONFIG.PRECO_SITE)} uma vez, com o WhatsApp, o mapa e os seus serviços numa página só. Você só paga se aprovar.
            </p>
            <div className="s-acoes">
              <a className="s-btn" href="#modelos">Ver modelos</a>
              <a className="s-btn s-btn--linha" href={waVendas('Oi! Quero um site para o meu negócio.')} target="_blank" rel="noreferrer">
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section className="s-sec" id="modelos">
          <div className="s-wrap">
            <h2>Escolha um modelo. A gente coloca a sua cara nele.</h2>
            <p className="s-sub">Cada modelo vira o site do seu negócio com o seu nome, cores, fotos e serviços.</p>
            <div className="s-grade">
              {vitrine.map((m) => (
                <article key={m.id} className="s-modelo">
                  <Previa modelo={m} />
                  <div className="info">
                    <h3>{m.titulo}</h3>
                    <span className="tipo">{m.tipo === 'bio' ? 'Página de bio' : 'Site completo'} · {m.destaque}</span>
                    <div className="acoes">
                      {m.url && <a className="s-btn s-btn--linha" href={m.url} target="_blank" rel="noreferrer">Ver ao vivo</a>}
                      <a className="s-btn" href={waVendas(`Oi! Quero o modelo ${m.titulo} para o meu negócio.`)} target="_blank" rel="noreferrer">
                        Quero este modelo
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <p style={{ marginTop: 24 }}>
              <Link to="/m/geral">Ver todos os modelos</Link>
            </p>
          </div>
        </section>

        {PORTFOLIO.length > 0 && (
          <section className="s-sec">
            <div className="s-wrap">
              <h2>Sites que já estão no ar</h2>
              <p className="s-sub">Clientes reais, publicados com permissão.</p>
              <div className="s-grade">
                {PORTFOLIO.map((p) => (
                  <article key={p.cliente} className="s-modelo">
                    {p.imagem && <img src={p.imagem} alt={`Site de ${p.cliente}`} loading="lazy" />}
                    <div className="info">
                      <h3>{p.cliente}</h3>
                      <span className="tipo">{p.antes ? `Antes: ${p.antes}` : p.tipo}</span>
                      {p.url && <div className="acoes"><a className="s-btn s-btn--linha" href={p.url} target="_blank" rel="noreferrer">Ver o site</a></div>}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="s-sec" id="como-funciona">
          <div className="s-wrap">
            <h2>Do primeiro “oi” ao site no ar</h2>
            <ol className="s-passos">
              <li><h3>Escolha o modelo</h3><p>Veja os modelos do seu tipo de negócio e diga qual combina.</p></li>
              <li><h3>Mande as informações</h3><p>Um formulário de 3 minutos: serviços, horários, endereço e fotos.</p></li>
              <li><h3>Aprove a prévia</h3><p>Você vê o site pronto com a sua cara e pede o ajuste que quiser.</p></li>
              <li><h3>Site no ar</h3><p>Em até {CONFIG.PRAZO_HORAS} horas, com domínio próprio e o WhatsApp funcionando.</p></li>
            </ol>
          </div>
        </section>

        <section className="s-sec" id="precos">
          <div className="s-wrap">
            <h2>Preço fechado, sem surpresa</h2>
            <div className="s-precos">
              <article className="s-preco s-preco--principal">
                <h3>Site completo</h3>
                <p className="valor">{brl(CONFIG.PRECO_SITE)}</p>
                <p className="mensal">+ {brl(CONFIG.HOSPEDAGEM_SITE)}/mês de hospedagem e domínio</p>
                <ul>
                  <li>Página completa para celular e computador</li>
                  <li>Botão de WhatsApp, mapa e horários</li>
                  <li>Serviços, fotos e avaliações</li>
                  <li>Domínio .com.br incluso</li>
                  <li>1 ajuste por mês sem custo</li>
                </ul>
                <a className="s-btn" href={waVendas('Oi! Quero o site completo.')} target="_blank" rel="noreferrer">Quero o site</a>
              </article>
              <article className="s-preco">
                <h3>Página de bio</h3>
                <p className="valor">{brl(CONFIG.PRECO_BIO)}</p>
                <p className="mensal">+ {brl(CONFIG.HOSPEDAGEM_BIO)}/mês de hospedagem</p>
                <ul>
                  <li>Substitui o Linktree com a sua marca</li>
                  <li>Agendamento direto no WhatsApp</li>
                  <li>Pronta em até 24 horas</li>
                </ul>
                <a className="s-btn s-btn--linha" href={waVendas('Oi! Quero a página de bio.')} target="_blank" rel="noreferrer">Quero a página de bio</a>
              </article>
            </div>
            <p className="s-garantia">
              <strong>Você só paga se aprovar.</strong> Metade para começar, depois que você vê a prévia, e metade quando o site estiver no ar.
            </p>
            <h2 style={{ marginTop: 56, fontSize: 26 }}>Para quem já tem site com a gente</h2>
            <ul className="s-extras">
              {EXTRAS.map(([nome, preco]) => (
                <li key={nome}><span>{nome}</span><span>{preco}</span></li>
              ))}
            </ul>
          </div>
        </section>

        <section className="s-sec s-faq" id="duvidas">
          <div className="s-wrap">
            <h2>Dúvidas comuns</h2>
            {DUVIDAS.map(([p, r]) => (
              <details key={p}><summary>{p}</summary><p>{r}</p></details>
            ))}
          </div>
        </section>

        <section className="s-sec">
          <div className="s-wrap">
            <h2>Seu negócio já é bom. Falta o site mostrar isso.</h2>
            <div className="s-acoes" style={{ marginTop: 20 }}>
              <a className="s-btn" href={waVendas('Oi! Quero um site para o meu negócio.')} target="_blank" rel="noreferrer">Falar no WhatsApp</a>
              <Link className="s-btn s-btn--linha" to="/briefing">Já quero começar</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <a className="s-btn s-flutuante" href={waVendas('Oi! Quero um site para o meu negócio.')} target="_blank" rel="noreferrer">WhatsApp</a>
    </>
  )
}

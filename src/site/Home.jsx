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
  ['Preciso pagar antes de ver?', `Não. Você escolhe o modelo, preenche um formulário de 3 minutos e recebe a versão com a cara do seu negócio. Só paga 50% quando aprovar o começo, e os outros 50% quando estiver no ar.`],
  ['Qual a diferença entre a bio animada e o site?', `A bio animada é uma página única, feita para o link do Instagram: agendamento no WhatsApp, serviços, localização e avaliações, tudo animado. O site completo tem mais seções, fotos e textos, e aparece melhor no Google.`],
  ['E a mensalidade, é obrigatória?', `A hospedagem (${brl(CONFIG.HOSPEDAGEM_BIO)}/mês na bio, ${brl(CONFIG.HOSPEDAGEM_SITE)}/mês no site) mantém a página no ar com domínio, segurança e 1 ajuste por mês. Sem fidelidade: cancele quando quiser.`],
  ['Já tenho Instagram. Por que preciso disso?', 'O Linktree é igual para todo mundo e não passa confiança. A sua página mostra seus serviços e preços, leva direto para o WhatsApp e faz quem chega lembrar do seu nome.'],
  ['Quanto tempo leva?', `A bio animada fica pronta em até ${CONFIG.PRAZO_BIO_HORAS} horas e o site em até ${CONFIG.PRAZO_HORAS} horas, depois que você manda as informações e as fotos.`],
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
            <h1>Troque o Linktree por uma página animada com a cara do seu negócio.</h1>
            <p className="s-lead">
              {brl(CONFIG.PRECO_BIO)}, pronta em {CONFIG.PRAZO_BIO_HORAS} horas. Agendamento no WhatsApp, serviços e localização numa página que ninguém esquece. Você só paga se aprovar.
            </p>
            <div className="s-acoes">
              <Link className="s-btn" to="/demo/estetica">Ver uma ao vivo</Link>
              <a className="s-btn s-btn--linha" href="#modelos">Ver todos os modelos</a>
            </div>
          </div>
        </section>

        <section className="s-sec" id="modelos">
          <div className="s-wrap">
            <h2>Escolha um modelo. A gente coloca a sua cara nele.</h2>
            <p className="s-sub">Abra um modelo no celular: é exatamente o que o seu cliente vai ver, com o seu nome, cores e serviços.</p>
            <div className="s-grade">
              {vitrine.map((m) => (
                <article key={m.id} className="s-modelo">
                  <Previa modelo={m} />
                  <div className="info">
                    <h3>{m.titulo}</h3>
                    <span className="tipo">{m.tipo === 'bio' ? `Bio animada · ${brl(CONFIG.PRECO_BIO)}` : `Site completo · ${brl(CONFIG.PRECO_SITE)}`} · {m.destaque}</span>
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
            <h2>Do primeiro “oi” à página no ar</h2>
            <ol className="s-passos">
              <li><h3>Escolha o modelo</h3><p>Veja os modelos do seu tipo de negócio e diga qual combina.</p></li>
              <li><h3>Mande as informações</h3><p>Um formulário de 3 minutos: serviços, horários, endereço e fotos.</p></li>
              <li><h3>Aprove a prévia</h3><p>Você vê a página pronta com a sua cara e pede o ajuste que quiser.</p></li>
              <li><h3>No ar</h3><p>A bio em até {CONFIG.PRAZO_BIO_HORAS} horas e o site em até {CONFIG.PRAZO_HORAS} horas, com domínio próprio.</p></li>
            </ol>
          </div>
        </section>

        <section className="s-sec" id="precos">
          <div className="s-wrap">
            <h2>Preço fechado, sem surpresa</h2>
            <div className="s-precos">
              <article className="s-preco s-preco--principal">
                <h3>Bio animada</h3>
                <p className="valor">{brl(CONFIG.PRECO_BIO)}</p>
                <p className="mensal">+ {brl(CONFIG.HOSPEDAGEM_BIO)}/mês de hospedagem e domínio</p>
                <ul>
                  <li>Substitui o Linktree com a sua marca e animações</li>
                  <li>Agendamento direto no WhatsApp</li>
                  <li>Serviços e preços, localização e avaliações</li>
                  <li>Pronta em até {CONFIG.PRAZO_BIO_HORAS} horas</li>
                  <li>1 ajuste por mês sem custo</li>
                </ul>
                <a className="s-btn" href={waVendas('Oi! Quero a bio animada.')} target="_blank" rel="noreferrer">Quero a bio animada</a>
              </article>
              <article className="s-preco">
                <h3>Site completo</h3>
                <p className="valor">{brl(CONFIG.PRECO_SITE)}</p>
                <p className="mensal">+ {brl(CONFIG.HOSPEDAGEM_SITE)}/mês de hospedagem e domínio</p>
                <ul>
                  <li>Várias seções: sobre, serviços, fotos, equipe</li>
                  <li>Feito para aparecer no Google</li>
                  <li>Botão de WhatsApp, mapa e horários</li>
                  <li>Pronto em até {CONFIG.PRAZO_HORAS} horas</li>
                </ul>
                <a className="s-btn s-btn--linha" href={waVendas('Oi! Quero o site completo.')} target="_blank" rel="noreferrer">Quero o site completo</a>
              </article>
            </div>
            <p className="s-garantia">
              <strong>Você só paga se aprovar.</strong> Metade para começar, depois que você vê a prévia, e metade quando estiver no ar.
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
            <h2>Seu negócio já é bom. Falta a sua página mostrar isso.</h2>
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

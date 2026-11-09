import { useSearchParams } from 'react-router-dom'
import Casca, { Ico } from './Casca'

// Restaurante, café, padaria · layout "reserva": só mostra o que é real do lead (nome, bairro, nota).
// Pratos, fotos e horário ficam como espaço reservado, nunca inventados.
const BASE = { nome: 'Casa do Largo' }
const TIPOS = {
  restaurante: { tag: 'Restaurante', cta: 'Reservar mesa', menu: [['🥗', 'Entradas'], ['🍲', 'Pratos da casa'], ['🍮', 'Sobremesas']] },
  cafe: { tag: 'Café', cta: 'Fazer encomenda', menu: [['☕', 'Cafés'], ['🥐', 'Pastelaria'], ['🥪', 'Para comer']] },
  padaria: { tag: 'Padaria', cta: 'Fazer encomenda', menu: [['🍞', 'Pães'], ['🥐', 'Pastelaria'], ['🎂', 'Bolos por encomenda']] },
  pizzaria: { tag: 'Pizzaria', cta: 'Fazer pedido', menu: [['🍕', 'Pizzas'], ['🥗', 'Entradas'], ['🥤', 'Bebidas']] },
}

export default function Restaurante() {
  const [qs] = useSearchParams()
  const t = TIPOS[qs.get('t')] || TIPOS.restaurante
  const temNota = /^\d([.,]\d)?$/.test(qs.get('g') || '')

  return (
    <Casca id="restaurante" base={BASE} fontes="family=Fraunces:opsz,wght@9..144,600&family=Figtree:wght@400;600;700">
      {({ nome, demo, local, nota, aval }) => (
        <main className="rs">
          <header className="rs-topo">
            <p className="rs-tag">{t.tag}{local('') ? ` · ${local('')}` : ''}</p>
            <h1>{nome}</h1>
            <div className="rs-chips">
              {temNota && <span><Ico n="estrela" s={15} cheio /> {nota('')} no Google{aval('') ? ` · ${aval('')} avaliações` : ''}</span>}
              <span><Ico n="whats" s={15} /> Reservas pelo WhatsApp</span>
            </div>
            <div className="rs-acoes">
              <button className="rs-btn rs-btn--forte" onClick={() => demo('abre o WhatsApp com a mensagem pronta para reservar')}><Ico n="whats" /> {t.cta}</button>
              <div className="rs-duas">
                <button className="rs-btn rs-btn--linha" onClick={() => demo('liga direto para vocês')}>Ligar</button>
                <button className="rs-btn rs-btn--linha" onClick={() => demo('abre a rota no Google Maps')}><Ico n="mapa" s={18} /> Como chegar</button>
              </div>
            </div>
          </header>

          <section className="rs-sec" aria-labelledby="rs-m">
            <h2 id="rs-m">O menu</h2>
            <p>Aqui entram os pratos de vocês, com foto, descrição e preço.</p>
            <div className="rs-menu">
              {t.menu.map(([ic, c]) => (
                <button key={c} onClick={() => demo(`abre a secção "${c}" com as fotos e os preços de vocês`)}>
                  <i aria-hidden="true">{ic}</i><span><b>{c}</b><small>Fotos e preços de vocês</small></span><Ico n="seta" s={18} />
                </button>
              ))}
            </div>
          </section>

          <section className="rs-sec" aria-labelledby="rs-h">
            <h2 id="rs-h">Horário e morada</h2>
            <p>O horário do Google de vocês, com aviso de aberto ou fechado na hora, e o mapa com um toque.</p>
            <div className="rs-cartao">
              <b>Fotos do espaço e avaliações reais</b>
              <p>Puxamos as fotos e as melhores avaliações do Google de vocês para esta parte.</p>
            </div>
          </section>

          {qs.get('e') !== '1' && <div className="rs-fixa">
            <div className="rs-duas">
              <button className="rs-btn rs-btn--forte" onClick={() => demo('abre o WhatsApp para reservar')}>{t.cta.split(' ')[0]}</button>
              <button className="rs-btn rs-btn--linha" onClick={() => demo('liga direto para vocês')}>Ligar</button>
            </div>
          </div>}
        </main>
      )}
    </Casca>
  )
}

import { Link } from 'react-router-dom'
import { CONFIG } from '../config'
import { waLink } from '../lib/msg'
import Logo from './Logo'

export const waVendas = (texto) =>
  CONFIG.WHATSAPP_VENDAS ? waLink(CONFIG.WHATSAPP_VENDAS, texto) : `https://instagram.com/${CONFIG.INSTAGRAM}`

export function Header({ escuro = false }) {
  return (
    <header className={`s-header ${escuro ? 's-header--escuro' : ''}`}>
      <div className="s-wrap">
        <Link to="/" className="s-logo" aria-label="Tavin Digital, página inicial"><Logo /></Link>
        <nav aria-label="Principal">
          <a href="/#modelos">Modelos</a>
          <a href="/#precos">Preços</a>
          <a href="/#duvidas">Dúvidas</a>
          <a className="s-nav-cta" href={waVendas('Oi! Quero saber mais sobre o site.')} target="_blank" rel="noreferrer">
            Falar no WhatsApp
          </a>
        </nav>
      </div>
    </header>
  )
}

export function Footer() {
  const ano = new Date().getFullYear()
  return (
    <footer className="s-footer">
      <div className="s-wrap">
        <div>
          © {ano} {CONFIG.RAZAO_SOCIAL}{CONFIG.CNPJ ? ` · CNPJ ${CONFIG.CNPJ}` : ''} · {CONFIG.CIDADE}
        </div>
        <nav aria-label="Rodapé">
          <a href={`https://instagram.com/${CONFIG.INSTAGRAM}`} target="_blank" rel="noreferrer">Instagram @{CONFIG.INSTAGRAM}</a>
          <Link to="/termos">Termos de serviço</Link>
          <Link to="/privacidade">Privacidade</Link>
        </nav>
      </div>
    </footer>
  )
}

export function Dominio({ antes, depois }) {
  return (
    <p className="s-dominio" aria-label={`De ${antes} para ${depois}`}>
      <span className="antes" aria-hidden="true">{antes}</span>
      <span className="depois" aria-hidden="true"><b>{depois}</b></span>
    </p>
  )
}

export function Previa({ modelo, nome }) {
  if (modelo.imagem) return <img src={modelo.imagem} alt={`Prévia do modelo ${modelo.titulo}`} loading="lazy" />
  return (
    <div className="s-previa" style={{ '--c': modelo.cor }} aria-hidden="true">
      <div className="tela">
        <div className="topo">
          {nome || modelo.titulo}
          <small>{modelo.destaque}</small>
        </div>
        {modelo.tipo === 'bio' ? (
          <div className="links"><span /><span /><span /><span /></div>
        ) : (
          <div className="corpo">
            <div className="barra" /><div className="barra curta" /><div className="barra" />
            <div className="botao" />
            <div className="barra curta" /><div className="barra" />
          </div>
        )}
      </div>
    </div>
  )
}

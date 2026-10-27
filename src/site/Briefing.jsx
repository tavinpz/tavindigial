import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CONFIG, brl } from '../config'
import { MODELOS } from '../data/modelos'
import { callFn } from '../lib/fn'
import { Header, Footer, waVendas } from './Layout'

const VAZIO = {
  produto: 'site', negocio: '', responsavel: '', whatsapp: '', email: '', cidade: '', endereco: '',
  instagram: '', servicos: '', horarios: '', diferenciais: '', cores: '', referencias: '',
  modelo_escolhido: '', observacoes: '', site_empresa: '', aceite_termos: false,
}

export default function Briefing() {
  const [qs] = useSearchParams()
  const [f, setF] = useState({ ...VAZIO, modelo_escolhido: qs.get('m') || '' })
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [feito, setFeito] = useState(false)

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function enviar(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    const { ok, data } = await callFn('briefing', { ...f, r: qs.get('r') || undefined }).catch(() => ({ ok: false }))
    setEnviando(false)
    if (ok && data?.ok) setFeito(true)
    else setErro(data?.erro || 'Não foi possível enviar agora. Confira sua internet e tente de novo.')
  }

  if (feito) {
    return (
      <>
        <Header />
        <main className="s-wrap s-legal">
          <h1>Recebido. Já começo o seu {f.produto === 'bio' ? 'link de bio' : 'site'}.</h1>
          <p>Agora me mande pelo WhatsApp o logo e de 3 a 8 fotos do seu negócio. A prévia chega em até {CONFIG.PRAZO_HORAS} horas.</p>
          <div className="s-acoes" style={{ marginTop: 20 }}>
            <a className="s-btn" href={waVendas(`Oi! Preenchi o formulário da ${f.negocio}. Vou mandar o logo e as fotos.`)} target="_blank" rel="noreferrer">
              Mandar logo e fotos
            </a>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="s-wrap s-legal">
        <h1>Vamos montar o seu site</h1>
        <p>Leva 3 minutos. Quanto mais detalhe, mais a prévia já sai com a sua cara.</p>

        <form className="s-form" onSubmit={enviar} noValidate style={{ marginTop: 28 }}>
          <div className="s-campo">
            <label htmlFor="produto">O que você quer</label>
            <select id="produto" value={f.produto} onChange={set('produto')}>
              <option value="site">Site completo · {brl(CONFIG.PRECO_SITE)} + {brl(CONFIG.HOSPEDAGEM_SITE)}/mês</option>
              <option value="bio">Página de bio · {brl(CONFIG.PRECO_BIO)} + {brl(CONFIG.HOSPEDAGEM_BIO)}/mês</option>
              <option value="outro">Outro (explico abaixo)</option>
            </select>
          </div>

          <div className="s-linha2">
            <div className="s-campo">
              <label htmlFor="negocio">Nome do negócio</label>
              <input id="negocio" required value={f.negocio} onChange={set('negocio')} autoComplete="organization" />
            </div>
            <div className="s-campo">
              <label htmlFor="responsavel">Seu nome</label>
              <input id="responsavel" required value={f.responsavel} onChange={set('responsavel')} autoComplete="name" />
            </div>
          </div>

          <div className="s-linha2">
            <div className="s-campo">
              <label htmlFor="whatsapp">WhatsApp com DDD</label>
              <input id="whatsapp" required inputMode="tel" placeholder="(11) 91234-5678" value={f.whatsapp} onChange={set('whatsapp')} autoComplete="tel" />
            </div>
            <div className="s-campo">
              <label htmlFor="email">E-mail (opcional)</label>
              <input id="email" type="email" value={f.email} onChange={set('email')} autoComplete="email" />
            </div>
          </div>

          <div className="s-linha2">
            <div className="s-campo">
              <label htmlFor="cidade">Cidade</label>
              <input id="cidade" value={f.cidade} onChange={set('cidade')} autoComplete="address-level2" />
            </div>
            <div className="s-campo">
              <label htmlFor="instagram">Instagram</label>
              <input id="instagram" placeholder="@seunegocio" value={f.instagram} onChange={set('instagram')} />
            </div>
          </div>

          <div className="s-campo">
            <label htmlFor="endereco">Endereço que vai no mapa</label>
            <input id="endereco" value={f.endereco} onChange={set('endereco')} autoComplete="street-address" />
          </div>

          <div className="s-campo">
            <label htmlFor="servicos">Serviços e preços</label>
            <p className="dica">Um por linha. Preço é opcional, mas ajuda a vender.</p>
            <textarea id="servicos" value={f.servicos} onChange={set('servicos')} placeholder={'Limpeza · R$ 180\nClareamento · R$ 650'} />
          </div>

          <div className="s-campo">
            <label htmlFor="horarios">Horário de atendimento</label>
            <input id="horarios" value={f.horarios} onChange={set('horarios')} placeholder="Seg a sex 8h–19h · Sáb 8h–13h" />
          </div>

          <div className="s-campo">
            <label htmlFor="diferenciais">Por que escolher vocês?</label>
            <textarea id="diferenciais" value={f.diferenciais} onChange={set('diferenciais')} placeholder="Ex.: 15 anos no bairro, atendimento no mesmo dia, estacionamento" />
          </div>

          <div className="s-linha2">
            <div className="s-campo">
              <label htmlFor="cores">Cores da marca</label>
              <input id="cores" value={f.cores} onChange={set('cores')} placeholder="Ex.: azul-marinho e dourado" />
            </div>
            <div className="s-campo">
              <label htmlFor="modelo">Modelo preferido</label>
              <select id="modelo" value={f.modelo_escolhido} onChange={set('modelo_escolhido')}>
                <option value="">Tanto faz, escolha por mim</option>
                {MODELOS.map((m) => <option key={m.id} value={m.titulo}>{m.titulo}</option>)}
              </select>
            </div>
          </div>

          <div className="s-campo">
            <label htmlFor="referencias">Sites ou perfis que você gosta (opcional)</label>
            <input id="referencias" value={f.referencias} onChange={set('referencias')} />
          </div>

          <div className="s-campo">
            <label htmlFor="observacoes">Mais alguma coisa?</label>
            <textarea id="observacoes" value={f.observacoes} onChange={set('observacoes')} />
          </div>

          <div className="s-oculto" aria-hidden="true">
            <label htmlFor="site_empresa">Não preencha</label>
            <input id="site_empresa" tabIndex={-1} autoComplete="off" value={f.site_empresa} onChange={set('site_empresa')} />
          </div>

          <label className="s-check">
            <input type="checkbox" checked={f.aceite_termos} onChange={set('aceite_termos')} />
            <span>Li e aceito os <Link to="/termos" target="_blank">termos de serviço</Link> e a <Link to="/privacidade" target="_blank">política de privacidade</Link>.</span>
          </label>

          {erro && <div className="s-aviso s-aviso--erro" role="alert">{erro}</div>}

          <div>
            <button className="s-btn" type="submit" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar e começar'}</button>
          </div>
        </form>
      </main>
      <Footer />
    </>
  )
}

import { useEffect, useState } from 'react'
import { ehCelular, formatTel } from '../lib/msg'
import { supabase } from '../lib/supabase'
import { usePainel } from './Painel'
import { EVENTO_DESTINO, extensaoVelha, salvarWaDestino, temExtensao, waDestino } from './envio'

// Onde o WhatsApp abre: a mesma escolha vale no CRM, no Prospectar e na ficha do lead
export function useDestino() {
  const [d, setD] = useState(waDestino)
  useEffect(() => {
    const ouvir = (e) => setD(e.detail)
    window.addEventListener(EVENTO_DESTINO, ouvir)
    return () => window.removeEventListener(EVENTO_DESTINO, ouvir)
  }, [])
  return [d, salvarWaDestino]
}

// Os dois números (Web e App): a prévia manda a resposta do lead para o mesmo número que falou com ele
function Numeros({ fechar }) {
  const { avisar } = usePainel()
  const [n, setN] = useState({ web: '', app: '' })
  useEffect(() => { supabase.rpc('numeros_whatsapp').then(({ data }) => setN({ web: data?.[0]?.web || '', app: data?.[0]?.app || '' })) }, [])
  const limpo = (v) => { let d = String(v || '').replace(/\D/g, ''); if (d && !d.startsWith('55')) d = `55${d}`; return d }
  async function salvar(e) {
    e.preventDefault()
    const r = await Promise.all([
      supabase.rpc('salvar_config', { p_key: 'wa_numero_web', p_value: limpo(n.web) }),
      supabase.rpc('salvar_config', { p_key: 'wa_numero_app', p_value: limpo(n.app) }),
    ])
    if (r.some((x) => x.error)) { avisar('Não salvou'); return }
    avisar('Números salvos'); fechar()
  }
  return (
    <form className="dw-ajuda dw-numeros" onSubmit={salvar}>
      <p><strong>Seus dois WhatsApps</strong></p>
      <p>Quando o lead toca em "Gostei" ou "Quanto fica?" na prévia, a mensagem vai para o número que falou com ele.</p>
      <label>WhatsApp Web (a aba)<input value={n.web} onChange={(e) => setN({ ...n, web: e.target.value })} placeholder="(27) 99288-6950" inputMode="tel" /></label>
      <label>App do computador<input value={n.app} onChange={(e) => setN({ ...n, app: e.target.value })} placeholder="(DDD) 9xxxx-4947" inputMode="tel" /></label>
      {n.web && <small>Web: {formatTel(limpo(n.web))}{n.app ? ` · App: ${formatTel(limpo(n.app))}` : ''}</small>}
      <div className="p-acoes"><button className="p-btn p-btn--forte p-btn--mini">Salvar</button><button type="button" className="p-btn p-btn--fraco p-btn--mini" onClick={fechar}>Fechar</button></div>
    </form>
  )
}

export default function DestinoWa({ rotulo = 'Conversas abrem no' }) {
  const [destino, setDestino] = useDestino()
  const [ajuda, setAjuda] = useState(false)
  const [nums, setNums] = useState(false)
  if (ehCelular()) return null
  const semExt = destino === 'web' && !temExtensao()
  return (
    <div className="dw">
      <label className="dw-sel">
        <span>{rotulo}</span>
        <select value={destino} onChange={(e) => setDestino(e.target.value)}>
          <option value="web">WhatsApp Web (aba já aberta)</option>
          <option value="app">App do WhatsApp (computador)</option>
        </select>
        {destino === 'web' && temExtensao() && !extensaoVelha() && <em className="dw-ok">extensão ativa</em>}
        <button type="button" className="dw-num" onClick={() => setNums(!nums)}>Números</button>
      </label>
      {nums && <Numeros fechar={() => setNums(false)} />}
      {destino === 'web' && extensaoVelha() && <button type="button" className="dw-aviso" onClick={() => setAjuda(!ajuda)}>Atualize a extensão para a conversa abrir sem recarregar</button>}
      {semExt && <button type="button" className="dw-aviso" onClick={() => setAjuda(!ajuda)}>Falta a extensão para usar a aba que já está aberta</button>}
      {ajuda && (semExt || extensaoVelha()) && (
        <div className="dw-ajuda">
          <p><strong>{extensaoVelha() ? 'Atualize (1 minuto):' : 'Instale uma vez (2 minutos):'}</strong></p>
          {extensaoVelha() && <p>Em <code>chrome://extensions</code>, clique em <b>Remover</b> na "Tavin Painel · WhatsApp" e instale a nova:</p>}
          <ol>
            <li><a href="/extensao-whatsapp.zip" download>Baixe a extensão</a> e dê dois cliques no arquivo para descompactar.</li>
            <li>No Chrome, abra <code>chrome://extensions</code> e ligue o <b>Modo do desenvolvedor</b> (canto de cima, à direita).</li>
            <li>Clique em <b>Carregar sem compactação</b> e escolha a pasta <b>extensao-whatsapp</b>.</li>
            <li>Recarregue esta página.</li>
          </ol>
          <p>Depois disso, cada conversa abre na aba do WhatsApp Web que você já deixa aberta, com o texto pronto.</p>
        </div>
      )}
    </div>
  )
}

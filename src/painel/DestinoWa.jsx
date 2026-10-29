import { useEffect, useState } from 'react'
import { ehCelular } from '../lib/msg'
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

export default function DestinoWa({ rotulo = 'Conversas abrem no' }) {
  const [destino, setDestino] = useDestino()
  const [ajuda, setAjuda] = useState(false)
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
      </label>
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

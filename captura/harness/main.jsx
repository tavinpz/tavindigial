import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '../master.css'
import '../src/index.css'
import '../src/mobile/mobile.css'
import { AvisosHost } from '../src/lib/avisos'
import DashboardLayout from '../src/components/DashboardLayout'
import { aplicar } from './cenarios.js'
import Dashboard from '../src/menu/Dashboard'
import Assistentes from '../src/menu/Assistentes'
import Campanhas from '../src/menu/Campanhas'
import Cadencias from '../src/menu/Cadencias'
import Retornos from '../src/menu/Retornos'
import FollowUp from '../src/menu/FollowUp'
import Lista from '../src/menu/Lista'
import Pipeline from '../src/menu/Pipeline'
import AgendaDia from '../src/menu/AgendaDia'
import Mensagens from '../src/menu/Mensagens'
import Ligacoes from '../src/menu/Ligacoes'
import WhatsApp from '../src/menu/WhatsApp'
import Integracoes from '../src/menu/Integracoes'
import Calendario from '../src/menu/Calendario'
import Configuracoes from '../src/menu/Configuracoes'

try { localStorage.setItem('thata_modo_leve', '0') } catch (e) {}
const P = new URLSearchParams(location.search)
const rota = P.get('r') || '/whatsapp'
aplicar(P.get('c') || 'base')
try { window.__extra && window.__extra() } catch (e) { console.error('extra', e) }
// webhooks do n8n e funcoes: respostas ficticias
const fetchReal = window.fetch.bind(window)
window.fetch = async (url, opt) => {
  const u = String(url?.url || url)
  if (/n8n\.mock|api\.thata\.online|sb\.mock/.test(u)) {
    const chave = u.split('?')[0].split('/').pop()
    let corpo = {}; try { corpo = JSON.parse(opt?.body || '{}') } catch (e) {}
    const f = (window.__FETCH || {})[chave]
    if (f === undefined) (window.__faltou ||= new Set()).add('fetch:' + chave)
    if (window.__atraso) await new Promise((r) => setTimeout(r, window.__atraso))
    const v = typeof f === 'function' ? await f(corpo) : (f ?? { ok: true, success: true })
    return new Response(JSON.stringify(v), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }
  return fetchReal(url, opt)
}
const PAG = { '/dashboard': Dashboard, '/assistentes': Assistentes, '/campanhas': Campanhas, '/cadencias': Cadencias, '/retornos': Retornos, '/aniversarios': Retornos,
  '/follow-up': FollowUp, '/lista': Lista, '/pipeline': Pipeline, '/agenda-do-dia': AgendaDia, '/mensagens': Mensagens, '/ligacoes': Ligacoes,
  '/whatsapp': WhatsApp, '/integracoes': Integracoes, '/calendario': Calendario, '/configuracoes': Configuracoes }
const Pg = PAG[rota.split('?')[0]] || WhatsApp
createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route element={<DashboardLayout />}>
          {Object.entries(PAG).map(([p, C]) => <Route key={p} path={p} element={<C />} />)}
        </Route>
        <Route path="*" element={<Pg />} />
      </Routes>
    </MemoryRouter>
    <AvisosHost />
  </HelmetProvider>
)

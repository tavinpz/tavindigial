import { CONFIG } from '../config'

export const fnUrl = (name) => `${CONFIG.SUPABASE_URL}/functions/v1/${name}`

// Chamada pública às edge functions (track, briefing). Não precisa de login.
// Neste aparelho o dono já entrou no painel: não conta as visitas dele como "lead abriu"
const ehDono = () => { try { return localStorage.getItem('td-dono') === '1' } catch { return false } }
export const marcarDono = () => { try { localStorage.setItem('td-dono', '1') } catch { /* sem storage */ } }

// "Abriu a página" só conta quando uma PESSOA mexe na página (toca, rola, clica ou digita).
// O Instagram e o WhatsApp abrem o link sozinhos segundos depois do envio para checar segurança;
// esses robôs carregam a página, mas não interagem.
export function quandoHumano(fn) {
  if (typeof window === 'undefined' || navigator.webdriver) return () => {}
  let feito = false
  const eventos = ['pointerdown', 'touchstart', 'scroll', 'wheel', 'keydown']
  const ir = () => {
    if (feito || document.visibilityState !== 'visible') return
    feito = true
    limpar()
    fn()
  }
  const limpar = () => eventos.forEach((e) => window.removeEventListener(e, ir, true))
  eventos.forEach((e) => window.addEventListener(e, ir, { capture: true, passive: true }))
  return limpar
}

export async function callFn(name, body) {
  if (name === 'track' && ehDono()) return { ok: true, status: 204, data: null }
  const res = await fetch(fnUrl(name), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: CONFIG.SUPABASE_ANON_KEY },
    body: JSON.stringify(body),
    keepalive: true,
  })
  const txt = await res.text()
  let data = null
  try { data = txt ? JSON.parse(txt) : null } catch { /* resposta vazia */ }
  return { ok: res.ok, status: res.status, data }
}

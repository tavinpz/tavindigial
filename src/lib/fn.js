import { CONFIG } from '../config'

export const fnUrl = (name) => `${CONFIG.SUPABASE_URL}/functions/v1/${name}`

// Chamada pública às edge functions (track, briefing). Não precisa de login.
// Neste aparelho o dono já entrou no painel: não conta as visitas dele como "lead abriu"
const ehDono = () => { try { return localStorage.getItem('td-dono') === '1' } catch { return false } }
export const marcarDono = () => { try { localStorage.setItem('td-dono', '1') } catch { /* sem storage */ } }

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

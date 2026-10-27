import { CONFIG } from '../config'

export const fnUrl = (name) => `${CONFIG.SUPABASE_URL}/functions/v1/${name}`

// Chamada pública às edge functions (track, briefing). Não precisa de login.
export async function callFn(name, body) {
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

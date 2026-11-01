import puppeteer from 'puppeteer-core'
import fs from 'fs'
export const OUT = process.env.OUT || '/tmp/shot/out'
fs.mkdirSync(OUT, { recursive: true })
const espera = (ms) => new Promise((r) => setTimeout(r, ms))
export async function iniciar() {
  const b = await puppeteer.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', headless: true, args: ['--no-sandbox', '--font-render-hinting=none', '--lang=pt-BR'], env: { ...process.env, LANG: 'pt_BR.UTF-8', TZ: 'America/Sao_Paulo' } })
  const p = await b.newPage()
  const erros = []
  p.on('pageerror', (e) => erros.push('PAGE ' + e.message))
  p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text().slice(0, 200)) })
  const meta = {}
  const LOGO = fs.readFileSync('/tmp/shot/logo.png'), AVATAR = fs.readFileSync('/tmp/shot/avatar.png'), CLINICORP = fs.readFileSync('/tmp/shot/clinicorp.png'), EXPERTS = fs.readFileSync('/tmp/shot/experts.png')
  await p.setRequestInterception(true)
  p.on('request', (r) => {
    const u = r.url()
    if (u.includes('imagens.thata.online')) return r.respond({ status: 200, contentType: 'image/png', body: u.includes('EG4ITp') ? LOGO : u.includes('DrVcNo') ? CLINICORP : u.includes('BiuCGX') ? EXPERTS : AVATAR })
    if (u.includes('sb.mock/criativo')) return r.respond({ status: 200, contentType: 'image/png', body: fs.readFileSync('/tmp/shot/criativo.png') })
    if (u.includes('sb.mock/gravacao')) return r.respond({ status: 200, contentType: 'audio/wav', body: fs.readFileSync('/tmp/shot/silencio.wav') })
    if (/fonts\.googleapis|fonts\.gstatic|vumbnail|youtube|fontshare/.test(u)) return r.respond({ status: 200, contentType: 'text/css', body: '' })
    r.continue()
  })
  const api = {
    b, p, erros, meta, espera,
    async preparar(fn) { await p.evaluateOnNewDocument(`window.__extra = ${fn.toString()}`) },
    async abrir(rota, c = 'base', w = 1440, h = 900, dpr = 2) {
      await p.setViewport({ width: w, height: h, deviceScaleFactor: dpr })
      await p.goto(`http://localhost:5199/?r=${encodeURIComponent(rota)}&c=${c}`, { waitUntil: 'networkidle0' })
      await p.evaluate(() => document.fonts.ready); await espera(900)
    },
    // acha elemento clicavel pelo texto (o menor que contem)
    async achar(texto, sel = 'button, a, [role=button], div, span, label, li, p, h1, h2, h3, input, textarea') {
      return p.evaluateHandle((t, s) => {
        const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
        const els = [...document.querySelectorAll(s)].filter((e) => vis(e) && (e.placeholder === t || (e.innerText || '').trim().replace(/\s+/g, ' ').startsWith(t)))
        els.sort((a, b) => ((a.innerText || '').length - (b.innerText || '').length) || (a.querySelectorAll('*').length - b.querySelectorAll('*').length))
        return els[0] || null
      }, texto, sel)
    },
    async caixa(alvo) {
      const h = typeof alvo === 'string' ? await api.achar(alvo) : alvo
      const r = await h.evaluate((e) => { if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height } }).catch(() => null)
      return r
    },
    async clicar(texto, sel) {
      const h = await api.achar(texto, sel)
      const ok = await h.evaluate((e) => { if (!e) return false; (e.closest('button, a, [role=button], label') || e).click(); return true }).catch(() => false)
      if (!ok) erros.push('NAO ACHEI: ' + texto)
      await espera(700)
    },
    async digitar(placeholder, txt) {
      const h = await api.achar(placeholder, 'input, textarea')
      const el = h.asElement(); if (!el) { erros.push('SEM CAMPO: ' + placeholder); return }
      await el.click({ clickCount: 3 }); await el.type(txt, { delay: 5 }); await espera(300)
    },
    // print + caixas (em px do print = css * dpr)
    async foto(nome, alvos = {}) {
      const dpr = p.viewport().deviceScaleFactor
      const cx = {}
      for (const [k, t] of Object.entries(alvos)) { const r = await api.caixa(t); if (r) cx[k] = [r.x * dpr, r.y * dpr, r.w * dpr, r.h * dpr].map(Math.round); else erros.push('SEM CAIXA ' + k) }
      await p.screenshot({ path: `${OUT}/${nome}.png` })
      meta[nome] = cx
    },
    async js(fn, ...args) { const v = await p.evaluate(fn, ...args); await espera(400); return v },
    // escolhe a opcao n (1 = primeira depois do placeholder) no select cujo placeholder comeca com t
    async opcao(t, n = 1) { const ok = await p.evaluate((t, n) => { const s = [...document.querySelectorAll('select')].find((x) => x.options[0] && x.options[0].textContent.trim().startsWith(t)); if (!s || !s.options[n]) return false; const set = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set; set.call(s, s.options[n].value); s.dispatchEvent(new Event('change', { bubbles: true })); return true }, t, n); if (!ok) erros.push('SEM SELECT ' + t); await espera(400) },
    async botoes() { const t = await p.evaluate(() => [...document.querySelectorAll('button')].filter((b) => b.getBoundingClientRect().width > 0).map((b) => b.innerText.trim().replace(/\s+/g, ' ').slice(0, 40)).filter(Boolean)); console.log('BOTOES:', JSON.stringify(t)) },
    async fim(arq) {
      fs.writeFileSync(`${OUT}/${arq}.json`, JSON.stringify(api.meta, null, 1))
      const falt = await p.evaluate(() => [...(window.__faltou || [])])
      console.log('faltou:', JSON.stringify(falt)); console.log('erros:', JSON.stringify(erros.filter((e) => !/favicon|fonts\.g|imagens\.|Failed to load resource/i.test(e)).slice(0, 12)))
      await b.close()
    },
  }
  return api
}

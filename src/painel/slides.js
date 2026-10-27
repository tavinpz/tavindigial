// Desenha os slides do carrossel num <canvas> 1080x1350 (4:5, o maior formato do feed),
// na identidade Tavin: roxo elétrico, roxo profundo, rosa claro, roxo acinzentado,
// Raleway nos títulos, Urbanist no texto e o pattern geométrico da marca.
// Palavras entre *asteriscos* no título saem destacadas (rosa no escuro, roxo no claro).
import { desenharPadrao } from '../lib/padrao'

export const W = 1080
export const H = 1350
const M = 96 // margem

const COR = {
  eletrico: '#B600F6', profundo: '#5D0487', rosa: '#FEA8FF', acinzentado: '#2E2633',
  noite: '#17121B', papel: '#F4F2F6', texto: '#3A3040', cinza: '#7A7084', linha: '#E4DDE9', branco: '#FFFFFF',
}
const DISPLAY = '"Raleway", "Segoe UI", sans-serif'
const CORPO = '"Urbanist", "Segoe UI", sans-serif'
// Símbolo oficial (PNG com transparência), tingido na cor de cada slide
let SIMBOLO = null
const carregarSimbolo = () => new Promise((ok) => {
  if (SIMBOLO) return ok()
  const img = new Image()
  img.onload = () => { SIMBOLO = img; ok() }
  img.onerror = () => ok()
  img.src = '/marca/logo-160.png'
})
const tingidos = {}
function simboloNaCor(cor) {
  if (!SIMBOLO) return null
  if (!tingidos[cor]) {
    const c = document.createElement('canvas')
    c.width = SIMBOLO.width; c.height = SIMBOLO.height
    const x = c.getContext('2d')
    x.drawImage(SIMBOLO, 0, 0)
    x.globalCompositeOperation = 'source-in'
    x.fillStyle = cor; x.fillRect(0, 0, c.width, c.height)
    tingidos[cor] = c
  }
  return tingidos[cor]
}

export const TIPOS = { capa: 'Capa', texto: 'Conteúdo', cta: 'Chamada final' }

export async function carregarFontes() {
  const simbolo = carregarSimbolo()
  if (!document.fonts?.load) return simbolo
  await Promise.all([
    simbolo,
    document.fonts.load(`800 80px ${DISPLAY}`),
    document.fonts.load(`500 40px ${DISPLAY}`),
    document.fonts.load(`500 40px ${CORPO}`),
    document.fonts.load(`700 40px ${CORPO}`),
  ]).catch(() => {})
}

const juntar = (t) => String(t || '').replace(/R\$ (?=\d)/g, 'R$ ')

// Quebra em linhas de "tokens" { t, d } (d = destaque). Respeita \n e *destaque*.
function quebrar(ctx, texto, largura) {
  const linhas = []
  let destaque = false
  for (const par of juntar(texto).split('\n')) {
    const palavras = par.split(/[ \t]+/).filter(Boolean)
    if (!palavras.length) { linhas.push([]); continue }
    let atual = []
    let larguraAtual = 0
    const espaco = ctx.measureText(' ').width
    for (let p of palavras) {
      const abre = p.startsWith('*')
      if (abre) { destaque = true; p = p.slice(1) }
      const fecha = p.endsWith('*')
      if (fecha) p = p.slice(0, -1)
      const tok = { t: p, d: destaque }
      if (fecha) destaque = false
      const w = ctx.measureText(p).width
      const nova = atual.length ? larguraAtual + espaco + w : w
      if (atual.length && nova > largura) { linhas.push(atual); atual = [tok]; larguraAtual = w }
      else { atual.push(tok); larguraAtual = nova }
    }
    linhas.push(atual)
  }
  return linhas
}

function ajustar(ctx, texto, fonte, peso, max, min, largura, maxLinhas) {
  for (let t = max; t >= min; t -= 2) {
    ctx.font = `${peso} ${t}px ${fonte}`
    const l = quebrar(ctx, texto, largura)
    if (l.length <= maxLinhas) return { tamanho: t, linhas: l }
  }
  ctx.font = `${peso} ${min}px ${fonte}`
  return { tamanho: min, linhas: quebrar(ctx, texto, largura) }
}

function escrever(ctx, linhas, x, y, altura, cor, corDestaque) {
  const espaco = ctx.measureText(' ').width
  linhas.forEach((linha, i) => {
    let cx = x
    for (const tok of linha) {
      ctx.fillStyle = tok.d ? corDestaque : cor
      ctx.fillText(tok.t, cx, y + i * altura)
      cx += ctx.measureText(tok.t).width + espaco
    }
  })
  return y + linhas.length * altura
}

function marca(ctx, x, y, cor, corMono) {
  const s = simboloNaCor(corMono)
  const alt = 46
  if (s) ctx.drawImage(s, x, y - 36, Math.round(alt * s.width / s.height), alt)
  ctx.fillStyle = cor; ctx.font = `500 30px ${DISPLAY}`
  ctx.letterSpacing = '9px'; ctx.fillText('TAVÍN', x + 64, y); ctx.letterSpacing = '0px'
}

export function desenharSlide(canvas, slide, i, total, arroba = '@tavindigital') {
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'alphabetic'
  const largura = W - M * 2
  const tipo = slide.tipo || 'texto'

  if (tipo === 'capa') {
    // Capa escura (seda preta) ou clara (papel): alterne entre um post e outro
    const claro = slide.fundo === 'claro'
    const c = claro
      ? { fundo: COR.papel, titulo: COR.noite, destaque: COR.eletrico, sub: COR.texto, marca: COR.noite, mono: COR.noite, rodape: COR.cinza }
      : { fundo: COR.noite, titulo: COR.branco, destaque: COR.rosa, sub: '#CFC6D6', marca: COR.branco, mono: COR.branco, rodape: '#9C92A5' }
    ctx.fillStyle = c.fundo; ctx.fillRect(0, 0, W, H)
    // faixa vertical do pattern, como no banner da identidade
    const lado = 150
    desenharPadrao(ctx, W - lado, 0, 1, Math.ceil(H / lado), lado, 11 + i)
    marca(ctx, M, M + 24, c.marca, c.mono)

    const larg = W - M - lado - 72
    const t = ajustar(ctx, slide.titulo, DISPLAY, 800, 104, 64, larg, 6)
    ctx.font = `800 ${t.tamanho}px ${DISPLAY}`
    const y = escrever(ctx, t.linhas, M, 380 + t.tamanho, t.tamanho * 1.08, c.titulo, c.destaque)

    if (slide.texto) {
      ctx.font = `500 40px ${CORPO}`
      escrever(ctx, quebrar(ctx, slide.texto, larg), M, y + 70, 56, c.sub, c.destaque)
    }
    ctx.fillStyle = c.rodape; ctx.font = `700 28px ${CORPO}`
    ctx.fillText('Arraste para o lado', M, H - M + 10)
    return
  }

  if (tipo === 'cta') {
    ctx.fillStyle = COR.eletrico; ctx.fillRect(0, 0, W, H)
    const lado = W / 7
    desenharPadrao(ctx, 0, H - lado, 7, 1, lado, 23 + i)
    marca(ctx, M, M + 24, COR.branco, COR.branco)

    const t = ajustar(ctx, slide.titulo, DISPLAY, 800, 92, 60, largura, 5)
    ctx.font = `800 ${t.tamanho}px ${DISPLAY}`
    let y = escrever(ctx, t.linhas, M, 340 + t.tamanho, t.tamanho * 1.08, COR.branco, COR.noite)
    if (slide.texto) {
      ctx.font = `500 40px ${CORPO}`
      y = escrever(ctx, quebrar(ctx, slide.texto, largura), M, y + 64, 58, 'rgba(255,255,255,0.9)', COR.branco)
    }
    const rotulo = slide.botao || `Link na bio · ${arroba}`
    ctx.font = `700 34px ${CORPO}`
    const lw = ctx.measureText(rotulo).width + 72
    const py = Math.min(y + 70, H - lado - 150)
    ctx.fillStyle = COR.noite
    ctx.beginPath(); ctx.roundRect(M, py, lw, 92, 46); ctx.fill()
    ctx.fillStyle = COR.branco; ctx.fillText(rotulo, M + 36, py + 58)
    return
  }

  // Slide de conteúdo: papel claro, número da sequência, título e texto
  ctx.fillStyle = COR.papel; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = COR.eletrico; ctx.font = `800 40px ${DISPLAY}`
  ctx.fillText(String(i).padStart(2, '0'), M, M + 24)
  ctx.fillStyle = COR.cinza; ctx.font = `700 28px ${CORPO}`
  ctx.textAlign = 'right'; ctx.fillText(arroba, W - M, M + 20); ctx.textAlign = 'left'
  const sb = simboloNaCor(COR.noite)
  if (sb) { const lw = ctx.measureText(arroba).width; ctx.drawImage(sb, W - M - lw - 50, M - 8, Math.round(34 * sb.width / sb.height), 34) }

  const t = ajustar(ctx, slide.titulo, DISPLAY, 800, 84, 54, largura, 4)
  ctx.font = `800 ${t.tamanho}px ${DISPLAY}`
  const y = escrever(ctx, t.linhas, M, 260 + t.tamanho, t.tamanho * 1.1, COR.noite, COR.eletrico)
  if (slide.texto) {
    const c = ajustar(ctx, slide.texto, CORPO, 500, 50, 34, largura, 11)
    ctx.font = `500 ${c.tamanho}px ${CORPO}`
    escrever(ctx, c.linhas, M, y + 56 + c.tamanho, c.tamanho * 1.45, COR.texto, COR.eletrico)
  }
  // barra de progresso + um bloquinho do pattern no canto
  const by = H - M
  ctx.fillStyle = COR.linha; ctx.fillRect(M, by, largura - 120, 6)
  ctx.fillStyle = COR.eletrico; ctx.fillRect(M, by, (largura - 120) * ((i + 1) / total), 6)
  desenharPadrao(ctx, W - M - 96, by - 45, 2, 1, 48, 31 + i)
}

export const paraJpeg = (canvas) => new Promise((ok) => canvas.toBlob(ok, 'image/jpeg', 0.92))

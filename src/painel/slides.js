// Desenha os slides do carrossel num <canvas> 1080x1350 (4:5, o maior formato do feed).
// Sem dependências: mesmas fontes do site, texto quebrado na largura certa, JPEG na saída.

export const W = 1080
export const H = 1350
const M = 96 // margem

const COR = {
  tinta: '#1F2BC9', papel: '#F5F6FA', grafite: '#171A2E', texto: '#2E3250',
  cinza: '#5C6178', linha: '#DCDFEA', marca: '#FFE45C', branco: '#FFFFFF',
}
const DISPLAY = '"Bricolage Grotesque", "Segoe UI", sans-serif'
const CORPO = '"Atkinson Hyperlegible", "Segoe UI", sans-serif'

export const TIPOS = { capa: 'Capa', texto: 'Conteúdo', cta: 'Chamada final' }

export async function carregarFontes() {
  if (!document.fonts?.load) return
  await Promise.all([
    document.fonts.load(`800 80px ${DISPLAY}`),
    document.fonts.load(`400 40px ${CORPO}`),
    document.fonts.load(`700 40px ${CORPO}`),
  ]).catch(() => {})
}

// Quebra o texto em linhas que cabem em "largura" (respeita \n do autor)
function quebrar(ctx, texto, largura) {
  const linhas = []
  for (const par of String(texto || '').split('\n')) {
    const palavras = par.split(/[ \t]+/).filter(Boolean) // espaço comum; o não separável (R$ 297) fica junto
    if (!palavras.length) { linhas.push(''); continue }
    let atual = palavras[0]
    for (const p of palavras.slice(1)) {
      const teste = `${atual} ${p}`
      if (ctx.measureText(teste).width <= largura) atual = teste
      else { linhas.push(atual); atual = p }
    }
    linhas.push(atual)
  }
  return linhas
}

// Maior tamanho de fonte (entre max e min) em que o texto cabe em "maxLinhas"
function ajustar(ctx, texto, fonte, peso, max, min, largura, maxLinhas) {
  for (let t = max; t >= min; t -= 2) {
    ctx.font = `${peso} ${t}px ${fonte}`
    const l = quebrar(ctx, texto, largura)
    if (l.length <= maxLinhas) return { tamanho: t, linhas: l }
  }
  ctx.font = `${peso} ${min}px ${fonte}`
  return { tamanho: min, linhas: quebrar(ctx, texto, largura) }
}

function escrever(ctx, linhas, x, y, altura) {
  linhas.forEach((l, i) => ctx.fillText(l, x, y + i * altura))
  return y + linhas.length * altura
}

const juntar = (t) => String(t || '').replace(/R\$ (?=\d)/g, 'R$\u00a0')

export function desenharSlide(canvas, slideOriginal, i, total, arroba = '@tavindigital') {
  const slide = { ...slideOriginal, titulo: juntar(slideOriginal.titulo), texto: juntar(slideOriginal.texto) }
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.textBaseline = 'alphabetic'
  const largura = W - M * 2
  const tipo = slide.tipo || 'texto'

  if (tipo === 'capa') {
    ctx.fillStyle = COR.tinta; ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = 'rgba(255,255,255,0.78)'; ctx.font = `700 30px ${CORPO}`
    ctx.fillText(arroba, M, M + 20)

    const t = ajustar(ctx, slide.titulo, DISPLAY, 800, 112, 70, largura, 6)
    ctx.fillStyle = COR.branco; ctx.font = `800 ${t.tamanho}px ${DISPLAY}`
    let y = 360 + t.tamanho
    y = escrever(ctx, t.linhas, M, y, t.tamanho * 1.04)

    ctx.fillStyle = COR.marca; ctx.fillRect(M, y + 10, 132, 16)

    if (slide.texto) {
      ctx.fillStyle = 'rgba(255,255,255,0.88)'; ctx.font = `400 40px ${CORPO}`
      escrever(ctx, quebrar(ctx, slide.texto, largura - 60), M, y + 100, 56)
    }
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = `700 28px ${CORPO}`
    ctx.fillText('Arraste para o lado', M, H - M + 10)
    ctx.textAlign = 'right'; ctx.fillText(`1/${total}`, W - M, H - M + 10); ctx.textAlign = 'left'
    return
  }

  if (tipo === 'cta') {
    ctx.fillStyle = COR.grafite; ctx.fillRect(0, 0, W, H)
    const t = ajustar(ctx, slide.titulo, DISPLAY, 800, 92, 60, largura, 5)
    ctx.fillStyle = COR.branco; ctx.font = `800 ${t.tamanho}px ${DISPLAY}`
    let y = escrever(ctx, t.linhas, M, 380 + t.tamanho, t.tamanho * 1.06)
    if (slide.texto) {
      ctx.fillStyle = '#B9BDD3'; ctx.font = `400 40px ${CORPO}`
      y = escrever(ctx, quebrar(ctx, slide.texto, largura), M, y + 70, 58)
    }
    // pílula amarela com o próximo passo
    const rotulo = slide.botao || `Link na bio · ${arroba}`
    ctx.font = `700 34px ${CORPO}`
    const lw = ctx.measureText(rotulo).width + 72
    const py = Math.min(y + 80, H - M - 100)
    ctx.fillStyle = COR.marca
    ctx.beginPath(); ctx.roundRect(M, py, lw, 92, 46); ctx.fill()
    ctx.fillStyle = COR.grafite; ctx.fillText(rotulo, M + 36, py + 58)
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = `700 28px ${CORPO}`
    ctx.textAlign = 'right'; ctx.fillText(`${i + 1}/${total}`, W - M, H - M + 10); ctx.textAlign = 'left'
    return
  }

  // Slide de conteúdo
  ctx.fillStyle = COR.papel; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = COR.tinta; ctx.font = `800 40px ${DISPLAY}`
  ctx.fillText(String(i).padStart(2, '0'), M, M + 24)
  ctx.fillStyle = COR.cinza; ctx.font = `700 28px ${CORPO}`
  ctx.textAlign = 'right'; ctx.fillText(arroba, W - M, M + 20); ctx.textAlign = 'left'

  const t = ajustar(ctx, slide.titulo, DISPLAY, 800, 88, 56, largura, 4)
  ctx.fillStyle = COR.grafite; ctx.font = `800 ${t.tamanho}px ${DISPLAY}`
  let y = escrever(ctx, t.linhas, M, 260 + t.tamanho, t.tamanho * 1.08)
  if (slide.texto) {
    const c = ajustar(ctx, slide.texto, CORPO, 400, 50, 34, largura, 11)
    ctx.fillStyle = COR.texto; ctx.font = `400 ${c.tamanho}px ${CORPO}`
    escrever(ctx, c.linhas, M, y + 56 + c.tamanho, c.tamanho * 1.45)
  }
  // barra de progresso
  const by = H - M
  ctx.fillStyle = COR.linha; ctx.fillRect(M, by, largura, 6)
  ctx.fillStyle = COR.tinta; ctx.fillRect(M, by, largura * ((i + 1) / total), 6)
}

export const paraJpeg = (canvas) => new Promise((ok) => canvas.toBlob(ok, 'image/jpeg', 0.92))

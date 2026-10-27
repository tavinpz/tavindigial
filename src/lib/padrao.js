// Pattern geométrico da identidade Tavin: quartos de círculo, meios círculos,
// triângulos e malha de triângulos nas 4 cores da marca. Determinístico (mesma semente = mesmo desenho).

export const MARCA = {
  eletrico: '#B600F6',
  profundo: '#5D0487',
  rosa: '#FEA8FF',
  acinzentado: '#2E2633',
}
const CORES = [MARCA.eletrico, MARCA.profundo, MARCA.rosa, MARCA.acinzentado]

// Formas em coordenadas 0..1 (girar em volta do centro)
export const FORMAS = {
  quarto: 'M0 0H1A1 1 0 0 1 0 1Z',
  meia: 'M0 1A0.5 0.5 0 0 1 1 1Z',
  tri: 'M0 0L1 0L0 1Z',
  circulo: 'M0 0.5A0.5 0.5 0 1 0 1 0.5A0.5 0.5 0 1 0 0 0.5Z',
  malha: Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 - i }, (_, j) => {
    const x = j / 4, y = i / 4, t = 0.25
    return `M${x} ${y}L${x + t} ${y}L${x} ${y + t}Z`
  }).join('')).join(''),
}
const TIPOS = ['quarto', 'quarto', 'meia', 'tri', 'circulo', 'malha', 'quarto', 'meia']

function aleatorio(semente) {
  let s = semente >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
}

// Lista de células: { col, lin, fundo, cor, forma, giro }
export function gerarPadrao(colunas, linhas, semente = 7) {
  const r = aleatorio(semente)
  const celulas = []
  for (let lin = 0; lin < linhas; lin++) {
    for (let col = 0; col < colunas; col++) {
      const fundo = CORES[Math.floor(r() * CORES.length)]
      let cor = CORES[Math.floor(r() * CORES.length)]
      if (cor === fundo) cor = CORES[(CORES.indexOf(fundo) + 2) % CORES.length]
      celulas.push({ col, lin, fundo, cor, forma: TIPOS[Math.floor(r() * TIPOS.length)], giro: Math.floor(r() * 4) * 90 })
    }
  }
  return celulas
}

// Desenha no canvas (usado nos slides do carrossel)
export function desenharPadrao(ctx, x, y, colunas, linhas, lado, semente = 7) {
  for (const c of gerarPadrao(colunas, linhas, semente)) {
    const cx = x + c.col * lado, cy = y + c.lin * lado
    ctx.fillStyle = c.fundo
    ctx.fillRect(cx, cy, lado + 0.5, lado + 0.5)
    ctx.save()
    ctx.translate(cx + lado / 2, cy + lado / 2)
    ctx.rotate((c.giro * Math.PI) / 180)
    ctx.translate(-lado / 2, -lado / 2)
    ctx.scale(lado, lado)
    ctx.fillStyle = c.cor
    ctx.fill(new Path2D(FORMAS[c.forma]))
    ctx.restore()
  }
}

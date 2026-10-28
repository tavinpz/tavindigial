import math
from PIL import Image, ImageDraw
NAVY = (9, 19, 32); SEA = (14, 36, 54); BORDER = (52, 78, 100); AMBER = (242, 179, 61); WHITE = (244, 246, 248)

def marca(tam, fundo=True):
    """Símbolo: arco de ponte âmbar sobre a linha do horizonte, com grade de globo ao fundo."""
    S = 4; W = tam * S
    img = Image.new('RGBA', (W, W), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    if fundo: d.ellipse((0, 0, W - 1, W - 1), fill=NAVY)
    c = W / 2; R = W * 0.40
    # grade de globo (meridianos e paralelos) em azul-mar
    for k in (-0.6, -0.3, 0.3, 0.6):
        rx = R * abs(k)
        d.ellipse((c - rx, c - R, c + rx, c + R), outline=SEA + (255,), width=int(W * 0.012))
    d.line((c, c - R, c, c + R), fill=SEA + (255,), width=int(W * 0.012))
    for k in (-0.55, -0.25, 0.25, 0.55):
        y = c + R * k; hw = math.sqrt(max(0, R * R - (R * k) ** 2))
        d.line((c - hw, y, c + hw, y), fill=SEA + (255,), width=int(W * 0.012))
    d.ellipse((c - R, c - R, c + R, c + R), outline=BORDER + (255,), width=int(W * 0.014))
    # arco da ponte
    ar = R * 0.62; esp = W * 0.075; base = c + R * 0.30
    d.arc((c - ar, base - ar, c + ar, base + ar), start=180, end=360, fill=AMBER + (255,), width=int(esp))
    # tabuleiro (linha do horizonte)
    d.rounded_rectangle((c - R * 0.86, base - esp * 0.10, c + R * 0.86, base + esp * 0.62), radius=esp * 0.3, fill=WHITE + (255,))
    # pilares
    for x in (c - ar + esp / 2, c + ar - esp / 2):
        d.rectangle((x - esp / 2, base, x + esp / 2, base + R * 0.28), fill=AMBER + (255,))
    return img.resize((tam, tam), Image.LANCZOS)


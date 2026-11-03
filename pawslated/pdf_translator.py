"""PAWSLATED lead magnet: "The Dog Translator" — 30 signs, US Letter PDF drawn with the same toon kit.
python3 pdf_translator.py  ->  out/The-Dog-Translator.pdf"""
import math
import os

import skia

import paw
from paw import CREAM, INK, LIME, CORAL, MINT, fill, stroke, rrect
from toon import dog_head, ink, rr, oval, ff

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out", "The-Dog-Translator.pdf")
PW, PH = 612, 792          # US Letter (pt)
S = 0.5                    # we draw at 2x (1224 x 1584)
W, H = PW / S, PH / S
INK2 = "#5A514A"
PAPER = "#FFF9EF"
YEL = "#FFE14D"

F = {k: skia.Typeface.MakeFromFile(os.path.join(HERE, f)) for k, f in {
    "black": "InterDisplay-Black.otf", "bold": "InterDisplay-Bold.otf", "med": "Inter-Medium.otf",
    "mono": "JetBrainsMono-Regular.ttf", "monob": "JetBrainsMono-Bold.ttf"}.items()}


def font(k, size):
    f = skia.Font(F[k], size)
    f.setSubpixel(True)
    return f


def txt(c, s, x, y, k, size, col=INK, align="l"):
    f = font(k, size)
    w = f.measureText(s)
    if align == "c":
        x -= w / 2
    elif align == "r":
        x -= w
    c.drawString(s, x, y, f, fill(col))
    return w


def wrap(c, s, x, y, k, size, maxw, col=INK, lh=1.35):
    f = font(k, size)
    words, line_, lines = s.split(), "", []
    for w_ in words:
        nxt = (line_ + " " + w_).strip()
        if f.measureText(nxt) > maxw and line_:
            lines.append(line_)
            line_ = w_
        else:
            line_ = nxt
    if line_:
        lines.append(line_)
    for i, l in enumerate(lines):
        c.drawString(l, x, y + i * size * lh, f, fill(col))
    return len(lines) * size * lh


def head_icon(c, x, y, r, st, bg="#FFE3A6", flip=False):
    ink(c, [(oval(x, y, r, r), bg)], ol=5)
    c.save()
    clip = skia.Path()
    clip.addCircle(x, y, r - 4)
    c.clipPath(clip, doAntiAlias=True)
    c.translate(x, y)
    sc = r / 132
    c.scale(-sc if flip else sc, sc)
    c.translate(118, 330)
    c.rotate(st.get("rot", 0) * 0.5)
    dog_head(c, st, 0.6)
    c.restore()


def logo(c, x, y, s=1.0):
    paw.logo(c, x, y, s)


def page_bg(c, n=None):
    c.drawRect(skia.Rect.MakeWH(W, H), fill(CREAM))
    for row in range(0, 30):
        for col in range(0, 16):
            c.drawCircle(col * 84 + (42 if row % 2 else 0), row * 84, 4, fill("#EADFCB"))
    if n is not None:
        logo(c, 96, H - 78, 0.22)
        txt(c, "PAWSLATED · The Dog Translator", 130, H - 70, "monob", 20, INK2)
        txt(c, str(n), W - 80, H - 70, "monob", 20, INK2, "r")


# ---------------------------------------------------------------- the 30 signs
# (name, looks like, translation, head state, note/source)
SECTIONS = [
    ("NEEDS SPACE", CORAL, "Stress signs. Two or three together mean: slow down.", [
        ("The yawn", "A big yawn when he isn't tired, often during a hug or a vet visit.", "This is too much for me.", {"yawn": 1}, "AKC"),
        ("Lip or nose lick", "A quick flick of the tongue over the nose or lips, with no food around.", "I'm uneasy.", {"lick": 1}, "AKC"),
        ("Whale eye", "He turns his head away but keeps his eyes on you, so the whites show.", "I'm worried about this.", {"whale": 1}, "AKC"),
        ("Ears pinned back", "Ears flat against the head, close to the skull.", "I'm nervous.", {"ears": 1}, "AKC"),
        ("The look away", "He turns his head or whole body away from you or another dog.", "Please give me some space.", {"turn": 1, "ears": 0.4}, "AKC"),
        ("Tail low or tucked", "Tail held low or pulled between the back legs.", "I'm scared.", {"ears": 1, "whale": 0.6}, "AKC"),
        ("Trembling", "Shaking when he isn't cold or wet.", "I'm frightened.", {"ears": 0.8, "whale": 0.5}, "AKC"),
        ("Crouching low", "Body lowered toward the ground, weight shifted back.", "I'm not sure I'm safe.", {"ears": 0.9, "rot": -10}, "AKC"),
        ("The duck", "He dips his head away when a hand comes over the top of it.", "Not the head, please.", {"ears": 0.7, "rot": -14}, "Reader's Digest"),
        ("The guilty look", "Head low, ears back, eyes away when you sound upset.", "You sound angry. Please calm down.", {"ears": 1, "rot": -10}, "Horowitz 2009"),
    ]),
    ("HAPPY & RELAXED", MINT, "Calm signs. A loose, wiggly body is the clearest one.", [
        ("Soft eyes", "Relaxed, almost squinty eyes, with no tension around them.", "I feel safe with you.", {"happy": 1, "soft": 1}, "AKC"),
        ("Goofy smile", "Mouth open and relaxed, tongue hanging a little.", "Life is good.", {"grin": 1, "happy": 1}, "AKC"),
        ("Loose, slow wag", "Tail at mid height, swinging wide and easy, often with the whole back end.", "I'm happy and relaxed.", {"happy": 1, "soft": 1}, "AKC"),
        ("The long, soft stare", "He gazes at you with soft eyes and a relaxed face.", "I love you.", {"soft": 1}, "Nagasawa et al. 2015"),
        ("Belly up, wiggly", "He rolls over loose and wiggly, mouth open, eyes soft.", "Rub my belly, please.", {"happy": 1, "grin": 0.6}, "AKC"),
        ("The lean", "He presses his whole body into your legs and stays there.", "You're my person. This is a hug.", {"happy": 1, "squint": 0.4}, "Dr. Patty Khuly, Vetstreet"),
        ("The paw on you", "He rests a paw on your arm or leg, often while looking at you.", "Notice me. I love you.", {"paw": 1, "soft": 1}, "Dr. Mary Burch, AKC"),
        ("Sleeping on your clothes", "He curls up on your laundry or the spot you just left.", "It smells like you. I feel close to you.", {"squint": 1, "soft": 1}, "AKC"),
        ("Following you everywhere", "Room to room, even to the bathroom, calm when you leave.", "Where you go, I go.", {"perk": 0.6, "happy": 1}, "Whole Dog Journal"),
    ]),
    ("LET'S PLAY", LIME, "Play signs. Big, bouncy, exaggerated moves mean it's a game.", [
        ("The play bow", "Front legs down, back end up, tail wagging.", "Let's play!", {"happy": 1, "grin": 1}, "AKC"),
        ("The play sneeze", "Little sneezes in the middle of a game.", "Relax, this is just for fun.", {"squint": 0.6, "happy": 1}, "AKC"),
        ("The zoomies", "Sudden laps around the house or yard, often after a bath.", "I have SO much energy!", {"grin": 1, "perk": 1}, "AKC (FRAPs)"),
        ("Licking your face", "Lots of licks when you come home or after a workout.", "Hi! I love you! You taste salty.", {"lick": 0.6, "happy": 1}, "Dr. Mary Burch, AKC"),
    ]),
    ("CURIOUS & LISTENING", YEL, "Focus signs. He's taking in information, or leaving some for other dogs.", [
        ("The head tilt", "Head cocked to one side when you talk to him.", "Wait, did you say a word I know?", {"perk": 0.6, "rot": 14}, "Sommese et al. 2021"),
        ("Ears forward", "Ears up and pointed toward a sound or a person.", "What's that? I'm paying attention.", {"perk": 1}, "AKC"),
        ("Spinning before lying down", "Two or three circles before he flops down.", "Making the bed, dog style.", {"squint": 0.4, "soft": 1}, "Stanley Coren, Psychology Today"),
        ("Kicking the grass", "Big back-leg scratches after he goes potty.", "I was here. Tell everyone.", {"grin": 0.6, "perk": 0.6}, "VCA Animal Hospitals"),
        ("Bringing you a toy", "He drops a toy at your feet and looks at you.", "Your turn. Throw it!", {"perk": 1, "happy": 1}, ""),
        ("The big welcome", "Extra wiggles and jumps when you've been gone for hours.", "You were gone SO long.", {"grin": 1, "happy": 1, "perk": 1}, "Rehn & Keeling 2011"),
        ("The doorbell bark", "Barking and running to the door at every ring.", "Someone's here! I'm on it!", {"yawn": 0.5, "perk": 1, "hard": 0.4}, "AKC"),
    ]),
]

SOURCES = [
    "American Kennel Club (AKC), akc.org: How to read dog body language; Should you hug your dog; Why does my dog roll on their back; What are zoomies; Why is my dog licking me; How to stop barking at the doorbell; Why dogs steal laundry.",
    "Nagasawa, M. et al. (2015). Oxytocin-gaze positive loop and the coevolution of human-dog bonds. Science, 348(6232).",
    "Horowitz, A. (2009). Disambiguating the \"guilty look\". Behavioural Processes, 81(3).",
    "Sommese, A. et al. (2021). An exploratory analysis of head-tilting in dogs. Animal Cognition, 25.",
    "Rehn, T. & Keeling, L. (2011). The effect of time left alone at home on dog welfare. Applied Animal Behaviour Science, 129.",
    "Coren, S. (2016). Why do dogs turn in circles before lying down? Psychology Today.",
    "Merriam, J. Why does my dog follow me everywhere? Whole Dog Journal.",
    "Khuly, P. Why does my dog lean on me? Vetstreet.",
    "VCA Animal Hospitals. Why do dogs kick grass after nature calls?",
]


def card(c, x, y, w, h, i, sign, col):
    name, looks, means, st, src = sign
    c.drawRRect(rrect(x + 6, y + 10, w, h, 36), fill(INK))
    ink(c, [(rr(x, y, w, h, 36), "#FFFFFF")], ol=5)
    head_icon(c, x + 92, y + h / 2 - 10, 62, st, "#FFE3A6")
    # number chip
    ink(c, [(oval(x + 40, y + 34, 26, 26), col)], ol=4)
    txt(c, f"{i:02d}", x + 40, y + 42, "monob", 22, INK, "c")
    tx = x + 186
    txt(c, name, tx, y + 62, "black", 40)
    wrap(c, looks, tx, y + 102, "med", 25, w - 216, INK2, 1.25)
    by = y + h - 84
    bw = w - 210
    ink(c, [(rr(tx - 6, by, bw, 64, 20), "#F6F2E9")], ol=0)
    c.drawRRect(rrect(tx - 6, by, bw, 64, 20), stroke(INK, 3))
    ink(c, [(rr(tx + 8, by - 16, 190, 32, 16), LIME)], ol=3)
    txt(c, "DOG → HUMAN", tx + 22, by + 7, "monob", 17)
    size = 27
    while font("bold", size).measureText(f"\"{means}\"") > bw - 30 and size > 19:
        size -= 1
    txt(c, f"\"{means}\"", tx + 12, by + 46, "bold", size)
    if src:
        txt(c, src, x + w - 30, y + 46, "mono", 17, "#9A9087", "r")


def cover(c):
    c.drawRect(skia.Rect.MakeWH(W, H), fill(LIME))
    for row in range(0, 30):
        for col in range(0, 16):
            c.drawCircle(col * 84 + (42 if row % 2 else 0), row * 84, 5, fill("#B5DB2E"))
    logo(c, W / 2, 230, 1.1)
    txt(c, "PAWSLATED", W / 2, 400, "black", 54, INK, "c")
    txt(c, "THE DOG", W / 2, 600, "black", 150, INK, "c")
    txt(c, "TRANSLATOR", W / 2, 750, "black", 150, INK, "c")
    c.drawRRect(rrect(W / 2 - 330 + 6, 820, 660, 92, 46), fill(INK))
    ink(c, [(rr(W / 2 - 330, 810, 660, 92, 46), "#FFFFFF")], ol=6)
    txt(c, "30 signs, in plain English", W / 2, 870, "bold", 40, INK, "c")
    # a row of heads
    states = [{"happy": 1, "grin": 1}, {"whale": 1}, {"perk": 1, "rot": 14}, {"yawn": 1}, {"soft": 1, "happy": 1}]
    for i, st in enumerate(states):
        head_icon(c, W / 2 + (i - 2) * 200, 1110, 84, st, "#FFF3C9")
    txt(c, "What your dog is really telling you,", W / 2, 1320, "med", 36, INK, "c")
    txt(c, "and what to do about it.", W / 2, 1368, "med", 36, INK, "c")
    txt(c, "@pawslated", W / 2, 1500, "monob", 28, INK, "c")


def intro(c):
    page_bg(c, 2)
    txt(c, "HOW TO USE THIS", 96, 200, "black", 72)
    y = 280
    rules = [("Read 3, not 1.", "One sign alone can mean little. A yawn can just be a yawn. Two or three signs together tell you how he really feels."),
             ("Watch the whole dog.", "Tail, ears, mouth, eyes, body. AKC's rule: no single body-language signal tells the whole story."),
             ("Know his normal.", "Some breeds carry their tails low or their ears back all the time. Learn what relaxed looks like on YOUR dog first."),
             ("Give space, then wait.", "If you see stress signs, give him space and let him come to you. Pushing through usually makes it worse.")]
    for i, (a, b) in enumerate(rules):
        c.drawRRect(rrect(96 + 6, y + 10, W - 192, 220, 40), fill(INK))
        ink(c, [(rr(96, y, W - 192, 220, 40), "#FFFFFF")], ol=5)
        ink(c, [(oval(176, y + 110, 46, 46), (LIME, MINT, YEL, CORAL)[i])], ol=5)
        txt(c, str(i + 1), 176, y + 128, "black", 52, INK, "c")
        txt(c, a, 256, y + 82, "black", 44)
        wrap(c, b, 256, y + 130, "med", 28, W - 420, INK2, 1.35)
        y += 260
    # the 4 groups legend
    y += 10
    txt(c, "THE 4 GROUPS", 96, y + 40, "monob", 26, INK2)
    for i, (name, col, _, items) in enumerate(SECTIONS):
        x = 96 + (i % 2) * 520
        yy = y + 80 + (i // 2) * 90
        ink(c, [(rr(x, yy, 490, 68, 34), col)], ol=4)
        txt(c, f"{name}  ·  {len(items)}", x + 30, yy + 45, "bold", 30, INK if col != CORAL else "#FFFFFF")


def section_pages(doc, start):
    n = 1
    pg = start
    for name, col, sub, items in SECTIONS:
        chunks = [items[i:i + 4] for i in range(0, len(items), 4)]
        for ci, chunk in enumerate(chunks):
            c = doc.beginPage(PW, PH)
            c.scale(S, S)
            page_bg(c, pg)
            ink(c, [(rr(96, 120, 60, 60, 30), col)], ol=4)
            txt(c, name + ("" if ci == 0 else " (cont.)"), 180, 168, "black", 60)
            wrap(c, sub, 96, 238, "med", 28, W - 192, INK2)
            y = 290
            for sign in chunk:
                card(c, 96, y, W - 192, 252, n, sign, col)
                y += 280
                n += 1
            doc.endPage()
            pg += 1
    return pg


def last_pages(doc, pg):
    c = doc.beginPage(PW, PH)
    c.scale(S, S)
    page_bg(c, pg)
    txt(c, "BARKING? PULLING?", 96, 210, "black", 72)
    txt(c, "PANICKING WHEN YOU LEAVE?", 96, 296, "black", 60)
    wrap(c, "Reading the signs is step one. Fixing the problem is step two. Fix It in 7 Days is a short, step-by-step plan for the three things owners ask us about most: barking, leash pulling and being home alone. Ten minutes a day.", 96, 380, "med", 32, W - 192, INK2, 1.4)
    items = [("Day 1–2", "Find the trigger and set up the win"), ("Day 3–5", "Short daily drills, one behavior at a time"), ("Day 6–7", "Make it stick in real life")]
    y = 610
    for a, b in items:
        c.drawRRect(rrect(96 + 6, y + 10, W - 192, 120, 36), fill(INK))
        ink(c, [(rr(96, y, W - 192, 120, 36), "#FFFFFF")], ol=5)
        ink(c, [(rr(126, y + 34, 200, 52, 26), LIME)], ol=4)
        txt(c, a, 226, y + 70, "monob", 26, INK, "c")
        txt(c, b, 360, y + 72, "bold", 32)
        y += 150
    c.drawRRect(rrect(W / 2 - 360 + 6, 1110, 720, 120, 60), fill(INK))
    ink(c, [(rr(W / 2 - 360, 1100, 720, 120, 60), CORAL)], ol=6)
    txt(c, "Get Fix It in 7 Days · $9", W / 2, 1176, "black", 46, "#FFFFFF", "c")
    txt(c, "On the same page where you got this guide.", W / 2, 1290, "med", 28, INK2, "c")
    txt(c, "New behavior every day: @pawslated", W / 2, 1360, "monob", 28, INK, "c")
    doc.endPage()
    pg += 1
    c = doc.beginPage(PW, PH)
    c.scale(S, S)
    page_bg(c, pg)
    txt(c, "SOURCES", 96, 200, "black", 72)
    y = 280
    for s in SOURCES:
        y += wrap(c, "• " + s, 96, y, "med", 25, W - 192, INK2, 1.4) + 18
    y += 40
    c.drawRRect(rrect(96, y, W - 192, 230, 30), fill("#FFFFFF"))
    c.drawRRect(rrect(96, y, W - 192, 230, 30), stroke(INK, 4))
    txt(c, "A NOTE", 130, y + 56, "monob", 24, INK)
    wrap(c, "This guide is general education about dog body language, not veterinary or behavioral advice. Every dog is different. If your dog shows sudden changes in behavior, signs of pain, or aggression, talk to your veterinarian or a certified behavior professional.", 130, y + 100, "med", 24, W - 270, INK2, 1.4)
    txt(c, "© 2026 PAWSLATED · Free to share, not to sell.", W / 2, H - 140, "mono", 22, INK2, "c")
    doc.endPage()


def build():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    stream = skia.FILEWStream(OUT)
    meta = skia.PDF.Metadata()
    meta.fTitle = "The Dog Translator: 30 signs, in plain English"
    meta.fAuthor = "PAWSLATED"
    doc = skia.PDF.MakeDocument(stream, meta)
    c = doc.beginPage(PW, PH)
    c.scale(S, S)
    cover(c)
    doc.endPage()
    c = doc.beginPage(PW, PH)
    c.scale(S, S)
    intro(c)
    doc.endPage()
    pg = section_pages(doc, 3)
    last_pages(doc, pg)
    doc.close()
    stream.flush()
    del stream
    print("ok", OUT)


if __name__ == "__main__":
    build()

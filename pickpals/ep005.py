from abfx import ab_fx, ab_sil, ab_script
SCRIPT = ab_script("Snack time! Yummy!", "Bo's hands are super dirty!", "A. Eat right now!", "B. Wash hands first!", "B", "Germs hide on dirty hands!", "Wash with soap, then eat.", "Squeaky clean!", "Next: can you spot the danger? Ready?")
RIGHT = "B"
def FX(b): return ab_fx(b, RIGHT, "munch")
def SILENCIO(b): return ab_sil(b)

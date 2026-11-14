from abfx import ab_fx, ab_sil, ab_script
SCRIPT = ab_script("Yawn... time for bed!", "Bo ate candy and didn't brush!", "A. Go straight to bed!", "B. Brush teeth first!", "B", "Sugar bugs love dirty teeth!", "Brush your teeth every night.", "Shiny teeth!", "Next one is a big surprise. Ready?")
RIGHT = "B"
def FX(b): return ab_fx(b, RIGHT, "snore")
def SILENCIO(b): return ab_sil(b)

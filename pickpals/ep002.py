from abfx import ab_fx, ab_sil, ab_script
SCRIPT = ab_script("Wheee! I'm so fast!", "Bo is running with scissors!", "A. Walk slowly!", "B. Run even faster!", "A", "Never run with scissors!", "Walk, and point them down.", "Got it, Coach!", "Next: a color magic trick. Ready?")
RIGHT = "A"
def FX(b): return ab_fx(b, RIGHT, "whoosh")
def SILENCIO(b): return ab_sil(b)

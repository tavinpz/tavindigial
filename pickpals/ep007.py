from abfx import ab_fx, ab_sil, ab_script
SCRIPT = ab_script("Knock knock? Who's there?", "Someone Bo doesn't know is at the door!", "A. Get a grown-up!", "B. Open the door!", "A", "Never open the door to strangers!", "Always get a grown-up first.", "Safe and smart!", "Next: bedtime trouble. Ready?")
RIGHT = "A"
def FX(b): return ab_fx(b, RIGHT, "knock")
def SILENCIO(b): return ab_sil(b)

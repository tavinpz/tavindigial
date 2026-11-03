"""Publish PAWSLATED episodes to the painel (canal 'pawslated').
  python3 publish_pw.py 1 2 3 4 5 6   -> covers + mp4 into envio/pawslated/ on branch envio-videos, writes out/pw_register.sql + out/pw_videos.sql
"""
import hashlib
import os
import shutil
import subprocess
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = "/home/claude/tavindigial"
BASE = "https://vvlzverpxojrecxysmhm.supabase.co/storage/v1/object/public/videos/pawslated/"
TAGS = "dog behavior, dog training, dog tips, dog body language, dog cartoon, pawslated"
HASH = "#dogbehavior #dogtraining #dogtips #doglover #dogsofinstagram #pawslated"
CTA = "🐾 Comment TRANSLATE and I'll send you 30 more signs."

META = {
    1: dict(slug="yawn", file="PAWSLATED_001_cartoon.mp4", name="Your dog yawns when you hug him?", cover=3.4,
            yt="Your dog yawns when you hug him? 🐾",
            cap="That yawn isn't sleepy. It's your dog saying \"too much.\" Yawning, nose licks, whale eye and a head turn are the 4 signs he wants space. Let him come to you instead.",
            pin="Does your dog do this when you hug him? Yes or no 👇"),
    2: dict(slug="stare", name="Your dog stares at you?", cover=3.3,
            yt="Your dog stares at you? Here's what it means 🐾",
            cap="That long, soft stare isn't about food. In a 2015 study, long eye contact with their owner at least doubled dogs' oxytocin, the love hormone. Soft eyes = love. Hard stare + stiff body = give him space.",
            pin="Does your dog stare at you like this? 👀👇"),
    3: dict(slug="guilty", name="That guilty look", cover=3.3,
            yt="That \"guilty\" look isn't guilt 🐾",
            cap="Ears back, looking away, lip licks, head low... it looks like guilt. It's fear. In a 2009 study, dogs looked MOST guilty when scolded for something they didn't even do. A calm voice works better than scolding.",
            pin="Be honest: have you ever scolded the wrong dog? 😅👇"),
    4: dict(slug="tilt", name="Why he tilts his head", cover=3.7,
            yt="Why your dog tilts his head 🐾",
            cap="That head tilt means he's processing something important, like a word he knows. In a 2021 study, dogs that knew lots of toy names tilted their heads almost every time they heard one. What word makes YOUR dog tilt?",
            pin="What word makes your dog tilt his head? 👇"),
    5: dict(slug="paw", name="A paw on you", cover=5.8,
            yt="When your dog puts his paw on you 🐾",
            cap="A paw on you can mean \"notice me\", \"I'm hungry\", \"let me out\"... or his version of a hug. \"It can mean I love you,\" says Dr. Mary Burch of the American Kennel Club.",
            pin="Does your dog do this when you're sad? 🥺👇"),
    6: dict(slug="sneeze", name="The play sneeze", cover=2.95,
            yt="Why your dog sneezes when you play 🐾",
            cap="That little sneeze in the middle of play? It's a signal: \"relax, this is just a game.\" The American Kennel Club says sneezing is a way of communicating playfulness.",
            pin="Does your dog do the play sneeze? 🤧👇"),
    7: dict(slug="hears", name="What he hears", yt="What your dog hears when you talk 😂🐾",
            cap="You: a whole speech. Him: blah blah blah... WALK?! But he knows more than you think. In a 2021 study, dogs responded to about 89 words on average, and some to over 200. What word does YOUR dog know best?",
            pin="What's the one word your dog ALWAYS knows? 👇"),
    8: dict(slug="happy-vs-stressed", name="Happy or stressed?", yt="Happy dog or stressed dog? Here's how to tell 🐾",
            cap="Tail, ears, mouth, eyes. A slow, loose wag, relaxed ears, a goofy smile and soft eyes = happy. A stiff, fast wag, pinned ears, a tight mouth and wide eyes = give him a minute. Look for several signs together, not just one. Save this! 📌",
            pin="Which one is your dog right now? Left or right? 👇"),
    9: dict(slug="lick-quiz", name="Why he licks you (quiz)", yt="Why does your dog lick you? (Quiz) 🐾",
            cap="A: he's cleaning you. B: he loves you. C: you taste salty. The answer is B AND C: licking is a greeting and a sign of affection, and human skin is slightly salty, especially after a workout. Did you get it right?",
            pin="Be honest: what did you guess? A, B or C? 👇"),
    10: dict(slug="while-youre-gone", name="While you're gone", yt="What your dog thinks when you leave 🥺🐾",
             cap="Minute one: she'll be right back. Two hours: is she ever coming back? Dogs can tell. In a 2011 study, dogs greeted their owners more intensely after two hours alone than after thirty minutes. Tag someone whose dog waits by the door.",
             pin="How long is your dog home alone? 👇"),
    11: dict(slug="head-pat", name="Stop the head pats", yt="Stop patting your dog on the head 🐾",
             cap="Most dogs don't love head pats. Watch for the duck, the ears going back and the lip lick. Instead, get low, let him come to you, and scratch his chest or chin. Try it today and watch the difference.",
             pin="Does your dog duck when people pat his head? 👇"),
}
START_DAY = 4      # 2026-11-04, one per day at 21:00 (-03) = prime time on the US East Coast


def q(s):
    return "null" if s is None else "$t$" + s + "$t$"


COVER3 = {1: ("whale", 0.6), 2: ("eyes", 0.8), 3: ("low", 0.6), 4: ("word", 0.6), 5: ("paw", 1.2), 6: ("signal", 0.3),
          7: ("blah", 1.6), 8: ("mouth", 1.0), 9: ("ans", 0.6), 10: ("t3", 1.0), 11: ("duck", 0.6)}


def scene(n):
    if n >= 7:
        import episodes4
        return episodes4.EPISODES[n]()
    import episodes3
    return episodes3.EPISODES[n]()


def prepare(nums):
    env = os.path.join(REPO, "envio")
    dst = os.path.join(env, "pawslated")
    shutil.rmtree(env, ignore_errors=True)
    os.makedirs(dst)
    reg, rows = [], []
    for i, n in enumerate(nums):
        m = META[n]
        rid = f"pw-{n:03d}-{m['slug']}"
        slug = rid + "-v3"
        src = os.path.join(HERE, "out", f"PAWSLATED_{n:03d}_{m['slug']}_v3.mp4")
        sc = scene(n)
        Image.fromarray(sc.frame(sc.b0(*COVER3[n]))).save(os.path.join(dst, slug + ".jpg"), quality=90)
        shutil.copy(src, os.path.join(dst, slug + ".mp4"))
        for ext in (".mp4", ".jpg"):
            sha = hashlib.sha256(open(os.path.join(dst, slug + ext), "rb").read()).hexdigest()
            reg.append(f"('pawslated/{slug}{ext}','{sha}')")
        dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src]).decode())
        cap = f"{m['cap']}\n\n{CTA}\n\n{HASH}"
        when = f"2026-11-{3 + n:02d} 21:00:00-03"
        rows.append("(" + ",".join([q(rid), "'pawslated'", str(n), q(f"№{n:03d} · {m['name']}"), q(slug + ".mp4"),
                                    q(BASE + slug + ".mp4"), q(BASE + slug + ".jpg"), f"{dur:.2f}", q(when), q(m["yt"]),
                                    q(cap), q(cap), q(cap), q(m["pin"]), q(TAGS),
                                    q("Desenho narrado (v3), voz + legenda, áudio original. CTA 'Comment TRANSLATE' depende do ManyChat + PDF grátis (ainda não configurados).")]) + ")")
    open(os.path.join(HERE, "out", "pw_register.sql"), "w").write(
        "insert into videos_envio (caminho, sha256) values\n" + ",\n".join(reg) + "\non conflict do nothing returning caminho;")
    open(os.path.join(HERE, "out", "pw_videos.sql"), "w").write(
        "insert into videos (id,canal,numero,titulo,arquivo,video_url,capa_url,duracao,publicar_em,yt_titulo,yt_descricao,"
        "tt_legenda,ig_legenda,comentario_fixado,yt_tags,notas) values\n" + ",\n".join(rows) +
        "\non conflict (id) do update set arquivo=excluded.arquivo, video_url=excluded.video_url, capa_url=excluded.capa_url, duracao=excluded.duracao, notas=excluded.notas, "
        "yt_descricao=excluded.yt_descricao, tt_legenda=excluded.tt_legenda, ig_legenda=excluded.ig_legenda returning id;")
    print("ready:", len(nums))


if __name__ == "__main__":
    prepare([int(x) for x in sys.argv[1:]])

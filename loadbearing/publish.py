"""Publish LOADBEARING episodes to the painel (tavindigital.online/painel → canal LOADBEARING).

  python3 publish.py prepare 6 7 8 ...   -> builds covers + copies mp4 into the upload branch, writes SQL files
Steps that need tools outside this script (run by Claude):
  1. execute out/publish_register.sql  (registers sha256 in videos_envio)
  2. git push origin envio-videos      (GitHub Actions uploads to Supabase Storage → loadbearing/)
  3. execute out/publish_videos.sql    (creates the cards with captions + schedule)
"""
import hashlib
import json
import os
import shutil
import subprocess
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = "/home/claude/tavindigial"
BASE = "https://vvlzverpxojrecxysmhm.supabase.co/storage/v1/object/public/videos/loadbearing/"
META = json.load(open(os.path.join(HERE, "episodes.json")))


def q(s):
    return "null" if s is None else "$t$" + s + "$t$"


def prepare(eps):
    import simple, varied
    EPS = {**simple.EPISODES, **varied.EPISODES}
    env = os.path.join(REPO, "envio")
    subprocess.run(["git", "-C", REPO, "checkout", "-q", "envio-videos"], check=True)
    for f in os.listdir(env):
        os.remove(os.path.join(env, f))
    reg, rows = [], []
    for ep in eps:
        m = META[str(ep)]
        slug = f"lb-{ep:03d}-{m['slug']}"
        src = os.path.join(HERE, "out", f"LB{ep:03d}_{EPS[ep].SLUG}.mp4")
        sc = EPS[ep]()
        Image.fromarray(sc.frame(m.get("cover", sc.T_TEXT - 0.45))).save(os.path.join(env, slug + ".jpg"), quality=90)
        shutil.copy(src, os.path.join(env, slug + ".mp4"))
        for ext in (".mp4", ".jpg"):
            sha = hashlib.sha256(open(os.path.join(env, slug + ext), "rb").read()).hexdigest()
            reg.append(f"('loadbearing/{slug}{ext}','{sha}')")
        dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src]).decode())
        cap = m["caption"]
        rows.append("(" + ",".join([q(slug), "'loadbearing'", str(ep), q(f"№{ep:03d} · {m['name']}"), q(slug + ".mp4"),
                                    q(BASE + slug + ".mp4"), q(BASE + slug + ".jpg"), f"{dur:.2f}", q(m["when"]), q(m["yt"]),
                                    q(cap), q(cap), q(cap), q(m.get("pin", "Orange hat or grey hat? Be honest. 👇")), q(m["tags"]),
                                    q(m.get("notas", "Série curta (≈10 s). Áudio original: foley + assinatura sonora."))]) + ")")
    open(os.path.join(HERE, "out", "publish_register.sql"), "w").write(
        "insert into videos_envio (caminho, sha256) values\n" + ",\n".join(reg) + "\non conflict do nothing returning caminho;")
    open(os.path.join(HERE, "out", "publish_videos.sql"), "w").write(
        "insert into videos (id,canal,numero,titulo,arquivo,video_url,capa_url,duracao,publicar_em,yt_titulo,yt_descricao,"
        "tt_legenda,ig_legenda,comentario_fixado,yt_tags,notas) values\n" + ",\n".join(rows) +
        "\non conflict (id) do update set video_url=excluded.video_url, capa_url=excluded.capa_url, duracao=excluded.duracao, "
        "yt_descricao=excluded.yt_descricao, tt_legenda=excluded.tt_legenda, ig_legenda=excluded.ig_legenda returning id;")
    subprocess.run(["git", "-C", REPO, "add", "-A", "envio"], check=True)
    subprocess.run(["git", "-C", REPO, "commit", "-qm", f"LOADBEARING: episódios {', '.join(f'{e:03d}' for e in eps)} para o painel\n\n"
                    "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\n"
                    "Claude-Session: https://claude.ai/code/session_0129hr5HKEwiCXch5Qf59hpX"], check=True)
    print("ready:", len(eps), "episodes")


if __name__ == "__main__":
    if sys.argv[1] == "prepare":
        prepare([int(x) for x in sys.argv[2:]])

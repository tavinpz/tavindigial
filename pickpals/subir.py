"""Copia episódios para envio/pick-pals, gera capa e imprime o SQL para registrar (videos_envio + videos)."""
import hashlib, json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(__file__))
from meta import EPS, TAGS, BASE

OUT = '/home/claude/envio-wt/envio/pick-pals'
URL = 'https://vvlzverpxojrecxysmhm.supabase.co/storage/v1/object/public/videos/pick-pals/'
os.makedirs(OUT, exist_ok=True)
sha = lambda p: hashlib.sha256(open(p, 'rb').read()).hexdigest()
q = lambda s: "'" + s.replace("'", "''") + "'"
sql = []
for ep in sys.argv[1:]:
    tit, desc, vid, arq, tcapa = EPS[ep]
    src = f'/home/claude/pickpals/{arq}'
    dst, capa = f'{OUT}/{vid}.mp4', f'{OUT}/{vid}.jpg'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-c', 'copy', '-movflags', '+faststart', dst], check=True)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(tcapa), '-i', dst, '-frames:v', '1', '-vf', 'scale=720:-2', '-q:v', '3', capa], check=True)
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', dst], capture_output=True, text=True).stdout)
    n = int(vid.split('-')[1])
    ytd = f'{desc}\n\n{BASE}\n\n#kidssafety #goodhabits #kidslearning #shorts'
    sql.append(f"select pp_registrar('{vid}',{n},{q(tit)},{q(desc)},'{arq}',{dur:.1f},'{sha(dst)}','{sha(capa)}');")
    continue
    sql.append(f"insert into videos_envio(caminho, sha256) values ('pick-pals/{vid}.mp4','{sha(dst)}'),('pick-pals/{vid}.jpg','{sha(capa)}') on conflict do nothing;")
    sql.append(
        "insert into videos(id, canal, numero, titulo, arquivo, video_url, capa_url, duracao, yt_titulo, yt_descricao, yt_tags, tt_legenda, ig_legenda, yt_status, notas) values ("
        f"'{vid}','pick-pals',{n},{q(tit)},'{arq}','{URL}{vid}.mp4','{URL}{vid}.jpg',{dur:.1f},{q(tit + ' #shorts')},{q(ytd)},{q(TAGS)},"
        f"{q(tit + ' ' + desc + ' #kidssafety #goodhabits #kids')},{q(tit + chr(10) + chr(10) + desc + chr(10) + chr(10) + '#kidssafety #goodhabits #kidslearning #parenting')},'pendente',"
        "'Made for Kids: marcar como conteúdo para crianças no YouTube.') on conflict (id) do update set video_url=excluded.video_url, capa_url=excluded.capa_url, duracao=excluded.duracao;")
print('\n'.join(sql))

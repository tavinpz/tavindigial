"""Prepara os vídeos para o painel (tavindigital.online/painel, aba Vídeos).

1. Gera a cópia de distribuição (H.264 CRF 21, ~15 MB) e a capa (quadro do gancho) em envio/.
2. Escreve envio/registro.sql: registra caminho+sha256 em videos_envio e faz upsert em public.videos
   com títulos, descrições e legendas de canal/videos.json (rodar no Supabase do Tavin Digital).
3. Publica os arquivos num branch órfão "envio-videos" do repositório tavindigial; o GitHub Actions
   desse branch sobe tudo para o Storage usando a função receber-video.

uso: python3 motor/enviar_painel.py ca-001 ca-003 ...   (sem argumentos = todos de canal/videos.json)
"""
import hashlib, json, os, shutil, subprocess, sys

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ENVIO = os.path.join(RAIZ, 'envio')
SUPA = 'https://vvlzverpxojrecxysmhm.supabase.co'
PUB = f'{SUPA}/storage/v1/object/public/videos/concrete-atlas'
REPO = 'https://github.com/tavinpz/tavindigial'

WORKFLOW = """name: subir-videos
on:
  push:
    branches: [envio-videos]
jobs:
  subir:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Enviar para o Supabase Storage
        run: |
          falhas=0
          for f in envio/*.mp4 envio/*.jpg; do
            [ -e "$f" ] || continue
            nome=$(basename "$f"); caminho="concrete-atlas/$nome"
            sha=$(sha256sum "$f" | cut -d' ' -f1)
            resp=$(curl -sS -X POST "%s/functions/v1/receber-video" -H "content-type: application/json" -d "{\\"caminho\\":\\"$caminho\\",\\"sha256\\":\\"$sha\\"}")
            url=$(echo "$resp" | jq -r '.url // empty')
            if [ -z "$url" ]; then echo "pulou $nome: $resp"; continue; fi
            case "$nome" in *.mp4) tipo=video/mp4;; *) tipo=image/jpeg;; esac
            if curl -sS --fail --retry 4 --retry-all-errors --retry-delay 5 -X PUT "$url" -H "content-type: $tipo" -H "x-upsert: true" -H "cache-control: max-age=31536000" --data-binary @"$f" > /dev/null; then
              echo "ok $nome"
            else
              echo "FALHOU $nome"; falhas=$((falhas+1))
            fi
          done
          [ "$falhas" -eq 0 ]
""" % SUPA


def q(s):
    return 'null' if s is None else "'" + str(s).replace("'", "''") + "'"


def main(ids):
    vids = json.load(open(os.path.join(RAIZ, 'canal', 'videos.json')))
    if ids: vids = [v for v in vids if v['id'] in ids]
    os.makedirs(ENVIO, exist_ok=True)
    sql = []
    for v in vids:
        src = os.path.join(RAIZ, 'saida', v['arquivo'])
        mp4 = os.path.join(ENVIO, f"{v['id']}.mp4"); jpg = os.path.join(ENVIO, f"{v['id']}.jpg")
        tem = os.path.exists(src)
        if not tem:
            # vídeo ainda não renderizado: entra no painel só com textos e data
            fontes = 'array[' + ','.join(q(x) for x in v.get('fontes', [])) + ']::text[]'
            sql.append(
                "insert into public.videos (id, canal, numero, titulo, arquivo, publicar_em, yt_titulo, yt_descricao, tt_legenda, ig_legenda, comentario_fixado, fontes) values ("
                f"{q(v['id'])}, 'concrete-atlas', {v['numero']}, {q(v['yt_titulo'])}, {q(v['arquivo'])}, {q(v['publicar_em'])}, {q(v['yt_titulo'])}, {q(v['yt_descricao'])}, "
                f"{q(v['tt_legenda'])}, {q(v['ig_legenda'])}, {q(v['comentario_fixado'])}, {fontes}) "
                "on conflict (id) do update set titulo = excluded.titulo, publicar_em = excluded.publicar_em, yt_titulo = excluded.yt_titulo, yt_descricao = excluded.yt_descricao, "
                "tt_legenda = excluded.tt_legenda, ig_legenda = excluded.ig_legenda, comentario_fixado = excluded.comentario_fixado, fontes = excluded.fontes;")
            print('só textos', v['id']); continue
        if not os.path.exists(mp4) or os.path.getmtime(mp4) < os.path.getmtime(src):
            subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src, '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-maxrate', '9M', '-bufsize', '18M',
                            '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-c:a', 'aac', '-b:a', '160k', '-ar', '48000', '-movflags', '+faststart', mp4], check=True)
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', '0.5', '-i', src, '-frames:v', '1', '-q:v', '3', jpg], check=True)
        dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4], capture_output=True, text=True).stdout)
        for f in (mp4, jpg):
            sha = hashlib.sha256(open(f, 'rb').read()).hexdigest()
            sql.append(f"insert into public.videos_envio(caminho, sha256) values ('concrete-atlas/{os.path.basename(f)}', '{sha}') "
                       f"on conflict (caminho) do update set sha256 = excluded.sha256, usado_em = null;")
        fontes = 'array[' + ','.join(q(x) for x in v.get('fontes', [])) + ']::text[]'
        sql.append(
            "insert into public.videos (id, canal, numero, titulo, arquivo, video_url, capa_url, duracao, publicar_em, yt_titulo, yt_descricao, tt_legenda, ig_legenda, comentario_fixado, fontes) values ("
            f"{q(v['id'])}, 'concrete-atlas', {v['numero']}, {q(v['yt_titulo'])}, {q(v['arquivo'])}, {q(f'{PUB}/{v['id']}.mp4')}, {q(f'{PUB}/{v['id']}.jpg')}, {dur:.1f}, "
            f"{q(v['publicar_em'])}, {q(v['yt_titulo'])}, {q(v['yt_descricao'])}, {q(v['tt_legenda'])}, {q(v['ig_legenda'])}, {q(v['comentario_fixado'])}, {fontes}) "
            "on conflict (id) do update set titulo = excluded.titulo, arquivo = excluded.arquivo, video_url = excluded.video_url, capa_url = excluded.capa_url, "
            "duracao = excluded.duracao, publicar_em = excluded.publicar_em, yt_titulo = excluded.yt_titulo, yt_descricao = excluded.yt_descricao, tt_legenda = excluded.tt_legenda, "
            "ig_legenda = excluded.ig_legenda, comentario_fixado = excluded.comentario_fixado, fontes = excluded.fontes;")
        print('pronto', v['id'], f'{os.path.getsize(mp4) / 1e6:.1f} MB')
    open(os.path.join(ENVIO, 'registro.sql'), 'w').write('\n'.join(sql) + '\n')
    print('agora: rode envio/registro.sql no banco e depois  python3 motor/enviar_painel.py --push', ' '.join(v['id'] for v in vids))


def push(ids):
    vids = json.load(open(os.path.join(RAIZ, 'canal', 'videos.json')))
    if ids: vids = [v for v in vids if v['id'] in ids]
    # branch órfão com o workflow e os arquivos
    tmp = os.path.join('/tmp', 'envio-videos-repo')
    shutil.rmtree(tmp, ignore_errors=True)
    subprocess.run(['git', 'init', '-q', '-b', 'envio-videos', tmp], check=True)
    os.makedirs(os.path.join(tmp, '.github', 'workflows')); os.makedirs(os.path.join(tmp, 'envio'))
    open(os.path.join(tmp, '.github', 'workflows', 'subir-videos.yml'), 'w').write(WORKFLOW)
    for v in vids:
        for ext in EXTS:
            f = os.path.join(ENVIO, f"{v['id']}.{ext}")
            if os.path.exists(f): shutil.copy(f, os.path.join(tmp, 'envio'))
    cmds = [['git', 'add', '-A'], ['git', '-c', 'user.name=Claude', '-c', 'user.email=noreply@anthropic.com', 'commit', '-qm', f"Envio de {len(vids)} vídeos para o painel"],
            ['git', 'push', '-f', REPO, 'envio-videos']]
    for c in cmds: subprocess.run(c, cwd=tmp, check=True)
    print('branch envio-videos publicado: o GitHub Actions sobe os arquivos em ~2 min')


EXTS = ('mp4', 'jpg')

if __name__ == '__main__':
    a = sys.argv[1:]
    if '--so-capa' in a: EXTS = ('jpg',); a = [x for x in a if x != '--so-capa']
    push([x for x in a if x != '--push']) if '--push' in a else main(a)

"""Sobe os vídeos da Tavin Digital para o painel (canal tavin-digital, coluna Pronto).

1) gera a capa (quadro do gancho) e escreve saida/registro.sql (videos_envio + videos)
2) --push: publica os arquivos no branch órfão envio-videos; o GitHub Actions sobe para o Storage (pasta tavin-digital/)
"""
import hashlib, os, shutil, subprocess, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, 'saida')
SUPA = 'https://vvlzverpxojrecxysmhm.supabase.co'
PUB = f'{SUPA}/storage/v1/object/public/videos/tavin-digital'
REPO = 'https://github.com/tavinpz/tavindigial'
TAGS = {
    'previa': '#negocioslocais #criacaodesites #linkdabio #empreendedorismo #marketingdigital',
    'bio': '#linkdabio #bioinstagram #instagramparanegocios #negocioslocais #marketinglocal',
    'edicao': '#edicaodevideo #reels #videomarketing #motiondesign #criadordeconteudo',
    'servicos': '#negocioslocais #marketingdigital #criacaodesites #seo #designgrafico',
}
LEG_PREVIA = ('Você me manda o nome do seu negócio e eu te mostro a página pronta. Só paga se gostar.\n\n'
              'Página da bio por R$ 147 (pronta em 24 h) ou site completo por R$ 497 (pronto em 48 h).\n\n'
              'Comenta PRÉVIA que eu faço a sua.\n\n' + TAGS['previa'])
VIDEOS = [
    ('td-v01-previa', 'tavin_01_previa_gratis.mp4', 'Prévia grátis (sem voz)', LEG_PREVIA, 1.6, 'Teste A/B: mesma edição da versão com voz.'),
    ('td-v01-previa-voz', 'tavin_01_previa_gratis_com_voz.mp4', 'Prévia grátis (com voz)', LEG_PREVIA, 1.6,
     'Teste A/B. Narração com voz sintética: se postar pelo app, ative o rótulo "Informações de IA".'),
    ('td-v02-bio', 'tavin_02_link_da_bio.mp4', 'Link da bio espantando cliente', (
        'Lista de links não mostra o seu trabalho. Uma página da bio mostra serviços, preços e avaliações, e já abre o WhatsApp.\n\n'
        'R$ 147, pronta em 24 h. Você vê a prévia grátis antes de pagar.\n\nChama no direct.\n\n' + TAGS['bio']), 1.6, ''),
    ('td-v03-edicao', 'tavin_03_edicao_de_video.mp4', 'Edição de vídeo e Reels', (
        'Cortes no ritmo, legendas animadas, títulos em motion e trilha. É isso que faz alguém assistir até o fim.\n\n'
        'Manda o seu vídeo cru no direct e recebe o orçamento, sem compromisso.\n\n' + TAGS['edicao']), 2.2, ''),
    ('td-v04-servicos', 'tavin_04_servicos.mp4', 'Tudo para ser encontrado', (
        'Site, página da bio, artes para posts, edição de vídeo e SEO para Google e IAs. Tudo para deixar o seu negócio fácil de encontrar.\n\n'
        'Começa pela prévia grátis: você vê pronto e só paga se gostar.\n\n' + TAGS['servicos']), 2.0, ''),
]
q = lambda s: 'null' if s is None else "'" + str(s).replace("'", "''") + "'"


def preparar():
    env = os.path.join(SAIDA, 'envio'); shutil.rmtree(env, ignore_errors=True); os.makedirs(env)
    sql = []
    for vid, arq, titulo, leg, capa_s, notas in VIDEOS:
        src = os.path.join(SAIDA, arq)
        if not os.path.exists(src): print('falta', arq); continue
        mp4 = os.path.join(env, f'{vid}.mp4'); jpg = os.path.join(env, f'{vid}.jpg')
        shutil.copy(src, mp4)
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', str(capa_s), '-i', src, '-frames:v', '1', '-q:v', '3', jpg], check=True)
        dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4], capture_output=True, text=True).stdout)
        for f in (mp4, jpg):
            sha = hashlib.sha256(open(f, 'rb').read()).hexdigest()
            sql.append(f"insert into public.videos_envio(caminho, sha256) values ('tavin-digital/{os.path.basename(f)}', '{sha}') on conflict (caminho) do update set sha256 = excluded.sha256, usado_em = null;")
        sql.append(
            "insert into public.videos (id, canal, titulo, arquivo, video_url, capa_url, duracao, ig_legenda, notas) values ("
            f"{q(vid)}, 'tavin-digital', {q(titulo)}, {q(arq)}, {q(f'{PUB}/{vid}.mp4')}, {q(f'{PUB}/{vid}.jpg')}, {dur:.2f}, {q(leg)}, {q(notas or None)}) "
            "on conflict (id) do update set titulo = excluded.titulo, video_url = excluded.video_url, capa_url = excluded.capa_url, duracao = excluded.duracao, ig_legenda = excluded.ig_legenda, notas = excluded.notas;")
        print('pronto', vid, f'{os.path.getsize(mp4) / 1e6:.1f} MB', f'{dur:.1f}s')
    open(os.path.join(SAIDA, 'registro.sql'), 'w').write('\n'.join(sql) + '\n')


WORKFLOW = open('/home/claude/concrete-atlas/motor/enviar_painel.py').read().split('WORKFLOW = """', 1)[1].split('""" % SUPA', 1)[0].replace('concrete-atlas/$nome', 'tavin-digital/$nome').replace('\\\\', '\\') % SUPA


def push():
    tmp = '/tmp/envio-tavin'; shutil.rmtree(tmp, ignore_errors=True)
    subprocess.run(['git', 'init', '-q', '-b', 'envio-videos', tmp], check=True)
    os.makedirs(os.path.join(tmp, '.github', 'workflows')); shutil.copytree(os.path.join(SAIDA, 'envio'), os.path.join(tmp, 'envio'))
    open(os.path.join(tmp, '.github', 'workflows', 'subir-videos.yml'), 'w').write(WORKFLOW)
    for c in (['git', 'add', '-A'], ['git', '-c', 'user.name=Claude', '-c', 'user.email=noreply@anthropic.com', 'commit', '-qm', 'Vídeos da Tavin Digital para o painel'], ['git', 'push', '-q', '-f', REPO, 'envio-videos']):
        subprocess.run(c, cwd=tmp, check=True)
    print('branch envio-videos publicado')


if __name__ == '__main__':
    push() if '--push' in sys.argv else preparar()

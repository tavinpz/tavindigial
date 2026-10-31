"""Sobe os vídeos da Thata para o painel (canal thata, coluna Pronto), pelo mesmo caminho do enviar.py da Tavin.

1) python3 enviar_thata.py          → gera capas e saida/registro.sql (videos_envio + videos)
2) rodar o registro.sql no banco ANTES do push
3) python3 enviar_thata.py --push   → branch órfão envio-videos; o GitHub Actions sobe para o Storage (pasta thata/)
"""
import hashlib, os, shutil, subprocess, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, 'saida')
SUPA = 'https://vvlzverpxojrecxysmhm.supabase.co'
CANAL = 'thata'
PUB = f'{SUPA}/storage/v1/object/public/videos/{CANAL}'
REPO = 'https://github.com/tavinpz/tavindigial'
TAGS = '#clinica #odontologia #recepcao #atendimentoaopaciente #whatsappbusiness #inteligenciaartificial #gestaodeclinicas'
CTA = 'Quer ver a Thata atendendo a sua clínica? Link na bio: ela te liga em segundos.'
L = lambda *p: '\n\n'.join(p + (CTA, TAGS))

VIDEOS = [
    ('th-v01-madrugada', 'thata_01_madrugada.mp4', '23:47 (clínica fechada)', L('23:47. Uma paciente chama no WhatsApp e sai com horário marcado.', 'A recepção fechou às 18h. Quem respondeu foi a Thata, a IA de voz e WhatsApp da clínica.'), 2.4),
    ('th-v02-ao-mesmo-tempo', 'thata_02_ao_mesmo_tempo.mp4', 'Ao mesmo tempo (ligações)', L('Toca o telefone da clínica. A Thata atende, entende e marca.', 'E enquanto isso, as outras ligações também são atendidas. Todas ao mesmo tempo.'), 7.0),
    ('th-v03-volta-a-semana', 'thata_03_volta_a_semana.mp4', 'Volta a semana (faltas)', L('5 pacientes faltaram na semana. E se desse pra voltar?', 'A Thata confirma um por um, remarca quem não pode e a vaga não fica vazia.'), 2.5),
    ('th-v04-segunda-8h01', 'thata_04_segunda_8h01.mp4', 'Segunda, 8h01 (caos organizado)', L('Segunda, 8h01: 47 mensagens e 6 ligações perdidas.', 'A Thata organiza tudo e só sobra pra equipe o que precisa da equipe.'), 2.8),
    ('th-v05-ninguem-chamou', 'thata_05_ninguem_chamou.mp4', 'Ninguém chamou (base parada)', L('Os pacientes que não voltaram não sumiram. Só ninguém chamou.', 'A Thata chama um por um, e quem estava parado volta pra agenda.'), 2.6),
    ('th-v06-domingo-21h', 'thata_06_domingo_21h.mp4', 'Domingo, 21:04 (escuro)', L('Domingo à noite, dor de dente, clínica fechada.', 'A Thata responde, reserva o encaixe e segunda a agenda já começa marcada.'), 1.2),
    ('th-v07-volto-as-13h', 'thata_07_volto_as_13h.mp4', 'Volto às 13h (almoço)', L('Hora do almoço. A recepção saiu, as mensagens não pararam.', 'A Thata responde a fila inteira, e às 13h a plaquinha vira com o resumo.'), 1.5),
    ('th-v08-audio-2-minutos', 'thata_08_audio_de_2_minutos.mp4', 'Áudio de 2 minutos (escuro)', L('O paciente manda um áudio de 2 minutos.', 'A Thata ouve até o fim, entende o que importa e responde em segundos, por texto ou em áudio (voz gerada por IA).'), 1.6),
    ('th-v09-quanto-custa', 'thata_09_quanto_custa.mp4', 'Quanto custa?', L('A resposta seca faz o paciente sumir.', 'Com a Thata, o "quanto custa?" vira conversa e a conversa vira consulta marcada.'), 2.6),
    ('th-v10-dois-dias-depois', 'thata_10_dois_dias_depois.mp4', 'Dois dias depois (pós-consulta, escuro)', L('Dois dias depois da extração, a Thata pergunta como o paciente está.', 'Quando precisa de gente, ela chama gente: a doutora recebe o aviso e assume a conversa.'), 1.8),
    ('th-v11-onde-estaciona', 'thata_11_onde_estaciona.mp4', 'Onde estaciona? (caminho)', L('Primeira consulta e a paciente não conhece o caminho.', 'Endereço, estacionamento e horário: ela chega 10 minutos antes, sem se perder.'), 1.5),
    ('th-v12-preso-no-transito', 'thata_12_preso_no_transito.mp4', 'Presa no trânsito (escuro)', L('A consulta é às 9h e ela não vai chegar.', 'A Thata ajusta o horário na hora, avisa a equipe e a agenda não fica com buraco.'), 2.6),
    ('th-v13-joana-de-ferias', 'thata_13_joana_de_ferias.mp4', 'Joana de férias', L('A recepcionista saiu de férias. A semana não parou.', 'Quando a Joana volta, encontra tudo em dia.'), 1.0),
    ('th-v14-aniversario', 'thata_14_aniversario.mp4', 'Aniversário (escuro)', L('Hoje é aniversário da Carla. A Thata lembra.', 'E cada parabéns vira um motivo pra voltar à clínica.'), 2.6),
    ('th-v15-pavor-de-dentista', 'thata_15_pavor_de_dentista.mp4', 'Pavor de dentista', L('Ela tem pavor de dentista. Faz 5 anos que não vai.', 'A Thata não empurra: acolhe, explica e marca no tempo dela.'), 1.0),
]
q = lambda s: 'null' if s is None else "'" + str(s).replace("'", "''") + "'"


def preparar(so=None):
    env = os.path.join(SAIDA, 'envio'); shutil.rmtree(env, ignore_errors=True); os.makedirs(env)
    sql = []
    for vid, arq, titulo, leg, capa_s in VIDEOS:
        if so and vid not in so: continue
        src = os.path.join(SAIDA, arq)
        if not os.path.exists(src): print('falta', arq); continue
        mp4 = os.path.join(env, f'{vid}.mp4'); jpg = os.path.join(env, f'{vid}.jpg')
        shutil.copy(src, mp4)
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', str(capa_s), '-i', src, '-frames:v', '1', '-q:v', '3', jpg], check=True)
        dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4], capture_output=True, text=True).stdout)
        for f in (mp4, jpg):
            sha = hashlib.sha256(open(f, 'rb').read()).hexdigest()
            sql.append(f"insert into public.videos_envio(caminho, sha256) values ('{CANAL}/{os.path.basename(f)}', '{sha}') on conflict (caminho) do update set sha256 = excluded.sha256, usado_em = null;")
        sql.append(
            "insert into public.videos (id, canal, titulo, arquivo, video_url, capa_url, duracao, ig_legenda) values ("
            f"{q(vid)}, '{CANAL}', {q(titulo)}, {q(arq)}, {q(f'{PUB}/{vid}.mp4')}, {q(f'{PUB}/{vid}.jpg')}, {dur:.2f}, {q(leg)}) "
            "on conflict (id) do update set titulo = excluded.titulo, video_url = excluded.video_url, capa_url = excluded.capa_url, duracao = excluded.duracao, ig_legenda = excluded.ig_legenda;")
        print('pronto', vid, f'{os.path.getsize(mp4) / 1e6:.1f} MB', f'{dur:.1f}s')
    open(os.path.join(SAIDA, 'registro.sql'), 'w').write('\n'.join(sql) + '\n')


WORKFLOW = open('/home/claude/concrete-atlas/motor/enviar_painel.py').read().split('WORKFLOW = """', 1)[1].split('""" % SUPA', 1)[0].replace('concrete-atlas/$nome', f'{CANAL}/$nome').replace('\\\\', '\\') % SUPA


def push():
    tmp = '/tmp/envio-thata'; shutil.rmtree(tmp, ignore_errors=True)
    subprocess.run(['git', 'init', '-q', '-b', 'envio-videos', tmp], check=True)
    os.makedirs(os.path.join(tmp, '.github', 'workflows')); shutil.copytree(os.path.join(SAIDA, 'envio'), os.path.join(tmp, 'envio'))
    open(os.path.join(tmp, '.github', 'workflows', 'subir-videos.yml'), 'w').write(WORKFLOW)
    for c in (['git', 'add', '-A'], ['git', '-c', 'user.name=Claude', '-c', 'user.email=noreply@anthropic.com', 'commit', '-qm', 'Vídeos da Thata para o painel'], ['git', 'push', '-q', '-f', REPO, 'envio-videos']):
        subprocess.run(c, cwd=tmp, check=True)
    print('branch envio-videos publicado')


if __name__ == '__main__':
    push() if '--push' in sys.argv else preparar([a for a in sys.argv[1:] if not a.startswith('--')] or None)

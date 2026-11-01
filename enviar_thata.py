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
    ('th-v16-cronometro', 'thata_16_cronometro.mp4', 'Cronômetro (tempo de resposta)', L('Quanto tempo a sua clínica leva pra responder um paciente?', 'Duas horas depois, ele já marcou em outro lugar. Com a Thata, a resposta sai em segundos.'), 4.0),
    ('th-v17-lead-das-22h', 'thata_17_lead_das_22h.mp4', 'Lead das 22:10 (escuro)', L('Ele pediu orçamento pelo anúncio às 22:10. Em 41 segundos, o telefone tocou.', 'Pediu em 5 clínicas. Só uma ligou na hora, e foi essa que marcou.'), 2.6),
    ('th-v18-dicionario', 'thata_18_dicionario.mp4', 'Dicionário (recepção)', L('re·cep·ção: lugar onde o telefone toca enquanto alguém responde o WhatsApp.', 'Hora de atualizar o dicionário: atende, liga, agenda e confirma, a qualquer hora.'), 3.4),
    ('th-v19-aguarde-na-linha', 'thata_19_aguarde_na_linha.mp4', 'Aguarde na linha (escuro)', L('4 minutos e 32 segundos ouvindo musiquinha. E ele desligou.', 'Com a Thata, a ligação é atendida no primeiro toque.'), 2.4),
    ('th-v20-24-horas', 'thata_20_24_horas.mp4', '24 horas (relógio)', L('Um dia inteiro da recepção em 20 segundos.', 'Inclusive quando a clínica está fechada: confirmações, ligações, áudios, encaixes e aniversários.'), 3.0),
    ('th-v21-antes-depois', 'thata_21_antes_depois.mp4', 'Antes e depois (escuro)', L('Mesma clínica, mesma semana.', 'De um lado, mensagens esperando e cadeiras vazias. Do outro, tudo respondido e confirmado.'), 4.0),
    ('th-v22-lista-de-segunda', 'thata_22_lista_de_segunda.mp4', 'Lista de segunda', L('A lista de toda segunda: responder, retornar, confirmar, remarcar…', 'A Thata risca tudo isso e deixa pra você o que só você faz: atender quem está na cadeira.'), 2.6),
    ('th-v23-in-english', 'thata_23_in_english.mp4', 'In English (escuro)', L('Paciente estrangeiro no WhatsApp da clínica?', 'A Thata responde em português ou inglês, no idioma do paciente, e marca do mesmo jeito.'), 2.6),
    ('th-v24-o-funil', 'thata_24_o_funil.mp4', 'O funil (estúdio)', L('Todo dia chegam dezenas de mensagens na clínica.', 'A Thata responde cada uma, e o que vira consulta cai direto na agenda.'), 3.0),
    ('th-v25-round-1', 'thata_25_round_1.mp4', 'Round 1 (estúdio, escuro)', L('Round 1: a recepção contra a fila do WhatsApp.', 'Mensagens, ligações, remarcações e confirmações. A Thata atende, agenda, confirma e reativa, no automático.'), 1.0),
    ('th-v26-enquanto-voce-cuida', 'thata_26_enquanto_voce_cuida.mp4', 'Enquanto você cuida (estúdio)', L('Sua recepção trabalhou o dia todo.', 'Pelo telefone e pelo WhatsApp, de manhã, de noite e no sábado. Enquanto você cuida dos pacientes, a Thata cuida da agenda.'), 1.2),
    ('th-v27-ferramentas-demais', 'thata_27_ferramentas_demais.mp4', 'Ferramentas demais (estúdio, escuro)', L('WhatsApp, planilha, caderno, telefone, Instagram, agenda: tudo espalhado.', 'Seis ferramentas, uma recepção. Deixa a Thata organizar.'), 2.0),
    ('th-v28-a-conta-da-recepcao', 'thata_28_a_conta_da_recepcao.mp4', 'A conta da recepção (estúdio)', L('Quanto custa a sua recepção por dia?', 'Responder preço, confirmar, retornar ligação, remarcar. A Thata corta tudo isso e deixa com você o que importa.'), 1.2),
    ('th-v29-segue-a-thata', 'thata_29_segue_a_thata.mp4', 'Segue a Thata (vinheta)', L('Uma recepção que atende, liga e agenda sozinha.', 'Segue o @thata.ia pra ver a recepção do futuro.'), 6.0),
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

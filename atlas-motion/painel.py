# Prepara o envio de um vídeo do Hard to Copy ao painel: copia vídeo e capas para o ramo envio-videos e imprime o SQL do videos_envio e os capítulos.
# Uso: python3 painel.py hc002 hc002-tsmc v02   (vídeo em /home/claude/saida/<id>/<id>.mp4, capas em /tmp/capas/<id>{a,b,c}.jpg)
import hashlib, json, shutil, sys
cod, nome, pasta = sys.argv[1:4]; dst = '/home/claude/envio-wt/envio/hard-to-copy'
arqs = [(f'/home/claude/saida/{cod}/{cod}.mp4', f'{nome}.mp4')] + [(f'/tmp/capas/{cod}{x}.jpg', f'{cod}-thumb-{x}.jpg') for x in 'abc']
vals = []
for src, d in arqs:
    shutil.copy(src, f'{dst}/{d}'); vals.append(f"('hard-to-copy/{d}','{hashlib.sha256(open(src,'rb').read()).hexdigest()}')")
print('insert into videos_envio (caminho, sha256) values ' + ', '.join(vals) + ';')
T = json.load(open(f'/home/claude/render-videos/public/htc/{pasta}/tempos.json')); print('total', T['total'])
for b in T['blocos']: print(f"{int(b['ini'])//60}:{int(b['ini'])%60:02d} {b['cena']} | {b['falas'][0]['txt'][:50]}")

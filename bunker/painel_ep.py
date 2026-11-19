# Prepara o envio de um episódio ao painel: copia vídeo e capas para envio-wt/envio/ben-ueberlebt e grava o SQL em /tmp/painel_epN_{envio,video}.sql
# Uso: python3 bunker/painel_ep.py 2 /caminho/video.mp4 /pasta/das/capas
import json, sys, shutil, hashlib, os
N = int(sys.argv[1]); video = sys.argv[2]; capas = sys.argv[3]; R = os.path.dirname(os.path.abspath(__file__))
EP = json.load(open(f"{R}/ep{N:02d}.json")); T = json.load(open(f"{R}/../atlas-motion/public/bunker/{EP['pasta']}/tempos.json"))
cod = EP["id"].split("-")[0]; dst = "/home/claude/envio-wt/envio/ben-ueberlebt"; base = "https://vvlzverpxojrecxysmhm.supabase.co/storage/v1/object/public/videos/ben-ueberlebt/"
arqs = [(video, f"{EP['id']}.mp4")] + [(f"{capas}/{cod}-capa-{x}.jpg", f"{cod}-capa-{x}.jpg") for x in "abc"]
vals = []
for src, d in arqs:
    shutil.copy(src, f"{dst}/{d}"); vals.append(f"('ben-ueberlebt/{d}','{hashlib.sha256(open(src, 'rb').read()).hexdigest()}')")
open(f"/tmp/painel_ep{N}_envio.sql", "w").write("insert into videos_envio (caminho, sha256) values " + ", ".join(vals) + " returning caminho;")
caps = "\n".join(f"{int(max(0, b['ini'] - 0.3)) // 60}:{int(max(0, b['ini'] - 0.3)) % 60:02d} {b['cap']}" for b in T["blocos"])
desc = f"{EP['gancho_desc']}\n\n{caps}\n\n{EP['coment']} Schreib es in die Kommentare.\n\nZahlen aus dem Video:\n" + "\n".join("- " + x for x in EP["fatos"]) + "\n\nDie Geschichte ist erfunden und dient der Unterhaltung. Sie ist keine Anleitung. Bleib niemals in einem geschlossenen Raum ohne Lüftung. Die Zeichnungen sind vereinfacht."
capasj = json.dumps([{"url": base + f"{cod}-capa-{x}.jpg", "nome": EP["capas"][i]["nome"]} for i, x in enumerate("abc")], ensure_ascii=False)
fontes = "array[" + ",".join("$f$" + x + "$f$" for x in EP["fontes"]) + "]"
sql = f"""insert into videos (id, canal, numero, titulo, arquivo, video_url, capa_url, duracao, yt_titulo, yt_titulos, capas, yt_descricao, yt_tags, comentario_fixado, fontes, notas, subido_em, yt_etapa) values (
 '{EP['id']}', 'ben-ueberlebt', {N}, $t${EP['titulos'][0]}$t$, '{EP['id']}.mp4', '{base}{EP['id']}.mp4', '{base}{cod}-capa-a.jpg', {round(T['total'], 1)},
 $t${EP['titulos'][0]}$t$, $j${json.dumps(EP['titulos'], ensure_ascii=False)}$j$::jsonb, $j${capasj}$j$::jsonb, $t${desc}$t$, $t${EP['tags']}$t$, $t${EP['coment']}$t$, {fontes},
 'Roteiro e cenas feitos pelo Claude em 19/11 sem aprovação linha a linha. Som não foi ouvido antes de subir (medido em LUFS).', now(), 'revisao') returning id;"""
open(f"/tmp/painel_ep{N}_video.sql", "w").write(sql); print("ok", EP["id"], round(T["total"], 1))

# Peças comuns aos roteiros do Hard to Copy (hc002 em diante). O hc001_roteiro.py tem a sua própria cópia.
# Cada fala: texto falado (siglas com hífen para a voz soletrar), pausa extra (p) e o que aparece na tela (v).
# v herda da fala anterior do mesmo bloco. d = diagrama, n = passo do diagrama, k = frase de apoio embaixo, tit = título.
# Diagramas: src/htc/Video.tsx (os do #01), src/htc/Gen.tsx (genéricos, guiados por dados) e src/htc/D0N.tsx (sob medida).
import json, sys
CHAVES = ('d n k tit it t rot sub cor ab at tl cab rev l1 l2 ic s nomes grupo pts vao a b la lb ra rb fl fala elo pc linhas resto pre '
          'tot lit r1 r2 cada x xn leg ln sai sn N base base2 ex ey f1 de ate v0 v1 ca cb id').split()
LIMPA = {k: None for k in CHAVES}; LIMPA['n'] = 0
def F(txt, p=0, **v): return {'txt': txt, 'p': p, 'v': v}
def N(**v): return {**LIMPA, **v}
class Roteiro:
    def __init__(self, nomes, grupo='PHYSICS + ENGINEERING'):
        self.R = []; self.nomes = nomes; self.grupo = grupo
    def B(self, cena, falas, trava=None, nome=None, fonte=None): self.R.append({'cena': cena, 'trava': trava, 'nome': nome, 'fonte': fonte, 'falas': falas})
    def TRAVA(self, n, nome): return N(d='big', rot=f'LOCK {n} OF 5', t=nome, cor='ambar')
    def TR(self, **v): return N(d='travas', nomes=self.nomes, grupo=self.grupo, **v)   # o quadro das 5 travas
    def salva(self):
        pasta = sys.argv[1].rstrip('/')
        json.dump(self.R, open(f'{pasta}/roteiro.json', 'w'), indent=1, ensure_ascii=False)
        print(len(self.R), 'blocos', sum(len(b['falas']) for b in self.R), 'falas', sum(len(f['txt'].split()) for b in self.R for f in b['falas']), 'palavras')

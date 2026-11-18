"""TTR #002 (composição Arte): Risk. Cada batalha simulada 10.000 vezes e conferida com a conta exata.
Números de sim/risk.json (sim/risk.py). Regras clássicas: ataque até 3 dados, defesa até 2, empate é da defesa.
Fatos: Albert Lamorisse criou "La Conquête du Monde" (1957); Parker Brothers lançou Risk nos EUA em 1959;
Lamorisse dirigiu "O Balão Vermelho" (Oscar de roteiro original, 1957). Bônus dos continentes do tabuleiro clássico.
"""
import json, os

R = json.load(open('/home/claude/estudio-longo/ten-thousand-runs/sim/risk.json'))
RO = R['rolagem']
B = R['batalha']
S = R['sim_batalha']
PR = {int(k): v for k, v in R['precisa'].items()}
pc = lambda x, d=0: f"{x * 100:.{d}f}"
from functools import lru_cache
EX = {k: {tuple(map(int, kk.split('-'))): p for kk, p in v['exato'].items()} for k, v in RO.items()}


@lru_cache(None)
def vence(A, D):  # conta exata, mesma de sim/risk.py
    if D == 0: return 1.0
    if A <= 1: return 0.0
    a, d = min(3, A - 1), min(2, D)
    return sum(p * vence(A - pa, D - pd) for (pa, pd), p in EX[f'{a}v{d}'].items())


b = lambda a, d: B.get(f'{a}v{d}', vence(a, d))
for k in ['5v5', '20v20', '25v5']: assert abs(B[k] - vence(*map(int, k.split('v')))) < 0.002, k
r32 = RO['3v2']['exato']


def F(t, v): return (t, v)


intro = [
    F("In 1957, a French film director invented a board game about conquering the world.", {"tipo": "ano", "ano": "1957", "de": 1940, "txt": "A GAME ABOUT CONQUERING THE WORLD"}),
    F("His name was Albert Lamorisse. The same year, his short film The Red Balloon won an Oscar.", {"tipo": "ficha", "titulo": "CASE FILE · THE INVENTOR", "linhas": [["Name", "Albert Lamorisse"], ["Job", "Film director"], ["1957", "Oscar, The Red Balloon"]]}),
    F("Two years later, Parker Brothers brought his game to America, and called it Risk.", {"tipo": "ano", "ano": "1959", "de": 1957, "txt": "IT BECOMES RISK"}),
    F("And for sixty years, players have repeated the same piece of advice.", {"tipo": "cartas", "modo": "misterio", "selo": "THE OLD ADVICE"}),
    F("The defender has the advantage.", {"tipo": "batalha", "ata": [5, 3, 2], "def": [5, 4], "txt": "TIES GO TO DEFENSE"}),
    F("Ties go to the defense. So never attack unless you clearly outnumber them.", {"tipo": "tropas", "a": 12, "b": 6, "selo": "ATTACK ONLY LIKE THIS?"}),
    F("So we built Risk in code, with the official dice rules.", {"tipo": "ficha", "titulo": "SIMULATION LAB · RUN ORDER", "linhas": [["Attack", "up to 3 dice"], ["Defense", "up to 2 dice"], ["Ties", "defender wins"]]}),
    F("And we fought every battle ten thousand times.", {"tipo": "contador", "txt": "BATTLES PER MATCHUP"}),
    F("Every roll.", {"tipo": "batalha", "ata": [6, 4, 1], "def": [3, 3]}),
    F("Every casualty.", {"tipo": "tropas", "a": 8, "b": 7}),
    F("Then we checked every result against the exact math.", {"tipo": "conta", "linha": "10,000 battles vs. exact odds", "txt": "MATCH", "rotulo": "every number in this video was checked twice"}),
    F("And the old advice is wrong. Not a little wrong.", {"tipo": "cartas", "modo": "misterio", "selo": "WRONG"}),
    F("By the end of this video, you'll know when a smaller army beats a bigger one,", {"tipo": "tropas", "a": 19, "b": 20, "selo": "WHO WINS?"}),
    F("the one attack you should almost never make,", {"tipo": "batalha", "ata": [4], "def": [4, 2], "txt": "NEVER?"}),
    F("and exactly how many armies you need to take any territory.", {"tipo": "numero", "txt": "?", "rotulo": "ARMIES YOU REALLY NEED"}),
]

cap1 = [
    F("Part one. One roll.", {"tipo": "capitulo", "n": "PART ONE", "txt": "ONE ROLL"}),
    F("Here's how a fight works.", {"tipo": "batalha", "ata": [6, 3, 2], "def": [4, 3]}),
    F("The attacker rolls up to three red dice. The defender rolls up to two.", {"tipo": "batalha", "ata": [5, 4, 1], "def": [6, 2]}),
    F("You line them up, highest against highest, second against second.", {"tipo": "batalha", "ata": [6, 4, 1], "def": [5, 4], "txt": "HIGH VS HIGH"}),
    F("Whoever rolls higher wins that pair. And if it's a tie, the defender wins.", {"tipo": "batalha", "ata": [5, 4, 2], "def": [5, 2], "txt": "TIE = DEFENSE"}),
    F("So the defender wins every tie. That's where the legend comes from.", {"tipo": "dados", "faces": [4, 4], "txt": "THE LEGEND"}),
    F("But the attacker has something better. A third die.", {"tipo": "batalha", "ata": [6, 5, 1], "def": [3, 2], "txt": "THE 3RD DIE"}),
    F("With three dice, the attacker gets to throw away the lowest one.", {"tipo": "batalha", "ata": [6, 5, 1], "def": [5, 2], "txt": "DROP THE LOWEST"}),
    F("So their two best dice are usually higher than the defender's two.", {"tipo": "batalha", "ata": [6, 5, 3], "def": [4, 3], "txt": "BEST TWO OF THREE"}),
    F("We rolled three against two, ten thousand times.", {"tipo": "contador", "txt": "ROLLS · 3 DICE VS 2"}),
    F(f"The attacker won both pairs {pc(r32['0-2'])} percent of the time.", {"tipo": "numero", "txt": f"{pc(r32['0-2'])}%", "rotulo": "ATTACKER WINS BOTH"}),
    F(f"The defender won both only {pc(r32['2-0'])} percent.", {"tipo": "numero", "txt": f"{pc(r32['2-0'])}%", "rotulo": "DEFENDER WINS BOTH"}),
    F(f"And they split one each {pc(r32['1-1'])} percent.", {"tipo": "fichas", "rotulo": "ONE ROLL · 3 DICE VS 2", "itens": [{"cor": "#d64535", "nome": "ATTACK WINS 2", "v": float(pc(r32['0-2'], 1))}, {"cor": "#e8c46a", "nome": "SPLIT", "v": float(pc(r32['1-1'], 1))}, {"cor": "#e8e1cf", "nome": "DEFENSE WINS 2", "v": float(pc(r32['2-0'], 1))}]}),
    F(f"On average, every roll costs the attacker {RO['3v2']['perda_ataque']:.2f} armies, and the defender {RO['3v2']['perda_defesa']:.2f}.", {"tipo": "teste", "a": "ATTACKER LOSES", "pa": f"{RO['3v2']['perda_ataque']:.2f}", "b": "DEFENDER LOSES", "pb": f"{RO['3v2']['perda_defesa']:.2f}", "vence": "a"}),
    F("In a full-size fight, the attacker is the one with the edge.", {"tipo": "tropas", "a": 12, "b": 10, "selo": "EDGE: ATTACKER"}),
    F("But that edge disappears the moment the attacker runs low.", {"tipo": "ampulheta", "txt": "IT DISAPPEARS"}),
    F("Attack with two dice into two, and the math flips.", {"tipo": "batalha", "ata": [5, 3], "def": [5, 4], "txt": "2 DICE VS 2"}),
    F(f"Now the defender wins both pairs {pc(RO['2v2']['exato']['2-0'])} percent of the time.", {"tipo": "numero", "txt": f"{pc(RO['2v2']['exato']['2-0'])}%", "rotulo": "DEFENDER WINS BOTH · 2 VS 2"}),
    F("And one die into two is the worst move in the game.", {"tipo": "batalha", "ata": [4], "def": [4, 2], "txt": "THE WORST MOVE"}),
    F(f"You lose that roll {pc(RO['1v2']['exato']['1-0'])} percent of the time.", {"tipo": "numero", "txt": f"{pc(RO['1v2']['exato']['1-0'])}%", "rotulo": "YOU LOSE · 1 DIE VS 2"}),
    F("So the rule isn't that defense is strong. It's that small attacks are weak.", {"tipo": "ficha", "titulo": "LAB NOTE · ROLL BY ROLL", "linhas": [["3 dice vs 2", "attacker favored"], ["2 dice vs 2", "defender favored"], ["1 die vs 2", "almost hopeless"]], "selo": "SMALL = WEAK"}),
]

cap2 = [
    F("Part two. The whole battle.", {"tipo": "capitulo", "n": "PART TWO", "txt": "THE WHOLE BATTLE"}),
    F("One roll is just a moment. Real battles go on until somebody runs out.", {"tipo": "tropas", "a": 10, "b": 10}),
    F("So we simulated complete battles. Every attack keeps rolling until the defender is wiped out, or the attacker is down to the one army that has to stay home.", {"tipo": "ficha", "titulo": "EXPERIMENT 2 · FULL BATTLES", "linhas": [["Battles", "10,000 per matchup"], ["Attacker", "keeps 1 army home"], ["Ends", "when one side is gone"]]}),
    F("Start small. Two armies attacking one defender.", {"tipo": "tropas", "a": 2, "b": 1}),
    F("Only one of them can fight, so it's one die against one.", {"tipo": "batalha", "ata": [3], "def": [3], "txt": "1 VS 1"}),
    F(f"The attacker wins {pc(b(2, 1))} percent of the time. Worse than a coin flip.", {"tipo": "numero", "txt": f"{pc(b(2, 1))}%", "rotulo": "2 ARMIES VS 1"}),
    F("Three against two?", {"tipo": "tropas", "a": 3, "b": 2}),
    F(f"Just {pc(b(3, 2))} percent.", {"tipo": "numero", "txt": f"{pc(b(3, 2))}%", "rotulo": "3 ARMIES VS 2"}),
    F("Five against five?", {"tipo": "tropas", "a": 5, "b": 5}),
    F(f"{pc(b(5, 5))} percent. So far, the legend looks right.", {"tipo": "numero", "txt": f"{pc(b(5, 5))}%", "rotulo": "5 VS 5 · THE LEGEND LOOKS RIGHT"}),
    F("But watch what happens as the armies get bigger.", {"tipo": "fichas", "rotulo": "ATTACKER WINS · EQUAL ARMIES", "itens": [{"cor": "#d64535", "nome": "5 VS 5", "v": float(pc(b(5, 5), 1))}], "ate": 1}),
    F(f"Ten against ten, {pc(b(10, 10))} percent.", {"tipo": "fichas", "rotulo": "ATTACKER WINS · EQUAL ARMIES", "itens": [{"cor": "#d64535", "nome": "5 VS 5", "v": float(pc(b(5, 5), 1))}, {"cor": "#d64535", "nome": "10 VS 10", "v": float(pc(b(10, 10), 1))}], "de": 1}),
    F(f"Twenty against twenty, {pc(b(20, 20))}.", {"tipo": "fichas", "rotulo": "ATTACKER WINS · EQUAL ARMIES", "itens": [{"cor": "#d64535", "nome": "5 VS 5", "v": float(pc(b(5, 5), 1))}, {"cor": "#d64535", "nome": "10 VS 10", "v": float(pc(b(10, 10), 1))}, {"cor": "#d64535", "nome": "20 VS 20", "v": float(pc(b(20, 20), 1))}], "de": 2}),
    F(f"Thirty against thirty, {pc(b(30, 30))}.", {"tipo": "fichas", "rotulo": "ATTACKER WINS · EQUAL ARMIES", "itens": [{"cor": "#d64535", "nome": "5 VS 5", "v": float(pc(b(5, 5), 1))}, {"cor": "#d64535", "nome": "10 VS 10", "v": float(pc(b(10, 10), 1))}, {"cor": "#d64535", "nome": "20 VS 20", "v": float(pc(b(20, 20), 1))}, {"cor": "#d64535", "nome": "30 VS 30", "v": float(pc(b(30, 30), 1))}], "de": 3}),
    F("The bigger the battle, the more the attacker wins.", {"tipo": "tropas", "a": 30, "b": 30, "selo": "BIGGER = BETTER FOR ATTACK"}),
    F("And here's the part nobody believes.", {"tipo": "cartas", "modo": "misterio", "selo": "NOBODY BELIEVES THIS"}),
    F("Twenty armies in your territory. Twenty defenders on the other side.", {"tipo": "tropas", "a": 20, "b": 20}),
    F("One of yours has to stay behind. So you're really attacking with nineteen against twenty.", {"tipo": "tropas", "a": 19, "b": 20, "selo": "OUTNUMBERED"}),
    F(f"And you still win {pc(b(20, 20))} percent of the time.", {"tipo": "numero", "txt": f"{pc(b(20, 20))}%", "rotulo": "19 ATTACKING VS 20 DEFENDING"}),
    F("A smaller army, beating a bigger one, more often than not.", {"tipo": "teste", "a": "19 ATTACKERS", "pa": f"{pc(b(20, 20))}%", "b": "20 DEFENDERS", "pb": f"{pc(1 - b(20, 20))}%", "vence": "a"}),
    F("Why? Because in a long battle, the attacker keeps rolling three dice almost the whole time.", {"tipo": "batalha", "ata": [6, 5, 2], "def": [5, 3], "txt": "3 DICE, EVERY ROLL"}),
    F("And every one of those rolls tilts toward the attacker.", {"tipo": "teste", "a": "ATTACKER LOSES", "pa": f"{RO['3v2']['perda_ataque']:.2f}", "b": "DEFENDER LOSES", "pb": f"{RO['3v2']['perda_defesa']:.2f}", "vence": "a"}),
    F("The defender's tie advantage only matters at the very end, when the attacker is down to one or two dice.", {"tipo": "batalha", "ata": [3], "def": [3, 1], "txt": "ONLY AT THE END"}),
]

cap3 = [
    F("Part three. How many armies you really need.", {"tipo": "capitulo", "n": "PART THREE", "txt": "HOW MANY YOU REALLY NEED"}),
    F("So let's answer the question every player asks before they attack.", {"tipo": "tropas", "a": 0, "b": 5, "selo": "HOW MANY?"}),
    F("How many armies do I need to be safe?", {"tipo": "numero", "txt": "?", "rotulo": "TO BE SAFE"}),
    F("We'll call safe a four in five chance of taking the territory.", {"tipo": "numero", "txt": "80%", "rotulo": "OUR DEFINITION OF SAFE"}),
    F(f"One defender? You need {PR[1]['0.8']} armies in your territory.", {"tipo": "tropas", "a": PR[1]['0.8'], "b": 1, "selo": "80% SAFE"}),
    F(f"Two defenders? {PR[2]['0.8']}.", {"tipo": "tropas", "a": PR[2]['0.8'], "b": 2, "selo": "80% SAFE"}),
    F(f"Three defenders? {PR[3]['0.8']}.", {"tipo": "tropas", "a": PR[3]['0.8'], "b": 3, "selo": "80% SAFE"}),
    F(f"Five defenders? {PR[5]['0.8']}.", {"tipo": "tropas", "a": PR[5]['0.8'], "b": 5, "selo": "80% SAFE"}),
    F(f"Ten defenders? {PR[10]['0.8']}.", {"tipo": "tropas", "a": PR[10]['0.8'], "b": 10, "selo": "80% SAFE"}),
    F(f"And twenty defenders? {PR[20]['0.8']}.", {"tipo": "tropas", "a": PR[20]['0.8'], "b": 20, "selo": "80% SAFE"}),
    F("Look at the pattern.", {"tipo": "ficha", "titulo": "LAB NOTE · ARMIES FOR 80%", "linhas": [["vs 1", f"{PR[1]['0.8']} armies"], ["vs 5", f"{PR[5]['0.8']} armies"], ["vs 10", f"{PR[10]['0.8']} armies"], ["vs 20", f"{PR[20]['0.8']} armies"]]}),
    F("Against small stacks, you need two or three times their number. Against big stacks, you only need about a quarter more.", {"tipo": "ficha", "titulo": "LAB NOTE · THE PATTERN", "linhas": [["Small fights", "need 2× to 4×"], ["Big fights", "need about +25%"]], "selo": "SIZE CHANGES EVERYTHING"}),
    F("That's why the worst attacks in Risk are the little ones.", {"tipo": "batalha", "ata": [2], "def": [5, 1], "txt": "LITTLE ATTACKS LOSE"}),
    F("Two armies poking at one. Three poking at two.", {"tipo": "tropas", "a": 3, "b": 2, "selo": f"{pc(b(3, 2))}% TO WIN"}),
    F("They feel cheap. But they burn armies and usually fail.", {"tipo": "numero", "txt": f"{pc(1 - b(3, 2))}%", "rotulo": "OF 3-VS-2 ATTACKS FAIL"}),
    F("A real attack is big, and it goes all the way.", {"tipo": "tropas", "a": 25, "b": 20, "selo": "GO BIG"}),
    F(f"Twenty five against twenty? You take it {pc(b(25, 20))} percent of the time.", {"tipo": "numero", "txt": f"{pc(b(25, 20))}%", "rotulo": "25 ARMIES VS 20"}),
]

cap4 = [
    F("Part four. What this means for the whole game.", {"tipo": "capitulo", "n": "PART FOUR", "txt": "WHAT IT MEANS FOR THE GAME"}),
    F("If big attacks win, then splitting your armies across the map is the real mistake.", {"tipo": "ficha", "titulo": "LAB NOTE · STRATEGY", "linhas": [["Spread thin", "many weak stacks"], ["Stacked", "one big stack"], ["Winner", "the stack"]], "selo": "STACK UP"}),
    F("One stack of twenty beats four stacks of five.", {"tipo": "teste", "a": "1 STACK OF 20", "pa": "WINS", "b": "4 STACKS OF 5", "pb": "LOSES", "vence": "a"}),
    F("Because each stack of five is in the zone where the attacker barely wins half the time.", {"tipo": "numero", "txt": f"{pc(b(6, 5))}%", "rotulo": "6 ARMIES VS 5 DEFENDERS"}),
    F("And it explains why the classic advice to grab Australia works.", {"tipo": "ficha", "titulo": "CASE FILE · AUSTRALIA", "linhas": [["Territories", "4"], ["Entry points", "1"], ["Bonus", "+2 armies a turn"]]}),
    F("Australia has only one way in. So you can pile every army on one border.", {"tipo": "tropas", "a": 30, "b": 3, "na": "YOUR BORDER", "nb": "THEM", "selo": "ONE WAY IN"}),
    F("You become the giant stack. And giant stacks win.", {"tipo": "tropas", "a": 30, "b": 20, "selo": f"{pc(b(30, 20))}% TO WIN"}),
    F("South America works the same way, with two ways in.", {"tipo": "ficha", "titulo": "CASE FILE · SOUTH AMERICA", "linhas": [["Territories", "4"], ["Entry points", "2"], ["Bonus", "+2 armies a turn"]]}),
    F("Asia pays the biggest bonus, seven armies a turn. But it has five borders to hold.", {"tipo": "ficha", "titulo": "CASE FILE · ASIA", "linhas": [["Territories", "12"], ["Entry points", "5"], ["Bonus", "+7 armies a turn"]], "selo": "SPREAD THIN"}),
    F("Five borders means five thin stacks. And thin stacks are exactly what a big attack eats.", {"tipo": "tropas", "a": 25, "b": 5, "selo": f"{b(25, 5) * 100:.2f}% TO WIN"}),
]

fim = [
    F("So is the defender's advantage real?", {"tipo": "batalha", "ata": [5, 5, 2], "def": [5, 1], "txt": "REAL?"}),
    F("Only in small fights. In big battles, the attacker wins, even outnumbered.", {"tipo": "teste", "a": "SMALL FIGHTS", "pa": "DEFENSE", "b": "BIG BATTLES", "pb": "ATTACK", "vence": "b"}),
    F(f"Nineteen against twenty, and the attacker still wins {pc(b(20, 20))} percent of the time.", {"tipo": "numero", "txt": f"{pc(b(20, 20))}%", "rotulo": "19 VS 20"}),
    F("Don't poke. Stack up. And when you go, go big.", {"tipo": "tropas", "a": 30, "b": 18, "selo": "GO BIG"}),
    F("What's the craziest comeback you've ever seen in Risk? Tell us in the comments.", {"tipo": "cartas", "modo": "misterio", "selo": "YOUR CRAZIEST COMEBACK?"}),
    F("And subscribe. Next, we play ten thousand games of another classic.", {"tipo": "fim"}),
]

spec = {
    "id": "ttr002a", "canal": "ten-thousand-runs", "titulo": "We Simulated 10,000 Risk Battles. The Defender's Advantage Is a Myth",
    "voz": "cw", "velocidade": 1.0, "lang": "en-us", "legenda": True, "acento": "#ffd23f", "marca": "TEN THOUSAND RUNS", "trilha": 0.14, "cauda": 4.0,
    "numeros": {"ten thousand": "10,000", "nineteen": "19", "twenty": "20", "thirty": "30", "one die": "1 die", "three dice": "3 dice", "two dice": "2 dice"},
    "blocos": [],
}
nomes = {1: 'One roll', 2: 'The whole battle', 3: 'How many you really need', 4: 'What it means for the game'}
for i, cap in enumerate([intro, cap1, cap2, cap3, cap4, fim]):
    cena = {"tipo": "capitulo" if i in nomes else "arte", "v": [v for _, v in cap]}
    if i in nomes: cena.update({"n": i, "titulo": nomes[i]})
    spec["blocos"].append({"cena": cena, "falas": [t for t, _ in cap]})
json.dump(spec, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'spec.json'), 'w'), ensure_ascii=False, indent=1)
txt = ' '.join(t for b_ in spec['blocos'] for t in b_['falas'])
print(len(txt.split()), 'palavras', sum(len(b_['falas']) for b_ in spec['blocos']), 'falas')
print('25v20', b(25, 20), '30v30', b(30, 30), '6v5', b(6, 5), '30v20', b(30, 20), '25v5', b(25, 5))

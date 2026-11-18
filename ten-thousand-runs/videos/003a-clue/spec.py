"""TTR #003 (composição Arte): Clue. 10.000 jogos por estratégia de anotação (sim/clue.py, saída sim/clue.json).
Sem tabuleiro: cada jogador sugere qualquer cômodo a cada vez, para medir só a dedução. Regras clássicas de sugestão.
Fatos: inventado por Anthony E. Pratt na Inglaterra nos anos 1940; publicado em 1949 (Waddingtons, como Cluedo;
Parker Brothers nos EUA, como Clue). 6 suspeitos × 6 armas × 9 cômodos = 324 combinações.
"""
import json, os

R = json.load(open('/home/claude/estudio-longo/ten-thousand-runs/sim/clue.json'))
g = lambda n, e: R[f'{n}_{e}']
D = R['duelo4']
r1 = lambda x: f"{x:.1f}"
pc = lambda x: f"{x * 100:.0f}"
B4, P4, C4 = g(4, 'basica'), g(4, 'passes'), g(4, 'completa')
B6, C6 = g(6, 'basica'), g(6, 'completa')
B3, C3 = g(3, 'basica'), g(3, 'completa')
VERM, AMAR, MARF, AZUL = '#d64535', '#e8c46a', '#e8e1cf', '#5b8fd6'


def F(t, v): return (t, v)
def barras(rot, itens, de=None, ate=None):
    d = {"tipo": "fichas", "rotulo": rot, "itens": [{"cor": c, "nome": n, "v": round(v, 1)} for n, v, c in itens], "suf": ""}
    if de is not None: d["de"] = de
    if ate is not None: d["ate"] = ate
    return d


intro = [
    F("Somebody has been murdered. Six suspects. Six weapons. Nine rooms.", {"tipo": "ficha", "titulo": "CASE FILE · THE MURDER", "linhas": [["Suspects", "6"], ["Weapons", "6"], ["Rooms", "9"]]}),
    F("And the answer is sealed in an envelope.", {"tipo": "cartas", "modo": "misterio", "selo": "THE ENVELOPE"}),
    F(f"That's three hundred twenty four possible crimes.", {"tipo": "numero", "txt": "324", "rotulo": "POSSIBLE CRIMES · 6 × 6 × 9"}),
    F("Clue was invented in England in the nineteen forties, and it's been sold since nineteen forty nine.", {"tipo": "ano", "ano": "1949", "de": 1940, "txt": "CLUE HITS THE SHELVES"}),
    F("And almost everyone plays it the same way.", {"tipo": "lista", "titulo": "HOW MOST PEOPLE PLAY", "itens": ["Make a guess", "See a card", "Cross it off"]}),
    F("They only cross off the cards someone shows them.", {"tipo": "cartas", "modo": "misterio", "selo": "CROSS IT OFF"}),
    F("But your notepad can do a lot more than that.", {"tipo": "ficha", "titulo": "LAB NOTE · THE NOTEPAD", "linhas": [["Most players", "use 1 trick"], ["Good players", "use 3"]]}),
    F("So we built Clue in code, and played ten thousand games.", {"tipo": "contador", "txt": "GAMES PLAYED"}),
    F("Then we did it again. And again. One for every way of taking notes.", {"tipo": "ficha", "titulo": "SIMULATION LAB · RUN ORDER", "linhas": [["Run 1", "basic notes"], ["Run 2", "+ who passed"], ["Run 3", "full deduction"]]}),
    F("Same cards, same deals. The only thing that changed was the notepad.", {"tipo": "teste", "a": "SAME CARDS", "pa": "✓", "b": "DIFFERENT NOTES", "pb": "?", "vence": "b"}),
    F("We even removed the board, so dice and luck couldn't help anyone.", {"tipo": "dados", "faces": [6, 6], "txt": "NO DICE"}),
    F("And the difference is huge. The best note taker solves the case more than twice as fast.", {"tipo": "numero", "txt": "2×", "rotulo": "FASTER WITH BETTER NOTES"}),
]

cap1 = [
    F("Part one. The basic notepad.", {"tipo": "capitulo", "n": "PART ONE", "txt": "THE BASIC NOTEPAD"}),
    F("Here's how a turn works. You suggest a suspect, a weapon and a room.", {"tipo": "ficha", "titulo": "YOUR SUGGESTION", "linhas": [["Suspect", "Colonel Mustard"], ["Weapon", "Rope"], ["Room", "Library"]]}),
    F("The next player has to show you one of those cards, if they have one.", {"tipo": "cartas", "modo": "misterio", "selo": "SHOW ONE"}),
    F("If they don't, the player after them has to try.", {"tipo": "lista", "titulo": "AROUND THE TABLE", "itens": ["Player 2: nothing", "Player 3: shows a card"]}),
    F("Most people write down that one card, and nothing else.", {"tipo": "ficha", "titulo": "BASIC NOTEPAD", "linhas": [["Rope", "✗ crossed off"]], "selo": "THAT'S IT"}),
    F("We gave that player a seat at a four player table.", {"tipo": "contador", "txt": "GAMES · BASIC NOTES"}),
    F(f"On average, they needed {r1(B4['media'])} rounds to be sure of the answer.", {"tipo": "numero", "txt": r1(B4['media']), "rotulo": "ROUNDS TO SOLVE · BASIC NOTES"}),
    F(f"And in {pc(B4['hist'][12] / 10000)} percent of games, it took the full thirteen rounds.", {"tipo": "numero", "txt": f"{pc(B4['hist'][12] / 10000)}%", "rotulo": "OF GAMES TOOK ALL 13 ROUNDS"}),
    F("Why so slow? Because one card per turn is the slowest way to search.", {"tipo": "ampulheta", "txt": "ONE CARD A TURN"}),
    F("At a four player table, there are thirteen or fourteen cards to rule out. You're basically checking them one at a time.", {"tipo": "numero", "txt": "13–14", "rotulo": "CARDS TO RULE OUT, ONE BY ONE"}),
]

cap2 = [
    F("Part two. Watch who passes.", {"tipo": "capitulo", "n": "PART TWO", "txt": "WATCH WHO PASSES"}),
    F("Here's the first upgrade. And it costs nothing.", {"tipo": "ficha", "titulo": "UPGRADE 1", "linhas": [["Cost", "nothing"], ["What to write", "who passed"]]}),
    F("Every time any player can't show a card, write it down.", {"tipo": "lista", "titulo": "PLAYER 2 PASSED ON", "itens": ["Plum", "Wrench", "Kitchen"]}),
    F("That player has none of those three cards. That's three facts, for free.", {"tipo": "numero", "txt": "3", "rotulo": "FREE FACTS FROM ONE PASS"}),
    F("And it works on other people's turns, too. Not just yours.", {"tipo": "cartas", "modo": "misterio", "selo": "EVERY TURN COUNTS"}),
    F(f"With that one habit, the average dropped from {r1(B4['media'])} rounds to {r1(P4['media'])}.", barras("ROUNDS TO SOLVE · 4 PLAYERS", [("BASIC", B4['media'], MARF), ("+ PASSES", P4['media'], AMAR)], de=1)),
    F(f"Put a basic player and a pass watcher side by side, with the same cards, and the pass watcher finishes first {pc(D['passes_antes_basica'])} percent of the time.", {"tipo": "teste", "a": "PASS WATCHER", "pa": f"{pc(D['passes_antes_basica'])}%", "b": "BASIC NOTES", "pb": "", "vence": "a"}),
]

cap3 = [
    F("Part three. Full deduction.", {"tipo": "capitulo", "n": "PART THREE", "txt": "FULL DEDUCTION"}),
    F("Now the real detective move.", {"tipo": "cartas", "modo": "misterio", "selo": "DETECTIVE MODE"}),
    F("When someone shows a card to another player, you don't see it.", {"tipo": "cartas", "modo": "misterio", "selo": "HIDDEN CARD"}),
    F("But you still learn something. That player holds at least one of those three cards.", {"tipo": "ficha", "titulo": "LAB NOTE · A HIDDEN SHOW", "linhas": [["Player 3 has", "Plum, Rope or Hall"]], "selo": "AT LEAST ONE"}),
    F("Write it down. Later, when you learn they don't have two of them, the third one is theirs.", {"tipo": "lista", "titulo": "PLAYER 3", "itens": ["Plum, Rope or Hall", "not Plum", "not Rope", "→ has the Hall"]}),
    F("And one more trick. Count the cards in each hand.", {"tipo": "ficha", "titulo": "LAB NOTE · HAND SIZES", "linhas": [["Player 2", "5 cards"], ["Known", "5 of 5"]], "selo": "HAND IS FULL"}),
    F("Once you know all five cards a player has, they can't have anything else. Everything else gets crossed off.", {"tipo": "numero", "txt": "5 / 5", "rotulo": "KNOWN CARDS · HAND COMPLETE"}),
    F("With all three tricks together, here's what happened.", barras("ROUNDS TO SOLVE · 4 PLAYERS", [("BASIC", B4['media'], MARF), ("+ PASSES", P4['media'], AMAR)], ate=2)),
    F(f"{r1(C4['media'])} rounds.", barras("ROUNDS TO SOLVE · 4 PLAYERS", [("BASIC", B4['media'], MARF), ("+ PASSES", P4['media'], AMAR), ("FULL DEDUCTION", C4['media'], VERM)], de=2)),
    F(f"In a head to head race with the same cards, the full deduction player finished first {pc(D['completa_antes'])} percent of the time.", {"tipo": "teste", "a": "FULL DEDUCTION", "pa": f"{pc(D['completa_antes'])}%", "b": "BASIC NOTES", "pb": f"{pc(D['basica_antes'])}%", "vence": "a"}),
    F(f"The basic player won just {pc(D['basica_antes'])} percent. The rest were ties.", {"tipo": "numero", "txt": f"{pc(D['basica_antes'])}%", "rotulo": "BASIC NOTES WIN THE RACE"}),
    F(f"And the fast games got way more common. Solving in five rounds or less went from {pc(B4['ate5'])} percent of games to {pc(C4['ate5'])}.", {"tipo": "teste", "a": "BASIC", "pa": f"{pc(B4['ate5'])}%", "b": "FULL DEDUCTION", "pb": f"{pc(C4['ate5'])}%", "vence": "b"}),
]

cap4 = [
    F("Part four. Bigger tables.", {"tipo": "capitulo", "n": "PART FOUR", "txt": "BIGGER TABLES"}),
    F("Now here's the twist. We changed the number of players.", {"tipo": "ficha", "titulo": "EXPERIMENT 2 · TABLE SIZE", "linhas": [["Players", "3, 4 and 6"], ["Games", "10,000 each"]]}),
    F("For a basic note taker, more players is bad news.", {"tipo": "cartas", "modo": "misterio", "selo": "MORE PLAYERS"}),
    F(f"Three players, {r1(B3['media'])} rounds. Six players, {r1(B6['media'])}.", barras("BASIC NOTES · ROUNDS TO SOLVE", [("3 PLAYERS", B3['media'], MARF), ("4 PLAYERS", B4['media'], MARF), ("6 PLAYERS", B6['media'], MARF)])),
    F("Every round takes longer, and you still learn just one card.", {"tipo": "ampulheta", "txt": "STILL ONE CARD"}),
    F("But for the full deduction player, it's the opposite.", {"tipo": "cartas", "modo": "misterio", "selo": "THE OPPOSITE"}),
    F(f"Three players, {r1(C3['media'])} rounds. Six players, just {r1(C6['media'])}.", barras("FULL DEDUCTION · ROUNDS TO SOLVE", [("3 PLAYERS", C3['media'], VERM), ("4 PLAYERS", C4['media'], VERM), ("6 PLAYERS", C6['media'], VERM)])),
    F("More players means more suggestions, more passes, and more hidden cards to track. Every one of them is a clue.", {"tipo": "lista", "titulo": "MORE PLAYERS MEANS", "itens": ["more suggestions", "more passes", "more hidden shows"]}),
    F(f"At a six player table, the full deduction player is {r1(B6['media'] / C6['media'])} times faster than the basic one.", {"tipo": "numero", "txt": f"{r1(B6['media'] / C6['media'])}×", "rotulo": "FASTER · 6 PLAYERS"}),
    F(f"And in {pc(C6['ate5'])} percent of games, they had the answer in five rounds or less.", {"tipo": "numero", "txt": f"{pc(C6['ate5'])}%", "rotulo": "SOLVED IN 5 ROUNDS OR LESS · 6 PLAYERS"}),
]

fim = [
    F("So how do you win at Clue?", {"tipo": "cartas", "modo": "misterio", "selo": "HOW TO WIN"}),
    F("Write down who passes. Write down who showed a card to whom. And count every hand.", {"tipo": "lista", "titulo": "THE WINNING NOTEPAD", "itens": ["who passed", "who showed to whom", "how many cards each"]}),
    F("Your notepad is the real detective. The dice just move you around.", {"tipo": "dados", "faces": [3, 5], "txt": "NOT THE DICE"}),
    F("How do you take notes in Clue? Tell us in the comments.", {"tipo": "cartas", "modo": "misterio", "selo": "YOUR NOTES?"}),
    F("And subscribe. Next, we play ten thousand games of another classic.", {"tipo": "fim"}),
]

spec = {
    "id": "ttr003a", "canal": "ten-thousand-runs", "titulo": "We Played 10,000 Games of Clue. Your Notepad Is Losing You the Game",
    "voz": "cw", "velocidade": 1.0, "lang": "en-us", "legenda": True, "acento": "#ffd23f", "marca": "TEN THOUSAND RUNS", "trilha": 0.14, "cauda": 4.0,
    "numeros": {"ten thousand": "10,000", "three hundred twenty four": "324", "nineteen forties": "1940s", "nineteen forty nine": "1949", "thirteen": "13", "fifteen": "15", "five": "5"},
    "blocos": [],
}
nomes = {1: 'The basic notepad', 2: 'Watch who passes', 3: 'Full deduction', 4: 'Bigger tables'}
for i, cap in enumerate([intro, cap1, cap2, cap3, cap4, fim]):
    cena = {"tipo": "capitulo" if i in nomes else "arte", "v": [v for _, v in cap]}
    if i in nomes: cena.update({"n": i, "titulo": nomes[i]})
    spec["blocos"].append({"cena": cena, "falas": [t for t, _ in cap]})
json.dump(spec, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'spec.json'), 'w'), ensure_ascii=False, indent=1)
txt = ' '.join(t for b_ in spec['blocos'] for t in b_['falas'])
print(len(txt.split()), 'palavras', sum(len(b_['falas']) for b_ in spec['blocos']), 'falas')

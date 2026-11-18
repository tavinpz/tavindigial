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
I4, I6, I3 = g(4, 'isca'), g(6, 'isca'), g(3, 'isca')
def pct(h, q):  # rodada do percentil q no histograma
    tot, ac = sum(h), 0
    for k, n in enumerate(h):
        ac += n
        if ac >= q * tot: return k + 1
P10, P90 = pct(C4['hist'], 0.10), pct(C4['hist'], 0.90)
UMA = C4['hist'][0] + C4['hist'][1]
CB, CC = [int(x) for x in R['combos4']['basica']], [int(x) for x in R['combos4']['completa']]
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
    F("Clue was invented in England in the nineteen forties by Anthony Pratt, a musician, with his wife Elva helping design the board. It's been sold since nineteen forty nine.", {"tipo": "ano", "ano": "1949", "de": 1940, "txt": "CLUE HITS THE SHELVES"}),
    F("More than seventy years later, families still fight over it at the kitchen table.", {"tipo": "cartas", "modo": "misterio", "selo": "70+ YEARS"}),
    F("And almost everyone plays it the same way.", {"tipo": "lista", "titulo": "HOW MOST PEOPLE PLAY", "itens": ["Make a guess", "See a card", "Cross it off"]}),
    F("They only cross off the cards someone shows them.", {"tipo": "cartas", "modo": "misterio", "selo": "CROSS IT OFF"}),
    F("But your notepad can do a lot more than that.", {"tipo": "ficha", "titulo": "LAB NOTE · THE NOTEPAD", "linhas": [["Most players", "use 1 trick"], ["Good players", "use 3"]]}),
    F("So we built Clue in code, and played ten thousand games.", {"tipo": "contador", "txt": "GAMES PLAYED"}),
    F("Then we did it again. And again. One for every way of taking notes.", {"tipo": "ficha", "titulo": "SIMULATION LAB · RUN ORDER", "linhas": [["Run 1", "basic notes"], ["Run 2", "+ who passed"], ["Run 3", "full deduction"]]}),
    F("Same cards, same deals. The only thing that changed was the notepad.", {"tipo": "teste", "a": "SAME CARDS", "pa": "✓", "b": "DIFFERENT NOTES", "pb": "?", "vence": "b"}),
    F("We even removed the board, so dice and luck couldn't help anyone.", {"tipo": "dados", "faces": [6, 6], "txt": "NO DICE"}),
    F("And the difference is huge. The best note taker solves the case more than twice as fast.", {"tipo": "numero", "txt": "2×", "rotulo": "FASTER WITH BETTER NOTES"}),
    F("We also tested the famous pro trick that everyone recommends online. And it didn't do what you think.", {"tipo": "cartas", "modo": "misterio", "selo": "THE PRO TRICK"}),
    F("If you play Clue with family or friends, send this video to the group before your next game night. Whoever watches it wins.", {"tipo": "cartas", "modo": "misterio", "selo": "SEND IT TO THE GROUP"}),
]

cap1 = [
    F("Part one. The basic notepad.", {"tipo": "capitulo", "n": "PART ONE", "txt": "THE BASIC NOTEPAD"}),
    F("Here's how a turn works. You suggest a suspect, a weapon and a room.", {"tipo": "ficha", "titulo": "YOUR SUGGESTION", "linhas": [["Suspect", "Colonel Mustard"], ["Weapon", "Rope"], ["Room", "Library"]]}),
    F("The next player has to show you one of those cards, if they have one.", {"tipo": "cartas", "modo": "misterio", "selo": "SHOW ONE"}),
    F("If they don't, the player after them has to try.", {"tipo": "lista", "titulo": "AROUND THE TABLE", "itens": ["Player 2: nothing", "Player 3: shows a card"]}),
    F("At the start, all twenty one cards minus the three in the envelope get dealt out. At a four player table, everyone holds four or five.", {"tipo": "ficha", "titulo": "THE DEAL · 4 PLAYERS", "linhas": [["Cards", "21"], ["In the envelope", "3"], ["Each hand", "4 or 5"]]}),
    F("Your job is to figure out the three cards nobody holds. And the moment you're sure, you make your accusation.", {"tipo": "cartas", "modo": "misterio", "selo": "ACCUSE"}),
    F("Get it wrong, and you're out of the game. So nobody accuses until they're certain.", {"tipo": "teste", "a": "RIGHT", "pa": "YOU WIN", "b": "WRONG", "pb": "YOU'RE OUT", "vence": "a"}),
    F("Which means the whole game comes down to one thing. How fast can you become certain?", {"tipo": "ampulheta", "txt": "HOW FAST?"}),
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
    F("Think about it. Player two just told the whole table that they have no Plum, no Wrench and no Kitchen.", {"tipo": "lista", "titulo": "PLAYER 2 DOES NOT HAVE", "itens": ["Plum", "Wrench", "Kitchen"]}),
    F("That player has none of those three cards. That's three facts, for free.", {"tipo": "numero", "txt": "3", "rotulo": "FREE FACTS FROM ONE PASS"}),
    F("And it works on other people's turns, too. Not just yours.", {"tipo": "cartas", "modo": "misterio", "selo": "EVERY TURN COUNTS"}),
    F(f"With that one habit, the average dropped from {r1(B4['media'])} rounds to {r1(P4['media'])}.", barras("ROUNDS TO SOLVE · 4 PLAYERS", [("BASIC", B4['media'], MARF), ("+ PASSES", P4['media'], AMAR)], de=1)),
    F(f"Put a basic player and a pass watcher side by side, with the same cards, and the pass watcher finishes first {pc(D['passes_antes_basica'])} percent of the time.", {"tipo": "teste", "a": "PASS WATCHER", "pa": f"{pc(D['passes_antes_basica'])}%", "b": "BASIC NOTES", "pb": "", "vence": "a"}),
    F("Be honest. Did you write down who passed in your last game? Comment yes or no. No judgment. Okay, a little judgment.", {"tipo": "teste", "a": "I WRITE IT DOWN", "pa": "YES", "b": "I NEVER DID", "pb": "NO", "vence": "a"}),
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
    F("Want to see it happen? Remember the three hundred twenty four possible crimes.", {"tipo": "numero", "txt": "324", "rotulo": "POSSIBLE CRIMES AT THE START"}),
    F(f"The moment you look at your own hand, that drops to about {CB[0]}. Same for everyone.", {"tipo": "numero", "txt": f"{CB[0]}", "rotulo": "POSSIBLE CRIMES · AFTER YOUR OWN HAND"}),
    F(f"After two rounds, the basic player still has {CB[2]} possibilities. The full deduction player, {CC[2]}.", {"tipo": "teste", "a": "BASIC", "pa": f"{CB[2]}", "b": "FULL DEDUCTION", "pb": f"{CC[2]}", "vence": "b"}),
    F(f"After four rounds, {CB[4]} against {CC[4]}.", {"tipo": "teste", "a": "BASIC", "pa": f"{CB[4]}", "b": "FULL DEDUCTION", "pb": f"{CC[4]}", "vence": "b"}),
    F(f"And after six rounds, the full deduction player is usually down to {CC[6]}. The basic player is still staring at {CB[6]}.", {"tipo": "teste", "a": "BASIC", "pa": f"{CB[6]}", "b": "FULL DEDUCTION", "pb": f"{CC[6]}", "vence": "b"}),
    F("Same cards. Same table. Same suggestions going around. The only difference is what got written down.", {"tipo": "ficha", "titulo": "LAB NOTE · THE SHRINKING LIST", "linhas": [["Round 2", f"{CB[2]} vs {CC[2]}"], ["Round 4", f"{CB[4]} vs {CC[4]}"], ["Round 6", f"{CB[6]} vs {CC[6]}"]], "selo": "SAME CARDS"}),
    F(f"And the fast games got way more common. Solving in five rounds or less went from {pc(B4['ate5'])} percent of games to {pc(C4['ate5'])}.", {"tipo": "teste", "a": "BASIC", "pa": f"{pc(B4['ate5'])}%", "b": "FULL DEDUCTION", "pb": f"{pc(C4['ate5'])}%", "vence": "b"}),
]

cap3b = [
    F("Part four. The pro trick.", {"tipo": "capitulo", "n": "PART FOUR", "txt": "THE PRO TRICK"}),
    F("Search for Clue strategy online, and you'll find the same trick everywhere. Use your own cards in your suggestion.", {"tipo": "ficha", "titulo": "THE PRO TRICK", "linhas": [["Suspect", "one you hold"], ["Weapon", "one you hold"], ["Room", "the one you test"]]}),
    F("You suggest two cards you already hold, plus one you want to test. If someone shows you a card, you know exactly which one it is.", {"tipo": "lista", "titulo": "HOW THE TRICK WORKS", "itens": ["2 of your own cards", "1 card to test", "Any show = that card"]}),
    F("It sounds brilliant. So we gave it to our full deduction player and ran another ten thousand games.", {"tipo": "contador", "txt": "GAMES · THE PRO TRICK"}),
    F(f"It got slower. {r1(I4['media'])} rounds instead of {r1(C4['media'])}.", barras("ROUNDS TO SOLVE · 4 PLAYERS", [("FULL DEDUCTION", C4['media'], VERM), ("+ PRO TRICK", I4['media'], AZUL)])),
    F(f"At six players, the same thing. {r1(I6['media'])} rounds instead of {r1(C6['media'])}.", barras("ROUNDS TO SOLVE · 6 PLAYERS", [("FULL DEDUCTION", C6['media'], VERM), ("+ PRO TRICK", I6['media'], AZUL)])),
    F(f"Even at three players, where the trick should shine, it lost. {r1(I3['media'])} against {r1(C3['media'])}.", barras("ROUNDS TO SOLVE · 3 PLAYERS", [("FULL DEDUCTION", C3['media'], VERM), ("+ PRO TRICK", I3['media'], AZUL)])),
    F("Here's why. The trick tests one card at a time. A normal suggestion tests three.", {"tipo": "teste", "a": "NORMAL SUGGESTION", "pa": "3 CARDS", "b": "PRO TRICK", "pb": "1 CARD", "vence": "a"}),
    F("And if you're already tracking hidden shows and hand sizes, your notepad untangles those three cards for you later.", {"tipo": "ficha", "titulo": "LAB NOTE · WHY IT'S SLOWER", "linhas": [["Pro trick", "clean answer, 1 card"], ["Normal + full notes", "3 cards, solved later"]], "selo": "NOTES BEAT TRICKS"}),
    F("The trick only helps players who don't take good notes. If your notepad is good, ask about cards you don't know.", {"tipo": "cartas", "modo": "misterio", "selo": "ASK WHAT YOU DON'T KNOW"}),
]

cap3c = [
    F("Part five. How much is luck?", {"tipo": "capitulo", "n": "PART FIVE", "txt": "HOW MUCH IS LUCK?"}),
    F("Even with perfect notes, the cards still matter.", {"tipo": "dados", "faces": [2, 5], "txt": "LUCK"}),
    F(f"Our full deduction player solved the case within two rounds in {UMA} of ten thousand games. Pure luck.", {"tipo": "numero", "txt": f"{UMA}", "rotulo": "GAMES SOLVED IN 2 ROUNDS OR LESS · OUT OF 10,000"}),
    F(f"But in most games, it took between {P10} and {P90} rounds. That's the real range of a good player.", {"tipo": "numero", "txt": f"{P10}–{P90}", "rotulo": "ROUNDS · 8 OUT OF 10 GAMES · FULL DEDUCTION"}),
    F(f"The basic player? In {pc(sum(B4['hist'][10:13]) / 10000)} percent of games, it took eleven rounds or more.", {"tipo": "numero", "txt": f"{pc(sum(B4['hist'][10:13]) / 10000)}%", "rotulo": "BASIC NOTES · 11+ ROUNDS"}),
    F("So luck decides a few games. Notes decide most of them.", {"tipo": "teste", "a": "NOTES", "pa": "MOST GAMES", "b": "LUCK", "pb": "A FEW", "vence": "a"}),
    F("Here's a challenge for your next game night. Everyone plays exactly like they always do. You play full deduction.", {"tipo": "ficha", "titulo": "THE GAME NIGHT CHALLENGE", "linhas": [["Everyone else", "plays normally"], ["You", "full deduction"], ["Goal", "solve first"]]}),
    F("Then come back here and tell us in the comments who won, and by how many rounds. We read every single one.", {"tipo": "cartas", "modo": "misterio", "selo": "TELL US WHO WON"}),
]

cap4 = [
    F("Part six. Bigger tables.", {"tipo": "capitulo", "n": "PART SIX", "txt": "BIGGER TABLES"}),
    F("Now here's the twist. We changed the number of players.", {"tipo": "ficha", "titulo": "EXPERIMENT 2 · TABLE SIZE", "linhas": [["Players", "3, 4 and 6"], ["Games", "10,000 each"]]}),
    F("For a basic note taker, more players is bad news.", {"tipo": "cartas", "modo": "misterio", "selo": "MORE PLAYERS"}),
    F(f"Three players, {r1(B3['media'])} rounds. Six players, {r1(B6['media'])}.", barras("BASIC NOTES · ROUNDS TO SOLVE", [("3 PLAYERS", B3['media'], MARF), ("4 PLAYERS", B4['media'], MARF), ("6 PLAYERS", B6['media'], MARF)])),
    F("Every round takes longer, and you still learn just one card.", {"tipo": "ampulheta", "txt": "STILL ONE CARD"}),
    F("But for the full deduction player, it's the opposite.", {"tipo": "cartas", "modo": "misterio", "selo": "THE OPPOSITE"}),
    F(f"Three players, {r1(C3['media'])} rounds. Six players, just {r1(C6['media'])}.", barras("FULL DEDUCTION · ROUNDS TO SOLVE", [("3 PLAYERS", C3['media'], VERM), ("4 PLAYERS", C4['media'], VERM), ("6 PLAYERS", C6['media'], VERM)])),
    F("More players means more suggestions, more passes, and more hidden cards to track. Every one of them is a clue.", {"tipo": "lista", "titulo": "MORE PLAYERS MEANS", "itens": ["more suggestions", "more passes", "more hidden shows"]}),
    F(f"At a six player table, the full deduction player is {r1(B6['media'] / C6['media'])} times faster than the basic one.", {"tipo": "numero", "txt": f"{r1(B6['media'] / C6['media'])}×", "rotulo": "FASTER · 6 PLAYERS"}),
    F("So if you're the best note taker at your table, invite more people. The bigger the table, the bigger your edge.", {"tipo": "teste", "a": "SMALL TABLE", "pa": "SMALL EDGE", "b": "BIG TABLE", "pb": "BIG EDGE", "vence": "b"}),
    F(f"And in {pc(C6['ate5'])} percent of games, they had the answer in five rounds or less.", {"tipo": "numero", "txt": f"{pc(C6['ate5'])}%", "rotulo": "SOLVED IN 5 ROUNDS OR LESS · 6 PLAYERS"}),
]

fim = [
    F(f"Let's recap the numbers. Basic notes, {r1(B4['media'])} rounds. Watching passes, {r1(P4['media'])}. Full deduction, {r1(C4['media'])}. And the famous pro trick made it slower, at {r1(I4['media'])}.", barras("ROUNDS TO SOLVE · 4 PLAYERS · THE RECAP", [("BASIC", B4['media'], MARF), ("+ PASSES", P4['media'], AMAR), ("FULL DEDUCTION", C4['media'], VERM), ("+ PRO TRICK", I4['media'], AZUL)])),
    F("More than a hundred thousand simulated games in this video. And one lesson.", {"tipo": "contador", "txt": "GAMES IN THIS VIDEO"}),
    F("So how do you win at Clue?", {"tipo": "cartas", "modo": "misterio", "selo": "HOW TO WIN"}),
    F("Write down who passes. Write down who showed a card to whom. And count every hand.", {"tipo": "lista", "titulo": "THE WINNING NOTEPAD", "itens": ["who passed", "who showed to whom", "how many cards each"]}),
    F("Your notepad is the real detective. The dice just move you around.", {"tipo": "dados", "faces": [3, 5], "txt": "NOT THE DICE"}),
    F("And forget the pro trick. Ask about the cards you don't know.", {"tipo": "lista", "titulo": "THE WINNING NOTEPAD", "itens": ["who passed", "who showed to whom", "how many cards each", "ask what you don't know"]}),
    F("Screenshot this list, and send it to the person who always wins at your house. It's time.", {"tipo": "lista", "titulo": "THE WINNING NOTEPAD", "itens": ["who passed", "who showed to whom", "how many cards each", "ask what you don't know"]}),
    F("How do you take notes in Clue? Basic, pass watcher, or full detective? Tell us in the comments.", {"tipo": "cartas", "modo": "misterio", "selo": "YOUR NOTES?"}),
    F("And which classic should we play ten thousand times next? The most requested game in the comments is the next video.", {"tipo": "contador", "txt": "GAMES FOR THE NEXT VIDEO"}),
    F("Subscribe so you don't miss it. See you in the next ten thousand.", {"tipo": "fim"}),
]

spec = {
    "id": "ttr003a", "canal": "ten-thousand-runs", "titulo": "We Played 10,000 Games of Clue. Your Notepad Is Losing You the Game",
    "voz": "cw", "velocidade": 1.0, "lang": "en-us", "legenda": True, "acento": "#ffd23f", "marca": "TEN THOUSAND RUNS", "trilha": 0.14, "cauda": 4.0,
    "numeros": {"ten thousand": "10,000", "three hundred twenty four": "324", "nineteen forties": "1940s", "nineteen forty nine": "1949", "thirteen": "13", "fifteen": "15", "five": "5"},
    "blocos": [],
}
nomes = {1: 'The basic notepad', 2: 'Watch who passes', 3: 'Full deduction', 4: 'The pro trick', 5: 'How much is luck', 6: 'Bigger tables'}
for i, cap in enumerate([intro, cap1, cap2, cap3, cap3b, cap3c, cap4, fim]):
    cena = {"tipo": "capitulo" if i in nomes else "arte", "v": [v for _, v in cap]}
    if i in nomes: cena.update({"n": i, "titulo": nomes[i]})
    spec["blocos"].append({"cena": cena, "falas": [t for t, _ in cap]})
json.dump(spec, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'spec.json'), 'w'), ensure_ascii=False, indent=1)
txt = ' '.join(t for b_ in spec['blocos'] for t in b_['falas'])
print(len(txt.split()), 'palavras', sum(len(b_['falas']) for b_ in spec['blocos']), 'falas')

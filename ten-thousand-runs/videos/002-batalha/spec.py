"""Ten Thousand Runs #002: Battleship (Batalha Naval). 10.000 partidas por estratégia, simuladas em sim/batalha.py."""
import json, os

AQUI = os.path.dirname(os.path.abspath(__file__))
V = json.load(open('/home/claude/ten-thousand-runs/sim/batalha_video.json'))
EX, H, DF, DU = V['ex'], V['hist'], V['defesa'], V['duelos']
M = {k: round(v['media']) for k, v in H.items()}
CEM = round(V['cem'] * 100)
COR = {'aleatorio': '#8a94a8', 'caca': '#5aa0ff', 'paridade': '#3ddc97', 'densidade': '#ffd23f'}
NOME = {'aleatorio': 'Random', 'caca': 'Hunt & target', 'paridade': 'Checkerboard', 'densidade': 'Probability'}


def lado(k, nome=None):
    return {'nome': nome or NOME[k], 'seq': EX[k]['seq'], 'navios': EX[k]['navios'], 'cor': COR[k]}


def pct(x):
    return round(x * 100)


def hist(ks, falas):
    s = []
    for k, fl in zip(ks, falas):
        s.append({'nome': NOME[k], 'cor': COR[k], 'cont': H[k]['cont'], 'media': H[k]['media'], 'fala': fl, 'y_rot': 90 if k == 'caca' else 0})
    return s


sub50 = {k: round(sum(H[k]['cont'][:50 - 17 + 1])) for k in H}
blocos = [
    # ---------------- gancho: cortes curtos ----------------
    {'cena': {'tipo': 'naval', 'lados': [lado('caca', 'The way most people play')]},
     'falas': [f"Most people need about {M['caca']} shots to sink a whole Battleship fleet."]},
    {'cena': {'tipo': 'naval', 'lados': [lado('densidade', 'The best strategy we found')]},
     'falas': [f"The best strategy we found needs about {M['densidade']}."]},
    {'cena': {'tipo': 'naval', 'titulo': '10,000 games each', 'lados': [lado('caca'), lado('densidade')]},
     'falas': [f"We built Battleship in code and played ten thousand games with four different strategies.",
               f"Against the way you probably play, the winner takes {pct(1 - DU['caca|densidade'])} games out of a hundred."]},
    {'cena': {'tipo': 'calor', 'titulo': 'Where ships can hide', 'valores': V['dens0'], 'linhas': ['Corners: almost never', 'Center: almost always']},
     'falas': ["It starts by never wasting a shot on a corner.",
               "And by the end of this video, you'll also know where to hide your own ships so the best player in the room needs extra shots to find them."]},

    {'cena': {'tipo': 'regras', 'titulo_regras': 'THE GAME', 'quando': [[0, 30], [0, 120], [1, 0], [2, 0]],
              'itens': ['10 × 10 grid · 100 squares', 'Ships of 5, 4, 3, 3 and 2', '17 squares to hit', 'Fewest shots wins']},
     'falas': ["Quick rules. Each player hides five ships on a ten by ten grid: a carrier of five squares, a battleship of four, two ships of three, and a little destroyer of two.",
               "That's seventeen squares out of a hundred.",
               "You take turns calling shots. Whoever sinks the other fleet in fewer shots wins. So the only number that matters is how many shots you need."]},
    {'cena': {'tipo': 'promessa', 'itens': ['Why shooting blind takes 95 shots', 'The checkerboard trick', 'The strategy that counts', 'Where to hide your fleet']},
     'falas': ["We wrote four players, from the dumbest to the smartest, and gave each one ten thousand games against randomly hidden fleets.",
               "Here's what we found."]},

    # ---------------- capítulo 1 ----------------
    {'cena': {'tipo': 'capitulo', 'n': 1, 'titulo': 'Shooting blind'},
     'falas': ["Part one. Shooting blind."]},
    {'cena': {'tipo': 'naval', 'lados': [lado('aleatorio')], 'mostrar': True},
     'falas': ["The first player has no plan. Every shot goes to a random square it hasn't tried yet.",
               "Even when it hits something, it doesn't follow up. The next shot is just as random.",
               f"On average, this player needs {M['aleatorio']} shots out of a hundred to finish the game.",
               "Because the game only ends when the very last square of the very last ship is hit. And that square could be anywhere."]},
    {'cena': {'tipo': 'numero', 'valor': CEM, 'dec': 0, 'sufixo': '%', 'rotulo': 'of random games need all 100 shots', 'cor': 'ruim', 'sem_icones': True},
     'falas': [f"In {CEM} percent of games, about one in six, the random player has to shoot every single square on the board.",
               "So the first lesson is obvious, but it's worth seeing the size of it: a hit is information. Throwing it away costs you about thirty shots."]},

    # ---------------- capítulo 2 ----------------
    {'cena': {'tipo': 'capitulo', 'n': 2, 'titulo': 'How most people play'},
     'falas': ["Part two. How most people play."]},
    {'cena': {'tipo': 'naval', 'lados': [lado('caca')], 'mostrar': True},
     'falas': ["The second player hunts and targets. It shoots at random until it gets a hit.",
               "Then it switches modes, and tries the squares above, below, left and right, until the ship goes down. Then it goes back to hunting.",
               "That's how almost everyone plays Battleship.",
               f"And it works. The average drops from {M['aleatorio']} shots to {M['caca']}."]},
    {'cena': {'tipo': 'histograma', 'titulo': 'Shots needed to win, 10,000 games each', 'xr': [17, 100], 'xt': [20, 30, 40, 50, 60, 70, 80, 90, 100], 'xl': 'SHOTS TO SINK THE WHOLE FLEET', 'ymax': 17,
              'series': hist(['aleatorio', 'caca'], [0, 1])},
     'falas': ["Here are all ten thousand games for each player. The random player is the wall on the right, piled up near a hundred.",
               "Hunt and target spreads out much further left. But look at the left half of the chart. It's still mostly empty. The hunting part is the problem: between ships, this player is still shooting blind."]},

    # ---------------- capítulo 3 ----------------
    {'cena': {'tipo': 'capitulo', 'n': 3, 'titulo': 'The checkerboard trick'},
     'falas': ["Part three. The checkerboard trick."]},
    {'cena': {'tipo': 'naval', 'lados': [lado('paridade')], 'mostrar': True},
     'falas': ["The smallest ship in the game is two squares long. That means every ship, wherever it is, has to cover at least one square of a checkerboard pattern.",
               "So while hunting, you only need to shoot half the board. The black squares. Never two neighbors in a row.",
               "When you hit, you target normally. Then you go back to the checkerboard.",
               f"This one change takes the average from {M['caca']} shots down to {M['paridade']}."]},
    {'cena': {'tipo': 'teste', 'titulo': 'Head to head: who sinks the fleet first?', 'a': {'r': 'Checkerboard', 'v': pct(1 - DU['caca|paridade'])}, 'b': {'r': 'Hunt & target', 'v': pct(DU['caca|paridade'])},
              'quando': [[0, 30], [0, 10]], 'cores': ['bom', 'ruim']},
     'falas': [f"Put the two face to face and the checkerboard player wins {pct(1 - DU['caca|paridade'])} percent of the games. Same rules, same luck. Just smarter hunting."]},

    # ---------------- capítulo 4 ----------------
    {'cena': {'tipo': 'capitulo', 'n': 4, 'titulo': 'The player that counts'},
     'falas': ["Part four. The player that counts."]},
    {'cena': {'tipo': 'calor', 'titulo': 'Every way the fleet can fit', 'valores': V['dens0'], 'destaque': [3, 3, 4, 4], 'fala_destaque': 2,
              'linhas': ['Edges: fewer ways in', 'Corners: just 2 per ship', 'Center: the most']},
     'falas': ["The fourth player doesn't guess at all. Before every shot, it counts every possible position where each remaining ship could still fit.",
               "Look at an empty board. A ship can only touch a corner square in two ways, one horizontal, one vertical. Edges are a little better.",
               "But the center squares are covered by the most possible positions. So that's where it shoots first.",
               "And after every miss or hit, it counts again. Misses carve out empty space. Hits make the squares around them light up."]},
    {'cena': {'tipo': 'naval', 'lados': [lado('densidade')], 'mostrar': True},
     'falas': ["Watch it play the exact same board as the others.",
               "It doesn't spread its shots evenly. It goes where the most ships could be, and when it hits, it follows the direction that fits the most ships.",
               f"{len(EX['densidade']['seq'])} shots. Fewer than half the board."]},
    {'cena': {'tipo': 'histograma', 'titulo': 'Shots needed to win, 10,000 games each', 'xr': [17, 100], 'xt': [20, 30, 40, 50, 60, 70, 80, 90, 100], 'xl': 'SHOTS TO SINK THE WHOLE FLEET', 'ymax': 17,
              'series': hist(['aleatorio', 'caca', 'paridade', 'densidade'], [0, 0, 0, 1])},
     'falas': ["Back to the chart.",
               f"The counting player lives on the left. It finishes in fifty shots or fewer in {sub50['densidade']} percent of games. The hunt and target player? Only {sub50['caca']} percent."]},
    {'cena': {'tipo': 'naval', 'titulo': 'Same fleet, same rules', 'lados': [lado('caca'), lado('densidade')]},
     'falas': ["Here's a race, shot for shot, on the same hidden fleet.",
               f"Over ten thousand games, the counting player beats hunt and target {pct(1 - DU['caca|densidade'])} percent of the time, and beats the checkerboard {pct(1 - DU['paridade|densidade'])} percent of the time."]},
    {'cena': {'tipo': 'texto', 'linhas': ['How to count in your head', 'Aim where the biggest ship still fits', 'Skip gaps too small for what is left']},
     'falas': ["You can't count thousands of positions in your head. But you can steal the idea.",
               "Shoot where the biggest ship that's still afloat could still fit. And when only small ships are left, skip the gaps that are too small to hold them.",
               "That alone puts you somewhere between the checkerboard and the computer."]},

    # ---------------- capítulo 5 ----------------
    {'cena': {'tipo': 'capitulo', 'n': 5, 'titulo': 'Where to hide your fleet'},
     'falas': ["Part five. Where to hide your fleet."]},
    {'cena': {'tipo': 'barras', 'titulo': 'Shots the best player needs to find your fleet', 'unid': ' shots', 'dec': 0, 'max_v': 58, 'quando': [[1, 60], [2, 0], [2, 90], [2, 200]],
              'itens': [{'r': 'All on the edges', 'v': DF['bordas'], 'cor': '#3ddc97'}, {'r': 'Random', 'v': DF['aleatorio'], 'cor': '#8a94a8'},
                        {'r': 'Ships touching', 'v': DF['colados'], 'cor': '#8a94a8'}, {'r': 'Packed in the center', 'v': DF['centro'], 'cor': '#ff5d5d'}]},
     'falas': ["Now flip it around. If your opponent plays like the counting computer, where should you hide?",
               f"We hid fleets four ways and let the best player hunt them, five thousand games each. Ships pushed against the edges took {DF['bordas']:.1f} shots to find. The most of any layout.",
               f"Random placement: {DF['aleatorio']:.1f}. Ships touching each other, a popular trick, made almost no difference: {DF['colados']:.1f}. And packing them in the middle was the worst, at {DF['centro']:.1f}."]},
    {'cena': {'tipo': 'naval', 'lados': [{'nome': 'Fleet on the edges', 'seq': EX['borda']['seq'], 'navios': EX['borda']['navios'], 'cor': '#3ddc97'}], 'mostrar': True},
     'falas': ["The reason is the same heat map. The counting player starts in the middle, because that's where most fleets are.",
               "A fleet on the edges sits exactly where it looks last.",
               "One warning. This works against a player who thinks in probabilities. Against someone who knows you love the edges, it stops working. The best hiding spot is the one your opponent doesn't expect."]},

    # ---------------- veredito ----------------
    {'cena': {'tipo': 'lista', 'titulo': 'How to win your next game', 'itens': ['Never ignore a hit', 'Hunt on a checkerboard', 'Aim where the big ship still fits', 'Hide on the edges, sometimes']},
     'falas': ["So, how do you win your next game of Battleship?",
               "One. Never ignore a hit.",
               "Two. Hunt on a checkerboard, never two neighbors in a row.",
               "Three. Aim where the biggest ship still fits, and skip the gaps that are too small.",
               "And four. Hide your fleet near the edges. Just not every single time."]},
    {'cena': {'tipo': 'fim', 'pergunta': 'Where do you hide your carrier?', 'cta': 'SUBSCRIBE FOR THE NEXT 10,000 RUNS'},
     'falas': ["Where do you usually hide your carrier? Tell us in the comments. And subscribe, because next time we're running ten thousand games of something else."]},
]

spec = {'id': 'ttr002', 'canal': 'ten-thousand-runs', 'marca': 'TEN THOUSAND RUNS', 'legenda': True,
        'titulo': 'We Played 10,000 Games of Battleship. This Strategy Wins 9 Times Out of 10', 'voz': 'am_michael', 'velocidade': 1.0, 'blocos': blocos}
json.dump(spec, open(os.path.join(AQUI, 'spec.json'), 'w'), indent=1)
falas = [f for b in blocos for f in b['falas']]
pal = sum(len(f.split()) for f in falas)
print(len(blocos), 'cenas', len(falas), 'falas', pal, 'palavras ~', round(pal / 155, 1), 'min')
print(M, CEM, sub50, {k: round(v * 100) for k, v in DU.items()}, DF)

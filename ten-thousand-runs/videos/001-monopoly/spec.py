"""Ten Thousand Runs #001: Monopoly. Gera spec.json (blocos de cena + falas) a partir dos resultados da simulação."""
import json, os

AQUI = os.path.dirname(os.path.abspath(__file__))
R = json.load(open('/home/claude/ten-thousand-runs/sim/resultado.json'))
L = {int(k): v for k, v in R['landing'].items()}
W = R['tournament']['win_rate']
ROI = {c: [round(x['per_1000'], 1) for x in v['rows']] for c, v in R['roi'].items()}
D = R['duels']
pct = lambda x: round(x * 100, 1)

def duel(a, b):
    k = f'{a}|{b}'
    return D[k] if k in D else 1 - D[f'{b}|{a}']

NOMES = {'brown': 'Brown', 'lightblue': 'Light blue', 'pink': 'Pink', 'orange': 'Orange', 'red': 'Red', 'yellow': 'Yellow', 'green': 'Green', 'darkblue': 'Dark blue'}
ordem = sorted(W, key=lambda c: -W[c])

blocos = [
    # ---------------- gancho ----------------
    {'cena': {'tipo': 'abertura', 'texto': 'ONE DECISION\nDECIDES THE GAME', 'run': 10000},
     'falas': ["You're sitting at a Monopoly table. You have fifteen hundred dollars, three opponents, and about two hours of your life on the line.",
               "And before the dice even stop rolling, one decision has already decided most of the game: which properties you fight for."]},
    {'cena': {'tipo': 'contador', 'alvo': 10000, 'rotulo': 'GAMES SIMULATED', 'sub': 'every rule · every card · every trip to jail'},
     'falas': ["So we stopped guessing. We built Monopoly in code, with every rule, every Chance card, every trip to jail.",
               "And then we played it. Ten thousand times."]},
    {'cena': {'tipo': 'promessa', 'itens': ['The set that wins almost half of all games', 'The expensive set that quietly loses', 'The house where the money starts']},
     'falas': ["By the end of this video, you'll know the one color set that wins almost half of all games,",
               "the expensive set that quietly loses,",
               "and the exact number of houses where the money actually starts.",
               "And the reason behind all of it is a square nobody wants to land on."]},

    # ---------------- parte 1: tráfego ----------------
    {'cena': {'tipo': 'capitulo', 'n': 1, 'titulo': 'The board is not fair'},
     'falas': ["Part one. The board is not fair."]},
    {'cena': {'tipo': 'tabuleiro', 'modo': 'igual'},
     'falas': ["Here's the board. Forty squares. If the dice were the only thing moving you, every square would get the same traffic.",
               "Two and a half percent each."]},
    {'cena': {'tipo': 'tabuleiro', 'modo': 'calor', 'prob': [L[i] for i in range(40)], 'frase': '10,000 games.\nNobody buys a thing.\nWhere do the pieces stop?'},
     'falas': ["But that's not what happens. We ran ten thousand games where nobody buys anything, just to watch where the pieces end up.",
               "And the board lights up like this."]},
    {'cena': {'tipo': 'tabuleiro', 'modo': 'calor', 'prob': [L[i] for i in range(40)], 'foco': [10], 'numero': {'valor': pct(L[10]), 'dec': 1, 'sufixo': '%', 'rotulo': 'of all moves end in JAIL'}},
     'falas': [f"One square gets more than three times the traffic of any other. Jail.",
               f"In our games, a piece ended its move in jail {pct(L[10])} percent of the time.",
               "Because of the Go To Jail square. Because of two cards. Because of rolling doubles three times in a row.",
               "And then a lot of players sit there, turn after turn, trying to roll their way out."]},
    {'cena': {'tipo': 'dados'},
     'falas': ["But here's what matters. Every one of those players has to leave jail eventually. And they all leave from the same spot.",
               "The most common roll with two dice is a seven. Then six and eight. Then five and nine."]},
    {'cena': {'tipo': 'tabuleiro', 'modo': 'saida', 'prob': [L[i] for i in range(40)], 'foco': [16, 18, 19], 'grupo': 'orange'},
     'falas': ["Count six, eight and nine squares from jail, and look where you land.",
               "Orange. St. James Place, Tennessee Avenue, New York Avenue. Sitting right in the path of everyone walking out of jail."]},
    {'cena': {'tipo': 'top', 'itens': [
        {'r': 'Illinois Ave', 'v': pct(L[24]), 'cor': 'red'}, {'r': 'Reading Railroad', 'v': pct(L[5]), 'cor': 'rr'},
        {'r': 'B&O Railroad', 'v': pct(L[25]), 'cor': 'rr'}, {'r': 'Tennessee Ave', 'v': pct(L[18]), 'cor': 'orange'},
        {'r': 'New York Ave', 'v': pct(L[19]), 'cor': 'orange'}], 'fundo': [
        {'r': 'Mediterranean Ave', 'v': pct(L[1]), 'cor': 'brown'}, {'r': 'Park Place', 'v': pct(L[37]), 'cor': 'darkblue'}, {'r': 'Baltic Ave', 'v': pct(L[3]), 'cor': 'brown'}],
        'unidade': '% of moves', 'titulo': 'Most and least visited properties'},
     'falas': ["The single most visited property is Illinois Avenue, because a Chance card sends you straight there. The railroads are right behind it, because three Chance cards point at them.",
               "And at the bottom: Mediterranean Avenue, Baltic Avenue, and Park Place, which sits right after a Chance square that keeps sending people somewhere else.",
               "So the cheapest set on the board is also one of the emptiest. Remember that."]},

    # ---------------- parte 2: retorno ----------------
    {'cena': {'tipo': 'capitulo', 'n': 2, 'titulo': 'Traffic is not money'},
     'falas': ["Part two. Traffic is not money."]},
    {'cena': {'tipo': 'texto', 'linhas': ['Rent collected', 'per opponent turn', 'for every $1,000 invested']},
     'falas': ["A square only pays if it has rent. So we did the math on every set: how much rent you collect, every time an opponent takes a turn, for every thousand dollars you put in."]},
    {'cena': {'tipo': 'degraus', 'grupos': ['orange', 'red', 'darkblue', 'lightblue', 'green'], 'series': {c: ROI[c] for c in ['orange', 'red', 'darkblue', 'lightblue', 'green']}, 'foco_degrau': 3},
     'falas': ["With no houses, every set is basically worthless. A few dollars.",
               "One house, a little better. Two houses, better.",
               "And then, at three houses, something strange happens. The return doesn't just grow. It doubles.",
               f"For orange, it goes from {ROI['orange'][2]:.0f} dollars to {ROI['orange'][3]:.0f} dollars per opponent turn, for every thousand invested.",
               "After that, for four of the eight sets, red, yellow, green and dark blue, the fourth house and the hotel add almost nothing. For green, they actually make the return worse."]},
    {'cena': {'tipo': 'regra', 'n': 1, 'texto': 'Get every property of a set to 3 houses. Fast.'},
     'falas': ["That's the first rule the simulation gave us. Get every property of your set to three houses, as fast as you can."]},

    # ---------------- parte 3: torneio ----------------
    {'cena': {'tipo': 'capitulo', 'n': 3, 'titulo': 'Ten thousand games'},
     'falas': ["Part three. The real test."]},
    {'cena': {'tipo': 'regras', 'itens': ['4 players per game', 'Each starts with one full color set', 'Everything else bought the normal way', 'No trades, no auctions']},
     'falas': ["Math on paper is one thing. Real games are messy. People go bankrupt, mortgage everything, get lucky. So we ran the real thing.",
               "Ten thousand games. Four players each. Every player starts already owning one complete color set, a different one for each player.",
               "Everything else on the board, they buy the normal way, when they land on it.",
               "One note: our players don't trade and don't hold auctions. Everything here comes from the rules on the box and the dice."]},
    {'cena': {'tipo': 'barras', 'itens': [], 'linha_ref': 25, 'so_ref': True},
     'falas': ["If every set were equally good, each player would win one game in four. Twenty five percent. That's the line to beat."]},
    {'cena': {'tipo': 'pontos', 'log': 'torneio_log.json'},
     'falas': ["Here are all ten thousand games. Every dot is one full game, colored by the set that won it.",
               f"Orange won {pct(W['orange'])} percent of the games it played. Basically half. Twice its fair share."]},
    {'cena': {'tipo': 'barras', 'itens': [{'r': NOMES[c], 'v': pct(W[c]), 'cor': c} for c in ordem], 'linha_ref': 25, 'revela': 'cima2'},
     'falas': [f"Second place, pink, at {pct(W['pink']):.0f} percent. The other set on that side of the board, right after jail, with cheap houses.",
               f"Then red, {pct(W['red']):.0f}. Yellow, {pct(W['yellow']):.0f}. Light blue, {pct(W['lightblue']):.0f}."]},
    {'cena': {'tipo': 'barras', 'itens': [{'r': NOMES[c], 'v': pct(W[c]), 'cor': c} for c in ordem], 'linha_ref': 25, 'foco': ['darkblue', 'green', 'brown']},
     'falas': ["And now the famous one. Park Place and Boardwalk. The most expensive set on the board.",
               f"It won {pct(W['darkblue']):.0f} percent of its games. Green, the most expensive set to build on, did even worse: {pct(W['green']):.0f}.",
               f"And brown, Mediterranean and Baltic? {pct(W['brown']):.0f} percent. One game in a hundred."]},

    # ---------------- virada: duelos ----------------
    {'cena': {'tipo': 'matriz', 'cores': ['orange', 'pink', 'red', 'yellow', 'lightblue', 'darkblue', 'green', 'brown'], 'duelos': {k: v for k, v in D.items()}, 'foco': 'orange'},
     'falas': ["But a four player game can hide things. So we ran one more experiment. Just two players, one set each, a thousand games for every possible matchup.",
               f"Orange beat dark blue {pct(duel('orange', 'darkblue')):.0f} percent of the time. It beat green {pct(duel('orange', 'green')):.0f} percent of the time.",
               f"But look at this one. Light blue, the cheap set nobody respects, held orange to {100 - pct(duel('orange', 'lightblue')):.0f} percent. Better than any expensive set managed."]},
    {'cena': {'tipo': 'comparacao', 'a': {'cor': 'lightblue', 'nome': 'Light blue', 'valor': 450}, 'b': {'cor': 'darkblue', 'nome': 'Dark blue', 'valor': 1200}, 'rotulo': 'cost to reach 3 houses on the whole set'},
     'falas': ["Because in a real game, speed beats size. Three houses on all of light blue costs four hundred and fifty dollars.",
               "Three houses on Park Place and Boardwalk costs twelve hundred. By the time you can afford them, someone else is already collecting."]},
    {'cena': {'tipo': 'numero', 'valor': pct(R['rails']), 'dec': 0, 'sufixo': '%', 'rotulo': 'win rate starting with all 4 railroads', 'cor': 'rr'},
     'falas': [f"And the railroads? A player who started with all four, against three players with full color sets, won only {pct(R['rails']):.0f} percent of the time."]},

    # ---------------- parte 4: truques famosos ----------------
    {'cena': {'tipo': 'capitulo', 'n': 4, 'titulo': 'Three famous tricks, tested'},
     'falas': ["Part four. Three famous tricks. Tested."]},
    {'cena': {'tipo': 'teste', 'titulo': 'Jail: pay $50 or stay and roll?', 'a': {'r': 'Stays and rolls', 'v': pct(R['jail']['roll'])}, 'b': {'r': 'Pays right away', 'v': pct(R['jail']['pay'])}, 'c': {'r': 'Pays early, stays late', 'v': pct(R['jail']['smart'])}, 'quando': [[2, 0], [2, 120], [5, 40]], 'cores': ['bom', 'ruim', 'neutro']},
     'falas': ["Every Monopoly player has an opinion about jail. Pay the fifty dollars and get out, or sit there and roll for doubles.",
               "So we tested it. Ten thousand games where one player always pays right away, and ten thousand where the same player always stays and rolls.",
               f"The player who stayed won {pct(R['jail']['roll'])} percent of the time. The player who paid right away: {pct(R['jail']['pay'])}.",
               "Paying your way out cost about one in every ten games that player would have won.",
               "Because jail is the safest square on the board. While you sit there, you can't land on anyone's hotel. And you still collect rent.",
               f"The classic advice, pay early while the board is empty, stay late once there are houses, scored {pct(R['jail']['smart'])}. About the same as simply staying."]},
    {'cena': {'tipo': 'teste', 'titulo': 'The house shortage trick', 'a': {'r': 'Builds hotels', 'v': pct(R['hotel']['hotel'])}, 'b': {'r': 'Stops at 4 houses to block', 'v': pct(R['hotel']['four'])}, 'quando': [[1, 150], [1, 10]], 'cores': ['bom', 'ruim']},
     'falas': ["Trick number two. There are only thirty two houses in the box. Some players stop at four houses and never build hotels, so nobody else can get any houses. It's the most famous advanced trick in Monopoly.",
               f"In our games, it lost. The player who hoarded houses won {pct(R['hotel']['four'])} percent. The same player building hotels won {pct(R['hotel']['hotel'])}.",
               "The jump in rent from a hotel was worth more than blocking anyone."]},
    {'cena': {'tipo': 'barras', 'itens': [{'r': f'Rolls {n}', 'v': pct(R['tournament']['seat'][str(i)] if str(i) in R['tournament']['seat'] else R['tournament']['seat'][i]), 'cor': 'neutro'} for i, n in enumerate(['first', 'second', 'third', 'last'])], 'linha_ref': 25, 'titulo': 'Win rate by turn order'},
     'falas': ["And the one thing you can't control: who goes first.",
               f"In our ten thousand games, the player who rolled first won {pct(R['tournament']['seat']['0'])} percent. The player who rolled last, {pct(R['tournament']['seat']['3'])}.",
               "Going first is worth about one extra win every twenty games. So if you get to choose, choose first."]},

    # ---------------- fim ----------------
    {'cena': {'tipo': 'lista', 'titulo': 'What 10,000 games taught us', 'itens': ['Fight for orange. Then pink, red or light blue.', 'Build to 3 houses as fast as you can.', 'Stay in jail. Don\'t pay.', "Don't fall in love with Boardwalk."]},
     'falas': ["So here's the strategy ten thousand games gave us.",
               "One. Fight for orange. If you can't get it, go for pink, red, or light blue.",
               "Two. Build to three houses as fast as possible. That's where the money doubles.",
               "Three. When you go to jail, stay there. Let everyone else walk around the board.",
               "Four. Don't fall in love with Boardwalk."]},
    {'cena': {'tipo': 'tabuleiro', 'modo': 'final', 'prob': [L[i] for i in range(40)], 'foco': [10], 'grupo': 'orange', 'frase': 'Jail.\nThe busiest square.\nWhoever owns the way out owns the game.'},
     'falas': ["And the reason for all of it is the square nobody wants. Jail.",
               "It's the busiest place on the board. And whoever owns the way out, owns the game.",
               "Next time you play, watch who's sitting in jail. And who they're about to pay."]},
    {'cena': {'tipo': 'fim', 'pergunta': 'Which set do you always go for?'},
     'falas': ["Which set do you always go for? Tell us in the comments. And subscribe, to see what we run ten thousand times next."]},
]

spec = {'id': 'ttr001', 'canal': 'ten-thousand-runs', 'titulo': 'We Simulated 10,000 Games of Monopoly. One Color Wins Twice as Often',
        'voz': 'am_michael', 'velocidade': 1.0, 'blocos': blocos}
json.dump(spec, open(os.path.join(AQUI, 'spec.json'), 'w'), indent=1)
falas = [f for b in blocos for f in b['falas']]
palavras = sum(len(f.split()) for f in falas)
print(len(blocos), 'cenas', len(falas), 'falas', palavras, 'palavras ~', round(palavras / 150, 1), 'min')

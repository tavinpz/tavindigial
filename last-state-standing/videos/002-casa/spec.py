"""Last State Standing #002: quanto da renda a prestação da casa típica come, nos 50 estados.
Dados (FRED): preço mediano de anúncio por estado (Realtor.com, MEDLISPRI{ST}, média dos últimos 12 meses),
renda mediana domiciliar 2025 (Census, MEHOINUS{ST}A672N), juros 30 anos Freddie Mac (MORTGAGE30US).
Conta: 10% de entrada, 30 anos fixo, só principal + juros, dividido pela renda mensal."""
import json, os

AQUI = os.path.dirname(os.path.abspath(__file__))
D = '/home/claude/last-state-standing/dados/casa/'
C = json.load(open(D + 'casa.json'))
C.sort(key=lambda o: -o['pct'])
for k, o in enumerate(C):
    o['rank'] = k + 1
POR = {o['nome']: o for o in C}
EST = [{'nome': o['nome'], 'v': o['pct'], 'rank': o['rank']} for o in C]
MIN, MAX = min(o['pct'] for o in C), max(o['pct'] for o in C)
JUROS = float(open(D + 'hip.csv').read().strip().split('\n')[-1].split(',')[1])
US = json.load(open(D + 'us_serie.json'))
PASSAM = sum(o['pct'] <= 28 for o in C)


def parcela(L, taxa):
    r = taxa / 100 / 12
    return L * r / (1 - (1 + r) ** -360) if r else L / 360


ESC = [sum(parcela(o['preco'] * 0.9, t) / (o['renda'][1] / 12) <= 0.28 for o in C) for t in (JUROS, 6, 5, 4, 3)]
for o in C:
    o['pct0'] = parcela(o['preco'] * 0.9, 0) / (o['renda'][1] / 12) * 100
PASSAM19 = sum(o['pct19'] <= 28 for o in C)
base = {'estados': EST, 'min': MIN, 'max': MAX, 'leg_min': f'{MIN:.0f}% of income', 'leg_max': f'{MAX:.0f}%'}


def mapa(**kw):
    return {'tipo': 'eua', **base, **kw}


def estado(nome):
    o = POR[nome]
    linhas = [{'r': 'Typical home, listed', 'v': f"${o['preco']:,.0f}"},
              {'r': 'Typical household income', 'v': f"${o['renda'][1]:,.0f}"},
              {'r': 'Monthly mortgage, 10% down', 'v': f"${o['parcela']:,.0f} · {o['pct']:.0f}%"}]
    return {'tipo': 'estado', **base, 'nome': nome, 'linhas': linhas}


def p(nome):
    return f"{POR[nome]['pct']:.0f}"


def mil(v):
    return f"{round(v / 1000):,} thousand"


gancho = {'tipo': 'gancho_lss', **base, 'batidas': [
    {'t': 'contador', 'de': 0, 'ate': PASSAM19, 'acima': '2019', 'rotulo': 'states where a typical home fit the 28% rule', 'cor': 'bom'},
    {'t': 'contador', 'de': PASSAM19, 'ate': PASSAM, 'acima': 'TODAY', 'rotulo': 'states where it still does', 'cor': 'ruim', 'rapido': True, 'forte': True},
    {'t': 'foco', 'estados': ['New York'], 'num': f"{p('New York')}%", 'rotulo': 'OF INCOME, EVERY MONTH.\nNEW YORK.', 'cor': 'quente', 'forte': True},
    {'t': 'foco', 'estados': ['Ohio'], 'num': f"{p('Ohio')}%", 'rotulo': 'OHIO.', 'cor': 'bom'},
    {'t': 'zoom', 'estado': 'Montana', 'titulo': 'Not California.', 'sub': 'MORE CATTLE THAN PEOPLE', 'carimbo': '#2'},
    {'t': 'todos', 'titulo': 'All 50 states. ', 'destaque': 'Ranked.', 'fonte': 'OFFICIAL DATA · CENSUS · REALTOR.COM · FREDDIE MAC'},
]}

blocos = [
    {'cena': gancho,
     'falas': [f"In 2019, a typical home was affordable in {PASSAM19} of the 50 states.",
               f"Today? {PASSAM}.",
               f"In New York, the mortgage on a typical home would eat {p('New York')} percent of a family's income. Every month.",
               f"In Ohio? {p('Ohio')}.",
               "And number two isn't California. It's a state with more cattle than people.",
               "We ranked all fifty states with official data. Stay to the end and you'll see exactly where yours lands."]},
    {'cena': {'tipo': 'regras', 'titulo_regras': 'The 28% rule', 'quando': [[0, 30], [0, 90], [0, 150]], 'itens': ['Housing payment', 'no more than 28%', 'of gross monthly income']},
     'falas': ["Lenders have an old rule of thumb. Your housing payment shouldn't be more than twenty eight percent of what you earn before taxes.",
               "Go above it, and a home stops being a home and starts being a stretch."]},
    {'cena': {'tipo': 'regras', 'titulo_regras': 'The test', 'quando': [[1, 0], [1, 100], [2, 0], [3, 0]], 'itens': ['Typical listed home (Realtor.com)', 'Typical household income (Census, 2025)', f'10% down · 30 years · {JUROS:.2f}%', '= share of income, every month']},
     'falas': ["So we tested every state against it.",
               "The typical home listed for sale over the last twelve months. The typical household income, from the Census Bureau.",
               f"Ten percent down, a thirty year fixed mortgage at today's rate, {JUROS:.2f} percent, from Freddie Mac.",
               "And we didn't even count property taxes or insurance. The real number is higher than everything you're about to see."]},
    {'cena': {'tipo': 'serie', 'titulo': 'Mortgage on a typical U.S. home, as a share of income', 'serie': [[s[0], s[1]] for s in US], 'ymax': 45, 'yt': [0, 10, 20, 30, 40], 'ypre': '', 'ysuf': '%',
              'xt': [2017, 2019, 2021, 2023, 2025], 'alvo': 28, 'alvo_rotulo': '28% RULE', 'alvo_fala': 1,
              'fonte': 'Sources: Realtor.com median listing price, Census median household income, Freddie Mac 30-year rate, via FRED',
              'marcas': [{'data': '2021-01', 'v': 17.7, 'rotulo': '18%', 'sub': 'JAN 2021 · RATE 2.7%', 'fala': 2, 'lado': 'd'},
                         {'data': '2023-10', 'v': 38.3, 'rotulo': '38%', 'sub': 'OCT 2023 · RATE 7.6%', 'fala': 3, 'lado': 'e'},
                         {'data': US[-1][0], 'v': US[-1][1], 'rotulo': f'{US[-1][1]:.0f}%', 'sub': 'NOW', 'fala': 4, 'lado': 'e'}]},
     'falas': ["First, the whole country.",
               "This is the mortgage on a typical American home as a share of a typical income, every month since 2016. The red line is the twenty eight percent rule.",
               "In January 2021, rates were under three percent, and a typical home took about eighteen percent of income. Easy.",
               "Then rates tripled. By October 2023, the same math hit thirty eight percent.",
               f"Today it's around {US[-1][1]:.0f}. The country as a whole is above the line. But the country is an average. Your state isn't."]},

    # ---------------- capítulo 1 ----------------
    {'cena': {'tipo': 'capitulo', 'n': 1, 'titulo': 'Where a house still makes sense'},
     'falas': ["Part one. Where a house still makes sense."]},
    {'cena': mapa(faixa=[41, 50], painel=True, inicio=20, passo=10, ordem='desce', unid='%', dec=0, fundo_todos=False),
     'falas': [f"Only {PASSAM} states still pass the twenty eight percent test. Almost all of them are in the Midwest.",
               f"Indiana, at number forty one, misses by half a point."]},
    {'cena': estado('Ohio'),
     'falas': ["Number fifty, the most affordable state for a home in America: Ohio.",
               f"A typical listed home in Ohio costs about {mil(POR['Ohio']['preco'])} dollars. Less than half of California.",
               f"With a typical household income of {mil(POR['Ohio']['renda'][1])}, the mortgage takes {p('Ohio')} percent. Comfortably under the line."]},
    {'cena': estado('Illinois'),
     'falas': ["Number forty nine is the surprise. Illinois.",
               "Chicago is the third biggest city in America, and Illinois still has some of the most affordable homes in the country.",
               f"{p('Illinois')} percent of income."]},
    {'cena': mapa(faixa=[41, 50], foco=['Nebraska', 'Iowa', 'Kansas', 'Missouri', 'Maryland'], fundo_todos=False, mostrar_resto=False, rotulos=True, inicio=0, passo=0),
     'falas': ["Nebraska, Iowa, Kansas and Missouri follow, all around twenty five percent.",
               f"And Maryland is the odd one out at number forty three. Homes there aren't cheap, at {mil(POR['Maryland']['preco'])} dollars. But Maryland has one of the highest household incomes in the country, so it still squeaks under the line."]},

    # ---------------- capítulo 2 ----------------
    {'cena': {'tipo': 'capitulo', 'n': 2, 'titulo': 'Over the line'},
     'falas': ["Part two. Over the line."]},
    {'cena': mapa(faixa=[21, 40], inicio=10, passo=7, mostrar_resto=True, rotulos=False),
     'falas': [f"From forty down to twenty one, the share climbs from {p('Oklahoma')} percent to {p('Connecticut')}.",
               "Every one of these states fails the rule now. In 2019, every one of them passed."]},
    {'cena': estado('Texas'),
     'falas': ["Texas lands at thirty six.",
               f"Texas homes are cheaper than people think, around {mil(POR['Texas']['preco'])} dollars, and incomes are above average. {p('Texas')} percent.",
               "Over the line, but not by much."]},
    {'cena': estado('Mississippi'),
     'falas': ["Now look at Mississippi. Number twenty.",
               f"It has some of the cheapest homes in the country, around {mil(POR['Mississippi']['preco'])} dollars.",
               f"But it also has the lowest household income in the country. So even a cheap home takes {p('Mississippi')} percent. Cheap is relative."]},

    # ---------------- capítulo 3 ----------------
    {'cena': {'tipo': 'capitulo', 'n': 3, 'titulo': 'The breaking point'},
     'falas': ["Part three. The breaking point."]},
    {'cena': mapa(faixa=[11, 20], painel=True, inicio=20, passo=16, ordem='desce', unid='%', dec=0),
     'falas': ["From twenty to eleven, a typical home takes around forty percent of income.",
               "Florida, Arizona, Nevada, Colorado, Utah, Washington, and Tennessee are all in here."]},
    {'cena': estado('Florida'),
     'falas': ["Florida is number seventeen.",
               "For years, Florida was where people went to make their money go further. No state income tax, and homes cheaper than the Northeast.",
               f"Today a typical listed home there costs about {mil(POR['Florida']['preco'])} dollars, and the mortgage takes {p('Florida')} percent of income. Before insurance, which in Florida is a story of its own.",
               "And now, the top ten."]},
    {'cena': mapa(faixa=[1, 10], painel=True, ordem='desce', unid='%', dec=0, quando_rank={'10': [0, 20], '9': [0, 140], '8': [1, 10], '7': [1, 120], '6': [2, 10], '5': [3, 10], '4': [4, 10], '3': [4, 110], '2': [4, 10000], '1': [4, 10000]}),
     'falas': [f"Number ten, Wyoming. {p('Wyoming')} percent. Number nine, Rhode Island.",
               f"Number eight, New Mexico: homes around {mil(POR['New Mexico']['preco'])} dollars, but one of the lowest incomes in the country. Number seven, Oregon.",
               f"Number six, Massachusetts. Homes cost {mil(POR['Massachusetts']['preco'])} dollars, but Massachusetts also has the highest household income in America. {p('Massachusetts')} percent.",
               f"Number five, Idaho. {p('Idaho')} percent. Almost half of every paycheck.",
               f"Number four, Hawaii, at {p('Hawaii')}. And number three, California, at {p('California')}."]},
    {'cena': estado('Montana'),
     'falas': ["Number two. Montana.",
               "Montana has about one point one million people, and almost twice as many cattle.",
               f"But a typical home listed in Montana now costs about {mil(POR['Montana']['preco'])} dollars. And the typical household earns around {mil(POR['Montana']['renda'][1])}.",
               f"The mortgage would take {p('Montana')} percent of income. A hair above California."]},
    {'cena': estado('New York'),
     'falas': ["And number one. The hardest state in America to afford a typical home.",
               "New York.",
               f"A typical listed home: about {mil(POR['New York']['preco'])} dollars. A typical household income: about {mil(POR['New York']['renda'][1])}.",
               f"At today's rate, the mortgage alone is about {POR['New York']['parcela']:,.0f} dollars a month. {p('New York')} percent of income. Twice what the rule allows."]},

    {'cena': {'tipo': 'numero', 'valor': round(POR['New York']['parcela'] * 12 / 0.28, -3), 'dec': 0, 'prefixo': '$', 'sufixo': '', 'rotulo': 'a year, to pass the 28% rule in New York', 'cor': 'ruim', 'sem_icones': True},
     'falas': ["So how much would you need to earn to pass the twenty eight percent rule?",
               f"In New York, about {round(POR['New York']['parcela'] * 12 / 0.28 / 1000):,} thousand dollars a year. Twice what the typical household makes."]},
    {'cena': {'tipo': 'numero', 'valor': round(POR['Ohio']['parcela'] * 12 / 0.28, -3), 'dec': 0, 'prefixo': '$', 'sufixo': '', 'rotulo': 'a year, to pass the 28% rule in Ohio', 'cor': 'bom', 'sem_icones': True},
     'falas': [f"In Ohio? About {round(POR['Ohio']['parcela'] * 12 / 0.28 / 1000):,} thousand. Less than the typical Ohio household already earns."]},

    # ---------------- capítulo 4 ----------------
    {'cena': {'tipo': 'capitulo', 'n': 4, 'titulo': 'What changed'},
     'falas': ["Part four. What changed."]},
    {'cena': {'tipo': 'dispersao', 'titulo': 'Then vs. now: share of income for a typical home',
              'pontos': [{'nome': o['nome'], 'ab': o['st'], 'x': o['pct19'], 'y': o['pct'], 'v': o['pct']} for o in C],
              'xr': [12, 35], 'yr': [20, 58], 'xt': [15, 20, 25, 30, 35], 'yt': [20, 28, 35, 45, 55], 'xl': 'SHARE OF INCOME IN 2019 (RATE 3.9%)', 'yl': 'TODAY', 'xsuf': '%', 'ysuf': '%',
              'perigo': [35, 58], 'perigo_rotulo': '', 'foco': ['NY', 'MT', 'CA', 'HI', 'ID', 'WY', 'NM', 'OH', 'IL'], 'min': MIN, 'max': MAX},
     'falas': ["Here's every state, then and now. Across the bottom, 2019. Up the side, today.",
               f"In 2019, only California and Hawaii were over the line. Everyone else was fine.",
               f"Since then, Wyoming went from {POR['Wyoming']['pct19']:.0f} percent to {p('Wyoming')}. Montana from {POR['Montana']['pct19']:.0f} to {p('Montana')}. Idaho from {POR['Idaho']['pct19']:.0f} to {p('Idaho')}.",
               "The states that got hit hardest weren't the expensive coasts. Many of them were the cheap, quiet states people moved to when they could work from anywhere. Prices went up there, incomes didn't keep up, and then rates doubled."]},
    {'cena': {'tipo': 'barras', 'titulo': 'States that pass the 28% rule, by mortgage rate', 'unid': ' states', 'dec': 0, 'max_v': 52,
              'itens': [{'r': f'{JUROS:.2f}% · today', 'v': ESC[0], 'cor': '#e5484d'}, {'r': '6%', 'v': ESC[1], 'cor': '#e9874a'}, {'r': '5%', 'v': ESC[2], 'cor': '#e9c46a'},
                        {'r': '4%', 'v': ESC[3], 'cor': '#9cc46a'}, {'r': '3%', 'v': ESC[4], 'cor': '#7bc47f'}]},
     'falas': ["So what would fix it? We reran every state at lower rates.",
               f"At today's rate, {ESC[0]} states pass. At six percent, {ESC[1]}. At five, {ESC[2]}.",
               f"At four percent, {ESC[3]}. And at three percent, where rates were in 2021, {ESC[4]} states would pass again.",
               f"But even at zero percent interest, a typical New York home would still take {POR['New York']['pct0']:.0f} percent of income. In some places, the rate isn't the problem. The price is."]},
    {'cena': {'tipo': 'texto', 'linhas': ['One caveat', 'Listing prices, not sale prices', 'Taxes and insurance not included']},
     'falas': ["One honest caveat. We used listing prices, not final sale prices, and listings in places like Montana include a lot of high end homes. And we left out taxes and insurance, which would push every number higher. The ranking at the top holds either way."]},
    {'cena': mapa(faixa=[1, 50], inicio=10, passo=0.8, rotulos=False),
     'falas': [f"So in 2019, {PASSAM19} states passed the test. Today, {PASSAM} do.",
               "And the last state standing? Ohio. Where a typical home still costs less than a quarter of a paycheck."]},
    {'cena': {'tipo': 'fim', 'pergunta': 'Could you afford a home in your state?', 'cta': 'SUBSCRIBE FOR THE NEXT RANKING', 'faixa_cores': ['rgb(70,110,150)', 'rgb(120,130,140)', 'rgb(230,160,60)', 'rgb(235,70,50)', 'rgb(190,25,40)']},
     'falas': ["Could you afford a typical home in your state? Tell us in the comments. And subscribe for the next ranking."]},
]

spec = {'id': 'lss002', 'canal': 'last-state-standing', 'marca': 'LAST STATE STANDING', 'acento': '#ff6b3d', 'icone': 'barras', 'legenda': True,
        'titulo': 'Could You Afford a House in Your State? (All 50 Ranked)', 'voz': 'am_michael', 'velocidade': 1.0, 'blocos': blocos}
json.dump(spec, open(os.path.join(AQUI, 'spec.json'), 'w'), indent=1)
falas = [f for b in blocos for f in b['falas']]
pal = sum(len(f.split()) for f in falas)
print(len(blocos), 'cenas', len(falas), 'falas', pal, 'palavras ~', round(pal / 160, 1), 'min')
print('passam', PASSAM19, '->', PASSAM, 'juros', JUROS)
for o in C[:12]: print(o['rank'], o['nome'], round(o['pct']), round(o['pct19']))

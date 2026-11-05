"""Last State Standing #001: If gas hit $10. Dados: EIA SEDS 2024 (gasolina vendida por estado, população) e BEA 2025 (renda per capita)."""
import json, os

AQUI = os.path.dirname(os.path.abspath(__file__))
G = json.load(open('/home/claude/last-state-standing/dados/gas10.json'))  # ordenado: rank 1 = pior
for k, g in enumerate(G):
    g['rank'] = k + 1
POR = {g['nome']: g for g in G}
EST = [{'nome': g['nome'], 'v': g['pct10'], 'rank': g['rank']} for g in G]
MIN, MAX = min(g['pct10'] for g in G), max(g['pct10'] for g in G)
US_GAL = 406
SER = json.load(open('/home/claude/last-state-standing/dados/gas_serie.json'))
HOJE = SER['ultimo'][1]
base = {'estados': EST, 'min': MIN, 'max': MAX, 'leg_min': f'{MIN:.0f}% of income', 'leg_max': f'{MAX:.0f}%'}

def mapa(**kw):
    return {'tipo': 'eua', **base, **kw}

def estado(nome, extra=None):
    g = POR[nome]
    linhas = [{'r': 'Gallons per person, per year', 'v': f"{g['gal']:.0f}"}, {'r': 'Income per person', 'v': f"${g['renda']:,.0f}"},
              {'r': 'Gas at $10, per person, per year', 'v': f"${g['custo10']:,} · {g['pct10']:.1f}%"}]
    return {'tipo': 'estado', **base, 'nome': nome, 'linhas': linhas}

def n(nome, campo='pct10', dec=1):
    return f"{POR[nome][campo]:.{dec}f}"

blocos = [
    {'cena': mapa(faixa=[1, 50], inicio=30, passo=1.2, legenda=False),
     'falas': ["It's Monday morning. Gas just hit ten dollars a gallon. Not for a day. For good.",
               "In some states, people grumble and keep driving. In others, the math stops working by Friday."]},
    {'cena': {'tipo': 'texto', 'linhas': ['$10 a gallon', 'All 50 states', 'Ranked']},
     'falas': ["We took the official numbers for all fifty states: how much gasoline people actually burn, and how much they actually earn.",
               "Then we ranked them, from the state that barely notices to the state that breaks first.",
               "And the state everyone pictures when you say long drives, empty highways, big trucks? It doesn't even make the top fifteen."]},
    {'cena': {'tipo': 'regras', 'itens': ['Gallons sold per person (EIA, 2024)', 'Income per person (BEA, 2025)', 'Gallons × $10 ÷ income', '= share of income into the tank']},
     'falas': ["Two numbers decide this. Gallons of gasoline sold per person each year, from the U.S. Energy Information Administration.",
               "And income per person, from the Bureau of Economic Analysis.",
               "Multiply the gallons by ten dollars, divide by income.",
               "That's the share of everything a person earns that would go straight into the tank."]},
    {'cena': {'tipo': 'numero', 'valor': US_GAL * 10, 'dec': 0, 'prefixo': '$', 'sufixo': '', 'rotulo': 'per person, per year, at $10 a gallon', 'cor': 'neutro', 'sem_icones': True},
     'falas': [f"The national average is about {US_GAL} gallons per person. At ten dollars, that's around four thousand dollars a year, for every man, woman and child."]},
    {'cena': {'tipo': 'serie', 'titulo': 'Regular gas, U.S. average, 1990 to today', 'serie': SER['serie'], 'ymax': 11, 'yt': [0, 2, 4, 6, 8, 10], 'xt': [1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025], 'alvo_fala': 5,
              'fonte': 'Source: U.S. Energy Information Administration, weekly retail price, via FRED',
              'marcas': [{'data': '2002-01', 'v': 1.10, 'rotulo': '$1.10', 'sub': 'JAN 2002', 'fala': 2, 'lado': 'd'},
                         {'data': '2008-07', 'v': 4.11, 'rotulo': '$4.11', 'sub': 'JUL 2008', 'fala': 2, 'atraso': 60, 'lado': 'e'},
                         {'data': '2022-06', 'v': 5.01, 'rotulo': '$5.01', 'sub': 'JUN 2022 · RECORD', 'fala': 3, 'lado': 'e'},
                         {'data': SER['serie'][-1][0], 'v': HOJE, 'rotulo': f'${HOJE:.2f}', 'sub': 'NOW', 'fala': 4, 'lado': 'e'}]},
     'falas': ["But how far away is ten dollars, really?",
               "This is the average price of regular gas in America, every week since 1990, from the Energy Information Administration.",
               "In January 2002, it was one dollar and ten cents. Six years later, in July 2008, it hit four eleven. It almost quadrupled.",
               "Then, in June 2022, just over five dollars, the highest weekly national average ever printed. And adjusted for inflation, 2008 was even worse: four eleven back then is about six thirty in today's money.",
               f"Right now, in early November 2026, the national average is {HOJE:.2f} dollars.",
               "So ten dollars is about two and a half times today's price. Far away. But this chart has moved that fast before."]},

    # ---------------- capítulo 1 ----------------
    {'cena': {'tipo': 'capitulo', 'n': 1, 'titulo': 'The states that barely notice'},
     'falas': ["Part one. The states that barely notice."]},
    {'cena': mapa(faixa=[41, 50], painel=True, inicio=20, passo=10, ordem='desce', unid='%', dec=1, fundo_todos=False),
     'falas': ["These are the ten states where ten dollar gas hurts the least.",
               "Most of them have two things in common: people earn more than average, and many of them don't need a car every day."]},
    {'cena': estado('New York'),
     'falas': [f"Number fifty, the state that would notice least: New York.",
               f"New Yorkers burn just {n('New York', 'gal', 0)} gallons of gas per person a year, the lowest in the country.",
               "Most households in New York City don't own a car at all. For millions of people, the subway is the gas tank.",
               f"At ten dollars a gallon, gas would take {n('New York')} percent of income. Painful, but survivable."]},
    {'cena': mapa(faixa=[41, 50], foco=['Massachusetts', 'Washington', 'California', 'Hawaii', 'Alaska'], fundo_todos=False, mostrar_resto=False, rotulos=True, inicio=0, passo=0),
     'falas': [f"Massachusetts, Washington and California come next, all around three and a half percent. California already has some of the most expensive gas in the country, and it still lands near the bottom. High incomes, and only {n('California', 'gal', 0)} gallons per person.",
               f"Hawaii is forty sixth. On an island, you can only drive so far.",
               f"And Alaska, the biggest state of all, sits at number forty two. Most Alaskans live in a handful of cities, and the state capital, Juneau, can't even be reached by road."]},

    # ---------------- capítulo 2 ----------------
    {'cena': {'tipo': 'capitulo', 'n': 2, 'titulo': 'The middle of the map'},
     'falas': ["Part two. The middle of the map."]},
    {'cena': mapa(faixa=[21, 40], inicio=10, passo=7, mostrar_resto=True, rotulos=False),
     'falas': [f"From forty down to twenty one, the share of income climbs from {n('Colorado')} percent to {n('Maine')} percent.",
               f"Florida lands at thirty five. Texas, a state built around the car, is only twenty fourth: Texans burn {n('Texas', 'gal', 0)} gallons a person, but earn enough to absorb it.",
               "And this is where the pattern starts to show. The problem isn't only how far people drive. It's what they earn while they drive it."]},
    {'cena': estado('Wyoming'),
     'falas': ["Which brings us to the state you were probably expecting near the top.",
               f"Wyoming. Ranches, mines, and hours of empty highway. Wyomingites burn {n('Wyoming', 'gal', 0)} gallons of gas per person, the second most in America.",
               f"But Wyoming is also one of the richest states per person, at about ninety thousand dollars.",
               f"So at ten dollar gas, it lands at number nineteen. Expensive. Not broken."]},

    # ---------------- capítulo 3 ----------------
    {'cena': {'tipo': 'capitulo', 'n': 3, 'titulo': 'The breaking point'},
     'falas': ["Part three. The breaking point."]},
    {'cena': mapa(faixa=[11, 20], painel=True, inicio=20, passo=16, ordem='desce', unid='%', dec=1),
     'falas': ["From twenty to eleven, ten dollar gas eats around seven percent of every paycheck.",
               "South Dakota, Wyoming, Kansas, Georgia, Montana, Delaware, North Carolina, Tennessee, North Dakota, and Iowa.",
               "And now, the top ten."]},
    {'cena': mapa(faixa=[1, 10], painel=True, ordem='desce', unid='%', dec=1, quando_rank={'10': [0, 20], '9': [1, 10], '8': [1, 120], '7': [2, 10], '6': [2, 80], '5': [3, 10], '4': [3, 70], '3': [4, 10], '2': [4, 10000], '1': [4, 10000]}),
     'falas': [f"Number ten, Oklahoma. {n('Oklahoma', 'gal', 0)} gallons per person. {n('Oklahoma')} percent.",
               f"Number nine, New Mexico, at {n('New Mexico')}. Number eight, West Virginia: West Virginians burn about the national average in gas, but they earn the second lowest income in the country. {n('West Virginia')} percent.",
               f"Number seven, Louisiana. Number six, Missouri, at {n('Missouri')}.",
               f"Number five, Kentucky. Number four, Arkansas. Both right around eight percent.",
               f"And number three, South Carolina: {n('South Carolina', 'gal', 0)} gallons a person. {n('South Carolina')} percent of income gone."]},
    {'cena': estado('Mississippi'),
     'falas': ["Number two. Mississippi.",
               f"Mississippi has the lowest income per person in the United States: about {POR['Mississippi']['renda'] / 1000:.0f} thousand dollars.",
               f"And Mississippians burn {n('Mississippi', 'gal', 0)} gallons of gas a year each, well above the national average.",
               f"At ten dollars a gallon, that's {n('Mississippi')} percent of everything they earn. More than one dollar of every ten."]},
    {'cena': estado('Alabama'),
     'falas': ["And number one. The first state to break.",
               f"Alabama. In our numbers, Alabama sells more gasoline per person than any other state: {n('Alabama', 'gal', 0)} gallons a year.",
               f"Its income per person is the third lowest in the country.",
               f"At ten dollars a gallon, gas would cost every Alabamian about {POR['Alabama']['custo10']:,} dollars a year. {n('Alabama')} percent of their income. More than three times the share New Yorkers would pay.",
               f"Compared with today's national average, that's about {POR['Alabama']['gal'] * (10 - HOJE):,.0f} extra dollars a year, for every single person in the state."]},

    # ---------------- capítulo 4 ----------------
    {'cena': {'tipo': 'capitulo', 'n': 4, 'titulo': 'The real pattern'},
     'falas': ["Part four. The real pattern."]},
    {'cena': {'tipo': 'dispersao', 'titulo': 'Gas burned vs. money earned', 'pontos': [{'nome': g['nome'], 'ab': g['ab'], 'x': g['gal'], 'y': g['renda'], 'v': g['pct10']} for g in G],
              'xr': [240, 660], 'yr': [50000, 102000], 'xt': [300, 400, 500, 600], 'yt': [50000, 60000, 70000, 80000, 90000, 100000], 'xl': 'GALLONS OF GAS PER PERSON, PER YEAR', 'yl': 'INCOME PER PERSON',
              'perigo': [470, 66000], 'foco': ['AL', 'MS', 'SC', 'AR', 'KY', 'LA', 'WV', 'OK', 'WY', 'NY'], 'min': MIN, 'max': MAX},
     'falas': ["Put every state on one chart. Gas burned on one side, money earned on the other.",
               "The danger zone is the bottom right corner: lots of gas, not much money.",
               "That's where Alabama, Mississippi, South Carolina, Arkansas and Kentucky sit. Wyoming burns almost as much as Alabama, but floats high above it on income. New York sits alone on the far left.",
               "Eight of the ten states that break first are in the South. Not because of one number, but because two numbers stack: more gallons, and less income to pay for them."]},
    {'cena': {'tipo': 'texto', 'linhas': ['One caveat', 'Gas is counted where it is sold', 'Trucks and travelers included']},
     'falas': ["One honest caveat. These numbers count gasoline where it's sold. That includes trucks passing through and travelers filling up, so states on busy highways can look a little thirstier than their residents really are. The ranking at the very top holds either way: low income plus long distances is the combination that breaks first."]},
    {'cena': mapa(faixa=[1, 50], inicio=10, passo=0.8, rotulos=False),
     'falas': ["So, if gas ever hits ten dollars, the first states to feel it won't be the ones with the longest highways. They'll be the ones with the smallest paychecks.",
               "And the last state standing? New York. Thanks to a subway."]},
    {'cena': {'tipo': 'fim', 'pergunta': 'Where does your state land?', 'cta': 'SUBSCRIBE FOR THE NEXT RANKING', 'faixa_cores': ['rgb(70,110,150)', 'rgb(120,130,140)', 'rgb(230,160,60)', 'rgb(235,70,50)', 'rgb(190,25,40)']},
     'falas': ["Where does your state land? Tell us in the comments. And subscribe for the next ranking."]},
]

spec = {'id': 'lss001', 'canal': 'last-state-standing', 'marca': 'LAST STATE STANDING', 'acento': '#ff6b3d', 'icone': 'barras',
        'titulo': 'If Gas Hit $10, These States Break First (All 50 Ranked)', 'voz': 'am_michael', 'velocidade': 1.0, 'blocos': blocos}
json.dump(spec, open(os.path.join(AQUI, 'spec.json'), 'w'), indent=1)
falas = [f for b in blocos for f in b['falas']]
pal = sum(len(f.split()) for f in falas)
print(len(blocos), 'cenas', len(falas), 'falas', pal, 'palavras ~', round(pal / 150, 1), 'min')

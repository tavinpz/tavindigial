"""LSS #003 (composição Arte): uma semana de 122 °F (50 °C) em todos os estados. Qual quebra primeiro?
Dados: dados/calor/calor.json (base.py). Ar-condicionado por estado: EIA, Residential Energy Consumption Survey 2020
(tabela State Air Conditioning). Recordes de calor: NOAA State Climate Extremes Committee (via Wikipedia).
Onda de calor de 2021: Washington contou 112 mortes (KUOW, 19/07/2021). Ranking = maior % de casas SEM ar-condicionado
(desempate: recorde de calor mais baixo, ou seja, menos preparado).
"""
import json, os

C = json.load(open('/home/claude/estudio-longo/last-state-standing/dados/calor/calor.json'))
POR = {o['uf']: o for o in C}
NOME = lambda st: POR[st]['nome'].upper()
SEM = {o['uf']: o['pct_sem'] for o in C}
TOP = [o['uf'] for o in C[:10]]
assert TOP == ['AK', 'WA', 'HI', 'MT', 'VT', 'ME', 'WY', 'CA', 'OR', 'NH'], TOP
CHEIOS = [o['uf'] for o in C if o['pct_ac'] >= 95]
assert len(CHEIOS) == 13
ACIMA = [o['uf'] for o in C if o['rec'] >= 122]
NUNCA110 = sum(o['rec'] < 110 for o in C)
SEM_TOT = sum(o['sem_ac_mi'] for o in C)
p = lambda st: POR[st]['pct_sem']


def F(t, v): return (t, v)
def mapa(**kw): return {"tipo": "mapa", **kw}
def rank(st, **kw): return {"tipo": "rank", "pos": f"#{POR[st]['rank']}", "nome": NOME(st), "uf": st, **kw}


PTS = [[o['uf'], o['rec'], o['pct_ac'], o['rank']] for o in C]
EIX = {"x": [98, 136], "y": [0, 100], "xt": [100, 110, 120, 130], "yt": [0, 25, 50, 75, 100], "xl": "STATE RECORD HIGH °F (→) · HOMES WITH AC (↑)", "xf": "{}°", "yf": "{}%", "linha": 122, "linha_txt": "122°F"}

intro = [
    F("A hundred and twenty two degrees Fahrenheit. Fifty degrees Celsius.", {"tipo": "numero", "txt": "122°F", "rotulo": "50°C"}),
    F("It sounds impossible. It isn't.", mapa(calor={o['uf']: o['rec'] for o in C}, pergunta="RECORD HIGHS")),
    F("Four states have already gone past it. California, Arizona, Nevada and New Mexico.", mapa(destaque=ACIMA, sticker={"txt": "122°F+"})),
    F("Death Valley hit a hundred and thirty four, back in nineteen thirteen.", rank('CA', pos="134°F", sub="DEATH VALLEY · 1913")),
    F("And in twenty twenty one, a heat wave pushed Washington State to a hundred and twenty.", rank('WA', pos="120°F", sub="HANFORD · JUNE 2021")),
    F("A state where a lot of people never needed air conditioning.", {"tipo": "icones2", "a": "casa", "b": "fogo", "txt": "NO AC"}),
    F("Washington's health department counted a hundred and twelve heat deaths.", {"tipo": "numero", "txt": "112", "rotulo": "HEAT DEATHS · WASHINGTON · 2021"}),
    F("So here's the experiment. One week. A hundred and twenty two degrees. In every state at once.", mapa(grade=True, pergunta="ONE WEEK · 122°F · EVERYWHERE")),
    F("Which state breaks first?", mapa(misterio=True)),
]

regras = [
    F("We used official numbers for all fifty states.", {"tipo": "placa", "titulo": "ALL 50 RANKED", "txt": "Official numbers, every state", "fonte": "EIA Residential Energy Survey · NOAA"}),
    F("In heat like that, one thing decides who's in danger. Can you cool your home?", {"tipo": "icones2", "a": "casa", "b": "neve", "txt": "CAN YOU COOL DOWN?"}),
    F("So we ranked every state by the share of homes with no air conditioning at all. Not even a window unit.", {"tipo": "placa", "titulo": "THE RULE", "txt": "Share of homes with no AC at all", "fonte": "EIA RECS 2020"}),
    F("And we looked at one more thing. How hot each state has ever been.", mapa(calor={o['uf']: o['rec'] for o in C}, pergunta="HOTTEST EVER")),
    F(f"Because {NUNCA110} states have never even reached a hundred and ten.", {"tipo": "numero", "txt": f"{NUNCA110}", "rotulo": "STATES THAT NEVER HIT 110°F"}),
    F("Their houses, their roads and their power lines were never built for this.", {"tipo": "icones2", "a": "predio", "b": "raio", "txt": "NOT BUILT FOR THIS"}),
]

c1 = [
    F("Part one. The states that stay cool.", {"tipo": "capitulo", "n": "PART ONE", "txt": "THE STATES THAT STAY COOL"}),
    F(f"In {len(CHEIOS)} states, at least ninety five percent of homes have air conditioning.", mapa(destaque=CHEIOS, sticker={"txt": "95%+ AC"})),
    F(f"Florida, {POR['FL']['pct_ac']} percent. Texas, {POR['TX']['pct_ac']}.", {"tipo": "lista", "itens": [[POR['FL']['rank'], "FLORIDA · HOMES WITH AC", POR['FL']['pct_ac']], [POR['TX']['rank'], "TEXAS · HOMES WITH AC", POR['TX']['pct_ac']]]}),
    F("No surprise there. They live with heat every summer.", {"tipo": "icones2", "a": "ilha", "b": "fogo", "txt": "HEAT EVERY SUMMER"}),
    F("But here's one that is a surprise.", mapa(misterio=True)),
    F(f"Iowa. {POR['IA']['pct_ac']} percent of homes have air conditioning.", rank('IA', pos=f"{POR['IA']['pct_ac']}%", sub="HOMES WITH AC")),
    F(f"That's more than Arizona, at {POR['AZ']['pct_ac']}.", {"tipo": "barras", "titulo": "HOMES WITH AIR CONDITIONING", "max": 100, "unid": "%", "itens": [["IOWA", POR['IA']['pct_ac'], "#7bc47f"], ["ARIZONA", POR['AZ']['pct_ac'], "#e9874a"]]}),
    F(f"Iowa's record high is {POR['IA']['rec']} degrees. Midwest summers are humid and brutal, and people there learned that a long time ago.", rank('IA', pos=f"{POR['IA']['rec']}°F", sub=f"RECORD HIGH · {POR['IA']['rec_ano']}")),
    F(f"Illinois and New Jersey are at {POR['IL']['pct_ac']} percent. Delaware, {POR['DE']['pct_ac']}.", {"tipo": "barras", "titulo": "HOMES WITH AIR CONDITIONING", "max": 100, "unid": "%", "itens": [["ILLINOIS", POR['IL']['pct_ac'], "#7bc47f"], ["NEW JERSEY", POR['NJ']['pct_ac'], "#7bc47f"], ["DELAWARE", POR['DE']['pct_ac'], "#7bc47f"]]}),
    F("In these states, a week at a hundred and twenty two would be miserable. But most people could close the door and turn on the AC.", {"tipo": "icones2", "a": "casa", "b": "neve", "txt": "CLOSE THE DOOR"}),
]

c2 = [
    F("Part two. The biggest number.", {"tipo": "capitulo", "n": "PART TWO", "txt": "THE BIGGEST NUMBER"}),
    F(f"Across the whole country, about {round(SEM_TOT)} million homes have no air conditioning.", {"tipo": "numero", "txt": f"{round(SEM_TOT)}M", "rotulo": "U.S. HOMES WITH NO AC"}),
    F("And one state has more of them than anywhere else. By far.", mapa(misterio=True)),
    F(f"California. Only {p('CA')} percent of homes have no AC. That doesn't sound like much.", rank('CA', pos=f"{p('CA')}%", sub="HOMES WITH NO AC")),
    F(f"But California is huge. That's {POR['CA']['sem_ac_mi']} million homes.", {"tipo": "numero", "txt": f"{POR['CA']['sem_ac_mi']}M", "rotulo": "CALIFORNIA HOMES WITH NO AC"}),
    F(f"More homes than the entire state of Washington has, with or without AC.", {"tipo": "barras", "titulo": "MILLIONS OF HOMES", "max": 4, "unid": "M", "itens": [["CALIFORNIA · NO AC", POR['CA']['sem_ac_mi'], "#e5484d"], ["WASHINGTON · ALL HOMES", POR['WA']['casas_mi'], "#e9c46a"]]}),
    F("Along much of the coast, people never needed it. The ocean did the cooling for free.", {"tipo": "icones2", "a": "ilha", "b": "casa", "txt": "THE OCEAN WAS THE AC"}),
    F(f"New York has about {round(POR['NY']['sem_ac_mi'] * 1000):,} thousand homes with no AC. And of the ones that have it, most are window units.", {"tipo": "numero", "txt": f"{POR['NY']['sem_ac_mi']}M", "rotulo": "NEW YORK HOMES WITH NO AC"}),
    F(f"Only {POR['NY']['central']} percent of New York homes have central air.", rank('NY', pos=f"{POR['NY']['central']}%", sub="HOMES WITH CENTRAL AIR")),
]

c3 = [
    F("Part three. The top ten. These are the states that break first.", {"tipo": "capitulo", "n": "TOP 10", "txt": "THE STATES THAT BREAK FIRST"}),
    F(f"Number ten. New Hampshire. {p('NH')} percent of homes with no AC.", rank('NH', sub=f"{p('NH')}% NO AC")),
    F(f"Number nine. Oregon. {p('OR')} percent. And Oregon already got a taste of this, in twenty twenty one.", rank('OR', sub=f"{p('OR')}% NO AC · 119°F IN 2021")),
    F(f"Number eight. California, with the most homes at risk.", rank('CA', sub=f"{p('CA')}% NO AC · 3.6M HOMES")),
    F(f"Number seven. Wyoming. {p('WY')} percent.", rank('WY', sub=f"{p('WY')}% NO AC")),
    F(f"Number six. Maine. {p('ME')} percent. Its record high is a hundred and five.", rank('ME', sub=f"{p('ME')}% NO AC · RECORD 105°F")),
    F(f"Number five. Vermont. {p('VT')} percent. And only {POR['VT']['central']} percent of homes have central air.", rank('VT', sub=f"{p('VT')}% NO AC · {POR['VT']['central']}% CENTRAL")),
    F(f"Number four. Montana. {p('MT')} percent.", rank('MT', sub=f"{p('MT')}% NO AC")),
    F(f"Number three. Hawaii. {p('HI')} percent. The trade winds have done the job for generations. Its record is just a hundred.", rank('HI', sub=f"{p('HI')}% NO AC · RECORD 100°F")),
    F(f"Number two. Washington. {p('WA')} percent. Almost half the state.", rank('WA', sub=f"{p('WA')}% NO AC")),
    F("The state that already saw a hundred and twenty, and lost a hundred and twelve people.", {"tipo": "numero", "txt": "112", "rotulo": "HEAT DEATHS · WASHINGTON · 2021"}),
    F("And the state that breaks first.", mapa(misterio=True)),
    F(f"Alaska. {p('AK')} percent of homes have no air conditioning.", rank('AK', sub=f"{p('AK')}% NO AC")),
    F("Alaska's record high is exactly one hundred degrees, set at Fort Yukon in nineteen fifteen.", rank('AK', pos="100°F", sub="FORT YUKON · 1915")),
    F("A hundred and twenty two would beat that record by twenty two degrees. In a state built to keep heat in, not out.", {"tipo": "numero", "txt": "+22°F", "rotulo": "ABOVE ALASKA'S ALL-TIME RECORD"}),
]

c4 = [
    F("Part four. The pattern.", {"tipo": "capitulo", "n": "PART FOUR", "txt": "THE PATTERN"}),
    F("Here's every state. Across the bottom, its hottest day ever. Up the side, the share of homes with AC.", {"tipo": "dispersao", "pts": PTS, "eixos": EIX}),
    F("The states that have felt real heat bought air conditioning. The ones that never did, didn't.", {"tipo": "dispersao", "pts": PTS, "eixos": EIX, "foco": ["AK", "HI", "WA", "VT", "ME"]}),
    F("That made sense for a hundred years.", {"tipo": "icones2", "a": "calendario", "b": "casa", "txt": "IT MADE SENSE"}),
    F("But look at where the new records are being set.", mapa(destaque=[o['uf'] for o in C if o['rec_ano'] >= 2019], sticker={"txt": "RECORDS SINCE 2019"})),
    F("Colorado in twenty nineteen. Oregon, Washington and Utah in twenty twenty one.", {"tipo": "barras", "titulo": "NEW STATE RECORD HIGHS · °F", "max": 125, "unid": "°", "itens": [["COLORADO · 2019", POR['CO']['rec'], "#e9874a"], ["OREGON · 2021", POR['OR']['rec'], "#e5484d"], ["WASHINGTON · 2021", POR['WA']['rec'], "#e5484d"], ["UTAH · 2021", POR['UT']['rec'], "#e5484d"]]}),
    F("The heat is moving to the places that are least ready for it.", mapa(calor=SEM, pergunta="HOMES WITH NO AC")),
]

fim = [
    F("So which state breaks first? Alaska. Then Washington. Then Hawaii.", {"tipo": "lista", "itens": [[1, "ALASKA · NO AC", p('AK')], [2, "WASHINGTON · NO AC", p('WA')], [3, "HAWAII · NO AC", p('HI')]]}),
    F("And the state with the most people at risk is California.", rank('CA', sub="3.6M HOMES WITH NO AC")),
    F("Does your home have air conditioning? And where do you live? Tell us in the comments.", {"tipo": "icones2", "a": "casa", "b": "balao", "txt": "TELL US"}),
    F("And subscribe. Next week, another stress test for all fifty states.", {"tipo": "fim"}),
]

spec = {
    "id": "lss003a", "canal": "last-state-standing", "titulo": "A Week of 122°F in Every State. Which One Breaks First?",
    "voz": "cw", "velocidade": 1.0, "lang": "en-us", "legenda": True, "acento": "#ff6b3d", "marca": "LAST STATE STANDING", "trilha": 0.14, "cauda": 4.0,
    "numeros": {"a hundred and twenty two degrees Fahrenheit": "122°F", "fifty degrees Celsius": "50°C", "a hundred and thirty four": "134", "nineteen thirteen": "1913",
                "twenty twenty one": "2021", "a hundred and twenty two": "122", "a hundred and twenty": "120", "a hundred and twelve": "112", "a hundred and ten": "110",
                "a hundred and five": "105", "a hundred": "100", "one hundred": "100", "nineteen fifteen": "1915", "twenty two": "22", "twenty nineteen": "2019",
                "ninety five percent": "95%"},
    "blocos": [],
}
nomes = {2: 'The states that stay cool', 3: 'The biggest number', 4: 'The states that break first', 5: 'The pattern'}
for i, cap in enumerate([intro, regras, c1, c2, c3, c4, fim]):
    cena = {"tipo": "capitulo" if i in nomes else "arte", "v": [v for _, v in cap]}
    if i in nomes: cena.update({"n": i - 1, "titulo": nomes[i]})
    spec["blocos"].append({"cena": cena, "falas": [t for t, _ in cap]})
json.dump(spec, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'spec.json'), 'w'), ensure_ascii=False, indent=1)
txt = ' '.join(t for b in spec['blocos'] for t in b['falas'])
print(len(txt.split()), 'palavras', sum(len(b['falas']) for b in spec['blocos']), 'falas', 'sem AC total', round(SEM_TOT, 2), 'nunca 110', NUNCA110)

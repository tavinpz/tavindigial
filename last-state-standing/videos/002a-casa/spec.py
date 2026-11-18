"""Last State Standing #002 (composição Arte): a casa típica cabe na renda, nos 50 estados?
Dados (FRED): preço mediano de anúncio por estado (Realtor.com), renda mediana domiciliar (Census, 2025),
juros 30 anos (Freddie Mac). Conta: 10% de entrada, 30 anos fixo, só principal + juros ÷ renda mensal.
Regra dos 28%: a prestação não deve passar de 28% da renda bruta. Cada fala = um visual.
"""
import json, os

D = '/home/claude/last-state-standing/dados/casa/'
C = json.load(open(D + 'casa.json'))
C.sort(key=lambda o: -o['pct'])
for k, o in enumerate(C): o['rank'] = k + 1
POR = {o['st']: o for o in C}
JUROS = float(open(D + 'hip.csv').read().strip().split('\n')[-1].split(',')[1])
US = json.load(open(D + 'us_serie.json'))
PASSAM = sum(o['pct'] <= 28 for o in C)
PASSAM19 = sum(o['pct19'] <= 28 for o in C)
CAL = {o['st']: o['pct'] for o in C}
assert (PASSAM19, PASSAM) == (48, 9), (PASSAM19, PASSAM)


def parcela(L, taxa):
    r = taxa / 100 / 12
    return L * r / (1 - (1 + r) ** -360) if r else L / 360


ESC = [sum(parcela(o['preco'] * 0.9, t) / (o['renda'][1] / 12) <= 0.28 for o in C) for t in (JUROS, 6, 5, 4, 3)]
NY0 = parcela(POR['NY']['preco'] * 0.9, 0) / (POR['NY']['renda'][1] / 12) * 100
p = lambda st: f"{POR[st]['pct']:.0f}"
p19 = lambda st: f"{POR[st]['pct19']:.0f}"
mil = lambda v: f"{round(v / 1000):,}"
NOME = lambda st: POR[st]['nome'].upper()
SERIE = [[s[0], s[1]] for s in US]
PRECISA = lambda st: round(POR[st]['parcela'] * 12 / 0.28, -3)


def F(t, v): return (t, v)
def mapa(**kw): return {"tipo": "mapa", **kw}
def rank(st, **kw): return {"tipo": "rank", "pos": f"#{POR[st]['rank']}", "nome": NOME(st), "uf": st, **kw}
def recibo(st, **kw): return {"tipo": "conta", "cab": f"* {NOME(st)} *", "quem": "typical home · 10% down · 30 years", "linha": f"${mil(POR[st]['preco'])}K home",
                              "txt": f"{p(st)}%", "rotulo": "of household income, every month", "emoji": "casa", **kw}


intro = [
    F(f"In 2019, a typical home was affordable in {PASSAM19} of the fifty states.", {"tipo": "numero", "txt": f"{PASSAM19} / 50", "rotulo": "STATES WHERE A TYPICAL HOME FIT · 2019"}),
    F(f"Today? {PASSAM}.", {"tipo": "numero", "txt": f"{PASSAM} / 50", "rotulo": "TODAY"}),
    F(f"In New York, the mortgage on a typical home would eat {p('NY')} percent of a family's income.", recibo('NY')),
    F("Every single month.", {"tipo": "icones2", "a": "calendario", "b": "dinheiro", "txt": "EVERY MONTH"}),
    F(f"In Ohio, {p('OH')}.", recibo('OH')),
    F("And the number two state isn't California.", mapa(destaque=["CA"], sticker={"uf": "CA", "txt": "NOT #2"})),
    F("It's a state with about twice as many cattle as people.", {"tipo": "icones2", "a": "trator", "b": "casa", "txt": "MORE CATTLE THAN PEOPLE"}),
    F("We ranked all fifty states with official numbers.", {"tipo": "placa", "titulo": "ALL 50 RANKED", "txt": "Official numbers, every state", "fonte": "Census · Realtor.com · Freddie Mac (via FRED)"}),
    F("Stay to the end, and you'll see exactly where yours lands.", mapa(todos=True, pergunta="WHERE DOES YOURS LAND?")),
]

regras = [
    F("Lenders have an old rule of thumb.", {"tipo": "placa", "titulo": "THE 28% RULE", "txt": "Housing payment ≤ 28% of gross income", "fonte": "Standard lender guideline"}),
    F("Your housing payment shouldn't be more than twenty eight percent of what you earn before taxes.", {"tipo": "numero", "txt": "28%", "rotulo": "OF GROSS MONTHLY INCOME · MAX"}),
    F("Go above it, and a home stops being a home. It becomes a stretch.", {"tipo": "icones2", "a": "casa", "b": "bomba", "txt": "A STRETCH"}),
    F("So we tested every state against it.", mapa(grade=True, sticker={"txt": "50 TESTS"})),
    F("The typical home listed for sale in each state over the last twelve months, from Realtor dot com.", {"tipo": "icones2", "a": "casa", "b": "predio", "txt": "TYPICAL LISTED HOME"}),
    F("The typical household income, from the Census Bureau.", {"tipo": "icones2", "a": "familia", "b": "dinheiro", "txt": "TYPICAL HOUSEHOLD INCOME"}),
    F(f"Ten percent down, and a thirty year fixed mortgage at today's average rate, {JUROS:.2f} percent, from Freddie Mac.", {"tipo": "conta", "cab": "* THE TEST *", "quem": "10% down · 30-year fixed", "linha": f"rate {JUROS:.2f}%", "txt": "÷ INCOME", "rotulo": "= share of income, every month", "emoji": "chave"}),
    F("And we didn't even count property taxes or insurance.", {"tipo": "placa", "titulo": "NOT COUNTED", "txt": "Property tax · insurance", "fonte": "Every real number is higher"}),
    F("The real numbers are higher than everything you're about to see.", {"tipo": "numero", "txt": "↑", "rotulo": "REAL COST IS HIGHER"}),
    F("First, the whole country.", mapa(todos=True)),
    F("This is the mortgage on a typical American home, as a share of a typical income, every month since 2016.", {"tipo": "serie", "titulo": "MORTGAGE ON A TYPICAL U.S. HOME · % OF INCOME", "serie": SERIE, "ate": "2019-12", "ymax": 45, "yt": [0, 10, 20, 30, 40], "fmt": "%", "xt": [2017, 2019, 2021, 2023, 2025]}),
    F("The dashed line is the twenty eight percent rule.", {"tipo": "serie", "titulo": "MORTGAGE ON A TYPICAL U.S. HOME · % OF INCOME", "serie": SERIE, "ate": "2019-12", "ymax": 45, "yt": [0, 10, 20, 30, 40], "fmt": "%", "xt": [2017, 2019, 2021, 2023, 2025], "alvo": 28, "alvo_txt": "28% RULE"}),
    F("In January 2021, rates were under three percent, and a typical home took about eighteen percent of income.", {"tipo": "serie", "titulo": "MORTGAGE ON A TYPICAL U.S. HOME · % OF INCOME", "serie": SERIE, "ate": "2021-01", "ymax": 45, "yt": [0, 10, 20, 30, 40], "fmt": "%", "xt": [2017, 2019, 2021, 2023, 2025], "alvo": 28, "alvo_txt": "28% RULE", "marca": ["2021-01", 17.7, "18%"]}),
    F("Easy.", {"tipo": "numero", "txt": "18%", "rotulo": "JAN 2021 · RATE UNDER 3%"}),
    F("Then rates more than doubled. By October 2023, the same math hit thirty eight percent.", {"tipo": "serie", "titulo": "MORTGAGE ON A TYPICAL U.S. HOME · % OF INCOME", "serie": SERIE, "ate": "2023-10", "ymax": 45, "yt": [0, 10, 20, 30, 40], "fmt": "%", "xt": [2017, 2019, 2021, 2023, 2025], "alvo": 28, "alvo_txt": "28% RULE", "marca": ["2023-10", 38.3, "38%"]}),
    F(f"Today it's around {US[-1][1]:.0f}.", {"tipo": "serie", "titulo": "MORTGAGE ON A TYPICAL U.S. HOME · % OF INCOME", "serie": SERIE, "ate": US[-1][0], "ymax": 45, "yt": [0, 10, 20, 30, 40], "fmt": "%", "xt": [2017, 2019, 2021, 2023, 2025], "alvo": 28, "alvo_txt": "28% RULE", "marca": [US[-1][0], US[-1][1], f"{US[-1][1]:.0f}%"], "selo": "ABOVE THE LINE"}),
    F("The country as a whole is over the line. But the country is an average.", mapa(calor=CAL)),
    F("Your state isn't.", mapa(calor=CAL, pergunta="YOUR STATE ISN'T AN AVERAGE")),
]

c1 = [
    F("Part one. Where a house still makes sense.", {"tipo": "capitulo", "n": "PART ONE", "txt": "WHERE A HOUSE STILL MAKES SENSE"}),
    F(f"Only {PASSAM} states still pass the twenty eight percent test.", mapa(destaque=[o['st'] for o in C if o['pct'] <= 28], sticker={"txt": f"ONLY {PASSAM} PASS"})),
    F("Almost all of them are in the Midwest.", mapa(destaque=[o['st'] for o in C if o['pct'] <= 28], pergunta="THE MIDWEST HOLDS")),
    F("Indiana, at number forty one, misses the line by half a point.", rank('IN', sub=f"{POR['IN']['pct']:.1f}% · JUST OVER")),
    F("Number fifty. The most affordable state for a home in America.", mapa(misterio=True, sticker={"txt": "#50"})),
    F("Ohio.", rank('OH', sub="#50 · MOST AFFORDABLE")),
    F(f"A typical listed home in Ohio costs about {mil(POR['OH']['preco'])} thousand dollars.", {"tipo": "numero", "txt": f"${mil(POR['OH']['preco'])}K", "rotulo": "TYPICAL LISTED HOME · OHIO"}),
    F("Less than half of California.", {"tipo": "numero", "txt": f"${mil(POR['OH']['preco'])}K vs ${mil(POR['CA']['preco'])}K", "rotulo": "OHIO VS CALIFORNIA · TYPICAL LISTED HOME"}),
    F(f"With a typical household income of {mil(POR['OH']['renda'][1])} thousand, the mortgage takes {p('OH')} percent.", recibo('OH')),
    F("Comfortably under the line.", {"tipo": "numero", "txt": f"{p('OH')}%", "rotulo": "UNDER 28%"}),
    F("Number forty nine is the surprise.", mapa(misterio=True, sticker={"txt": "#49"})),
    F("Illinois.", rank('IL', sub=f"#49 · {p('IL')}% OF INCOME")),
    F("Chicago is the third biggest city in America.", {"tipo": "icones2", "a": "predio", "b": "metro", "txt": "3RD BIGGEST CITY"}),
    F(f"And Illinois still has some of the most affordable homes in the country. {p('IL')} percent of income.", recibo('IL')),
    F("Nebraska, Iowa, Kansas and Missouri follow, all around twenty five percent.", mapa(destaque=["NE", "IA", "KS", "MO"], sticker={"txt": "≈ 25%"})),
    F("And Maryland is the odd one out.", rank('MD', sub=f"#{POR['MD']['rank']} · THE ODD ONE")),
    F(f"Homes there aren't cheap, at {mil(POR['MD']['preco'])} thousand dollars.", {"tipo": "numero", "txt": f"${mil(POR['MD']['preco'])}K", "rotulo": "TYPICAL LISTED HOME · MARYLAND"}),
    F("But Maryland has one of the highest household incomes in America, so it still squeaks under the line.", recibo('MD')),
]

c2 = [
    F("Part two. Over the line.", {"tipo": "capitulo", "n": "PART TWO", "txt": "OVER THE LINE"}),
    F(f"From forty down to twenty one, the share climbs from {p('OK')} percent to {p('CT')}.", mapa(destaque=[o['st'] for o in C if 21 <= o['rank'] <= 40], sticker={"txt": f"{p('OK')}% → {p('CT')}%"})),
    F("Every one of these states fails the rule today.", mapa(destaque=[o['st'] for o in C if 21 <= o['rank'] <= 40], pergunta="ALL FAIL TODAY")),
    F("In 2019, every one of them passed.", {"tipo": "numero", "txt": "20 / 20", "rotulo": "PASSED IN 2019"}),
    F("Texas lands at thirty six.", rank('TX', sub="#36")),
    F(f"Texas homes are cheaper than people think, around {mil(POR['TX']['preco'])} thousand dollars.", {"tipo": "numero", "txt": f"${mil(POR['TX']['preco'])}K", "rotulo": "TYPICAL LISTED HOME · TEXAS"}),
    F(f"And incomes are around the national typical. {p('TX')} percent.", recibo('TX')),
    F("Over the line, but not by much.", {"tipo": "numero", "txt": f"{p('TX')}%", "rotulo": "JUST OVER 28%"}),
    F("Now look at Mississippi. Number twenty.", rank('MS', sub="#20")),
    F(f"It has some of the cheapest homes in the country, around {mil(POR['MS']['preco'])} thousand dollars.", {"tipo": "numero", "txt": f"${mil(POR['MS']['preco'])}K", "rotulo": "TYPICAL LISTED HOME · MISSISSIPPI"}),
    F("But it also has the lowest household income in the country.", {"tipo": "numero", "txt": f"${mil(POR['MS']['renda'][1])}K", "rotulo": "LOWEST HOUSEHOLD INCOME IN THE U.S."}),
    F(f"So even a cheap home takes {p('MS')} percent.", recibo('MS')),
    F("Cheap is relative.", {"tipo": "icones2", "a": "casa", "b": "saco", "txt": "CHEAP IS RELATIVE"}),
]

c3 = [
    F("Part three. The breaking point.", {"tipo": "capitulo", "n": "PART THREE", "txt": "THE BREAKING POINT"}),
    F("From twenty to eleven, a typical home takes around forty percent of income.", mapa(destaque=[o['st'] for o in C if 11 <= o['rank'] <= 20], sticker={"txt": "≈ 40%"})),
    F("Florida, Arizona, Nevada, Colorado, Utah, Washington and Tennessee are all in here.", mapa(destaque=["FL", "AZ", "NV", "CO", "UT", "WA", "TN"])),
    F("Florida is number seventeen.", rank('FL', sub="#17")),
    F("For years, Florida was where people went to make their money go further.", {"tipo": "icones2", "a": "ilha", "b": "dinheiro", "txt": "MONEY WENT FURTHER"}),
    F("No state income tax, and homes cheaper than the Northeast.", {"tipo": "placa", "titulo": "FLORIDA", "txt": "No state income tax", "fonte": "Homes cheaper than the Northeast"}),
    F(f"Today a typical listed home there costs about {mil(POR['FL']['preco'])} thousand dollars, and the mortgage takes {p('FL')} percent of income.", recibo('FL')),
    F("Before insurance, which in Florida is a story of its own.", {"tipo": "icones2", "a": "raio", "b": "casa", "txt": "BEFORE INSURANCE"}),
    F("And now, the top ten.", {"tipo": "capitulo", "n": "TOP 10", "txt": "THE TEN HARDEST STATES"}),
    F(f"Number ten, Wyoming. {p('WY')} percent.", rank('WY', sub=f"{p('WY')}% OF INCOME")),
    F("Number nine, Rhode Island.", rank('RI', sub=f"{p('RI')}% OF INCOME")),
    F(f"Number eight, New Mexico. Homes around {mil(POR['NM']['preco'])} thousand dollars, but one of the lowest incomes in the country.", rank('NM', sub=f"{p('NM')}% OF INCOME")),
    F("Number seven, Oregon.", rank('OR', sub=f"{p('OR')}% OF INCOME")),
    F(f"Number six, Massachusetts. Homes cost {mil(POR['MA']['preco'])} thousand dollars.", rank('MA', sub=f"${mil(POR['MA']['preco'])}K HOMES")),
    F(f"But Massachusetts also has the highest household income in America. {p('MA')} percent.", recibo('MA')),
    F(f"Number five, Idaho. {p('ID')} percent. Almost half of every paycheck.", rank('ID', sub="ALMOST HALF")),
    F(f"Number four, Hawaii, at {p('HI')}.", rank('HI', sub=f"{p('HI')}% OF INCOME")),
    F(f"And number three, California, at {p('CA')}.", rank('CA', sub=f"{p('CA')}% OF INCOME")),
    F("Number two.", mapa(misterio=True, sticker={"txt": "#2"})),
    F("Montana.", rank('MT', sub="#2")),
    F("Montana has about one point one million people. And around twice as many cattle.", {"tipo": "icones2", "a": "pessoa", "b": "trator", "txt": "1.1M PEOPLE · 2× CATTLE"}),
    F(f"But a typical home listed in Montana now costs about {mil(POR['MT']['preco'])} thousand dollars.", {"tipo": "numero", "txt": f"${mil(POR['MT']['preco'])}K", "rotulo": "TYPICAL LISTED HOME · MONTANA"}),
    F(f"And the typical household earns around {mil(POR['MT']['renda'][1])} thousand.", {"tipo": "numero", "txt": f"${mil(POR['MT']['renda'][1])}K", "rotulo": "TYPICAL HOUSEHOLD INCOME · MONTANA"}),
    F(f"The mortgage would take {p('MT')} percent of income. A hair above California.", recibo('MT')),
    F("And number one. The hardest state in America to afford a typical home.", mapa(misterio=True, sticker={"txt": "#1"})),
    F("New York.", rank('NY', sub="#1 · HARDEST")),
    F(f"A typical listed home: about {mil(POR['NY']['preco'])} thousand dollars.", {"tipo": "numero", "txt": f"${mil(POR['NY']['preco'])}K", "rotulo": "TYPICAL LISTED HOME · NEW YORK"}),
    F(f"A typical household income: about {mil(POR['NY']['renda'][1])} thousand.", {"tipo": "numero", "txt": f"${mil(POR['NY']['renda'][1])}K", "rotulo": "TYPICAL HOUSEHOLD INCOME · NEW YORK"}),
    F(f"At today's rate, the mortgage alone is about {POR['NY']['parcela']:,.0f} dollars a month.", {"tipo": "conta", "cab": "* NEW YORK *", "quem": "mortgage only · per month", "linha": f"${mil(POR['NY']['preco'])}K home · {JUROS:.2f}%", "txt": f"${POR['NY']['parcela']:,.0f}", "rotulo": "every month", "emoji": "casa"}),
    F(f"{p('NY')} percent of income. Twice what the rule allows.", {"tipo": "numero", "txt": f"{p('NY')}%", "rotulo": "TWICE THE 28% RULE"}),
    F("So how much would you need to earn to pass the rule?", {"tipo": "icones2", "a": "dinheiro", "b": "casa", "txt": "HOW MUCH TO PASS?"}),
    F(f"In New York, about {mil(PRECISA('NY'))} thousand dollars a year. Twice what the typical household makes.", {"tipo": "numero", "txt": f"${mil(PRECISA('NY'))}K", "rotulo": "A YEAR, TO PASS IN NEW YORK"}),
    F(f"In Ohio? About {mil(PRECISA('OH'))} thousand. Less than the typical Ohio household already earns.", {"tipo": "numero", "txt": f"${mil(PRECISA('OH'))}K", "rotulo": "A YEAR, TO PASS IN OHIO"}),
]

c4 = [
    F("Part four. What changed.", {"tipo": "capitulo", "n": "PART FOUR", "txt": "WHAT CHANGED"}),
    F("Here's every state, then and now. Across the bottom, 2019. Up the side, today.", {"tipo": "dispersao", "pts": [[o['st'], o['pct19'], o['pct'], o['rank']] for o in C],
      "eixos": {"x": [10, 35], "y": [20, 58], "xt": [15, 20, 25, 30, 35], "yt": [20, 28, 40, 50], "xl": "SHARE OF INCOME · 2019 (→) · TODAY (↑)", "xf": "{}%", "yf": "{}%", "linha": 28, "linha_txt": "28% RULE"}}),
    F("In 2019, only California and Hawaii were over the line. Everyone else was fine.", {"tipo": "dispersao", "pts": [[o['st'], o['pct19'], o['pct'], o['rank']] for o in C], "foco": ["CA", "HI"],
      "eixos": {"x": [10, 35], "y": [20, 58], "xt": [15, 20, 25, 30, 35], "yt": [20, 28, 40, 50], "xl": "SHARE OF INCOME · 2019 (→) · TODAY (↑)", "xf": "{}%", "yf": "{}%", "linha": 28, "linha_txt": "28% RULE"}}),
    F(f"Since then, Wyoming went from {p19('WY')} percent to {p('WY')}.", {"tipo": "lista", "itens": [[10, "WYOMING · 2019", POR['WY']['pct19']], [10, "WYOMING · TODAY", POR['WY']['pct']]]}),
    F(f"Montana, from {p19('MT')} to {p('MT')}. Idaho, from {p19('ID')} to {p('ID')}.", {"tipo": "lista", "itens": [[2, "MONTANA · 2019", POR['MT']['pct19']], [2, "MONTANA · TODAY", POR['MT']['pct']], [5, "IDAHO · 2019", POR['ID']['pct19']], [5, "IDAHO · TODAY", POR['ID']['pct']]]}),
    F("The states that got hit hardest weren't the expensive coasts.", {"tipo": "dispersao", "pts": [[o['st'], o['pct19'], o['pct'], o['rank']] for o in C], "foco": ["MT", "ID", "WY", "NM"],
      "eixos": {"x": [10, 35], "y": [20, 58], "xt": [15, 20, 25, 30, 35], "yt": [20, 28, 40, 50], "xl": "SHARE OF INCOME · 2019 (→) · TODAY (↑)", "xf": "{}%", "yf": "{}%", "linha": 28, "linha_txt": "28% RULE"}}),
    F("Many were the cheap, quiet states people moved to when they could work from anywhere.", {"tipo": "icones2", "a": "computador", "b": "casa", "txt": "WORK FROM ANYWHERE"}),
    F("Prices went up there. Incomes didn't keep up. And then rates doubled.", {"tipo": "icones2", "a": "grafico", "b": "grafico_baixo", "txt": "PRICES ↑ · INCOMES ⟶"}),
    F("So what would fix it? We reran every state at lower rates.", {"tipo": "placa", "titulo": "WHAT IF RATES FELL?", "txt": "Same homes, same incomes", "fonte": "Rerun at 6%, 5%, 4%, 3%"}),
    F(f"At today's rate, {ESC[0]} states pass. At six percent, {ESC[1]}.", {"tipo": "barras", "titulo": "STATES THAT PASS THE 28% RULE", "max": 50, "itens": [[f"{JUROS:.2f}% · today", ESC[0], "#e5484d"], ["6%", ESC[1], "#e9874a"]]}),
    F(f"At five, {ESC[2]}. At four percent, {ESC[3]}.", {"tipo": "barras", "titulo": "STATES THAT PASS THE 28% RULE", "max": 50, "itens": [[f"{JUROS:.2f}% · today", ESC[0], "#e5484d"], ["6%", ESC[1], "#e9874a"], ["5%", ESC[2], "#e9c46a"], ["4%", ESC[3], "#9cc46a"]]}),
    F(f"And at three percent, where rates were in 2021, {ESC[4]} states would pass again.", {"tipo": "barras", "titulo": "STATES THAT PASS THE 28% RULE", "max": 50, "itens": [[f"{JUROS:.2f}% · today", ESC[0], "#e5484d"], ["6%", ESC[1], "#e9874a"], ["5%", ESC[2], "#e9c46a"], ["4%", ESC[3], "#9cc46a"], ["3%", ESC[4], "#7bc47f"]]}),
    F(f"But even at zero percent interest, a typical New York home would still take {NY0:.0f} percent of income.", {"tipo": "numero", "txt": f"{NY0:.0f}%", "rotulo": "NEW YORK AT 0% INTEREST"}),
    F("In some places, the rate isn't the problem. The price is.", rank('NY', sub="THE PRICE IS THE PROBLEM")),
    F("One honest caveat.", {"tipo": "placa", "titulo": "ONE CAVEAT", "txt": "Listing prices, not sale prices", "fonte": "Taxes and insurance not included"}),
    F("We used listing prices, not final sale prices, and listings in places like Montana include a lot of high end homes.", {"tipo": "icones2", "a": "casa", "b": "predio", "txt": "LISTED ≠ SOLD"}),
    F("The ranking at the top holds either way.", rank('NY', sub="#1 EITHER WAY")),
]

fim = [
    F(f"So in 2019, {PASSAM19} states passed the test. Today, {PASSAM} do.", {"tipo": "numero", "txt": f"{PASSAM19} → {PASSAM}", "rotulo": "STATES THAT PASS · 2019 → TODAY"}),
    F("And the last state standing?", mapa(misterio=True, sticker={"txt": "LAST STATE STANDING"})),
    F("Ohio. Where a typical home still costs less than a quarter of a paycheck.", rank('OH', sub="UNDER A QUARTER OF A PAYCHECK")),
    F("Could you afford a typical home in your state? Tell us in the comments.", mapa(calor=CAL, pergunta="COULD YOU AFFORD YOURS?")),
    F("And subscribe for the next ranking.", {"tipo": "fim"}),
]

spec = {
    "id": "lss002a", "canal": "last-state-standing", "titulo": "Could You Afford a House in Your State? (All 50 Ranked)",
    "voz": "cw", "velocidade": 1.0, "lang": "en-us", "legenda": True, "acento": "#ff6b3d", "marca": "LAST STATE STANDING", "trilha": 0.14, "cauda": 4.0,
    "numeros": {"twenty eight percent": "28%", "ten percent": "10%", "three percent": "3%", "eighteen percent": "18%", "thirty eight percent": "38%",
                "twenty five percent": "25%", "forty percent": "40%", "six percent": "6%", "zero percent": "0%", "one point one million": "1.1 million"},
    "blocos": [],
}
nomes = {2: 'Where a house still makes sense', 3: 'Over the line', 4: 'The breaking point', 5: 'What changed'}
for i, cap in enumerate([intro, regras, c1, c2, c3, c4, fim]):
    cena = {"tipo": "capitulo" if i in nomes else "arte", "v": [v for _, v in cap]}
    if i in nomes: cena.update({"n": i - 1, "titulo": nomes[i]})
    spec["blocos"].append({"cena": cena, "falas": [t for t, _ in cap]})
json.dump(spec, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'spec.json'), 'w'), ensure_ascii=False, indent=1)
txt = ' '.join(t for b in spec['blocos'] for t in b['falas'])
print(len(txt.split()), 'palavras', sum(len(b['falas']) for b in spec['blocos']), 'falas', 'juros', JUROS, 'ESC', ESC)

"""Last State Standing #001 (direção de arte nova, composição Arte): se a gasolina chegasse a US$ 10.
Dados: dados/gas10.json (EIA SEDS 2024: gasolina vendida por pessoa; BEA 2025: renda por pessoa),
dados/gas_semanal.csv (EIA via FRED, preço semanal da regular), dados/cpi.csv (BLS via FRED, para inflação).
Ranking = galões × US$ 10 ÷ renda por pessoa. Cada fala = um visual. Blocos = capítulos.
"""
import csv, json, os

D = '/home/claude/last-state-standing/dados'
G = json.load(open(f'{D}/gas10.json'))
G.sort(key=lambda x: -x['pct10'])
for i, x in enumerate(G): x['rank'] = i + 1
POR = {x['ab']: x for x in G}
sem = [(r['observation_date'], float(r['GASREGW'])) for r in csv.DictReader(open(f'{D}/gas_semanal.csv')) if r['GASREGW'] not in ('', '.')]
HOJE_D, HOJE = sem[-1]
cpi = {r['observation_date'][:7]: float(r['CPIAUCSL']) for r in csv.DictReader(open(f'{D}/cpi.csv')) if r['CPIAUCSL'] not in ('', '.')}
ULT = max(cpi)
REAL08 = 4.114 * cpi[ULT] / cpi['2008-07']
assert abs(REAL08 - 6.32) < 0.01
US_GAL = 406
gal = lambda ab: f"{POR[ab]['gal']:.0f}"
pct = lambda ab: f"{POR[ab]['pct10']:.1f}"
SERIE = [[d[:7], v] for d, v in sem[::4]]  # uma amostra por mês, para o gráfico
CAL = {x['ab']: x['pct10'] for x in G}

def F(t, v): return (t, v)
def mapa(**kw): return {"tipo": "mapa", **kw}
def rank(ab, **kw): return {"tipo": "rank", "pos": f"#{POR[ab]['rank']}", "nome": POR[ab]['nome'].upper(), "uf": ab, **kw}

intro = [
    F("June thirteenth, 2022.", {"tipo": "data", "txt": "JUNE 13, 2022", "sub": "U.S. regular gasoline, weekly average"}),
    F("For the first time on record, regular gas in America averaged more than five dollars a gallon.", {"tipo": "bomba", "preco": "5.006", "de": "4.876", "rotulo": "U.S. AVERAGE · REGULAR", "selo": "FIRST TIME OVER $5", "fonte": "Source: U.S. EIA"}),
    F("In California, six twenty-seven.", mapa(destaque=["CA"], sticker={"uf": "CA", "txt": "CA $6.27"})),
    F("Now picture ten dollars. Not for a day. For good.", {"tipo": "numero", "txt": "$10", "rotulo": "A GALLON. FOR GOOD."}),
    F("In some states, people grumble and keep driving.", mapa(todos=True)),
    F("In others, the math stops working by Friday.", {"tipo": "calendario", "txt": "BY FRIDAY"}),
    F("So which states break first?", mapa(todos=True, pergunta="WHICH STATES BREAK FIRST?")),
    F("We took the official numbers for all fifty states.", {"tipo": "placa", "titulo": "ALL 50 RANKED", "txt": "Official numbers, every state", "fonte": "EIA State Energy Data 2024 · BEA 2025"}),
    F("And the state everyone pictures when you say long drives and empty highways?", {"tipo": "icones2", "a": "rodovia", "b": "caminhao", "txt": "LONG DRIVES?"}),
    F("It doesn't even make the top fifteen.", mapa(misterio=True, sticker={"txt": "NOT IN THE TOP 15"})),
]

regras = [
    F("Two numbers decide this.", {"tipo": "placa", "titulo": "THE RULES", "txt": "Two numbers per state", "fonte": "EIA · BEA"}),
    F("Gallons of gasoline sold per person each year, from the Energy Information Administration.", {"tipo": "galoes", "n": US_GAL, "barris": US_GAL / 42, "rotulo": "GALLONS PER PERSON · U.S. AVERAGE", "nota": "EIA State Energy Data System, 2024"}),
    F("And income per person, from the Bureau of Economic Analysis.", {"tipo": "nota-rasgada", "pct": 0.1, "txt": "INCOME", "rotulo": "PER PERSON · BEA 2025"}),
    F("Multiply the gallons by ten dollars. Divide by income.", {"tipo": "conta", "linha": "gallons × $10 ÷ income", "txt": "% OF INCOME", "rotulo": "the share that goes into the tank"}),
    F(f"The national average is about {US_GAL} gallons per person.", {"tipo": "galoes", "n": US_GAL, "barris": US_GAL / 42, "rotulo": "GALLONS PER PERSON · U.S.", "nota": f"≈ {US_GAL / 42:.1f} barrels (42 gal each)"}),
    F("At ten dollars, that's around four thousand dollars a year, for every man, woman and child.", {"tipo": "conta", "linha": f"{US_GAL} gal × $10.00", "txt": f"${US_GAL * 10:,}", "rotulo": "per person · per year · U.S. average"}),
    F("But how far away is ten dollars, really?", {"tipo": "numero", "txt": "$10?", "rotulo": "HOW FAR AWAY?"}),
    F("This is the price of regular gas in America, every week since 1990.", {"tipo": "serie", "ate": "1990-12", "serie": SERIE}),
    F("In January 2002, it was one dollar and eleven cents.", {"tipo": "serie", "ate": "2002-01", "serie": SERIE, "marca": ["2002-01", 1.11, "$1.11"]}),
    F("Six years later, in July 2008, four eleven. It almost quadrupled.", {"tipo": "serie", "ate": "2008-07", "serie": SERIE, "marca": ["2008-07", 4.11, "$4.11"]}),
    F("Then June 2022. Just over five dollars. The highest weekly average ever recorded.", {"tipo": "serie", "ate": "2022-06", "serie": SERIE, "marca": ["2022-06", 5.01, "$5.01"]}),
    F(f"And adjusted for inflation, 2008 was even worse. Four eleven back then is about six thirty today.", {"tipo": "conta", "linha": "$4.11 in July 2008", "txt": f"${REAL08:.2f}", "rotulo": "in today's dollars (CPI)"}),
    F(f"Right now, the national average is {HOJE:.2f} dollars.", {"tipo": "serie", "ate": HOJE_D[:7], "serie": SERIE, "marca": [HOJE_D[:7], HOJE, f"${HOJE:.2f}"]}),
    F("So ten dollars is about two and a half times today's price.", {"tipo": "serie", "ate": HOJE_D[:7], "serie": SERIE, "alvo": 10}),
    F("Far away. But this chart has moved that fast before.", {"tipo": "serie", "ate": HOJE_D[:7], "serie": SERIE, "alvo": 10, "selo": "×2.5"}),
]

c1 = [
    F("Part one. The states that barely notice.", {"tipo": "capitulo", "n": "PART ONE", "txt": "THE STATES THAT BARELY NOTICE"}),
    F("These are the ten states where ten dollar gas hurts the least.", mapa(destaque=[x['ab'] for x in G[-10:]], sticker={"txt": "THE BOTTOM 10"})),
    F("Most of them share two things. People earn more than average.", mapa(destaque=[x['ab'] for x in G[-10:]], sticker={"txt": "HIGHER INCOME"})),
    F("And a lot of them don't need a car every day.", {"tipo": "icones2", "a": "metro", "b": "carro", "txt": "NOT EVERY DAY"}),
    F("Number fifty, the state that would notice least.", rank('NY')),
    F("New York.", rank('NY', sub="LAST STATE STANDING?")),
    F(f"New Yorkers burn just {gal('NY')} gallons of gas per person a year. The lowest in the country.", {"tipo": "galoes", "n": int(gal('NY')), "barris": POR['NY']['gal'] / 42, "rotulo": "GALLONS PER PERSON · NEW YORK", "nota": "the lowest of all 50 states"}),
    F("For millions of people there, the subway is the gas tank.", {"tipo": "icones2", "a": "metro", "b": "predio", "txt": "THE SUBWAY IS THE TANK"}),
    F(f"At ten dollars a gallon, gas would take {pct('NY')} percent of income.", {"tipo": "nota-rasgada", "pct": POR['NY']['pct10'], "txt": f"{pct('NY')}%", "rotulo": "NEW YORK · OF INCOME"}),
    F("Painful. But survivable.", rank('NY', sub=f"{gal('NY')} GAL · {pct('NY')}% OF INCOME")),
    F(f"Number forty-nine, Massachusetts, at {pct('MA')} percent.", rank('MA', sub=f"{gal('MA')} GAL · {pct('MA')}%")),
    F(f"Then Washington and California, tied at {pct('CA')}.", mapa(destaque=["WA", "CA"], sticker={"txt": f"#48 · #47 · {pct('CA')}%"})),
    F("California already has some of the most expensive gas in the country.", mapa(destaque=["CA"], sticker={"uf": "CA", "txt": "CA $6.27"})),
    F("And it still lands near the bottom.", rank('CA')),
    F(f"High incomes, and only {gal('CA')} gallons per person.", {"tipo": "galoes", "n": int(gal('CA')), "barris": POR['CA']['gal'] / 42, "rotulo": "GALLONS PER PERSON · CALIFORNIA", "nota": f"≈ {POR['CA']['gal'] / 42:.0f} barrels"}),
    F(f"Hawaii is number {POR['HI']['rank']}. On an island, you can only drive so far.", {"tipo": "icones2", "a": "ilha", "b": "carro", "txt": f"HAWAII · #{POR['HI']['rank']}"}),
    F(f"And Alaska, the biggest state of all, sits at number {POR['AK']['rank']}.", rank('AK')),
    F("Most Alaskans live in a handful of cities.", {"tipo": "icones2", "a": "neve", "b": "predio", "txt": "A FEW CITIES"}),
    F("And the state capital, Juneau, can't even be reached by road.", {"tipo": "placa", "titulo": "JUNEAU, ALASKA", "txt": "State capital · no road in", "fonte": "Reachable by air or sea"}),
    F(f"Connecticut is number {POR['CT']['rank']}. The highest income per person on our list.", rank('CT', sub=f"${POR['CT']['renda']:,.0f} PER PERSON")),
    F(f"New Jersey and Illinois tie at {pct('NJ')} percent.", mapa(destaque=["NJ", "IL"], sticker={"txt": f"#44 · #43 · {pct('NJ')}%"})),
    F(f"And Rhode Island closes the bottom ten at number {POR['RI']['rank']}.", rank('RI', sub=f"{pct('RI')}% OF INCOME")),
]

meio = [x['ab'] for x in G[20:40]]
c2 = [
    F("Part two. The middle of the map.", {"tipo": "capitulo", "n": "PART TWO", "txt": "THE MIDDLE OF THE MAP"}),
    F(f"From forty down to twenty one, the share climbs from {POR[G[39]['ab']]['pct10']:.1f} to {POR[G[20]['ab']]['pct10']:.1f} percent.", mapa(destaque=meio, sticker={"txt": f"{POR[G[39]['ab']]['pct10']:.1f}% → {POR[G[20]['ab']]['pct10']:.1f}%"})),
    F(f"Number forty, Colorado. Then Pennsylvania and Maryland, all around four and a half percent.", {"tipo": "lista", "itens": [[x['rank'], x['nome'], x['pct10']] for x in G[37:40]][::-1]}),
    F(f"Oregon is {POR['OR']['rank']}. Nevada, {POR['NV']['rank']}.", {"tipo": "lista", "itens": [[x['rank'], x['nome'], x['pct10']] for x in G[35:40]][::-1]}),
    F(f"Florida lands at {POR['FL']['rank']}.", rank('FL')),
    F(f"Utah, {POR['UT']['rank']}. Minnesota, {POR['MN']['rank']}. Virginia, {POR['VA']['rank']}.", {"tipo": "lista", "itens": [[x['rank'], x['nome'], x['pct10']] for x in G[31:34]][::-1]}),
    F(f"New Hampshire, Arizona, Vermont and Idaho all land between {POR['NH']['pct10']:.1f} and {POR['ID']['pct10']:.1f} percent.", {"tipo": "lista", "itens": [[x['rank'], x['nome'], x['pct10']] for x in G[27:31]][::-1]}),
    F(f"Wisconsin, {POR['WI']['rank']}. Ohio, {POR['OH']['rank']}. Nebraska, {POR['NE']['rank']}.", {"tipo": "lista", "itens": [[x['rank'], x['nome'], x['pct10']] for x in G[24:27]][::-1]}),
    F(f"Texas, a state built around the car, is only number {POR['TX']['rank']}.", rank('TX')),
    F(f"Texans burn {gal('TX')} gallons a person. But they earn enough to absorb it.", {"tipo": "galoes", "n": int(gal('TX')), "barris": POR['TX']['gal'] / 42, "rotulo": "GALLONS PER PERSON · TEXAS", "nota": f"income ≈ ${POR['TX']['renda'] / 1000:.0f}K per person"}),
    F(f"Michigan, {POR['MI']['rank']}. Indiana, {POR['IN']['rank']}. And Maine, at {POR['ME']['rank']}, with {pct('ME')} percent.", {"tipo": "lista", "itens": [[x['rank'], x['nome'], x['pct10']] for x in G[20:23]][::-1]}),
    F("And this is where the pattern starts to show.", mapa(calor=CAL)),
    F("The problem isn't only how far people drive.", {"tipo": "icones2", "a": "rodovia", "b": "carro", "txt": "NOT JUST DISTANCE"}),
    F("It's what they earn while they drive it.", {"tipo": "nota-rasgada", "pct": 6.5, "txt": "INCOME", "rotulo": "THE OTHER HALF"}),
    F("Which brings us to the state you were probably expecting near the top.", mapa(misterio=True, sticker={"txt": "THE ONE YOU EXPECTED"})),
    F("Wyoming.", rank('WY')),
    F("Ranches, mines, and hours of empty highway.", {"tipo": "icones2", "a": "trator", "b": "rodovia", "txt": "EMPTY HIGHWAYS"}),
    F(f"Wyomingites burn {gal('WY')} gallons of gas per person. The second most in America.", {"tipo": "galoes", "n": int(gal('WY')), "barris": POR['WY']['gal'] / 42, "rotulo": "GALLONS PER PERSON · WYOMING", "nota": "2nd most of all 50 states"}),
    F(f"But Wyoming is also one of the richest states per person. About {POR['WY']['renda'] / 1000:.0f} thousand dollars.", {"tipo": "conta", "linha": "income per person · BEA", "txt": f"${POR['WY']['renda']:,.0f}", "rotulo": "WYOMING · 2025"}),
    F(f"So at ten dollar gas, it lands at number {POR['WY']['rank']}.", rank('WY', sub=f"{gal('WY')} GAL · {pct('WY')}% OF INCOME")),
    F("Expensive. Not broken.", {"tipo": "numero", "txt": f"#{POR['WY']['rank']}", "rotulo": "EXPENSIVE. NOT BROKEN."}),
]

t20 = [x['ab'] for x in G[10:20]]
c3 = [
    F("Part three. The breaking point.", {"tipo": "capitulo", "n": "PART THREE", "txt": "THE BREAKING POINT"}),
    F("From twenty to eleven, ten dollar gas eats around seven percent of every paycheck.", mapa(destaque=t20, sticker={"txt": "≈ 7% OF INCOME"})),
    F(f"South Dakota. Wyoming. Kansas. Georgia. Montana.", {"tipo": "lista", "itens": [[x['rank'], x['nome'], x['pct10']] for x in G[15:20]][::-1]}),
    F("Delaware. North Carolina. Tennessee. North Dakota. And Iowa.", {"tipo": "lista", "itens": [[x['rank'], x['nome'], x['pct10']] for x in G[10:15]][::-1]}),
    F("And now, the top ten.", mapa(destaque=[x['ab'] for x in G[:10]], sticker={"txt": "THE TOP 10"})),
    F(f"Number ten, Oklahoma. {gal('OK')} gallons per person. {pct('OK')} percent.", rank('OK', sub=f"{gal('OK')} GAL · {pct('OK')}%")),
    F(f"Number nine, New Mexico, at {pct('NM')}.", rank('NM', sub=f"{gal('NM')} GAL · {pct('NM')}%")),
    F("Number eight, West Virginia.", rank('WV')),
    F("West Virginians burn about the national average in gas.", {"tipo": "galoes", "n": int(gal('WV')), "barris": POR['WV']['gal'] / 42, "rotulo": "GALLONS PER PERSON · WEST VIRGINIA", "nota": f"U.S. average: {US_GAL}"}),
    F(f"But they earn the second lowest income in the country. {pct('WV')} percent.", {"tipo": "conta", "linha": "income per person · BEA", "txt": f"${POR['WV']['renda']:,.0f}", "rotulo": "WEST VIRGINIA · 2nd LOWEST"}),
    F(f"Number seven, Louisiana. Number six, Missouri, at {pct('MO')}.", {"tipo": "lista", "itens": [[x['rank'], x['nome'], x['pct10']] for x in G[5:10]][::-1]}),
    F("Number five, Kentucky. Number four, Arkansas. Both right around eight percent.", {"tipo": "lista", "itens": [[x['rank'], x['nome'], x['pct10']] for x in G[3:10]][::-1]}),
    F(f"And number three, South Carolina. {gal('SC')} gallons a person.", rank('SC')),
    F(f"{pct('SC')} percent of income, gone.", {"tipo": "nota-rasgada", "pct": POR['SC']['pct10'], "txt": f"{pct('SC')}%", "rotulo": "SOUTH CAROLINA · OF INCOME"}),
    F("Number two.", mapa(misterio=True, sticker={"txt": "#2"})),
    F("Mississippi.", rank('MS')),
    F(f"Mississippi has the lowest income per person in the United States. About {POR['MS']['renda'] / 1000:.0f} thousand dollars.", {"tipo": "conta", "linha": "income per person · BEA", "txt": f"${POR['MS']['renda']:,.0f}", "rotulo": "MISSISSIPPI · THE LOWEST"}),
    F(f"And Mississippians burn {gal('MS')} gallons of gas a year each. Well above the national average.", {"tipo": "galoes", "n": int(gal('MS')), "barris": POR['MS']['gal'] / 42, "rotulo": "GALLONS PER PERSON · MISSISSIPPI", "nota": f"U.S. average: {US_GAL}"}),
    F(f"At ten dollars a gallon, that's {pct('MS')} percent of everything they earn.", {"tipo": "nota-rasgada", "pct": POR['MS']['pct10'], "txt": f"{pct('MS')}%", "rotulo": "MISSISSIPPI · OF INCOME"}),
    F("More than one dollar of every ten.", {"tipo": "numero", "txt": "$1 IN $10", "rotulo": "INTO THE TANK"}),
    F("And number one. The first state to break.", mapa(misterio=True, sticker={"txt": "#1"})),
    F("Alabama.", rank('AL')),
    F(f"In our numbers, Alabama sells more gasoline per person than any other state. {gal('AL')} gallons a year.", {"tipo": "galoes", "n": int(gal('AL')), "barris": POR['AL']['gal'] / 42, "rotulo": "GALLONS PER PERSON · ALABAMA", "nota": "the most of all 50 states"}),
    F("Its income per person is the third lowest in the country.", {"tipo": "conta", "linha": "income per person · BEA", "txt": f"${POR['AL']['renda']:,.0f}", "rotulo": "ALABAMA · 3rd LOWEST"}),
    F(f"At ten dollars, gas would cost every Alabamian about {POR['AL']['custo10']:,} dollars a year.", {"tipo": "conta", "linha": f"{gal('AL')} gal × $10.00", "txt": f"${POR['AL']['custo10']:,}", "rotulo": "ALABAMA · per person · per year"}),
    F(f"{pct('AL')} percent of their income.", {"tipo": "nota-rasgada", "pct": POR['AL']['pct10'], "txt": f"{pct('AL')}%", "rotulo": "ALABAMA · OF INCOME"}),
    F("More than three times the share New Yorkers would pay.", {"tipo": "duelo", "a": "AL", "b": "NY"}),
    F(f"Compared with today's price, that's about {POR['AL']['gal'] * (10 - HOJE):,.0f} extra dollars a year, for every single person in the state.", {"tipo": "conta", "linha": f"{gal('AL')} gal × ($10 − ${HOJE:.2f})", "txt": f"${POR['AL']['gal'] * (10 - HOJE):,.0f}", "rotulo": "EXTRA · per person · per year"}),
]

sul = ['OK', 'WV', 'LA', 'KY', 'AR', 'SC', 'MS', 'AL']
c4 = [
    F("Part four. The real pattern.", {"tipo": "capitulo", "n": "PART FOUR", "txt": "THE REAL PATTERN"}),
    F("Put every state on one chart.", {"tipo": "dispersao", "pts": [[x['ab'], x['gal'], x['renda'], x['rank']] for x in G]}),
    F("Gas burned on one side. Money earned on the other.", {"tipo": "dispersao", "pts": [[x['ab'], x['gal'], x['renda'], x['rank']] for x in G]}),
    F("The danger zone is the corner with lots of gas and not much money.", {"tipo": "dispersao", "pts": [[x['ab'], x['gal'], x['renda'], x['rank']] for x in G], "zona": True}),
    F("That's where Alabama, Mississippi, South Carolina, Arkansas and Kentucky sit.", {"tipo": "dispersao", "pts": [[x['ab'], x['gal'], x['renda'], x['rank']] for x in G], "zona": True, "foco": ["AL", "MS", "SC", "AR", "KY"]}),
    F("Wyoming burns almost as much as Alabama. But it floats high above it on income.", {"tipo": "dispersao", "pts": [[x['ab'], x['gal'], x['renda'], x['rank']] for x in G], "foco": ["WY", "AL"]}),
    F("New York sits alone, far on the other side.", {"tipo": "dispersao", "pts": [[x['ab'], x['gal'], x['renda'], x['rank']] for x in G], "foco": ["NY"]}),
    F("Eight of the ten states that break first are in the South.", mapa(destaque=sul, sticker={"txt": "8 OF THE TOP 10"})),
    F("Not because of one number. Because two numbers stack.", {"tipo": "icones2", "a": "bomba", "b": "dinheiro", "txt": "TWO NUMBERS STACK"}),
    F("More gallons. And less income to pay for them.", mapa(calor=CAL)),
    F("One honest caveat.", {"tipo": "placa", "titulo": "ONE CAVEAT", "txt": "Gas is counted where it's sold", "fonte": "EIA State Energy Data System"}),
    F("These numbers count gasoline where it's sold.", {"tipo": "bomba", "preco": "10.00", "de": "4.15", "rotulo": "SOLD HERE · COUNTED HERE"}),
    F("That includes trucks passing through and travelers filling up.", {"tipo": "icones2", "a": "caminhao", "b": "rodovia", "txt": "PASSING THROUGH"}),
    F("So states on busy highways can look a little thirstier than their residents really are.", mapa(calor=CAL, sticker={"txt": "A LITTLE THIRSTIER"})),
    F("But the top of the ranking holds either way. Low income plus long distances breaks first.", rank('AL', sub="LOW INCOME + LONG DISTANCES")),
]

fim = [
    F("So if gas ever hits ten dollars, the first states to feel it won't be the ones with the longest highways.", mapa(calor=CAL)),
    F("They'll be the ones with the smallest paychecks.", rank('AL', sub=f"{pct('AL')}% OF INCOME")),
    F("And the last state standing?", mapa(misterio=True, sticker={"txt": "LAST STATE STANDING"})),
    F("New York. Thanks to a subway.", rank('NY', sub="THANKS TO A SUBWAY")),
    F("Where does your state land? Tell us in the comments.", mapa(calor=CAL, pergunta="WHERE DOES YOUR STATE LAND?")),
    F("And subscribe for the next ranking.", {"tipo": "fim"}),
]

spec = {
    "id": "lss001a", "canal": "last-state-standing", "titulo": "If Gas Hit $10, These States Break First (All 50 Ranked)",
    "voz": "am_michael", "velocidade": 1.0, "lang": "en-us", "legenda": True, "acento": "#ff6b3d", "marca": "LAST STATE STANDING", "trilha": 0.14, "cauda": 4.0,
    "numeros": {"june thirteenth 2022": "JUNE 13, 2022", "five dollars": "$5", "six twenty-seven": "$6.27", "ten dollars": "$10", "four thousand dollars": "$4,000",
                "one dollar and eleven cents": "$1.11", "four eleven": "$4.11", "six thirty": "$6.30", "two and a half": "2.5",
                "three and a half percent": "3.5%", "seven percent": "7%", "eight percent": "8%", "ten dollar": "$10", "four and a half percent": "4.5%"},
    "blocos": [],
}
nomes = {2: 'The states that barely notice', 3: 'The middle of the map', 4: 'The breaking point', 5: 'The real pattern'}
for i, cap in enumerate([intro, regras, c1, c2, c3, c4, fim]):
    cena = {"tipo": "capitulo" if i in nomes else "arte", "v": [v for _, v in cap]}
    if i in nomes: cena.update({"n": i - 1, "titulo": nomes[i]})
    spec["blocos"].append({"cena": cena, "falas": [t for t, _ in cap]})
json.dump(spec, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'spec.json'), 'w'), ensure_ascii=False, indent=1)
txt = ' '.join(t for b in spec['blocos'] for t in b['falas'])
print(len(txt.split()), 'palavras', sum(len(b['falas']) for b in spec['blocos']), 'falas', 'hoje', HOJE_D, HOJE)

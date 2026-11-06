"""TTR #001 (direção de arte nova, composição Arte): Monopoly simulado 10.000 vezes.
Todos os números vêm de sim/resultado.json (sim/monopoly.py). Gera spec.json nesta pasta.
Cada fala = um visual (troca a cada 2–5 s). Blocos = capítulos (pausa maior entre eles).
"""
import json, os

R = json.load(open('/home/claude/ten-thousand-runs/sim/resultado.json'))
L = {int(k): v * 100 for k, v in R['landing'].items()}
T = {k: v * 100 for k, v in R['tournament']['win_rate'].items()}
D = R['duels']
ROI = {g: {r['houses']: r for r in v['rows']} for g, v in R['roi'].items()}
p = lambda x, d=1: f"{x:.{d}f}"

def F(t, v):
    return (t, v)

intro = [
    F("In 1904, a woman named Lizzie Magie patented a board game.", {"tipo": "ficha", "titulo": "CASE FILE · THE LANDLORD'S GAME", "linhas": [["Inventor", "Elizabeth \"Lizzie\" Magie"], ["Patent", "U.S. 748,626 · 1904"], ["Purpose", "Show how land grabbing works"]]}),
    F("It was built to prove one thing. Landlords get rich, and everyone else goes broke.", {"tipo": "icones"}),
    F("About thirty years later, a version of her idea became Monopoly.", {"tipo": "ano", "ano": "1935", "de": 1904, "txt": "IT BECOMES MONOPOLY"}),
    F("That same year, Parker Brothers bought her patent.", {"tipo": "ficha", "titulo": "CASE FILE · 1935", "linhas": [["Buyer", "Parker Brothers"], ["Bought", "Magie's game patent"], ["Price", "$500"]]}),
    F("For five hundred dollars.", {"tipo": "numero", "txt": "$500", "rotulo": "FOR HER PATENT"}),
    F("And people have been arguing about how to win it ever since.", {"tipo": "falencia"}),
    F("So we stopped arguing. We built the game in code, with every rule.", {"tipo": "ficha", "titulo": "SIMULATION LAB · RUN ORDER", "linhas": [["Board", "U.S. board, 40 squares"], ["Cards", "Chance + Community Chest"], ["Rules", "doubles, jail, houses, mortgages"]]}),
    F("And we let a computer play it. Ten thousand times.", {"tipo": "contador"}),
    F("Every roll.", {"tipo": "dados", "faces": [3, 4], "txt": "EVERY ROLL"}),
    F("Every rent.", {"tipo": "dinheiro", "txt": "EVERY RENT"}),
    F("Every bankruptcy.", {"tipo": "falencia"}),
    F("Four players. Every game played to the end, until one player owned everything.", {"tipo": "leque", "txt": "PLAYED TO THE END"}),
    F("And the results don't match what most people believe about this game.", {"tipo": "cartas", "modo": "misterio", "selo": "NOT WHAT YOU THINK"}),
    F("By the end of this video, you'll know the one color set that wins half its games,", {"tipo": "cartas", "modo": "misterio", "selo": "WINS 50%", "sub": "ONE COLOR SET"}),
    F("the famous set that quietly loses,", {"tipo": "cartas", "cor": "darkblue", "nome": "PARK PLACE · BOARDWALK", "valor": "?", "rot": "the famous one", "selo": "THE TRAP?"}),
    F("and what you should really do in jail.", {"tipo": "tabuleiro", "modo": "jail"}),
]

cap1 = [
    F("Part one. The board is not fair.", {"tipo": "capitulo", "n": "PART ONE", "txt": "THE BOARD IS NOT FAIR"}),
    F("Here's the board. Forty squares.", {"tipo": "tabuleiro"}),
    F("If dice were the only thing moving you, every square would get the same traffic.", {"tipo": "tabuleiro", "modo": "igual"}),
    F("Two and a half percent each.", {"tipo": "numero", "txt": "2.5%", "rotulo": "PER SQUARE, IF THE BOARD WERE FAIR"}),
    F("But that's not what happens.", {"tipo": "tabuleiro", "modo": "igual"}),
    F("We ran ten thousand games where nobody buys anything.", {"tipo": "ficha", "titulo": "EXPERIMENT 1 · TRAFFIC", "linhas": [["Games", "10,000"], ["Buying", "off"], ["Measure", "where every move ends"]]}),
    F("Just to see where the pieces end up.", {"tipo": "dados", "faces": [5, 2], "txt": "WHERE DO THEY LAND?"}),
    F("And the board lights up like this.", {"tipo": "tabuleiro", "modo": "calor"}),
    F(f"One square gets about four times the traffic of the average square.", {"tipo": "tabuleiro", "modo": "calor", "foco": [10]}),
    F("Jail.", {"tipo": "tabuleiro", "modo": "jail", "selo": f"{p(L[10])}%", "sub": "OF ALL MOVES END HERE"}),
    F(f"In our games, a piece ended its move in jail {p(L[10])} percent of the time.", {"tipo": "numero", "txt": f"{p(L[10])}%", "rotulo": "MOVES THAT END IN JAIL"}),
    F("Because the board keeps sending you there.", {"tipo": "tabuleiro", "modo": "calor", "foco": [30, 10]}),
    F("It isn't one rule. It's four different ways in.", {"tipo": "numero", "txt": "4 WAYS", "rotulo": "INTO JAIL"}),
    F("The Go To Jail square.", {"tipo": "tabuleiro", "modo": "calor", "foco": [30]}),
    F("A card in the Chance deck. A card in Community Chest.", {"tipo": "cartas2", "a": "CHANCE", "b": "COMMUNITY CHEST", "txt": "GO TO JAIL"}),
    F("And three doubles in a row.", {"tipo": "dados", "faces": [6, 6], "txt": "3 DOUBLES = JAIL"}),
    F(f"Go, the square everyone thinks is the busiest, gets {p(L[0], 2)} percent.", {"tipo": "tabuleiro", "modo": "calor", "foco": [0], "selo": f"GO {p(L[0], 2)}%"}),
    F(f"Free Parking, {p(L[20], 2)}.", {"tipo": "tabuleiro", "modo": "calor", "foco": [20]}),
    F("And the quietest squares on the whole board? The Chance squares.", {"tipo": "tabuleiro", "modo": "calor", "foco": [7, 22, 36]}),
    F(f"Below one percent. One of them gets just {p(L[36], 2)}.", {"tipo": "numero", "txt": f"{p(L[36], 2)}%", "rotulo": "THE QUIETEST CHANCE SQUARE"}),
    F("Because most Chance cards pick you up and move you somewhere else.", {"tipo": "cartas2", "a": "CHANCE", "b": "ADVANCE TO...", "txt": "MOVED AWAY"}),
    F("But here's what matters.", {"tipo": "tabuleiro", "modo": "jail"}),
    F("Every one of those players has to leave jail eventually.", {"tipo": "tabuleiro", "modo": "jail"}),
    F("And they all leave from the same spot.", {"tipo": "tabuleiro", "modo": "jail"}),
    F("The most common roll with two dice is a seven.", {"tipo": "dados", "faces": [3, 4], "txt": "MOST COMMON: 7"}),
    F("Six ways out of thirty six. About one roll in six.", {"tipo": "numero", "txt": "6 / 36", "rotulo": "WAYS TO ROLL A 7"}),
    F("Then six and eight.", {"tipo": "dados", "faces": [2, 4], "txt": "THEN 6 AND 8"}),
    F("Then five and nine.", {"tipo": "dados", "faces": [4, 5], "txt": "THEN 5 AND 9"}),
    F("A seven from jail lands on Community Chest. But six, eight and nine?", {"tipo": "tabuleiro", "modo": "saida"}),
    F("Orange. St. James Place, Tennessee Avenue, New York Avenue.", {"tipo": "tabuleiro", "modo": "saida", "foco": [16, 18, 19]}),
    F("Right in the path of everyone walking out of jail.", {"tipo": "tabuleiro", "modo": "saida", "foco": [16, 18, 19], "selo": "ORANGE", "sub": "THE EXIT FROM JAIL"}),
    F(f"Put together, the three orange squares catch {p(R['roi']['orange']['land_prob'] * 100, 2)} percent of every move in the game.", {"tipo": "numero", "txt": f"{p(R['roi']['orange']['land_prob'] * 100, 2)}%", "rotulo": "OF ALL MOVES LAND ON ORANGE"}),
    F("More than any other color set.", {"tipo": "fichas", "modo": "trafego", "ate": 8, "linha": 0}),
    F(f"Dark blue, with only two squares, catches {p(R['roi']['darkblue']['land_prob'] * 100, 2)}.", {"tipo": "carta", "cor": "darkblue", "nome": "PARK PLACE · BOARDWALK", "valor": f"{p(R['roi']['darkblue']['land_prob'] * 100, 2)}%", "rot": "of all moves"}),
    F("The single most visited property is Illinois Avenue.", {"tipo": "carta", "cor": "red", "nome": "ILLINOIS AVE", "valor": f"{p(L[24], 2)}%", "rot": "of all moves"}),
    F("Because a Chance card sends you straight there.", {"tipo": "cartas2", "a": "CHANCE", "b": "ADVANCE TO ILLINOIS", "txt": "STRAIGHT THERE"}),
    F("The railroads are right behind it. Three Chance cards point at them.", {"tipo": "carta", "cor": "#3a352d", "nome": "READING · B&O", "valor": f"{p(L[5], 2)}%", "rot": "Reading Railroad"}),
    F("And near the bottom? Mediterranean Avenue.", {"tipo": "carta", "cor": "brown", "nome": "MEDITERRANEAN", "valor": f"{p(L[1], 2)}%", "rot": "of all moves"}),
    F("And Park Place, sitting right after a Chance square that sends people away.", {"tipo": "carta", "cor": "darkblue", "nome": "PARK PLACE", "valor": f"{p(L[37], 2)}%", "rot": "of all moves"}),
    F("So the board is not fair. But traffic is not the same as money.", {"tipo": "tabuleiro", "modo": "calor"}),
    F(f"Remember that jail number. {p(L[10])} percent. It decides more than you'd think.", {"tipo": "tabuleiro", "modo": "jail", "selo": f"{p(L[10])}%", "sub": "REMEMBER THIS"}),
]

o = ROI['orange']; lb = ROI['lightblue']; db_ = ROI['darkblue']
cap2 = [
    F("Part two. Traffic is not money.", {"tipo": "capitulo", "n": "PART TWO", "txt": "TRAFFIC IS NOT MONEY"}),
    F("A square only pays when it has rent on it.", {"tipo": "dinheiro", "txt": "RENT = MONEY"}),
    F("So for every color set, we did the math.", {"tipo": "ficha", "titulo": "EXPERIMENT 2 · RETURN", "linhas": [["Input", "traffic from 10,000 games"], ["Measure", "rent per $1,000 invested"], ["Per", "every opponent turn"]]}),
    F("How much rent you collect for every thousand dollars you put in.", {"tipo": "numero", "txt": "$1,000", "rotulo": "INVESTED IN ONE SET"}),
    F("With no houses, every set is almost worthless.", {"tipo": "degraus", "cor": "orange", "ate": 0, "vals": [p(o[h]['per_1000']) for h in range(6)]}),
    F(f"Orange pays about {o[0]['per_1000']:.0f} dollars per turn, per thousand.", {"tipo": "degraus", "cor": "orange", "ate": 0, "vals": [p(o[h]['per_1000']) for h in range(6)], "selo": f"${o[0]['per_1000']:.1f}"}),
    F("One house, a little better.", {"tipo": "degraus", "cor": "orange", "ate": 1, "vals": [p(o[h]['per_1000']) for h in range(6)]}),
    F("Two houses, better.", {"tipo": "degraus", "cor": "orange", "ate": 2, "vals": [p(o[h]['per_1000']) for h in range(6)]}),
    F("And then, at three houses, something strange happens.", {"tipo": "degraus", "cor": "orange", "ate": 3, "vals": [p(o[h]['per_1000']) for h in range(6)]}),
    F("The return doesn't just grow. It doubles.", {"tipo": "degraus", "cor": "orange", "ate": 3, "vals": [p(o[h]['per_1000']) for h in range(6)], "selo": "×2"}),
    F(f"For orange, it jumps from about {o[2]['per_1000']:.0f} dollars to {o[3]['per_1000']:.0f}.", {"tipo": "numero", "txt": f"${o[3]['per_1000']:.0f}", "rotulo": f"FROM ${o[2]['per_1000']:.0f} · ORANGE AT 3 HOUSES"}),
    F("After three, the extra houses add much less.", {"tipo": "degraus", "cor": "orange", "ate": 5, "vals": [p(o[h]['per_1000']) for h in range(6)]}),
    F("Four houses, a little more. A hotel, a little more again.", {"tipo": "degraus", "cor": "orange", "ate": 5, "vals": [p(o[h]['per_1000']) for h in range(6)], "selo": "+ SMALL"}),
    F("And it's not just orange. Every set has the same jump at three houses.", {"tipo": "fichas", "modo": "roi", "ate": 8, "linha": 0}),
    F(f"At three houses, orange pays {o[3]['per_1000']:.0f} dollars, the best on the board.", {"tipo": "fichas", "modo": "roi", "ate": 1, "linha": 0}),
    F(f"Red, {ROI['red'][3]['per_1000']:.1f}. Dark blue, {ROI['darkblue'][3]['per_1000']:.1f}. Yellow, {ROI['yellow'][3]['per_1000']:.1f}.", {"tipo": "fichas", "modo": "roi", "ate": 4, "linha": 0}),
    F(f"Brown pays just {ROI['brown'][3]['per_1000']:.1f}. Less than half of orange.", {"tipo": "fichas", "modo": "roi", "ate": 8, "linha": 0, "selo": f"BROWN ${ROI['brown'][3]['per_1000']:.1f}"}),
    F("Here's another way to see it. How long until the houses pay for themselves?", {"tipo": "ampulheta", "txt": "PAYBACK TIME"}),
    F(f"Orange at three houses earns back everything you spent in about {o[3]['turns_to_break_even_3opp']:.0f} rounds.", {"tipo": "numero", "txt": f"{o[3]['turns_to_break_even_3opp']:.0f} ROUNDS", "rotulo": "ORANGE · 3 HOUSES · 3 OPPONENTS"}),
    F(f"Brown at three houses needs about {ROI['brown'][3]['turns_to_break_even_3opp']:.0f}.", {"tipo": "numero", "txt": f"{ROI['brown'][3]['turns_to_break_even_3opp']:.0f} ROUNDS", "rotulo": "BROWN · 3 HOUSES · 3 OPPONENTS"}),
    F(f"And a typical game in our simulation lasted only {R['tournament']['median_rounds']} rounds.", {"tipo": "numero", "txt": f"{R['tournament']['median_rounds']} ROUNDS", "rotulo": "A TYPICAL GAME"}),
    F("That's the first rule the simulation gave us.", {"tipo": "ficha", "titulo": "RULE 1", "linhas": [["Do", "get every property to 3 houses"], ["When", "as fast as you can"]], "selo": "PROVEN"}),
    F("Get every property in your set to three houses, as fast as you can.", {"tipo": "degraus", "cor": "orange", "ate": 3, "vals": [p(o[h]['per_1000']) for h in range(6)], "selo": "3 HOUSES"}),
    F("And that's where the price of houses starts to matter.", {"tipo": "degraus", "cor": "green", "ate": 3, "vals": ["", "", "", "", "", ""]}),
    F("Pink and orange houses cost a hundred dollars each.", {"tipo": "conta", "linha": "1 house · pink or orange", "txt": "$100", "rotulo": "PER HOUSE"}),
    F("Green and dark blue houses cost two hundred.", {"tipo": "conta", "linha": "1 house · green or dark blue", "txt": "$200", "rotulo": "PER HOUSE"}),
    F(f"Getting all of orange to three houses costs {ROI['orange'][3]['invest']:,} dollars, properties included.", {"tipo": "conta", "linha": "3 squares + 9 houses", "txt": f"${ROI['orange'][3]['invest']:,}", "rotulo": "ORANGE · 3 HOUSES EACH"}),
    F(f"Green costs {ROI['green'][3]['invest']:,}. Almost twice as much.", {"tipo": "conta", "linha": "3 squares + 9 houses", "txt": f"${ROI['green'][3]['invest']:,}", "rotulo": "GREEN · 3 HOUSES EACH"}),
    F("And it pays less per dollar.", {"tipo": "fichas", "modo": "roi", "ate": 8, "linha": 0}),
    F("So on paper, orange looks unbeatable.", {"tipo": "carta", "cor": "orange", "nome": "ST. JAMES · TENNESSEE · NEW YORK", "valor": "$32", "rot": "per $1,000, per turn"}),
    F("But paper doesn't go bankrupt. Real players do.", {"tipo": "falencia"}),
    F("So does any of this survive an actual game?", {"tipo": "dados", "faces": [2, 3], "txt": "DOES IT SURVIVE?"}),
    F("But math on paper is one thing. Real games are messy.", {"tipo": "falencia"}),
]

ord_ = sorted(T.items(), key=lambda kv: -kv[1])
cap3 = [
    F("Part three. The real test.", {"tipo": "capitulo", "n": "PART THREE", "txt": "THE REAL TEST"}),
    F("People go bankrupt. They mortgage everything. They get lucky.", {"tipo": "dados", "faces": [6, 5], "txt": "LUCK"}),
    F("So we ran the real thing. Ten thousand full games, four players each.", {"tipo": "contador"}),
    F("Every player started already owning one complete color set.", {"tipo": "leque", "txt": "1 FULL SET EACH"}),
    F("A different one for each player.", {"tipo": "leque", "txt": "4 PLAYERS · 4 SETS"}),
    F("Everything else, they bought when they landed on it.", {"tipo": "dinheiro", "txt": "BUY WHEN YOU LAND"}),
    F("Here's exactly how our players behave. No secrets.", {"tipo": "ficha", "titulo": "LAB RULES · HOW THE PLAYERS PLAY", "linhas": [["Buy", "any free square they land on"], ["Build", "evenly, across the whole set"], ["Broke", "sell houses, then mortgage"]]}),
    F("They buy any square they land on, if they have the cash.", {"tipo": "dinheiro", "txt": "BUY IF YOU CAN"}),
    F("They build houses evenly across the whole set, the way the rules say.", {"tipo": "degraus", "cor": "pink", "ate": 3, "vals": ["", "", "", "", "", ""]}),
    F("When they run out of money, they sell houses at half price, then mortgage.", {"tipo": "conta", "linha": "sell 1 house", "txt": "50%", "rotulo": "OF WHAT YOU PAID"}),
    F("And when there's nothing left, they're out.", {"tipo": "falencia"}),
    F("Two things they don't do. No auctions, and no trades.", {"tipo": "teste", "a": "AUCTIONS", "b": "TRADES", "pa": "OFF", "pb": "OFF"}),
    F("Because trading depends on people, and people are impossible to simulate fairly.", {"tipo": "numero", "txt": "NO TRADES", "rotulo": "SO THE SETS DO THE TALKING"}),
    F("That way, the only thing that changes between players is the set they started with.", {"tipo": "leque", "txt": "ONLY THE SET CHANGES"}),
    F("If every set were equally good, each would win one game in four.", {"tipo": "fichas", "ate": 0, "linha": 25}),
    F("Twenty five percent. That's the line to beat.", {"tipo": "fichas", "ate": 0, "linha": 25, "selo": "25% = FAIR"}),
    F("Before the answer, make a guess. Which set wins the most?", {"tipo": "leque", "txt": "MAKE A GUESS"}),
    F("And which one loses the most?", {"tipo": "cartas", "modo": "misterio", "selo": "?"}),
    F(f"Orange won {p(T['orange'])} percent of its games.", {"tipo": "fichas", "ate": 1, "linha": 25, "selo": f"ORANGE {p(T['orange'])}%"}),
    F("Basically half. Twice its fair share.", {"tipo": "numero", "txt": "×2", "rotulo": "ORANGE VS A FAIR SHARE"}),
    F(f"Second place, pink, at {T['pink']:.0f} percent.", {"tipo": "fichas", "ate": 2, "linha": 25}),
    F("The other set right after jail, with cheap houses.", {"tipo": "tabuleiro", "modo": "saida", "foco": [11, 13, 14]}),
    F(f"Then red, {T['red']:.0f}. Yellow, {T['yellow']:.0f}.", {"tipo": "fichas", "ate": 4, "linha": 25}),
    F(f"Light blue, {T['lightblue']:.0f}.", {"tipo": "fichas", "ate": 5, "linha": 25}),
    F("And now, the famous one.", {"tipo": "cartas", "cor": "darkblue", "nome": "PARK PLACE · BOARDWALK", "valor": "?", "rot": "the most expensive set"}),
    F("Park Place and Boardwalk. The most expensive set on the board.", {"tipo": "cartas", "cor": "darkblue", "nome": "PARK PLACE · BOARDWALK", "valor": "$750", "rot": "to buy both"}),
    F(f"It won {T['darkblue']:.0f} percent of its games.", {"tipo": "fichas", "ate": 6, "linha": 25, "selo": f"DARK BLUE {T['darkblue']:.0f}%"}),
    F(f"Green, the most expensive set to build on, did even worse. {T['green']:.0f}.", {"tipo": "fichas", "ate": 7, "linha": 25}),
    F("And brown? Mediterranean and Baltic?", {"tipo": "carta", "cor": "brown", "nome": "MEDITERRANEAN · BALTIC", "valor": "?", "rot": "the cheapest set"}),
    F("One percent. About one game in a hundred.", {"tipo": "fichas", "ate": 8, "linha": 25, "selo": "BROWN 1%"}),
    F("Now look at the pattern.", {"tipo": "fichas", "ate": 8, "linha": 25}),
    F("The top two, orange and pink, both sit right after jail. Both have hundred dollar houses.", {"tipo": "tabuleiro", "modo": "saida", "foco": [11, 13, 14, 16, 18, 19]}),
    F("Just above brown, at the bottom, sit green and dark blue. The two sets with two hundred dollar houses.", {"tipo": "tabuleiro", "modo": "calor", "foco": [31, 32, 34, 37, 39]}),
    F("Traffic matters. But the price of getting to three houses matters too.", {"tipo": "degraus", "cor": "orange", "ate": 3, "vals": [p(o[h]['per_1000']) for h in range(6)]}),
    F("But a four player game can hide things.", {"tipo": "leque", "txt": "WHAT'S HIDING?"}),
    F("So we ran one more experiment. Just two players. One set each.", {"tipo": "ficha", "titulo": "EXPERIMENT 4 · DUELS", "linhas": [["Players", "2"], ["Start", "one full set each"], ["Games", "1,000 per matchup"]]}),
    F("A thousand games for every possible matchup.", {"tipo": "contador"}),
    F(f"Orange beat dark blue {D['orange|darkblue'] * 100:.0f} percent of the time.", {"tipo": "duelo", "a": "orange", "b": "darkblue", "pa": f"{D['orange|darkblue'] * 100:.0f}%", "pb": f"{100 - D['orange|darkblue'] * 100:.0f}%"}),
    F(f"It beat green {D['orange|green'] * 100:.0f} percent of the time.", {"tipo": "duelo", "a": "orange", "b": "green", "pa": f"{D['orange|green'] * 100:.0f}%", "pb": f"{100 - D['orange|green'] * 100:.0f}%"}),
    F("But look at this one.", {"tipo": "duelo", "a": "lightblue", "b": "darkblue", "pa": "?", "pb": "?"}),
    F("Light blue. One of the cheapest sets in the game.", {"tipo": "carta", "cor": "lightblue", "nome": "ORIENTAL · VERMONT · CONNECTICUT", "valor": "$320", "rot": "to buy all three"}),
    F(f"Against Park Place and Boardwalk, it wins {D['lightblue|darkblue'] * 100:.0f} percent.", {"tipo": "duelo", "a": "lightblue", "b": "darkblue", "pa": f"{D['lightblue|darkblue'] * 100:.0f}%", "pb": f"{100 - D['lightblue|darkblue'] * 100:.0f}%", "selo": "CHEAP WINS"}),
    F("The cheap set beats the famous one.", {"tipo": "numero", "txt": "$320 > $750", "rotulo": "LIGHT BLUE BEATS DARK BLUE"}),
    F(f"Light blue also beats green, {D['lightblue|green'] * 100:.0f} percent of the time.", {"tipo": "duelo", "a": "lightblue", "b": "green", "pa": f"{D['lightblue|green'] * 100:.0f}%", "pb": f"{100 - D['lightblue|green'] * 100:.0f}%"}),
    F(f"Even against orange, pink keeps it close. It wins {D['pink|orange'] * 100:.0f} percent.", {"tipo": "duelo", "a": "pink", "b": "orange", "pa": f"{D['pink|orange'] * 100:.0f}%", "pb": f"{100 - D['pink|orange'] * 100:.0f}%"}),
    F(f"And brown's best matchup? Dark blue. Brown wins {D['brown|darkblue'] * 100:.0f} percent of those.", {"tipo": "duelo", "a": "brown", "b": "darkblue", "pa": f"{D['brown|darkblue'] * 100:.0f}%", "pb": f"{100 - D['brown|darkblue'] * 100:.0f}%"}),
    F("The cheapest set does best against the most expensive one.", {"tipo": "numero", "txt": "CHEAP > FAMOUS", "rotulo": "AGAIN"}),
    F("Because in a real game, speed beats size.", {"tipo": "dados", "faces": [1, 2], "txt": "SPEED > SIZE"}),
    F("Three houses on all of light blue cost four hundred and fifty dollars.", {"tipo": "conta", "linha": "9 houses × $50", "txt": "$450", "rotulo": "LIGHT BLUE · 3 HOUSES EACH"}),
    F("Three houses on Park Place and Boardwalk cost twelve hundred.", {"tipo": "conta", "linha": "6 houses × $200", "txt": "$1,200", "rotulo": "DARK BLUE · 3 HOUSES EACH"}),
    F("By the time you can afford them, someone else is already collecting.", {"tipo": "dinheiro", "txt": "TOO LATE"}),
    F("One more surprise. The railroads.", {"tipo": "carta", "cor": "#3a352d", "nome": "ALL 4 RAILROADS", "valor": "?", "rot": "a famous favorite"}),
    F("Four of them. Steady rent, no houses needed. A lot of players love them.", {"tipo": "dinheiro", "txt": "STEADY RENT"}),
    F(f"A player who started with all four, against three players with color sets, won only {R['rails'] * 100:.0f} percent.", {"tipo": "carta", "cor": "#3a352d", "nome": "ALL 4 RAILROADS", "valor": f"{R['rails'] * 100:.0f}%", "rot": "games won vs 3 color sets"}),
]

j = R['jail']; h = R['hotel']; s = R['tournament']['seat']
cap4 = [
    F("Part four. Three famous tricks. Tested.", {"tipo": "capitulo", "n": "PART FOUR", "txt": "THREE TRICKS, TESTED"}),
    F("So picking the right set is huge. But it's not the only thing that matters.", {"tipo": "leque", "txt": "NOT THE ONLY THING"}),
    F("So we know which sets win. But you don't always get to choose your set.", {"tipo": "leque", "txt": "YOU DON'T ALWAYS CHOOSE"}),
    F("What you do choose is how you play. So we tested the three most famous moves.", {"tipo": "ficha", "titulo": "EXPERIMENT 5 · PLAYSTYLE", "linhas": [["Test 1", "jail: pay or stay"], ["Test 2", "hotels or hoard houses"], ["Test 3", "who goes first"]]}),
    F("Every Monopoly player has an opinion about jail.", {"tipo": "tabuleiro", "modo": "jail"}),
    F("Pay the fifty dollars and get out? Or sit there and roll for doubles?", {"tipo": "teste", "a": "PAY $50, GET OUT", "b": "STAY AND ROLL"}),
    F("So we tested it. Ten thousand games where one player always pays right away.", {"tipo": "teste", "a": "PAY $50, GET OUT", "b": "STAY AND ROLL", "pa": "?", "pb": ""}),
    F("And ten thousand where the same player always stays and rolls.", {"tipo": "teste", "a": "PAY $50, GET OUT", "b": "STAY AND ROLL", "pa": "?", "pb": "?"}),
    F(f"Paying won {p(j['pay']*100)} percent. Staying won {p(j['roll']*100)}.", {"tipo": "teste", "a": "PAY $50, GET OUT", "b": "STAY AND ROLL", "pa": f"{p(j['pay']*100)}%", "pb": f"{p(j['roll']*100)}%", "vence": "b"}),
    F("Staying in jail wins more.", {"tipo": "numero", "txt": "STAY", "rotulo": "JAIL IS A SAFE PLACE TO WAIT"}),
    F("Because while you sit there, you're not paying anyone's rent.", {"tipo": "tabuleiro", "modo": "jail", "selo": "NO RENT", "sub": "WHILE YOU WAIT"}),
    F("Early in the game, though, there's nothing dangerous out there yet.", {"tipo": "tabuleiro", "modo": "igual"}),
    F("So we tried a smarter rule. Pay to get out while nobody has houses.", {"tipo": "teste", "a": "PAY EARLY", "b": "STAY ONCE HOUSES APPEAR", "pa": "?", "pb": "?"}),
    F("And stay in jail once anyone else starts building.", {"tipo": "teste", "a": "PAY EARLY", "b": "STAY ONCE HOUSES APPEAR", "pa": "?", "pb": "?"}),
    F(f"That rule won {p(j['smart']*100)} percent. The best of all three.", {"tipo": "numero", "txt": f"{p(j['smart']*100)}%", "rotulo": "PAY EARLY, STAY LATE"}),
    F("Trick number two. There are only thirty two houses in the box.", {"tipo": "numero", "txt": "32", "rotulo": "HOUSES IN THE BOX"}),
    F("Some players stop at four houses and never build hotels.", {"tipo": "degraus", "cor": "red", "ate": 4, "vals": ["", "", "", "", "", ""]}),
    F("So nobody else can get any houses. It's the most famous advanced trick.", {"tipo": "teste", "a": "BUILD HOTELS", "b": "HOARD HOUSES", "pa": "?", "pb": "?"}),
    F("In our games, it lost.", {"tipo": "teste", "a": "BUILD HOTELS", "b": "HOARD HOUSES", "pa": f"{p(h['hotel']*100)}%", "pb": f"{p(h['four']*100)}%", "vence": "a"}),
    F(f"The player who hoarded houses won {p(h['four']*100)} percent. Building hotels won {p(h['hotel']*100)}.", {"tipo": "numero", "txt": f"{p(h['hotel']*100)}%", "rotulo": "BUILD THE HOTEL"}),
    F("And the one thing you can't control. Who goes first.", {"tipo": "dados", "faces": [6, 4], "txt": "WHO GOES FIRST?"}),
    F(f"The player who rolled first won {p(s['0'] * 100)} percent.", {"tipo": "fichas", "modo": "lugar", "ate": 1, "linha": 25}),
    F(f"The player who rolled last, {p(s['3'] * 100)}.", {"tipo": "fichas", "modo": "lugar", "ate": 4, "linha": 25}),
    F("Going first is worth about one extra win every twenty games.", {"tipo": "numero", "txt": "+1 IN 20", "rotulo": "GOING FIRST"}),
    F("So if you get to choose, choose first.", {"tipo": "dados", "faces": [6, 6], "txt": "GO FIRST"}),
]

fim = [
    F("Let's put it all together.", {"tipo": "contador"}),
    F("So here's the strategy ten thousand games gave us.", {"tipo": "lista", "itens": [], "titulo": "THE 10,000-GAME STRATEGY"}),
    F("One. Fight for orange.", {"tipo": "lista", "titulo": "THE 10,000-GAME STRATEGY", "itens": ["Fight for orange"]}),
    F("If you can't get it, go for pink, red or light blue.", {"tipo": "lista", "titulo": "THE 10,000-GAME STRATEGY", "itens": ["Fight for orange", "Then pink, red or light blue"]}),
    F("Two. Build to three houses as fast as you can.", {"tipo": "lista", "titulo": "THE 10,000-GAME STRATEGY", "itens": ["Fight for orange", "Then pink, red or light blue", "3 houses, fast"]}),
    F("Three. In jail, pay early, but stay once the houses go up.", {"tipo": "lista", "titulo": "THE 10,000-GAME STRATEGY", "itens": ["Fight for orange", "Then pink, red or light blue", "3 houses, fast", "Jail: pay early, stay late"]}),
    F("Four. Build the hotel.", {"tipo": "lista", "titulo": "THE 10,000-GAME STRATEGY", "itens": ["Fight for orange", "Then pink, red or light blue", "3 houses, fast", "Jail: pay early, stay late", "Build the hotel"]}),
    F("And don't fall in love with Park Place and Boardwalk.", {"tipo": "cartas", "cor": "darkblue", "nome": "PARK PLACE · BOARDWALK", "valor": f"{T['darkblue']:.0f}%", "rot": "of games won", "selo": "THE TRAP"}),
    F("The reason for all of it is the square nobody wants.", {"tipo": "tabuleiro", "modo": "calor"}),
    F("Jail. The busiest place on the board.", {"tipo": "tabuleiro", "modo": "jail", "selo": f"{p(L[10])}%", "sub": "OF ALL MOVES"}),
    F("And whoever owns the way out, owns the game.", {"tipo": "tabuleiro", "modo": "saida", "foco": [16, 18, 19], "selo": "THE WAY OUT"}),
    F("In 1904, Lizzie Magie wanted to show that one player owning everything ruins the rest.", {"tipo": "ficha", "titulo": "CASE FILE · THE LANDLORD'S GAME", "linhas": [["Inventor", "Elizabeth \"Lizzie\" Magie"], ["Patent", "U.S. 748,626 · 1904"], ["Purpose", "Show how land grabbing works"]], "selo": "CONFIRMED"}),
    F("She sold her patent for five hundred dollars.", {"tipo": "numero", "txt": "$500", "rotulo": "1935"}),
    F("Ten thousand games later, the board still makes her point.", {"tipo": "contador"}),
    F("The player who owns the right squares first doesn't just win. Everyone else goes broke.", {"tipo": "falencia"}),
    F("Which set do you always go for? Tell us in the comments.", {"tipo": "leque", "txt": "WHICH SET IS YOURS?"}),
    F("And subscribe, to see what we run ten thousand times next.", {"tipo": "fim"}),
]

spec = {
    "id": "ttr001a", "canal": "ten-thousand-runs", "titulo": "We Simulated 10,000 Games of Monopoly. One Color Wins Twice as Often",
    "voz": "am_michael", "velocidade": 1.0, "lang": "en-us", "legenda": True, "acento": "#ffd23f", "marca": "TEN THOUSAND RUNS", "trilha": 0.14, "cauda": 4.0,
    "numeros": {"ten thousand": "10,000", "two and a half percent": "2.5%", "twenty five percent": "25%", "thirty two": "32", "four hundred and fifty dollars": "$450", "twelve hundred": "$1,200", "fifty dollars": "$50"},
    "blocos": [],
}
caps_nome = {1: 'The board is not fair', 2: 'Traffic is not money', 3: 'The real test', 4: 'Three tricks, tested', 5: 'The strategy'}
for i, cap in enumerate([intro, cap1, cap2, cap3, cap4, fim]):
    cena = {"tipo": "arte" if i in (0, 5) else "capitulo", "v": [v for _, v in cap]}
    if i not in (0, 5): cena.update({"n": i, "titulo": caps_nome[i]})
    spec["blocos"].append({"cena": cena, "falas": [t for t, _ in cap]})

NOME = {'brown': 'BROWN', 'lightblue': 'LIGHT BLUE', 'pink': 'PINK', 'orange': 'ORANGE', 'red': 'RED', 'yellow': 'YELLOW', 'green': 'GREEN', 'darkblue': 'DARK BLUE'}
CALOR = [round(L[i], 3) for i in range(40)]
for b in spec['blocos']:
    for v in b['cena']['v']:
        if v['tipo'] == 'tabuleiro': v['calor'] = CALOR
        if v['tipo'] == 'fichas':
            m = v.get('modo', 'torneio')
            if m == 'torneio': it = [{'cor': c, 'nome': NOME[c], 'v': round(x, 1)} for c, x in ord_]; v['rotulo'] = 'WIN RATE · 10,000 GAMES'
            elif m == 'lugar': it = [{'cor': '#c9b98f', 'nome': f'PLAYER {k + 1}', 'v': round(R['tournament']['seat'][str(k)] * 100, 1)} for k in range(4)]; v['rotulo'] = 'WIN RATE BY TURN ORDER'
            elif m == 'trafego': it = sorted([{'cor': c, 'nome': NOME[c], 'v': round(R['roi'][c]['land_prob'] * 100, 2)} for c in NOME], key=lambda x: -x['v']); v['rotulo'] = 'SHARE OF ALL MOVES, PER SET'
            else: it = sorted([{'cor': c, 'nome': NOME[c], 'v': round(ROI[c][3]['per_1000'], 1)} for c in NOME], key=lambda x: -x['v']); v['rotulo'] = 'RENT PER $1,000 · 3 HOUSES'; v['pre'] = '$'
            v['itens'] = it; v.setdefault('ate', len(it))
ant = None
for b in spec['blocos']:
    for v in b['cena']['v']:
        if ant is not None and ant['tipo'] == v['tipo'] and v['tipo'] in ('fichas', 'degraus') and ant.get('cor') == v.get('cor') and ant.get('modo') == v.get('modo'):
            v['de'] = ant.get('ate', 0) if v['tipo'] == 'fichas' else ant.get('ate', -1)
        ant = v
json.dump(spec, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'spec.json'), 'w'), ensure_ascii=False, indent=1)
txt = ' '.join(t for b in spec['blocos'] for t in b['falas'])
print(len(txt.split()), 'palavras', sum(len(b['falas']) for b in spec['blocos']), 'falas')

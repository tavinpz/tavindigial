# Hard to Copy #05: o filme ABF da Ajinomoto. Uso: python3 hc005_roteiro.py <pasta de saída>
# Fontes por fato: ver HARD-TO-COPY.md (Ajinomoto: história do ABF, cronologia e apresentação de 30/06/2026; TrendForce 08/05/2026; R&D World; Tom's Hardware 09/2026).
from htc_comum import F, N, Roteiro
NOMES = [['THE LAYERS', 'What sits under every chip'], ['THE RECIPE', 'A film born from seasoning chemistry'], ['THE STANDARD', 'A whole industry tuned to one film'], ['THE APPETITE', 'AI needs ten times more of it'], ['? ? ?', 'Not technology at all']]
r = Roteiro(NOMES, 'CHEMISTRY + ENGINEERING'); B = r.B; TRAVA = r.TRAVA; TR = r.TR

B('gancho', fonte='AJINOMOTO GROUP', falas=[
 F("This is a jar of seasoning. M-S-G. The stuff that makes soup taste better.", **N(d='pote', n=1, k='A jar of seasoning. *MSG*.')),
 F("And this is one of the most advanced AI chips in the world.", n=2, k='One of the most advanced *AI chips* in the world.'),
 F("The company that makes the first one, makes a part of the second one. And nobody else on Earth can.", p=0.3, n=3, k=None),
])
B('aposta', fonte='AJINOMOTO (COMPANY FIGURE, VIA R&D WORLD)', falas=[
 F("It's a thin plastic film. And the seasoning company has more than ninety five percent of the market.", **N(d='rosca', pc=95, pre='', n=1, t='ONE FOOD COMPANY', sub='share of the insulating film in high-end chip packages', resto='EVERYONE ELSE: UNDER 5%', cor='menta')),
 F("Nvidia's chips need it. A-M-D's chips need it. Intel's chips need it.", n=2, linhas=['Nvidia, AMD and Intel all need it']),
 F("And it's made by the people who sell you frozen dumplings.", p=0.3, n=3, linhas=['Nvidia, AMD and Intel all need it', 'Made by a company that sells seasoning']),
])
CASO = [['THE BEST CHEMISTS IN THE WORLD', 1], ['BILLIONS OF DOLLARS', 1], ['EVERY REASON TO WANT A SECOND SUPPLIER', 1], ['A SECOND SUPPLIER', 0]]
B('caso', falas=[
 F("Think about how strange that is. The chip industry has the best chemists in the world.", **N(d='check', it=CASO, n=1, cab='THE CHIP INDUSTRY HAS')),
 F("It has billions of dollars.", n=2),
 F("And it has every reason to want a second supplier.", n=3),
 F("It's had more than twenty five years to find one.", k='More than *25 years* to find one.'),
 F("It still doesn't have one.", p=0.4, n=4, k=None),
])
B('mapa', [
 F("So why can't anyone copy a piece of plastic?", **N(d='big', t='WHY?', sub="Why can't anyone copy a piece of plastic?", cor='ambar')),
 F("There are five locks.", **TR(ab=0, at=0, n=1, tl=['Five locks.'])),
 F("Four of them are chemistry and engineering.", n=2),
 F("The fifth is the strangest one in this whole series.", n=3, tl=['Five locks.', 'The last one', 'is *the strangest*.']),
 F("It's that the prize is too small.", p=0.4, k='The prize is *too small*.'),
])

# ---------- TRAVA 1
B('cam0', trava=1, nome='THE LAYERS', falas=[F("Lock one. The layers.", **TRAVA(1, 'THE LAYERS'))])
B('cam1', trava=1, nome='THE LAYERS', fonte='AJINOMOTO (ABF) · ILLUSTRATION, NOT TO SCALE', falas=[
 F("A chip can't be plugged straight into a computer.", **N(d='sub', n=0, tit=['Under every chip: *a tiny skyscraper* of wiring.'])),
 F("The connections on the chip are far too small. The connections on the board are far too big.", n=1),
 F("So between them sits a part called the substrate. Its job is to fan thousands of tiny connections out into bigger ones.", n=2),
 F("Zoom in, and it's built like a skyscraper. A layer of copper wiring. Then a layer of insulation. Then copper again.", n=3),
 F("Over and over, with tiny holes drilled by laser to connect one floor to the next.", n=4),
 F("That insulation is the film. Every floor of the skyscraper stands on it.", p=0.3, n=5, k='Every floor stands on *the film*.'),
])
B('cam2', trava=1, nome='THE LAYERS', falas=[
 F("If the insulation is uneven, the wiring on top of it is uneven.", **N(d='duas', l1='Uneven insulation,', l2='', n=1)),
 F("And one bad floor ruins the whole building.", p=0.3, n=2, l2='one bad floor ruins the building.'),
 F("So the film has to be perfectly flat, perfectly clean, and exactly the same, every single time.", k='Flat. Clean. *Exactly the same*, every time.'),
])

# ---------- TRAVA 2
B('rec0', trava=2, nome='THE RECIPE', falas=[F("Lock two. The recipe.", **TRAVA(2, 'THE RECIPE'))])
B('rec1', trava=2, nome='THE RECIPE', fonte='AJINOMOTO GROUP (ABF STORY)', falas=[
 F("In the nineteen nineties, that insulation wasn't a film. It was a liquid. An ink.", **N(d='tinta', n=0, tit=['It used to be *an ink*.'])),
 F("You spread it on, and waited for it to dry.", n=1),
 F("It was slow. It picked up dust. And it didn't dry perfectly flat.", n=2),
 F("The chip industry wanted something better. A solid film you could just press on.", n=3),
 F("In nineteen ninety six, a chipmaker asked a very unlikely company to make one.", p=0.3, k='1996: a chipmaker asks *a very unlikely company*.'),
])
B('rec2', trava=2, nome='THE RECIPE', fonte='AJINOMOTO GROUP (ABF STORY · COMPANY CHRONOLOGY)', falas=[
 F("Ajinomoto had been making M-S-G since nineteen oh nine.", **N(d='linhaT', pts=[[1909, 'SEASONING', 'MSG'], [1975, 'RESEARCH', 'BEYOND FOOD', None, '1970s'], [1996, 'THE REQUEST', 'A FILM INSULATOR', 'ambar'], [1999, 'THE FILM', 'GOES ON SALE', 'menta']], n=1, de=1909, ate=1999)),
 F("Making it leaves behind a lot of chemistry. And since the nineteen seventies, the company had been studying what else that chemistry could do.", n=2),
 F("Some of it turned out to make excellent resins. The kind used in electronics.", k='Seasoning chemistry made *excellent resins*.'),
 F("So when the request came, a young researcher named Shigeo Nakamura took it on.", n=3, k=None),
 F("He picked a resin so unstable, it had to be kept in a deep freezer. He later called that choice young and naive.", k='A resin that had to live *in a deep freezer*.'),
 F("It worked. According to Ajinomoto, the film was perfected in four months.", k='Perfected in *four months*.'),
 F("It went on sale in nineteen ninety nine.", p=0.3, n=4, k=None),
])
B('rec3', trava=2, nome='THE RECIPE', falas=[
 F("So the recipe isn't one invention you can look up.", **N(d='big', rot='THE RECIPE IS', t='90 YEARS DEEP', cor='ambar')),
 F("It sits on top of ninety years of chemistry, that started with soup.", p=0.3, sub='Ninety years of chemistry that started with soup.'),
])

# ---------- TRAVA 3
B('pad0', trava=3, nome='THE STANDARD', falas=[F("Lock three. The standard.", **TRAVA(3, 'THE STANDARD'))])
B('pad1', trava=3, nome='THE STANDARD', fonte='AJINOMOTO GROUP (ABF STORY)', falas=[
 F("In nineteen ninety nine, the biggest processor maker in the world adopted the film.", **N(d='big', rot='ADOPTED BY THE LARGEST CPU MAKER', t='1999', cor='osso')),
 F("Nakamura assumed it would stay in production for about ten years.", **N(d='barras', cab='HOW LONG THE FILM HAS LASTED', it=[['EXPECTED', 10, '≈ 10 YEARS'], ['SO FAR', 27, '27 YEARS', 'menta']], n=1)),
 F("That was twenty seven years ago.", p=0.3, n=2),
])
B('pad2', trava=3, nome='THE STANDARD', falas=[
 F("Here's why it never left.", **N(d='cadeia', it=[['THE FILM', 'ONE SUPPLIER', 'menta'], ['SUBSTRATE MAKERS', 'TOOLS TUNED TO THE FILM', 'fantasma'], ['CHIP DESIGNERS', 'DESIGN FOR THAT SUBSTRATE', 'fantasma'], ['THE AI CHIP', 'TESTED FOR MONTHS', 'osso']], n=1, tit=['Everything downstream is *tuned to it*.'])),
 F("The companies that build substrates set up their whole factories around this one film. Their presses. Their lasers. Their chemical baths.", n=2),
 F("The chip designers then design their chips for those substrates.", n=3),
 F("And every new chip is tested for months on that exact combination, before a single one ships.", n=4),
 F("Change the film, and you don't change one part. You restart all of that.", p=0.3, k="Change the film, and you *restart all of that*."),
])
B('cta1', trava=3, nome='THE STANDARD', falas=[
 F("Quick question, before the next lock.", **N(d='cta', ic='com', t=['QUICK QUESTION'], n=0)),
 F("If a part costs you almost nothing, but a failure costs you the whole chip, how much cheaper would a new supplier have to be, before you'd switch?", n=1, t=['HOW MUCH CHEAPER', 'TO RISK IT?']),
 F("Put your answer in the comments. Keep it in mind for lock five.", n=2, s='Comment your answer'),
])

# ---------- TRAVA 4
B('ape0', trava=4, nome='THE APPETITE', falas=[F("Lock four. The appetite.", **TRAVA(4, 'THE APPETITE'))])
B('ape1', trava=4, nome='THE APPETITE', fonte='SEMIANALYSIS DATA, VIA TECHNEWS AND R&D WORLD', falas=[
 F("A processor from ten years ago sat on a substrate with about four to six layers of this film.", **N(d='barras', cab='LAYERS OF FILM UNDER ONE CHIP', it=[['PC CHIP, 10 YEARS AGO', 6, '4–6'], ['AI CHIP TODAY', 24, '20–24', 'ambar']], n=1, tit=['AI chips eat *far more film*.'])),
 F("The newest AI accelerators use twenty to twenty four.", n=2),
 F("And the packages are much bigger. So each one needs more film on every layer, too.", k='More layers. And *bigger* layers.'),
 F("Ajinomoto's own math says a high performance substrate uses over ten times more film than one for a PC.", p=0.3, k='Over *10 times* more film than a PC chip.'),
])
B('ape2', trava=4, nome='THE APPETITE', fonte="AJINOMOTO BRIEFING, JUNE 30, 2026 · TOM'S HARDWARE", falas=[
 F("And it isn't the same film as in nineteen ninety nine.", **N(d='big', rot='NOT THE SAME FILM AS 1999', t='A MOVING TARGET', cor='ambar')),
 F("Every generation of chips needs thinner layers, finer wiring, and less signal loss. So the recipe keeps changing.", sub='Thinner layers. Finer wiring. Less signal loss.'),
 F("Ajinomoto says it develops each new version years before the chips that need it exist.", **N(d='duas', l1='It builds the next film', l2='', n=1)),
 F("A copycat who finally matches today's film, is matching a product that's about to be replaced.", p=0.3, n=2, l2='before the chips that need it exist.'),
])
B('recap', trava=4, nome='THE APPETITE', falas=[
 F("That's four locks.", **TR(ab=0, at=0, n=3, tl=['Four locks.'])),
 F("A skyscraper that stands on the film.", ab=1),
 F("A recipe ninety years deep.", ab=2),
 F("A whole industry tuned to it.", ab=3),
 F("And a target that never stops moving.", ab=4),
 F("All four can be beaten. Big chemical companies have made rival films. A startup is trying right now.", tl=['Four locks.', '*Beatable*, in theory.'], k='Rival films exist. A startup is trying right now.'),
 F("So why does one company still have ninety five percent?", k='So why does one company still have *95%*?'),
 F("The fifth lock.", **TR(ab=4, at=5, n=3, tl=['The fifth lock', 'is *the strangest*.'])),
 F("Remember the question I asked you?", p=0.6, k='Remember the question?'),
])

# ---------- TRAVA 5
B('peq0', trava=5, nome='? ? ?', falas=[F("Lock five.", p=0.3, **N(d='big', rot='LOCK 5 OF 5', t='? ? ?', cor='ambar'))])
B('peq1', trava=5, nome='? ? ?', fonte="AJINOMOTO · TSMC (CAPEX GUIDANCE) · TOM'S HARDWARE", falas=[
 F("Since twenty twenty three, Ajinomoto has invested about twenty five billion yen in making this film. It plans at least that much again by twenty thirty.", **N(d='barras', cab="US$ · AJINOMOTO'S FILM EXPANSION VS TSMC'S 2026 SPENDING PLAN", it=[['THE FILM, TO 2030', 0.33, '≈ $0.3 bn', 'menta'], ['ONE CHIPMAKER, ONE YEAR', 54, '$52–56 bn', 'fantasma']], n=1, tit=['The whole expansion costs *less than a rounding error*.'])),
 F("Together, that's roughly three hundred million dollars.", n=1),
 F("The company that makes the chips themselves plans to spend more than fifty billion. In one year.", n=2),
 F("Every advanced chip in the world depends on a business you could fund with the loose change of its customers.", p=0.3, k='A business you could fund with *loose change*.'),
])
B('peq2', trava=5, nome='THE SMALL PRIZE', falas=[
 F("That's lock five. The small prize.", **N(d='big', rot='LOCK 5 OF 5', t='THE SMALL PRIZE', cor='menta')),
 F("The film is a tiny fraction of what a finished AI chip costs.", sub='A tiny fraction of what an AI chip costs.'),
 F("So nobody saves real money by switching.", sub='Nobody saves real money by switching.'),
 F("But if a new film fails, you don't lose the film. You lose the chip.", p=0.3, sub="If it fails, you don't lose the film. You lose the chip."),
])
B('peq3', trava=5, nome='THE SMALL PRIZE', falas=[
 F("Now look at it from both sides.", **N(d='versus', a='THE CUSTOMER', b='THE CHALLENGER', ra='WHY NOT SWITCH?', rb='WHY NOT ATTACK?', la=['Switching saves almost nothing', 'A failure costs the whole chip', 'Months of new testing'], lb=['Years of work to match it', 'For a market this small', 'That one company already owns'], n=0)),
 F("If you're the customer, switching saves you almost nothing, and risks everything.", n=2),
 F("If you're the challenger, you spend years matching a moving target,", n=1, p=0),
 F("for a market that is small, and already ninety five percent taken.", n=3),
 F("The giants look at that prize, and walk away. Not because they can't. Because it isn't worth it.", p=0.3, k="Not because they can't. Because it *isn't worth it*."),
])
B('peq4', trava=5, nome='THE SMALL PRIZE', fonte='TRENDFORCE, MAY 2026 (AJINOMOTO FISCAL 2025 RESULTS)', falas=[
 F("For the seasoning company, though, it's a wonderful business.", **N(d='nums', it=[['30%', "OF AJINOMOTO'S OPERATING PROFIT, FISCAL 2025"], ['50%+', 'PROFIT MARGIN OF THE FILM BUSINESS']], n=1)),
 F("In its last fiscal year, the division built around this film made about thirty percent of the whole company's operating profit.", n=1),
 F("With margins reported above fifty percent.", n=2),
 F("So here's what a real copy would need.", **N(d='check', it=[['A FILM AS FLAT AS THE ORIGINAL', 0], ['A RECIPE THAT KEEPS UP', 0], ['AN INDUSTRY WILLING TO RE-TEST EVERYTHING', 0], ['A REASON TO BOTHER', 0]], n=0, cab='WHAT A REAL COPY WOULD NEED')),
 F("A film as flat as the original.", n=1),
 F("A recipe that keeps up.", n=2),
 F("An industry willing to re test everything.", n=3),
 F("And a reason to bother.", n=4),
 F("You can copy the film.", **N(d='duas', l1='You can copy the film.', l2='', n=1)),
 F("You can't make it worth anyone's risk.", p=0.7, n=2, l2="You can't make it worth the risk."),
])
B('cta2', trava=5, nome='THE SMALL PRIZE', falas=[
 F("If you know someone who thinks AI only depends on Nvidia, send them this video.", **N(d='cta', ic='env', t=['SEND THIS', 'to that friend'], n=1)),
 F("And tell them about the soup.", n=2, s='Tell them about the soup'),
])

# ---------- FECHO
B('fecho1', fonte='AJINOMOTO BRIEFING, JUNE 30, 2026', falas=[
 F("One last thing.", **N(d='big', t='ONE LAST THING', cor='osso')),
 F("The AI boom needs far more of this film. So Ajinomoto is building a new plant.", **N(d='linhaT', pts=[[2025, 'NEW LINE', 'GUNMA PLANT', 'menta'], [2026, 'LAND BOUGHT', 'GIFU'], [2030, 'DEMAND COVERED', 'UNTIL ABOUT HERE'], [2032, 'NEW PLANT', 'PLANNED START', 'ambar']], n=1, de=2025, ate=2032)),
 F("It bought the land in twenty twenty six.", n=2),
 F("The company says it can cover demand through about twenty thirty.", n=3),
 F("The new plant is scheduled to start in twenty thirty two.", n=4),
 F("Six years, for the only company that already knows how.", p=0.4, n=5, vao=['6 YEARS', 'FROM BUYING THE LAND TO THE FIRST FILM'], v0=2026, v1=2032),
])
B('fecho2', fonte='AJINOMOTO GROUP', falas=[
 F("And the young researcher who kept that resin in a freezer?", **N(d='duas', l1='The researcher with the freezer', l2='', n=1)),
 F("In twenty twenty five, Shigeo Nakamura became president of the whole company.", p=0.4, n=2, l2='now runs the whole company.'),
])
B('fecho3', falas=[
 F("So that's the real reason nobody can copy this film.", **N(d='pote', n=3, k='The real reason nobody can copy this film:')),
 F("It's too small to be worth stealing. And too important to risk replacing.", p=0.9, k='Too small to steal. *Too important to replace*.'),
])
B('fim', falas=[
 F("The film is one link in a chain. And almost every link has a company like this hiding in it.", **N(d='fim', n=0, elo='THE FILM')),
 F("Next, we open another one.", n=1),
 F("Subscribe, so it finds you.", n=2),
 F("And tell me in the comments which company you want taken apart next.", n=3),
])
r.salva()

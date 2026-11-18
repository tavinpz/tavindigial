# Gera roteiro.json do Hard to Copy #01 (espelhos da ZEISS). Uso: python3 hc001_roteiro.py <pasta de saída>
# Cada fala: texto falado (siglas com hífen para a voz soletrar), pausa extra (p) e o que aparece na tela (v).
# v herda da fala anterior do mesmo bloco. d = diagrama, n = passo do diagrama, k = frase de apoio embaixo, tit = título.
# Ver src/htc/Video.tsx para o que cada diagrama desenha em cada passo.
import json, sys
def F(txt, p=0, **v): return {'txt': txt, 'p': p, 'v': v}
LIMPA = dict(d=None, n=0, k=None, tit=None, it=None, t=None, rot=None, sub=None, cor=None, ab=None, at=None, tl=None, cab=None, rev=None, l1=None, l2=None, ic=None, s=None)
def N(**v): return {**LIMPA, **v}
R = []
def B(cena, falas, trava=None, nome=None, fonte=None): R.append({'cena': cena, 'trava': trava, 'nome': nome, 'fonte': fonte, 'falas': falas})
def TRAVA(n, nome): return N(d='big', rot=f'LOCK {n} OF 5', t=nome, cor='ambar')

# Início v2 (pedido do Tavin em 18/11: o começo tem que prender): abre com a imagem estranha já acontecendo, depois a China.
B('gancho', fonte='ZEISS SMT (EUV OPTICS)', falas=[
 F("This is the most precise mirror in the world.", **N(d='alemanha', n=1, k='The most precise mirror *in the world*.')),
 F("Blow it up to the size of Germany,", n=2, k=None),
 F("and its tallest bump would be a tenth of a millimeter.", p=0.3, n=3),
])
B('chips', fonte='ZEISS SMT (EUV OPTICS)', falas=[
 F("Every cutting edge AI chip on Earth is printed with light that bounced off mirrors like this.", **N(d='big', rot='PRINTED WITH LIGHT FROM THESE MIRRORS', t='EVERY AI CHIP', cor='luz')),
 F("And only one company can make them.", p=0.3, **N(d='big', t='1', sub='company on Earth can make them', cor='menta')),
])
CASO = [['THE MONEY', 1], ['EX-ASML ENGINEERS', 1], ['A PROTOTYPE OF THE MACHINE', 1], ['A WORKING CHIP', 0]]
B('shenzhen', fonte='REUTERS, DECEMBER 2025', falas=[
 F("China has the money.", **N(d='check', it=CASO, n=1, cab='CHINA · THE SHENZHEN PROJECT')),
 F("It has former A-S-M-L engineers.", n=2),
 F("And according to Reuters, it has a prototype of the machine itself.", n=3),
 F("It makes the light. It has not made a single working chip.", n=4),
 F("And one of the main things holding it back, is a part that A-S-M-L doesn't even make.", k="A part ASML *doesn't even make*."),
 F("This mirror.", p=0.5, **N(d='big', t='THIS MIRROR.', cor='menta')),
])
B('mapa', [
 F("So why can't anyone copy a mirror?", **N(d='big', t='WHY?', sub="Why can't anyone copy a mirror?", cor='ambar')),
 F("There are five locks between everyone else, and this mirror.", **N(d='travas', ab=0, at=0, n=1, tl=['Five locks.'])),
 F("Four are physics and engineering.", n=2),
 F("The fifth has nothing to do with technology.", n=3, tl=['Five locks.', 'The last one', "*isn't technology*."]),
 F("And it's the one that makes the other four permanent.", p=0.4, k='It makes the other four *permanent*.'),
])

# ---------- TRAVA 1
B('luz0', trava=1, nome='THE LIGHT', falas=[F("Lock one. The light.", **TRAVA(1, 'THE LIGHT'))])
B('luz1', trava=1, nome='THE LIGHT', fonte='ZEISS SMT', falas=[
 F("Chips are printed with light.", **N(d='espectro', n=0, tit=['Smaller light, *smaller transistors*.'])),
 F("The smaller the wavelength, the smaller the transistor you can draw.", n=1),
 F("For decades, the industry used deep ultraviolet light, at one hundred ninety three nanometers.", n=2),
 F("To keep shrinking, it needed something far smaller. Thirteen point five nanometers.", n=3),
 F("Extreme ultraviolet. E-U-V.", n=4),
])
B('luz2', trava=1, nome='THE LIGHT', fonte='ZEISS SMT', falas=[
 F("And here's the first problem.", **N(d='absorve', n=0, tit=['EUV light is absorbed by *almost everything*.'])),
 F("E-U-V light is absorbed by almost everything.", n=0),
 F("Glass absorbs it.", n=1),
 F("Air absorbs it.", n=2),
 F("A lens, the thing every camera and every older chip machine relies on, would just swallow the beam.", n=3),
 F("So the whole optical system has to be made of mirrors, sitting in a vacuum.", n=4),
])
B('luz3', trava=1, nome='THE LIGHT', fonte='ZEISS SMT', falas=[
 F("And this light is not cheap to make.", **N(d='gota', n=0, k='This light is *not cheap* to make.')),
 F("Inside the machine, a laser hits tiny droplets of molten tin.", n=1, k=None),
 F("Around sixty thousand of them, every second.", n=2),
 F("It turns each one into a plasma, at roughly two hundred and twenty thousand degrees Celsius.", n=3),
 F("Nearly forty times hotter than the surface of the Sun.", n=4),
 F("All of that, for a faint glow of the right wavelength.", k='All of that, for *a faint glow*.'),
])
B('luz4', trava=1, nome='THE LIGHT', fonte='ZEISS SMT · UP TO 70% REFLECTED PER MIRROR. 10 MIRRORS SHOWN FOR THE MATH.', falas=[
 F("But even the best mirror for this light, according to Zeiss, reflects only up to seventy percent of it.", **N(d='feixe', n=1, tit=['Every mirror eats *30%* of the light.'], cor='ambar')),
 F("Every bounce throws away almost a third.", n=1),
 F("Now do the math. Ten mirrors in a row.", n=2),
 F("Seventy percent. Then forty nine. Then thirty four.", n=3),
 F("By the tenth bounce, less than three percent of the light you started with is left.", n=4),
 F("That changes everything about the job.", k='That changes *everything* about the job.'),
 F("You can't afford a mirror that's merely excellent.", k='"Excellent" is *not good enough*.'),
 F("Every flaw costs light you don't have, and blurs a pattern whose features are a few dozen atoms wide.", k='Features *a few dozen atoms* wide.'),
 F("So what kind of mirror reflects a light that nothing reflects?", p=0.5, **N(d='big', t='?', sub='What reflects a light that nothing reflects?', cor='luz')),
])

# ---------- TRAVA 2
B('camadas0', trava=2, nome='THE COATING', falas=[F("Lock two. The coating.", **TRAVA(2, 'THE COATING'))])
B('camadas1', trava=2, nome='THE COATING', fonte='ZEISS SMT · FRAUNHOFER IOF', falas=[
 F("The answer is that it isn't really one mirror.", **N(d='camadas', n=0, tit=["It's not one mirror. It's *a hundred*."])),
 F("Zoom into the surface, and you find a stack.", n=1),
 F("Up to a hundred alternating layers of two materials. Molybdenum, and silicon.", n=2),
 F("Each layer is only a few nanometers thick.", n=3),
 F("One layer on its own reflects almost nothing.", n=4),
 F("But if every layer has exactly the right thickness, each tiny reflection lines up with the one before it.", n=5),
 F("The waves add together.", n=5, k='The waves *add together*.'),
 F("A hundred nearly useless reflections become one usable one.", n=6, k=None),
 F("Get the thickness wrong, by a fraction of a nanometer, across a surface the size of a dinner plate,", n=7),
 F("and the waves stop lining up. The reflection collapses.", n=8),
])
B('camadas2', trava=2, nome='THE COATING', fonte='ZEISS SMT · GERMAN FUTURE PRIZE 2020', falas=[
 F("Zeiss developed these coatings together with a German research institute, Frownhofer I-O-F.", **N(d='big', rot='DEVELOPED WITH', t='FRAUNHOFER IOF', sub='a German research institute', cor='osso')),
 F("In twenty twenty, that work won Germany's top innovation prize.", **N(d='big', rot="GERMANY'S TOP INNOVATION PRIZE", t='2020', sub='ZEISS · TRUMPF · Fraunhofer IOF', cor='ambar')),
 F("And the coating is the easy part.", **N(d='big', t='THE EASY PART', cor='menta', rot='THE COATING IS')),
 F("Because a perfect coating only works if the surface underneath is already perfect.", p=0.3, sub='It only works on a surface that is already perfect.'),
])

# ---------- TRAVA 3
B('forma0', trava=3, nome='THE SHAPE', falas=[F("Lock three. The shape.", **TRAVA(3, 'THE SHAPE'))])
B('forma1', trava=3, nome='THE SHAPE', fonte='ZEISS SMT (EUV OPTICS)', falas=[
 F("Back to Germany.", **N(d='alemanha', n=3)),
 F("Zeiss uses this comparison itself.", k="ZEISS's own comparison."),
 F("Take a normal household mirror, and stretch it to the size of Germany. Its bumps would be five meters tall.", n=4, k=None),
 F("Do the same with a mirror from a space telescope. Two centimeters.", n=5),
 F("Do it with an E-U-V mirror. A tenth of a millimeter.", n=6),
 F("About the thickness of a sheet of paper. Across an entire country.", p=0.3, k='A sheet of paper, *across an entire country*.'),
])
B('forma2', trava=3, nome='THE SHAPE', fonte='ZEISS SMT', falas=[
 F("No grinding wheel gets you there.", **N(d='copia', n=1, k='No grinding wheel gets you there.')),
 F("According to Zeiss, each mirror is machined for months, before it reaches that precision.", n=2, k='Machined for *months*. Each one.'),
 F("And then, it has to hold still.", **N(d='lua', n=0, k='And then it has to *hold still*.')),
 F("The mirrors are steered so precisely that, in Zeiss's words, you could bounce a laser off one,", n=1, k=None),
 F("and hit a golf ball, on the surface of the Moon.", p=0.4, n=2),
])
B('cta1', trava=3, nome='THE SHAPE', falas=[
 F("Quick question before the next lock, because it's my favorite one.", **N(d='cta', ic='com', t=['QUICK QUESTION'], n=0)),
 F("If you had to copy just one thing, which would be harder? Making this mirror? Or proving that you made it?", n=1, t=['MAKE IT', 'or PROVE IT?']),
 F("Put your guess in the comments. I read them. And the answer is coming up right now.", n=2, s='Comment your guess'),
])

# ---------- TRAVA 4
B('medir0', trava=4, nome='THE MEASUREMENT', falas=[F("Lock four. The measurement.", **TRAVA(4, 'THE MEASUREMENT'))])
B('medir1', trava=4, nome='THE MEASUREMENT', falas=[
 F("Think about what polishing actually is.", **N(d='polir', n=0, tit=["You can't polish what you *can't measure*."])),
 F("You remove material where the surface is too high.", n=1),
 F("Which means you have to know where it's too high.", n=2),
 F("So before you can make a mirror with errors smaller than an atom, you need a ruler with errors smaller than that.", n=3),
 F("And nobody sells one.", p=0.4, n=4),
])
B('medir2', trava=4, nome='THE MEASUREMENT', fonte='ZEISS SMT (HIGH-NA EUV METROLOGY) · ASML', falas=[
 F("Zeiss had to build it.", **N(d='camara', n=0, tit=['ZEISS had to *build the ruler*.'])),
 F("For its newest generation of mirrors, the ones for A-S-M-L's high N-A machines,", n=1),
 F("which are about a meter across, and weigh several hundred kilograms each,", n=2),
 F("the measuring system sits in a vacuum chamber five meters wide, and ten meters long.", n=3),
 F("It weighs around one hundred and fifty tons.", n=4),
 F("It has more than a hundred thousand parts.", n=5),
 F("Zeiss calls it the most complex machine the company has ever built.", k='The most complex machine ZEISS *has ever built*.'),
 F("It doesn't make chips. It doesn't even make mirrors.", k="It doesn't make chips. It doesn't make mirrors."),
 F("It exists to check one.", p=0.5, n=6, k='It exists to *check one*.'),
])
B('medir3', trava=4, nome='THE MEASUREMENT', fonte='ZEISS SMT (HIGH-NA EUV)', falas=[
 F("And once the mirrors pass, they go into an optical system with more than forty thousand parts, that weighs about twelve tons.", **N(d='nums', it=[['40,000+', 'PARTS'], ['12 t', 'PROJECTION OPTICS · HIGH-NA']], n=2)),
 F("That's just the projection optics. The part that carries the pattern down to the chip.", k='Just the projection optics.'),
 F("So a copycat doesn't have one impossible machine to build.", **N(d='tres', n=0, k='Not one impossible machine.')),
 F("They have at least three. The chip machine. The mirror. And the machine that tells you whether the mirror is any good.", n=3, k=None),
 F("Each one needs the others to exist first.", p=0.3, n=4),
])
B('recap', trava=4, nome='THE MEASUREMENT', falas=[
 F("That's four locks.", **N(d='travas', ab=0, at=0, n=3, tl=['Four locks.'])),
 F("Light that hates everything.", ab=1),
 F("A coating a hundred layers deep.", ab=2),
 F("A shape that's flat across a country.", ab=3),
 F("And a ruler that had to be invented.", ab=4),
 F("All four are, in theory, solvable. With enough money, enough physicists, enough years.", tl=['Four locks.', '*Solvable*, in theory.'], k='Money. Physicists. Years.'),
 F("China is working on exactly that.", k='China is working on exactly that.'),
])
B('anos', trava=4, nome='THE MEASUREMENT', fonte='REUTERS, DECEMBER 2025', falas=[
 F("How many years?", **N(d='big', t='HOW MANY YEARS?', cor='osso')),
 F("In April twenty twenty five, before the Shenzhen prototype became public, A-S-M-L's chief executive said China would need many, many years to get there.", **N(d='big', rot='ASML CEO · APRIL 2025', t='"MANY, MANY YEARS"', cor='ambar')),
 F("The prototype suggests it's moving faster than he expected.", sub='The prototype suggests: faster than expected.'),
 F("On the light. Not on the mirrors.", p=0.3, sub='On the light. Not on the mirrors.'),
 F("The fifth lock is different.", **N(d='travas', ab=4, at=5, n=3, tl=['The fifth lock', 'is *different*.'])),
 F("Money doesn't open it.", p=0.7, k="Money *doesn't* open it."),
])

# ---------- TRAVA 5
B('casam0', trava=5, nome='? ? ?', falas=[F("Lock five.", p=0.3, **N(d='big', rot='LOCK 5 OF 5', t='? ? ?', cor='ambar'))])
B('casam1', trava=5, nome='? ? ?', fonte='ZEISS SMT', falas=[
 F("In nineteen ninety five, Zeiss hosted a workshop with chipmakers, researchers, and a Dutch company called A-S-M-L.", **N(d='linha', n=1)),
 F("They met to talk about a strange idea. Printing chips with extreme ultraviolet light.", k='A strange idea: printing chips with EUV.'),
 F("The first production optics shipped in twenty twelve.", n=2, k=None),
 F("The first phones with E-U-V chips reached stores in twenty eighteen.", n=3),
 F("That's twenty three years between the first meeting, and the first product in your pocket.", n=4),
 F("Twenty three years of spending, on a technology many in the industry doubted would ever work.", k='A technology many doubted *would ever work*.'),
 F("The Japanese giants that once led lithography, Nikon and Canon, never brought an E-U-V machine to market.", n=5, k=None),
])
B('casam1b', trava=5, nome='? ? ?', fonte='ZEISS SMT (EUV OPTICS)', falas=[
 F("In all that time, Zeiss says it has delivered a bit more than three hundred of these E-U-V optical systems, for chip production.", **N(d='nums', it=[['300+', 'EUV OPTICAL SYSTEMS DELIVERED']], n=1)),
 F("Three hundred. That's the entire world supply. Ever.", k="The entire world's supply. *Ever*."),
 F("So how does a company survive two decades of that?", p=0.4, **N(d='big', t='HOW?', sub='How does a company survive two decades of that?', cor='osso')),
])
B('casam2', trava=5, nome='THE MARRIAGE', fonte='ASML ANNUAL REPORT 2025 · ASML/ZEISS ANNOUNCEMENT, NOV 2016', falas=[
 F("It doesn't do it alone.", **N(d='casamento', n=0, k="It doesn't do it *alone*.")),
 F("A-S-M-L has used Zeiss optics in its machines since the nineteen eighties.", n=1, k=None),
 F("In twenty sixteen, A-S-M-L went further. It bought twenty four point nine percent of Zeiss's chip optics business, for one billion euros in cash.", n=2, tit=['The customer owns *a quarter*', 'of its only supplier.']),
 F("And it promised hundreds of millions more, to fund the next generation of mirrors.", k='+ about €760 million for R&D and factories'),
 F("Today, the numbers are bigger.", k=None),
 F("In twenty twenty five, A-S-M-L bought four point four billion euros of optics from Zeiss.", n=3),
 F("It had lent Zeiss another one point nine billion.", n=4),
 F("And in its own annual report, A-S-M-L says that if Zeiss couldn't deliver, A-S-M-L would effectively cease to be able to conduct its business.", n=5),
])
B('casam2b', trava=5, nome='THE MARRIAGE', falas=[
 F("Read that again.", **N(d='duas', l1='The company everyone calls impossible to copy', l2='', n=1, rot='READ THAT AGAIN')),
 F("The company everyone calls impossible to copy, is telling investors it cannot replace its own supplier.", p=0.4, n=2, l2='cannot replace its own supplier.'),
])
B('casam3', trava=5, nome='THE MARRIAGE', fonte='ZEISS', falas=[
 F("And you can't buy your way in from the other side, either.", **N(d='big', rot='ZEISS', t='NOT FOR SALE', cor='verm')),
 F("Zeiss isn't on the stock market. The group is owned by a foundation, set up in eighteen eighty nine.", sub='Owned by a foundation since 1889.'),
 F("There's nothing to acquire.", sub='There is nothing to acquire.'),
 F("And it isn't a small team you could quietly hire away.", **N(d='pontos', n=0, k="Not a team you can quietly hire away.")),
 F("Zeiss's chip division has more than nine thousand employees.", n=1, k=None),
 F("Around two thousand of them work on the newest generation of mirrors alone.", n=2),
])
PRECISA = [['A CUSTOMER WHO PAYS FOR 20 YEARS', 0], ['ENGINEERS WITH A CAREER ON ONE SURFACE', 0], ['ABOUT 1,200 SPECIALIST SUPPLIERS', 0]]
B('casam4', trava=5, nome='THE MARRIAGE', fonte='ZEISS SMT', falas=[
 F("So here's what a real copy would need.", **N(d='check', it=PRECISA, n=0, cab='WHAT A REAL COPY WOULD NEED')),
 F("Not a mirror.", k='Not a mirror.'),
 F("A customer willing to pay you for twenty years, before the first one works.", n=1, k=None),
 F("Engineers who've spent a career on one surface.", n=2),
 F("And a network of about twelve hundred specialist suppliers behind them.", n=3),
 F("You can steal a blueprint.", **N(d='duas', l1='You can steal a blueprint.', l2='', n=1)),
 F("You can't steal thirty years.", p=0.7, n=2, l2="You can't steal thirty years."),
])
B('cta2', trava=5, nome='THE MARRIAGE', falas=[
 F("If you know someone who thinks the chip race is one stolen blueprint away from being over, send them this video.", **N(d='cta', ic='env', t=['SEND THIS', 'to that friend'], n=1)),
 F("This is the part nobody shows them.", n=2, s='The part nobody shows them'),
])

# ---------- FECHO
B('fecho1', fonte='ASML ANNUAL REPORT 2025', falas=[
 F("One last thing, because it's the detail that convinced me.", **N(d='big', t='ONE LAST THING', cor='osso')),
 F("A-S-M-L wants to build more machines. The AI boom is begging for them.", **N(d='gargalo', n=1)),
 F("And A-S-M-L's annual report says the number it can build, is limited by how many optics Zeiss can produce.", n=2),
 F("So Zeiss is expanding its site in Oberkoken, a town in southern Germany.", n=3),
])
B('fecho2', fonte='ZEISS SMT · JULY 2026', falas=[
 F("About twenty five thousand square meters of new space.", **N(d='nums', it=[['25,000 m²', 'NEW SPACE · OBERKOCHEN'], ['2022', 'GROUND BROKEN'], ['2026', 'FIRST BUILDING OPENS']], n=1)),
 F("They broke ground in twenty twenty two.", n=2),
 F("The first building opened in the summer of twenty twenty six.", n=3),
 F("Four years to add capacity, for the only company that already knows how.", p=0.4, k='*Four years*, for the only company that knows how.'),
])
B('fecho3', falas=[
 F("That's the real reason nobody can copy this mirror.", **N(d='copia', n=1, k='The real reason nobody can copy this mirror:')),
 F("Even the original can barely copy itself.", p=0.9, n=1, k='Even the original can barely *copy itself*.'),
])
B('fim', falas=[
 F("The mirror is one link in a chain. And almost every link has a company like this hiding in it.", **N(d='fim', n=0)),
 F("Next, we open another one.", n=1),
 F("Subscribe, so it finds you.", n=2),
 F("And tell me in the comments which company you want taken apart next.", n=3),
])

pasta = sys.argv[1].rstrip('/')
json.dump(R, open(f'{pasta}/roteiro.json', 'w'), indent=1, ensure_ascii=False)
print(len(R), 'blocos', sum(len(b['falas']) for b in R), 'falas', sum(len(f['txt'].split()) for b in R for f in b['falas']), 'palavras')

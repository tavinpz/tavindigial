# Hard to Copy #04: o laser da TRUMPF dentro da máquina EUV. Uso: python3 hc004_roteiro.py <pasta de saída>
# Fontes por fato: ver HARD-TO-COPY.md (trumpf.com EUV drive laser, TRUMPF "Flashes of light in a vacuum", relatório anual TRUMPF 2025/26 e comunicado de 15/10/2026, asml.com, Laser Focus World).
from htc_comum import F, N, Roteiro
NOMES = [['THE TARGET', 'A speck of tin at 250 km/h'], ['THE TWO SHOTS', 'Hit it twice, 50,000 times a second'], ['THE POWER', 'A few watts become 40 kilowatts'], ['THE ECHO', 'The target shoots back'], ['? ? ?', 'Not technology at all']]
r = Roteiro(NOMES, 'PHYSICS + ENGINEERING'); B = r.B; TRAVA = r.TRAVA; TR = r.TR

B('gancho', fonte='ASML · TRUMPF', falas=[
 F("This laser just hit a droplet of molten tin, thinner than a human hair, flying at two hundred and fifty kilometers an hour.", **N(d='tiro', n=1, k='A droplet thinner than a hair, at *250 km/h*.')),
 F("Then it hit the same droplet again.", n=2, k='Then it hit it *again*.'),
 F("It does that fifty thousand times a second. All day. For years.", p=0.3, n=3, k=None),
])
B('chips', fonte='TRUMPF (EUV LITHOGRAPHY)', falas=[
 F("Every advanced AI chip on Earth starts with that flash of light.", **N(d='big', rot='IT STARTS WITH THIS FLASH', t='EVERY AI CHIP', cor='luz')),
 F("The machine that uses it is built by A-S-M-L. The laser is not.", **N(d='duas', l1='The machine: built by ASML.', l2='', n=1)),
 F("A-S-M-L buys it from one family owned company in southern Germany.", p=0.3, n=2, l2='The laser: one family company in Germany.'),
])
CASO = [['A LASER', 1], ['40 KILOWATTS OF POWER', 1], ['A DROPLET OF TIN', 1], ['A SECOND SUPPLIER ON EARTH', 0]]
B('caso', fonte='TRUMPF', falas=[
 F("On paper, it doesn't sound hard. You need a laser.", **N(d='check', it=CASO, n=1, cab='WHAT YOU NEED, ON PAPER')),
 F("A powerful one. About forty kilowatts.", n=2),
 F("And a droplet of tin to aim it at.", n=3),
 F("Lasers that powerful have cut steel in factories for decades.", k='Lasers this powerful have *cut steel for decades*.'),
 F("And yet there is no second supplier. Anywhere.", p=0.4, n=4, k=None),
])
B('mapa', [
 F("So why can't anyone copy a laser?", **N(d='big', t='WHY?', sub="Why can't anyone copy a laser?", cor='ambar')),
 F("There are five locks.", **TR(ab=0, at=0, n=1, tl=['Five locks.'])),
 F("Four are physics and engineering.", n=2),
 F("The fifth is about who would ever pay you to try.", n=3, tl=['Five locks.', 'The last one', 'is *about money*.']),
 F("And it's the one no engineer can fix.", p=0.4, k='The one *no engineer* can fix.'),
])

# ---------- TRAVA 1
B('alvo0', trava=1, nome='THE TARGET', falas=[F("Lock one. The target.", **TRAVA(1, 'THE TARGET'))])
B('alvo1', trava=1, nome='THE TARGET', fonte='ASML (HOW EUV LIGHT IS MADE) · LASER FOCUS WORLD', falas=[
 F("Inside the machine, there's a vacuum chamber.", **N(d='alvo', n=0, tit=['The target: a speck of tin, *already gone*.'])),
 F("A nozzle fires a stream of molten tin droplets across it.", n=1),
 F("Each droplet is about thirty thousandths of a millimeter wide. Less than half a human hair.", n=2),
 F("They leave the nozzle at seventy meters per second. That's two hundred and fifty kilometers an hour.", n=3),
 F("And there are fifty thousand of them, every second.", n=4),
 F("Your laser has to find each one, in flight, and hit it dead center.", k='Find each one, in flight. Hit it *dead center*.'),
 F("Miss by a hair, literally, and that droplet makes no light at all.", p=0.3, k='Miss by a hair, and you get *no light*.'),
])

# ---------- TRAVA 2
B('dois0', trava=2, nome='THE TWO SHOTS', falas=[F("Lock two. The two shots.", **TRAVA(2, 'THE TWO SHOTS'))])
B('dois1', trava=2, nome='THE TWO SHOTS', fonte='TRUMPF (EUV DRIVE LASER) · ASML', falas=[
 F("Here's the problem. A round droplet is a terrible target.", **N(d='duplo', n=0, tit=['One shot shapes it. *The next one* burns it.'])),
 F("It's tiny, and most of the laser beam would fly right past it.", n=1),
 F("So the laser shoots twice.", n=1, k='So the laser shoots *twice*.'),
 F("The first shot is weak. It's called the pre pulse. It doesn't destroy the droplet. It flattens it, into a thin disc, like a pancake.", n=2, k=None),
 F("Now the target is wide, and thin.", n=3),
 F("A split second later, the main pulse arrives, and turns that pancake into a plasma, hotter than the surface of the Sun.", n=4),
 F("That plasma gives off the light that prints the chip.", n=5),
])
B('dois2', trava=2, nome='THE TWO SHOTS', fonte='TRUMPF · ASML', falas=[
 F("Two shots per droplet. Fifty thousand droplets a second.", **N(d='nums', it=[['2', 'SHOTS PER DROPLET'], ['50,000', 'DROPLETS PER SECOND'], ['100,000', 'HITS EVERY SECOND']], n=2)),
 F("That's a hundred thousand hits, every second.", n=3),
 F("And the second shot has to land on a target that the first shot just changed.", k='Shot two hits a target that shot one *just changed*.'),
 F("If the timing between them drifts, the pancake is the wrong shape, and the light fades.", p=0.3, k='Wrong timing, wrong shape, *less light*.'),
])

# ---------- TRAVA 3
B('pot0', trava=3, nome='THE POWER', falas=[F("Lock three. The power.", **TRAVA(3, 'THE POWER'))])
B('pot1', trava=3, nome='THE POWER', fonte='TRUMPF (EUV DRIVE LASER)', falas=[
 F("The pulse doesn't start out powerful.", **N(d='amp', n=0, tit=['From a few watts to *40 kilowatts*.'])),
 F("It begins in a small seed laser, at just a few watts. About as much as a phone charger.", n=1),
 F("That's on purpose. A weak pulse is easy to shape precisely.", n=1, k='A weak pulse is *easy to shape*.'),
 F("Then it goes through a chain of amplifiers, one after another.", n=2, k=None),
 F("Each one adds energy, without ruining the shape.", n=3),
 F("By the end, the pulse has been amplified more than ten thousand times.", n=4),
 F("Up to forty kilowatts of average power. With peaks in the millions of watts.", n=5),
 F("The company that builds it calls it the most powerful pulsed industrial laser in the world.", p=0.3, k='The most powerful pulsed industrial laser *in the world*.'),
])
B('pot2', trava=3, nome='THE POWER', fonte='TRUMPF ("FLASHES OF LIGHT IN A VACUUM") · LASER FOCUS WORLD', falas=[
 F("And here's the painful part. Almost all of that power is wasted.", **N(d='barras', cab='POWER, IN WATTS (ROUNDED)', it=[['LASER GOES IN', 30000, '30,000+ W', 'verm'], ['EUV LIGHT OUT', 400, 'A FEW HUNDRED W', 'luz']], n=1, tit=['Almost all of it is *wasted*.'])),
 F("Tens of thousands of watts of laser go in. A few hundred watts of usable light come out.", n=2),
 F("Only a few percent of the energy becomes the light you actually want.", k='Only *a few percent* becomes useful light.'),
 F("So you can't build a smaller, easier laser. You need all of it, just to get that little.", p=0.3, k="You can't build a smaller one. You need *all of it*."),
])
B('cta1', trava=3, nome='THE POWER', falas=[
 F("Quick question, before the next lock.", **N(d='cta', ic='com', t=['QUICK QUESTION'], n=0)),
 F("You fire the most powerful laser of its kind at a tiny ball of liquid metal. What do you think the metal does to the laser?", n=1, t=['WHAT DOES THE METAL', 'DO TO THE LASER?']),
 F("Put your guess in the comments. The answer is lock four.", n=2, s='Comment your guess'),
])

# ---------- TRAVA 4
B('eco0', trava=4, nome='THE ECHO', falas=[F("Lock four. The echo.", **TRAVA(4, 'THE ECHO'))])
B('eco1', trava=4, nome='THE ECHO', fonte='TRUMPF (EUV DRIVE LASER)', falas=[
 F("The laser isn't even in the same room as the droplet.", **N(d='eco', n=0, tit=['The target *shoots back*.'])),
 F("It sits on the floor below, in the basement of the chip factory.", n=1),
 F("The beam travels up through a transport system that can be thirty meters long, and is focused onto the droplet at the very end.", n=2),
 F("Now remember what the droplet is. Liquid metal. And metal is a mirror.", n=3, k='Liquid metal is *a mirror*.'),
 F("So part of that enormous pulse bounces straight back, down the same path it came from.", n=4, k=None),
 F("Back toward amplifiers that are built to make any light passing through them stronger.", n=5),
 F("Without protection, the laser would amplify its own reflection, and aim it at its most delicate part. The seed.", p=0.3, k='It would amplify *its own echo*, and aim it at the seed.'),
])
B('eco2', trava=4, nome='THE ECHO', fonte='TRUMPF FIGURES (LASER AMPLIFIER)', falas=[
 F("So the machine is full of defenses. Guards against reflections. Three separate cooling circuits. Optics that have to stay perfectly clean.", **N(d='cadeia', it=[['REFLECTION GUARDS', 'PROTECT THE SEED', 'menta'], ['3 COOLING CIRCUITS', 'CARRY THE HEAT AWAY', 'ambar'], ['CLEAN OPTICS', 'NO DUST ALLOWED', 'osso']], n=3)),
 F("One laser amplifier has four hundred and fifty seven thousand, three hundred and twenty nine parts.", **N(d='nums', it=[['457,329', 'PARTS'], ['7.3 km', 'OF CABLE'], ['17 t', 'TOTAL WEIGHT']], n=1)),
 F("More than seven kilometers of cable.", n=2),
 F("And it weighs seventeen tons.", n=3),
 F("That's not a laser. That's a building's worth of machine, with one job. Hit the droplet. Twice.", p=0.3, k='One job: *hit the droplet. Twice.*'),
])
B('recap', trava=4, nome='THE ECHO', falas=[
 F("That's four locks.", **TR(ab=0, at=0, n=3, tl=['Four locks.'])),
 F("A target smaller than a hair.", ab=1),
 F("Two shots, a hundred thousand times a second.", ab=2),
 F("Forty kilowatts, built up from almost nothing.", ab=3),
 F("And an echo that tries to destroy the laser.", ab=4),
 F("All four are solvable. There are brilliant laser companies in America, Japan and China.", tl=['Four locks.', '*Solvable*, in theory.'], k='There are brilliant laser companies everywhere.'),
 F("So why hasn't one of them built a second one?", k="So why hasn't anyone built *a second one*?"),
 F("The fifth lock.", **TR(ab=4, at=5, n=3, tl=['The fifth lock', 'is *different*.'])),
 F("It has nothing to do with lasers.", p=0.6, k='It has *nothing to do* with lasers.'),
])

# ---------- TRAVA 5
B('cli0', trava=5, nome='? ? ?', falas=[F("Lock five.", p=0.3, **N(d='big', rot='LOCK 5 OF 5', t='? ? ?', cor='ambar'))])
B('cli1', trava=5, nome='? ? ?', fonte='TRUMPF ANNUAL REPORT 2025/26', falas=[
 F("The company that builds this laser is called TRUMPF. It was founded in nineteen twenty three, near Stuttgart.", **N(d='big', rot='DITZINGEN, NEAR STUTTGART', t='TRUMPF', sub='Founded in 1923. Still owned by one family.', cor='osso')),
 F("And it isn't really a chip company at all.", p=0.2),
 F("Most of its money comes from machines that cut and bend sheet metal.", **N(d='barras', cab='TRUMPF SALES BY BUSINESS, FISCAL 2025/26, € BILLION', it=[['MACHINE TOOLS', 2.38, '€2.38 bn'], ['LASER TECHNOLOGY', 1.17, '€1.17 bn'], ['EUV LASERS', 0.791, '€0.79 bn', 'menta']], n=1, tit=['Its day job is *cutting steel*.'])),
 F("Then industrial lasers.", n=2),
 F("The lasers for chip machines are the smallest of the three. Seven hundred and ninety one million euros, out of more than four billion.", n=3),
 F("That's the secret. This laser was never invented for chips.", p=0.3, k='This laser was *never invented for chips*.'),
])
B('cli2', trava=5, nome='THE DAY JOB', falas=[
 F("That's lock five. The day job.", **N(d='big', rot='LOCK 5 OF 5', t='THE DAY JOB', cor='menta')),
 F("TRUMPF spent decades building this kind of laser for a completely different reason. To cut steel in factories.", sub='Decades of building this laser, to cut steel.'),
 F("Thousands of machines. Thousands of customers. Every one of them paid for a little more experience.", sub='Thousands of machines paid for the experience.'),
 F("By the time the chip industry needed an impossible laser, one company had already been paid to learn how.", p=0.3, sub='One company had already been paid to learn how.'),
])
B('cli3', trava=5, nome='THE DAY JOB', fonte='TRUMPF, FISCAL YEAR 2024/25 AND 2025/26 RESULTS', falas=[
 F("Now look at it from a copycat's side.", **N(d='versus', a='A NEW RIVAL', b='TRUMPF', ra='STARTING TODAY', rb='SINCE 1923', la=['No steel cutting business to learn from', 'Exactly one possible customer', 'That customer already has a supplier'], lb=['Learned on thousands of machines', 'The one customer is a partner', 'Owned by a family, not for sale'], n=0)),
 F("You'd have no day job to learn from. Much of the cutting industry has since moved on to a newer kind of laser.", n=1),
 F("You'd have exactly one possible customer on Earth. A-S-M-L.", n=2),
 F("And that customer already has a supplier it has worked with for years.", n=3),
 F("And even for the original, one customer is a dangerous thing.", **N(d='barras', cab="TRUMPF EUV SALES, € MILLION", it=[['2023/24', 943, '€943 m'], ['2024/25', 724, '€724 m', 'verm'], ['2025/26', 791, '€791 m', 'menta']], n=1)),
 F("In a single year, when A-S-M-L ordered fewer machines, TRUMPF's laser sales to it fell twenty three percent.", n=2),
 F("They've only partly recovered.", n=3),
 F("So who spends ten years and billions of dollars, to become the backup supplier to a single customer?", p=0.4, k='Who spends billions to be *the backup* for one customer?'),
])
B('cli4', trava=5, nome='THE DAY JOB', fonte='TRUMPF ANNUAL REPORT 2025/26', falas=[
 F("And you can't buy your way in, either.", **N(d='big', rot='TRUMPF', t='NOT FOR SALE', cor='verm')),
 F("TRUMPF isn't on the stock market. Ninety percent belongs to one family. The other ten, to the family's foundation.", sub='90% one family. 10% the family foundation.'),
 F("So here's what a real copy would need.", **N(d='check', it=[['A LASER THAT HITS TWICE', 0], ['40 KILOWATTS THAT SURVIVE THE ECHO', 0], ['DECADES OF A DAY JOB', 0], ['A CUSTOMER THAT NEEDS A SECOND ONE', 0]], n=0, cab='WHAT A REAL COPY WOULD NEED')),
 F("A laser that hits twice.", n=1),
 F("Forty kilowatts that survive their own echo.", n=2),
 F("Decades of a day job that taught you how.", n=3),
 F("And a customer that actually needs a second supplier.", n=4),
 F("You can copy the laser.", **N(d='duas', l1='You can copy the laser.', l2='', n=1)),
 F("You can't copy the reason it exists.", p=0.7, n=2, l2="You can't copy the reason it exists."),
])
B('cta2', trava=5, nome='THE DAY JOB', falas=[
 F("If you know someone who thinks the chip race is only about chips, send them this video.", **N(d='cta', ic='env', t=['SEND THIS', 'to that friend'], n=1)),
 F("Because it's about to get harder.", n=2, s="It's about to get harder"),
])

# ---------- FECHO
B('fecho1', fonte="ASML (1,000 W SOURCE ROADMAP), VIA HEISE AND TOM'S HARDWARE", falas=[
 F("One last thing.", **N(d='big', t='ONE LAST THING', cor='osso')),
 F("A-S-M-L wants its machines to print about fifty percent more wafers by twenty thirty.", **N(d='nums', it=[['+50%', 'MORE WAFERS PER MACHINE BY 2030'], ['1,000 W', 'THE EUV LIGHT SOURCE IT NEEDS']], n=1)),
 F("To do that, the light source has to reach a thousand watts.", n=2),
 F("The plan for getting there is public. Twice as many droplets. And three laser pulses on each one, instead of two.", **N(d='nums', it=[['100,000', 'DROPLETS PER SECOND'], ['3', 'PULSES ON EACH DROPLET']], n=2)),
 F("The target is about to get twice as fast.", p=0.3, k='The target is about to get *twice as fast*.'),
])
B('fecho2', falas=[
 F("So that's the real reason nobody can copy this laser.", **N(d='tiro', n=3, k='The real reason nobody can copy this laser:')),
 F("By the time you learn to hit the droplet twice, the original is already hitting it three times.", p=0.9, k='Learn to hit it twice, and the original is *hitting it three times*.'),
])
B('fim', falas=[
 F("The laser is one link in a chain. And almost every link has a company like this hiding in it.", **N(d='fim', n=0, elo='THE LASER')),
 F("Next, we open another one.", n=1),
 F("Subscribe, so it finds you.", n=2),
 F("And tell me in the comments which company you want taken apart next.", n=3),
])
r.salva()

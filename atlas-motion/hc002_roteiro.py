# Hard to Copy #02: TSMC. Uso: python3 hc002_roteiro.py <pasta de saída>
# Fontes por fato: ver a tabela em HARD-TO-COPY.md (TSMC 20-F e relatório anual 2025, teleconferências de jan e jul/2026, TrendForce 2T26, NSTC/Taiwan News, Business Wire TSMC+Amkor).
from htc_comum import F, N, Roteiro
NOMES = [['THE BILL', 'Over $50 billion a year'], ['THE YIELD', 'A thousand steps, all of them right'], ['THE NEIGHBORS', 'A supply chain you can drive across'], ['THE PEOPLE', 'Thousands who have only done this'], ['? ? ?', 'Not technology at all']]
r = Roteiro(NOMES, 'MONEY + ENGINEERING'); B = r.B; TRAVA = r.TRAVA; TR = r.TR

B('gancho', fonte='TSMC · AMKOR, JUNE 2026', falas=[
 F("This wafer was just made in Arizona, in the largest foreign investment project in American history.", **N(d='voo', n=1, k='Made in Arizona. *Not finished* in Arizona.')),
 F("Before it becomes a working AI chip, it gets on a plane,", n=2, k=None),
 F("and flies about eleven thousand kilometers, back to Taiwan.", p=0.3, n=3),
])
B('aposta', fonte='TSMC, Q2 2026 EARNINGS CALL (JULY 16, 2026)', falas=[
 F("T-S-M-C is spending two hundred and sixty five billion dollars to copy itself in the desert.", **N(d='big', rot='TSMC · ARIZONA · PLANNED INVESTMENT', t='$265 BILLION', cor='ambar')),
 F("Ten fabs. Two packaging plants. One research center.", sub='10 fabs · 2 packaging plants · 1 R&D center'),
 F("And the newest chips still won't be made there.", p=0.3, **N(d='big', t='NOT THE NEWEST', sub="The newest chips still won't be made there.", cor='verm')),
])
CASO = [['THE MONEY', 1], ['THE FACTORY', 1], ['THE CUSTOMERS', 1], ['THE NEWEST CHIPS', 0]]
B('caso', fonte='TRENDFORCE, Q2 2026 (FOUNDRY REVENUE SHARE)', falas=[
 F("Think about what that means. The copy has the money.", **N(d='check', it=CASO, n=1, cab='THE ARIZONA COPY HAS')),
 F("It has the factory. It has been making four nanometer chips since late twenty twenty four.", n=2),
 F("It has the customers. Apple and Nvidia are already in line.", n=3),
 F("And it's being built by the original. If anyone could copy T-S-M-C, it's T-S-M-C.", k="If anyone could copy TSMC, it's *TSMC*."),
 F("So why is everyone else even further behind?", n=4, k=None),
 F("Today, T-S-M-C takes about seventy two percent of all the money the world pays to have chips made.", **N(d='rosca', pc=72.5, n=1, t='TSMC', sub='share of global foundry revenue, Q2 2026', resto='EVERYONE ELSE: 27.5%')),
 F("Number two, Samsung, has under six.", p=0.3, n=2, linhas=['Samsung, number two: 5.9%']),
])
B('mapa', [
 F("So why can't anyone copy a factory?", **N(d='big', t='WHY?', sub="Why can't anyone copy a factory?", cor='ambar')),
 F("There are five locks.", **TR(ab=0, at=0, n=1, tl=['Five locks.'])),
 F("Four of them are money and engineering.", n=2),
 F("The fifth is a promise, made in nineteen eighty seven.", n=3, tl=['Five locks.', 'The last one', 'is *a promise*.']),
 F("And it's the only one that money can't buy.", p=0.4, k="The only one money *can't buy*."),
])

# ---------- TRAVA 1
B('conta0', trava=1, nome='THE BILL', falas=[F("Lock one. The bill.", **TRAVA(1, 'THE BILL'))])
B('conta1', trava=1, nome='THE BILL', fonte='TSMC, Q4 2025 EARNINGS CALL · FORM 20-F 2025', falas=[
 F("In twenty twenty five, T-S-M-C spent forty point nine billion dollars on factories and machines.", **N(d='barras', cab='TSMC CAPITAL SPENDING, US$ BILLION', it=[['2024', 29.8, '$29.8 bn'], ['2025', 40.9, '$40.9 bn'], ['2026 PLAN', 56, '$52–56 bn', 'ambar']], n=2, tit=['The entry ticket is *$50 billion a year*.'])),
 F("In one year.", n=2),
 F("For twenty twenty six, the plan it gave investors in January was fifty two to fifty six billion.", n=3),
 F("Over the last five years, that adds up to a hundred and sixty seven billion dollars.", **N(d='nums', it=[['$167 bn', 'SPENT ON FABS AND TOOLS IN FIVE YEARS'], ['$30 bn', 'SPENT ON R&D IN THE SAME FIVE YEARS']], n=1)),
 F("Plus another thirty billion on research.", n=2),
 F("That's the entry ticket. Not to win. Just to stand next to them.", p=0.3, k='Not to win. Just to *stand next to them*.'),
])
B('conta2', trava=1, nome='THE BILL', falas=[
 F("And money is the easy lock.", **N(d='big', rot='MONEY IS', t='THE EASY LOCK', cor='menta')),
 F("Governments have money. Samsung has money. Intel had money.", sub='Governments have it. Samsung has it. Intel had it.'),
 F("None of them has what comes next.", p=0.4, sub='None of them has what comes next.'),
])

# ---------- TRAVA 2
B('rend0', trava=2, nome='THE YIELD', falas=[F("Lock two. The yield.", **TRAVA(2, 'THE YIELD'))])
B('rend1', trava=2, nome='THE YIELD', fonte='ILLUSTRATIVE ARITHMETIC · 1,000 STEPS, SAME SUCCESS RATE AT EVERY STEP', falas=[
 F("A leading edge chip isn't made in one step. It goes through more than a thousand, one after another.", **N(d='comp', n=1, N=1000, base=0.999, base2=0.9999, l1='COPY · 99.9% PER STEP', l2='ORIGINAL · 99.99% PER STEP', tit=['A thousand steps. *Every one* has to work.'])),
 F("Deposit a layer. Print a pattern. Etch it. Clean it. Measure it. Again, and again.", n=1),
 F("Now imagine you're very good. Every single step works ninety nine point nine percent of the time.", n=2),
 F("Run a thousand of those in a row, and only about thirty seven percent of your chips work.", n=3),
 F("You throw away almost two out of three.", k='You throw away *almost two out of three*.'),
 F("Now add one more nine. Ninety nine point nine nine percent per step.", n=4, k=None),
 F("Same thousand steps. Ninety percent of your chips work.", k='Same machines. Same steps. *One more nine*.'),
 F("That gap is the whole business. One company prints money. The other one prints scrap.", p=0.3, k='One prints money. The other prints *scrap*.'),
])
B('rend2', trava=2, nome='THE YIELD', fonte='TSMC ANNUAL REPORT 2025', falas=[
 F("And you can't buy that last nine. You earn it, one failed wafer at a time.", **N(d='big', rot='THE LAST NINE', t="CAN'T BE BOUGHT", cor='ambar')),
 F("In twenty twenty five alone, T-S-M-C made twelve thousand six hundred and eighty two different products,", **N(d='nums', it=[['12,682', 'DIFFERENT PRODUCTS IN 2025'], ['534', 'CUSTOMERS'], ['305', 'PROCESS TECHNOLOGIES']], n=1)),
 F("for five hundred and thirty four customers,", n=2),
 F("on three hundred and five different process technologies.", n=3),
 F("Every one of those is a lesson about what goes wrong. Nobody else on Earth gets that many lessons a year.", p=0.3, k='Every product is *a lesson*. Nobody gets more of them.'),
])

# ---------- TRAVA 3
B('viz0', trava=3, nome='THE NEIGHBORS', falas=[F("Lock three. The neighbors.", **TRAVA(3, 'THE NEIGHBORS'))])
B('viz1', trava=3, nome='THE NEIGHBORS', fonte='TSMC + AMKOR ANNOUNCEMENT, JUNE 16, 2026', falas=[
 F("Back to that plane.", **N(d='voo', n=3)),
 F("A modern AI chip isn't finished when the wafer is done.", k="The wafer is *not* the chip."),
 F("The processor has to be joined to stacks of memory, in a step called advanced packaging.", **N(d='cadeia', it=[['THE WAFER', 'MADE IN THE FAB', 'menta'], ['PACKAGING', 'JOINED TO MEMORY', 'ambar'], ['THE AI CHIP', 'READY FOR A SERVER', 'osso']], n=2)),
 F("Only then is it a product.", n=3),
 F("And today, T-S-M-C's packaging lines for those chips are in Taiwan.", **N(d='voo', n=3, k="TSMC's AI packaging lines: *Taiwan*.")),
 F("In June twenty twenty six, T-S-M-C and an American partner, Amkor, signed a ten year deal to bring that step to Arizona.", **N(d='linhaT', pts=[[2020, 'ARIZONA', 'ANNOUNCED'], [2024, 'FIRST CHIPS', '4 NANOMETER', 'menta'], [2026, 'PACKAGING', 'DEAL SIGNED'], [2028, 'AMKOR', 'PACKAGING'], [2029, "TSMC'S OWN", 'PACKAGING', 'ambar']], n=3, de=2020, ate=2029)),
 F("Amkor's plant is planned for twenty twenty eight. T-S-M-C's own, for twenty twenty nine.", n=5),
 F("Nine years after the project was announced, the copy will finally be able to finish its own chips.", p=0.3, n=6, vao=['9 YEARS', 'FROM THE ANNOUNCEMENT TO A CHIP FINISHED ON SITE'], k=None),
])
B('viz2', trava=3, nome='THE NEIGHBORS', falas=[
 F("And packaging is just the neighbor you can see.", **N(d='big', rot='PACKAGING IS', t='ONE NEIGHBOR', cor='osso')),
 F("Behind it are the chemical suppliers, the gas plants, the people who clean and repair the tools.", **N(d='cadeia', it=[['CHEMICALS', 'ULTRA PURE', 'fantasma'], ['GASES', 'PIPED IN', 'fantasma'], ['TOOL SERVICE', 'ON CALL', 'fantasma'], ['PACKAGING', 'NEXT DOOR', 'ambar']], n=4)),
 F("In Taiwan, most of them are a short drive from the fab. They grew up around it, over almost forty years.", leg='IN TAIWAN: A SHORT DRIVE AWAY', ln=4, k=None),
 F("A copy doesn't just need a factory. It needs the town.", p=0.4, k="A copy doesn't need a factory. It needs *the town*."),
])
B('cta1', trava=3, nome='THE NEIGHBORS', falas=[
 F("Quick question, before the next lock.", **N(d='cta', ic='com', t=['QUICK QUESTION'], n=0)),
 F("If you ran Apple, would you hand your most secret chip design to a company that also sells phones?", n=1, t=['WOULD YOU', 'HAND IT OVER?']),
 F("Hold that answer. Put it in the comments. You'll need it for lock five.", n=2, s='Comment: yes or no'),
])

# ---------- TRAVA 4
B('gente0', trava=4, nome='THE PEOPLE', falas=[F("Lock four. The people.", **TRAVA(4, 'THE PEOPLE'))])
B('gente1', trava=4, nome='THE PEOPLE', fonte='CENS, JULY 2014 · TECHNEWS (TSMC CO-COO Y.P. CHYN)', falas=[
 F("In twenty fourteen, T-S-M-C was behind in the race to the next generation of chips.", **N(d='big', rot='2014', t='BEHIND', sub='Behind in the race to the next generation.', cor='verm')),
 F("So it did something drastic. It put its research on three shifts.", **N(d='nums', it=[['400+', 'R&D SPECIALISTS'], ['3', 'SHIFTS · 24 HOURS A DAY'], ['+30%', 'BASE PAY FOR THE NIGHT TEAMS']], n=2, cab=None)),
 F("More than four hundred researchers, working around the clock, with thirty percent more base pay.", n=3),
 F("Inside the company it was called the Night Hawk program.", k='Code name: *Night Hawk*.'),
 F("Here's the part most videos skip. It didn't last.", **N(d='duas', l1='It ran for about six months.', l2='', n=1, rot='THE PART MOST VIDEOS SKIP')),
 F("A T-S-M-C executive later said it was cancelled after about six months, because research runs on ideas, not on hours.", p=0.3, n=2, l2='Research runs on ideas, not hours.'),
])
B('gente2', trava=4, nome='THE PEOPLE', fonte='TAIWAN NSTC, VIA TAIWAN NEWS · TSMC', falas=[
 F("So the lock isn't that they work harder.", **N(d='versus', a='WORK HARDER', b='KNOW MORE', ra='WHAT PEOPLE THINK', rb='WHAT IT REALLY IS', la=['Longer shifts', 'Tried in 2014', 'Cancelled in six months'], lb=['One job, for a whole career', 'Almost forty years of it', 'Nearly all in one country'], n=0)),
 F("It's that thousands of them have spent a whole career on one thing.", n=1),
 F("Getting one more nine out of a process that already looks perfect.", n=2),
 F("And Taiwan's own government says most of that research workforce is still in Taiwan.", n=3),
 F("You can't hire that. You can only grow it. And it takes as long as it takes.", p=0.3, k="You can't hire it. You can only *grow* it."),
])
B('recap', trava=4, nome='THE PEOPLE', falas=[
 F("That's four locks.", **TR(ab=0, at=0, n=3, tl=['Four locks.'])),
 F("Fifty billion dollars a year.", ab=1),
 F("A thousand steps that all have to work.", ab=2),
 F("A town full of suppliers.", ab=3),
 F("And a generation of engineers.", ab=4),
 F("All four are brutal. And all four can be bought, with enough money and enough time.", tl=['Four locks.', '*Buyable*, in theory.'], k='Money. And time.'),
 F("America is buying them right now. So are China, Japan and Korea.", k='America, China, Japan and Korea are all trying.'),
 F("The fifth lock is different.", **TR(ab=4, at=5, n=3, tl=['The fifth lock', 'is *different*.'])),
 F("Remember the question I asked you?", p=0.6, k='Remember the question?'),
])

# ---------- TRAVA 5
B('prom0', trava=5, nome='? ? ?', falas=[F("Lock five.", p=0.3, **N(d='big', rot='LOCK 5 OF 5', t='? ? ?', cor='ambar'))])
B('prom1', trava=5, nome='? ? ?', fonte='TSMC (COMPANY HISTORY)', falas=[
 F("In nineteen eighty seven, an engineer in his mid fifties, named Morris Chang, started a chip company in Taiwan, with an idea almost nobody took seriously.", **N(d='big', rot='HSINCHU, TAIWAN', t='1987', sub='Morris Chang starts a chip company with a strange idea.', cor='osso')),
 F("Back then, if you designed a chip, you also built the factory to make it.", **N(d='versus', a='EVERY CHIP COMPANY', b='HIS COMPANY', ra='1987 · THE NORMAL WAY', rb='1987 · THE STRANGE IDEA', la=['Designs its own chips', 'Builds its own factory', 'Sells its own products'], lb=['Designs nothing', 'Only builds for others', 'Sells no chip of its own'], n=1)),
 F("That was the whole industry. Design it, make it, sell it.", n=3),
 F("Chang's company would design nothing.", n=1),
 F("It would only manufacture chips for other people. And it would never sell one of its own.", p=0.3, n=3),
])
B('prom2', trava=5, nome='THE PROMISE', fonte='TSMC', falas=[
 F("That's lock five. The promise.", **N(d='big', rot='LOCK 5 OF 5', t='THE PROMISE', cor='menta')),
 F("We will be everyone's factory. And we will never compete with you.", sub="Everyone's factory. Nobody's competitor."),
 F("Now go back to my question.", **N(d='versus', a='SAMSUNG · INTEL', b='TSMC', ra='ALSO SELL THEIR OWN CHIPS', rb='SELLS NO CHIP OF ITS OWN', la=['Can make your chip', 'Also sell chips or phones', '= your competitor sees your design'], lb=['Can make your chip', 'Has no product to protect', '= nobody to leak it to'], n=0)),
 F("Samsung can make your chip. But Samsung also sells phones, and its own processors.", n=2),
 F("Intel can make your chip. But Intel sells its own processors too.", n=2),
 F("Handing them your next design means handing it to a company that competes with you.", n=3),
 F("T-S-M-C has nothing to compete with. It has no product. It only has your trust.", p=0.3, k='No product. Only *your trust*.'),
])
B('prom3', trava=5, nome='THE PROMISE', fonte='TSMC FORM 20-F 2025 · ANNUAL REPORT 2025', falas=[
 F("And that's why companies that fight each other everywhere else, all build in the same place.", **N(d='teto', n=1, tit=['Rivals everywhere else. *Neighbors here*.'])),
 F("Apple and Qualcomm. Nvidia and A-M-D. Their most secret designs sit in the same fabs, at the same time.", n=2),
 F("T-S-M-C's ten biggest customers were seventy eight percent of its revenue in twenty twenty five.", n=3),
 F("They tell T-S-M-C what they'll need years ahead, and T-S-M-C builds the factories for it.", k='They plan *years ahead*, together.'),
 F("That only works if every single one of them believes the promise.", p=0.3, k='It only works if *all of them* believe the promise.'),
])
B('prom4', trava=5, nome='THE PROMISE', falas=[
 F("So here's what a real copy would need.", **N(d='check', it=[['$50 BILLION A YEAR', 0], ['ONE MORE NINE OF YIELD', 0], ['A TOWN OF SUPPLIERS', 0], ['39 YEARS OF KEEPING A PROMISE', 0]], n=0, cab='WHAT A REAL COPY WOULD NEED')),
 F("Fifty billion dollars a year.", n=1),
 F("One more nine of yield.", n=2),
 F("A town of suppliers.", n=3),
 F("And thirty nine years of never once competing with a customer.", n=4),
 F("You can build a fab in four years.", **N(d='duas', l1='You can build a fab in four years.', l2='', n=1)),
 F("You can't build thirty nine years of trust.", p=0.7, n=2, l2="You can't build 39 years of trust."),
])
B('cta2', trava=5, nome='THE PROMISE', falas=[
 F("If you know someone who thinks a big enough check can move the chip industry, send them this video.", **N(d='cta', ic='env', t=['SEND THIS', 'to that friend'], n=1)),
 F("Because the strangest part is still coming.", n=2, s='The strangest part is next'),
])

# ---------- FECHO
B('fecho1', fonte='TAIWAN NSTC, VIA TAIWAN NEWS · TSMC', falas=[
 F("Go back to Arizona one last time.", **N(d='big', t='BACK TO ARIZONA', cor='osso')),
 F("From the announcement in twenty twenty, the first fab there took until late twenty twenty four to reach volume production.", **N(d='cadeia', it=[['4 nm', 'ARIZONA · SINCE LATE 2024', 'cinza'], ['3 nm', 'ARIZONA · PLANNED', 'cinza'], ['2 nm', 'TAIWAN · IN PRODUCTION', 'menta']], n=1, tit=['The copy runs *two steps behind*. By design.'])),
 F("It makes four nanometer chips. Three nanometer is planned next.", n=2),
 F("Meanwhile, Taiwan is already on two.", n=3),
 F("And that's not an accident. It's a rule.", k="That's not an accident. It's *a rule*."),
])
B('fecho2', fonte='TAIWAN NSTC, VIA TAIWAN NEWS · TSMC CFO, VIA CNBC', falas=[
 F("Taiwan's government calls it N minus two.", **N(d='big', rot="TAIWAN'S RULE FOR CHIP FACTORIES ABROAD", t='N − 2', cor='ambar')),
 F("Whatever T-S-M-C builds abroad, has to stay two generations behind what it runs at home.", sub='Abroad: two generations behind what runs at home.'),
 F("And T-S-M-C's own finance chief has said the most advanced technology stays in Taiwan, because research and manufacturing have to work side by side.", **N(d='duas', l1='The newest technology stays home,', l2='', n=1, rot='TSMC, IN ITS OWN WORDS (PARAPHRASED)')),
 F("Side by side. In the same town. With the same neighbors.", p=0.4, n=2, l2='next to the people who invent it.'),
])
B('fecho3', falas=[
 F("So that's the real reason nobody can copy T-S-M-C.", **N(d='voo', n=3, k='The real reason nobody can copy TSMC:')),
 F("Two hundred and sixty five billion dollars later, the original is still learning how to copy itself.", p=0.9, k='$265 billion later, the original is still learning to *copy itself*.'),
])
B('fim', falas=[
 F("The factory is one link in a chain. And almost every link has a company like this hiding in it.", **N(d='fim', n=0, elo='THE FACTORY')),
 F("Next, we open another one.", n=1),
 F("Subscribe, so it finds you.", n=2),
 F("And tell me in the comments which company you want taken apart next.", n=3),
])
r.salva()

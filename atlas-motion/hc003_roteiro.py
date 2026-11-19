# Hard to Copy #03: Nvidia / CUDA. Uso: python3 hc003_roteiro.py <pasta de saída>
# Fontes por fato: ver HARD-TO-COPY.md (comunicados da NVIDIA de 12 e 17/11/2026, 10-K e Annual Review do ano fiscal 2026, Computer History Museum, New Yorker via secundárias).
from htc_comum import F, N, Roteiro
NOMES = [['THE LANGUAGE', 'A way to talk to the chip'], ['THE LIBRARIES', 'Twenty years of finished work'], ['THE HABIT', '7.5 million people trained on it'], ['THE WHOLE MACHINE', 'Chips, network and software as one'], ['? ? ?', 'Not technology at all']]
r = Roteiro(NOMES, 'SOFTWARE + HARDWARE'); B = r.B; TRAVA = r.TRAVA; TR = r.TR
TORRE = [['THE CHIPS', 'DESIGNED BY NVIDIA', 'fantasma'], ['THE NETWORK', 'LINKS THOUSANDS OF CHIPS', 'fantasma'], ['THE SOFTWARE', 'RUNS ONLY ON THESE CHIPS', 'menta'], ['7.5 MILLION DEVELOPERS', 'TRAINED ON THAT SOFTWARE', 'fantasma'], ['THE FOUNDER', 'CEO FOR 33 YEARS', 'ambar']]

B('gancho', fonte='NVIDIA NEWSROOM, NOVEMBER 12, 2026', falas=[
 F("This is Nvidia. Thirty three years of work, with one man at the top.", **N(d='pilha', it=TORRE, n=5, sai=4, sn=6, k='Thirty three years. *One CEO*.')),
 F("On November twelfth, twenty twenty six, he resigned.", n=6, k='November 12, 2026: *he resigned*.'),
 F("And the tower didn't move.", p=0.3, k="The tower *didn't move*."),
])
B('cinco', fonte='NVIDIA, Q3 FISCAL 2027 RESULTS (NOVEMBER 17, 2026)', falas=[
 F("Five days later, Nvidia reported its biggest quarter ever.", **N(d='big', rot='FIVE DAYS LATER', t='$115.8 BILLION', sub='Revenue in a single quarter. Up 103% in a year.', cor='ambar')),
 F("A hundred and fifteen point eight billion dollars in three months. Double the year before.", p=0.2),
 F("Its customers didn't leave. Because they can't.", p=0.3, **N(d='big', t="THEY CAN'T LEAVE", sub="The customers didn't leave. They can't.", cor='menta')),
])
CASO = [['A FASTER CHIP', 1], ['A CHEAPER CHIP', 1], ['BILLIONS OF DOLLARS', 1], ["NVIDIA'S CUSTOMERS", 0]]
B('caso', falas=[
 F("Think about how strange that is. Rivals have built faster chips for some jobs.", **N(d='check', it=CASO, n=1, cab='WHAT THE RIVALS HAVE')),
 F("They've built cheaper chips.", n=2),
 F("They have billions of dollars, and some of the best engineers alive.", n=3),
 F("And they still can't pull Nvidia's customers away.", n=4),
 F("Because the thing holding those customers isn't the chip.", p=0.4, k="What holds them *isn't the chip*."),
])
B('mapa', [
 F("So what is it?", **N(d='big', t='SO WHAT IS IT?', cor='ambar')),
 F("There are five locks.", **TR(ab=0, at=0, n=1, tl=['Five locks.'])),
 F("Four of them are software and hardware.", n=2),
 F("The fifth is something almost no company is willing to do.", n=3, tl=['Five locks.', 'The last one', '*almost nobody will do*.']),
 F("And it's the one that left the building on November twelfth.", p=0.4, k='It may have *left the building* on November 12.'),
])

# ---------- TRAVA 1
B('ling0', trava=1, nome='THE LANGUAGE', falas=[F("Lock one. The language.", **TRAVA(1, 'THE LANGUAGE'))])
B('ling1', trava=1, nome='THE LANGUAGE', fonte='NVIDIA · ILLUSTRATION, SIMPLIFIED CODE', falas=[
 F("Twenty years ago, a graphics chip did one thing. It drew video games.", **N(d='codigo', n=0, tit=['A graphics chip only spoke *one language*.'])),
 F("It was incredibly good at doing thousands of small calculations at the same time.", n=1),
 F("Scientists wanted that power. But to use it, they had to disguise their math as a picture, and trick the chip into drawing it.", n=2),
 F("In two thousand six, Nvidia announced a way out. It's called CUDA.", n=3, tit=['2006: *CUDA*. Talk to the chip in normal code.']),
 F("With CUDA, you write ordinary code, and the chip runs it on thousands of cores at once.", n=4),
 F("And Nvidia gave it away for free.", p=0.3, k='And it was *free*.'),
])
B('ling2', trava=1, nome='THE LANGUAGE', falas=[
 F("Free sounds generous. It's also the lock.", **N(d='duas', l1='Free sounds generous.', l2='', n=1)),
 F("Because CUDA only runs on Nvidia chips.", p=0.3, n=2, l2='It only runs on Nvidia chips.'),
 F("Every line of code written in it, is a line that can't simply move to anyone else.", k="Every line written is a line that *can't simply move*."),
])

# ---------- TRAVA 2
B('lib0', trava=2, nome='THE LIBRARIES', falas=[F("Lock two. The libraries.", **TRAVA(2, 'THE LIBRARIES'))])
B('lib1', trava=2, nome='THE LIBRARIES', fonte='NVIDIA FORM 10-K, FISCAL 2026', falas=[
 F("Almost nobody writes CUDA directly anymore.", **N(d='pilha', it=[['THE CHIP', 'NVIDIA GPU', 'fantasma'], ['CUDA', 'THE LANGUAGE · 2006', 'menta']], n=2, tit=['Nobody starts from zero. *They start here*.'])),
 F("They use libraries. Finished, tested pieces of software that sit on top of it.", it=[['THE CHIP', 'NVIDIA GPU', 'fantasma'], ['CUDA', 'THE LANGUAGE · 2006', 'menta'], ['THE LIBRARIES', 'HUNDREDS OF THEM', 'menta']], n=3),
 F("One for neural networks. One for weather. One for chemistry. One for video.", n=3),
 F("Nvidia's own filings count hundreds of them.", n=3),
 F("Each one took years to write. And years more to make fast.", n=3, k='Years to write. *Years more* to make fast.'),
 F("And on top of those sit the tools the whole AI world builds with.", it=[['THE CHIP', 'NVIDIA GPU', 'fantasma'], ['CUDA', 'THE LANGUAGE · 2006', 'menta'], ['THE LIBRARIES', 'HUNDREDS OF THEM', 'menta'], ['THE AI TOOLS', 'WHAT RESEARCHERS ACTUALLY TOUCH', 'osso']], n=4),
 F("Then the models. Then the apps you actually use.", it=[['THE CHIP', 'NVIDIA GPU', 'fantasma'], ['CUDA', 'THE LANGUAGE · 2006', 'menta'], ['THE LIBRARIES', 'HUNDREDS OF THEM', 'menta'], ['THE AI TOOLS', 'WHAT RESEARCHERS ACTUALLY TOUCH', 'osso'], ['THE MODELS AND APPS', 'WHAT YOU ACTUALLY USE', 'osso']], n=5),
])
B('lib2', trava=2, nome='THE LIBRARIES', falas=[
 F("So when a rival ships a new chip, it isn't competing with a chip.", **N(d='versus', a='A NEW RIVAL CHIP', b='AN NVIDIA CHIP', ra='DAY ONE', rb='DAY ONE', la=['Fast hardware', 'Its own new software', 'Most tools: support comes later'], lb=['Fast hardware', 'Twenty years of software', 'Most tools: work out of the box'], n=1)),
 F("It's competing with twenty years of software that already works.", n=2),
 F("The new tools usually run on Nvidia first. Everyone else gets support later, if they get it at all.", n=3),
 F("A faster chip that can't run your code, isn't faster. It's a paperweight.", p=0.4, k="A faster chip that can't run your code is *a paperweight*."),
])

# ---------- TRAVA 3
B('hab0', trava=3, nome='THE HABIT', falas=[F("Lock three. The habit.", **TRAVA(3, 'THE HABIT'))])
B('hab1', trava=3, nome='THE HABIT', fonte='COMPUTER HISTORY MUSEUM (ALEXNET SOURCE CODE)', falas=[
 F("In twenty twelve, three researchers in Toronto entered a contest to recognize objects in photos.", **N(d='big', rot='TORONTO', t='2012', sub='Three researchers enter an image recognition contest.', cor='osso')),
 F("They trained their program on two Nvidia gaming cards. The kind you could buy in a store.", **N(d='nums', it=[['2', 'GAMING CARDS'], ['≈ 6,000', 'LINES OF CUDA CODE']], n=1)),
 F("The code was about six thousand lines of CUDA.", n=2),
 F("It crushed everything else in the contest. It's called AlexNet, and it started the modern AI boom.", k='Its name: *AlexNet*. It started the AI boom.'),
 F("And from that day on, if you wanted to do AI research, you did it the way they did.", p=0.3, k='From then on, everyone did it *their way*.'),
])
B('hab2', trava=3, nome='THE HABIT', fonte='NVIDIA ANNUAL REVIEW, FISCAL 2026', falas=[
 F("Today, Nvidia says more than seven and a half million developers use CUDA and its tools.", **N(d='grade', tot=750, lit=0, cada='EACH DOT = 10,000 DEVELOPERS', r1=[7500000, 'DEVELOPERS USING CUDA AND NVIDIA TOOLS', '+'], n=1)),
 F("That's seven and a half million people who learned on it at university,", k='They *learned* on it.'),
 F("got hired because they knew it,", k='They got *hired* for it.'),
 F("and wrote years of working code in it.", k='They wrote *years of code* in it.'),
 F("To switch chips, a company doesn't just buy new hardware. It has to retrain its people, and rewrite and re-test what they built.", p=0.3, k='Switching means *retraining people* and *rewriting code*.'),
])
B('cta1', trava=3, nome='THE HABIT', falas=[
 F("Quick question, before the next lock.", **N(d='cta', ic='com', t=['QUICK QUESTION'], n=0)),
 F("If you ran an AI company, how much cheaper would a rival chip have to be, before you'd rewrite everything? Twenty percent? Fifty?", n=1, t=['HOW MUCH CHEAPER', 'TO SWITCH?']),
 F("Put your number in the comments. Then see if lock four changes it.", n=2, s='Comment your number'),
])

# ---------- TRAVA 4
B('maq0', trava=4, nome='THE WHOLE MACHINE', falas=[F("Lock four. The whole machine.", **TRAVA(4, 'THE WHOLE MACHINE'))])
B('maq1', trava=4, nome='THE WHOLE MACHINE', fonte='NVIDIA (MELLANOX ACQUISITION, COMPLETED APRIL 2020)', falas=[
 F("A modern AI model isn't trained on one chip. It's trained on thousands of them, acting as one.", **N(d='cadeia', it=[['THE CHIPS', 'THOUSANDS OF THEM', 'fantasma'], ['THE NETWORK', 'MAKES THEM ACT AS ONE', 'ambar'], ['THE SOFTWARE', 'TELLS THEM WHAT TO DO', 'menta']], n=1, tit=["One chip is useless. *Thousands, acting as one*."])),
 F("Which means the connections between the chips matter as much as the chips.", n=2),
 F("In twenty twenty, Nvidia bought a networking company called Mellanox, for about seven billion dollars.", n=2, k='2020: Nvidia buys Mellanox for about *$7 billion*.'),
 F("At the time, it looked like a side business.", k='It looked like *a side business*.'),
 F("Now Nvidia doesn't sell you a chip. It sells you the chips, the network between them, and the software on top. Designed together, delivered as one rack.", n=3, k=None),
 F("And it replaces that whole machine with a new generation about once a year.", k='A new generation *about once a year*.'),
 F("By the time a rival matches one, the next one is already shipping.", p=0.3, k='Match one, and *the next is already shipping*.'),
])
B('maq2', trava=4, nome='THE WHOLE MACHINE', fonte='NVIDIA ANNUAL REVIEW, FISCAL 2026', falas=[
 F("In fiscal twenty twenty six, Nvidia's data center business brought in a hundred and ninety four billion dollars.", **N(d='nums', it=[['$194 bn', 'DATA CENTER REVENUE · FISCAL 2026'], ['+142%', 'DATA CENTER NETWORKING, SAME YEAR']], n=1)),
 F("And its data center networking revenue grew a hundred and forty two percent in a single year.", n=2),
 F("So a rival doesn't have to beat one product. It has to beat three, that were built to fit each other.", p=0.3, k='Not one product. *Three*, built to fit each other.'),
])
B('recap', trava=4, nome='THE WHOLE MACHINE', falas=[
 F("That's four locks.", **TR(ab=0, at=0, n=3, tl=['Four locks.'])),
 F("A language only their chips speak.", ab=1),
 F("Twenty years of libraries.", ab=2),
 F("Seven and a half million trained people.", ab=3),
 F("And a whole machine, sold as one.", ab=4),
 F("All four can be copied. With enough money, and enough engineers.", tl=['Four locks.', '*Copyable*, in theory.'], k='Money. Engineers. Time.'),
 F("A-M-D is trying. Intel is trying. Google builds its own chips, with its own software.", k='AMD, Intel and Google are all trying.'),
 F("The fifth lock is why it's taking them so long.", **TR(ab=4, at=5, n=3, tl=['The fifth lock', 'is *why it takes so long*.'])),
 F("And it has nothing to do with engineering.", p=0.6, k='It has *nothing to do* with engineering.'),
])

# ---------- TRAVA 5
B('dec0', trava=5, nome='? ? ?', falas=[F("Lock five.", p=0.3, **N(d='big', rot='LOCK 5 OF 5', t='? ? ?', cor='ambar'))])
B('dec1', trava=5, nome='? ? ?', fonte='THE NEW YORKER (2023), VIA SECONDARY REPORTS', falas=[
 F("Go back to two thousand six. Nvidia is a company that sells graphics cards to gamers.", **N(d='linhaT', pts=[[2006, 'CUDA', 'ANNOUNCED'], [2008, 'STOCK DOWN', 'ABOUT 70%', 'verm'], [2012, 'ALEXNET', 'TWO GAMING CARDS', 'menta'], [2016, 'WALL STREET', 'STARTS TO BELIEVE', 'ambar']], n=1, de=2006, ate=2016)),
 F("And its C-E-O decides to put CUDA on every single chip. Including the ones for people who will never use it.", k='CUDA went on *every* chip. Even for people who never used it.'),
 F("That made every chip more expensive to design. And for years, almost nobody wanted it.", k='More cost. For years, *almost no demand*.'),
 F("Investors hated it. By the end of two thousand eight, Nvidia's stock had reportedly fallen about seventy percent.", n=2, k=None),
 F("Nvidia kept paying for it anyway. Through two thousand nine. Ten. Eleven.", k='Nvidia *kept paying* anyway.'),
 F("Then AlexNet happened.", n=3, k=None),
 F("And by one account, it still took until around twenty sixteen for Wall Street to believe it.", n=4),
 F("Ten years, of paying for something the market didn't want.", p=0.4, n=5, vao=['10 YEARS', 'OF PAYING FOR SOMETHING THE MARKET DID NOT WANT']),
])
B('dec2', trava=5, nome='THE LOST DECADE', falas=[
 F("That's lock five. The lost decade.", **N(d='big', rot='LOCK 5 OF 5', t='THE LOST DECADE', cor='menta')),
 F("Any big company can afford the engineers.", sub='Any big company can afford the engineers.'),
 F("Almost none can afford to look wrong for ten years in a row.", p=0.3, sub='Almost none can afford to look wrong for ten years.'),
])
B('dec3', trava=5, nome='THE LOST DECADE', fonte='NVIDIA, Q3 FISCAL 2027 RESULTS', falas=[
 F("And it's worse for a rival today than it was for Nvidia then.", **N(d='versus', a='A RIVAL, STARTING NOW', b='NVIDIA', ra='THE NEXT TEN YEARS', rb='THE NEXT TEN YEARS', la=['Must fund software for a decade', 'Against a 20 year head start', 'While answering to investors every quarter'], lb=['Already has the software', 'Adds to it every single day', 'Earns over $100 billion a quarter'], n=0)),
 F("A rival has to fund ten years of software.", n=1),
 F("Against a twenty year head start.", n=2),
 F("While the company it's chasing earns more than a hundred billion dollars a quarter, and spends part of it widening the gap.", n=3),
 F("The only ones seriously trying are the ones rich enough to build chips for themselves. Google. Amazon. Microsoft.", k='The ones trying: companies *rich enough to wait*.'),
 F("They're not copying Nvidia to sell against it. They're copying it to stop paying it.", p=0.3, k="Not to sell against Nvidia. To *stop paying* it."),
])
B('furo', trava=5, nome='THE LOST DECADE', falas=[
 F("Is this lock perfect? No. And you should know where the cracks are.", **N(d='big', rot='TO BE FAIR', t='THE CRACKS', cor='verm')),
 F("Training a brand new model is where CUDA is strongest.", **N(d='cadeia', it=[['TRAINING', 'WHERE CUDA IS STRONGEST', 'menta'], ['RUNNING THE MODEL', 'EASIER TO MOVE', 'ambar']], n=1)),
 F("But running a finished model, millions of times a day, is simpler work. It's easier to move to another chip.", n=2),
 F("And that's exactly where the custom chips are aimed.", leg='THIS IS WHERE THE CUSTOM CHIPS ARE AIMED', ln=2),
 F("So the lock isn't that nobody can ever leave. It's that leaving costs years. And almost nobody has years to spare.", p=0.3, k="Leaving costs years. Almost nobody has *years to spare*."),
])
B('dec4', trava=5, nome='THE LOST DECADE', falas=[
 F("So here's what a real copy would need.", **N(d='check', it=[['A LANGUAGE PEOPLE ACTUALLY USE', 0], ['20 YEARS OF LIBRARIES', 0], ['7.5 MILLION TRAINED DEVELOPERS', 0], ['A DECADE OF LOOKING WRONG', 0]], n=0, cab='WHAT A REAL COPY WOULD NEED')),
 F("A language people actually use.", n=1),
 F("Twenty years of libraries.", n=2),
 F("Millions of trained developers.", n=3),
 F("And a leader willing to look wrong for a decade.", n=4),
 F("You can copy a chip in three years.", **N(d='duas', l1='You can copy a chip in three years.', l2='', n=1)),
 F("You can't copy a decade nobody wanted to pay for.", p=0.7, n=2, l2="You can't copy a decade nobody wanted."),
])
B('cta2', trava=5, nome='THE LOST DECADE', falas=[
 F("If you know someone who thinks Nvidia is finished because its founder is gone, send them this video.", **N(d='cta', ic='env', t=['SEND THIS', 'to that friend'], n=1)),
 F("Because there's one thing they'd be right about.", n=2, s="The one thing they'd be right about"),
])

# ---------- FECHO
B('fecho1', fonte='NVIDIA NEWSROOM, NOVEMBER 12, 2026', falas=[
 F("Go back to the tower.", **N(d='pilha', it=TORRE, n=5, sai=4, sn=6)),
 F("The founder is gone. The chips, the network, the software and the developers are all still there.", n=6),
 F("Nvidia's board says the roadmap continues without interruption. And for now, the numbers agree.", k='The board: the roadmap continues *without interruption*.'),
 F("The four locks don't need him.", p=0.3, k="Four locks *don't need him*."),
])
B('fecho2', falas=[
 F("But the fifth one did.", **N(d='big', rot='THE FIFTH LOCK', t='NEEDED HIM', cor='ambar')),
 F("CUDA exists because one person was allowed to be wrong for ten years.", sub='CUDA exists because one person could be wrong for ten years.'),
 F("A founder can do that. An interim C-E-O, with a board and a search committee, almost never can.", p=0.3, sub='A founder can do that. A caretaker almost never can.'),
])
B('fecho3', falas=[
 F("So that's the real reason nobody can copy Nvidia.", **N(d='big', t='THE REAL REASON', cor='osso')),
 F("Nobody can copy the last twenty years.", **N(d='duas', l1='Nobody can copy the last twenty years.', l2='', n=1)),
 F("The real question is who, inside Nvidia, gets to start the next ten.", p=0.9, n=2, l2='Who gets to start the next ten?'),
])
B('fim', falas=[
 F("The software is one link in a chain. And almost every link has a company like this hiding in it.", **N(d='fim', n=0, elo='THE SOFTWARE')),
 F("Next, we open another one.", n=1),
 F("Subscribe, so it finds you.", n=2),
 F("And tell me in the comments which company you want taken apart next.", n=3),
])
r.salva()

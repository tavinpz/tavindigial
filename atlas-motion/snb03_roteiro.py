# Gera public/snb/v03/roteiro.json do Strong Not Big #03 (Gymnasts): cada fala leva o texto, a pausa extra (p) e o que aparece na tela (v).
# v herda da fala anterior do mesmo bloco; chave com None apaga. Ver src/snb/Video.tsx para o que cada chave desenha.
import json
def F(txt, p=0, **v): return {'txt': txt, 'p': p, 'v': v}
E, D = 430, 900          # x das duas figuras quando há dupla
X = 520                  # x da figura sozinha
def fig(p, x=X, a=800, **o): return dict(p=p, x=x, a=a, **o)
LIMPA = dict(icone=None, big=None, sub=None, num=None, lista=None, cart=None, rank=None, barras=None, anel=None, brilho=None, figs=None, mao=None, aviso=None, bigy=None, c=None)
def N(**v): return {**LIMPA, **v}   # tela nova
R = []
def B(cena, falas, et=None, fonte=None): R.append({'cena': cena, 'et': et, 'fonte': fonte, 'falas': falas})

G = lambda a, b: dict(it=[a, b])
RINGS = lambda **o: fig('argolas', X, 700, **o)
B('gancho', et='BODYWEIGHT STRENGTH · THE SCIENCE · AT HOME', falas=[
 F("This guy has never done a bench press in his life.", **N(figs=[fig('heroi')], big='ZERO', sub='bench presses. EVER.')),
 F("And he can hold his whole body in the air, on two rings, with his arms straight out to the sides.", **N(icone='cruz', big='THE CROSS', sub='arms STRAIGHT. whole body in the air.')),
 F("Most of a gymnast's strength is built with one tool. Their own body.", **N(figs=[RINGS()], big='ONE TOOL', sub='their own BODY')),
 F("No plates. No machines. And shoulders that most lifters would trade a year of training for.", **N(figs=[RINGS()], lista=dict(it=['NO plates', 'NO machines', 'and THOSE shoulders'], auto=1, lado=1, x=1))),
 F("So how do they get that strong, without the weights?", p=0.9, **N(big='HOW?', sub='without the WEIGHTS', c=1)),
])
B('prova', fonte='Kotarsky et al. 2018 · J Strength Cond Res · 23 moderately trained men · 4 weeks', falas=[
 F("First, is bodyweight training even real strength training? Researchers tested it.", **N(icone='flexao', big='REAL?', sub='is bodyweight REAL strength training')),
 F("Twenty three trained men. Four weeks. Three sessions a week.", **N(num=dict(ate=23, rot='trained men · 4 weeks · 3 sessions a week'))),
 F("One group did the bench press. The other group did only push-ups.", **N(cart=G(['BENCH PRESS', 'barbell and plates', ''], ['PUSH-UPS', 'bodyweight only', '']))),
 F("But not the same push-up every day. Each time it got easy, they moved to a harder version.", cart=G(['BENCH PRESS', 'barbell and plates', ''], ['PUSH-UPS', 'a HARDER version each time', ''])),
 F("They used a ladder. Wall push-ups. Incline. Knees. Full push-ups. Then close grip, uneven, and one arm versions.", **N(icone='flexao', lista=dict(it=['WALL', 'INCLINE', 'KNEES', 'FULL', 'CLOSE GRIP', 'UNEVEN', 'ONE ARM'], auto=1, lado=1))),
 F("Nobody added a single pound. They just climbed.", lista=None, big='THEY CLIMBED', sub='not ONE pound added'),
 F("At the end, both groups were tested on the bench press.", **N(big='THE TEST', sub='both groups, on the BENCH press', c=1)),
 F("Both groups got stronger. Including the men who never touched the bar.", p=0.8, **N(cart=G(['BENCH PRESS', 'barbell and plates', 'STRONGER'], ['PUSH-UPS', 'never touched the bar', 'STRONGER']))),
 F("That is the whole secret of gymnastics, in one study. You don't add weight. You make the same body harder to move.", **N(figs=[fig('heroi')], big='THE SECRET', sub='same body. HARDER to move.')),
])
B('promessa', falas=[
 F("So today: the four things gymnasts do that most people in a gym never do.", **N(lista=dict(it=['4 THINGS gymnasts do', 'THE CATCH nobody mentions', 'A ROUTINE you can start today'], n=1))),
 F("The catch that nobody mentions.", lista=dict(it=['4 THINGS gymnasts do', 'THE CATCH nobody mentions', 'A ROUTINE you can start today'], n=2)),
 F("And a routine you can start today, on your floor.", lista=dict(it=['4 THINGS gymnasts do', 'THE CATCH nobody mentions', 'A ROUTINE you can start today'], n=3)),
])
B('tarefa', et='QUICK TEST · DO IT NOW', falas=[
 F("But first, a test.", **N(icone='flexao', big='A TEST', sub='do it right now')),
 F("Get into a push-up. Lower yourself until your chest is a fist from the floor.", big='GO DOWN', sub='chest a FIST from the floor'),
 F("Now stay there. Don't move. Time it.", p=4.5, big=None, sub=None, anel=dict(seg=60, txt='stay DOWN · do not move · time it'), aviso=1, icone='flexao_baixo'),
 F("Comment your time. Most people are shocked by how short it is.", anel=None, big='COMMENT', sub='your HOLD time'),
 F("By the end, you'll know exactly why. And how to fix it.", big='WHY', sub='and how to FIX it'),
 F("Keep that number in your head. We're going to use it.", big='REMEMBER IT', sub='we will USE that number'),
])
B('regra1', et='REASON 1 · THE LEVER', falas=[
 F("Reason one. They change the lever, not the load.", **N(figs=[fig('heroi')], big='THE LEVER', sub='REASON 1 · not the load')),
 F("In a gym, when something gets easy, you add a plate.", **N(figs=[fig('academia_barra', X, 640)], big='ADD A PLATE', sub='the GYM way')),
 F("A gymnast can't do that. Their body weighs the same every day.", **N(figs=[fig('heroi')], big='SAME WEIGHT', sub='every single DAY')),
 F("So they move the weight farther from their hands.", **N(icone='flexao', big='FARTHER', sub='from the HANDS')),
 F("Think about holding a bucket of water. Close to your chest, it's easy. At arm's length, it's brutal.", **N(mao=1, big="ARM'S LENGTH", sub='same bucket. BRUTAL.')),
 F("The bucket didn't get heavier. The lever got longer.", big='LONGER', sub='lever. same WEIGHT.'),
 F("A push-up, with your feet on a chair, puts more of you on your hands.", **N(icone='flexao', lista=dict(it=['PUSH-UP', 'FEET on a chair', 'LEAN forward', 'FEET off the floor'], n=2, lado=1))),
 F("Lean your shoulders past your hands, and it gets harder again.", lista=dict(it=['PUSH-UP', 'FEET on a chair', 'LEAN forward', 'FEET off the floor'], n=3, lado=1)),
 F("Keep going, and one day your feet leave the floor. That's a planche.", **N(icone='prancha', lista=dict(it=['PUSH-UP', 'FEET on a chair', 'LEAN forward', 'FEET off the floor'], n=4, lado=1))),
 F("Same body. And a load that most lifters could never press.", **N(icone='prancha', big='SAME BODY', sub='a load most lifters cannot PRESS')),
 F("It works the same way for pulling.", **N(figs=[RINGS()], big='PULLING', sub='works the SAME way')),
 F("A row with your feet on the floor. Then a pull-up. Then a pull-up with your body tilted back. Then flat, like a plank in the air.", big=None, sub=None, lista=dict(it=['ROW, feet down', 'PULL-UP', 'TILTED pull-up', 'body FLAT in the air'], auto=1, lado=1)),
 F("And for legs. Two legs. Then a split squat. Then one leg.", **N(figs=[fig('heroi', 380, 760)], lista=dict(it=['TWO legs', 'SPLIT squat', 'ONE leg'], auto=1, lado=1))),
 F("Every step is harder than the last, with zero equipment.", lista=None, big='NO GEAR', sub='every step is HARDER'),
])
B('regra2', et='REASON 2 · THEY HOLD STILL', fonte='Mattocks et al. 2017 · 38 untrained adults   |   Schoenfeld et al. 2014 · 17 trained men', falas=[
 F("Reason two. They hold still.", **N(icone='cruz', big='HOLD STILL', sub='REASON 2')),
 F("In the gym, a rep takes two seconds. Up, down, done.", **N(figs=[fig('academia_barra', X, 640)], big='2 SECONDS', sub='up. down. DONE.')),
 F("In gymnastics, a strength move only counts if you freeze in it.", **N(icone='cruz', big='FREEZE', sub='or it does not COUNT')),
 F("That means every muscle fighting, at the hardest point, with nowhere to hide.", big='NO HIDING', sub='at the HARDEST point'),
 F("No bounce. No momentum. No rest at the top.", big=None, sub=None, lista=dict(it=['NO bounce', 'NO momentum', 'NO rest at the top'], auto=1, lado=1, x=1)),
 F("And here's why that matters. Strength is specific.", **N(big='SPECIFIC', sub='strength is', c=1)),
 F("In one study, beginners who only practiced a max lift got just as strong at it as a group doing four hard sets.", **N(cart=G(['4 HARD SETS', 'to failure', 'MORE MUSCLE'], ['JUST THE TEST', 'a few max attempts', 'JUST AS STRONG']))),
 F("Your body gets good at exactly what you ask for. Gymnasts ask for the hardest position, held.", **N(icone='prancha', big='ASK FOR IT', sub='the hardest position, HELD')),
 F("It holds for trained lifters too. Seventeen experienced men, same total work, eight weeks.", **N(num=dict(ate=17, rot='trained men · same total work · 8 weeks'))),
 F("The group lifting heavy for three reps grew the same muscle as the group doing sets of ten. But gained more strength.", **N(cart=G(['3 × 10', 'moderate weight', 'SAME MUSCLE'], ['7 × 3', 'heavy weight', 'MORE STRENGTH']))),
 F("Hard and few beats easy and many. A gymnast's whole sport is built on that.", **N(icone='cruz', big='HARD + FEW', sub='beats easy and MANY')),
 F("That's why your push-up hold was so short. You've done thousands of reps. And almost no holding.", **N(icone='flexao_baixo', big='NO HOLDING', sub='thousands of reps. almost ZERO holds.')),
])
B('regra3', et='REASON 3 · STRENGTH PER POUND', falas=[
 F("Reason three. They are strong for their size, not just strong.", **N(figs=[fig('academia', E), fig('heroi', D)], big='PER POUND', sub='REASON 3')),
 F("Here's a piece of physics that most lifters ignore.", **N(big='PHYSICS', sub='most lifters IGNORE this', c=1)),
 F("A muscle's strength depends on how thick it is. Its cross section.", **N(mao=1, big='THICKNESS', sub="a muscle's strength = its CROSS section")),
 F("But your weight depends on your whole volume.", **N(figs=[fig('academia')], big='VOLUME', sub='your weight = your whole BODY')),
 F("So when a body gets bigger, weight grows faster than strength.", **N(barras=dict(un='', it=[['STRENGTH grows like', 2, 'verde'], ['WEIGHT grows like', 3, 'verm']], nota='x² vs x³'))),
 F("That's why an ant carries many times its weight, and an elephant can't jump.", **N(big='ANT vs ELEPHANT', sub='the small one WINS per pound', c=1)),
 F("Double the size of a body, and it gets about four times stronger. But eight times heavier.", **N(cart=G(['STRENGTH', 'twice the size', '4X'], ['WEIGHT', 'twice the size', '8X']))),
 F("That's a simplified model. Real bodies are messier. But the direction is real.", **N(big='SIMPLIFIED', sub='but the direction is REAL', c=1)),
 F("A big lifter moves more total weight. But a lighter athlete moves more of himself.", **N(figs=[fig('academia', E), fig('heroi', D)], big='MORE OF HIM', sub='the lighter one moves more of HIMSELF')),
 F("And in gymnastics, yourself is the only thing you have to move.", **N(figs=[RINGS()], big='ONLY YOU', sub='is all you have to MOVE')),
 F("This is not a reason to starve yourself. It's a reason to stop chasing size you'll never use.", **N(figs=[fig('heroi')], big='NOT A DIET', sub='just skip the size you never USE')),
 F("Every pound you add has to be lifted, on every single rep, for the rest of your life.", big='EVERY POUND', sub='gets lifted on every REP'),
])
B('regra4', et='REASON 4 · EVERY DAY, FOR YEARS', fonte='Calatayud et al. 2015 · J Strength Cond Res · 30 trained students · 5 weeks', falas=[
 F("Reason four. They practice it like a skill. Almost every day. For years.", **N(figs=[RINGS()], big='A SKILL', sub='REASON 4 · practiced for YEARS')),
 F("A lifter trains a muscle, then lets it rest for days.", **N(figs=[fig('academia')], big='THEN REST', sub='for DAYS')),
 F("A gymnast repeats the same shapes, again and again, staying far from failure.", **N(icone='cruz', big='AGAIN', sub='same shapes. far from FAILURE.')),
 F("Short, clean efforts. Many times a week. Never grinding.", big=None, sub=None, lista=dict(it=['SHORT efforts', 'CLEAN every time', 'MANY times a week', 'NEVER grinding'], auto=1, lado=1)),
 F("That's how you learn a skill. And remember, strength is one.", lista=None, big='A SKILL', sub='is learned by REPEATING it fresh'),
 F("And the muscle doesn't care where the tension comes from.", **N(big="DOESN'T CARE", sub='where the TENSION comes from', c=1)),
 F("In another study, thirty trained students were split into groups for five weeks.", **N(num=dict(ate=30, rot='trained students · 5 weeks'))),
 F("One group benched a weight they could lift six times. The other did push-ups against bands, just as hard.", **N(cart=G(['BENCH PRESS', '6 rep max', ''], ['BAND PUSH-UPS', 'just as hard', '']))),
 F("Same effort in the muscle. And the same gain in strength.", p=0.8, cart=G(['BENCH PRESS', '6 rep max', 'SAME GAIN'], ['BAND PUSH-UPS', 'just as hard', 'SAME GAIN'])),
 F("If it's hard enough, your body counts it. Bar or no bar.", **N(icone='flexao', big='IT COUNTS', sub='if it is HARD enough')),
])
B('virada', et='THE CATCH', falas=[
 F("So should you throw away your weights? No. Here's the catch.", **N(figs=[fig('academia', E), fig('heroi', D)], big='THE CATCH', sub='keep your WEIGHTS')),
 F("First. You are looking at the survivors.", **N(big='SURVIVORS', sub='is who you are LOOKING at', c=1)),
 F("Elite gymnasts are picked young, and they're usually short and light. The exact body the physics rewards.", **N(lista=dict(it=['picked YOUNG', 'short and LIGHT', 'the ones NOT hurt'], n=2))),
 F("The ones whose shoulders and wrists gave out, you never see.", lista=dict(it=['picked YOUNG', 'short and LIGHT', 'the ones NOT hurt'], n=3)),
 F("Second. Those holds took them years. Tendons and joints adapt much slower than muscles.", **N(mao=1, big='YEARS', sub='tendons adapt SLOWER than muscle')),
 F("Jump straight to the hard versions, and your elbows will tell you.", big='TOO FAST', sub='and your ELBOWS will tell you'),
 F("And third. Legs. Your legs already carry you all day. Bodyweight alone gets too easy for them, fast.", **N(figs=[fig('heroi')], big='LEGS', sub='outgrow bodyweight FAST')),
 F("A gymnast's legs are built mostly by sprinting, jumping and landing, not by slow holds.", big='JUMPING', sub='builds their legs. not HOLDS.'),
 F("For strong legs, a barbell or a heavy backpack is still the simplest tool there is.", **N(figs=[fig('bear_hug')], big='ADD LOAD', sub='for legs. a bar or a heavy PACK.')),
 F("So the lesson is not, quit the gym. It's, steal the four rules.", **N(big='STEAL', sub='the 4 RULES', c=1)),
])
RU = ['a harder LEVER', 'HOLD the hard point', 'stay LIGHT', 'practice OFTEN']
B('regras', et='THE 4 RULES', falas=[
 F("One. When it gets easy, make the lever harder, not the set longer.", **N(icone='flexao', lista=dict(it=RU, n=1, lado=1))),
 F("Two. Hold the hardest point.", lista=dict(it=RU, n=2, lado=1), icone='flexao_baixo'),
 F("Three. Build strength without chasing size you don't need.", **N(figs=[fig('heroi', 380, 760)], lista=dict(it=RU, n=3, lado=1))),
 F("Four. Practice often, and stop well before failure.", lista=dict(it=RU, n=4, lado=1)),
])
B('erros', et='3 MISTAKES', falas=[
 F("And three mistakes that kill progress.", **N(figs=[fig('heroi')], big='3 MISTAKES', sub='that kill PROGRESS')),
 F("Mistake one. Chasing reps. If you can do thirty push-ups, the thirty first won't make you stronger. A harder version will.", **N(icone='flexao', big='CHASING REPS', sub='30 easy ones teach you NOTHING new')),
 F("Mistake two. Bending your arms. In the lean and in the hang, straight arms are the whole point. That's where the tendons do the work.", **N(figs=[RINGS()], big='BENT ARMS', sub='straight arms are the whole POINT')),
 F("Mistake three. Holding until you shake and collapse. Stop while it still looks good. Quality is the training.", **N(icone='flexao_baixo', big='SHAKING', sub='stop while it still looks GOOD')),
])
B('rotina', et='THE GYMNAST STARTER · 10 MIN · 3× A WEEK', falas=[
 F("Here's a starter. Ten minutes, three times a week. Add it to what you already do.", **N(figs=[fig('heroi')], big='10 MIN', sub='3 times a week. an ADD ON.')),
 F("One. The bottom hold.", **N(icone='flexao_baixo', big='1', sub='THE BOTTOM HOLD')),
 F("The same test you just did. Chest a fist from the floor. Three holds. Stop a few seconds before you'd collapse.", big=None, sub=None, lista=dict(it=['1 · BOTTOM HOLD', 'chest a fist from the floor', '3 holds', 'stop BEFORE you collapse'], auto=1, lado=1, tit=1)),
 F("Too hard? Put your hands on a bench. Same hold.", p=1.5),
 F("Two. The lean.", **N(icone='flexao', big='2', sub='THE LEAN')),
 F("Top of a push-up. Arms locked. Now shift your shoulders forward, past your hands, and hold.", big=None, sub=None, lista=dict(it=['2 · THE LEAN', 'arms LOCKED', 'shoulders past your hands', 'hold'], auto=1, lado=1, tit=1)),
 F("That's the first step toward a planche. An inch forward is a lot.", p=1.5),
 F("Three. The hang.", **N(figs=[RINGS(anda=0)], big='3', sub='THE HANG')),
 F("Hang from a bar or rings, arms straight. Then pull your shoulders down, away from your ears, without bending your arms.", big=None, sub=None, lista=dict(it=['3 · THE HANG', 'arms STRAIGHT', 'shoulders DOWN', 'no bending'], auto=1, lado=1, tit=1)),
 F("Three holds of each. Next week, hold a little longer, or lean a little farther.", **N(figs=[fig('heroi')], big='3 HOLDS', sub='of each. then a little MORE.')),
 F("This is a starting point I put together, not a program from a study.", big='A START', sub='not a study PROGRAM', aviso=1),
])
B('cuidado', et='BE SAFE', falas=[
 F("Go slower than you want to. Your muscles will be ready long before your wrists and elbows are.", **N(mao=1, big='GO SLOW', sub='wrists and ELBOWS need longer', aviso=1)),
 F("Warm up your wrists first. And if a joint hurts, back off to the easier version.", big='BACK OFF', sub='if a JOINT hurts'),
 F("This is education, not medical advice. If you have an injury, check with a professional first.", **N(figs=[fig('heroi')], big='NOT MEDICAL', sub='advice. check with a PROFESSIONAL.')),
])
B('final', falas=[
 F("So, back to the guy on the rings.", **N(icone='cruz', big='THE RINGS', sub='back to that GUY')),
 F("He's not strong in spite of having no weights. He's strong because of how he uses his body.", **N(big='BECAUSE', sub='not in spite of it', c=1)),
 F("A longer lever. A frozen hold. A light frame. And years of practice.", **N(lista=dict(it=['a longer LEVER', 'a frozen HOLD', 'a light FRAME', 'years of PRACTICE'], auto=1))),
 F("You can take three of those four home today.", **N(figs=[fig('heroi')], big='3 OF 4', sub='you can take home TODAY')),
 F("You won't hold a cross. Almost nobody will. But a longer hold, a harder lever, and a body you can actually move? That's on the table for anyone.", **N(figs=[RINGS()], big='FOR ANYONE', sub='a body you can actually MOVE')),
 F("Repeat the bottom hold test in four weeks, and comment your new time.", **N(icone='flexao_baixo', big='4 WEEKS', sub='then comment your NEW time')),
 F("Next time: why a fifty year old who never trained can still crush your hand.", p=4.5, **N(big='NEXT VIDEO', sub='old man STRENGTH', c=1)),
])
json.dump(R, open('public/snb/v03/roteiro.json', 'w'), indent=1, ensure_ascii=False)
print(len(R), 'blocos', sum(len(b['falas']) for b in R), 'falas', sum(len(f['txt'].split()) for b in R for f in b['falas']), 'palavras')

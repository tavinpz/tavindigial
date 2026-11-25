# Gera public/snb/v06/roteiro.json do Strong Not Big #06 (What If You Got Twice as Strong Without Getting Bigger?).
# Mesmo formato do snb05_roteiro.py, com as chaves novas do Extra.tsx: obj (objetos de cena), tl (linha do tempo),
# face (close do rosto), zoom/foco (câmera) e imp (impacto: tremida + flash vermelho).
# Regras deste vídeo (25/11, leitura da curva do #05): nada de "plano" falado no começo; a 1ª cena da história entra antes de 0:30;
# cada bloco fecha com um gancho; pedido de comentário e de inscrição dentro da história.
import json, os
def F(txt, p=0, **v): return {'txt': txt, 'p': p, 'v': v}
X = 520
def fig(p, x=X, a=800, **o): return dict(p=p, x=x, a=a, **o)
LIMPA = dict(icone=None, big=None, sub=None, num=None, lista=None, cart=None, rank=None, barras=None, anel=None, brilho=None, figs=None, mao=None,
             aviso=None, bigy=None, c=None, obj=None, face=None, zoom=None, foco=None)
def N(**v): return {**LIMPA, **v}
R = []
def B(cena, falas, fonte=None): R.append({'cena': cena, 'et': None, 'fonte': fonte, 'falas': falas})
HEROI_BARRA = lambda x=640, **o: fig('heroi_barra_dobra', x, 660, **o)
GRANDE = lambda x=1360, p='academia_choque', **o: fig(p, x, 800, **o)

# ---------------- 0:00 abertura: o 1º quadro é a capa; a 1ª frase é o título ----------------
B('abertura', falas=[
 F("What if tomorrow morning you woke up twice as strong, and you didn't gain a single pound?",
   **N(figs=[HEROI_BARRA(), GRANDE()], zoom=1.06, foco=[900, 520])),
 F("Same body. Same T-shirt. Same number on the scale.", **N(figs=[fig('heroi_deboche', 470)], obj=[dict(t='balanca', n='72.4 KG', x=1260, y=700, igual=1)])),
 F("But the bar that crushed you yesterday now bends in your hands.", **N(figs=[HEROI_BARRA(960)], zoom=1.15, foco=[960, 470], imp=1)),
 F("And part of this has already been measured. In real people.", **N(obj=[dict(t='cartao', tit='MEASURED IN REAL PEOPLE', l=['1979 · strength jumps, muscle barely grows', '2004 · stronger without lifting anything'])])),
 F("But the reason it works is also the reason it could hurt you.", **N(obj=[dict(t='motor', estado='rompe')], imp=1)),
 F("So let's run it. Day by day. And find out what breaks first.", **N(tl=0, obj=[dict(t='cadeados', n=3, ab=0, y=600, rot=['?', '?', '?'])])),
])

# ---------------- DAY 1 (~0:22) ----------------
B('dia1', falas=[
 F("Day one. You walk into the kitchen, half asleep, and grab the milk.", **N(tl=0, figs=[fig('heroi', 430)], obj=[dict(t='galao', x=980, y=660)])),
 F("It flies straight up and hits the cabinet.", obj=[dict(t='galao', x=980, y=660, voa=1)], imp=1),
 F("You didn't try harder. Your body didn't change overnight. So what did?", **N(tl=0, face=dict(p='rosto_choque', lado='d', w=820, treme=1), big='WHAT CHANGED?', bigy=1)),
 F("Guess before I tell you. Is it your muscles, or your brain?", **N(tl=0, obj=[dict(t='enquete')])),
 F("Drop one word in the comments. Muscle, or brain. The answer is coming in a few seconds.", p=0.4),
 F("Here's the thing nobody tells you.", **N(tl=0, figs=[fig('heroi_esforco', 960, 760)], zoom=1.2, foco=[960, 440])),
 F("Your muscle is made of thousands of fibers, and your brain never fires all of them at once.", **N(tl=0, obj=[dict(t='corda', on=0.4)])),
 F("Picture a rope with a hundred workers on it. On a normal day, only some of them pull.", obj=[dict(t='corda', on=0.4)]),
 F("Twice as strong, with no new muscle, means getting more of them to pull. At the same moment.", obj=[dict(t='corda', on=1.0)]),
 F("And it's not just how many pull. Your brain can also fire each one faster, so every worker pulls harder, more often.", **N(tl=0, figs=[fig('heroi_esforco', 520)], big='FASTER', sub='every fiber fires MORE often')),
 F("Then there are the muscles fighting you. When you lift, the muscle on the other side of the joint tightens too, like a brake. Training teaches it to let go.", **N(tl=0, figs=[fig('heroi_barra', 520, 640)], big='LESS BRAKE', sub='the OPPOSITE muscle relaxes')),
 F("And that is exactly what happens to every beginner.", **N(tl=0, figs=[fig('heroi_deboche', 960, 760)], zoom=1.1, foco=[960, 460])),
 F("In 1979, Moritani and de Vries trained fifteen young people for eight weeks and tracked what changed.",
   **N(tl=0, obj=[dict(t='cartao', tit='MORITANI & DE VRIES · 1979', l=['15 young adults · 8 weeks of training', 'strength vs muscle size, week by week'])])),
 F("Strength jumped early. Muscle size barely moved.", **N(tl=0, obj=[dict(t='grafico')])),
 F("For the first three to five weeks, most of the gain came from the nervous system."),
 F("So if you commented brain, you got it. And if you said muscle, don't worry. Almost everyone does.", **N(tl=0, obj=[dict(t='enquete', marca='BRAIN')])),
 F("Your day one is the first month of training, squeezed into a single night.", **N(tl=0, obj=[dict(t='calend', x=960, rot=['DAY 1', 'DAY 30'])])),
 F("But your nervous system is only the first lock. There are two more.", **N(tl=0, obj=[dict(t='cadeados', n=3, ab=1, novo=1, rot=['NERVES', '?', '?'])])),
], fonte='Moritani & deVries 1979 · Am J Phys Med · 15 young adults · 8 weeks')

# ---------------- WEEK 1 ----------------
B('semana1', falas=[
 F("Week one. You walk into the gym.", **N(tl=1, figs=[fig('heroi', 960, 760, anda=1)])),
 F("You load what you usually bench. It feels like a broomstick.", **N(tl=1, figs=[fig('heroi_deboche', 430)], num=dict(ate=60, suf=' KG', rot='what you usually lift'))),
 F("So you double it.", **N(tl=1, figs=[fig('heroi_barra_dobra', 430, 640)], num=dict(ate=120, suf=' KG', rot='same body'), imp=1)),
 F("The guy next to you, twice your size, stops in the middle of his set.", **N(tl=1, face=dict(p='rosto_academia_choque', lado='d', w=820, treme=1), figs=[fig('heroi_deboche', 430)])),
 F("He's bigger. He has more muscle. Shouldn't he win?", **N(tl=1, figs=[fig('heroi', 640, 760), GRANDE(1300)], big=None)),
 F("Here's the dirty secret of every gym. Size and strength are not the same thing.", **N(tl=1, big='SIZE ≠ STRENGTH', c=1)),
 F("Your weight grows with your whole volume. Length, times width, times height.", **N(tl=1, obj=[dict(t='cubo')])),
 F("But your strength grows mostly with how thick the muscle is. Its cross section."),
 F("So the bigger a body gets, the faster its weight runs ahead of its strength."),
 F("Think of an ant carrying a leaf many times its own weight. Scale that ant up to your size, and it could barely carry itself.", **N(tl=1, obj=[dict(t='cubo')], big=None)),
 F("That's why, pound for pound, the strongest humans alive are usually the small ones.", **N(tl=1, figs=[fig('heroi_deboche', 640, 720), GRANDE(1300)])),
 F("In 1988, a lifter who weighed just under sixty kilos put a hundred and ninety kilos over his head.", **N(tl=1, num=dict(ate=190, suf=' KG', rot='overhead · lifter weighing 59.7 kg · 1988'))),
 F("More than three times his own body weight.", **N(tl=1, barras=dict(it=[['HIS BODY', 59.7, 'cinza'], ['THE BAR', 190, 'verm']], un=' kg', nota='3.2×'))),
 F("For a two hundred kilo giant to match that, he'd need over six hundred kilos overhead. Nobody has ever come close.",
   **N(tl=1, barras=dict(it=[['GIANT', 200, 'cinza'], ['TO MATCH', 636, 'verm']], un=' kg', nota='NEVER'))),
 F("Back in your gym, the big guy finally walks over and asks what program you're on.", **N(tl=1, figs=[fig('heroi', 560, 760), GRANDE(1250, 'academia', anda=1)])),
 F("You tell him the truth. It's called Strong Not Big. Real studies, every week, no size required.", **N(tl=1, figs=[fig('heroi_deboche', 430)], obj=[dict(t='inscrever', x=1300, y=560)])),
 F("And if you're watching this right now, that button is right under the video. It's free, and it's how you get the next upgrade."),
 F("But in week three, something strange happens. To your other arm.", **N(tl=1, face=dict(p='rosto_choque', lado='d', w=760), big='YOUR OTHER ARM', bigy=1)),
], fonte='Weightlifting, 1988 Olympic Games · 60 kg class · clean & jerk 190 kg at 59.7 kg body weight')

# ---------------- WEEK 3 ----------------
B('semana3', falas=[
 F("Week three. You tweak your left wrist, so you only train your right arm.", **N(tl=2, figs=[fig('heroi_esforco', 520)], big='RIGHT ARM', sub='ONLY. left one RESTS.')),
 F("Two weeks later, you test the left one. The arm you never trained.", **N(tl=2, figs=[fig('heroi', 520)], big='LEFT ARM', sub='NEVER trained')),
 F("It's stronger.", p=0.3, **N(tl=2, face=dict(p='rosto_choque', lado='d', w=860, treme=1), imp=1)),
 F("This is real. It's called cross education. Train one side, and the other side gets stronger too.", **N(tl=2, obj=[dict(t='cerebro', lado=-1)])),
 F("When researchers pooled the controlled studies, the untrained side gained about eight percent on average.", **N(tl=2, num=dict(ate=7.8, suf='%', rot='average gain in the arm that did NOTHING'))),
 F("Moritani's 1979 study saw it too. In the arm nobody trained.", **N(tl=2, obj=[dict(t='cartao', tit='MORITANI & DE VRIES · 1979', l=['the untrained arm got stronger too'])])),
 F("Because the upgrade isn't living in your arm. It's living in your brain.", **N(tl=2, obj=[dict(t='cerebro')], zoom=1.12, foco=[960, 420])),
 F("Which brings us to the strangest experiment in this whole video.", **N(tl=2, figs=[fig('heroi_deboche', 960, 760)], zoom=1.2, foco=[960, 440])),
 F("In 2004, researchers at the Cleveland Clinic had people train only in their heads.",
   **N(tl=2, obj=[dict(t='cartao', tit='RANGANATHAN ET AL · 2004', l=['Cleveland Clinic · 12 weeks', '15 minutes a day · no movement at all'])])),
 F("No movement. Just imagining their hardest possible contraction, fifteen minutes a day.", **N(tl=2, face=dict(p='rosto_esforco', lado='d', w=780), big='IMAGINE', sub='your HARDEST rep. DON\'T move.')),
 F("After twelve weeks, the group that imagined a little finger exercise was thirty five percent stronger.", **N(tl=2, num=dict(ate=35, suf='%', rot='stronger · from thinking only'))),
 F("The group that actually trained it gained fifty three.", **N(tl=2, barras=dict(it=[['THOUGHT ONLY', 35, 'ambar'], ['REAL TRAINING', 53, 'verm']], un='%'))),
 F("The researchers also measured brain signals. The command going from the brain to the muscle got stronger, even though the muscle never moved.", **N(tl=2, obj=[dict(t='cerebro')], zoom=1.1, foco=[960, 420])),
 F("Thinking won't build you a body. But it proves the point. A huge part of your strength is software.", **N(tl=2, big='SOFTWARE', sub='a HUGE part of strength', c=1)),
 F("And by month one, your software is maxed out.", **N(tl=2, obj=[dict(t='cadeados', n=3, ab=1, rot=['NERVES', '?', '?'])])),
], fonte='Munn et al. 2004 · J Appl Physiol · meta-analysis  |  Ranganathan et al. 2004 · Neuropsychologia')

# ---------------- MONTH 1 ----------------
B('mes1', falas=[
 F("Month one. You start noticing it outside the gym.", **N(tl=3, obj=[dict(t='calend', x=960, rot=['WEEK 3', 'MONTH 1'])])),
 F("You jump for a high branch, and catch it.", **N(tl=3, figs=[fig('pendurado', 960, 640)], zoom=1.12, foco=[960, 480])),
 F("Every grocery bag. One trip.", **N(tl=3, figs=[fig('heroi_deboche', 520)], obj=[dict(t='sacolas', x=1080)])),
 F("The jar your dad gave up on? Open.", **N(tl=3, figs=[fig('pai_choque', 640, 820), fig('heroi_deboche', 1250, 780)])),
 F("Quick test for you while we're here. Make a fist as hard as you can for three seconds. Feel how your forearm tightens all the way to the elbow?", **N(tl=3, figs=[fig('heroi_esforco', 520)], big='3 SECONDS', sub='make a FIST. feel the FOREARM.')),
 F("That tightness running up your arm? Those are the tendons your fingers pull on. Keep that feeling in mind, because it's about to matter.", **N(tl=3, face=dict(p='rosto_esforco', lado='d', w=760), big='TENDONS', sub='you just FELT them', bigy=1)),
 F("Here's what's happening. Strength isn't only how hard a muscle pulls. It's how much of that pull reaches the bone.", **N(tl=3, obj=[dict(t='motor', estado='firme')])),
 F("Between muscle and bone there's a tendon. Think of it as a rope between an engine and a wheel."),
 F("A slack rope wastes the engine.", obj=[dict(t='motor', estado='frouxa')]),
 F("A stiff rope sends all of it straight to the wheel.", obj=[dict(t='motor', estado='firme')]),
 F("Heavy training makes tendons stiffer. But here's the catch.", **N(tl=3, face=dict(p='rosto_choque', lado='d', w=700), big='THE CATCH', bigy=1)),
 F("Muscles and tendons don't adapt on the same schedule. They respond to different kinds of load, at different speeds.",
   **N(tl=3, obj=[dict(t='cartao', tit='MERSMANN, BOHM & ARAMPATZIS · 2017', l=['muscle and tendon adapt on different timelines', 'a gap between them = more strain on the tendon'])])),
 F("And you just upgraded the engine overnight.", **N(tl=3, barras=dict(it=[['ENGINE', 2, 'verm'], ['ROPE', 1, 'cinza']], un='×'))),
 F("In real life, that gap opens slowly, and your body has time to close it. In our what if, it opened in a single night.", **N(tl=3, obj=[dict(t='calend', x=960, rot=['1 NIGHT', 'MONTHS'])])),
], fonte='Mersmann, Bohm & Arampatzis 2017 · Frontiers in Physiology · review')

# ---------------- MONTH 6 (a virada) ----------------
B('mes6', falas=[
 F("Month six. You're lifting weights that make the whole gym stop and stare.", **N(tl=4, figs=[fig('heroi_barra', 960, 640)], num=None, zoom=1.08)),
 F("Halfway up, you hear it.", p=1.1, **N(tl=4, figs=[fig('heroi_barra', 960, 640)], zoom=1.3, foco=[960, 470])),
 F("Not your muscle. Your tendon.", p=0.4, **N(tl=4, obj=[dict(t='motor', estado='rompe', motor='MUSCLE 2X', corda='TENDON 1X')], imp=1)),
 F("You doubled the engine. You never upgraded the rope.", **N(tl=4, barras=dict(it=[['ENGINE', 2, 'verm'], ['ROPE', 1, 'cinza']], un='×', nota='GAP'))),
 F("Researchers who study athletes describe exactly this. When muscle strength outgrows the tendon, the strain on the tendon goes up, and so does the risk of injury.",
   **N(tl=4, obj=[dict(t='cartao', tit='MUSCLE–TENDON IMBALANCE', l=['muscle outgrows tendon', 'more tendon strain → higher injury risk'])])),
 F("And it might be one reason your nervous system holds back in the first place.", **N(tl=4, obj=[dict(t='corda', on=0.4)])),
 F("A lot of scientists see that hidden strength as a safety margin. Your brain keeping force below what your body can handle.", **N(tl=4, obj=[dict(t='cerebro')])),
 F("You've heard the stories. Someone lifts a car off a person in an emergency. Most of those stories can't be verified, and some are clearly exaggerated.", **N(tl=4, big='CAR LIFT?', sub='most stories CAN\'T be verified', c=1)),
 F("But the idea behind them is real. Under the right pressure, the brain lets more of the rope pull. And it doesn't ask the tendon first.", **N(tl=4, obj=[dict(t='corda', on=1.0)])),
 F("So the real question was never, how do I get twice as strong?", **N(tl=4, big='2× STRONGER?', c=1)),
 F("It's, how do I get twice as strong, without breaking the rope?", **N(tl=4, big='WITHOUT', sub='breaking the ROPE', c=1)),
], fonte='Mersmann, Bohm & Arampatzis 2017 · Frontiers in Physiology')

# ---------------- YEAR 1: o que fazer de verdade ----------------
B('ano1', falas=[
 F("Year one. Here's how you'd actually do it. One lock at a time.", **N(tl=5, obj=[dict(t='cadeados', n=3, ab=0, rot=['NERVES', 'TENDONS', 'TIME'])])),
 F("Lock one, your nervous system. Lift heavy, in low reps, with clean form. That's what teaches every worker on the rope to show up.",
   **N(tl=5, obj=[dict(t='cadeados', n=3, ab=1, novo=1, rot=['NERVES', 'TENDONS', 'TIME'])])),
 F("A simple starting point: sets of three to five reps, with a weight you could still lift one or two more times. Heavy, but never ugly.", **N(tl=5, figs=[fig('heroi_barra', 520, 640)], big='3 TO 5 REPS', sub='with 1 or 2 left in the TANK')),
 F("Lock two, your tendons. Hold hard contractions for about three seconds at a time. That's the kind of load tendon researchers use to make tendons stiffer.",
   **N(tl=5, figs=[fig('pendurado', 520, 640)], big='HOLD 3 SEC', sub='HARD contractions · a few SETS')),
 F("One program used in tendon research does five sets of four holds, each one close to a maximal effort. You can start much easier than that and build up.", **N(tl=5, big='5 × 4 HOLDS', sub='in RESEARCH · start EASIER', c=1)),
 F("Lock three, time. Add weight slowly, so the rope always keeps up with the engine. Tendons change over months, not days.", **N(tl=5, obj=[dict(t='cadeados', n=3, ab=3, novo=1, rot=['NERVES', 'TENDONS', 'TIME'])])),
 F("Start light, progress slowly, and if something hurts, stop. This is education, not medical advice.", **N(tl=5, figs=[fig('heroi', 520)], big='GO SLOW', sub='this is EDUCATION, not medical advice', aviso=1)),
 F("You won't double overnight. But month after month, you'll get stronger, and you'll look almost exactly the same.",
   **N(tl=5, figs=[fig('heroi_deboche', 470)], obj=[dict(t='balanca', n='72.4 KG', x=1260, y=700, igual=1)])),
 F("That's the real superpower. Nobody sees it coming.", **N(tl=5, figs=[fig('heroi_deboche', 960, 760)], zoom=1.15, foco=[960, 460])),
 F("The bar bends. The scale doesn't move. And the big guy next to you finally asks, how?", **N(tl=5, figs=[HEROI_BARRA(), GRANDE()], zoom=1.06, foco=[900, 520])),
 F("Now you know.", p=0.4, **N(tl=5, face=dict(p='rosto_deboche', lado='d', w=820), big='NOW YOU KNOW', bigy=1)),
], fonte='Tendon loading: Mersmann, Bohm & Arampatzis 2017 (≈3 s high-strain contractions)')

# ---------------- fim: pergunta + próximo vídeo ----------------
B('final', falas=[
 F("Your turn. What's the heaviest thing you've ever lifted, and how much did you weigh at the time? Tell me in the comments.",
   **N(figs=[fig('heroi_deboche', 520)], big='YOUR TURN', sub='HEAVIEST lift + your WEIGHT')),
 F("And if you want to know who wins between a farmer and a gym guy, that's the next video.", p=4.5,
   **N(figs=[fig('fazendeiro', 640, 820), fig('academia', 1300, 860)], big=None)),
])

os.makedirs('public/snb/v06', exist_ok=True)
json.dump(R, open('public/snb/v06/roteiro.json', 'w'), indent=1, ensure_ascii=False)
print(len(R), 'blocos', sum(len(b['falas']) for b in R), 'falas', sum(len(f['txt'].split()) for b in R for f in b['falas']), 'palavras')

# Gera public/snb/v04/roteiro.json do Strong Not Big #04 (Old Man Strength): cada fala leva o texto, a pausa extra (p) e o que aparece na tela (v).
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
PAI = lambda x=X, **o: fig('pai', x, 800, **o)
B('gancho', et='OLD MAN STRENGTH · THE SCIENCE', falas=[
 F("He's fifty five. He has never had a gym membership.", **N(figs=[PAI()], big='55', sub='years old. ZERO gym memberships.')),
 F("His son is twenty five, and lifts four days a week.", **N(figs=[PAI(E), fig('heroi', D)], big='25', sub='and lifts 4 days a WEEK')),
 F("And when they shake hands, it's the son who winces.", **N(mao=1, big='THE SON', sub='is the one who WINCES')),
 F("Same story with the jar nobody can open. The bolt that won't move. The heavy end of the couch.", **N(figs=[PAI()], lista=dict(it=['the stuck JAR', 'the frozen BOLT', 'the heavy end of the COUCH'], auto=1, lado=1))),
 F("Somehow, the old guy always gets it.", lista=None, big='HE GETS IT', sub='somehow. every TIME.'),
 F("People call it old man strength. And science has a few things to say about it.", p=0.9, **N(figs=[PAI()], big='OLD MAN', sub='STRENGTH. is it real?')),
])
B('prova', fonte='Solberg et al. 2019 · Int J Sports Physiol Perform · world championships 1998 to 2017', falas=[
 F("Start with the strongest people on earth.", **N(figs=[fig('academia_barra', X, 640)], big='THE STRONGEST', sub='people on EARTH')),
 F("Researchers went through twenty years of world championship results, in two sports.", **N(big='20 YEARS', sub='of world championship RESULTS', c=1)),
 F("Olympic weightlifting, where the bar has to move fast. And powerlifting, where it just has to move.", **N(cart=G(['WEIGHTLIFTING', 'fast and explosive', ''], ['POWERLIFTING', 'slow and heavy', '']))),
 F("Then they asked one question. At what age do these athletes peak?", **N(big='WHAT AGE?', sub='do they PEAK', c=1)),
 F("For the fast sport, twenty six.", **N(cart=G(['WEIGHTLIFTING', 'fast and explosive', 'PEAK AT 26'], ['POWERLIFTING', 'slow and heavy', '']))),
 F("For the slow, heavy one? Thirty five.", p=0.8, cart=G(['WEIGHTLIFTING', 'fast and explosive', 'PEAK AT 26'], ['POWERLIFTING', 'slow and heavy', 'PEAK AT 35'])),
 F("Nine years later. And that's the average. Some of them peaked in their forties.", **N(big='+9 YEARS', sub='and some peaked in their FORTIES', c=1)),
 F("Raw, grinding strength is the last thing an athlete loses.", **N(figs=[PAI()], big='THE LAST', sub='thing to GO')),
 F("These are world class athletes, not dads. But the order things fade in is the same for everybody.", big='SAME ORDER', sub='for athletes and for DADS'),
])
PR = ['4 REASONS it is real', 'THE CATCH: it runs out', 'HOW to keep it, or build it']
B('promessa', falas=[
 F("So today: four reasons old man strength is real.", **N(lista=dict(it=PR, n=1))),
 F("The catch. Because it does run out.", lista=dict(it=PR, n=2)),
 F("And what to do about it, whether you're the son or the old man.", lista=dict(it=PR, n=3)),
])
B('tarefa', et='QUICK TEST · DO IT NOW', falas=[
 F("First, a quick test. And I want your age on this one.", **N(figs=[fig('farmer_carry')], big='QUICK TEST', sub='and I want your AGE')),
 F("Grab the two heaviest things in your house with handles. Stand tall. Hold them at your sides.", big=None, sub=None, lista=dict(it=['2 HEAVY things', 'with HANDLES', 'stand TALL', 'HOLD'], auto=1, lado=1)),
 F("Time it until your fingers open.", p=4.5, lista=None, anel=dict(seg=60), aviso=1, figs=[fig('farmer_carry', ambar=1)]),
 F("Comment your age, the weight, and your time.", anel=None, big='COMMENT', sub='AGE + weight + time'),
 F("Let's see who really wins. The twenties, or the fifties.", big='20s vs 50s', sub='who really WINS'),
 F("If your dad is nearby, hand him the same weights. Then stay for reason three. It explains what you're about to see.", **N(figs=[PAI(E), fig('heroi', D)], big='TEST DAD TOO', sub='then stay for REASON 3')),
])
B('regra1', et='REASON 1 · STRENGTH PEAKS LATE', falas=[
 F("Reason one. Strength peaks late, and fades slow.", **N(figs=[PAI()], big='LATE PEAK', sub='REASON 1 · and a slow FADE')),
 F("Look at those two sports again.", **N(cart=G(['WEIGHTLIFTING', 'peak at 26', ''], ['POWERLIFTING', 'peak at 35', '']))),
 F("The difference between them is speed.", **N(big='SPEED', sub='is the DIFFERENCE', c=1)),
 F("A snatch has to be explosive. A heavy deadlift can take five slow seconds, and still count.", **N(figs=[fig('academia_barra', X, 640)], big='5 SECONDS', sub='slow still COUNTS')),
 F("Speed is what leaves first. Ask any sprinter over thirty.", **N(big='SPEED GOES', sub='first. ask any SPRINTER.', c=1)),
 F("But the ability to squeeze, hold, and grind? That hangs around for decades.", **N(mao=1, big='THE GRIND', sub='stays for DECADES')),
 F("So your dad lost the hundred meter dash a long time ago.", **N(figs=[PAI(E), fig('heroi', D)], big='THE SPRINT', sub='he lost that long AGO')),
 F("The handshake, the stuck jar, the heavy end of the couch? He's still right in his window.", big='HIS WINDOW', sub='jars, couches and HANDSHAKES'),
 F("None of those need speed. All of them need a slow, stubborn squeeze.", **N(mao=1, big='STUBBORN', sub='a slow SQUEEZE. no speed needed.')),
 F("That is exactly the kind of strength that powerlifters keep into their forties.", **N(figs=[fig('academia_barra', X, 640)], big='INTO THEIR 40s', sub='the kind that LASTS')),
])
B('regra2', et='REASON 2 · THIRTY YEARS OF PRACTICE', fonte='Mattocks et al. 2017 · Med Sci Sports Exerc · 38 untrained adults · 8 weeks', falas=[
 F("Reason two. He's had thirty more years of practice than you.", **N(figs=[fig('pai_saco', anda=1)], big='30 YEARS', sub='REASON 2 · of PRACTICE')),
 F("We covered this study before, and it keeps being relevant.", **N(big='ONE STUDY', sub='that keeps coming BACK', c=1)),
 F("Thirty eight beginners. One group trained like bodybuilders. The other only practiced lifting a max.", **N(cart=G(['GROUP 1', '4 hard sets, to failure', ''], ['GROUP 2', 'just practiced the max', '']))),
 F("After eight weeks, group one had more muscle. But both were equally strong at the lift.", cart=G(['GROUP 1', '4 hard sets, to failure', 'MORE MUSCLE'], ['GROUP 2', 'just practiced the max', 'JUST AS STRONG'])),
 F("Strength is partly a skill. Your nervous system learns the job.", **N(mao=1, big='A SKILL', sub='your NERVES learn the job')),
 F("Now think about what a fifty five year old has practiced.", **N(figs=[PAI()], big='HIS PRACTICE', sub='think about IT')),
 F("Carrying kids. Moving furniture. Loosening bolts. Opening every jar in the house since nineteen ninety.", big=None, sub=None, lista=dict(it=['carrying KIDS', 'moving FURNITURE', 'loosening BOLTS', 'every JAR since 1990'], auto=1, lado=1, ok=1)),
 F("He's not stronger at everything. He's stronger at the things he's done ten thousand times.", lista=None, big='10,000 TIMES', sub='that is what he is STRONG at'),
 F("And practice teaches something else. Economy.", **N(figs=[fig('pai_saco')], big='ECONOMY', sub='practice teaches THAT too')),
 F("He doesn't lift the couch with his arms. He gets under it, locks his trunk, and stands up with his legs.", big=None, sub=None, lista=dict(it=['gets UNDER it', 'LOCKS his trunk', 'stands up with his LEGS'], auto=1, lado=1)),
 F("Half of old man strength is knowing where to stand.", lista=None, big='WHERE TO STAND', sub='is half of IT'),
 F("Put him under your squat bar, and you'd win. Hand him the stuck lug nut, and you lose.", **N(figs=[PAI(E), fig('heroi', D)], big='LUG NUT', sub='his game. not YOURS.')),
])
B('regra3', et='REASON 3 · HIS GENERATION USED ITS HANDS', fonte='Fain & Weatherford 2016 · J Hand Therapy · 237 adults   |   Josty et al. 1997 · J Hand Surg Br', falas=[
 F("Reason three. It might not be his age. It might be his era.", **N(mao=1, big='HIS ERA', sub='REASON 3 · maybe not his AGE')),
 F("In nineteen eighty five, researchers measured the grip of young American men.", **N(big='1985', sub='young American men, TESTED', c=1)),
 F("Men in their early twenties averaged a hundred and twenty one pounds with the right hand.", **N(num=dict(ate=121, suf=' LB', rot='1985 · men 20 to 24 · right hand'))),
 F("In twenty sixteen, another team tested the same age group.", **N(big='2016', sub='same age group, tested AGAIN', c=1)),
 F("A hundred and one pounds.", p=0.8, **N(barras=dict(un=' lb', it=[['YOUNG MEN, 1985', 121, 'cinza'], ['YOUNG MEN, 2016', 101, 'verm']]))),
 F("It was a small study. But think about who those nineteen eighty five guys are today.", barras=dict(un=' lb', it=[['YOUNG MEN, 1985', 121, 'cinza'], ['YOUNG MEN, 2016', 101, 'verm']], nota='−20 LB')),
 F("They're your dad.", p=0.8, **N(figs=[PAI()], big='YOUR DAD', sub='is one of those 1985 GUYS')),
 F("The authors pointed at one cause. Fewer people work with their hands.", **N(mao=1, big='FEWER HANDS', sub='at work. said the AUTHORS.')),
 F("And an older British study found the same pattern across jobs. Heavy manual workers had the strongest grip. Office workers, the weakest.", **N(rank=dict(tit='GRIP STRENGTH BY JOB', it=['HEAVY MANUAL', 'LIGHT MANUAL', 'OFFICE']))),
 F("So part of old man strength is just, a man who grew up before the keyboard.", **N(figs=[PAI()], big='PRE KEYBOARD', sub='he grew up BEFORE it')),
])
B('regra4', et='REASON 4 · HE NEVER STOPPED', fonte='Uonuma Cohort Study, Japan · 4,774 adults aged 40+   |   Akiyama et al. 2026 · J Rural Med · 126 adults', falas=[
 F("Reason four. The ones who still have it, never stopped using it.", **N(figs=[fig('pai_saco', anda=1)], big='NEVER STOPPED', sub='REASON 4')),
 F("In a Japanese study of almost five thousand adults over forty,", **N(num=dict(ate=4774, rot='adults over 40 · Japan'))),
 F("the people who did farm work had clearly lower odds of a weak grip.", **N(big='−37%', sub='odds of a WEAK grip · odds ratio 0.63', c=1)),
 F("A smaller study looked at how grip changes with age.", **N(num=dict(ate=126, rot='adults · Japan · a smaller study'))),
 F("In people who didn't farm, grip dropped as they got older. In the ones who farmed, it didn't.", **N(cart=G(['NO FARMING', 'as they got older', 'GRIP DROPPED'], ['FARMING', 'about 10 years older', 'NO DROP']))),
 F("That's the pattern behind every strong old man you know.", **N(figs=[PAI()], big='THE PATTERN', sub='behind every strong OLD man')),
 F("The mechanic. The carpenter. The grandfather who still splits his own wood.", big=None, sub=None, lista=dict(it=['the MECHANIC', 'the CARPENTER', 'the WOOD splitter'], auto=1, lado=1)),
 F("None of them train. All of them load their hands and their back, a little, almost every day.", lista=None, big='EVERY DAY', sub='a little load. hands and BACK.'),
 F("They didn't keep their strength because of their age. They kept it in spite of it.", lista=None, big='IN SPITE', sub='of their age. not because of IT.'),
])
B('naoe', et='WHAT IT IS NOT', falas=[
 F("So let's be precise about what old man strength is, and what it isn't.", **N(figs=[PAI(E), fig('heroi', D)], big='BE PRECISE', sub='what it IS and what it is NOT')),
 F("It is not speed. The twenty five year old is faster.", **N(lista=dict(it=['NOT speed', 'NOT endurance', 'NOT bigger muscles'], n=1, x=1))),
 F("It is not endurance. He'll gas out first.", lista=dict(it=['NOT speed', 'NOT endurance', 'NOT bigger muscles'], n=2, x=1)),
 F("And it is usually not bigger muscles.", lista=dict(it=['NOT speed', 'NOT endurance', 'NOT bigger muscles'], n=3, x=1)),
 F("It's grip. It's leverage. And it's a nervous system that has done this exact job for thirty years.", **N(lista=dict(it=['GRIP', 'LEVERAGE', '30 YEARS of the same job'], auto=1, ok=1))),
 F("That's why it shows up in short, slow, heavy moments. And almost nowhere else.", **N(mao=1, big='SHORT + HEAVY', sub='that is where it SHOWS up')),
])
B('virada', et='THE CATCH', fonte='Walker-Bone et al. 2016 · Occup Environ Med · 1,418 men, mean age 65.8', falas=[
 F("Now the catch. Old man strength runs out.", **N(figs=[PAI()], big='IT RUNS OUT', sub='THE CATCH')),
 F("British researchers measured the grip of fourteen hundred men at retirement age.", **N(num=dict(ate=1418, rot='men · retirement age · UK'))),
 F("Then they compared the ones who'd done decades of heavy physical work with the ones who hadn't.", **N(cart=G(['HEAVY WORK', 'for decades', ''], ['LIGHT WORK', 'for decades', '']))),
 F("By sixty five, the hard workers were no stronger.", p=0.8, cart=G(['HEAVY WORK', 'for decades', 'NO STRONGER'], ['LIGHT WORK', 'for decades', 'SAME GRIP'])),
 F("The researchers said other factors, like money and health, may have hidden a benefit.", **N(big='MAYBE', sub='money and health hid a BENEFIT', c=1)),
 F("But it fits what you see in real life. Work builds strength. It doesn't protect it forever.", **N(figs=[PAI()], big='NOT FOREVER', sub='work builds it. it does not PROTECT it.')),
 F("And there's a second problem. You only notice the old men who are strong.", **N(big='YOU NOTICE', sub='only the STRONG ones', c=1)),
 F("The ones with the wrecked backs and the bad shoulders aren't crushing anybody's hand.", **N(figs=[PAI()], big='THE OTHERS', sub="aren't crushing anybody's HAND")),
 F("So old man strength is real. It's just not a gift. It's a balance that's slowly being spent.", **N(big='BEING SPENT', sub='it is a balance, not a GIFT', c=1)),
 F("And if nothing refills it, one day the jar wins.", **N(figs=[PAI()], big='THE JAR WINS', sub='one day. if nothing REFILLS it.')),
])
B('boa', et='THE GOOD NEWS', fonte='Fiatarone et al. 1990 · JAMA · 10 frail volunteers aged about 90 · 8 weeks', falas=[
 F("Here's the good news. You can refill it. At almost any age.", **N(figs=[PAI()], big='REFILL IT', sub='at almost ANY age')),
 F("In nineteen ninety, researchers did something that sounded crazy at the time.", **N(big='1990', sub='it sounded CRAZY', c=1)),
 F("They took ten frail nursing home residents. Average age, ninety.", **N(num=dict(ate=90, rot='average age · 10 frail nursing home residents'))),
 F("And they put them on heavy leg training. Three times a week, for eight weeks.", **N(big='HEAVY', sub='leg training · 3× a week · 8 WEEKS', c=1)),
 F("Nine of them finished. Their leg strength went up by a hundred and seventy four percent.", p=0.9, **N(big='+174%', sub='leg strength, at NINETY', c=1)),
 F("Their thigh muscle grew by about nine percent. And they walked faster.", **N(lista=dict(it=['+174% STRENGTH', '+9% thigh MUSCLE', 'FASTER walking'], auto=1, ok=1))),
 F("The researchers concluded that heavy training works for frail people up to ninety six years old.", **N(big='UP TO 96', sub='years old. it still WORKED.', c=1)),
 F("One caution. It was ten people, with medical staff watching. It shows what's possible, not what's typical.", **N(big='10 PEOPLE', sub='it shows what is POSSIBLE', c=1)),
 F("Ninety years old. Eight weeks.", **N(figs=[PAI()], big='90 YEARS', sub='old. 8 WEEKS.')),
 F("If that's possible at ninety, there is no age where it's too late for you, or for your dad.", big='NEVER', sub='too late. for you or your DAD.'),
])
B('plano', et='WHAT TO DO', falas=[
 F("So here's what to do. Two versions.", **N(figs=[PAI(E), fig('heroi', D)], big='2 VERSIONS', sub='the son and the OLD man')),
 F("If you're the son. You have the gym. Now add what he has.", **N(figs=[fig('heroi')], big='THE SON', sub='add what HE has')),
 F("Carry heavy things. Hang from a bar. And lift heavy for a few reps, instead of light for many.", big=None, sub=None, lista=dict(it=['CARRY heavy things', 'HANG from a bar', 'HEAVY, for few reps'], auto=1, lado=1)),
 F("Stop using straps for everything. Let your hands be the limit for a while.", lista=None, big='NO STRAPS', sub='let your HANDS be the limit'),
 F("And once a week, move something awkward. A sandbag. A heavy box. Something with no handle.", **N(figs=[fig('bear_hug', anda=1)], big='AWKWARD', sub='once a week. NO handle.')),
 F("If you're the old man. You have the hands. Now add the plan.", **N(figs=[PAI()], big='THE OLD MAN', sub='add the PLAN')),
 F("Two short sessions a week. Legs, a push, a pull, and a carry. Start light. Add a little each week.", big=None, sub=None, lista=dict(it=['2 sessions a WEEK', 'LEGS · push · pull · carry', 'start LIGHT', 'add a LITTLE each week'], auto=1, lado=1)),
 F("Standing up from a chair with a weight. Pushing something. Pulling something. Carrying something.", lista=dict(it=['STAND UP with a weight', 'PUSH something', 'PULL something', 'CARRY something'], auto=1, lado=1)),
 F("It doesn't need to be fancy. It needs to be written down, and a little harder than last week.", lista=None, big='WRITE IT', sub='and make it a little HARDER'),
 F("That one rule, a little more each week, is exactly what a lifetime of work never gave him.", lista=None, big='A LITTLE MORE', sub='each week. work never gave him THAT.'),
 F("This is a general starting point, not a program from a study.", big='A START', sub='not a study PROGRAM', aviso=1),
])
B('cuidado', et='BE SAFE', falas=[
 F("And this matters more the older you are. Talk to your doctor before starting heavy training, especially with heart or joint problems.", **N(figs=[PAI()], big='DOCTOR FIRST', sub='especially heart or JOINTS', aviso=1)),
 F("This video is education, not medical advice.", big='NOT MEDICAL', sub='advice. EDUCATION.'),
])
RC = ['strength PEAKS late', 'decades of PRACTICE', 'a hands-on GENERATION', 'he never STOPPED']
B('final', falas=[
 F("So, back to the handshake.", **N(mao=1, big='THE HANDSHAKE', sub='back to IT')),
 F("Your dad isn't strong because he's old.", **N(figs=[PAI()], big='NOT AGE', sub="that's not WHY")),
 F("He's strong because strength peaks late. Because he's practiced for decades. Because his generation used its hands. And because he never stopped.", **N(lista=dict(it=RC, auto=1))),
 F("Three of those four, you can copy.", **N(figs=[fig('heroi')], big='3 OF 4', sub='you can COPY')),
 F("You can't choose the year you were born. But you can train heavy, use your hands, and keep going.", big='KEEP GOING', sub='heavy. hands. for YEARS.'),
 F("And if he's reading this over your shoulder: it's not too late to get even stronger.", **N(figs=[PAI()], big='NOT TOO LATE', sub='ask the 90 year OLDS')),
 F("Comment your age and your hold time. Let's settle it.", **N(figs=[fig('farmer_carry', ambar=1)], big='COMMENT', sub='your AGE + your TIME')),
 F("Next time: five gym habits that make you look stronger, without making you stronger.", p=4.5, **N(big='NEXT VIDEO', sub='5 gym habits that FOOL you', c=1)),
])
json.dump(R, open('public/snb/v04/roteiro.json', 'w'), indent=1, ensure_ascii=False)
print(len(R), 'blocos', sum(len(b['falas']) for b in R), 'falas', sum(len(f['txt'].split()) for b in R for f in b['falas']), 'palavras')

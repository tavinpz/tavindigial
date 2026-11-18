# Gera public/snb/v02/roteiro.json do Strong Not Big #02 (3 Strength Tests): cada fala leva o texto, a pausa extra (p) e o que aparece na tela (v).
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

HANG = lambda **o: fig('pendurado', X, 700, **o)
G = lambda a, b: dict(it=[a, b])
B('gancho', et='3 TESTS · AT HOME · NO EQUIPMENT', falas=[
 F("Three tests. No doctor. No lab. About five minutes on your living room floor.", **N(figs=[fig('heroi')], big='3 TESTS', sub='5 minutes. your LIVING ROOM.')),
 F("And in studies of tens of thousands of people, each one predicted who was still alive years later.", **N(big='STILL ALIVE', sub='years later. each test PREDICTED it.', c=1)),
 F("One of them beat blood pressure.", p=0.9, **N(rank=dict(tit='WHAT PREDICTED WHO DIED', it=['A STRENGTH TEST', 'BLOOD PRESSURE']))),
])
B('promessa', falas=[
 F("By the end of this video, you'll have three numbers.", **N(big='3 NUMBERS', sub='by the END of this video', c=1)),
 F("Your grip. Your push-ups. And your score getting off the floor.", **N(lista=dict(it=['YOUR GRIP', 'YOUR PUSH-UPS', 'YOUR FLOOR SCORE'], auto=1))),
 F("I'll show you what each study found, and exactly how to test yourself.", **N(figs=[fig('heroi')], big='THE STUDY', sub='then HOW to test yourself')),
 F("But first, one honest rule.", **N(big='ONE RULE', sub='before we start', c=1)),
 F("These tests predict. They do not decide.", **N(big='PREDICT', sub='they do NOT decide', c=1)),
 F("A low score is a warning light, not a verdict. And every one of these numbers can be trained.", **N(figs=[fig('heroi')], big='A WARNING', sub='light. not a VERDICT.')),
])
B('teste1', et='TEST 1 · GRIP', fonte='Leong et al. 2015 · The Lancet · 139,691 adults   |   Fain & Weatherford 2016 · J Hand Therapy · 237 adults', falas=[
 F("Test one. Your grip.", **N(mao=1, big='GRIP', sub='TEST 1')),
 F("Researchers followed almost a hundred and forty thousand adults, in seventeen countries, for four years.", **N(num=dict(ate=139691, rot='adults · 17 countries · 4 years'))),
 F("At the start, each person squeezed a handle as hard as they could.", **N(mao=1, big='SQUEEZE', sub='as HARD as you can')),
 F("That one number predicted who died better than their blood pressure did.", **N(rank=dict(tit='WHAT PREDICTED WHO DIED', it=['GRIP STRENGTH', 'BLOOD PRESSURE']))),
 F("For every eleven pounds of grip a person was missing, the risk of death was sixteen percent higher.", **N(big='+16%', sub='risk of death per 11 LB less grip', c=1)),
 F("Why would your hand know anything about your heart?", **N(mao=1, big='WHY?', sub='what does a HAND know')),
 F("It doesn't. Your grip is a window.", big='A WINDOW', sub='your grip is just that'),
 F("It shows how much muscle you still have, and how well your nerves still drive it.", **N(lista=dict(it=['how much MUSCLE you still have', 'how well your NERVES drive it'], auto=1))),
 F("And as a group, we're losing it.", **N(mao=1, big='LOSING IT', sub='as a group, we are')),
 F("In nineteen eighty five, the average American man in his early twenties squeezed a hundred and twenty one pounds.", **N(num=dict(ate=121, suf=' LB', rot='1985 · men 20 to 24 · right hand'))),
 F("When researchers tested young adults again in twenty sixteen, it was a hundred and one.", **N(barras=dict(un=' lb', it=[['1985', 121, 'cinza'], ['2016', 101, 'verm']], nota='−20 LB'))),
])
B('teste1b', et='TEST 1 · GRIP · HOW TO DO IT', falas=[
 F("The study used a hand dynamometer. You probably don't own one.", **N(mao=1, big='NO TOOL?', sub='the study used a DYNAMOMETER')),
 F("So here's the home version. The dead hang.", **N(figs=[HANG()], big='DEAD HANG', sub='the HOME version')),
 F("Grab a pull-up bar, or a sturdy door frame bar. Arms straight. Feet off the floor.", big=None, sub=None, lista=dict(it=['grab a pull-up BAR', 'arms STRAIGHT', 'feet OFF the floor'], auto=1, lado=1)),
 F("Start a timer, and hang until your hands open.", p=4.0, lista=None, anel=dict(seg=60, txt='arms STRAIGHT · hang · time it'), aviso=1),
 F("I have to be straight with you. No study gives a hang time that predicts anything.", anel=None, big='HONESTLY', sub='no study gives a hang time CUTOFF'),
 F("The research is on squeezing, not hanging.", big='SQUEEZING', sub='was studied. not HANGING.'),
 F("So use your time as your own baseline. The goal is simple. Beat it next month.", big='BASELINE', sub='beat it NEXT month'),
 F("Write your number down. That's number one.", **N(big='NUMBER 1', sub='write it DOWN', c=1)),
])
B('comentario', et='YOUR TURN', falas=[
 F("Quick pause.", **N(figs=[HANG()], big='PAUSE', sub='quick one')),
 F("Comment your age, and your hang time.", big='COMMENT', sub='your AGE + your HANG time'),
 F("I want to see if the sixty year olds can beat the twenty year olds.", big='60 vs 20', sub='who hangs LONGER'),
 F("Two more tests. And only one person in ten aces the last one.", **N(big='2 MORE', sub='1 in 10 aces the LAST one', c=1)),
 F("Stay for that one. It's the test that surprised me the most.", **N(icone='chao', big='STAY', sub='for the LAST one')),
])
B('teste2', et='TEST 2 · PUSH-UPS', fonte='Yang et al. 2019 · JAMA Network Open · 1,104 male firefighters · 10 years', falas=[
 F("Test two. Push-ups.", **N(icone='flexao', big='PUSH-UPS', sub='TEST 2')),
 F("Harvard researchers tested eleven hundred firefighters. Average age, thirty nine.", **N(num=dict(ate=1104, rot='firefighters · average age 39.6'))),
 F("Each man did as many push-ups as he could.", **N(icone='flexao', big='MAX REPS', sub='as many as he COULD')),
 F("Then they were followed for ten years.", big='10 YEARS', sub='of follow-up'),
 F("Thirty seven of them developed heart disease.", **N(num=dict(ate=37, rot='developed cardiovascular disease'))),
 F("And thirty six of those thirty seven were men who could not get past forty push-ups.", **N(big='36 OF 37', sub='could not get past 40 PUSH-UPS', c=1)),
 F("Now compare two groups. The men who could do fewer than ten. And the men who could do more than forty.", **N(cart=G(['UNDER 10', 'push-ups', ''], ['OVER 40', 'push-ups', '']))),
 F("The over forty group had ninety six percent lower risk.", p=0.8, cart=G(['UNDER 10', 'push-ups', ''], ['OVER 40', 'push-ups', '96% LOWER RISK'])),
 F("And push-ups predicted it better than a treadmill test.", **N(rank=dict(tit='WHAT PREDICTED HEART DISEASE BETTER', it=['PUSH-UP COUNT', 'TREADMILL TEST']))),
])
PU = ['hands under SHOULDERS', 'body in a straight LINE', 'chest close to the FLOOR', 'no RESTING']
B('teste2b', et='TEST 2 · PUSH-UPS · HOW TO DO IT', falas=[
 F("Now the fine print.", **N(icone='flexao', big='FINE PRINT', sub='read this part')),
 F("These were active men, with an average age of thirty nine. No women. No seventy year olds.", big=None, sub=None, lista=dict(it=['only MEN', 'an ACTIVE job', 'average age 39'], auto=1, lado=1, x=1)),
 F("The authors said it themselves. The result may not apply to everyone.", lista=None, big='MAY NOT', sub='apply to EVERYONE, said the authors'),
 F("So forty is not a magic number. It's a direction.", big='A DIRECTION', sub='40 is not a MAGIC number'),
 F("Here's the test. Hands under your shoulders. Body in a straight line.", big=None, sub=None, lista=dict(it=PU, n=2, lado=1)),
 F("Lower until your chest is a fist from the floor. Then push up.", lista=dict(it=PU, n=3, lado=1)),
 F("No resting at the top. No resting on the floor. Count until you can't do a clean one.", p=3.0, lista=dict(it=PU, n=4, lado=1), aviso=1),
 F("Three things don't count. Hips sagging. Half reps. And stopping to breathe.", lista=dict(it=['hips SAGGING', 'HALF reps', 'stopping to BREATHE'], auto=1, lado=1, x=1)),
 F("Be strict. A small honest number beats a big fake one, because you're going to test again.", lista=None, big='BE STRICT', sub='a small HONEST number wins'),
 F("Can't do one yet? Put your hands on a table or a counter, and count those. It's still a number you can beat.", lista=None, big='HANDS UP', sub='on a table still COUNTS'),
 F("That's number two.", **N(big='NUMBER 2', sub='write it DOWN', c=1)),
])
B('teste3', et='TEST 3 · THE FLOOR TEST', fonte='Araújo et al. 2025 · Eur J Prev Cardiol · 4,282 adults aged 46 to 75 · about 12 years', falas=[
 F("Test three. The floor test.", **N(icone='chao', big='THE FLOOR', sub='TEST 3')),
 F("It was created by a Brazilian doctor, Claudio Gil Araújo, in the nineteen nineties.", big='BRAZIL', sub='Dr. Claudio Gil ARAÚJO · 1990s'),
 F("It looks like nothing. Sit down on the floor. Then stand back up.", big='SIT DOWN', sub='then STAND back up'),
 F("The catch? Use as little support as you can.", big='THE CATCH', sub='as little SUPPORT as you can'),
 F("His team tested four thousand two hundred people, aged forty six to seventy five, and followed them for about twelve years.", **N(num=dict(ate=4282, rot='adults aged 46 to 75 · about 12 years'))),
 F("The score goes from zero to ten.", **N(big='0 TO 10', sub='the SCORE', c=1)),
 F("Among the people with a perfect ten, fewer than four in a hundred died.", **N(barras=dict(un='%', it=[['SCORE 10 · died', 3.7, 'verde']]))),
 F("Among the people who scored zero to four? Forty two in a hundred.", p=0.9, barras=dict(un='%', it=[['SCORE 10 · died', 3.7, 'verde'], ['SCORE 0 TO 4 · died', 42.1, 'verm']])),
 F("Even after adjusting for other risk factors, the low scorers had almost four times the risk.", **N(big='ALMOST 4X', sub='the risk, even after ADJUSTING', c=1)),
 F("And only one person in ten got a perfect score.", **N(big='1 IN 10', sub='got a PERFECT score', c=1)),
 F("The standing up half mattered most.", **N(icone='chao', big='STANDING UP', sub='was the half that mattered MOST')),
 F("A hundred and ninety two people scored zero on getting up. Nearly half of them died during the study.", **N(big='NEARLY HALF', sub='of the 192 who scored ZERO on rising', c=1)),
 F("One caution. Almost all the research on this test comes from one clinic in Rio de Janeiro.", **N(icone='chao', big='ONE CLINIC', sub='in Rio. most of the research is from THERE.')),
 F("It's a strong signal. It still needs to be repeated in other places.", big='STRONG', sub='signal. but it needs REPEATING.'),
])
SC = ['start with 10 POINTS', 'hand or knee DOWN: -1', 'hand on your LEG: -1', 'a WOBBLE: -0.5']
B('teste3b', et='TEST 3 · THE FLOOR TEST · HOW TO SCORE', falas=[
 F("Here's how to score yourself.", **N(icone='chao', big='SCORE IT', sub='here is HOW')),
 F("You start with ten points. Five for sitting down. Five for standing up.", big=None, sub=None, lista=dict(it=SC, n=1, lado=1)),
 F("Every time a hand, a knee, or a forearm touches the floor, you lose one point.", lista=dict(it=SC, n=2, lado=1)),
 F("Push a hand on your own leg? That's one point too.", lista=dict(it=SC, n=3, lado=1)),
 F("And if you wobble, you lose half a point.", lista=dict(it=SC, n=4, lado=1)),
 F("Crossing your legs is allowed. Most people do.", lista=None, big='ALLOWED', sub='crossing your LEGS'),
 F("One warning, straight from the doctor who made the test. Don't do it alone.", **N(big="NOT ALONE", sub='says the doctor who MADE the test', c=1, aviso=1)),
 F("Have someone next to you, in case you tip. And if you have a bad hip, knee, or back, skip this one.", **N(icone='chao', lista=dict(it=['someone NEXT to you', 'bad hip or knee? SKIP it'], auto=1, lado=1), aviso=1)),
 F("Barefoot. Clear floor. Go slow.", p=3.5, lista=dict(it=['BAREFOOT', 'CLEAR FLOOR', 'GO SLOW'], auto=1, lado=1)),
 F("That's number three.", **N(big='NUMBER 3', sub='write it DOWN', c=1)),
])
B('porque', et='WHY THESE THREE', falas=[
 F("So why do three simple tests know so much about you?", **N(figs=[fig('heroi')], big='WHY?', sub='do 3 simple tests KNOW so much')),
 F("Because none of them is really testing one thing.", big='NOT ONE', sub='thing. none of them.'),
 F("Grip is a sign of your total muscle, and your nervous system.", **N(mao=1, big='GRIP', sub='muscle + NERVOUS system')),
 F("Push-ups need strength, endurance, and a body you can actually lift.", **N(icone='flexao', big='PUSH-UPS', sub='strength + endurance + BODY weight')),
 F("And the floor test needs leg strength, flexibility, and balance, all at once.", **N(icone='chao', big='THE FLOOR', sub='legs + flexibility + BALANCE')),
 F("These are the things that quietly disappear when a body stops being used.", **N(big='QUIETLY', sub='gone, when a body stops being USED', c=1)),
 F("The tests don't cause anything. They just notice early.", **N(big='THEY NOTICE', sub='early. they do not CAUSE anything.', c=1)),
])
B('leitura', et='READ YOUR RESULTS', falas=[
 F("Now look at your three numbers. Which one was the worst?", **N(figs=[fig('heroi')], big='YOUR WORST', sub='number tells you WHERE to start')),
 F("If it was the hang, your hands are your weak link.", **N(figs=[HANG()], big='THE HANG?', sub='your HANDS are the weak link')),
 F("Carry heavy things. Hang more often. We covered the carries in the last video.", **N(figs=[fig('farmer_carry', anda=1, ambar=1)], big='CARRY', sub='heavy things, and HANG more often')),
 F("If it was the push-ups, don't grind out ugly reps on the floor.", **N(icone='flexao', big='PUSH-UPS?', sub='no UGLY reps on the floor')),
 F("Raise your hands on a bench or a counter, do clean sets, and lower the height over the weeks.", big='RAISE IT', sub='clean sets, then go LOWER each week'),
 F("And if it was the floor test, notice where you lost the points.", **N(icone='chao', big='THE FLOOR?', sub='notice WHERE you lost points')),
 F("Lost them going down? That's control. Practice sitting down slowly.", big=None, sub=None, lista=dict(it=['lost going DOWN: sit slowly', 'lost coming UP: train legs', 'WOBBLED: one-leg stands'], n=1, lado=1)),
 F("Lost them coming up? That's leg strength. Squats, and standing up from a low chair.", lista=dict(it=['lost going DOWN: sit slowly', 'lost coming UP: train legs', 'WOBBLED: one-leg stands'], n=2, lado=1)),
 F("Wobbled? That's balance. Stand on one leg while you brush your teeth.", lista=dict(it=['lost going DOWN: sit slowly', 'lost coming UP: train legs', 'WOBBLED: one-leg stands'], n=3, lado=1)),
])
B('limite', et='THE HONEST PART', falas=[
 F("And here's the part most videos skip.", **N(figs=[fig('heroi')], big='SKIPPED', sub='by most videos')),
 F("These studies did not prove that raising your score makes you live longer.", **N(big='NOT PROVEN', sub='that a better score adds YEARS', c=1)),
 F("All three watched people over time. None of them trained people to see if it changed the outcome.", **N(cart=G(['WATCHED', 'people over years', 'ALL 3 STUDIES'], ['TRAINED', 'people to change the outcome', 'NONE OF THE 3']))),
 F("Doctor Araújo said it himself. People ask if a low score means they'll be dead in five years. Of course not.", **N(big='OF COURSE NOT', sub='a low score is not a SENTENCE', c=1)),
 F("But the things these tests measure? Strength, muscle, balance. Those respond to training.", **N(figs=[fig('farmer_carry', ambar=1)], big='TRAINABLE', sub='strength, muscle and BALANCE')),
])
PL = ['HANG 3 times', 'PUSH-UPS 3 sets', 'FLOOR 5 times']
B('plano', et='THE 4 WEEK RETEST · 3 DAYS A WEEK', falas=[
 F("So here's what to do with your three numbers.", **N(figs=[fig('heroi')], big='NOW WHAT', sub='with your 3 NUMBERS')),
 F("Three days a week. Ten minutes.", big='3 DAYS', sub='a week · 10 MINUTES'),
 F("Hang from the bar three times. Stop a few seconds before your hands would slip.", **N(figs=[HANG()], lista=dict(it=PL, n=1, lado=1))),
 F("Do three sets of push-ups. Stop two reps before you'd fail.", **N(icone='flexao', lista=dict(it=PL, n=2, lado=1))),
 F("Then sit down on the floor and stand up, five times, using as much support as you need.", **N(icone='chao', lista=dict(it=PL, n=3, lado=1))),
 F("Each week, use a little less.", p=1.5),
 F("Week one, both hands. Week two, one hand. Week three, a hand on your knee. Week four, try it clean.", lista=dict(it=['WEEK 1: both hands', 'WEEK 2: one hand', 'WEEK 3: hand on a knee', 'WEEK 4: try it clean'], auto=1, lado=1)),
 F("Don't train to failure. You're practicing, not punishing yourself.", lista=None, big='PRACTICE', sub='not PUNISHMENT. stop before failure.'),
 F("Take a day off between sessions. Your hands and your tendons adapt slower than your muscles.", big='REST DAYS', sub='hands and TENDONS adapt slower'),
 F("And write every session down. Three numbers, three times a week. It takes ten seconds.", big='WRITE IT', sub='3 numbers · 3 times a WEEK'),
 F("This is a starting point I put together, not a protocol from a study. Go at your own pace.", **N(figs=[fig('heroi')], big='A START', sub='not a study PROTOCOL', aviso=1)),
 F("In four weeks, run all three tests again.", **N(big='4 WEEKS', sub='then test AGAIN', c=1)),
])
B('cuidado', et='BE SAFE', falas=[
 F("One more thing. This is education, not medical advice.", **N(figs=[fig('heroi')], big='NOT MEDICAL', sub='advice. this is EDUCATION.', aviso=1)),
 F("If you have a heart condition, joint problems, or you get dizzy, talk to a professional before you test.", big='TALK FIRST', sub='heart, joints or DIZZINESS'),
])
FN = ['GRIP: hang time', 'PUSH-UPS: clean reps', 'FLOOR: score out of 10']
B('final', falas=[
 F("So. Three numbers.", **N(big='3 NUMBERS', sub='that is all', c=1)),
 F("Your hang time. Your push-ups. Your floor score.", **N(lista=dict(it=FN, auto=1))),
 F("None of them needs a gym. None of them cares how big you are.", **N(figs=[fig('academia', E), fig('heroi', D)], big='NO GYM', sub='and size does NOT matter')),
 F("They only ask one question. Can your body still do what a body is for?", **N(big='ONE QUESTION', sub='can your body still do its JOB', c=1)),
 F("Hold your own weight. Push yourself off the ground. Get up off the floor.", **N(lista=dict(it=['HOLD your own weight', 'PUSH yourself off the ground', 'GET UP off the floor'], auto=1))),
 F("If the answer today is not really, good. Now you know. And you have four weeks.", **N(figs=[fig('heroi')], big='NOW YOU KNOW', sub='and you have 4 WEEKS')),
 F("Comment your three numbers. Then come back in four weeks and post the new ones.", **N(figs=[HANG()], big='COMMENT', sub='your 3 NUMBERS')),
 F("And if you want to know how some people get absurdly strong without ever touching a weight,", **N(big='NO WEIGHTS', sub='and absurdly STRONG', c=1)),
 F("that's the next video.", p=4.5, **N(big='NEXT VIDEO', sub='strong WITHOUT lifting weights', c=1)),
])
json.dump(R, open('public/snb/v02/roteiro.json', 'w'), indent=1, ensure_ascii=False)
print(len(R), 'blocos', sum(len(b['falas']) for b in R), 'falas', sum(len(f['txt'].split()) for b in R for f in b['falas']), 'palavras')

# Gera public/snb/v01/roteiro.json do Strong Not Big #01: cada fala leva o texto, a pausa extra (p) e o que aparece na tela (v).
# v herda da fala anterior do mesmo bloco; chave com None apaga. Ver src/snb/Video.tsx para o que cada chave desenha.
import json
def F(txt, p=0, **v): return {'txt': txt, 'p': p, 'v': v}
E, D = 430, 900          # x das duas figuras quando há dupla
X = 520                  # x da figura sozinha
def fig(p, x=X, a=800, **o): return dict(p=p, x=x, a=a, **o)
LIMPA = dict(big=None, sub=None, num=None, lista=None, cart=None, rank=None, barras=None, anel=None, brilho=None, figs=None, mao=None, aviso=None, bigy=None, c=None)
def N(**v): return {**LIMPA, **v}   # tela nova
R = []
def B(cena, falas, et=None, fonte=None): R.append({'cena': cena, 'et': et, 'fonte': fonte, 'falas': falas})

B('gancho', et='FARMER STRENGTH · REAL STUDIES · AT HOME', falas=[
 F("This guy trains five days a week.", **N(figs=[fig('academia')], big='5 DAYS', sub='a week in the gym')),
 F("This guy has never touched a barbell.", **N(figs=[fig('academia', E), fig('fazendeiro', D)], big='ZERO', sub='barbells. ever.')),
 F("Now hand them both a hundred pound sack, and tell them to walk.", **N(figs=[fig('academia_saco', E, anda=1), fig('fazendeiro_saco', D, anda=1)], big='100 LB', sub='now WALK')),
 F("You already know who puts it down first.", p=1.0, **N(figs=[fig('academia_largou', E, treme=1), fig('fazendeiro_saco', D, anda=1)], big='FIRST?', sub='you already know')),
])
B('prova', fonte='Josty et al. 1997 · J Hand Surg Br   |   Rostamzadeh et al. 2020 · Work · 1,740 men', falas=[
 F("People call it farmer strength. And it's not just a story.", **N(figs=[fig('fazendeiro')], big='FARMER STRENGTH', sub='not just a STORY')),
 F("In nineteen ninety seven, British hand surgeons tested the grip of three kinds of workers.", **N(mao=1, big='1997', sub='grip test · 3 kinds of workers')),
 F("Office workers. Light manual workers. Heavy manual workers.", **N(lista=dict(it=['OFFICE WORKERS', 'LIGHT MANUAL WORKERS', 'HEAVY MANUAL WORKERS'], auto=1))),
 F("The heavy workers had the strongest grip. The office workers had the weakest.", **N(rank=dict(tit='GRIP STRENGTH', it=['HEAVY MANUAL', 'LIGHT MANUAL', 'OFFICE']))),
 F("A later study of seventeen hundred and forty men found the same thing.", **N(num=dict(ate=1740, rot='men · manual vs office workers'))),
 F("Even light manual workers out-gripped office workers by about twelve percent.", **N(barras=dict(un=' kg', it=[['OFFICE', 47.3, 'cinza'], ['LIGHT MANUAL', 52.7, 'verm']], nota='+12%'))),
 F("And their forearms were measurably thicker.", **N(mao=1, big='THICKER', sub='forearms, measured')),
])
B('promessa', falas=[
 F("But here's what nobody tells you.", **N(figs=[fig('fazendeiro')], big='BUT', sub='nobody tells you this')),
 F("Farmers are not stronger at everything.", big='NOT', sub='stronger at EVERYTHING'),
 F("And one study found that a lifetime of hard labor made men no stronger at all.", **N(big='NO STRONGER', sub='after a lifetime of hard labor', c=1)),
 F("So today: four things farm work does that your gym routine doesn't.", **N(lista=dict(it=['4 THINGS the farm does right', '1 THING it gets wrong', 'A 10 MINUTE routine'], n=1))),
 F("The one thing it gets wrong.", lista=dict(it=['4 THINGS the farm does right', '1 THING it gets wrong', 'A 10 MINUTE routine'], n=2)),
 F("And a ten minute routine that steals the good part.", lista=dict(it=['4 THINGS the farm does right', '1 THING it gets wrong', 'A 10 MINUTE routine'], n=3)),
])
B('tarefa', et='QUICK TEST · DO IT NOW', falas=[
 F("First, a quick test.", **N(figs=[fig('heroi')], big='QUICK TEST', sub='do it right now')),
 F("Grab the two heaviest things in your house that have handles.", **N(figs=[fig('farmer_carry')], big='2 HEAVY', sub='things with HANDLES')),
 F("Water jugs. Loaded bags. Buckets.", big=None, sub=None, lista=dict(it=['WATER JUGS', 'LOADED BAGS', 'BUCKETS'], auto=1, lado=1)),
 F("Stand tall, hold them at your sides, and time it.", p=4.5, lista=None, anel=dict(seg=60), aviso=1, figs=[fig('farmer_carry', ambar=1)]),
 F("Comment your time, and the weight.", anel=None, big='COMMENT', sub='your TIME + the WEIGHT'),
 F("At the end, I'll show you how to make that number climb.", big='AT THE END', sub='how to make that number CLIMB'),
])
B('justo', falas=[
 F("Now, let's be fair to the gym guy.", **N(figs=[fig('academia')], big='BE FAIR', sub='to the gym guy')),
 F("Put them both on a bench press, and he wins. Easily.", **N(figs=[fig('academia_barra', X, 640)], big='HE WINS', sub='the bench press. EASILY.')),
 F("He has practiced that exact lift for years. The farmer never has.", big='YEARS', sub='of practicing that EXACT lift'),
 F("Same story for the squat, the curl, anything with a barbell.", big=None, sub=None, lista=dict(it=['BENCH PRESS', 'SQUAT', 'CURL', 'ANYTHING WITH A BARBELL'], auto=1, lado=1, ok=1)),
 F("And that is the first clue.", lista=None, big='CLUE #1', sub='he wins what he PRACTICED'),
 F("Because the farmer wins a different list.", **N(figs=[fig('fazendeiro')], big='HIS LIST', sub='is DIFFERENT')),
 F("Carrying. Holding. Lifting things with no handle. And doing it again, eight hours later.", big=None, sub=None, lista=dict(it=['CARRYING', 'HOLDING', 'NO HANDLE', 'AGAIN, 8 HOURS LATER'], auto=1, lado=1, ok=1)),
])
G = lambda a, b: dict(it=[a, b])
B('regra1', et='REASON 1 · STRENGTH IS A SKILL', fonte='Mattocks et al. 2017 · Med Sci Sports Exerc · 38 untrained adults · 8 weeks', falas=[
 F("Reason one. Strength is a skill.", **N(figs=[fig('heroi')], big='SKILL', sub='REASON 1 · strength is one')),
 F("In twenty seventeen, researchers split thirty eight beginners into two groups.", **N(num=dict(ate=38, rot='beginners · 2 groups · 8 weeks'))),
 F("Group one trained like bodybuilders. Four hard sets, to failure.", **N(cart=G(['GROUP 1', '4 hard sets, to failure', ''], ['GROUP 2', '', '']))),
 F("Group two did almost nothing. They just tried to lift their max, a few single reps per visit.", cart=G(['GROUP 1', '4 hard sets, to failure', ''], ['GROUP 2', 'just tested their max', ''])),
 F("After eight weeks, group one had built more muscle.", cart=G(['GROUP 1', '4 hard sets, to failure', 'MORE MUSCLE'], ['GROUP 2', 'just tested their max', ''])),
 F("But their max strength?", p=0.8, big='MAX STRENGTH?', bigy=1),
 F("No different.", big='NO DIFFERENCE', bigy=1),
 F("The group that only practiced the test got just as strong at it.", big=None, cart=G(['GROUP 1', '4 hard sets, to failure', 'MORE MUSCLE'], ['GROUP 2', 'just tested their max', 'JUST AS STRONG'])),
 F("Muscle helps. But strength is also your nervous system learning one specific job.", **N(figs=[fig('heroi')], big='ONE JOB', sub='your nervous system LEARNS it')),
 F("And the farmer has been practicing his job since he was a kid.", **N(figs=[fig('fazendeiro_saco', anda=1)], big='HIS JOB', sub='practiced since he was a KID')),
])
B('regra1b', et='REASON 1 · STRENGTH IS A SKILL', fonte='Schoenfeld et al. 2014 · J Strength Cond Res · 17 trained men · 8 weeks', falas=[
 F("It holds for experienced lifters too.", **N(figs=[fig('academia')], big='TRAINED', sub='lifters TOO')),
 F("Seventeen trained men. Same total work. Eight weeks.", **N(num=dict(ate=17, rot='trained men · same total work · 8 weeks'))),
 F("Half did sets of ten. Half did heavy sets of three.", **N(cart=G(['3 × 10', 'bodybuilder style', ''], ['7 × 3', 'heavy, powerlifter style', '']))),
 F("Both groups grew the same amount of muscle.", cart=G(['3 × 10', 'bodybuilder style', 'SAME MUSCLE'], ['7 × 3', 'heavy, powerlifter style', 'SAME MUSCLE'])),
 F("But the heavy group gained more on the bench press.", cart=G(['3 × 10', 'bodybuilder style', 'SAME MUSCLE'], ['7 × 3', 'heavy, powerlifter style', 'MORE BENCH PRESS'])),
 F("Same size. Different strength.", **N(big='SAME SIZE', sub='different STRENGTH', c=1)),
 F("Your body gets strong at exactly what you ask it to do.", **N(figs=[fig('heroi')], big='EXACTLY', sub='what you ASK it to do')),
 F("The gym guy asks for a bench press. The farmer asks for something else.", **N(figs=[fig('academia_barra', E, 600), fig('fazendeiro_saco', D + 60)], big='2 ASKS', sub='2 kinds of STRONG')),
])
B('regra2', et='REASON 2 · THE HANDS NEVER REST', falas=[
 F("Reason two. The hands never rest.", **N(mao=1, big='HANDS', sub='REASON 2 · they never rest')),
 F("A lifter grips a bar for a few seconds, then racks it.", **N(figs=[fig('academia_barra', X, 640)], big='SECONDS', sub='then he RACKS it')),
 F("And when the grip gets hard, he puts on straps.", big='STRAPS', sub='when the grip gets HARD'),
 F("A farmer's hands are loaded for hours.", **N(mao=1, big='HOURS', sub="a farmer's hands stay LOADED")),
 F("Buckets. Tools. Wire. Feed sacks. Gates.", **N(figs=[fig('fazendeiro')], lista=dict(it=['BUCKETS', 'TOOLS', 'WIRE', 'FEED SACKS', 'GATES'], auto=1, lado=1))),
 F("And your hands are the bottleneck.", **N(mao=1, big='BOTTLENECK', sub='your HANDS give out first')),
 F("You can only carry what you can hold.", **N(figs=[fig('farmer_carry', ambar=1)], big='CARRY', sub='only what you can HOLD')),
 F("Your legs and back can move far more than your fingers can hang on to.", big='FINGERS', sub='give up before legs and back'),
 F("So the farmer trains the one link that fails first. Every single day.", **N(figs=[fig('fazendeiro_saco', anda=1)], big='EVERY DAY', sub='the link that FAILS first')),
])
B('regra2b', et='REASON 2 · THE HANDS NEVER REST', fonte='Fain & Weatherford 2016 · J Hand Therapy · 237 adults · vs 1985 norms', falas=[
 F("Here's how much that matters.", **N(mao=1, big='HOW MUCH?', sub='does that matter')),
 F("In nineteen eighty five, the average man in his early twenties had a right hand grip of a hundred and twenty one pounds.", **N(num=dict(ate=121, suf=' LB', rot='1985 · men 20 to 24 · right hand grip'))),
 F("In twenty sixteen, researchers tested young adults again.", **N(big='2016', sub='tested AGAIN', c=1)),
 F("A hundred and one pounds.", p=0.8, **N(barras=dict(un=' lb', it=[['1985', 121, 'cinza'], ['2016', 101, 'verm']]))),
 F("Twenty pounds, gone in one generation.", barras=dict(un=' lb', it=[['1985', 121, 'cinza'], ['2016', 101, 'verm']], nota='−20 LB')),
 F("It was a small study, two hundred and thirty seven people.", **N(num=dict(ate=237, rot='people · a small study'))),
 F("But the authors pointed to one cause. We stopped working with our hands.", **N(mao=1, big='WE STOPPED', sub='working with our HANDS')),
])
B('regra3', et='REASON 3 · NOTHING HAS A HANDLE', fonte='McGill et al. 2009 · J Strength Cond Res · 3 strongman athletes', falas=[
 F("Reason three. Nothing on a farm has a handle in the right place.", **N(figs=[fig('fazendeiro_saco')], big='NO HANDLE', sub='REASON 3 · in the right place')),
 F("A barbell is balanced. It's built to be lifted.", **N(figs=[fig('academia_barra', X, 640)], big='BALANCED', sub='built to be LIFTED')),
 F("A calf, a hay bale, a sack of feed? They fight back.", **N(figs=[fig('fazendeiro_saco', treme=1)], big='FIGHT BACK', sub='calf · hay bale · feed sack')),
 F("A spine researcher named Stuart McGill wired up strongman athletes while they carried heavy things.", **N(figs=[fig('farmer_carry', anda=1)], big='WIRED UP', sub='strongmen, carrying HEAVY things')),
 F("It was a tiny study. Three men.", **N(num=dict(ate=3, rot='men · a tiny study'))),
 F("But the pattern was clear.", **N(big='CLEAR PATTERN', sub='even in 3 men', c=1)),
 F("When you walk with a load, the muscles all around your torso fire together, and lock the spine stiff.", **N(figs=[fig('suitcase_carry', anda=1)], brilho='tronco', big='LOCKED', sub='the whole torso fires TOGETHER')),
 F("That stiffness even helps the hips do a job they aren't strong enough to do alone.", brilho='quadril', big='HIPS', sub='get help from a STIFF torso'),
 F("That's the farmer's real core workout. And he does it every day.", **N(figs=[fig('fazendeiro_saco', anda=1)], brilho='tronco', big='CORE', sub='workout. EVERY day.')),
])
B('regra4', et='REASON 4 · HE NEVER STOPS', fonte='Uonuma Cohort Study, Japan · 4,774 adults aged 40+   |   Akiyama et al. 2026 · J Rural Med · 126 adults', falas=[
 F("Reason four. He never stops.", **N(figs=[fig('fazendeiro')], big='NEVER STOPS', sub='REASON 4')),
 F("The gym guy trains for one hour. Then he sits for ten.", **N(figs=[fig('academia', 380, 760)], barras=dict(un=' h', lado=1, it=[['TRAINING', 1, 'verm'], ['SITTING', 10, 'cinza']]))),
 F("The farmer lifts something light, or something heavy, all day long.", **N(figs=[fig('fazendeiro_saco', anda=1)], big='ALL DAY', sub='light or heavy, he keeps LIFTING')),
 F("And it adds up.", big='IT ADDS UP', sub=None),
 F("In a Japanese study of almost five thousand adults over forty,", **N(num=dict(ate=4774, rot='adults over 40 · Japan'))),
 F("the ones who did farm work had about a third lower odds of a weak grip.", **N(big='−37%', sub='odds of a WEAK grip · odds ratio 0.63', c=1)),
 F("Not athletes. Regular people, getting older, who just kept using their bodies.", **N(figs=[fig('fazendeiro')], big='REGULAR', sub='people who kept USING their bodies')),
 F("A smaller Japanese study saw the same pattern.", **N(num=dict(ate=126, rot='adults · Japan · a smaller study'))),
 F("In people who didn't farm, grip dropped with age.", **N(cart=G(['NO FARMING', 'as they got older', 'GRIP DROPPED'], ['FARMING', '', '']))),
 F("In the ones who farmed, it didn't. Even though they were about ten years older.", cart=G(['NO FARMING', 'as they got older', 'GRIP DROPPED'], ['FARMING', 'about 10 years older', 'NO DROP'])),
])
B('virada', et='THE CATCH', fonte='Walker-Bone et al. 2016 · Occup Environ Med · 1,418 men, mean age 65.8', falas=[
 F("So, should you quit the gym and buy a farm?", **N(figs=[fig('academia', E), fig('fazendeiro', D)], big='QUIT?', sub='the gym, and buy a FARM')),
 F("No. And here's the study I promised.", **N(big='NO', sub="here's the study I promised", c=1)),
 F("British researchers measured the grip of fourteen hundred men at retirement age.", **N(num=dict(ate=1418, rot='men · retirement age · UK'))),
 F("Then they looked at their whole working lives.", **N(big='WHOLE', sub='working LIVES', c=1)),
 F("Decades of heavy lifting. Decades on their feet.", **N(lista=dict(it=['DECADES of heavy lifting', 'DECADES on their feet'], auto=1))),
 F("The result?", p=0.8, **N(big='THE RESULT?', c=1)),
 F("No evidence that it made them stronger.", **N(big='NO EVIDENCE', sub='that it made them STRONGER', c=1)),
 F("The researchers said other factors, like money and health, may have hidden a benefit.", **N(big='MAYBE', sub='money and health hid a benefit', c=1)),
 F("But the lesson stands.", **N(big='THE LESSON', sub='still stands', c=1)),
 F("Hard work is not a training program.", **N(big='HARD WORK', sub='is NOT a training program', c=1)),
 F("The load never goes up on purpose. And nobody plans the recovery.", **N(lista=dict(it=['NO planned progression', 'NO planned recovery'], auto=1, x=1))),
 F("That's why a man can do heavy work for forty years, and still not end up stronger for it.", **N(figs=[fig('fazendeiro')], big='40 YEARS', sub='and still not STRONGER for it')),
])
B('juntar', et='THE FIX', fonte='Winwood et al. 2015 · J Strength Cond Res · 30 trained rugby players · 7 weeks', falas=[
 F("The farmer has the right movements. The gym has the right plan.", **N(cart=G(['THE FARM', 'the right movements', ''], ['THE GYM', 'the right plan', '']))),
 F("So put them together.", **N(big='TOGETHER', sub='farm MOVEMENTS + gym PLAN', c=1)),
 F("In twenty fifteen, thirty trained rugby players were split in two.", **N(num=dict(ate=30, rot='trained rugby players · 2 groups'))),
 F("Half lifted the normal way. Half trained like strongmen. Carries, logs, sleds.", **N(cart=G(['BARBELL', 'normal lifting', ''], ['STRONGMAN', 'carries · logs · sleds', '']))),
 F("Twice a week, for seven weeks.", cart=G(['BARBELL', '2× a week · 7 weeks', ''], ['STRONGMAN', '2× a week · 7 weeks', ''])),
 F("Both groups improved about the same.", cart=G(['BARBELL', '2× a week · 7 weeks', 'SIMILAR GAINS'], ['STRONGMAN', '2× a week · 7 weeks', 'SIMILAR GAINS'])),
 F("Carrying heavy things works as well as the barbell. You don't have to choose.", **N(figs=[fig('farmer_carry', anda=1)], big="DON'T CHOOSE", sub='CARRY and lift')),
])
B('rotina', et='THE FARMER FINISHER · 10 MIN · 2× A WEEK', falas=[
 F("Here's the farmer finisher. Ten minutes, twice a week, after your normal workout.", **N(figs=[fig('heroi')], big='10 MIN', sub='twice a week, AFTER your workout')),
 F("One. The farmer's carry.", **N(figs=[fig('farmer_carry', anda=1, ambar=1)], big='1', sub="FARMER'S CARRY")),
 F("A heavy weight in each hand. Stand tall. Walk.", big=None, sub=None, lista=dict(it=["1 · FARMER'S CARRY", 'a heavy weight in each hand', 'stand tall', 'walk'], auto=1, lado=1, tit=1)),
 F("Dumbbells, kettlebells, or the same jugs from your test.", p=2.0),
 F("Two. The suitcase carry.", **N(figs=[fig('suitcase_carry', anda=1)], big='2', sub='SUITCASE CARRY')),
 F("One weight, one side. Don't lean. Then switch hands.", big=None, sub=None, lista=dict(it=['2 · SUITCASE CARRY', 'one weight, one side', "don't lean", 'then switch hands'], auto=1, lado=1, tit=1)),
 F("Your trunk has to fight to keep you straight. That's the point.", p=2.0, brilho='tronco'),
 F("Three. The bear hug carry.", **N(figs=[fig('bear_hug', anda=1)], big='3', sub='BEAR HUG CARRY')),
 F("Hug a sandbag, or a loaded backpack, tight to your chest. And walk.", big=None, sub=None, lista=dict(it=['3 · BEAR HUG CARRY', 'sandbag or loaded backpack', 'tight to your chest', 'walk'], auto=1, lado=1, tit=1)),
 F("No handle. Just like the farm.", p=2.0),
 F("Three rounds of each.", **N(figs=[fig('heroi')], big='3 ROUNDS', sub='of EACH carry')),
 F("Walk about twenty steps out, and twenty back.", big='20 STEPS', sub='out, and 20 BACK'),
 F("Put the weight down while you could still hold it for a few more seconds.", big='STOP EARLY', sub='a few seconds BEFORE your grip opens'),
 F("Next week, go a little farther, or a little heavier.", big='NEXT WEEK', sub='a little FARTHER or HEAVIER'),
 F("That one rule is what the farm is missing.", **N(figs=[fig('fazendeiro')], big='ONE RULE', sub='the farm is missing: PROGRESS')),
])
B('cuidado', et='BE SAFE', falas=[
 F("Keep your normal workouts. This is an add on, not a replacement.", **N(figs=[fig('heroi')], big='ADD ON', sub='KEEP your normal workouts', aviso=1)),
 F("Start lighter than you think. Your hands will catch up fast. Your back needs longer.", big='START LIGHT', sub='hands adapt fast · your BACK needs longer'),
 F("And if you have a back or shoulder injury, check with a professional first.", big='INJURED?', sub='check with a PROFESSIONAL first'),
])
REC = ['He PRACTICES the exact job', 'He loads his HANDS for hours', 'He carries AWKWARD things', 'He does it ALL DAY', 'His one mistake: NO PLAN']
B('recap', et='RECAP', falas=[
 F("So. Four things the farmer does right.", **N(figs=[fig('fazendeiro', 380, 760)], lista=dict(it=REC, n=0, lado=1), big='4 THINGS', sub='he does RIGHT')),
 F("He practices the exact job.", big=None, sub=None, lista=dict(it=REC, n=1, lado=1)),
 F("He loads his hands for hours.", lista=dict(it=REC, n=2, lado=1)),
 F("He carries awkward things.", lista=dict(it=REC, n=3, lado=1)),
 F("And he does it all day.", lista=dict(it=REC, n=4, lado=1)),
 F("And the one thing he gets wrong? There's no plan.", lista=dict(it=REC, n=5, lado=1)),
 F("You can have both.", **N(figs=[fig('farmer_carry', anda=1, ambar=1)], big='BOTH', sub='the MOVEMENTS and the PLAN')),
])
B('final', fonte='Leong et al. 2015 · The Lancet · PURE study · 139,691 adults · 17 countries', falas=[
 F("So, back to the two guys and the sack.", **N(figs=[fig('academia_largou', E), fig('fazendeiro_saco', D, anda=1)], big='BACK', sub='to the two guys and the SACK')),
 F("The farmer doesn't win because he's bigger. He isn't.", big='NOT BIGGER', sub="that's not why he WINS"),
 F("He wins because he has practiced that exact job, with his hands, his trunk, and his whole day.", **N(figs=[fig('fazendeiro_saco', anda=1)], lista=dict(it=['HIS HANDS', 'HIS TRUNK', 'HIS WHOLE DAY'], auto=1, lado=1, ok=1))),
 F("And that kind of strength may matter more than you think.", **N(mao=1, big='IT MATTERS', sub='more than you THINK')),
 F("In a study of almost a hundred and forty thousand adults, grip strength predicted who died better than blood pressure did.", **N(rank=dict(tit='139,691 ADULTS · WHAT PREDICTED WHO DIED', it=['GRIP STRENGTH', 'BLOOD PRESSURE']))),
 F("Every eleven pounds of grip a person was missing came with a sixteen percent higher risk of death.", **N(big='+16%', sub='risk of death per 11 LB less grip', c=1)),
 F("That doesn't mean squeezing harder makes you live longer.", **N(big='NOT A CURE', sub="squeezing harder won't add years", c=1)),
 F("It means a strong grip is a sign of a body that still gets used.", **N(figs=[fig('heroi')], big='A SIGN', sub='of a body that still gets USED')),
 F("Which raises a question.", **N(big='?', c=1)),
 F("What other simple tests can tell you how you're aging?", **N(big='WHAT ELSE?', sub="simple tests of how you're AGING", c=1)),
 F("There are three. And you can do all of them at home.", **N(num=dict(ate=3, rot='tests · all at home'))),
 F("That's the next video.", **N(big='NEXT VIDEO', sub='3 STRENGTH TESTS you can do at home', c=1)),
 F("Now go repeat the test from the start, and comment your new time.", p=4.5, **N(figs=[fig('farmer_carry', ambar=1)], big='COMMENT', sub='your NEW time')),
])
json.dump(R, open('public/snb/v01/roteiro.json', 'w'), indent=1, ensure_ascii=False)
print(len(R), 'blocos', sum(len(b['falas']) for b in R), 'falas', sum(len(f['txt'].split()) for b in R for f in b['falas']), 'palavras')

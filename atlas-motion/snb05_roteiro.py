# Gera public/snb/v05/roteiro.json do Strong Not Big #05 (5 Gym Habits): cada fala leva o texto, a pausa extra (p) e o que aparece na tela (v).
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
AC = lambda x=X, **o: fig('academia', x, 800, **o)
BAR = lambda x=X, **o: fig('academia_barra', x, 640, **o)
B('gancho', et='5 HABITS · THE STUDIES · THE FIX', falas=[
 F("This guy has trained for three years. Five days a week. He looks the part.", **N(figs=[AC()], big='3 YEARS', sub='5 days a week. he LOOKS the part.')),
 F("And his numbers have barely moved since year one.", **N(figs=[BAR()], big='STUCK', sub='since year ONE')),
 F("He's not lazy. He works harder than almost anyone in the room.", **N(figs=[AC()], big='NOT LAZY', sub='he works HARDER than anyone')),
 F("The problem is five habits that feel like strength training, and aren't.", p=0.9, **N(big='5 HABITS', sub='that only FEEL like strength training', c=1)),
])
B('origem', falas=[
 F("Here's where these habits come from.", **N(figs=[AC()], big='WHERE FROM?', sub='do these habits COME')),
 F("Most gym advice was built by bodybuilders, for one goal. Bigger muscles.", **N(big='BODYBUILDING', sub='built most gym ADVICE', c=1)),
 F("And for that goal, a lot of it works.", big='IT WORKS', sub='for SIZE', c=1),
 F("But size and strength are two different targets. Related. Not the same.", **N(cart=G(['SIZE', 'how much muscle', ''], ['STRENGTH', 'how much you can move', '']))),
 F("You can train for years, hit one, and miss the other. That's what happened to our guy.", **N(figs=[AC()], big='MISSED ONE', sub='that is what HAPPENED to him')),
])
B('promessa', falas=[
 F("Every one of them has been tested in a study. I'll show you each one.", **N(figs=[AC()], big='TESTED', sub='every one, in a STUDY')),
 F("And here's your job. Keep count of how many you do.", **N(big='KEEP COUNT', sub='of how many YOU do', c=1)),
 F("At the end, comment your score out of five. Most people who lift are at three or more. That's my guess, not a statistic.", **N(big='OUT OF 5', sub='comment your SCORE at the end', c=1)),
 F("Then I'll give you a one week fix for each.", **N(figs=[fig('heroi')], big='THE FIX', sub='one week for EACH')),
 F("None of these fixes need more time in the gym. Most of them need less effort, pointed in a better direction.", big='LESS EFFORT', sub='pointed in a better DIRECTION'),
])
B('h1', et='HABIT 1 · ALWAYS 8 TO 12 REPS', fonte='Schoenfeld et al. 2014 · J Strength Cond Res · 17 trained men · 8 weeks', falas=[
 F("Habit one. You live in the eight to twelve rep range.", **N(figs=[BAR()], big='8 TO 12', sub='HABIT 1 · you LIVE there')),
 F("Three sets of ten. On everything. For years.", big='3 × 10', sub='on EVERYTHING. for years.'),
 F("It's what the poster on the wall says. It's what the machines are set up for. It's what everybody around you is doing.", big=None, sub=None, lista=dict(it=['the POSTER says so', 'the MACHINES expect it', 'EVERYBODY does it'], auto=1, lado=1)),
 F("It's not wrong. It builds muscle. But here's what it doesn't do.", lista=None, big='NOT WRONG', sub='but here is what it does NOT do'),
 F("Seventeen trained men were split into two groups. Same total work. Eight weeks.", **N(num=dict(ate=17, rot='trained men · same total work · 8 weeks'))),
 F("One group did three sets of ten. The other did seven sets of three, with a much heavier bar.", **N(cart=G(['3 × 10', 'moderate weight', ''], ['7 × 3', 'heavy weight', '']))),
 F("Both groups built the same amount of muscle.", cart=G(['3 × 10', 'moderate weight', 'SAME MUSCLE'], ['7 × 3', 'heavy weight', 'SAME MUSCLE'])),
 F("But the heavy group gained more strength on the bench press.", p=0.8, cart=G(['3 × 10', 'moderate weight', 'SAME MUSCLE'], ['7 × 3', 'heavy weight', 'MORE STRENGTH'])),
 F("Same size. Different strength. Because lifting heavy is its own skill.", **N(big='SAME SIZE', sub='different STRENGTH', c=1)),
 F("If you never touch a weight you can only lift three or four times, your body never learns to.", **N(figs=[BAR()], big='NEVER HEAVY', sub='so your body never LEARNS it')),
 F("Heavy doesn't mean a one rep max every week. It means sets of three to five, where the bar moves well and you could do one more.", big='3 TO 5 REPS', sub='and you could do ONE more'),
 F("That's enough to teach your nervous system what heavy feels like.", big='TEACH IT', sub='what HEAVY feels like'),
 F("If that's you, that's one.", **N(big='THAT IS 1', sub='if that is YOU', c=1)),
])
B('h2', et='HABIT 2 · RACING THE CLOCK', fonte='Schoenfeld et al. 2016 · J Strength Cond Res · 21 trained men · 8 weeks', falas=[
 F("Habit two. You rest for one minute, because it feels more intense.", **N(figs=[AC()], big='1 MINUTE', sub='HABIT 2 · because it FEELS intense')),
 F("Heart pounding. Shirt soaked. Huge pump. It has to be working, right?", big=None, sub=None, lista=dict(it=['heart POUNDING', 'shirt SOAKED', 'huge PUMP'], auto=1, lado=1)),
 F("Twenty one trained men. Same program. One difference.", **N(num=dict(ate=21, rot='trained men · same program · 8 weeks'))),
 F("Half rested one minute between sets. Half rested three.", **N(cart=G(['1 MINUTE', 'rest between sets', ''], ['3 MINUTES', 'rest between sets', '']))),
 F("After eight weeks, the three minute group had gained more strength.", cart=G(['1 MINUTE', 'rest between sets', ''], ['3 MINUTES', 'rest between sets', 'MORE STRENGTH'])),
 F("And here's the part that surprises people. More muscle, too.", p=0.8, **N(cart=G(['1 MINUTE', 'rest between sets', 'LESS OF BOTH'], ['3 MINUTES', 'rest between sets', 'MORE MUSCLE TOO']))),
 F("The reason is simple. When you rush, your next set is weaker. Fewer reps, with less weight.", **N(figs=[BAR()], big='WEAKER SETS', sub='fewer reps, less WEIGHT')),
 F("Being out of breath is not the same as getting stronger.", **N(big='OUT OF BREATH', sub='is not the same as STRONGER', c=1)),
 F("Short rests have a place. Conditioning. Small exercises at the end. Days when you have twenty minutes.", **N(figs=[AC()], lista=dict(it=['CONDITIONING', 'SMALL exercises', 'SHORT on time'], auto=1, lado=1, ok=1))),
 F("But on your main lift, the clock is not your friend. The bar is.", **N(figs=[BAR()], big='THE BAR', sub='is your friend. not the CLOCK.')),
 F("If you watch the clock instead of the bar, that's two.", **N(big='THAT IS 2', sub='if you watch the CLOCK', c=1)),
])
B('h3', et='HABIT 3 · EVERY SET TO FAILURE', fonte='Davies et al. 2016 · Sports Medicine · 8 studies   |   Grgic et al. 2021 · J Sport Health Sci', falas=[
 F("Habit three. Every set goes to failure.", **N(figs=[BAR(treme=1)], big='TO FAILURE', sub='HABIT 3 · every single SET')),
 F("If you didn't collapse, it didn't count. That's the rule in a lot of gyms.", big="DIDN'T COUNT", sub='unless you COLLAPSED'),
 F("It feels like the most honest way to train. Nothing left in the tank.", big='NOTHING LEFT', sub='it FEELS honest'),
 F("Researchers pooled eight studies that compared the two ways to train.", **N(num=dict(ate=8, rot='studies pooled · failure vs not to failure'))),
 F("Going to failure. And stopping a few reps short.", **N(cart=G(['TO FAILURE', 'every set', ''], ['A FEW REPS SHORT', 'every set', '']))),
 F("For strength, the results were about the same.", p=0.8, cart=G(['TO FAILURE', 'every set', 'SAME STRENGTH'], ['A FEW REPS SHORT', 'every set', 'SAME STRENGTH'])),
 F("The authors' conclusion: failure isn't needed for strength. And if you use it, use it sparingly.", **N(big='SPARINGLY', sub='said the AUTHORS', c=1)),
 F("So what does failure cost you? Your next set. And sometimes your next workout.", **N(figs=[AC()], big='THE COST', sub='your next SET. your next workout.')),
 F("Strength is practice. And you can't practice a clean heavy rep when you're wrecked.", **N(figs=[BAR()], big='PRACTICE', sub='needs you FRESH')),
 F("A later analysis of more studies landed in the same place. Failure is not required, for strength or for size.", **N(big='NOT REQUIRED', sub='a later analysis AGREED', c=1)),
 F("So keep failure for the last set of a small exercise. Curls. Raises. Not your squat.", **N(figs=[AC()], big='CURLS, SURE', sub='not your SQUAT')),
 F("If your last rep is always a fight for survival, that's three.", **N(big='THAT IS 3', sub='if every set is a FIGHT', c=1)),
])
B('h4', et='HABIT 4 · A NEW WORKOUT EVERY WEEK', fonte='Mattocks et al. 2017 · Med Sci Sports Exerc · 38 untrained adults · 8 weeks', falas=[
 F("Habit four. You change your exercises all the time.", **N(figs=[AC()], big='ALWAYS NEW', sub='HABIT 4 · exercises')),
 F("New routine from a new video, every couple of weeks. To keep the muscle guessing.", big='GUESSING', sub='keep the muscle. every 2 WEEKS.'),
 F("And yes, I know. You might have found this channel that way. Stay with me.", big='I KNOW', sub='stay with ME'),
 F("Here's the problem. Strength is specific.", **N(big='SPECIFIC', sub='strength is', c=1)),
 F("Thirty eight beginners. One group did hard sets, like a bodybuilder. The other group only practiced one thing: lifting a max.", **N(cart=G(['GROUP 1', '4 hard sets, to failure', ''], ['GROUP 2', 'just practiced the max', '']))),
 F("Group one built more muscle. But both got equally strong at that lift.", p=0.8, cart=G(['GROUP 1', '4 hard sets, to failure', 'MORE MUSCLE'], ['GROUP 2', 'just practiced the max', 'JUST AS STRONG'])),
 F("A big part of strength is your nervous system learning one movement.", **N(mao=1, big='LEARNING', sub='one MOVEMENT. your nerves do that.')),
 F("Change the movement every two weeks, and you restart the lesson every two weeks.", **N(figs=[AC()], big='RESTART', sub='the lesson, every 2 WEEKS')),
 F("Variety isn't bad. Change your small exercises as often as you like.", big='VARIETY', sub='is fine for the SMALL stuff'),
 F("But the two or three lifts you want to be strong at? Those need boredom. The good kind.", **N(figs=[BAR()], big='BOREDOM', sub='the GOOD kind')),
 F("Pick a few lifts. Keep them for months. Let the numbers climb.", big=None, sub=None, lista=dict(it=['pick a FEW lifts', 'keep them for MONTHS', 'let the numbers CLIMB'], auto=1, lado=1, ok=1)),
 F("If you can't name your squat from eight weeks ago, that's four.", **N(big='THAT IS 4', sub='if you cannot NAME your old numbers', c=1)),
])
B('h5', et='HABIT 5 · STRAPS AND MACHINES FOR EVERYTHING', fonte='Winwood et al. 2015 · 30 trained rugby players · 7 weeks   |   Fain & Weatherford 2016 · 237 adults', falas=[
 F("Habit five. You outsource the hard parts.", **N(mao=1, big='OUTSOURCED', sub='HABIT 5 · the HARD parts')),
 F("Straps, so your grip never limits you. Machines, so nothing has to be balanced.", big=None, sub=None, lista=dict(it=['STRAPS for your grip', 'MACHINES for balance', 'a PAD for everything'], auto=1, lado=1)),
 F("Both are useful tools. The habit is using them for everything.", lista=None, big='FOR EVERYTHING', sub='that is the HABIT'),
 F("Because your hands and your trunk are part of your strength. And they only grow when they're asked to work.", **N(figs=[fig('farmer_carry', ambar=1)], big='HANDS + TRUNK', sub='only grow when they WORK')),
 F("I'll be honest. The evidence here is thinner than for the other four.", **N(big='THINNER', sub='evidence than the other FOUR', c=1)),
 F("But here's what we have. Young men today squeeze about twenty pounds less than young men did in nineteen eighty five.", **N(barras=dict(un=' lb', it=[['YOUNG MEN, 1985', 121, 'cinza'], ['YOUNG MEN, 2016', 101, 'verm']], nota='−20 LB'))),
 F("And when thirty trained rugby players swapped barbell work for carries, logs, and sleds, for seven weeks,", **N(num=dict(ate=30, rot='trained rugby players · 7 weeks'))),
 F("they gained just as much as the barbell group.", p=0.8, **N(cart=G(['BARBELL', '2× a week · 7 weeks', 'SIMILAR GAINS'], ['CARRIES + LOGS', '2× a week · 7 weeks', 'SIMILAR GAINS']))),
 F("Awkward, unsupported work counts. And a pad never taught anybody to brace.", **N(figs=[fig('bear_hug', anda=1)], big='IT COUNTS', sub='awkward and UNSUPPORTED')),
 F("Use straps on your heaviest set if your grip would cut it short. Just don't put them on for the warm up.", **N(mao=1, big='HEAVIEST SET', sub='straps there. not in the WARM UP.')),
 F("If you can't remember your last set without straps, that's five.", **N(big='THAT IS 5', sub='if you LIVE in straps', c=1)),
])
H5 = ['always 8 TO 12', 'racing the CLOCK', 'every set to FAILURE', 'always NEW exercises', 'STRAPS and machines']
B('placar', et='YOUR SCORE', falas=[
 F("So. What's your score?", **N(lista=dict(it=H5, n=0), big='YOUR SCORE', sub='out of 5')),
 F("Always eight to twelve. Racing the clock. Every set to failure. Always new exercises. Straps and machines.", big=None, sub=None, lista=dict(it=H5, auto=1, x=1)),
 F("Comment your number. No judgment. I'd bet the guy from the start of this video is a five.", **N(figs=[AC()], big='COMMENT', sub='your NUMBER. he is a 5.')),
 F("And notice what all five have in common.", **N(big='IN COMMON', sub='all 5 share ONE thing', c=1)),
 F("They all feel hard. Pump, sweat, burn, variety, exhaustion.", **N(lista=dict(it=['PUMP', 'SWEAT', 'BURN', 'VARIETY', 'EXHAUSTION'], auto=1))),
 F("Your body doesn't get stronger from feeling tired. It gets stronger from lifting something heavy, well, again and again.", **N(figs=[BAR()], big='HEAVY + WELL', sub='again and AGAIN')),
 F("Tired is a side effect. It was never the goal.", **N(big='SIDE EFFECT', sub='tired was never the GOAL', c=1)),
 F("And the opposite is true too. A great strength session can feel almost too easy. Long rests. Few reps. You leave fresh.", **N(figs=[fig('heroi')], lista=dict(it=['LONG rests', 'FEW reps', 'you leave FRESH'], auto=1, lado=1, ok=1))),
 F("That feeling of, did I even work out? Get used to it. That's what practice feels like.", lista=None, big='TOO EASY?', sub='that is what PRACTICE feels like'),
])
FX = ['HEAVY first: 5 × 3', 'REST 3 minutes', 'STOP 1 or 2 early', 'SAME lifts, 8 weeks', 'ONE carry, no straps']
B('fix', et='THE ONE WEEK FIX', falas=[
 F("Here's the fix. You don't have to change your whole program.", **N(figs=[fig('heroi')], big='THE FIX', sub='keep your PROGRAM')),
 F("One. Pick one big lift per workout. Do it first, heavy. Five sets of three.", **N(figs=[BAR()], lista=dict(it=FX, n=1, lado=1))),
 F("Two. On that lift, rest three full minutes. Set a timer. It will feel lazy. Do it anyway.", lista=dict(it=FX, n=2, lado=1)),
 F("Three. Stop every set with one or two good reps left.", lista=dict(it=FX, n=3, lado=1)),
 F("Four. Keep the same main lifts for eight weeks, and write down every session.", lista=dict(it=FX, n=4, lado=1)),
 F("Five. Finish with one carry. Heavy weights, no straps, walk until your grip is nearly gone.", **N(figs=[fig('farmer_carry', anda=1, ambar=1)], lista=dict(it=FX, n=5, lado=1))),
 F("Then do the rest of your workout exactly the way you like it. Tens, pumps, machines, all of it.", **N(figs=[AC()], big='THEN', sub='train the way you LIKE')),
 F("You're not giving anything up. You're adding the one thing that was missing.", big='ADD', sub='the one thing that was MISSING'),
 F("Each week, add a little weight to that first lift. Five pounds is plenty. If the bar slows down a lot, hold the weight for another week.", **N(figs=[BAR()], big='+5 LB', sub='a week. or HOLD if it slows down.')),
 F("Small, boring, written down. That's how the number moves.", big='BORING', sub='and WRITTEN down'),
 F("And give it the full eight weeks before you judge it. Strength shows up slower than a pump, and it stays a lot longer.", **N(figs=[fig('heroi')], big='GIVE IT 8', sub='weeks. strength shows up SLOWER.')),
 F("This is a general starting point I put together, not a program from a study.", **N(figs=[fig('heroi')], big='A START', sub='not a study PROGRAM', aviso=1)),
])
B('cuidado', et='BE SAFE', falas=[
 F("Heavy doesn't mean reckless. Learn the lift with a light bar first, and add weight slowly.", **N(figs=[BAR()], big='NOT RECKLESS', sub='light bar first. add SLOWLY.', aviso=1)),
 F("Use a spotter or safety bars for heavy sets. And if you have an injury, check with a professional first.", big='SPOTTER', sub='or SAFETY bars'),
 F("This is education, not medical advice.", **N(figs=[fig('heroi')], big='NOT MEDICAL', sub='advice. EDUCATION.')),
])
B('final', falas=[
 F("So, back to the guy who's been stuck for two years.", **N(figs=[AC()], big='STUCK', sub='back to THAT guy')),
 F("He doesn't need more effort. He's already giving more than enough.", big='NOT EFFORT', sub='he has PLENTY'),
 F("He needs to aim it. Heavier. Calmer. Fresher. The same lifts. And his own hands on the weight.", **N(lista=dict(it=['HEAVIER', 'CALMER', 'FRESHER', 'the SAME lifts', 'his OWN hands'], auto=1, ok=1))),
 F("Eight weeks of that, and the numbers that haven't moved in years will move.", **N(figs=[BAR()], big='8 WEEKS', sub='and the numbers MOVE')),
 F("I can't promise how much. Nobody honest can. But the direction is not in doubt.", **N(big='NO PROMISES', sub='but the DIRECTION is clear', c=1)),
 F("Comment your score out of five. And which habit you're fixing first.", **N(figs=[fig('heroi')], big='COMMENT', sub='your SCORE + your first FIX')),
 F("And if you haven't done the three strength tests yet, that video is on the channel. Go get your numbers.", p=4.5, **N(big='3 TESTS', sub='go get your NUMBERS', c=1)),
])
json.dump(R, open('public/snb/v05/roteiro.json', 'w'), indent=1, ensure_ascii=False)
print(len(R), 'blocos', sum(len(b['falas']) for b in R), 'falas', sum(len(f['txt'].split()) for b in R for f in b['falas']), 'palavras')

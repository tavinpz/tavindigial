# Two Childhoods #02 a #05: roteiros com o que aparece na tela em cada fala. Uso: python3 tc_series.py  -> public/tc/v02..v05/roteiro.json
# Mesmo formato do tc01_roteiro.py, agora com `cfg` por vídeo (títulos das casas, contagem, resumo, estudos, trocas, próximo vídeo, capas).
# Estudos conferidos nos resumos originais (Europe PMC) em 18/11/2026; o que cada um diz está no campo `fontes` do cfg.
import json, os
def F(txt, dest=(), p=0, **v): return {'txt': txt, 'v': v, 'dest': list(dest), 'p': p}
def A(txt, dest=(), **v): return F(txt, dest, **{'foco': 'a', 'bb': None, **v})          # foco na Casa A
def B(txt, dest=(), **v): return F(txt, dest, **{'foco': 'b', 'ba': None, **v})          # foco na Casa B
def N(txt, dest=(), **v): return F(txt, dest, **{'foco': None, 'ba': None, 'bb': None, **v})  # as duas casas, sem balão
def bal(*t, q='p', d=(), pensa=0): return {'t': list(t), 'q': q, 'd': list(d), **({'pensa': 1} if pensa else {})}
def pen(*t, d=()): return bal(*t, q='k', d=d, pensa=1)
def diz(*t, d=()): return bal(*t, q='k', d=d)
NUM = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT']
def monta(blocos):
    k = 0
    for b in blocos:
        if b.get('cap'): b['cap'] = {'n': NUM[k], 'tit': b['cap']}; b['pre'] = 2.3; k += 1
    return blocos
def LIM(t, chip='THE LIMIT'): return {'ano': 'BUT', 'quem': 'The honest limit', 'onde': 'What these studies cannot do', 'n': '', 't': t, 'chip': chip, 'cor': 'ouro'}
SAM6 = {'humor': 'riso', 'olhar': [0.3, -0.3]}
V = {}

# =====================================================================================================================
# #02 — Raised by Fear vs Raised by Respect
# =====================================================================================================================
TL = {'tag': 'THE STUDY', 'titulo': ['Punitive Environment', "Fosters Children's", 'Dishonesty'], 'meta': ['Talwar & Lee · 2011', 'Child Development', '84 children, ages 3 and 4, two schools']}
LA = {'tag': 'THE STUDY', 'titulo': ['Patterns of Competence', 'and Adjustment', 'Among Adolescents'], 'meta': ['Lamborn, Mounts, Steinberg & Dornbusch · 1991', 'Child Development', 'About 4,100 teenagers, ages 14 to 18']}
GE = {'tag': 'THE STUDY', 'titulo': ['Spanking and', 'Child Outcomes'], 'meta': ['Gershoff & Grogan-Kaylor · 2016', 'Journal of Family Psychology', '160,927 children across five decades']}
SAID = bal('BECAUSE I', 'SAID SO!', d=['SAID', 'SO'])
WHY = bal("HERE'S WHY.", 'HELP ME CLEAN.', d=['WHY'])
V['02'] = {'cfg': {'id': 'tc002', 'titA': '“Because I said so.”', 'titB': '“Here\'s why.”', 'conta': 'TOLD THE TRUTH', 'idades': [5, 10, 16, 22, 30, 45, 60],
  'vida': [[5, '“Because I said so.”', '“Here\'s why.”'], [16, 'Doesn\'t call home.', 'Calls at midnight.'], [30, 'Says nothing.', 'Speaks up.'], [60, 'Polite visits.', 'A loud Sunday table.']],
  'honesto': ['Strict is not', 'the problem.'],
  'cards': [{'ano': '1991', 'quem': 'Lamborn et al.', 'onde': 'Child Development', 'n': 'about 4,100 teenagers', 't': ['Warm AND firm homes:', 'highest confidence,', 'school and behavior.'], 'x': ['Strict and cold: obedient,', 'but less sure of themselves.'], 'chip': 'SUPPORTS IT', 'cor': 'mar'},
            {'ano': '2016', 'quem': 'Gershoff & Grogan-Kaylor', 'onde': 'Journal of Family Psychology', 'n': '160,927 children', 't': ['13 of 17 outcomes', 'linked spanking to', 'more problems.', 'None showed a benefit.'], 'chip': 'SUPPORTS IT', 'cor': 'mar'},
            LIM(['They compare families.', 'Nobody can randomly', 'assign a childhood.', 'Kids differ too.'])],
  'trocas': [['“Because I said so.”', '“Here\'s why.”'], ['“What\'s wrong with you?”', '“What happened?”'], ['“Go to your room.”', '“Let\'s fix it together.”']],
  'yet': {'e': 'GIVE', 'd': 'REASONS.', 'tam': 170}, 'lista': {'tit': 'NEVER TOLD SAM', 'it': ['The lost job', 'The breakup', 'The hard year']},
  'prox': {'e1': 'ALWAYS', 'e2': 'RESCUED', 'd1': 'ALLOWED TO', 'd2': 'FAIL', 'tam2': 150},
  'fontes': ['https://europepmc.org/search?query=TITLE%3A%22Punitive%20environment%20fosters%20children%27s%20dishonesty%22', 'https://pubmed.ncbi.nlm.nih.gov/1756655/', 'https://pubmed.ncbi.nlm.nih.gov/27055181/'],
  'thumbs': {'a': {'tagE': 'AGE 5', 'tagD': 'AGE 60', 'falaE': ['BECAUSE I', 'SAID SO!'], 'pensaD': ['THEY NEVER', 'TELL ME.'], 'dest': ['SAID', 'SO', 'NEVER'], 'txE': 'RAISED BY FEAR', 'txD': 'LAST TO KNOW', 'pE': {'humor': 'choque', 'lagrima': 1, 'olhar': [0.4, -0.4]}, 'pD': {'velho': 1, 'humor': 'triste', 'lagrima': 1, 'olhar': [-0.2, 0.4]}},
             'b': {'palE': 'FEAR', 'palD': 'RESPECT', 'txE': 'OBEYS. HIDES.', 'txD': 'TELLS THE TRUTH', 'pE': {'humor': 'choque', 'lagrima': 1, 'olhar': [0.2, 0.3]}, 'pD': {'humor': 'riso', 'olhar': [-0.2, -0.2], 'incl': 3}},
             'c': {'perg': 'WHO TELLS THE TRUTH?', 'placar': ['0', '6'], 'rot': 'TIMES THEY TOLD THE TRUTH', 'txE': '“I SAID SO”', 'txD': '“HERE\'S WHY”', 'pE': {'velho': 1, 'humor': 'triste', 'lagrima': 1, 'olhar': [0.3, 0.5]}, 'pD': {'velho': 1, 'humor': 'riso', 'olhar': [-0.3, -0.2]}}}},
 'blocos': monta([
 {'id': 'gancho1', 'cena': 'duo', 'idade': 5, 'et': 'Same kid, two homes', 'gap': 0.1, 'falas': [
  F('Two kids break the same rule.', ['same', 'rule']),
  A('In one home, the answer is, "Because I said so."', ['said', 'so'], ba=SAID, fa={'triste': 1}),
  B('In the other, the answer is, "Here\'s why."', ['why'], bb=WHY),
  N('Same kid. Same broken rule. Two different homes.', ['homes'])]},
 {'id': 'gancho2', 'cena': 'duo', 'idade': 30, 'gap': 0.1, 'falas': [
  B('By thirty, one of them calls home every Sunday.', ['sunday'], bb=diz('HI, MOM!'), ca=0, cb=4),
  A('The other one calls on holidays. If at all.', ['holidays'], fa={'triste': 1})]},
 {'id': 'gancho3', 'cena': 'texto', 'falas': [
  F('This is the whole life, side by side.', ['whole', 'life'], big={'e': 'THE WHOLE LIFE,', 'd': 'SIDE BY SIDE', 'tam': 78}, linha=0),
  F('And along the way, three real studies. One of them followed four thousand teenagers.', ['three', 'studies'], linha=16, sub='THREE REAL STUDIES')]},

 {'id': 'c1', 'cena': 'duo', 'idade': 5, 'et': 'Age 5: The wall', 'cap': 'THE WALL', 'falas': [
  F('Meet Sam. Sam is five. And Sam just drew on the living room wall.', ['wall'], fa={'pula': 1}, fb={'pula': 1}),
  A('In the first home, the reaction is fast. And loud.', ['loud'], ba=bal('WHAT DID', 'YOU DO?!', d=['DO']), fa={'triste': 1}, fb=None),
  A('Sam asks why it\'s so bad. The answer never changes. "Because I said so."', ['said', 'so'], ba=SAID),
  A('Sam stops drawing on the wall. That part works.', ['works'], ba=None),
  B('In the second home, the rule is exactly the same. No drawing on walls.', ['same']),
  B('But it comes with a reason. "Walls are hard to clean. Paper is for drawing. Help me wipe this."', ['reason'], bb=WHY),
  B('Sam also stops drawing on the wall. That part works too.', ['too'], bb=None),
  N('So far, same result. Both kids follow the rule.', ['same', 'result']),
  N('But they learned two different things.', ['different']),
  A('One learned: don\'t get caught.', ['caught'], ba=pen("DON'T GET", 'CAUGHT.', d=['CAUGHT'])),
  B('The other learned: this is how the world works.', ['works'], bb=pen("THAT'S HOW", 'IT WORKS.')),
  N('One home is raising obedience. The other is raising understanding.', ['obedience', 'understanding'], big={'e': 'OBEY', 'd': 'UNDERSTAND', 'tam': 130})]},

 {'id': 'c2', 'cena': 'duo', 'idade': 10, 'et': 'Age 10: The bad grade', 'cap': 'THE BAD GRADE', 'falas': [
  F('Ten. Sam brings home a bad grade. A real one.', ['bad', 'grade'], oa=['nota:D'], ob=['nota:D'], ca=0, cb=0, fa={'triste': 1}, fb={'triste': 1}),
  A('In the first home, Sam does the math. A bad grade means yelling. So the grade goes to the bottom of the backpack.', ['backpack'], ba=pen('HIDE IT.', d=['HIDE']), oa=['nota:D', 'carimbo:HIDDEN']),
  B('In the second home, a bad grade means an uncomfortable talk. And then help. So Sam puts it on the table.', ['table'], bb=diz('I GOT A D.'), ob=['nota:D', 'carimbo2:SHOWN'], cb=1, fb=None),
  N('Now, this next part is not a story.', ['not', 'story'])]},
 {'id': 'c2b', 'cena': 'estudo', 'idade': 10, 'est': TL, 'falas': [
  F('In two thousand eleven, two researchers, Victoria Talwar and Kang Lee, visited two schools in West Africa.', ['two', 'schools'], dir={'k': 'nomes', 't': ['Victoria Talwar', 'Kang Lee'], 's': 'TWO SCHOOLS · WEST AFRICA · 2011'}),
  F('One school relied on harsh punishment. The other didn\'t.', ['harsh', 'punishment'], dir={'k': 'frases', 'n': 2, 'cab': ['Two schools.'], 'fr': [['School one:', 'harsh punishment', 'coral'], ['School two:', 'no harsh punishment', 'mar']]}),
  F('Eighty-four children, three and four years old, were each left alone with a toy and told not to peek.', ['not', 'peek'], dir={'k': 'num', 'n': 84, 'rot': 'CHILDREN · AGES 3 AND 4'}),
  F('Most of them peeked. In both schools. Kids are kids.', ['both', 'schools'], dir={'k': 'selo', 't': ['MOST PEEKED.', 'IN BOTH SCHOOLS.']}),
  F('Then the adult came back and asked one question. Did you peek?', ['did', 'you', 'peek'], dir={'k': 'selo', 't': ['“DID YOU', 'PEEK?”']}),
  F('In the punishing school, most of the kids who peeked lied about it. In the other school, far fewer did.', ['lied'], dir={'k': 'itens', 'cab': ['Who lied about peeking?'], 'n': 2, 'auto': 1, 'it': ['Punishing school: most of them', 'Other school: far fewer'], 'marca': '•'}),
  F('And here\'s the part that stays with you. The kids from the punishing school were better at it. They kept their story straight through the follow-up questions.', ['better'], rod='PUNISHMENT TRAINED BETTER LIARS.'),
  F('Harsh punishment didn\'t make them honest. It made them skilled.', ['skilled'], rod='NOT MORE HONEST. MORE SKILLED.')]},

 {'id': 'c3', 'cena': 'duo', 'idade': 16, 'et': 'Age 16: The ride home', 'cap': 'THE RIDE HOME', 'falas': [
  F('Sixteen. Back to the story.', ['story'], ca=0, cb=1),
  N('Both Sams go to a party they weren\'t supposed to go to. And at midnight, both rides home fall through.', ['midnight'], fa={'triste': 1}, fb={'triste': 1}),
  A('In the first home, calling a parent means a punishment that lasts a month. So Sam doesn\'t call. Sam gets in a car with a driver who\'s been drinking.', ["doesn't", 'call'], ba=pen("I CAN'T", 'CALL HOME.', d=["CAN'T"]), oa=["carimbo:DIDN'T CALL"]),
  A('Nothing happens. This time.', ['this', 'time'], ba=None),
  B('In the second home, there\'s a deal. Call me from anywhere, at any hour. We\'ll talk about it tomorrow.', ['deal'], bb=diz('CAN YOU', 'COME GET ME?'), fb=None),
  B('Sam calls. Gets picked up. And yes, gets grounded. Fairly.', ['calls'], bb=None, ob=['carimbo2:CALLED HOME'], cb=2),
  N('Notice something. The second home is not the easy home. It has rules. It has consequences.', ['rules'], big={'e': 'RULES', 'd': 'RULES + REASONS', 'tam': 88})]},
 {'id': 'c3b', 'cena': 'estudo', 'idade': 16, 'est': LA, 'falas': [
  F('Researchers have a name for it. Authoritative parenting. High warmth, and high standards.', ['warmth', 'standards'], dir={'k': 'selo', 't': ['HIGH WARMTH.', 'HIGH STANDARDS.']}),
  F('In nineteen ninety-one, a team that included Susie Lamborn and Laurence Steinberg studied about four thousand one hundred teenagers.', ['teenagers'], dir={'k': 'num', 'n': 4100, 'rot': 'TEENAGERS · AGES 14 TO 18'}),
  F('The teens from warm-but-firm homes scored highest on confidence, on school, and on staying out of trouble.', ['highest'], dir={'k': 'itens', 'cab': ['Warm AND firm homes: highest in'], 'n': 3, 'auto': 1, 'marca': '✓', 'it': ['Confidence', 'School', 'Staying out of trouble']}),
  F('And the teens from strict, cold homes? They did fine on obedience. They followed the rules.', ['obedience'], dir={'k': 'selo', 't': ['STRICT + COLD:', 'OBEDIENT.']}),
  F('But they paid for it somewhere else. They thought less of themselves.', ['less'], rod='OBEDIENT. BUT LESS SURE OF THEMSELVES.')]},
 {'id': 'cta1', 'cena': 'texto', 'falas': [
  F('Quick question before we keep going. Which sentence ran your house?', ['which', 'sentence'], big={'e': 'WHICH ONE', 'd': 'RAN YOUR HOUSE?', 'tam': 88}),
  F('Comment "because I said so" or "here\'s why". I read these, and I want to see which one wins.', ['comment'], chips=['“because I said so”', '“here\'s why”'], sub='COMMENT BELOW')]},

 {'id': 'c4', 'cena': 'duo', 'idade': 22, 'et': 'Age 22: The lost job', 'cap': 'THE LOST JOB', 'falas': [
  F('Twenty-two. Both Sams have moved out. And both of them lose a job in the same month.', ['lose', 'job'], ca=0, cb=2, oa=['email', 'carimbo:LAID OFF'], ob=['email', 'carimbo:LAID OFF'], fa={'triste': 1}, fb={'triste': 1}),
  A('The first Sam tells no one at home. What\'s the point? It would turn into a lecture.', ['no', 'one'], ba=pen("THEY'LL JUST", 'YELL.', d=['YELL'])),
  A('So Sam handles it alone. Borrows money from a friend. And says everything\'s fine on the phone.', ['alone'], ba=diz("EVERYTHING'S", 'FINE.', d=['FINE'])),
  B('The second Sam calls home that night. Not for money. Just to say it out loud.', ['calls', 'home'], bb=diz('I LOST', 'MY JOB.'), cb=3),
  B('And hears the sentence that home was built on. Okay. Here\'s what we can do.', ['okay'], bb=pen("OKAY. HERE'S", 'WHAT WE CAN DO.'), fb=None),
  N('Same bad news. One home hears it first. The other hears it last.', ['first', 'last'], big={'e': 'LAST TO KNOW', 'd': 'FIRST TO KNOW', 'tam': 84})]},

 {'id': 'c5', 'cena': 'duo', 'idade': 30, 'et': 'Age 30: The boss', 'cap': 'THE BOSS', 'falas': [
  F('Thirty. Both Sams have a boss who is wrong about something important.', ['wrong'], ca=0, cb=3, oa=['oferta'], ob=['oferta']),
  A('The first Sam learned long ago what happens when you question authority. So Sam says nothing. And quietly resents it.', ['nothing'], ba=pen('JUST DO WHAT', "YOU'RE TOLD.", d=['TOLD']), oa=['oferta', 'carimbo:SAID NOTHING'], fa={'triste': 1}),
  A('Or the opposite happens. Some kids raised on fear don\'t go quiet. They go to war with every boss they ever have.', ['war'], ba=diz('NOBODY TELLS', 'ME WHAT TO DO!', d=['NOBODY'])),
  B('The second Sam grew up in a house where you could disagree and still be loved. So Sam knocks on the door and says, I see it differently. Can I show you why?', ['disagree'], bb=diz('CAN I SHOW', 'YOU WHY?', d=['WHY']), ob=['oferta', 'carimbo2:SPOKE UP'], cb=4),
  B('It doesn\'t always work. But Sam isn\'t afraid of the conversation.', ['afraid'], bb=None),
  N('Look at the count at the top. Times they told the truth.', ['truth'], conta=1)]},
 {'id': 'c5b', 'cena': 'estudo', 'idade': 30, 'est': GE, 'falas': [
  F('Here\'s the biggest study of all. In twenty sixteen, Elizabeth Gershoff and Andrew Grogan-Kaylor pooled five decades of research on spanking.', ['biggest'], dir={'k': 'nomes', 't': ['Elizabeth Gershoff', 'Andrew Grogan-Kaylor'], 's': 'FIVE DECADES OF RESEARCH · 2016'}),
  F('More than a hundred and sixty thousand children.', ['children'], dir={'k': 'num', 'n': 160927, 'rot': 'CHILDREN'}),
  F('They looked at seventeen different outcomes. Thirteen pointed the same way. More spanking, more problems.', ['thirteen'], dir={'k': 'rows', 'cab': ['17 outcomes measured.'], 'n': 1, 'rows': [['LINKED SPANKING TO MORE PROBLEMS', 13, 17, '13/17', 'coral']]}),
  F('And none of the seventeen showed a benefit.', ['none'], rod='NONE OF THE 17 SHOWED A BENEFIT.')]},

 {'id': 'c6', 'cena': 'duo', 'idade': 45, 'et': 'Age 45: The same wall', 'cap': 'THE SAME WALL', 'falas': [
  F('Forty-five. Both Sams have a five-year-old. And one afternoon, there\'s crayon on the living room wall.', ['crayon'], ca=0, cb=5),
  A('The first Sam feels something rise up. Fast. And loud. And out comes a sentence Sam swore never to say.', ['swore'], ba=SAID),
  A('Not because Sam is a bad parent. Because under stress, we reach for the script we were handed.', ['script']),
  B('The second Sam is just as annoyed. Takes a breath. And reaches for a different script.', ['breath'], bb=WHY),
  N('Two walls. Two scripts. Both inherited.', ['inherited'], big={'e': 'TWO SCRIPTS.', 'd': 'BOTH INHERITED.', 'tam': 84})]},
 {'id': 'cta2', 'cena': 'texto', 'falas': [
  F('If one of these homes sounds like yours, send this to someone who grew up in it with you. A brother. A sister. They\'ll know.', ['send'], big={'e': 'SEND THIS', 'd': 'TO THEM', 'tam': 110}, sub="THEY'LL KNOW", icone='share')]},

 {'id': 'c7', 'cena': 'duo', 'idade': 60, 'et': 'Age 60: The Sunday table', 'cap': 'THE SUNDAY TABLE', 'falas': [
  B('Sixty. The second Sam\'s house is loud on Sundays. Grown kids, an argument about politics, somebody laughing in the kitchen.', ['loud'], bb=bal("YOU'RE WRONG, DAD.", 'PASS THE SALT.', d=['WRONG']), ca=0, cb=6),
  B('They disagree with Sam all the time. And they keep coming back.', ['coming', 'back']),
  A('The first Sam\'s kids are polite. They visit on holidays. They say everything\'s fine.', ['polite'], ba=bal("EVERYTHING'S", 'FINE.', d=['FINE']), oa=['lista']),
  A('Sam finally has the obedient children that house was built to produce.', ['obedient'], ba=None, fa={'triste': 1}),
  N('Fear buys obedience. Respect buys the truth.', ['obedience', 'truth'], big={'e': 'OBEDIENCE', 'd': 'THE TRUTH', 'tam': 110})]},

 {'id': 'vida', 'cena': 'vida', 'et': 'The whole life, side by side', 'falas': [
  F("Here's the whole life, side by side.", ['side'], n=0),
  F('Five. "Because I said so." "Here\'s why."', [], n=1),
  F('Sixteen. Doesn\'t call home. Calls at midnight.', [], n=2),
  F('Thirty. Says nothing. Speaks up.', [], n=3),
  F('Sixty. Polite visits. A loud Sunday table.', ['loud'], n=4)]},
 {'id': 'honesto', 'cena': 'honesto', 'et': 'The honest part', 'falas': [
  F('Now, the honest part. Because strict is not the problem.', ['strict'], n=0),
  F('The teens who did best in that study of four thousand had parents with firm rules. What they also had was warmth, and reasons.', ['warmth'], n=1),
  F('The kids from strict, cold homes weren\'t disasters. They were obedient. They just trusted themselves less.', ['less'], n=1, x=1),
  F('The spanking research is huge, and it points one way. But it compares families. It can\'t run the experiment.', ['compares'], n=2, x=1),
  F('Nobody can randomly assign a childhood. So scientists still argue about how much is the parenting, and how much is the kid, the stress, the money.', ['argue'], n=3, x=1),
  F('And Sam\'s life here is a story. One illustration, not a prophecy.', ['story'], rod='A STORY. NOT A PROPHECY.'),
  F('What the research keeps finding is simpler. Rules land better with a reason attached.', ['reason'], rod='RULES LAND BETTER WITH A REASON.')]},
 {'id': 'trocas', 'cena': 'trocas', 'et': "It's never too late", 'falas': [
  F('And the script can be rewritten. At five. Or at forty-five.', ['rewritten'], n=0, tit=1),
  F('Three swaps, for the next time a rule gets broken.', ['three', 'swaps'], n=0, tit=None),
  F('Instead of "because I said so," try "here\'s why."', ['why'], n=1),
  F('Instead of "what\'s wrong with you," try "what happened?"', ['happened'], n=2),
  F('And instead of "go to your room," try "let\'s fix it together."', ['together'], n=3),
  F('And if you were raised on fear, you can still give yourself the thing you didn\'t get. A reason.', ['reason'], n=3, yet=1)]},
 {'id': 'fim1', 'cena': 'duo', 'idade': 5, 'gap': 0.2, 'falas': [F('Same kid. Same broken rule. Two different homes.', ['homes'], ba=SAID, bb=WHY)]},
 {'id': 'fim2', 'cena': 'fim', 'falas': [
  F('Next time, same kid again, two new homes. One who was always rescued. And one who was allowed to fail.', ['rescued', 'fail'], n=1),
  F("Subscribe so you don't miss it. I'll see you in the next childhood.", ['subscribe'], n=2)]},
 ])}

# =====================================================================================================================
# #03 — Always Rescued vs Allowed to Fail
# =====================================================================================================================
PE = {'tag': 'THE STUDY', 'titulo': ['Childhood Self-Regulation', 'and Overcontrolling', 'Parenting'], 'meta': ['Perry, Dollar, Calkins, Keane & Shanahan · 2018', 'Developmental Psychology', '422 children, followed for 8 years']}
LET = bal('LET ME', 'DO IT.', d=['ME'])
TRY = bal('YOU TRY', 'FIRST.', d=['YOU'])
V['03'] = {'cfg': {'id': 'tc003', 'titA': '“Let me do it.”', 'titB': '“You try first.”', 'conta': 'SOLVED ALONE', 'idades': [6, 10, 12, 16, 22, 30, 45, 60],
  'vida': [[6, '“Let me do it.”', '“You try first.”'], [16, 'Parent fixes the grade.', 'Faces the teacher.'], [30, 'Calls in sick.', 'Shows up anyway.'], [60, 'Still fixing.', 'Gets the brag call.']],
  'honesto': ['Helping is not', 'the problem.'],
  'cards': [{'ano': '2018', 'quem': 'Perry et al.', 'onde': 'Developmental Psychology', 'n': '422 children, 8 years', 't': ['Take-over parenting', 'at age 2, then weaker', 'self-control at 5 and', 'more problems at 10.'], 'x': ['A link. Not a law.'], 'chip': 'SUPPORTS IT', 'cor': 'mar'},
            {'ano': '2012', 'quem': 'Fingerman et al.', 'onde': 'Journal of Marriage and Family', 'n': '592 grown children', 't': ['Grown kids who got', 'intense support', 'reported BETTER', 'adjustment.'], 'chip': 'COMPLICATES IT', 'cor': 'coral'},
            {'ano': 'SO', 'quem': 'The difference', 'onde': 'Support is not the same as rescue', 'n': '', 't': ['Support: “I\'m here', 'while you do it.”', 'Rescue: “Step aside,', 'I\'ll do it.”'], 'chip': 'THE DIFFERENCE', 'cor': 'ouro'}],
  'trocas': [['“Let me do it.”', '“You try first. I\'m here.”'], ['“I\'ll call them.”', '“What\'s your plan?”'], ['“It\'s okay, I fixed it.”', '“That was hard. You did it.”']],
  'yet': {'e': 'YOU', 'd': 'FIRST.', 'tam': 200}, 'lista': {'tit': 'STILL FIXING', 'it': ['His taxes', 'His landlord', 'His flat tire']},
  'prox': {'e1': 'PAID FOR', 'e2': 'EVERY A', 'd1': 'TRUSTED', 'd2': 'TO LEARN', 'tam2': 130},
  'fontes': ['https://pubmed.ncbi.nlm.nih.gov/29911880/', 'https://pubmed.ncbi.nlm.nih.gov/26336323/'],
  'thumbs': {'a': {'tagE': 'AGE 6', 'tagD': 'AGE 30', 'falaE': ['LET ME', 'DO IT!'], 'pensaD': ['SOMEONE', 'FIX THIS!'], 'dest': ['ME', 'FIX'], 'txE': 'ALWAYS RESCUED', 'txD': "CAN'T COPE", 'pE': SAM6, 'pD': {'humor': 'choque', 'lagrima': 1, 'olhar': [-0.2, 0.2]}},
             'b': {'palE': 'RESCUED', 'palD': 'FAILED', 'txE': 'HELPLESS AT 30', 'txD': 'UNSHAKABLE AT 30', 'pE': {'humor': 'choque', 'lagrima': 1, 'olhar': [0.2, 0.3]}, 'pD': {'humor': 'riso', 'olhar': [-0.2, -0.2], 'incl': 3}},
             'c': {'perg': 'WHO CAN HANDLE IT?', 'placar': ['0', '8'], 'rot': 'PROBLEMS SOLVED ALONE', 'txE': '“LET ME DO IT”', 'txD': '“YOU TRY FIRST”', 'pE': {'humor': 'triste', 'lagrima': 1, 'olhar': [0.3, 0.5]}, 'pD': {'humor': 'riso', 'olhar': [-0.3, -0.2]}}}},
 'blocos': monta([
 {'id': 'gancho1', 'cena': 'duo', 'idade': 6, 'et': 'Same kid, two homes', 'gap': 0.1, 'falas': [
  F('Two kids forget their homework on the kitchen table.', ['homework'], fa={'triste': 1}, fb={'triste': 1}),
  A('In one home, a parent drives it to school. Every single time.', ['every'], ba=bal("I'LL BRING", 'IT TO YOU!', d=['BRING']), fa=None),
  B('In the other, the parent says, "That\'s a tough one. What\'s your plan?"', ['plan'], bb=bal("WHAT'S", 'YOUR PLAN?', d=['PLAN'])),
  N('Same kid. Same forgotten homework.', ['same'], fb=None)]},
 {'id': 'gancho2', 'cena': 'duo', 'idade': 30, 'gap': 0.1, 'falas': [
  B('By thirty, one of them can handle a terrible day.', ['handle'], ca=0, cb=7, bb=pen("I'VE GOT", 'THIS.')),
  A('The other one is still waiting for someone to come and fix it.', ['waiting'], ba=pen('SOMEONE', 'FIX THIS.', d=['SOMEONE']), fa={'triste': 1})]},
 {'id': 'gancho3', 'cena': 'texto', 'falas': [
  F('This is the whole life, side by side.', ['whole', 'life'], big={'e': 'THE WHOLE LIFE,', 'd': 'SIDE BY SIDE', 'tam': 78}, linha=0),
  F('Including one study that watched four hundred kids for eight years, starting when they were two.', ['eight', 'years'], linha=10, sub='ONE STUDY · 422 KIDS · 8 YEARS')]},

 {'id': 'c1', 'cena': 'duo', 'idade': 6, 'et': 'Age 6: The shoelace', 'cap': 'THE SHOELACE', 'falas': [
  F('Meet Sam. Sam is six, can\'t tie a shoe yet, and is late for school.', ['late'], fa={'triste': 1}, fb={'triste': 1}),
  A('In the first home, a parent kneels down and ties it. Fast. Kind. Done.', ['ties'], ba=LET, fa=None),
  A('And Sam is on time.', ['on', 'time'], fa={'pula': 1}),
  B('In the second home, the parent waits. "You try first."', ['waits'], bb=TRY),
  B('It takes three minutes. The knot is ugly. Sam is late.', ['late'], fb=None),
  N('Be honest. The first home is faster. In that moment, it even looks kinder.', ['kinder']),
  N('Rescuing isn\'t neglect. It\'s love, moving a little too fast.', ['love']),
  N('At six, it looks like nothing. A shoelace. A zipper. A forgotten lunch.', ['nothing']),
  N('But childhood is mostly small problems. Thousands of them. And each one is a practice round for the big ones.', ['practice']),
  A('But Sam is learning something in each home. In the first: when it gets hard, someone comes.', ['someone', 'comes'], ba=pen('SOMEONE', 'COMES.', d=['SOMEONE'])),
  B('In the second: when it gets hard, I try.', ['try'], bb=pen('I TRY.', d=['TRY'])),
  N('One of those works great. Until the day nobody comes.', ['nobody'], big={'e': 'SOMEONE COMES', 'd': 'I TRY', 'tam': 96})]},

 {'id': 'c2', 'cena': 'estudo', 'idade': 10, 'et': 'Age 10: The experiment', 'cap': 'THE EXPERIMENT', 'est': PE, 'falas': [
  F('Ten. And this next part is not a story.', ['not', 'story'], dir={'k': 'selo', 't': ['NOT A STORY.', 'A REAL STUDY.']}),
  F('In a study published in twenty eighteen, researchers followed four hundred and twenty-two children for eight years.', ['eight', 'years'], dir={'k': 'num', 'n': 422, 'rot': 'CHILDREN · FOLLOWED FOR 8 YEARS'}),
  F('It started when the kids were two. Each toddler played with a parent in a lab, while researchers watched one thing.', ['two'], dir={'k': 'selo', 't': ["WHO'S IN", 'CHARGE?']}),
  F('How much did the parent take over? Choosing the toy. Showing how to play. Stepping in before the child could even struggle.', ['take', 'over'], dir={'k': 'itens', 'cab': ['Taking over looks like:'], 'n': 3, 'auto': 1, 'marca': '•', 'it': ['Choosing the toy', 'Showing how to play', 'Stepping in before the struggle']}),
  F('They called it overcontrolling parenting.', ['overcontrolling'], dir={'k': 'selo', 't': ['OVERCONTROLLING', 'PARENTING.']}),
  F('Then they checked on the same kids at five. The children of the take-over parents were worse at two things. Managing their emotions. And controlling their impulses.', ['emotions', 'impulses'], dir={'k': 'itens', 'cab': ['At age 5: worse at'], 'n': 2, 'auto': 1, 'it': ['Managing emotions', 'Controlling impulses']}),
  F('And at ten? Those kids reported more emotional problems and more trouble at school. Their teachers saw weaker social skills.', ['ten'], dir={'k': 'itens', 'cab': ['At age 10:'], 'n': 3, 'auto': 1, 'it': ['More emotional problems', 'More trouble at school', 'Weaker social skills']}),
  F('These parents weren\'t cold. They were trying to help.', ['help'], rod='THEY WERE TRYING TO HELP.'),
  F('But a child who never gets to struggle never gets to practice calming down.', ['practice'], rod='NO STRUGGLE. NO PRACTICE.')]},

 {'id': 'c25', 'cena': 'duo', 'idade': 12, 'et': 'Age 12: The science fair', 'cap': 'THE SCIENCE FAIR', 'falas': [
  F('Twelve. The science fair. Back to the story.', ['science', 'fair'], ca=0, cb=1),
  A('In the first home, the volcano is magnificent. A parent stayed up until two in the morning building it. It wins a ribbon.', ['magnificent'], ba=bal('I FINISHED IT', 'FOR YOU.', d=['I']), oa=['nota:1st']),
  A('Sam stands next to it. And can\'t explain how it works.', ["can't", 'explain'], ba=pen('HOW DOES IT', 'WORK?', d=['HOW']), fa={'triste': 1}),
  B('In the second home, the volcano leaks. The label is crooked. It wins nothing.', ['leaks'], ob=['nota:—']),
  B('But when a judge asks a question, Sam talks for five minutes.', ['five', 'minutes'], bb=diz('SO, THE VINEGAR', 'REACTS WITH...', d=['VINEGAR']), ob=['nota:—', 'carimbo2:BUILT IT ALONE'], cb=2),
  N('One kid has a ribbon. The other one has a volcano.', ['ribbon', 'volcano'], big={'e': 'A RIBBON', 'd': 'A VOLCANO', 'tam': 120})]},

 {'id': 'c3', 'cena': 'duo', 'idade': 16, 'et': 'Age 16: The failed test', 'cap': 'THE FAILED TEST', 'falas': [
  F('Sixteen. Back to the story. Both Sams fail a chemistry test.', ['fail'], ca=0, cb=2, oa=['nota:F'], ob=['nota:F'], fa={'triste': 1}, fb={'triste': 1}),
  A('In the first home, a parent emails the teacher that night. Argues the grade. Gets it changed.', ['emails'], ba=bal("I'LL TALK TO", 'YOUR TEACHER.', d=["I'LL"]), oa=['nota:C', 'carimbo:FIXED FOR SAM'], fa=None),
  A('Sam learns chemistry isn\'t the lesson. The lesson is: problems are for parents.', ['parents'], ba=pen('MOM WILL', 'HANDLE IT.', d=['MOM'])),
  B('In the second home, the answer is the old one. "What\'s your plan?"', ['plan'], bb=bal("WHAT'S", 'YOUR PLAN?', d=['PLAN'])),
  B('So Sam walks into the teacher\'s room alone. Terrified. Asks for a retake. Studies. Gets a C plus.', ['alone'], bb=None, ob=['nota:C+', 'carimbo2:DID IT ALONE'], cb=3, fb=None),
  N('Almost the same grade in the end. A completely different lesson.', ['lesson'], big={'e': 'FIXED FOR ME', 'd': 'FIXED BY ME', 'tam': 92})]},
 {'id': 'cta1', 'cena': 'texto', 'falas': [
  F('Quick question before we keep going. Which kid were you?', ['which', 'kid'], big={'e': 'WHICH ONE', 'd': 'WERE YOU?', 'tam': 96}),
  F('Comment "rescued" or "figured it out". I read these, and I want to know which home you grew up in.', ['comment'], chips=['“rescued”', '“figured it out”'], sub='COMMENT BELOW')]},

 {'id': 'c4', 'cena': 'duo', 'idade': 22, 'et': 'Age 22: The first apartment', 'cap': 'THE FIRST APARTMENT', 'falas': [
  F('Twenty-two. First apartment. And both landlords refuse to return the deposit.', ['deposit'], ca=0, cb=4, oa=['email'], ob=['email'], fa={'triste': 1}, fb={'triste': 1}),
  A('The first Sam does what has always worked. Picks up the phone.', ['phone'], ba=diz('MOM, CAN YOU', 'CALL THEM?', d=['MOM'])),
  A('And a parent calls the landlord. For a twenty-two-year-old.', ['twenty-two'], oa=['email', 'carimbo:MOM CALLED'], fa=None),
  A('The first Sam isn\'t lazy. Sam has simply never once been the person who fixes it.', ['never']),
  A('And notice who is exhausted. A parent, still on call, twenty-two years in.', ['exhausted']),
  B('The second Sam hates this just as much. Reads the lease. Writes a firm email. Gets half the money back.', ['half'], bb=pen('OKAY.', 'WHERE DO I START?'), ob=['email', 'carimbo2:HALF BACK'], cb=5, fb=None),
  N('Half. Not a victory. But it\'s Sam\'s half.', ['half'], big={'e': 'ALL OF IT, BY MOM', 'd': 'HALF OF IT, BY SAM', 'tam': 66})]},

 {'id': 'c5', 'cena': 'duo', 'idade': 30, 'et': 'Age 30: The terrible day', 'cap': 'THE TERRIBLE DAY', 'falas': [
  F('Thirty. A project falls apart at work. Publicly. For both of them.', ['publicly'], ca=0, cb=6, oa=['oferta'], ob=['oferta'], fa={'triste': 1}, fb={'triste': 1}),
  A('The first Sam spirals. Not because the problem is bigger. Because the feeling is new.', ['spirals'], ba=pen('SOMEONE NEEDS', 'TO FIX THIS.', d=['SOMEONE'])),
  A('No one ever let Sam find out that a bad feeling passes. So Sam calls in sick.', ['passes'], ba=None, oa=['oferta', 'carimbo:CALLED IN SICK']),
  B('The second Sam feels just as awful. But there\'s a quiet voice from every ugly shoelace and every failed test.', ['voice'], bb=pen("I'VE BEEN", 'HERE BEFORE.', d=['BEFORE'])),
  B('Sam shows up the next morning.', ['shows', 'up'], bb=None, ob=['oferta', 'carimbo2:SHOWED UP'], cb=7, fb=None),
  A('And here\'s the cruel part. The first Sam looks less capable than Sam really is. The ability is there. The proof isn\'t.', ['proof'], ba=None),
  N('Look at the count at the top. Problems solved alone.', ['alone'], conta=1, cb=8),
  N('That isn\'t confidence. It\'s evidence. Thirty years of proof that Sam survives hard things.', ['evidence'], conta=None, big={'e': 'NO EVIDENCE', 'd': 'EVIDENCE', 'tam': 110})]},

 {'id': 'c6', 'cena': 'duo', 'idade': 45, 'et': 'Age 45: The shoelace, again', 'cap': 'THE SHOELACE, AGAIN', 'falas': [
  F('Forty-five. Both Sams have a six-year-old who can\'t tie a shoe. And everybody is late.', ['late'], ca=0, cb=8),
  A('The first Sam kneels down and ties it. Fast. Kind. Done.', ['ties'], ba=LET),
  A('It\'s love. It was always love.', ['love']),
  B('The second Sam puts both hands in both pockets. "You try first."', ['pockets'], bb=TRY),
  B('It takes three minutes. It is the longest three minutes of Sam\'s day.', ['longest']),
  N('Watching your kid fight with a knot you could fix in four seconds is one of the hardest things a parent does.', ['hardest'])]},
 {'id': 'cta2', 'cena': 'texto', 'falas': [
  F('If you know a parent who can\'t stop fixing things, send them this. Gently. They\'re doing it out of love.', ['send'], big={'e': 'SEND THIS', 'd': 'TO THEM', 'tam': 110}, sub='GENTLY', icone='share')]},

 {'id': 'c7', 'cena': 'duo', 'idade': 60, 'et': 'Age 60: The flat tire', 'cap': 'THE FLAT TIRE', 'falas': [
  B('Sixty. The second Sam\'s daughter gets a flat tire two hours from home. She changes it herself. Then calls to brag.', ['brag'], bb=bal('GUESS WHAT', 'I JUST DID!', d=['GUESS']), ca=0, cb=8),
  A('The first Sam\'s son gets the same flat tire. He calls before the car has stopped rolling.', ['calls'], ba=bal('DAD, COME', 'GET ME.', d=['COME']), oa=['lista']),
  A('And Sam, at sixty, gets in the car.', ['sixty'], ba=diz("I'M COMING.")),
  A('Sam is needed. That feels a lot like love. But Sam is tired. And worried about what happens after.', ['tired'], ba=None, fa={'triste': 1}),
  B('The second Sam worried just as much, for forty years. Letting a kid struggle isn\'t the easy path. You have to stand there and watch.', ['watch'], bb=None),
  N('One parent is still needed. The other one is trusted.', ['needed', 'trusted'], big={'e': 'NEEDED', 'd': 'TRUSTED', 'tam': 130})]},

 {'id': 'vida', 'cena': 'vida', 'et': 'The whole life, side by side', 'falas': [
  F("Here's the whole life, side by side.", ['side'], n=0),
  F('Six. "Let me do it." "You try first."', [], n=1),
  F('Sixteen. A parent fixes the grade. Sam faces the teacher.', [], n=2),
  F('Thirty. Calls in sick. Shows up anyway.', [], n=3),
  F('Sixty. Still fixing. Gets the brag call.', ['brag'], n=4)]},
 {'id': 'honesto', 'cena': 'honesto', 'et': 'The honest part', 'falas': [
  F('Now, the honest part. Because helping is not the problem.', ['helping'], n=0),
  F('That eight-year study found a link. Not a law. Plenty of kids with hovering parents turn out fine.', ['link'], n=1, x=1),
  F('And in twenty twelve, a study of nearly six hundred grown children found something awkward for this video.', ['awkward'], n=2, x=1),
  F('The ones who got intense support from their parents, advice, money, a listening ear, were doing better. Not worse.', ['better'], n=2, x=1),
  F('So what\'s the difference? Support says, I\'m here while you do it. Rescue says, step aside, I\'ll do it.', ['difference'], n=3, x=1),
  F('One builds a person. The other replaces them.', ['builds'], rod='ONE BUILDS A PERSON. ONE REPLACES THEM.'),
  F('The trick is the age. A two-year-old needs you to step in. A twelve-year-old needs you to step back. A little more every year.', ['step', 'back'], rod='STEP BACK A LITTLE MORE EVERY YEAR.'),
  F('And some rescues are right. A child in real danger is not a teaching moment.', ['danger'], rod='REAL DANGER IS NOT A LESSON.')]},
 {'id': 'trocas', 'cena': 'trocas', 'et': "It's never too late", 'falas': [
  F('And this can change at any age. Theirs, or yours.', ['change'], n=0, tit=1),
  F('Three swaps, for the next time you feel your hands reaching in.', ['three', 'swaps'], n=0, tit=None),
  F('Instead of "let me do it," try "you try first. I\'m here."', ['first'], n=1),
  F('Instead of "I\'ll call them," try "what\'s your plan?"', ['plan'], n=2),
  F('And instead of "it\'s okay, I fixed it," try "that was hard. And you did it."', ['you', 'did'], n=3),
  F('And if you were the rescued kid, start small. One problem this week that you solve before you call anyone.', ['before'], n=3, yet=1)]},
 {'id': 'fim1', 'cena': 'duo', 'idade': 6, 'gap': 0.2, 'falas': [F('Same kid. Same shoelace. Two different homes.', ['homes'], ba=LET, bb=TRY)]},
 {'id': 'fim2', 'cena': 'fim', 'falas': [
  F('Next time, same kid again, two new homes. One who was paid for every A. And one who was trusted to learn.', ['paid', 'trusted'], n=1),
  F("Subscribe so you don't miss it. I'll see you in the next childhood.", ['subscribe'], n=2)]},
 ])}

# =====================================================================================================================
# #04 — Paid for Every A vs Trusted to Learn
# =====================================================================================================================
LE = {'tag': 'THE STUDY', 'titulo': ["Undermining Children's", 'Intrinsic Interest with', 'Extrinsic Reward'], 'meta': ['Lepper, Greene & Nisbett · 1973', 'Journal of Personality and Social Psychology', '51 preschoolers who loved to draw']}
DE = {'tag': 'THE STUDY', 'titulo': ['Extrinsic Rewards', 'and Intrinsic', 'Motivation'], 'meta': ['Deci, Koestner & Ryan · 1999', 'Psychological Bulletin', 'A review of 128 experiments']}
PAY = bal('ONE DOLLAR', 'PER DRAWING!', d=['DOLLAR'])
TELL = bal('TELL ME', 'ABOUT THIS ONE.', d=['TELL'])
ROWS = [['PROMISED A PRIZE', 6, 12, 'half', 'coral'], ['SURPRISE PRIZE', 12, 12, 'same', 'mar'], ['NO PRIZE', 12, 12, 'same', 'mar']]
V['04'] = {'cfg': {'id': 'tc004', 'titA': '“I\'ll pay you for it.”', 'titB': '“Tell me about it.”', 'conta': 'DONE JUST FOR FUN', 'idades': [6, 10, 16, 22, 30, 45, 60],
  'vida': [[6, 'A dollar per drawing.', '“Tell me about it.”'], [16, 'Easy A\'s for cash.', 'A radio in the garage.'], [30, 'Chasing the bonus.', 'Building for fun.'], [60, '“What do I even like?”', 'A garage full of projects.']],
  'honesto': ['Rewards are not', 'always poison.'],
  'cards': [{'ano': '1973', 'quem': 'Lepper, Greene & Nisbett', 'onde': 'J. of Personality and Social Psychology', 'n': '51 preschoolers', 't': ['Promised a prize:', 'about half the', 'drawing time later.'], 'x': ['Surprise prize:', 'no drop at all.'], 'chip': 'SUPPORTS IT', 'cor': 'mar'},
            {'ano': '1999', 'quem': 'Deci, Koestner & Ryan', 'onde': 'Psychological Bulletin', 'n': '128 experiments', 't': ['Expected rewards', 'lowered interest.', 'Positive feedback', 'raised it.'], 'chip': 'SUPPORTS IT', 'cor': 'mar'},
            LIM(['It is about things', 'kids already love.', 'Chores are', 'a different story.'])],
  'trocas': [['“I\'ll pay you for it.”', '“Tell me about it.”'], ['“What did you get?”', '“What did you learn?”'], ['“Good job. Here\'s $5.”', '“You looked like you loved that.”']],
  'yet': {'e': 'FOR', 'd': 'FREE.', 'tam': 210}, 'lista': {'tit': 'THINGS I LIKE', 'it': ['?', '?', '?']},
  'prox': {'e1': 'LOVED FOR', 'e2': 'WINNING', 'd1': 'LOVED', 'd2': 'ANYWAY', 'tam2': 140},
  'fontes': ['https://psycnet.apa.org/doi/10.1037/h0035519', 'https://pubmed.ncbi.nlm.nih.gov/10589297/'],
  'thumbs': {'a': {'tagE': 'AGE 6', 'tagD': 'AGE 60', 'falaE': ['$1 PER', 'DRAWING!'], 'pensaD': ['WHAT DO I', 'EVEN LIKE?'], 'dest': ['$1', 'LIKE'], 'txE': 'PAID TO DRAW', 'txD': 'NEVER DREW AGAIN', 'pE': SAM6, 'pD': {'velho': 1, 'humor': 'triste', 'lagrima': 1, 'olhar': [-0.2, 0.3]}},
             'b': {'palE': 'PAID', 'palD': 'TRUSTED', 'txE': 'QUIT AT 16', 'txD': 'STILL CREATING', 'pE': {'humor': 'triste', 'lagrima': 1, 'olhar': [0.2, 0.5], 'incl': -3}, 'pD': {'humor': 'riso', 'olhar': [-0.2, -0.2], 'incl': 3}},
             'c': {'perg': 'WHO STILL LOVES IT?', 'placar': ['0', '7'], 'rot': 'THINGS DONE JUST FOR FUN', 'txE': '“I\'LL PAY YOU”', 'txD': '“TELL ME MORE”', 'pE': {'velho': 1, 'humor': 'triste', 'lagrima': 1, 'olhar': [0.3, 0.5]}, 'pD': {'velho': 1, 'humor': 'riso', 'olhar': [-0.3, -0.2]}}}},
 'blocos': monta([
 {'id': 'gancho1', 'cena': 'duo', 'idade': 6, 'et': 'Same kid, two homes', 'gap': 0.1, 'falas': [
  F('Two kids love to draw. They would do it for hours. For free.', ['free'], oa=['nota:★'], ob=['nota:★'], fa={'pula': 1}, fb={'pula': 1}),
  A('In one home, every drawing earns a dollar.', ['dollar'], ba=PAY, fa=None, fb=None),
  B('In the other, every drawing earns a question. "Tell me about this one."', ['question'], bb=TELL),
  N('Same kid. Same crayons.', ['same'])]},
 {'id': 'gancho2', 'cena': 'duo', 'idade': 30, 'gap': 0.1, 'falas': [
  B('By thirty, one of them still draws on weekends.', ['still', 'draws'], ca=0, cb=6, bb=pen('JUST FOR FUN.')),
  A('The other one hasn\'t picked up a pencil since the payments stopped.', ['stopped'], ba=pen("WHAT'S IT", 'WORTH?', d=['WORTH']), fa={'triste': 1})]},
 {'id': 'gancho3', 'cena': 'texto', 'falas': [
  F('This is the whole life, side by side.', ['whole', 'life'], big={'e': 'THE WHOLE LIFE,', 'd': 'SIDE BY SIDE', 'tam': 78}, linha=0),
  F('Built around an experiment from nineteen seventy-three that psychologists still argue about.', ['experiment'], linha=10, sub='ONE EXPERIMENT · 1973')]},

 {'id': 'c1', 'cena': 'duo', 'idade': 6, 'et': 'Age 6: The deal', 'cap': 'THE DEAL', 'falas': [
  F('Meet Sam. Sam is six, and Sam draws constantly. Dogs. Rockets. A purple dog on a rocket.', ['draws'], oa=['nota:★'], ob=['nota:★'], fa={'pula': 1}, fb={'pula': 1}),
  A('In the first home, a proud parent wants to encourage it. So there\'s a deal. One dollar per drawing.', ['deal'], ba=PAY, fa=None, fb=None),
  A('And it works. Sam draws more than ever. Ten a day.', ['works'], fa={'pula': 1, 'brilho': 1}),
  A('That\'s the trap. It works.', ['trap'], ba=None, fa=None),
  A('And notice, this parent isn\'t being cold. This is generosity. That\'s what makes it so easy to miss.', ['generosity']),
  B('In the second home, there\'s no money. Just a parent who looks at the page and asks, "Why is the dog purple?"', ['purple'], bb=bal('WHY IS THE', 'DOG PURPLE?', d=['PURPLE'])),
  B('And Sam explains for twenty minutes.', ['explains'], fb={'pula': 1, 'brilho': 1}),
  N('Right now, both kids are drawing. Both are happy.', ['happy'], fb=None),
  A('But in the first home, drawing just became something else. It\'s how you get paid.', ['paid'], ba=pen('DRAWING', '= MONEY.', d=['MONEY'])),
  B('In the second home, drawing is still what it always was. It\'s mine.', ['mine'], bb=pen("IT'S MINE.", d=['MINE'])),
  N('One kid has a hobby. The other one has a job.', ['hobby', 'job'], big={'e': 'A JOB', 'd': 'A HOBBY', 'tam': 140})]},

 {'id': 'c2', 'cena': 'estudo', 'idade': 10, 'et': 'Age 10: The experiment', 'cap': 'THE EXPERIMENT', 'est': LE, 'falas': [
  F('Ten. And this next part is not a story.', ['not', 'story'], dir={'k': 'selo', 't': ['NOT A STORY.', 'A REAL', 'EXPERIMENT.']}),
  F('In nineteen seventy-three, three psychologists walked into a nursery school at Stanford.', ['stanford'], dir={'k': 'nomes', 't': ['Mark Lepper', 'David Greene', 'Richard Nisbett'], 's': 'STANFORD · 1973'}),
  F('They watched through a one-way mirror, and picked out fifty-one children who already loved to draw.', ['loved'], dir={'k': 'num', 'n': 51, 'rot': 'PRESCHOOLERS WHO LOVED TO DRAW'}),
  F('Then they split them into three groups.', ['three', 'groups'], dir={'k': 'itens', 'cab': ['Three groups.'], 'n': 0, 'marca': '•', 'it': ['Promised a prize for drawing', 'Got the same prize as a surprise', 'Got no prize at all']}),
  F('The first group was promised a prize for drawing. A certificate with a gold star and a ribbon.', ['promised'], dir={'k': 'itens', 'cab': ['Three groups.'], 'n': 1, 'marca': '•', 'it': ['Promised a prize for drawing', 'Got the same prize as a surprise', 'Got no prize at all']}),
  F('The second group got the same prize as a surprise. No promise. The third group got nothing.', ['surprise'], dir={'k': 'itens', 'cab': ['Three groups.'], 'n': 3, 'marca': '•', 'it': ['Promised a prize for drawing', 'Got the same prize as a surprise', 'Got no prize at all']}),
  F('Everybody drew. Everybody had fun. Then the researchers waited.', ['waited'], dir={'k': 'selo', 't': ['THEN THEY', 'WAITED.']}),
  F('One to two weeks later, the markers went back on the table during free play. No prizes. No adults asking. Just kids and markers.', ['free', 'play'], dir={'k': 'rows', 'cab': ['Free time spent drawing,', 'one to two weeks later:'], 'n': 0, 'rows': ROWS}),
  F('The surprise group and the no-prize group kept drawing about as much as before.', ['before'], dir={'k': 'rows', 'cab': ['Free time spent drawing,', 'one to two weeks later:'], 'n': 3, 'rows': [ROWS[0][:1] + [0, 12, '', 'coral'], ROWS[1], ROWS[2]]}),
  F('The kids who had been promised the prize spent about half as much time drawing.', ['half'], dir={'k': 'rows', 'cab': ['Free time spent drawing,', 'one to two weeks later:'], 'n': 3, 'rows': ROWS}),
  F('The drawing hadn\'t changed. The reason had.', ['reason'], rod='THE REASON HAD CHANGED.'),
  F('They called it the overjustification effect. Pay someone for what they love, and you can turn play into work.', ['play', 'work'], rod='PLAY CAN BECOME WORK.')]},

 {'id': 'c3', 'cena': 'duo', 'idade': 16, 'et': 'Age 16: The report card', 'cap': 'THE REPORT CARD', 'falas': [
  F('Sixteen. Back to the story.', ['story'], ca=0, cb=2),
  A('In the first home, the deal grew up too. Twenty dollars for every A.', ['twenty', 'dollars'], ba=bal('$20 FOR', 'EVERY A!', d=['$20']), oa=['nota:A']),
  A('And Sam gets A\'s. By picking the easiest classes. And learning exactly what\'s on the test. Nothing more.', ['easiest'], ba=pen('IS THIS ON', 'THE TEST?', d=['TEST'])),
  A('Why would you take the hard class? The hard class pays the same twenty dollars. With more risk.', ['hard', 'class']),
  B('In the second home, nobody pays for grades. The question at dinner is, "What\'s the best thing you learned this week?"', ['learned'], bb=bal('WHAT DID', 'YOU LEARN?', d=['LEARN'])),
  B('Sam takes physics. Gets a B. And builds a radio in the garage, for no reason at all.', ['radio'], bb=diz('LOOK WHAT', 'I BUILT!', d=['BUILT']), ob=['nota:B', 'carimbo2:BUILT A RADIO'], cb=3),
  N('On paper, the first Sam is winning.', ['winning'], big={'e': 'STRAIGHT A\'S', 'd': 'A B AND A RADIO', 'tam': 80})]},
 {'id': 'c3b', 'cena': 'estudo', 'idade': 16, 'est': DE, 'falas': [
  F('And this isn\'t one quirky study. In nineteen ninety-nine, researchers combined a hundred and twenty-eight experiments.', ['experiments'], dir={'k': 'num', 'n': 128, 'rot': 'EXPERIMENTS, COMBINED'}),
  F('Rewards that people expected for doing a task reliably lowered their interest in doing it for free. And the effect was stronger in children than in college students.', ['lowered'], dir={'k': 'itens', 'cab': ['Expected rewards:'], 'n': 2, 'auto': 1, 'it': ['Lowered interest in the task', 'Hit children harder than adults']}),
  F('But one kind of reward did the opposite. Honest, positive feedback. That raised interest.', ['feedback'], rod='POSITIVE FEEDBACK RAISED INTEREST.')]},
 {'id': 'cta1', 'cena': 'texto', 'falas': [
  F('Quick question before we keep going. Were you paid for your grades?', ['paid'], big={'e': 'WERE YOU', 'd': 'PAID FOR A\'S?', 'tam': 96}),
  F('Comment "paid" or "not paid". And tell me honestly if it worked.', ['comment'], chips=['“paid”', '“not paid”'], sub='COMMENT BELOW')]},

 {'id': 'c4', 'cena': 'duo', 'idade': 22, 'et': 'Age 22: The first job', 'cap': 'THE FIRST JOB', 'falas': [
  F('Twenty-two. Two job offers land in each inbox. One pays more. One is more interesting.', ['two', 'offers'], ca=0, cb=4, oa=['email'], ob=['email']),
  A('The first Sam doesn\'t even read the second one. There\'s only ever been one question.', ['one', 'question'], ba=pen('WHAT DOES', 'IT PAY?', d=['PAY']), oa=['email', 'carimbo:TOOK THE MONEY']),
  B('The second Sam asks a different question. And takes the smaller paycheck.', ['smaller'], bb=pen('WHAT WILL', 'I LEARN?', d=['LEARN']), ob=['email', 'carimbo2:TOOK THE CRAFT'], cb=5),
  A('The first Sam\'s job pays well. And feels like a very long hallway.', ['hallway'], bb=None, fa={'triste': 1}),
  B('The second Sam\'s job barely pays the bills. And Sam comes home talking about it.', ['talking']),
  N('Neither one is wrong. Rent is real.', ['rent']),
  N('But watch what happens when the money stops being enough.', ['enough'], big={'e': 'WHAT DOES IT PAY?', 'd': 'WHAT WILL I LEARN?', 'tam': 66})]},

 {'id': 'c5', 'cena': 'duo', 'idade': 30, 'et': 'Age 30: The raise', 'cap': 'THE RAISE', 'falas': [
  F('Thirty. The first Sam has had raise after raise. And each one feels great. For about a month.', ['month'], ca=0, cb=5, oa=['oferta'], ob=['oferta']),
  A('Then the feeling fades, and Sam needs the next one. Because Sam has never once asked: what would I do if nobody paid me?', ['nobody'], ba=pen("WHAT'S THE", 'NEXT BONUS?', d=['BONUS']), oa=['oferta', 'carimbo:BORED'], fa={'triste': 1}),
  B('The second Sam earns less. Let\'s be honest about that.', ['less']),
  B('But on Saturday mornings, Sam is in the garage, building something nobody asked for.', ['garage'], bb=pen('ONE MORE', 'HOUR.', d=['MORE']), ob=['oferta', 'carimbo2:STILL CURIOUS'], cb=6),
  A('And here\'s the strange part. The first Sam is good at the job. Skill was never the problem. Wanting was.', ['wanting'], bb=None),
  N('Look at the count at the top. Things done just for fun.', ['fun'], conta=1, cb=7),
  N('One Sam asks, what do I get? The other asks, what do I love?', ['get', 'love'], conta=None, big={'e': 'WHAT DO I GET?', 'd': 'WHAT DO I LOVE?', 'tam': 76})]},

 {'id': 'c6', 'cena': 'duo', 'idade': 45, 'et': 'Age 45: The reading chart', 'cap': 'THE READING CHART', 'falas': [
  F('Forty-five. Both Sams have a kid who won\'t pick up a book.', ['book'], ca=0, cb=7),
  A('The first Sam does the most natural thing in the world. Builds a chart. One dollar per book.', ['chart'], ba=bal('A DOLLAR', 'PER BOOK!', d=['DOLLAR'])),
  A('And it works. For exactly as long as the dollars last.', ['dollars']),
  A('The kid reads eleven books in a month. And then asks how much for twelve.', ['how', 'much'], ba=bal('HOW MUCH', 'FOR TWELVE?', q='k', d=['MUCH'])),
  B('The second Sam sits down on the couch with a book of their own. And later asks one thing.', ['couch'], bb=bal('WHAT HAPPENS', 'NEXT?', d=['NEXT'])),
  N('One kid is reading for the dollar. The other is reading for the story.', ['dollar', 'story'], big={'e': 'FOR THE DOLLAR', 'd': 'FOR THE STORY', 'tam': 86})]},
 {'id': 'cta2', 'cena': 'texto', 'falas': [
  F('If you know a parent who\'s about to build a reward chart, send them this first.', ['send'], big={'e': 'SEND THIS', 'd': 'TO THEM', 'tam': 110}, sub='BEFORE THE REWARD CHART', icone='share')]},

 {'id': 'c7', 'cena': 'duo', 'idade': 60, 'et': 'Age 60: The last paycheck', 'cap': 'THE LAST PAYCHECK', 'falas': [
  N('Sixty. The paychecks are about to stop. For both of them.', ['stop'], ca=0, cb=7),
  B('The second Sam can\'t wait. There\'s a garage full of half-built things, and a guitar that still sounds terrible.', ['wait'], ob=['violao', 'notas'], bb=pen('FINALLY.', d=['FINALLY'])),
  A('The first Sam is standing in a quiet house. For fifty years there was always a reason to do things. A dollar. A grade. A bonus.', ['reason'], oa=['lista'], fa={'triste': 1}),
  A('Now the reasons are gone. And Sam is trying to answer a question for the very first time. What do I actually like?', ['like'], ba=pen('WHAT DO I', 'ACTUALLY LIKE?', d=['LIKE'])),
  A('It\'s not that the first Sam did anything wrong. Sam did everything right. Every single thing that was paid for.', ['paid']),
  N('One Sam was paid for fifty years. The other one was interested.', ['paid', 'interested'], big={'e': 'PAID', 'd': 'INTERESTED', 'tam': 130})]},

 {'id': 'vida', 'cena': 'vida', 'et': 'The whole life, side by side', 'falas': [
  F("Here's the whole life, side by side.", ['side'], n=0),
  F('Six. A dollar per drawing. "Tell me about it."', [], n=1),
  F('Sixteen. Easy A\'s for cash. A radio in the garage.', [], n=2),
  F('Thirty. Chasing the bonus. Building for fun.', [], n=3),
  F('Sixty. "What do I even like?" A garage full of projects.', ['projects'], n=4)]},
 {'id': 'honesto', 'cena': 'honesto', 'et': 'The honest part', 'falas': [
  F('Now, the honest part. Because rewards are not always poison.', ['rewards'], n=0),
  F('In that nursery school, the surprise prize did no harm at all. It was the deal, do this and you get that, that changed things.', ['deal'], n=1, x=1),
  F('The bigger review backed it up. But other researchers have argued for decades that the effect gets oversold.', ['oversold'], n=2, x=1),
  F('And it\'s about things kids already love. Paying a kid to take out the trash will not destroy a passion for garbage.', ['already', 'love'], n=3, x=1),
  F('Paying for grades isn\'t evil. Plenty of loving parents do it.', ['loving']),
  F('And a reward is not the same as recognition. Telling a kid, I noticed how hard you worked on that, costs nothing. And in that review, it helped.', ['recognition'], rod='RECOGNITION IS NOT A PAYMENT.'),
  F('The question is just what you want your kid to notice. The dollar. Or the drawing.', ['dollar', 'drawing'], rod='THE DOLLAR, OR THE DRAWING?')]},
 {'id': 'trocas', 'cena': 'trocas', 'et': "It's never too late", 'falas': [
  F('And interest can be rebuilt. At six. Or at sixty.', ['rebuilt'], n=0, tit=1),
  F('Three swaps, for the next time you reach for your wallet.', ['three', 'swaps'], n=0, tit=None),
  F('Instead of "I\'ll pay you for it," try "tell me about it."', ['tell'], n=1),
  F('Instead of "what did you get," try "what did you learn?"', ['learn'], n=2),
  F('And instead of "good job, here\'s five dollars," try "you looked like you loved that."', ['loved'], n=3),
  F('And if you were the paid kid, try one thing this week that nobody will ever pay you for.', ['nobody'], n=3, yet=1)]},
 {'id': 'fim1', 'cena': 'duo', 'idade': 6, 'gap': 0.2, 'falas': [F('Same kid. Same crayons. Two different homes.', ['homes'], oa=['nota:★'], ob=['nota:★'], ba=PAY, bb=TELL)]},
 {'id': 'fim2', 'cena': 'fim', 'falas': [
  F('Next time, same kid again, two new homes. One who was loved for winning. And one who was loved anyway.', ['winning', 'anyway'], n=1),
  F("Subscribe so you don't miss it. I'll see you in the next childhood.", ['subscribe'], n=2)]},
 ])}

# =====================================================================================================================
# #05 — Loved for Winning vs Loved Anyway
# =====================================================================================================================
AS = {'tag': 'THE STUDY', 'titulo': ['The Emotional Costs', "of Parents'", 'Conditional Regard'], 'meta': ['Assor, Roth & Deci · 2004', 'Journal of Personality', 'College students, their mothers, three generations']}
RO = {'tag': 'THE STUDY', 'titulo': ['Consequences of', 'Parental', 'Conditional Regard'], 'meta': ['Roth, Assor, Niemiec, Ryan & Deci · 2009', 'Developmental Psychology', '169 ninth graders']}
CU = {'tag': 'THE STUDY', 'titulo': ['Perfectionism Is', 'Increasing', 'Over Time'], 'meta': ['Curran & Hill · 2019', 'Psychological Bulletin', '41,641 college students, 1989 to 2016']}
ICE = bal('ROUGH GAME.', 'ICE CREAM?', d=['ICE', 'CREAM'])
SIL = bal('. . .')
V['05'] = {'cfg': {'id': 'tc005', 'titA': '“Proud when you win.”', 'titB': '“Proud of you. Period.”', 'conta': 'RISKS TAKEN', 'idades': [6, 10, 16, 22, 30, 45, 60],
  'vida': [[6, 'A silent ride home.', '“Ice cream?”'], [16, 'Quits what Sam might lose.', 'Bombs. Tries again.'], [30, 'Winning. Never enough.', 'Fails. Keeps going.'], [60, '“Am I enough?”', 'Kids call when they lose.']],
  'honesto': ['High standards are', 'not the problem.'],
  'cards': [{'ano': '2004', 'quem': 'Assor, Roth & Deci', 'onde': 'Journal of Personality', 'n': 'three generations', 't': ['Conditional love', '“worked”: kids performed.', 'And felt pressure,', 'shame and resentment.'], 'x': ['Passed from mothers', 'to daughters.'], 'chip': 'SUPPORTS IT', 'cor': 'mar'},
            {'ano': '2009', 'quem': 'Roth et al.', 'onde': 'Developmental Psychology', 'n': '169 ninth graders', 't': ['Love for grades:', 'study for the grade.', 'Support for choices:', 'study from interest.'], 'chip': 'SUPPORTS IT', 'cor': 'mar'},
            LIM(['These are surveys.', 'People describing', 'their own childhood.', 'Memory is not a lab.'])],
  'trocas': [['“So proud you won.”', '“I love watching you play.”'], ['“What happened?”', '“Rough one. I\'m here.”'], ['(silence)', '“Ice cream?”']],
  'yet': {'e': 'ENOUGH', 'd': 'ALREADY.', 'tam': 160}, 'lista': {'tit': 'WON', 'it': ['Every award', 'Every title', 'No rest']},
  'prox': {'e1': 'SAME KID', 'e2': 'AGAIN', 'd1': 'TWO NEW', 'd2': 'HOMES', 'tam2': 150},
  'fontes': ['https://pubmed.ncbi.nlm.nih.gov/14686884/', 'https://pubmed.ncbi.nlm.nih.gov/19586183/', 'https://pubmed.ncbi.nlm.nih.gov/29283599/'],
  'thumbs': {'a': {'tagE': 'AGE 6', 'tagD': 'AGE 60', 'falaE': ['YOU', 'LOST?!'], 'pensaD': ['AM I', 'ENOUGH?'], 'dest': ['LOST', 'ENOUGH'], 'txE': 'LOVED FOR WINNING', 'txD': 'NEVER ENOUGH', 'pE': {'humor': 'triste', 'lagrima': 1, 'olhar': [0.3, 0.4]}, 'pD': {'velho': 1, 'humor': 'triste', 'lagrima': 1, 'olhar': [-0.2, 0.3]}},
             'b': {'palE': 'WINNER', 'palD': 'LOVED', 'txE': "CAN'T STOP", 'txD': 'CAN REST', 'pE': {'humor': 'choque', 'lagrima': 1, 'olhar': [0.2, 0.3]}, 'pD': {'humor': 'riso', 'olhar': [-0.2, -0.2], 'incl': 3}},
             'c': {'perg': 'WHO FEELS ENOUGH?', 'placar': ['1', '7'], 'rot': 'RISKS TAKEN', 'txE': '“WHEN YOU WIN”', 'txD': '“NO MATTER WHAT”', 'pE': {'velho': 1, 'humor': 'triste', 'lagrima': 1, 'olhar': [0.3, 0.5]}, 'pD': {'velho': 1, 'humor': 'riso', 'olhar': [-0.3, -0.2]}}}},
 'blocos': monta([
 {'id': 'gancho1', 'cena': 'duo', 'idade': 6, 'et': 'Same kid, two homes', 'gap': 0.1, 'falas': [
  F('Two kids lose the same soccer game. Four to nothing.', ['four', 'nothing'], oa=['nota:0-4'], ob=['nota:0-4'], fa={'triste': 1}, fb={'triste': 1}),
  A('In one car, the ride home is silent.', ['silent'], ba=SIL),
  B('In the other car, a parent says, "Rough game. Want ice cream?"', ['ice', 'cream'], bb=ICE, fb=None),
  N('Same kid. Same score.', ['same'])]},
 {'id': 'gancho2', 'cena': 'duo', 'idade': 30, 'gap': 0.1, 'falas': [
  B('By thirty, one of them can lose, and still sleep at night.', ['sleep'], ca=1, cb=6, bb=pen('I TRIED.', "THAT'S OKAY.")),
  A('The other one hasn\'t rested since the third grade.', ['rested'], ba=pen('NOT ENOUGH.', d=['NOT']), fa={'triste': 1})]},
 {'id': 'gancho3', 'cena': 'texto', 'falas': [
  F('This is the whole life, side by side.', ['whole', 'life'], big={'e': 'THE WHOLE LIFE,', 'd': 'SIDE BY SIDE', 'tam': 78}, linha=0),
  F('Including a study that traced this exact pattern across three generations of the same families.', ['three', 'generations'], linha=10, sub='ONE STUDY · THREE GENERATIONS')]},

 {'id': 'c1', 'cena': 'duo', 'idade': 6, 'et': 'Age 6: The ride home', 'cap': 'THE RIDE HOME', 'falas': [
  F('Meet Sam. Sam is six, and plays soccer on Saturdays.', ['soccer']),
  N('When Sam wins, both homes look exactly the same. Hugs. Noise. That\'s my kid.', ['wins'], ba=bal("THAT'S", 'MY KID!', d=['MY']), bb=bal("THAT'S", 'MY KID!', d=['MY']), fa={'pula': 1, 'brilho': 1}, fb={'pula': 1, 'brilho': 1}),
  F('You can\'t see the difference on a good day.', ['good', 'day'], ba=None, bb=None, fa=None, fb=None),
  N('You see it on the day Sam loses. Four to nothing.', ['loses'], oa=['nota:0-4'], ob=['nota:0-4'], fa={'triste': 1}, fb={'triste': 1}),
  A('In the first home, nobody yells. Nobody punishes. The warmth just leaves the car.', ['warmth'], ba=SIL),
  A('No hug. Short answers. A parent who is suddenly very interested in the road.', ['road']),
  A('From the outside, it looks like a family driving home. Nobody would call it harsh. Sam wouldn\'t either. Not for another thirty years.', ['outside']),
  B('In the second home, the warmth stays exactly where it was. "Rough game. Want ice cream?"', ['stays'], bb=ICE, fb=None),
  N('Both parents love their kid. That\'s not the question.', ['love']),
  A('But in the first home, Sam just learned a rule. Love is a prize.', ['prize'], ba=pen('LOVE IS', 'A PRIZE.', d=['PRIZE'])),
  B('In the second home, Sam learned a different rule. Love is the floor.', ['floor'], bb=pen('LOVE IS', 'THE FLOOR.', d=['FLOOR'])),
  N('Psychologists have a name for the first one. Conditional regard. Affection that rises when you perform, and drops when you don\'t.', ['conditional', 'regard'], big={'e': 'A PRIZE', 'd': 'THE FLOOR', 'tam': 130})]},

 {'id': 'c2', 'cena': 'estudo', 'idade': 10, 'et': 'Age 10: The study', 'cap': 'THE STUDY', 'est': AS, 'falas': [
  F('Ten. And this next part is not a story.', ['not', 'story'], dir={'k': 'selo', 't': ['NOT A STORY.', 'A REAL STUDY.']}),
  F('In two thousand four, three researchers, Avi Assor, Guy Roth and Edward Deci, asked college students about growing up.', ['researchers'], dir={'k': 'nomes', 't': ['Avi Assor', 'Guy Roth', 'Edward Deci'], 's': 'JOURNAL OF PERSONALITY · 2004'}),
  F('Did your parents give you more affection when you did well? And less when you didn\'t?', ['more', 'less'], dir={'k': 'selo', 't': ['MORE LOVE', 'WHEN YOU WIN?']}),
  F('The students who said yes had something in common. It had worked. They did what their parents wanted.', ['worked'], dir={'k': 'selo', 't': ['IT WORKED.', 'THEY PERFORMED.']}),
  F('But they described it as pressure from the inside. Not, I want to. I have to.', ['have', 'to'], dir={'k': 'selo', 't': ['NOT “I WANT TO.”', '“I HAVE TO.”']}),
  F('Their good feelings after a success didn\'t last. Their shame after a failure did. And they resented their parents for it.', ['shame'], dir={'k': 'itens', 'cab': ['What it cost them:'], 'n': 3, 'auto': 1, 'it': ['Pride that faded fast', 'Shame after failing', 'Resentment toward parents']}),
  F('Then the researchers looked at mothers and their grown daughters. And found the pattern handed down.', ['handed', 'down'], dir={'k': 'selo', 't': ['MOTHERS.', 'DAUGHTERS.']}),
  F('Mothers who had been loved conditionally as girls felt worse about themselves as adults. And their daughters described being raised the very same way.', ['same', 'way'], rod='HANDED DOWN, MOTHER TO DAUGHTER.')]},

 {'id': 'c3', 'cena': 'duo', 'idade': 16, 'et': 'Age 16: The B plus', 'cap': 'THE B PLUS', 'falas': [
  F('Sixteen. Back to the story. Sam gets a B plus on the biggest exam of the year.', ['b', 'plus'], ca=0, cb=1, oa=['nota:B+'], ob=['nota:B+']),
  A('In the first home, there\'s one question. "What happened?"', ['happened'], ba=bal('WHAT', 'HAPPENED?', d=['HAPPENED']), fa={'triste': 1}),
  A('Sam doesn\'t sleep that night. And the next week, Sam quits the debate team. Sam might not win.', ['quits'], ba=pen('A B PLUS IS', 'A FAILURE.', d=['FAILURE']), oa=['nota:B+', 'carimbo:QUIT DEBATE']),
  A('The scary part is how good this looks. Sam is the kid every teacher wants. Disciplined. Driven. Exhausted.', ['exhausted'], ba=None),
  B('In the second home, there\'s a different question. "Are you happy with it?"', ['happy'], bb=bal('ARE YOU HAPPY', 'WITH IT?', d=['HAPPY'])),
  B('That month, Sam auditions for the school play. Bombs it. And signs up again in the spring.', ['bombs'], bb=None, ob=['nota:B+', 'carimbo2:TRIED AGAIN'], cb=3),
  N('One Sam only plays games that can be won.', ['won'], big={'e': 'ONLY SAFE BETS', 'd': 'ANY BET', 'tam': 96})]},
 {'id': 'c3b', 'cena': 'estudo', 'idade': 16, 'est': RO, 'falas': [
  F('A second study, with a hundred and sixty-nine ninth graders, found the split you\'d expect.', ['ninth', 'graders'], dir={'k': 'num', 'n': 169, 'rot': 'NINTH GRADERS'}),
  F('Kids whose parents gave extra love for good grades did study. But they studied for the grade, under pressure.', ['grade'], dir={'k': 'frases', 'n': 1, 'cab': ['Two reasons to study.'], 'fr': [['Extra love for grades:', 'studying for the grade', 'coral'], ['Support for their choices:', 'studying out of interest', 'mar']]}),
  F('Kids whose parents supported their choices studied because the subject interested them.', ['interested'], dir={'k': 'frases', 'n': 2, 'cab': ['Two reasons to study.'], 'fr': [['Extra love for grades:', 'studying for the grade', 'coral'], ['Support for their choices:', 'studying out of interest', 'mar']]})]},
 {'id': 'cta1', 'cena': 'texto', 'falas': [
  F('Quick question before we keep going. Did the ride home depend on the score?', ['ride', 'home'], big={'e': 'DID IT DEPEND', 'd': 'ON THE SCORE?', 'tam': 88}),
  F('Comment "depended" or "didn\'t". I read these, and I want to know which car you were in.', ['comment'], chips=['“depended”', '“didn\'t”'], sub='COMMENT BELOW')]},

 {'id': 'c4', 'cena': 'duo', 'idade': 22, 'et': 'Age 22: The rejection', 'cap': 'THE REJECTION', 'falas': [
  F('Twenty-two. Both Sams apply to the program they\'ve wanted for years. And neither one gets in.', ['neither'], ca=0, cb=3, oa=['email', 'carimbo:REJECTED'], ob=['email', 'carimbo:REJECTED'], fa={'triste': 1}, fb={'triste': 1}),
  A('The first Sam can\'t tell anyone at home. For three weeks.', ['three', 'weeks'], ba=pen("THEY'LL BE", 'DISAPPOINTED.', d=['DISAPPOINTED'])),
  A('When it finally comes out at dinner, there\'s a pause. Then, so what are you going to do about it? Not cruel. Just cold.', ['cold'], ba=bal('SO WHAT ARE YOU', 'GOING TO DO?', q='k', d=['DO'])),
  B('The second Sam calls the same day.', ['same', 'day'], bb=diz("I DIDN'T", 'GET IN.', d=["DIDN'T"])),
  B('And hears, come home this weekend. Then applies again the next year.', ['again'], bb=pen('COME HOME', 'THIS WEEKEND.'), ob=['email', 'carimbo2:APPLIED AGAIN'], cb=4, fb=None),
  N('One Sam lost an opportunity. The other lost an opportunity and, for a while, a family.', ['family'], big={'e': 'ALONE WITH IT', 'd': 'HELD THROUGH IT', 'tam': 84})]},

 {'id': 'c5', 'cena': 'duo', 'idade': 30, 'et': 'Age 30: The award', 'cap': 'THE AWARD', 'falas': [
  F('Thirty. And let\'s be honest. The first Sam may be the more successful one. Top of the company. Awards on the shelf.', ['successful'], ca=1, cb=5, oa=['oferta'], ob=['oferta']),
  A('But every win lasts about a day. Then the old fear comes back.', ['fear'], ba=pen('WHAT IF I', 'STOP WINNING?', d=['STOP']), oa=['oferta', 'carimbo:NOT ENOUGH'], fa={'triste': 1}),
  A('Sam\'s coworkers think Sam is fearless. It\'s the opposite. Sam is running from something. Very fast. In a very nice suit.', ['running']),
  B('The second Sam has a good career, and one business that failed completely.', ['failed'], ob=['oferta', 'carimbo2:TRIED ANYWAY'], cb=6),
  B('It hurt. It did not change who Sam was.', ['hurt'], bb=pen('I FAILED.', "I'M STILL ME.", d=['STILL'])),
  N('Look at the count at the top. Risks taken. The first Sam only takes bets that can\'t be lost.', ['risks'], conta=1, cb=7)]},
 {'id': 'c5b', 'cena': 'estudo', 'idade': 30, 'est': CU, 'falas': [
  F('And the first Sam isn\'t alone. A study of more than forty-one thousand college students tracked perfectionism from nineteen eighty-nine to twenty sixteen.', ['perfectionism'], dir={'k': 'num', 'n': 41641, 'rot': 'COLLEGE STUDENTS · 1989 TO 2016'}),
  F('All three kinds went up. Including the kind where you believe other people will only accept you if you\'re perfect.', ['perfect'], dir={'k': 'itens', 'cab': ['Rising for 27 years:'], 'n': 3, 'auto': 1, 'it': ['Demanding perfection of yourself', 'Demanding it of others', 'Feeling others demand it of you']}, rod='ALL THREE WENT UP.')]},

 {'id': 'c6', 'cena': 'duo', 'idade': 45, 'et': 'Age 45: The same car', 'cap': 'THE SAME CAR', 'falas': [
  F('Forty-five. Both Sams are driving a six-year-old home from a soccer game. Four to nothing.', ['four', 'nothing'], ca=1, cb=7, oa=['nota:0-4'], ob=['nota:0-4']),
  A('The first Sam grips the wheel and says nothing.', ['nothing'], ba=SIL),
  A('This is the hardest scene in the video. Because as a kid in that back seat, Sam swore to never do this.', ['swore']),
  A('Sam isn\'t angry at the kid. Sam is scared for the kid. Because in Sam\'s world, losing costs you love.', ['scared'], fa={'triste': 1}),
  B('The second Sam looks in the mirror and says the family sentence.', ['family', 'sentence'], bb=ICE),
  N('Three generations in, the pattern holds. Unless someone notices it.', ['notices'], big={'e': 'HANDED DOWN', 'd': 'HANDED DOWN', 'tam': 96})]},
 {'id': 'cta2', 'cena': 'texto', 'falas': [
  F('If you know who sat in that car with you, send them this. A brother. A sister. A teammate.', ['send'], big={'e': 'SEND THIS', 'd': 'TO THEM', 'tam': 110}, sub='THEY WERE IN THE CAR TOO', icone='share')]},

 {'id': 'c7', 'cena': 'duo', 'idade': 60, 'et': 'Age 60: The shelf', 'cap': 'THE SHELF', 'falas': [
  A('Sixty. The first Sam has a shelf full of trophies. And a question Sam has never been able to answer.', ['trophies'], ca=1, cb=8, oa=['lista'], ba=pen('WHO WOULD LOVE ME', 'IF I STOPPED?', d=['STOPPED'])),
  A('So Sam doesn\'t stop. At sixty. Still earning it.', ['earning'], fa={'triste': 1}),
  A('The trophies aren\'t fake. Sam earned every one. But a trophy can\'t call you on a Tuesday.', ['tuesday'], ba=None),
  B('The second Sam has fewer trophies. And kids who call when they win.', ['call'], bb=bal('DAD, I', 'GOT IT!', d=['GOT'])),
  B('And kids who call when they lose. Sam counts that second kind as the real prize.', ['lose'], bb=bal('DAD, I', 'MESSED UP.', d=['MESSED'])),
  N('One Sam earned love for sixty years. The other one just had it.', ['earned', 'had'], big={'e': 'EARNED', 'd': 'GIVEN', 'tam': 140})]},

 {'id': 'vida', 'cena': 'vida', 'et': 'The whole life, side by side', 'falas': [
  F("Here's the whole life, side by side.", ['side'], n=0),
  F('Six. A silent ride home. "Ice cream?"', [], n=1),
  F('Sixteen. Quits what Sam might lose. Bombs, and tries again.', [], n=2),
  F('Thirty. Winning, and never enough. Fails, and keeps going.', [], n=3),
  F('Sixty. "Am I enough?" Kids who call when they lose.', ['lose'], n=4)]},
 {'id': 'honesto', 'cena': 'honesto', 'et': 'The honest part', 'falas': [
  F('Now, the honest part. Because high standards are not the problem.', ['standards'], n=0),
  F('Conditional love did get results. The kids performed. That\'s exactly why parents do it.', ['results'], n=1),
  F('And it gets passed down. Which means the parent in that silent car was probably a kid in a silent car once.', ['passed', 'down'], n=1, x=1),
  F('A second study pointed the same way. But both rely on what people report about their own families.', ['report'], n=2, x=1),
  F('Nobody measured the love directly. They measured how it felt. Which may be the part that matters.', ['felt'], n=3, x=1),
  F('Being proud when your kid wins is not a crime. Every parent lights up.', ['proud']),
  F('And love with high standards exists. You can expect a lot from a kid, and still be warm on the day they fall short.', ['warm'], rod='HIGH STANDARDS. WARM ANYWAY.'),
  F('The only question is what happens to the warmth on the day they lose.', ['lose'], rod='WHAT HAPPENS ON THE DAY THEY LOSE?')]},
 {'id': 'trocas', 'cena': 'trocas', 'et': "It's never too late", 'falas': [
  F('And the pattern can stop with you. At any age.', ['stop'], n=0, tit=1),
  F('Three swaps, for the next ride home.', ['three', 'swaps'], n=0, tit=None),
  F('Instead of "so proud you won," try "I love watching you play."', ['watching'], n=1),
  F('Instead of "what happened," try "rough one. I\'m here."', ['here'], n=2),
  F('And instead of silence, try the two-word version. "Ice cream?"', ['ice', 'cream'], n=3),
  F('And if you were loved for winning, here\'s a sentence nobody gave you. You were enough before the score.', ['enough'], n=3, yet=1)]},
 {'id': 'fim1', 'cena': 'duo', 'idade': 6, 'gap': 0.2, 'falas': [F('Same kid. Same score. Two different rides home.', ['rides'], oa=['nota:0-4'], ob=['nota:0-4'], ba=SIL, bb=ICE)]},
 {'id': 'fim2', 'cena': 'fim', 'falas': [
  F('Next time, same kid again, two new homes.', ['new', 'homes'], n=1),
  F("Subscribe so you don't miss it. I'll see you in the next childhood.", ['subscribe'], n=2)]},
 ])}

for k, v in V.items():
    os.makedirs(f'public/tc/v{k}', exist_ok=True)
    json.dump(v, open(f'public/tc/v{k}/roteiro.json', 'w'), indent=1, ensure_ascii=False)
    print(k, v['cfg']['id'], len(v['blocos']), 'blocos', sum(len(b['falas']) for b in v['blocos']), 'falas', sum(len(f['txt'].split()) for b in v['blocos'] for f in b['falas']), 'palavras')

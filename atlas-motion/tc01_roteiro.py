# Two Childhoods #01: roteiro com o que aparece na tela em cada fala. Gera public/tc/v01/roteiro.json
# v acumula dentro do bloco (chave com None apaga). Chaves do `duo`: ba/bb (balões), foco, ca/cb (contagem), oa/ob (objetos), fa/fb (criança), big.
import json
def F(txt, dest=(), p=0, **v): return {'txt': txt, 'v': v, 'dest': list(dest), 'p': p}
SMART = {'t': ["YOU'RE SO", 'SMART!'], 'q': 'p', 'd': ['SMART']}
HARD = {'t': ['YOU WORKED', 'HARD ON THIS!'], 'q': 'p', 'd': ['WORKED', 'HARD']}
MD = {'tag': 'THE STUDY', 'titulo': ['Praise for Intelligence', 'Can Undermine', "Children's Motivation", 'and Performance'], 'meta': ['Mueller & Dweck · 1998', 'Journal of Personality and Social Psychology', '128 fifth graders · Study 1 of 6']}
ZH = {'tag': 'THE STUDY', 'titulo': ['Praising Young Children', 'for Being Smart', 'Promotes Cheating'], 'meta': ['Zhao, Heyman, Chen & Lee · 2017', 'Psychological Science', '300 preschoolers, ages 3 and 5']}
R = [
 {'id': 'gancho1', 'cena': 'duo', 'idade': 6, 'et': 'Same kid, two homes', 'gap': 0.1, 'falas': [
  F('Two kids bring home the same perfect score.', ['perfect'], oa=['nota:10'], ob=['nota:10']),
  F('One hears, "You\'re so smart."', ['smart'], ba=SMART, foco='a'),
  F('The other hears, "You worked hard on this."', ['worked', 'hard'], bb=HARD, foco='b'),
  F('Same kid. Same score. One different sentence.', ['sentence'], foco=None)]},
 {'id': 'gancho2', 'cena': 'duo', 'idade': 60, 'gap': 0.1, 'falas': [
  F('Fifty years later, one of them is still learning new things.', ['learning'], foco='b', ob=['violao'], cb=10, ca=2),
  F('And the other is still afraid of being found out.', ['afraid'], foco='a', ba={'t': ['WHAT IF THEY', 'FIND OUT?'], 'q': 'k', 'pensa': 1, 'd': ['FIND', 'OUT']})]},
 {'id': 'gancho3', 'cena': 'texto', 'falas': [
  F('This is the whole life, side by side.', ['whole', 'life'], big={'e': 'THE WHOLE LIFE,', 'd': 'SIDE BY SIDE', 'tam': 78}, linha=0),
  F("And somewhere in the middle, there's a real experiment that shows the exact moment the two paths split.", ['real', 'experiment'], linha=10, sub='ONE REAL EXPERIMENT · 128 KIDS')]},

 {'id': 'c1', 'cena': 'duo', 'idade': 6, 'et': 'Age 6: The sentence', 'cap': {'n': 'ONE', 'tit': 'THE SENTENCE'}, 'pre': 2.3, 'falas': [
  F('Meet Sam. Sam is six.', ['sam'], oa=['nota:10'], ob=['nota:10'], fa={'pula': 1}, fb={'pula': 1}),
  F('In the first home, every good grade gets the same answer. "You\'re so smart."', ['smart'], foco='a', ba=SMART, fa=None, fb=None),
  F('It feels great. Sam glows.', ['glows'], fa={'pula': 1, 'brilho': 1}),
  F('In the second home, Sam hears something slightly different. "You worked hard on this. Show me how you did it."', ['worked', 'hard'], foco='b', bb={'t': ['YOU WORKED HARD.', 'SHOW ME HOW!'], 'q': 'p', 'd': ['WORKED', 'HARD']}, fa=None),
  F('That also feels great.', ['great'], fb={'pula': 1, 'brilho': 1}),
  F("Right now, you can't tell these two kids apart.", ['apart'], foco=None, ba=None, bb=None, fb=None),
  F('But each of them just learned what a good grade means.', ['means']),
  F('In the first home, it means: I am smart.', ['smart'], foco='a', ba={'t': ['I AM SMART.'], 'q': 'k', 'pensa': 1, 'd': ['SMART']}),
  F('In the second home, it means: I did something that worked.', ['worked'], foco='b', bb={'t': ['I DID SOMETHING', 'THAT WORKED.'], 'q': 'k', 'pensa': 1, 'd': ['WORKED']}),
  F('One of those is a label. The other is a recipe.', ['label', 'recipe'], foco=None, big={'e': 'A LABEL', 'd': 'A RECIPE', 'tam': 120}),
  F('And labels have to be protected.', ['protected'], big={'e': 'A LABEL', 'd': 'A RECIPE', 'tam': 120, 'al': 1}),
  F('A week later, there are two puzzles on the table. An easy one, and a hard one.', ['two', 'puzzles'], big=None, oa=['puzzles'], ob=['puzzles']),
  F("One Sam reaches for the hard one. The other reaches for the one that's already solved.", ['already', 'solved'], oa=['puzzles', 'pega:facil'], ob=['puzzles', 'pega:dificil'], ba={'t': ['THE EASY ONE.'], 'q': 'k', 'pensa': 1}, bb={'t': ['THE HARD ONE!'], 'q': 'k', 'pensa': 1})]},

 {'id': 'c2', 'cena': 'estudo', 'idade': 10, 'et': 'Age 10: The experiment', 'cap': {'n': 'TWO', 'tit': 'THE EXPERIMENT'}, 'pre': 2.3, 'est': MD, 'falas': [
  F('Now Sam is ten. And this next part is not a story.', ['not', 'story'], dir={'k': 'selo', 't': ['NOT A STORY.', 'A REAL', 'EXPERIMENT.']}),
  F('In nineteen ninety-eight, two psychologists at Columbia University, Claudia Mueller and Carol Dweck, ran this moment on real kids.', ['real', 'kids'], dir={'k': 'nomes', 't': ['Claudia Mueller', 'Carol Dweck'], 's': 'COLUMBIA UNIVERSITY · 1998'}),
  F('One hundred and twenty-eight fifth graders. Each one got a set of puzzles, easy enough to do well.', ['fifth', 'graders'], dir={'k': 'num', 'n': 128, 'rot': 'FIFTH GRADERS'}),
  F('Then each kid heard one sentence.', ['one', 'sentence'], dir={'k': 'frases', 'n': 0}),
  F('Some heard, "You must be smart at these problems."', ['smart'], dir={'k': 'frases', 'n': 1}),
  F('Others heard, "You must have worked hard at these problems."', ['worked', 'hard'], dir={'k': 'frases', 'n': 2}),
  F('Then came a choice. An easy task that would make them look smart. Or a harder one they could learn from.', ['choice'], dir={'k': 'escolha'}),
  F('Of the kids called smart, sixty-seven percent picked the task that made them look smart.', ['sixty-seven', 'percent'], dir={'k': 'rows', 'cab': ['What they picked next:'], 'n': 1, 'rows': [['TOLD “SMART” · PICKED LOOKING SMART', 8, 12, '67%', 'coral'], ['TOLD “WORKED HARD” · PICKED LEARNING', 11, 12, '92%', 'mar']]}),
  F('Of the kids praised for working hard, ninety-two percent picked the one they could learn from.', ['ninety-two', 'percent'], dir={'k': 'rows', 'cab': ['What they picked next:'], 'n': 2, 'rows': [['TOLD “SMART” · PICKED LOOKING SMART', 8, 12, '67%', 'coral'], ['TOLD “WORKED HARD” · PICKED LEARNING', 11, 12, '92%', 'mar']]}),
  F('One sentence. That was the only difference.', ['only', 'difference'], rod='ONE SENTENCE. THE ONLY DIFFERENCE.'),
  F('Then the researchers gave everyone problems that were much too hard. Everybody struggled.', ['too', 'hard'], rod=None, dir={'k': 'itens', 'cab': ['Then: problems much too hard.'], 'n': 0, 'it': ['Enjoyed it less', 'Gave up sooner', '“I\'m just not good at this.”']}),
  F('The "smart" kids enjoyed it less, gave up sooner, and decided they just weren\'t good at this.', ['gave', 'up'], dir={'k': 'itens', 'cab': ['Then: problems much too hard.', 'The kids called “smart”:'], 'n': 3, 'auto': 1, 'it': ['Enjoyed it less', 'Gave up sooner', '“I\'m just not good at this.”']}),
  F('And when they went back to easy problems, they did worse than before. The hard-work group did better.', ['worse', 'better'], dir={'k': 'setas', 'cab': ['Back to easy problems:']}),
  F('Then came the strangest part.', ['strangest'], dir={'k': 'selo', 't': ['THE STRANGEST', 'PART.']}),
  F('The kids were asked to write down their score for students at another school. No one would ever check.', ['no', 'one', 'check'], dir={'k': 'rows', 'cab': ['Report your own score.', 'No one will check.'], 'n': 0, 'rows': [['TOLD “WORKED HARD” · LIED ABOUT THE SCORE', 3, 24, '13%', 'mar'], ['TOLD “SMART” · LIED ABOUT THE SCORE', 9, 24, '38%', 'coral']]}),
  F('Thirteen percent of the hard-work group lied about their score.', ['thirteen', 'percent'], dir={'k': 'rows', 'cab': ['Report your own score.', 'No one will check.'], 'n': 1, 'rows': [['TOLD “WORKED HARD” · LIED ABOUT THE SCORE', 3, 24, '13%', 'mar'], ['TOLD “SMART” · LIED ABOUT THE SCORE', 9, 24, '38%', 'coral']]}),
  F('In the "smart" group, it was thirty-eight percent.', ['thirty-eight', 'percent'], dir={'k': 'rows', 'cab': ['Report your own score.', 'No one will check.'], 'n': 2, 'rows': [['TOLD “WORKED HARD” · LIED ABOUT THE SCORE', 3, 24, '13%', 'mar'], ['TOLD “SMART” · LIED ABOUT THE SCORE', 9, 24, '38%', 'coral']]}),
  F("They weren't bad kids. They were protecting a label.", ['protecting', 'label'], rod='NOT BAD KIDS. PROTECTING A LABEL.')]},

 {'id': 'c3', 'cena': 'duo', 'idade': 16, 'et': 'Age 16: The first hard class', 'cap': {'n': 'THREE', 'tit': 'THE FIRST HARD CLASS'}, 'pre': 2.3, 'falas': [
  F("Sixteen. From here on, we're back to the story.", ['story'], ca=0, cb=0),
  F('No study has followed two kids like this for fifty years. But watch how the same pattern plays out.', ['pattern'], nota='STORY FROM HERE · NOT DATA'),
  F('Both Sams sign up for the hardest math class in school. And for the first time, both of them fail a test.', ['fail'], nota=None, oa=['nota:F'], ob=['nota:F'], ca=1, cb=1, fa={'triste': 1}, fb={'triste': 1}),
  F("In the first home, Sam does the math nobody taught. If I were smart, this would be easy. It's not easy. So maybe I'm not.", ['maybe', "i'm", 'not'], foco='a', ba={'t': ['IF I WERE SMART,', 'THIS WOULD BE EASY.'], 'q': 'k', 'pensa': 1, 'd': ['SMART']}),
  F('Sam drops the class. And tells everyone it was boring.', ['drops'], ba={'t': ['IT WAS BORING.'], 'q': 'k'}, oa=['nota:F', 'carimbo:DROPPED']),
  F('In the second home, Sam is just as upset. But the question is different. What did I do wrong?', ['wrong'], foco='b', bb={'t': ['WHAT DID I', 'DO WRONG?'], 'q': 'k', 'pensa': 1, 'd': ['WRONG']}),
  F('Sam stays. Gets a C. Then a B.', ['stays'], ob=['nota:B', 'carimbo2:STAYED'], cb=2, bb=None, fb=None),
  F("By the way, the pressure to protect that label starts earlier than you'd think.", ['earlier'], foco=None, ba=None)]},
 {'id': 'c3b', 'cena': 'estudo', 'idade': 16, 'est': ZH, 'falas': [
  F('In twenty seventeen, researchers played a guessing game with three hundred preschoolers. Some were told, "You are so smart." Then the adult left the room.', ['left', 'room'], dir={'k': 'num', 'n': 300, 'rot': 'PRESCHOOLERS · A GUESSING GAME'}),
  F('About sixty percent of the "smart" kids peeked at the answer. In the other groups, it was about forty.', ['sixty', 'percent'], dir={'k': 'rows', 'cab': ['Peeked at the answer:'], 'n': 2, 'rows': [['TOLD “YOU ARE SO SMART”', 7, 12, '~60%', 'coral'], ['OTHER GROUPS', 5, 12, '~40%', 'mar']]}),
  F('Some of them were three years old.', ['three', 'years', 'old'], rod='SOME OF THEM WERE THREE YEARS OLD.')]},
 {'id': 'cta1', 'cena': 'texto', 'falas': [
  F('Quick question before we keep going. Which sentence did you hear growing up?', ['which', 'sentence'], big={'e': 'WHICH ONE', 'd': 'DID YOU HEAR?', 'tam': 96}),
  F('Comment "smart" or "worked hard". I read these, and I want to know which home you grew up in.', ['comment'], chips=['“smart”', '“worked hard”'], sub='COMMENT BELOW')]},

 {'id': 'c35', 'cena': 'duo', 'idade': 22, 'et': 'Age 22: The first rejection', 'cap': {'n': 'FOUR', 'tit': 'THE FIRST REJECTION'}, 'pre': 2.3, 'falas': [
  F('Twenty-two. Both Sams apply for the job they actually want. And both get the same email. We regret to inform you.', ['regret'], ca=2, cb=3, oa=['email', 'carimbo:REJECTED'], ob=['email', 'carimbo:REJECTED'], fa={'triste': 1}, fb={'triste': 1}),
  F("For the first Sam, that email isn't about one application. It's a verdict.", ['verdict'], foco='a', ba={'t': ["THEY SAW I'M", 'NOT THAT GOOD.'], 'q': 'k', 'pensa': 1, 'd': ['NOT']}),
  F('So Sam stops applying for things that could say no. And takes the job that was always going to say yes.', ['say', 'yes'], ba=None, oa=['email', 'carimbo:SAFE CHOICE']),
  F('The second Sam hates that email just as much. Then writes back. Is there anything I could have done better?', ['better'], foco='b', bb={'t': ['WHAT COULD I', 'DO BETTER?'], 'q': 'k', 'd': ['BETTER']}),
  F('Six months later, Sam applies again. And gets in.', ['gets', 'in'], bb=None, ob=['email', 'carimbo2:HIRED'], cb=4, fb=None),
  F('Same rejection. One Sam read it as who I am. The other read it as what I did.', ['who', 'what'], foco=None, big={'e': 'WHO I AM', 'd': 'WHAT I DID', 'tam': 110})]},

 {'id': 'c4', 'cena': 'duo', 'idade': 30, 'et': 'Age 30: The safe job', 'cap': {'n': 'FIVE', 'tit': 'THE SAFE JOB'}, 'pre': 2.3, 'falas': [
  F('Thirty. Both Sams are good at their jobs. Honestly, the first Sam might be better. Careful. Never makes a mistake.', ['careful'], ca=2, cb=5),
  F('Then a bigger role opens up. New team, new skills, a real chance of failing in front of people.', ['bigger', 'role'], oa=['oferta'], ob=['oferta']),
  F('In the first Sam, an old voice wakes up. What if this is the one that proves I was never that smart?', ['never', 'smart'], foco='a', ba={'t': ["WHAT IF I'M NOT", 'SMART ENOUGH?'], 'q': 'k', 'pensa': 1, 'd': ['NOT']}, fa={'triste': 1}),
  F("Sam turns it down. Says the timing isn't right.", ['turns', 'down'], oa=['oferta', 'carimbo:TURNED DOWN']),
  F("The second Sam is scared too. But scared sounds different in this head. I don't know how to do this yet.", ['yet'], foco='b', bb={'t': ["I DON'T KNOW HOW", 'TO DO THIS. YET.'], 'q': 'k', 'pensa': 1, 'd': ['YET']}),
  F('Yet. One small word.', ['yet'], big={'e': '', 'd': 'YET.', 'tam': 200}),
  F('Sam takes the job. The first year is rough. The second year is not.', ['takes'], big=None, ob=['oferta', 'carimbo2:ACCEPTED'], cb=6, bb=None),
  F('Look at the count at the top of the screen. Hard things tried.', ['hard', 'things', 'tried'], foco=None, ba=None, cb=8, conta=1),
  F("It's not that one Sam is braver. One of them just never had anything to lose by trying.", ['nothing', 'lose', 'trying'], conta=None)]},

 {'id': 'c5', 'cena': 'duo', 'idade': 45, 'et': 'Age 45: The sentence comes back', 'cap': {'n': 'SIX', 'tit': 'THE SENTENCE COMES BACK'}, 'pre': 2.3, 'falas': [
  F('Forty-five. Now both Sams have a kid of their own. And one evening, that kid walks in with a perfect score.', ['perfect', 'score'], oa=['nota:10'], ob=['nota:10'], ca=2, cb=9),
  F('The first Sam smiles and says the most loving thing they know. "You\'re so smart."', ['smart'], foco='a', ba=SMART),
  F("It's not a mistake. It's a gift. It's the exact gift Sam was given.", ['gift']),
  F('The second Sam says, "You worked hard on this. Show me how you did it."', ['worked', 'hard'], foco='b', bb={'t': ['YOU WORKED HARD.', 'SHOW ME HOW!'], 'q': 'p', 'd': ['WORKED', 'HARD']}),
  F('And the sentence starts its second lifetime.', ['second', 'lifetime'], foco=None, big={'e': 'SECOND', 'd': 'LIFETIME', 'tam': 120})]},
 {'id': 'cta2', 'cena': 'texto', 'falas': [
  F("If someone raised you on one of these sentences, or you're raising someone right now, send them this video. It's an easier conversation with pictures.", ['send'], big={'e': 'SEND THIS', 'd': 'TO THEM', 'tam': 110}, sub='AN EASIER CONVERSATION WITH PICTURES', icone='share')]},

 {'id': 'c6', 'cena': 'duo', 'idade': 60, 'et': "Age 60: Who's still learning", 'cap': {'n': 'SEVEN', 'tit': "WHO'S STILL LEARNING"}, 'pre': 2.3, 'falas': [
  F('Sixty. The second Sam is taking guitar lessons. And is terrible at it. And goes back every Tuesday.', ['guitar'], foco='b', ob=['violao', 'notas'], ca=2, cb=10),
  F("The first Sam has had a good life. A real one. But there's a short list of things Sam never tried. A language. A business. A hard conversation.", ['never', 'tried'], foco='a', oa=['lista']),
  F("Not because Sam couldn't. Because Sam might not have been great at it. And being great was the whole identity.", ['identity'], fa={'triste': 1}),
  F('Fifty years of protecting a compliment.', ['compliment'], foco=None, big={'e': '50 YEARS.', 'd': 'ONE COMPLIMENT.', 'tam': 74})]},

 {'id': 'vida', 'cena': 'vida', 'et': 'The whole life, side by side', 'falas': [
  F("Here's the whole life, side by side.", ['side'], n=0),
  F('Six. "You\'re so smart." "You worked hard."', [], n=1),
  F('Sixteen. Drops the hard class. Fails, and signs up again.', [], n=2),
  F("Thirty. Stays where it's safe. Takes the harder job.", [], n=3),
  F('Sixty. Still wonders. Still learning.', ['learning'], n=4)]},

 {'id': 'honesto', 'cena': 'honesto', 'et': 'The honest part', 'falas': [
  F('Now, the honest part. Because a sentence is not a spell.', ['not', 'spell'], n=0),
  F("When researchers filmed fifty-three families at home, the toddlers who heard more praise for effort were, five years later, more likely to believe they could get better at things. That's real.", ['real'], n=1),
  F("But in that same study, being praised as a person didn't predict the opposite. The damage wasn't automatic.", ['automatic'], n=1, x=1),
  F("And in twenty nineteen, a team in Edinburgh repeated the original experiment with over six hundred children. They didn't find the effect.", ["didn't", 'find'], n=2, x=1),
  F('Even Carol Dweck has said they may have put too much emphasis on sheer effort. Telling a kid "good try" when nothing is being learned is just a nicer empty sentence.', ['empty'], n=3, x=1),
  F('So this isn\'t about banning a word. Saying "you\'re smart" once won\'t break anyone.', ['once'], rod="ONE “YOU'RE SMART” WON'T BREAK ANYONE."),
  F("It's about what a kid hears a thousand times, and what they come to believe a failure says about them.", ['thousand', 'times'], rod='IT IS WHAT A KID HEARS A THOUSAND TIMES.')]},

 {'id': 'trocas', 'cena': 'trocas', 'et': "It's never too late", 'falas': [
  F("And here's the good news. That belief is not locked in at six. Or at sixty.", ['good', 'news'], n=0, tit=1),
  F("If you're raising a kid, try three swaps.", ['three', 'swaps'], n=0, tit=None),
  F('Instead of "you\'re so smart," try "show me how you did that."', ['show'], n=1),
  F('Instead of "you\'re a natural," try "that took practice."', ['practice'], n=2),
  F('And when they fail, instead of "it\'s okay, you\'re still smart," try "what would you try differently?"', ['differently'], n=3),
  F('And if you were the "smart" kid, you can say it to yourself. I don\'t know how to do this. Yet.', ['yet'], n=3, yet=1)]},

 {'id': 'fim1', 'cena': 'duo', 'idade': 6, 'gap': 0.2, 'falas': [
  F('Same kid. Same score. One different sentence.', ['sentence'], oa=['nota:10'], ob=['nota:10'], ba=SMART, bb=HARD)]},
 {'id': 'fim2', 'cena': 'fim', 'falas': [
  F('Next time, same kid again, two new homes. One raised by fear. One raised by respect.', ['fear', 'respect'], n=1),
  F("Subscribe so you don't miss it. I'll see you in the next childhood.", ['subscribe'], n=2)]},
]
json.dump(R, open('public/tc/v01/roteiro.json', 'w'), indent=1, ensure_ascii=False)
print(len(R), 'blocos', sum(len(b['falas']) for b in R), 'falas', sum(len(f['txt'].split()) for b in R for f in b['falas']), 'palavras')

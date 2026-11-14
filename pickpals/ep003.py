SCRIPT = [
    ('hook', 'b', 'Blue... plus yellow?', 0.2),
    ('q', 'n', 'What color will it make?', 0.25),
    ('opts', 'n', 'Green, purple, or orange?', 0.3),
    ('tap', 'n', 'Pick one!', 0.15),
    ('c3', 'n', 'Three!', 0.4), ('c2', 'n', 'Two!', 0.4), ('c1', 'n', 'One!', 0.3),
    ('ans', 'n', 'Green! Blue and yellow make green!', 0.2),
    ('yay', 'b', 'Whoa! Color magic!', 0.4),
    ('r2', 'n', 'Now, red plus yellow?', 0.2),
    ('cnt2', 'n', 'Three, two, one!', 0.2),
    ('ans2', 'n', 'Orange!', 0.3),
    ('why', 'k', 'Mixing colors makes new colors!', 0.2),
    ('got', 'b', 'I love colors!', 0.35),
    ('next', 'n', 'Next: will it sink or float? Ready?', 0.5),
]
def FX(b):
    t = lambda k, d=0.0: b[k]['t0'] + d
    return [(0.0, 'pop', .8), (t('hook', 0.2), 'boing', .6), (t('q') - .1, 'slam', .9), (t('opts'), 'pop', .7), (t('opts', 0.6), 'pop', .7), (t('opts', 1.2), 'pop', .7),
            (t('c3'), 'tick', 1), (t('c2'), 'tick', 1), (t('c1'), 'tick', 1.2), (t('ans') - .2, 'whoosh', .8), (t('ans') - .05, 'yes', 1), (t('ans'), 'sparkle', 1),
            (t('r2') - .1, 'pop2', .7), (t('cnt2'), 'tick', 1), (t('cnt2', 0.45), 'tick', 1), (t('cnt2', 0.9), 'tick', 1.2), (t('ans2') - .15, 'whoosh', .8), (t('ans2') - .05, 'yes', 1), (t('ans2'), 'sparkle', 1),
            (t('why') - .1, 'boing', .5), (t('got'), 'pop2', .6), (t('next') - .1, 'whoosh', .7), (t('next', 1.4), 'boing', .7)]
def SILENCIO(b): return [(b['c3']['t0'] - .2, b['ans']['t0'] - .1), (b['cnt2']['t0'] - .1, b['ans2']['t0'] - .1)]

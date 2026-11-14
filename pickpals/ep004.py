SCRIPT = [
    ('hook', 'b', 'Splash! Will it sink?', 0.2),
    ('q', 'n', 'Sink or float? You decide!', 0.3),
    ('o1', 'n', 'A rubber duck!', 0.2), ('k1', 'n', 'Three, two, one!', 0.15), ('r1', 'n', 'Float!', 0.45),
    ('o2', 'n', 'A big rock!', 0.2), ('k2', 'n', 'Three, two, one!', 0.15), ('r2', 'n', 'Sink!', 0.45),
    ('o3', 'n', 'An apple!', 0.2), ('k3', 'n', 'Three, two, one!', 0.15), ('r3', 'n', 'Float! Surprise!', 0.3),
    ('got', 'b', 'Apples float? Cool!', 0.2),
    ('why', 'k', 'Apples have air inside, so they float!', 0.3),
    ('next', 'n', 'Next: something sneaky on your hands. Ready?', 0.5),
]
def FX(b):
    t = lambda k, d=0.0: b[k]['t0'] + d
    out = [(0.0, 'pop', .8), (t('hook', 0.1), 'boing', .6), (t('q') - .1, 'slam', .9)]
    for i in '123':
        out += [(t('o' + i) - .1, 'pop2', .7), (t('k' + i), 'tick', 1), (t('k' + i, .45), 'tick', 1), (t('k' + i, .9), 'tick', 1.2), (t('r' + i) - .25, 'whoosh', .8), (t('r' + i) - .05, 'yes' if i != '2' else 'slam', .8)]
    out += [(t('got'), 'sparkle', .8), (t('why') - .1, 'boing', .5), (t('next') - .1, 'whoosh', .7), (t('next', 1.6), 'boing', .7)]
    return out
def SILENCIO(b): return [(b['k' + i]['t0'] - .05, b['r' + i]['t0'] - .05) for i in '123']

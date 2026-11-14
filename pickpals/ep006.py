SCRIPT = [
    ('hook', 'b', 'Mmm! Cookies in the kitchen!', 0.15),
    ('stop', 'n', 'Wait!', 0.3),
    ('q', 'n', 'Can you find three dangers?', 0.25),
    ('go', 'n', 'Look closely!', 2.6),
    ('f1', 'n', 'One! The hot stove!', 0.3),
    ('f2', 'n', 'Two! The sharp knife!', 0.3),
    ('f3', 'n', 'Three! Cleaning bottles!', 0.35),
    ('why', 'k', 'In the kitchen, always ask a grown-up!', 0.25),
    ('got', 'b', 'Kitchen safety star!', 0.35),
    ('next', 'n', "Next: who's at the door? Ready?", 0.5),
]
def FX(b):
    t = lambda k, d=0.0: b[k]['t0'] + d
    out = [(0.0, 'pop', .8), (t('hook', 0.3), 'boing', .5), (t('stop') - .05, 'slam', 1.1), (t('q'), 'whoosh', .7)]
    out += [(t('go', 0.6 + i * 0.5), 'tick', 1 if i < 4 else 1.2) for i in range(5)]
    for k in ('f1', 'f2', 'f3'): out += [(t(k) - .05, 'ding', .7), (t(k), 'pop2', .7)]
    out += [(t('why') - .1, 'boing', .5), (t('got'), 'sparkle', 1), (t('next') - .1, 'whoosh', .7), (t('next', 1.3), 'boing', .7)]
    return out
def SILENCIO(b): return [(b['go']['t1'] + .1, b['f1']['t0'] - .1)]

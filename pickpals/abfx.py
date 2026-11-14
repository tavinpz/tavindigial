def ab_fx(b, right='B', act_fx='munch'):
    t = lambda k, d=0.0: b[k]['t0'] + d
    good, bad = ('a', 'b') if right == 'A' else ('b', 'a')
    return [
        (0.0, 'pop', .8), (t('yum', 0.9), 'scratch', 1.1), (t('stop') - 0.05, 'slam', 1.1),
        (t('q'), 'whoosh', .7), (t('what') - 0.1, 'pop2', .8),
        (t('a') - 0.1, 'whoosh', .7), (t(bad, 0.8), act_fx, .9),
        (t('b') - 0.1, 'whoosh', .7), (t(good, 1.4), 'ding', .5),
        (t('tap') - .05, 'pop', .7),
        (t('c3'), 'tick', 1), (t('c2'), 'tick', 1), (t('c1'), 'tick', 1.2),
        (t('ans') - 0.12, 'yes', 1), (t('ans') - 0.05, 'sparkle', 1), (t('ans', 0.25), 'no', .4),
        (t('why') - 0.12, 'boing', .6), (t('rule', 0.2), 'ding', .45),
        (t('got'), 'pop2', .6), (t('next') - 0.1, 'whoosh', .7), (t('next', 1.3), 'boing', .7),
    ]


def ab_sil(b):
    return [(b['stop']['t0'] - 0.05, b['stop']['t1'] + 0.2), (b['c3']['t0'] - 0.2, b['ans']['t0'] - 0.1)]


def ab_script(yum, q, a, b, right, why, rule, got, nxt):
    return [
        ('yum', 'b', yum, 0.05), ('stop', 'n', 'STOP!', 0.35), ('q', 'n', q, 0.4), ('what', 'n', 'What should Bo do?', 0.3),
        ('a', 'n', a, 1.5), ('b', 'n', b, 1.6), ('tap', 'n', 'Tap the right one!', 0.2),
        ('c3', 'n', 'Three!', 0.4), ('c2', 'n', 'Two!', 0.4), ('c1', 'n', 'One!', 0.3),
        ('ans', 'n', f'{right}! You got it!', 0.15), ('yay', 'b', 'Yay!', 0.35),
        ('why', 'k', why, 0.2), ('rule', 'k', rule, 0.25), ('got', 'b', got, 0.35), ('next', 'n', nxt, 0.5),
    ]

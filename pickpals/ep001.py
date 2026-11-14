"""Pick Pals #001: Medicine or candy?"""
SCRIPT = [
    ('hook', 'n', 'Bo found these on the table!', 0.15),
    ('bo1', 'b', 'Ooh! Candy?', 0.35),
    ('q', 'n', 'Which one is right?', 0.5),
    ('a', 'n', 'A. Eat them!', 1.6),
    ('b', 'n', 'Or B. Ask a grown-up first!', 1.7),
    ('point', 'n', 'Point to the right one!', 0.25),
    ('c3', 'n', 'Three!', 0.45),
    ('c2', 'n', 'Two!', 0.45),
    ('c1', 'n', 'One!', 0.35),
    ('ans', 'n', 'B! Great job!', 0.7),
    ('why', 'k', 'Medicine is NOT candy!', 0.25),
    ('rule', 'k', 'Only a grown-up can give you medicine.', 0.6),
    ('next', 'n', 'Ready for the next one?', 0.4),
]


def FX(b):
    t = lambda k, d=0.0: b[k]['t0'] + d
    return [
        (0.05, 'pop', 1), (0.35, 'boing', .8),
        (t('bo1'), 'pop2', .7),
        (t('q') - 0.12, 'slam', 1), (t('q'), 'whoosh', .8),
        (t('a') - 0.1, 'pop', .8), (t('a', 0.9), 'munch', .9),
        (t('b') - 0.1, 'pop', .8), (t('b', 1.6), 'ding', .6),
        (t('point') - .05, 'whoosh', .7),
        (t('c3'), 'tick', 1), (t('c2'), 'tick', 1), (t('c1'), 'tick', 1.2),
        (t('ans') - 0.12, 'yes', 1), (t('ans') - 0.05, 'sparkle', 1), (t('ans', 0.2), 'no', .45),
        (t('why') - 0.1, 'pop', .8), (t('rule', 0.1), 'ding', .5),
        (t('next') - 0.1, 'whoosh', .7), (t('next', 0.9), 'boing', .7),
    ]


def SILENCIO(b):
    return [(b['c3']['t0'] - 0.2, b['ans']['t0'] - 0.1)]

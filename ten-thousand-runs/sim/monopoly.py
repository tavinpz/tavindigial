"""Monopoly simulator for Ten Thousand Runs video 001.

Standard US board, Chance/Community Chest decks (16 cards each, shuffled), doubles, three-doubles-to-jail,
jail (try doubles up to 3 turns, then pay $50), houses/hotels with even building, mortgages when short of cash,
bankruptcy. No auctions, no trades (each experiment controls ownership instead).

Experiments (seeded, reproducible):
  landing    -> probability of ending a turn on each square (long run)
  roi        -> rent per $ invested for every color set at 0-5 houses (uses landing odds)
  tournament -> 10,000 4-player games; each player starts owning one full color set (4 distinct sets per game,
                rotated), everything else is bought when landed on. Measures win rate per starting set.
"""
import json, random, sys
from collections import Counter, defaultdict

SQ = [
    ('GO', 'go'), ('Mediterranean Ave', 'brown'), ('Community Chest', 'cc'), ('Baltic Ave', 'brown'), ('Income Tax', 'tax'),
    ('Reading Railroad', 'rr'), ('Oriental Ave', 'lightblue'), ('Chance', 'ch'), ('Vermont Ave', 'lightblue'), ('Connecticut Ave', 'lightblue'),
    ('Jail', 'jail'), ('St. Charles Place', 'pink'), ('Electric Company', 'util'), ('States Ave', 'pink'), ('Virginia Ave', 'pink'),
    ('Pennsylvania Railroad', 'rr'), ('St. James Place', 'orange'), ('Community Chest', 'cc'), ('Tennessee Ave', 'orange'), ('New York Ave', 'orange'),
    ('Free Parking', 'free'), ('Kentucky Ave', 'red'), ('Chance', 'ch'), ('Indiana Ave', 'red'), ('Illinois Ave', 'red'),
    ('B&O Railroad', 'rr'), ('Atlantic Ave', 'yellow'), ('Ventnor Ave', 'yellow'), ('Water Works', 'util'), ('Marvin Gardens', 'yellow'),
    ('Go To Jail', 'gtj'), ('Pacific Ave', 'green'), ('North Carolina Ave', 'green'), ('Community Chest', 'cc'), ('Pennsylvania Ave', 'green'),
    ('Short Line', 'rr'), ('Chance', 'ch'), ('Park Place', 'darkblue'), ('Luxury Tax', 'tax'), ('Boardwalk', 'darkblue'),
]
# price, house cost, rents [base, 1h, 2h, 3h, 4h, hotel]
STREET = {
    1: (60, 50, [2, 10, 30, 90, 160, 250]), 3: (60, 50, [4, 20, 60, 180, 320, 450]),
    6: (100, 50, [6, 30, 90, 270, 400, 550]), 8: (100, 50, [6, 30, 90, 270, 400, 550]), 9: (120, 50, [8, 40, 100, 300, 450, 600]),
    11: (140, 100, [10, 50, 150, 450, 625, 750]), 13: (140, 100, [10, 50, 150, 450, 625, 750]), 14: (160, 100, [12, 60, 180, 500, 700, 900]),
    16: (180, 100, [14, 70, 200, 550, 750, 950]), 18: (180, 100, [14, 70, 200, 550, 750, 950]), 19: (200, 100, [16, 80, 220, 600, 800, 1000]),
    21: (220, 150, [18, 90, 250, 700, 875, 1050]), 23: (220, 150, [18, 90, 250, 700, 875, 1050]), 24: (240, 150, [20, 100, 300, 750, 925, 1100]),
    26: (260, 150, [22, 110, 330, 800, 975, 1150]), 27: (260, 150, [22, 110, 330, 800, 975, 1150]), 29: (280, 150, [24, 120, 360, 850, 1025, 1200]),
    31: (300, 200, [26, 130, 390, 900, 1100, 1275]), 32: (300, 200, [26, 130, 390, 900, 1100, 1275]), 34: (320, 200, [28, 150, 450, 1000, 1200, 1400]),
    37: (350, 200, [35, 175, 500, 1100, 1300, 1500]), 39: (400, 200, [50, 200, 600, 1400, 1700, 2000]),
}
RR = [5, 15, 25, 35]
UT = [12, 28]
COLORS = ['brown', 'lightblue', 'pink', 'orange', 'red', 'yellow', 'green', 'darkblue']
GROUP = {c: [i for i, s in enumerate(SQ) if s[1] == c] for c in COLORS + ['rr', 'util']}
PRICE = {**{i: v[0] for i, v in STREET.items()}, **{i: 200 for i in RR}, **{i: 150 for i in UT}}
CHANCE = ['go', 'boardwalk', 'illinois', 'stcharles', 'rr', 'rr', 'util', 'p50', 'goojf', 'back3', 'jail', 'repairs', 'f15', 'reading', 'chair', 'p150']
CHEST = ['go', 'p200', 'f50', 'p50', 'goojf', 'jail', 'p100', 'p20', 'bday', 'p100', 'f100', 'f50', 'p25', 'repairs2', 'p10', 'p100']


def roll(rng):
    a, b = rng.randint(1, 6), rng.randint(1, 6)
    return a + b, a == b


class Game:
    def __init__(self, rng, n=4, start_sets=None, max_turns=1000):
        self.rng = rng
        self.n = n
        self.pos = [0] * n
        self.cash = [1500] * n
        self.alive = [True] * n
        self.jail = [0] * n  # turns spent in jail (0 = free)
        self.goojf = [0] * n
        self.owner = {}
        self.houses = defaultdict(int)
        self.mort = set()
        self.max_turns = max_turns
        self.land = Counter()
        self.decks = {'ch': CHANCE[:], 'cc': CHEST[:]}
        for d in self.decks.values():
            rng.shuffle(d)
        self.rent_paid = Counter()  # by color group of the square
        self.pure = False
        self.bank_h, self.bank_ho = 32, 12
        self.jail_policy = ['roll'] * n  # roll | pay | smart
        self.hotel_policy = ['hotel'] * n  # hotel | four
        if start_sets:
            for p, color in enumerate(start_sets):
                for sq in GROUP[color]:
                    self.owner[sq] = p

    # ---------- ownership helpers ----------
    def group_of(self, sq):
        return SQ[sq][1]

    def owns_set(self, p, color):
        return all(self.owner.get(s) == p for s in GROUP[color])

    def rent(self, sq, dice):
        o = self.owner[sq]
        if sq in self.mort:
            return 0
        g = self.group_of(sq)
        if g == 'rr':
            k = sum(1 for s in RR if self.owner.get(s) == o and s not in self.mort)
            return 25 * 2 ** (k - 1)
        if g == 'util':
            k = sum(1 for s in UT if self.owner.get(s) == o and s not in self.mort)
            return dice * (10 if k == 2 else 4)
        h = self.houses[sq]
        base = STREET[sq][2][h]
        if h == 0 and self.owns_set(o, g):
            base *= 2
        return base

    def net_worth(self, p):
        w = self.cash[p]
        for sq, o in self.owner.items():
            if o == p:
                w += (PRICE[sq] // 2 if sq in self.mort else PRICE[sq]) + (self.houses[sq] * STREET[sq][1] if sq in STREET else 0)
        return w

    # ---------- money ----------
    def raise_cash(self, p, need):
        """sell houses (half price, evenly), then mortgage; returns True if cash >= need"""
        while self.cash[p] < need:
            built = [s for s, o in self.owner.items() if o == p and self.houses[s] > 0]
            if built:
                s = max(built, key=lambda x: (self.houses[x], x))
                if self.houses[s] == 5:
                    self.bank_ho += 1; self.bank_h -= min(4, self.bank_h)
                else:
                    self.bank_h += 1
                self.houses[s] -= 1
                self.cash[p] += STREET[s][1] // 2
                continue
            free = [s for s, o in self.owner.items() if o == p and s not in self.mort]
            if not free:
                return False
            s = min(free, key=lambda x: (self.owns_set(p, self.group_of(x)) if self.group_of(x) in COLORS else 0, PRICE[x]))
            self.mort.add(s)
            self.cash[p] += PRICE[s] // 2
        return True

    def pay(self, p, amt, to=None):
        if self.cash[p] < amt and not self.raise_cash(p, amt):
            # bankrupt: everything goes to creditor (or bank)
            val = self.cash[p]
            if to is not None:
                self.cash[to] += val
            for s in [s for s, o in self.owner.items() if o == p]:
                h = self.houses[s]
                if h == 5: self.bank_ho += 1
                else: self.bank_h += h
                self.houses[s] = 0
                if to is None:
                    del self.owner[s]
                    self.mort.discard(s)
                else:
                    self.owner[s] = to
            self.cash[p] = 0
            self.alive[p] = False
            return False
        self.cash[p] -= amt
        if to is not None:
            self.cash[to] += amt
        return True

    # ---------- building ----------
    def build(self, p):
        reserve = 150
        changed = True
        while changed:
            changed = False
            for color in COLORS:
                if not self.owns_set(p, color) or any(s in self.mort for s in GROUP[color]):
                    continue
                cost = STREET[GROUP[color][0]][1]
                sqs = sorted(GROUP[color], key=lambda s: self.houses[s])
                s = sqs[0]
                teto = 4 if self.hotel_policy[p] == 'four' else 5
                if self.houses[s] < teto and self.cash[p] - cost >= reserve:
                    if self.houses[s] == 4:
                        if self.bank_ho == 0:
                            continue
                        self.bank_ho -= 1; self.bank_h += 4
                    else:
                        if self.bank_h == 0:
                            continue
                        self.bank_h -= 1
                    self.houses[s] += 1
                    self.cash[p] -= cost
                    changed = True
        # unmortgage if rich
        for s in sorted([s for s, o in self.owner.items() if o == p and s in self.mort], key=lambda x: -PRICE[x]):
            c = int(PRICE[s] / 2 * 1.1)
            if self.cash[p] - c > 400:
                self.cash[p] -= c
                self.mort.discard(s)

    # ---------- movement ----------
    def move_to(self, p, dest, collect=True):
        if collect and dest < self.pos[p]:
            self.cash[p] += 200
        self.pos[p] = dest

    def card(self, p, deck, dice):
        d = self.decks[deck]
        c = d.pop(0)
        if c != 'goojf':
            d.append(c)
        if c == 'go':
            self.move_to(p, 0)
        elif c == 'boardwalk':
            self.move_to(p, 39)
        elif c == 'illinois':
            self.move_to(p, 24)
        elif c == 'stcharles':
            self.move_to(p, 11)
        elif c == 'reading':
            self.move_to(p, 5)
        elif c == 'rr':
            nxt = min([r for r in RR if r > self.pos[p]] or [RR[0]])
            self.move_to(p, nxt)
            return 'rr2'
        elif c == 'util':
            nxt = min([u for u in UT if u > self.pos[p]] or [UT[0]])
            self.move_to(p, nxt)
            return 'util10'
        elif c == 'back3':
            self.pos[p] = (self.pos[p] - 3) % 40
        elif c == 'jail':
            self.to_jail(p)
            return 'jail'
        elif c == 'goojf':
            self.goojf[p] += 1
            self.decks[deck + '_out'] = self.decks.get(deck + '_out', 0) + 1
        elif c.startswith('p'):
            self.cash[p] += int(c[1:])
        elif c.startswith('f'):
            self.pay(p, int(c[1:]))
        elif c == 'chair':
            for q in range(self.n):
                if q != p and self.alive[q] and self.alive[p]:
                    self.pay(p, 50, q)
        elif c == 'bday':
            for q in range(self.n):
                if q != p and self.alive[q]:
                    self.pay(q, 10, p)
        elif c in ('repairs', 'repairs2'):
            per_h, per_ho = (25, 100) if c == 'repairs' else (40, 115)
            tot = sum((per_ho if self.houses[s] == 5 else per_h * self.houses[s]) for s, o in self.owner.items() if o == p)
            if tot:
                self.pay(p, tot)
        return None

    def to_jail(self, p):
        self.pos[p] = 10
        self.jail[p] = 1

    def land_on(self, p, dice, mod=None):
        sq = self.pos[p]
        g = self.group_of(sq)
        if g == 'gtj':
            self.land[30] += 1
            self.to_jail(p)
            return
        if g in ('ch', 'cc'):
            r = self.card(p, g, dice)
            if r == 'jail' or self.pos[p] == sq:
                return
            return self.land_on(p, dice, r)
        if g == 'tax':
            self.pay(p, 200 if sq == 4 else 100)
            return
        if sq in PRICE and not self.pure:
            o = self.owner.get(sq)
            if o is None:
                if self.cash[p] - PRICE[sq] >= 0:
                    self.owner[sq] = p
                    self.cash[p] -= PRICE[sq]
            elif o != p:
                if mod == 'rr2':
                    r = self.rent(sq, dice) * 2
                elif mod == 'util10':
                    r = roll(self.rng)[0] * 10 if sq not in self.mort else 0
                else:
                    r = self.rent(sq, dice)
                if r:
                    self.rent_paid[g] += r
                    self.pay(p, r, o)

    def turn(self, p):
        doubles = 0
        while True:
            dice, dbl = roll(self.rng)
            if self.jail[p]:
                pol = self.jail_policy[p]
                if pol == 'smart':
                    perigo = any(self.houses[x] > 0 for x, o in self.owner.items() if o != p)
                    pol = 'roll' if perigo else 'pay'
                if self.goojf[p]:
                    self.goojf[p] -= 1
                    self.decks['ch'].append('goojf')
                    self.jail[p] = 0
                elif pol == 'pay' and self.jail[p] == 1:
                    if not self.pay(p, 50):
                        return
                    self.jail[p] = 0
                elif dbl:
                    self.jail[p] = 0
                    dbl = False  # leaving jail on doubles does not give another roll
                elif self.jail[p] >= 3:
                    if not self.pay(p, 50):
                        return
                    self.jail[p] = 0
                else:
                    self.jail[p] += 1
                    self.land[10] += 1
                    return
            elif dbl:
                doubles += 1
                if doubles == 3:
                    self.to_jail(p)
                    self.land[10] += 1
                    return
            self.move_to(p, (self.pos[p] + dice) % 40)
            self.land_on(p, dice)
            if not self.alive[p]:
                return
            if self.jail[p]:
                self.land[10] += 1
                return
            self.land[self.pos[p]] += 1
            self.build(p)
            if not dbl:
                return

    def play(self):
        t = 0
        while sum(self.alive) > 1 and t < self.max_turns:
            for p in range(self.n):
                if self.alive[p] and sum(self.alive) > 1:
                    self.turn(p)
            t += 1
        alive = [p for p in range(self.n) if self.alive[p]]
        if len(alive) == 1:
            return alive[0], t, False
        return max(alive, key=self.net_worth), t, True


def landing(games=10000, seed=1):
    rng = random.Random(seed)
    tot = Counter()
    for _ in range(games):
        g = Game(rng, n=4, max_turns=60)
        g.pure = True  # pure movement, no buying
        g.cash = [10 ** 9] * 4
        g.play()
        tot.update(g.land)
    s = sum(tot.values())
    return {i: tot[i] / s for i in range(40)}


def roi(prob):
    out = {}
    for color in COLORS:
        sqs = GROUP[color]
        cost_land = sum(STREET[s][0] for s in sqs)
        hc = STREET[sqs[0]][1]
        rows = []
        for h in range(6):
            invest = cost_land + hc * h * len(sqs)
            # expected rent per opponent-turn from one opponent (rent doubles at 0 houses with set)
            er = sum(prob[s] * (STREET[s][2][h] * (2 if h == 0 else 1)) for s in sqs)
            rows.append({'houses': h, 'invest': invest, 'rent_per_turn': er, 'per_1000': er / invest * 1000,
                         'turns_to_break_even_3opp': invest / (er * 3) if er else None})
        out[color] = {'land_prob': sum(prob[s] for s in sqs), 'rows': rows}
    return out


def tournament(games=10000, seed=7):
    rng = random.Random(seed)
    wins, played, turns = Counter(), Counter(), []
    timeouts = 0
    for k in range(games):
        sets = rng.sample(COLORS, 4)
        g = Game(rng, n=4, start_sets=sets)
        w, t, to = g.play()
        timeouts += to
        turns.append(t)
        for c in sets:
            played[c] += 1
        wins[sets[w]] += 1
    rate = {c: wins[c] / played[c] for c in COLORS}
    turns.sort()
    return {'win_rate': rate, 'played': dict(played), 'wins': dict(wins), 'median_rounds': turns[len(turns) // 2], 'timeouts': timeouts}


if __name__ == '__main__':
    out = {}
    prob = landing()
    out['landing'] = {SQ[i][0] + f' #{i}': round(prob[i] * 100, 3) for i in range(40)}
    out['landing_raw'] = prob
    out['roi'] = roi(prob)
    out['tournament'] = tournament(int(sys.argv[1]) if len(sys.argv) > 1 else 10000)
    json.dump(out, open('/home/claude/ten-thousand-runs/sim/resultado.json', 'w'), indent=1)
    print(json.dumps({k: out[k] for k in ('landing', 'tournament')}, indent=1))
    for c, v in out['roi'].items():
        print(c, round(v['land_prob'] * 100, 2), [round(r['per_1000'], 2) for r in v['rows']])


def duels(per_pair=1000, seed=11):
    """2-player games: each player starts with one full set; head-to-head win rate matrix"""
    rng = random.Random(seed)
    m = {}
    for i, a in enumerate(COLORS):
        for b in COLORS[i + 1:]:
            wa = 0
            for k in range(per_pair):
                sets = [a, b] if k % 2 == 0 else [b, a]
                g = Game(rng, n=2, start_sets=sets)
                w, _, _ = g.play()
                wa += sets[w] == a
            m[f'{a}|{b}'] = wa / per_pair
    return m


def rails_vs(games=2000, seed=13):
    """4-player games: one player starts with all 4 railroads, the others with random color sets"""
    rng = random.Random(seed)
    wins = 0
    for _ in range(games):
        sets = rng.sample(COLORS, 3)
        g = Game(rng, n=4, start_sets=[None] + sets) if False else Game(rng, n=4)
        for s in RR:
            g.owner[s] = 0
        for p, c in enumerate(sets, start=1):
            for s in GROUP[c]:
                g.owner[s] = p
        w, _, _ = g.play()
        wins += w == 0
    return wins / games


def policy_test(kind, value, games=10000, seed=21):
    """player 0 uses a policy, the other 3 default; random distinct starting sets; returns player-0 win rate"""
    rng = random.Random(seed)
    wins = 0
    for k in range(games):
        sets = rng.sample(COLORS, 4)
        g = Game(rng, n=4, start_sets=sets)
        getattr(g, kind)[0] = value
        w, _, _ = g.play()
        wins += w == 0
    return wins / games

"""Gera os spec.json dos vídeos 011–020 (temas em alta, out/2026) com pedidos de interação no meio e no fim.
Fatos e fontes: pesquisa de 29/10/2026 (fichas com URL abertas). Rodar: python3 motor/specs_011_020.py"""
import json, os

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
V = []

def video(pasta, arquivo, titulo, falas, cenas):
    assert len(falas) == len(cenas), pasta
    V.append((pasta, {"arquivo": arquivo, "titulo": titulo, "falas": falas, "cenas": cenas, "voz": "am_michael", "velocidade": 1.08}))

# ---------------------------------------------------------------- 011 Hormuz
video("011-hormuz", "concrete_atlas_short_011_hormuz.mp4", "A Fifth of the World's Oil Goes Through This Gap", [
    "One fifth of the world's oil sails through this one channel, and in 2026 it almost stopped.",
    "The Strait of Hormuz is only about 33 kilometers wide. Tankers squeeze into two lanes, each about 3 kilometers wide.",
    "In 2024, 20 million barrels of oil went through it every single day.",
    "Quick, comment your guess before I tell you: how much of that could pipelines carry around the strait?",
    "Less than a quarter. Saudi Arabia and the UAE have pipelines that skip it, but only a few million barrels a day of spare room.",
    "So when traffic collapsed in 2026, oil shot past 100 dollars a barrel.",
    "33 kilometers of water, and the whole world's fuel bill depends on it.",
    "Follow for more places that run the world, and tell me which chokepoint we should map next.",
], [
    {"tipo": "mapa", "bbox": [54.5, 58.0, 24.8, 27.6], "titulo": "Strait of Hormuz", "sub": "Iran and Oman", "gancho": "20% OF THE\nWORLD'S OIL",
     "pins": [[56.27, 27.18, "Bandar Abbas", "r"], [56.25, 26.18, "Khasab", "l"]],
     "rota": [[52.6, 26.7], [55.2, 26.45], [56.4, 26.55], [56.9, 26.0], [57.8, 25.2]], "cor_rota": "amber", "largura_rota": 14},
    {"tipo": "mapa", "bbox": [55.6, 57.3, 25.7, 27.1], "titulo": "About 33 km wide", "sub": "two lanes, about 3 km each", "numero": "33 KM", "cor": "amber",
     "rotas": [[[55.7, 26.55], [56.35, 26.62], [56.75, 26.35], [57.1, 25.95]], [[55.7, 26.42], [56.35, 26.48], [56.68, 26.22], [57.0, 25.85]]], "largura_rota": 10},
    {"tipo": "numero", "valor": 20, "sufixo": "M", "label": "barrels of oil a day", "nota": "2024, about a fifth of world use (EIA)", "cor": "amber", "lembrete": "for more places that run the world"},
    {"tipo": "palpite", "pergunta": "How much can pipelines carry around it?", "opcoes": ["Almost all of it", "About half", "Less than a quarter"], "certa": 2, "revelar": True},
    {"tipo": "mapa", "bbox": [36.0, 60.0, 20.0, 30.0], "titulo": "The bypass pipelines", "sub": "Saudi Arabia and the UAE",
     "rotas": [[[49.68, 25.94], [46.7, 24.7], [42.0, 24.4], [38.06, 24.09]], [[53.6, 23.83], [55.3, 24.4], [56.33, 25.12]]], "cor_rota": "amber", "largura_rota": 12,
     "pins": [[38.06, 24.09, "Yanbu", "l"], [56.33, 25.12, "Fujairah", "r"]]},
    {"tipo": "numero", "valor": 100, "prefixo": "$", "sufixo": "+", "label": "per barrel", "nota": "Brent crude, March 2026", "cor": "red"},
    {"tipo": "mapa", "bbox": [44.0, 64.0, 18.0, 32.0], "titulo": "One narrow gap", "numero": "33 KM", "cor": "amber", "escuro": 0.15,
     "pins": [[56.4, 26.5, "Hormuz", "r"]]},
    {"tipo": "cta", "pergunta": "Which chokepoint should we map next?"},
])

# ---------------------------------------------------------------- 012 Jeddah Tower
video("012-jeddah-tower", "concrete_atlas_short_012_jeddah_tower.mp4", "This Tower Isn't Even Halfway Up Yet", [
    "This tower is already one of the 15 tallest buildings on Earth, and it's not even halfway up.",
    "Guess how tall it will be when it's finished. Comment your answer before I tell you.",
    "Over 1,000 meters. The Jeddah Tower should beat the Burj Khalifa by about 180 meters.",
    "Work started in 2013, stopped in 2018 around floor 63, and only restarted in 2025.",
    "Now it's racing up: from 400 meters in April to about 470 meters by October.",
    "That's roughly one new floor every five or six days, with 118 floors done so far.",
    "If it's finished in late 2028, the world's tallest building won't be in Dubai anymore.",
    "Follow so you see it pass the Burj Khalifa, and tell me: would you live on floor 150?",
], [
    {"tipo": "mapa", "bbox": [38.95, 39.35, 21.40, 21.85], "titulo": "Jeddah Tower", "sub": "Jeddah, Saudi Arabia", "gancho": "NOT EVEN\nHALFWAY UP",
     "globo": [21.734, 39.0829], "pins": [[39.0829, 21.734, "Jeddah Tower", "r"], [39.1728, 21.5433, "Jeddah", "l"]]},
    {"tipo": "palpite", "pergunta": "How tall when it's finished?", "opcoes": ["828 meters", "Over 1,000 meters", "1,600 meters"], "certa": 1, "revelar": True},
    {"tipo": "altura", "titulo": "Over 1 km", "sub": "planned height", "itens": [["Eiffel Tower", 330, False, "trelica"], ["Burj Khalifa", 828, False, "agulha"], ["Jeddah Tower", 1000, True, "agulha"]], "unidade": "m"},
    {"tipo": "linha", "titulo": "Stop and start", "eventos": [[2013, "Construction starts"], [2018, "Work stops\naround floor 63"], [2025, "Work restarts"]]},
    {"tipo": "barras", "titulo": "Height built in 2026", "itens": [["April", 400, False], ["August", 430, False], ["October", 474, True]], "unidade": " m", "lembrete": "to watch it pass the Burj Khalifa"},
    {"tipo": "numero", "valor": 118, "label": "floors built", "nota": "about 1 floor every 5 to 6 days", "cor": "amber"},
    {"tipo": "mapa", "bbox": [30.0, 60.0, 15.0, 32.0], "titulo": "Tallest in the world", "sub": "expected late 2028", "numero": "LATE 2028", "cor": "amber",
     "pins": [[39.0829, 21.734, "Jeddah", "l"], [55.27, 25.20, "Dubai", "r"]]},
    {"tipo": "cta", "pergunta": "Would you live on floor 150?"},
])

# ---------------------------------------------------------------- 013 Meta Hyperion
video("013-meta-hyperion", "concrete_atlas_short_013_meta_hyperion.mp4", "A $50 Billion AI Data Center in a Town of 2,000", [
    "A farm town of under 2,000 people is getting one of the biggest AI data centers ever built.",
    "It's Meta's Hyperion campus in Louisiana, and Meta says it will cost more than 50 billion dollars.",
    "Guess how much power it's designed to use. Comment before I say it.",
    "Up to 5 gigawatts, with nearly 10 million square feet of buildings.",
    "Zuckerberg says one campus like this covers a significant part of the footprint of Manhattan.",
    "To feed it, the local utility is building 10 new gas power plants.",
    "And at the peak of construction, 7,500 people will be working on it.",
    "Follow for the megaprojects behind AI, and tell me: would you want one of these next to your town?",
], [
    {"tipo": "mapa", "bbox": [-92.30, -91.30, 32.20, 32.80], "titulo": "Richland Parish, Louisiana", "sub": "Holly Ridge, under 2,000 people", "gancho": "THE $50 BILLION\nFARM TOWN",
     "globo": [32.4771, -91.6323], "pins": [[-91.6323, 32.4771, "Hyperion", "r"], [-92.1183, 32.5094, "Monroe", "l"]]},
    {"tipo": "numero", "valor": 50, "prefixo": "$", "sufixo": "B+", "label": "investment", "nota": "Meta and Louisiana, July 2026", "cor": "amber"},
    {"tipo": "palpite", "pergunta": "How much power is it built for?", "opcoes": ["50 megawatts", "500 megawatts", "5 gigawatts"], "certa": 2, "revelar": True},
    {"tipo": "numero", "valor": 5, "sufixo": " GW", "label": "of computing power", "nota": "the target, over several years", "cor": "water",
     "segundo": {"valor": 10, "sufixo": "M sq ft", "label": "of buildings", "cor": "amber"}},
    {"tipo": "mapa", "bbox": [-74.05, -73.90, 40.68, 40.88], "titulo": "Manhattan", "sub": "\"a significant part of the footprint\"", "pins": [[-74.0059, 40.7127, "Manhattan", "r"]], "lembrete": "for the megaprojects behind AI"},
    {"tipo": "numero", "valor": 10, "label": "new gas power plants", "nota": "being built by the local utility, Entergy", "cor": "red"},
    {"tipo": "numero", "valor": 7500, "label": "construction workers", "nota": "at the peak", "cor": "amber"},
    {"tipo": "cta", "pergunta": "Would you want one next to your town?"},
])

# ---------------------------------------------------------------- 014 Medog
video("014-medog-dam", "concrete_atlas_short_014_medog_dam.mp4", "China's Next Dam Is 3 Times the Three Gorges", [
    "China is turning a river that falls 2,000 meters into the biggest power project on Earth.",
    "At the Great Bend in Tibet, the Yarlung Tsangpo drops about 2,000 meters in just 50 kilometers.",
    "The plan is five power stations in a row, for about 1.2 trillion yuan, or 167 billion dollars.",
    "Comment your guess: how much power is it planned for, compared with the Three Gorges Dam?",
    "About 60 gigawatts in planning reports, close to three times the Three Gorges.",
    "Downstream, the river becomes the Brahmaputra and flows into India and Bangladesh, and both are worried.",
    "Construction started in July 2025, and it could take around a decade.",
    "Follow for a new megaproject every day. Smart move or risky one? Tell me below.",
], [
    {"tipo": "mapa", "bbox": [93.8, 96.2, 28.6, 30.1], "titulo": "Yarlung Tsangpo", "sub": "Medog, Tibet", "gancho": "BIGGER THAN\nTHREE GORGES",
     "globo": [29.46, 95.36], "pins": [[95.3633, 29.4603, "Medog", "r"], [94.3614, 29.6488, "Nyingchi", "l"]]},
    {"tipo": "perfil", "titulo": "A 2,000 m drop", "sub": "in about 50 km", "yrange": [600, 3600],
     "agua": [[0, 3140], [0.1, 2990], [0.3, 2640], [0.5, 2140], [0.7, 1540], [0.9, 1040], [1, 940]],
     "terreno": [[0, 3100], [0.1, 2950], [0.3, 2600], [0.5, 2100], [0.7, 1500], [0.9, 1000], [1, 900]], "cor_terreno": [92, 84, 70],
     "cotas": [[0.93, 950, 2950, "2,000 m"]], "rotulos": [[0.5, 2600, "50 km"]]},
    {"tipo": "numero", "valor": 167, "prefixo": "$", "sufixo": "B", "label": "estimated cost", "nota": "about 1.2 trillion yuan, five stations", "cor": "amber", "lembrete": "for a new megaproject every day"},
    {"tipo": "palpite", "pergunta": "How much power vs. Three Gorges?", "opcoes": ["The same", "Twice", "About three times"], "certa": 2, "revelar": True},
    {"tipo": "barras", "titulo": "Power capacity", "itens": [["Three Gorges", 22.5, False], ["Medog (planned)", 60, True]], "unidade": " GW", "decimais": 1},
    {"tipo": "mapa", "bbox": [88.0, 96.5, 23.5, 30.5], "titulo": "Downstream", "sub": "India and Bangladesh",
     "rota": [[95.36, 29.46], [95.02, 29.13], [94.9, 28.3], [95.3, 27.9], [94.5, 27.4], [93.0, 26.8], [91.74, 26.14], [90.5, 25.6], [89.7, 25.0], [89.8, 24.0]],
     "pins": [[91.74, 26.14, "Guwahati", "l"], [90.41, 23.81, "Dhaka", "l"]]},
    {"tipo": "linha", "titulo": "A decade-long build", "eventos": [[2025, "Construction starts"], [2033, "Possible finish\n(estimate)"]]},
    {"tipo": "cta", "pergunta": "Smart move or risky one?"},
])

# ---------------------------------------------------------------- 015 Messina
video("015-messina-bridge", "concrete_atlas_short_015_messina_bridge.mp4", "Italy Approved This Bridge, Then Blocked It", [
    "Italy approved the world's longest suspension bridge. Then its own auditors blocked it.",
    "Its main span would be 3,300 meters, about 60 percent longer than today's record in Turkey.",
    "Its towers would stand 399 meters tall, higher than the Eiffel Tower.",
    "This is earthquake country. Guess what magnitude it's designed to survive, and comment it.",
    "Magnitude 7.8. And the price tag is about 13.5 billion euros.",
    "It was approved in August 2025, blocked by the Court of Auditors that October, and restarted by a new decree in 2026.",
    "As of October 2026, not one tower has been built.",
    "Follow to see if it ever happens. Will this bridge be built, yes or no?",
], [
    {"tipo": "mapa", "bbox": [15.30, 16.00, 37.90, 38.50], "titulo": "Strait of Messina", "sub": "Sicily to mainland Italy", "gancho": "APPROVED,\nTHEN BLOCKED",
     "globo": [38.2475, 15.6392], "pins": [[15.55, 38.19, "Messina", "l"], [15.64, 38.22, "Villa San Giovanni", "r"]],
     "rota": [[15.615, 38.262], [15.668, 38.234]], "cor_rota": "amber", "largura_rota": 14},
    {"tipo": "barras", "titulo": "Longest suspension spans", "itens": [["Çanakkale 1915, Turkey", 2023, False], ["Messina (planned)", 3300, True]], "unidade": " m"},
    {"tipo": "altura", "titulo": "399 m towers", "itens": [["Eiffel Tower", 330, False, "trelica"], ["Messina tower", 399, True, "bloco"]], "unidade": "m"},
    {"tipo": "palpite", "pergunta": "What earthquake is it built for?", "opcoes": ["Magnitude 6.0", "Magnitude 7.0", "Magnitude 7.8"], "certa": 2, "revelar": True},
    {"tipo": "numero", "valor": 13.5, "decimais": 1, "prefixo": "€", "sufixo": "B", "label": "estimated cost", "cor": "amber", "lembrete": "to see if it ever happens"},
    {"tipo": "linha", "titulo": "Approved, blocked, restarted", "eventos": [[2025, "Approved, then\nblocked"], [2026, "Restarted by\nnew decree"]]},
    {"tipo": "mapa", "bbox": [15.55, 15.75, 38.18, 38.30], "titulo": "October 2026", "sub": "construction not started", "numero": "0 TOWERS", "cor": "red",
     "rota": [[15.615, 38.262], [15.668, 38.234]], "cor_rota": "red", "largura_rota": 10},
    {"tipo": "cta", "pergunta": "Will it be built? Yes or no?"},
])

# ---------------------------------------------------------------- 016 Huajiang
video("016-huajiang-bridge", "concrete_atlas_short_016_huajiang_bridge.mp4", "The World's Highest Bridge: 625 m Above the River", [
    "This bridge puts you 625 meters above the river. No bridge on Earth is higher.",
    "How many Eiffel Towers could stand under it? Comment your guess.",
    "Almost two. 625 meters, from the river to the road.",
    "It beat China's own previous record, the Duge Bridge, at 565 meters.",
    "The main span is 1,420 meters long, and the whole bridge almost 2.9 kilometers.",
    "State media say it turns a two-hour drive around the canyon into about two minutes.",
    "And it's become an attraction, with about 3.3 million visits in its first year.",
    "Follow for a new megaproject every day. Would you bungee jump from it?",
], [
    {"tipo": "mapa", "bbox": [104.4, 106.9, 25.4, 26.9], "titulo": "Huajiang Grand Canyon Bridge", "sub": "Guizhou, China", "gancho": "625 M ABOVE\nTHE RIVER",
     "globo": [25.7047, 105.5881], "pins": [[105.5881, 25.7047, "Huajiang Bridge", "r"], [106.63, 26.647, "Guiyang", "l"], [104.6739, 26.3856, "Duge Bridge", "r"]]},
    {"tipo": "palpite", "pergunta": "How many Eiffel Towers fit under it?", "opcoes": ["One", "Almost two", "Three"], "certa": 1, "revelar": True},
    {"tipo": "altura", "titulo": "625 m", "sub": "river to road", "itens": [["Eiffel Tower", 330, False, "trelica"], ["Huajiang Bridge", 625, True, "ponte"]], "unidade": "m"},
    {"tipo": "barras", "titulo": "Highest bridges", "itens": [["Duge Bridge (2016)", 565, False], ["Huajiang (2025)", 625, True]], "unidade": " m", "lembrete": "for a new megaproject every day"},
    {"tipo": "numero", "valor": 1420, "sufixo": " m", "label": "main span", "nota": "total length 2,890 m", "cor": "amber"},
    {"tipo": "numero", "valor": 2, "sufixo": " MIN", "label": "to cross the canyon", "nota": "state media estimate, instead of about 2 hours", "cor": "water"},
    {"tipo": "numero", "valor": 3.3, "decimais": 1, "sufixo": "M", "label": "visits in year one", "nota": "Xinhua, October 2026", "cor": "amber"},
    {"tipo": "cta", "pergunta": "Would you bungee jump from it?"},
])

# ---------------------------------------------------------------- 017 The Line
video("017-the-line", "concrete_atlas_short_017_the_line.mp4", "The 170 km City That Stopped", [
    "Saudi Arabia planned a city 170 kilometers long, in a perfectly straight line. Here's what's left.",
    "It was meant to be two mirrored walls, 500 meters tall, in a strip just 200 meters wide.",
    "Home to 9 million people, with no cars and no streets.",
    "Comment your guess first: what did one internal estimate say the whole city would cost?",
    "A draft estimate reported by The Wall Street Journal said 8.8 trillion dollars.",
    "In May 2026, work was put on hold until after 2030, and in October its World Cup stadium was reportedly shelved.",
    "The first phase had already shrunk to about 2.5 kilometers, around 1.5 percent of the plan.",
    "Follow for a new megaproject every day. Dream project, or never going to happen?",
], [
    {"tipo": "mapa", "bbox": [34.4, 37.0, 27.4, 29.6], "titulo": "The Line, NEOM", "sub": "planned route, approximate", "gancho": "170 KM\nIN A STRAIGHT LINE",
     "globo": [28.10, 35.30], "rota": [[34.98, 27.98], [35.75, 28.27], [36.55, 28.56]], "cor_rota": "amber", "largura_rota": 12,
     "pins": [[36.5789, 28.3972, "Tabuk", "r"]]},
    {"tipo": "altura", "titulo": "500 m walls", "sub": "200 m wide", "itens": [["Eiffel Tower", 330, False, "trelica"], ["The Line", 500, True, "bloco"]], "unidade": "m"},
    {"tipo": "numero", "valor": 9, "sufixo": "M", "label": "planned residents", "nota": "no cars, no streets", "cor": "amber", "lembrete": "for a new megaproject every day"},
    {"tipo": "palpite", "pergunta": "What did one estimate say it costs?", "opcoes": ["$500 billion", "$1.5 trillion", "$8.8 trillion"], "certa": 2, "revelar": True},
    {"tipo": "numero", "valor": 8.8, "decimais": 1, "prefixo": "$", "sufixo": "T", "label": "reported estimate", "nota": "2023 draft, via The Wall Street Journal", "cor": "red"},
    {"tipo": "linha", "titulo": "From launch to pause", "eventos": [[2021, "Announced"], [2026, "On hold until\nafter 2030"]]},
    {"tipo": "barras", "titulo": "Length", "itens": [["Original plan", 170, False], ["First phase", 2.5, True]], "unidade": " km", "decimais": 1},
    {"tipo": "cta", "pergunta": "Dream project or never happening?"},
])

# ---------------------------------------------------------------- 018 Fehmarnbelt
video("018-fehmarnbelt", "concrete_atlas_short_018_fehmarnbelt.mp4", "They're Sinking 89 Giant Blocks Into the Sea", [
    "They're sinking 89 concrete blocks into the Baltic Sea, and each standard block weighs 73,500 tonnes.",
    "Together they'll form the Fehmarnbelt Tunnel, about 18 kilometers long, the longest immersed tunnel on Earth.",
    "Each block is cast on land, floated out, and lowered into a trench about 40 meters below the surface.",
    "How long will the train take to cross? Comment your guess before I tell you.",
    "Just 7 minutes, instead of 45 on the ferry today.",
    "Hamburg to Copenhagen by train drops from about 5 hours to about two and a half.",
    "The first block went down in May 2026, but problems with the lowering ship mean the opening is about two years late.",
    "Follow for a new megaproject every day. Bridge or tunnel, which would you build here?",
], [
    {"tipo": "mapa", "bbox": [9.5, 13.0, 53.3, 56.0], "titulo": "Fehmarnbelt", "sub": "Germany to Denmark", "gancho": "89 BLOCKS\nUNDER THE SEA",
     "globo": [54.5758, 11.3056], "pins": [[9.99, 53.55, "Hamburg", "r"], [12.57, 55.68, "Copenhagen", "l"]],
     "rota": [[11.22, 54.50], [11.35, 54.65]], "cor_rota": "amber", "largura_rota": 14},
    {"tipo": "numero", "valor": 18, "sufixo": " km", "label": "immersed tunnel", "nota": "the longest of its kind", "cor": "amber"},
    {"tipo": "perfil", "titulo": "Lowered into a trench", "sub": "about 40 m deep", "yrange": [-60, 12],
     "agua": [[0, 0], [1, 0]], "terreno": [[0, 3], [0.1, -10], [0.25, -30], [0.4, -40], [0.6, -40], [0.75, -30], [0.9, -10], [1, 3]],
     "tunel": [[0.05, 1], [0.15, -14], [0.3, -36], [0.7, -36], [0.85, -14], [0.95, 1]], "cotas": [[0.5, 0, -40, "40 m"]], "nivel_mar": 0,
     "rotulos": [[0.1, 8, "Germany"], [0.9, 8, "Denmark"]], "lembrete": "for a new megaproject every day"},
    {"tipo": "palpite", "pergunta": "How long will the train take?", "opcoes": ["7 minutes", "25 minutes", "45 minutes"], "certa": 0, "revelar": True},
    {"tipo": "barras", "titulo": "Crossing time", "itens": [["Ferry today", 45, False], ["Train in tunnel", 7, True]], "unidade": " min"},
    {"tipo": "numero", "valor": 2.5, "decimais": 1, "sufixo": " H", "label": "Hamburg to Copenhagen", "nota": "by train, from about 5 hours", "cor": "water"},
    {"tipo": "linha", "titulo": "Running late", "eventos": [[2020, "Production starts"], [2026, "First block\nlowered"]]},
    {"tipo": "cta", "pergunta": "Bridge or tunnel?"},
])

# ---------------------------------------------------------------- 019 Gibraltar
video("019-gibraltar-tunnel", "concrete_atlas_short_019_gibraltar_tunnel.mp4", "Europe and Africa Are Only 14 km Apart", [
    "Europe and Africa are only 14 kilometers apart. So why would the tunnel be almost three times longer?",
    "Because the strait is deep. Even at its shallowest point, the Camarinal Sill, the seabed is 280 meters down.",
    "The current design runs 42 kilometers, dipping to 475 meters below sea level.",
    "So when could it open? Comment your guess.",
    "Not before 2035 to 2040. Spain and Morocco set up study companies for it back in 1980.",
    "So far, the money goes to studies. Spain approved another 1.73 million euros in March 2026.",
    "No tunnel boring machine has been ordered. For now, the way across is still the ferry.",
    "Follow for a new megaproject every day. Would you take a train from Europe to Africa?",
], [
    {"tipo": "mapa", "bbox": [-6.40, -5.00, 35.60, 36.40], "titulo": "Strait of Gibraltar", "sub": "Spain to Morocco", "gancho": "EUROPE TO AFRICA:\n14 KM",
     "globo": [35.95, -5.50], "pins": [[-5.60, 36.01, "Tarifa", "r"], [-5.83, 35.76, "Tangier", "l"]], "numero": "14 KM", "cor": "amber"},
    {"tipo": "perfil", "titulo": "Deeper than it looks", "sub": "Camarinal Sill: 280 m", "yrange": [-950, 120],
     "agua": [[0, 0], [1, 0]], "terreno": [[0, 60], [0.12, -120], [0.3, -260], [0.42, -280], [0.55, -420], [0.75, -800], [0.88, -500], [1, 60]], "cor_terreno": [80, 74, 62],
     "cotas": [[0.42, 0, -280, "280 m"]], "nivel_mar": 0, "rotulos": [[0.08, 90, "Spain"], [0.92, 90, "Morocco"]]},
    {"tipo": "numero", "valor": 42, "sufixo": " km", "label": "tunnel route", "nota": "27.7 km under the sea", "cor": "amber",
     "segundo": {"valor": 475, "sufixo": " m", "label": "below sea level at its deepest", "cor": "water"}},
    {"tipo": "palpite", "pergunta": "When could it open?", "opcoes": ["2030 World Cup", "2035 to 2040", "Never"], "certa": 1, "revelar": True},
    {"tipo": "linha", "titulo": "A very long study", "eventos": [[1980, "Study companies\ncreated"], [2003, "Tunnel agreement"], [2026, "Seabed surveys"]], "lembrete": "for a new megaproject every day"},
    {"tipo": "numero", "valor": 1.73, "decimais": 2, "prefixo": "€", "sufixo": "M", "label": "more for studies", "nota": "Spain, March 2026", "cor": "amber"},
    {"tipo": "mapa", "bbox": [-6.40, -5.00, 35.60, 36.40], "titulo": "For now: the ferry", "rota": [[-5.60, 36.01], [-5.70, 35.90], [-5.81, 35.79]], "cor_rota": "water", "largura_rota": 12,
     "pins": [[-5.60, 36.01, "Tarifa", "r"], [-5.83, 35.76, "Tangier", "l"]]},
    {"tipo": "cta", "pergunta": "Would you take a train to Africa?"},
])

# ---------------------------------------------------------------- 020 GERD
video("020-gerd", "concrete_atlas_short_020_gerd.mp4", "Africa's Biggest Dam and the Fight Over the Nile", [
    "This is Africa's biggest hydropower dam, and the country downstream calls it an existential threat.",
    "The Grand Ethiopian Renaissance Dam opened in September 2025, with 5,150 megawatts of capacity.",
    "Its main wall is 145 meters high and almost 1.8 kilometers long.",
    "How much water can its reservoir hold? Guess it in the comments.",
    "74 billion cubic meters, on the Blue Nile, which supplies about 85 percent of the Nile's water.",
    "Egypt depends on the Nile for about 90 percent of its water, and says the dam puts that at risk.",
    "Building began in 2011, and 14 years later the countries still haven't agreed on how to share the river.",
    "Follow for a new megaproject every day. If you were Ethiopia or Egypt, what would you do?",
], [
    {"tipo": "mapa", "bbox": [32.0, 39.5, 8.5, 16.0], "destaque": ["ETH"], "titulo": "Blue Nile, Ethiopia", "sub": "17 km from Sudan", "gancho": "AFRICA'S\nBIGGEST DAM",
     "globo": [11.2153, 35.0931], "pins": [[35.0931, 11.2153, "GERD", "r"], [32.56, 15.50, "Khartoum", "l"], [38.74, 9.03, "Addis Ababa", "l"]]},
    {"tipo": "numero", "valor": 5150, "sufixo": " MW", "label": "capacity", "nota": "13 turbines, opened September 2025", "cor": "amber"},
    {"tipo": "altura", "titulo": "145 m high", "sub": "1.8 km long", "itens": [["Statue of Liberty", 93, False, "bloco"], ["GERD", 145, True, "bloco"], ["Three Gorges", 181, False, "bloco"]], "unidade": "m",
     "lembrete": "for a new megaproject every day"},
    {"tipo": "palpite", "pergunta": "How much water can it hold?", "opcoes": ["7 billion m³", "74 billion m³", "740 billion m³"], "certa": 1, "revelar": True},
    {"tipo": "numero", "valor": 74, "sufixo": "B m³", "label": "reservoir", "nota": "the Blue Nile carries about 85% of the Nile's water", "cor": "water"},
    {"tipo": "mapa", "bbox": [24.0, 42.0, 8.0, 32.0], "destaque": ["EGY"], "titulo": "Downstream: Egypt", "sub": "about 90% of its water from the Nile",
     "rota": [[35.09, 11.21], [33.5, 13.5], [32.53, 15.6], [32.0, 18.0], [31.0, 21.5], [32.9, 24.1], [31.2, 30.0]], "largura_rota": 12,
     "pins": [[31.24, 30.04, "Cairo", "l"], [35.0931, 11.2153, "GERD", "r"]]},
    {"tipo": "linha", "titulo": "Still no deal", "eventos": [[2011, "Construction starts"], [2022, "First power"], [2025, "Inaugurated"]]},
    {"tipo": "cta", "pergunta": "Ethiopia or Egypt: what would you do?"},
])

if __name__ == '__main__':
    for pasta, spec in V:
        d = os.path.join(RAIZ, 'videos', pasta); os.makedirs(d, exist_ok=True)
        json.dump(spec, open(os.path.join(d, 'spec.json'), 'w'), indent=1, ensure_ascii=False)
        print(pasta, len(spec['falas']), 'falas', sum(len(f.split()) for f in spec['falas']), 'palavras')

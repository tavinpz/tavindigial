"""Quanto Você Dura? #002: Canudos (Belo Monte), sertão da Bahia, 1897.
Fontes: pt.wikipedia.org/wiki/Guerra_de_Canudos; en.wikipedia.org/wiki/War_of_Canudos; Correio (cronologia de Belo Monte);
Euclides da Cunha, Os Sertões (1902, domínio público). Fotos: Flávio de Barros (1897) e ilustrações de época, Wikimedia Commons, domínio público."""
import json, os

AQUI = os.path.dirname(os.path.abspath(__file__))
A = '/home/claude/quanto-voce-dura/arquivo_canudos/'
FB = 'Flávio de Barros, 1897 / Acervo Museu da República'


def foto(arq, legenda=None, credito=FB, hud=None, zoom='entra', relogio=None, **kw):
    return {'tipo': 'foto', 'arq': arq, 'legenda': legenda, 'credito': credito, 'hud': hud, 'zoom': zoom, 'relogio': relogio, **kw}


def h(s, c, g):
    return {'Saúde': s, 'Comida': c, 'Segurança': g}


blocos = [
    {'cena': {'tipo': 'gancho_qvd', 'batidas': [
        {'t': 'titulo', 'foto': 'canudos_rebels_jpg.jpg', 'acima': 'SERTÃO DA BAHIA', 'titulo': 'CANUDOS, 1897'},
        {'t': 'numeros', 'fotos': ['40th_infantry_batallion_canudos_1897_jpg.jpg', 'pris_o_de_jagun_os_pela_cavalaria_jpg.jpg', 'ruins_church_in_canudos_1897_jpg.jpg'],
         'itens': [['4', 'EXPEDIÇÕES DO EXÉRCITO'], ['+8 MIL', 'SOLDADOS NO CERCO FINAL'], ['5.200', 'CASAS QUEIMADAS']], 'vermelho': 2},
        {'t': 'hud', 'foto': 'canudos_village_jpg.jpg', 'rotulo': 'VOCÊ · DIA 1', 'barras': [['Saúde', 70, 58], ['Comida', 45, 12], ['Segurança', 55, 6]]},
        {'t': 'escolha', 'a': {'foto': 'canudos_rebels_jpg.jpg', 'texto': 'FICAR', 'cor': '#e9c46a'}, 'b': {'foto': 'canudos_village_jpg.jpg', 'texto': 'FUGIR', 'cor': '#7bc47f'}}]},
     'falas': ["Sertão da Bahia. Mil oitocentos e noventa e sete.",
               "Quatro expedições do Exército. Mais de oito mil soldados no cerco final. Cinco mil e duzentas casas queimadas.",
               "E você acabou de chegar. Com pouca comida, pouca água, e o Exército a caminho.",
               "Ficar, ou fugir? Cada dia que você espera muda quanto tempo você dura."]},
    {'cena': foto('canudos_village_jpg.jpg', relogio='JANEIRO DE 1897', hud=h(70, 45, 55), credito='Autor desconhecido, c. 1897 / Wikimedia Commons'),
     'falas': ["Você acorda com o sol já queimando. Chão de terra rachada, casas de barro e palha coladas umas nas outras, e um rio quase seco lá embaixo.",
               "Você está em Belo Monte, o arraial que o resto do Brasil chama de Canudos. No meio do sertão da Bahia.",
               "E daqui a alguns meses, este lugar vai deixar de existir. A pergunta é: quanto tempo você dura?"]},
    {'cena': {'tipo': 'regras', 'titulo_regras': 'COMO FUNCIONA', 'quando': [[0, 20], [0, 110], [1, 0], [2, 0]],
              'itens': ['Você é um sertanejo pobre', 'Chegou a Belo Monte fugindo da miséria', 'Tudo aqui aconteceu de verdade', 'Seu painel: saúde, comida e segurança']},
     'falas': ["Funciona assim. Você é um sertanejo pobre, e chegou a Belo Monte como milhares de outros: fugindo da seca e da fome.",
               "Tudo o que vai acontecer com você aconteceu de verdade, com datas e números de verdade.",
               "No canto da tela, você acompanha três coisas: saúde, comida e segurança. Se uma delas zerar, acabou."]},

    # ---------------- capítulo 1 ----------------
    {'cena': {'tipo': 'capitulo', 'n': 1, 'titulo': 'O homem do sertão'},
     'falas': ["Parte um. O homem do sertão."]},
    {'cena': foto('conselheiro_revista_ilustrada_jpg.jpg', moldura=True, zoom='entra', legenda='Antônio Conselheiro na imprensa do Rio, 1897', credito='Angelo Agostini / Revista Illustrada'),
     'falas': ["Quem manda aqui é um homem magro, de barba comprida e túnica azul: Antônio Vicente Mendes Maciel. O povo chama de Antônio Conselheiro.",
               "Por mais de vinte anos, ele andou pelo sertão reconstruindo igrejas e cemitérios, pregando e juntando seguidores.",
               "Em mil oitocentos e noventa e três, ele parou numa velha fazenda às margens do rio Vaza-Barris e fundou Belo Monte."]},
    {'cena': {'tipo': 'numero', 'valor': 25000, 'dec': 0, 'rotulo': 'moradores em Belo Monte, segundo as estimativas', 'sem_icones': True},
     'falas': ["E as pessoas vieram. Ex-escravizados, vaqueiros, famílias inteiras expulsas pela seca.",
               "Em poucos anos, o arraial chegou a cerca de vinte e cinco mil moradores. Uma das maiores cidades da Bahia, no meio do nada."]},
    {'cena': foto('planta_de_canudos_siqueira_menezes_jpg.jpg', moldura=True, zoom='sai', hud=h(68, 40, 50), legenda='Planta de Canudos feita por militares, 1897', credito='Cel. Siqueira de Menezes, 1897'),
     'falas': ["Aqui ninguém paga imposto à República. Quem planta, divide. Quem tem gado, ajuda quem não tem.",
               "Para você, que chegou sem nada, isso é muito. Um teto de barro, um pouco de farinha, e um lugar onde ninguém te expulsa.",
               "Mas para os fazendeiros da região, que estão perdendo trabalhadores, e para a Igreja, que perdeu o controle de um pregador, Belo Monte virou um problema."]},

    # ---------------- capítulo 2 ----------------
    {'cena': {'tipo': 'capitulo', 'n': 2, 'titulo': 'Três derrotas'},
     'falas': ["Parte dois. Três derrotas."]},
    {'cena': foto('o_combate_em_canudos_entre_as_tropas_leg.jpg', moldura=True, zoom='entra', relogio='NOVEMBRO DE 1896', hud=h(68, 38, 40), legenda='O combate em Canudos, imprensa de 1897', credito='Angelo Agostini / Revista Illustrada'),
     'falas': ["Tudo começa com uma briga por madeira. O Conselheiro encomenda tábuas para a igreja nova, paga, e a madeira não chega. Corre o boato de que os conselheiristas vão buscar à força.",
               "O governo da Bahia manda cerca de cem soldados. Em novembro de mil oitocentos e noventa e seis, no povoado de Uauá, eles são surpreendidos pelos sertanejos e recuam.",
               "Em janeiro de mil oitocentos e noventa e sete, vem a segunda expedição, com algumas centenas de soldados. Também é repelida."]},
    {'cena': foto('coronel_tamarindo_da_9_infantaria_jpg.jpg', moldura=True, zoom='entra', relogio='MARÇO DE 1897', hud=h(64, 34, 28), legenda='Coronel Tamarindo, morto na terceira expedição', credito='Angelo Agostini / Revista Illustrada'),
     'falas': ["Aí a República perde a paciência. A terceira expedição tem cerca de mil e trezentos soldados, com canhões, comandados pelo coronel Moreira César.",
               "O apelido dele era corta-cabeças. Ele tinha mandado executar mais de cem pessoas numa revolta em Santa Catarina.",
               "Em março de mil oitocentos e noventa e sete, ele ataca Belo Monte. E morre no ataque. O segundo no comando, o coronel Tamarindo, também morre. A tropa foge, largando armas e munição pelo caminho."]},
    {'cena': foto('homenagem_da_revista_illustrada_aos_glor.jpg', moldura=True, zoom='sai', hud=h(64, 34, 20), legenda='A guerra nas revistas do Rio, 1897', credito='Revista Illustrada, 1897'),
     'falas': ["No Rio de Janeiro, a notícia cai como uma bomba. Os jornais dizem que Canudos é um complô para trazer de volta o imperador.",
               "Multidões atacam jornais monarquistas na capital. E o governo decide que agora não é mais uma expedição. É uma guerra.",
               "Para você, em Belo Monte, as armas largadas pela tropa viraram motivo de festa. Mas é a última boa notícia."]},

    # ---------------- capítulo 3 ----------------
    {'cena': {'tipo': 'capitulo', 'n': 3, 'titulo': 'O cerco'},
     'falas': ["Parte três. O cerco."]},
    {'cena': foto('40th_infantry_batallion_canudos_1897_jpg.jpg', relogio='JUNHO DE 1897', hud=h(60, 28, 14)),
     'falas': ["A quarta expedição sai em junho de mil oitocentos e noventa e sete, comandada pelo general Artur Oscar.",
               "Ela chega a reunir mais de oito mil soldados em volta do arraial. Ao todo, cerca de doze mil homens de dezessete estados foram mobilizados.",
               "Com eles vem um fotógrafo, Flávio de Barros. Boa parte das fotos deste vídeo foi feita por ele, durante a guerra."]},
    {'cena': foto('a_matadeira_jpg.jpg', moldura=True, zoom='entra', hud=h(55, 22, 10), legenda='O canhão Whitworth 32, apelidado de Matadeira', credito='Wikimedia Commons, domínio público'),
     'falas': ["E vem a Matadeira. Um canhão Whitworth de calibre trinta e dois, arrastado por centenas de quilômetros de caatinga.",
               "Os tiros caem no meio das casas de barro. Não existe abrigo que aguente."]},
    {'cena': foto('canudos_cartogr_fico_plano_de_opera_es_d.jpg', moldura=True, zoom='sobe', hud=h(42, 10, 8), legenda='Plano de operações do Exército contra Canudos, 1897', credito='Exército Brasileiro, 1897'),
     'falas': ["O Exército fecha o cerco e corta o caminho até o rio. Agora o inimigo não é só a bala. É a sede.",
               "A comida acaba. As pessoas comem o pouco que encontram. Os feridos e os doentes morrem dentro das casas.",
               "Se você ainda está aqui em setembro, o seu painel está assim. E ainda vai piorar."]},
    {'cena': foto('ruins_church_in_canudos_1897_jpg.jpg', zoom='sobe', relogio='22 DE SETEMBRO DE 1897', hud=h(35, 6, 4)),
     'falas': ["No dia vinte e dois de setembro, Antônio Conselheiro morre dentro do arraial, provavelmente de disenteria.",
               "Os sertanejos enterram o corpo e continuam lutando. As duas igrejas viraram trincheiras, e depois ruínas."]},

    # ---------------- capítulo 4 ----------------
    {'cena': {'tipo': 'capitulo', 'n': 4, 'titulo': '5 de outubro'},
     'falas': ["Parte quatro. Cinco de outubro."]},
    {'cena': foto('canudos_rebels_jpg.jpg', relogio='2 DE OUTUBRO DE 1897', hud=h(30, 4, 4), legenda='Prisioneiros sertanejos, outubro de 1897'),
     'falas': ["No começo de outubro, o Exército oferece rendição. Cerca de trezentas pessoas saem: quase todas mulheres, crianças e velhos, magros até o osso.",
               "Esta é uma das fotos mais famosas da história do Brasil. São eles.",
               "Os homens que se rendem, em muitos casos, são degolados. Os soldados chamavam aquilo de gravata vermelha."]},
    {'cena': {'tipo': 'contagem', 'cabecalho': '5 DE OUTUBRO DE 1897 · BELO MONTE', 'quando': [[1, 0], [1, 70], [2, 0], [3, 0]],
              'itens': [{'v': 5200, 'r': 'casas queimadas'}, {'v': 25000, 'r': 'mortos, estimativa mais citada'}, {'v': 5000, 'r': 'soldados mortos, estimativa'}, {'v': 4, 'r': 'últimos defensores'}]},
     'falas': ["E quem não se rende, luta até o fim.",
               "No dia seguinte à queda, o Exército contou cinco mil e duzentas casas, e queimou todas. Os mortos de Belo Monte são estimados em até vinte e cinco mil.",
               "Do lado do Exército, as estimativas falam em cerca de cinco mil mortos.",
               "E Euclides da Cunha, que estava lá como jornalista, escreveu que Canudos não se rendeu. Os últimos defensores eram quatro: um velho, dois homens feitos e uma criança."]},
    {'cena': {'tipo': 'veredito', 'linhas': [{'r': 'Fugiu antes do cerco de junho', 'v': 'Você sobrevive'}, {'r': 'Ficou até o fim', 'v': 'Você não sai de Belo Monte'}, {'r': 'Se rendeu em outubro', 'v': 'Depende de quem você é'}]},
     'falas': ["Então, quanto você dura?",
               "Se você saiu de Belo Monte antes do cerco de junho, provavelmente sobreviveu. Pobre, sem casa, mas vivo.",
               "Se ficou até o fim, as chances são quase nulas. Fome, sede, bala ou degola.",
               "E se você se rendeu em outubro, tudo dependia de quem você era. Muitas mulheres e crianças sobreviveram, algumas levadas como criadas para outras cidades. Para os homens, render-se muitas vezes era só outra forma de morrer."]},
    {'cena': foto('pris_o_de_jagun_os_pela_cavalaria_jpg.jpg', zoom='sai'),
     'falas': ["Cinco anos depois, Euclides publicou Os Sertões, um dos livros mais importantes da literatura brasileira, sobre essa guerra.",
               "E nos anos sessenta, o governo construiu uma barragem no rio Vaza-Barris, o açude de Cocorobó. A água cobriu o lugar onde ficava Belo Monte.",
               "Até hoje, quando a seca é forte e a água baixa, as ruínas da velha igreja aparecem de novo."]},
    {'cena': {'tipo': 'fim', 'pergunta': 'Você ficaria ou fugiria?', 'cta': 'INSCREVA-SE · PRÓXIMA ÉPOCA EM BREVE', 'faixa_cores': ['#e9c46a', '#d4a373', '#bc6c25', '#9c2a2a', '#5e1f1f']},
     'falas': ["E você? Ficaria em Belo Monte, ou fugiria antes do cerco? Me conta nos comentários. E se inscreve, porque na próxima você acorda em outra época do Brasil."]},
]

NUM = {"mil oitocentos e noventa e sete": "1897", "mil oitocentos e noventa e seis": "1896", "mil oitocentos e noventa e três": "1893",
       "cinco mil e duzentas": "5.200", "vinte e cinco mil": "25 mil", "mil e trezentos": "1.300", "cinco mil": "5 mil", "oito mil": "8 mil", "doze mil": "12 mil",
       "trezentas": "300", "dezessete": "17", "vinte e dois de setembro": "22 de setembro", "cinco de outubro": "5 de outubro", "trinta e dois": "32",
       "vinte anos": "20 anos", "cem": "100"}
spec = {'id': 'qvd002', 'canal': 'quanto-voce-dura', 'marca': 'QUANTO VOCÊ DURA?', 'acento': '#e9c46a', 'icone': 'barras',
        'titulo': 'Você acorda em Canudos, 1897. Quanto tempo você dura?', 'motor': 'piper', 'arquivo': A, 'voz': 'm', 'velocidade': 0.9, 'lang': 'pt-br', 'legenda': True,
        'numeros': NUM, 'blocos': blocos}
json.dump(spec, open(os.path.join(AQUI, 'spec.json'), 'w'), indent=1, ensure_ascii=False)
falas = [f for b in blocos for f in b['falas']]
pal = sum(len(f.split()) for f in falas)
print(len(blocos), 'cenas', len(falas), 'falas', pal, 'palavras ~', round(pal / 145, 1), 'min')
usadas = set()
for b in blocos:
    c = b['cena']
    if c.get('arq'): usadas.add(c['arq'])
    for bt in c.get('batidas', []):
        for k in ('foto',): bt.get(k) and usadas.add(bt[k])
        for x in bt.get('fotos', []): usadas.add(x)
        for k in ('a', 'b'):
            if k in bt: usadas.add(bt[k]['foto'])
for u in sorted(usadas):
    print('ok ' if os.path.exists(A + u) else 'FALTA', u)

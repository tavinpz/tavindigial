"""Quanto Você Dura? #002 (composição Arte): Canudos (Belo Monte), sertão da Bahia, 1897.
Fontes: pt.wikipedia.org/wiki/Guerra_de_Canudos; en.wikipedia.org/wiki/War_of_Canudos; Euclides da Cunha, Os Sertões (1902, domínio público).
Fotos: Flávio de Barros (1897) e ilustrações de época, Wikimedia Commons, domínio público. Voz: Piper cadu (aprovada).
Cada fala = um visual. Blocos = capítulos.
"""
import json, os, shutil

ARQ = '/home/claude/estudio-longo/quanto-voce-dura/arquivo_canudos/'
PUB = '/home/claude/estudio-longo/atlas-motion/public/arte/qvd/'
A = {
    'arraial': 'canudos_jpg.jpg', 'vila': 'canudos_village_jpg.jpg', 'batalhao': '40th_infantry_batallion_canudos_1897_jpg.jpg',
    'batalhao24': 'canudos_24o_batalh_o_de_infantaria_jpg.jpg', 'plano': 'canudos_cartogr_fico_plano_de_opera_es_d.jpg',
    'matadeira': 'a_matadeira_jpg.jpg', 'prisioneiros': 'canudos_rebels_jpg.jpg', 'cavalaria': 'pris_o_de_jagun_os_pela_cavalaria_jpg.jpg',
}
LEG = {
    'arraial': 'Belo Monte (Canudos) em ilustração de época', 'vila': 'O arraial de Canudos, 1897',
    'batalhao': '40º Batalhão de Infantaria em Canudos, 1897 · Foto: Flávio de Barros', 'batalhao24': '24º Batalhão de Infantaria, 1897 · Foto: Flávio de Barros',
    'plano': 'Plano de operações do Exército contra Canudos, 1897', 'matadeira': 'O canhão Whitworth 32, apelidado de Matadeira',
    'prisioneiros': 'Sobreviventes de Belo Monte presos pelo Exército, outubro de 1897 · Foto: Flávio de Barros',
    'cavalaria': 'Prisão de sertanejos pela cavalaria, 1897 · Foto: Flávio de Barros',
}
for a in A.values():
    if not os.path.exists(PUB + a): shutil.copy(ARQ + a, PUB + a)

_rot = [0]
def foto(k, **kw):
    _rot[0] += 1
    r = [-2.5, 1.8, -1.2, 2.4, -2.0][_rot[0] % 5]
    d = {"tipo": "foto", "arq": A[k], "leg": LEG[k], "rot": r, "entra": ["cai", "dir", "esq", "cai"][_rot[0] % 4], "zoom": kw.pop('zoom', None)}
    if k in ('matadeira', 'batalhao24'): d.update({"w": 760, "ar": 0.62})
    d.update(kw)
    return d
def F(t, v): return (t, v)
def barras(s, c, g, txt=None):  # saúde, comida, segurança (0–100)
    return {"tipo": "barras", "s": s, "d": c, "g": g, "txt": txt, "nome_d": "COMIDA"}
DATAS = [["1893", "fundação"], ["nov 1896", "Uauá"], ["mar 1897", "3ª expedição"], ["jun 1897", "o cerco"], ["out 1897", "o fim"]]
def linha(i): return {"tipo": "linha", "titulo": "LINHA DO TEMPO · BELO MONTE", "datas": DATAS, "ativo": i}

intro = [
    F("Sertão da Bahia. Mil oitocentos e noventa e sete.", {"tipo": "data", "txt": "SERTÃO DA BAHIA", "sub": "Belo Monte, 1897", "ano": "1897"}),
    F("Quatro expedições do Exército vieram até aqui.", {"tipo": "numero", "txt": "4", "rotulo": "expedições do Exército"}),
    F("No cerco final, mais de oito mil soldados.", foto('batalhao', zoom=[0.5, 0.5])),
    F("E você acabou de chegar. Com pouca comida, pouca água, e o Exército a caminho.", foto('arraial')),
    F("Quanto tempo você dura?", {"tipo": "titulo", "txt": "QUANTO TEMPO\nVOCÊ DURA?"}),
    F("Funciona assim. Você é um sertanejo pobre, e chegou a Belo Monte fugindo da seca e da fome.", {"tipo": "bolso"}),
    F("Tudo o que vai acontecer com você aconteceu de verdade, com datas e números de verdade.", {"tipo": "documento", "titulo": "FONTES DESTE VÍDEO", "txt": "Registros da guerra, Os Sertões de Euclides da Cunha e fotografias de 1897."}),
    F("E você acompanha três coisas. Sua saúde. Sua comida. E sua segurança.", barras(70, 45, 55)),
    F("Se qualquer uma delas zerar, acabou.", barras(70, 45, 55, "SE ZERAR, ACABOU")),
]

cap1 = [
    F("Parte um. O homem do sertão.", {"tipo": "capitulo", "n": "PARTE UM", "txt": "O HOMEM DO SERTÃO"}),
    F("Quem manda aqui é um homem magro, de barba comprida e túnica azul.", {"tipo": "ficha", "titulo": "FICHA · O CONSELHEIRO", "linhas": [["NOME", "Antônio Vicente Mendes Maciel"], ["APELIDO", "Antônio Conselheiro"], ["ROUPA", "Túnica azul"]], "rodape": "Pregador no sertão da Bahia"}),
    F("Ele nasceu em mil oitocentos e trinta, em Quixeramobim, no sertão do Ceará.", {"tipo": "ficha", "titulo": "FICHA · O CONSELHEIRO", "linhas": [["NASCEU", "1830"], ["ONDE", "Quixeramobim, CE"], ["ANTES", "Comerciante"]], "rodape": "Antônio Vicente Mendes Maciel"}),
    F("Foi comerciante, foi professor, perdeu tudo. E um dia começou a andar pelo sertão, de cidade em cidade.", {"tipo": "bolso"}),
    F("O povo chama ele de Antônio Conselheiro.", {"tipo": "carimbo_doc", "titulo": "O LÍDER DE BELO MONTE", "txt": "O CONSELHEIRO"}),
    F("Por mais de vinte anos, ele andou pelo sertão reconstruindo igrejas e cemitérios, pregando e juntando seguidores.", {"tipo": "numero", "txt": "20", "rotulo": "anos pregando pelo sertão"}),
    F("Em mil oitocentos e noventa e três, ele parou numa velha fazenda às margens do rio Vaza-Barris. E fundou Belo Monte.", linha(0)),
    F("O resto do Brasil chama o lugar de Canudos.", foto('arraial', zoom=[0.4, 0.6])),
    F("E as pessoas vieram. Ex-escravizados, vaqueiros, famílias inteiras expulsas pela seca.", foto('vila')),
    F("Em poucos anos, o arraial chegou a cerca de vinte e cinco mil moradores, segundo as estimativas.", {"tipo": "numero", "txt": "25 mil", "rotulo": "moradores, segundo as estimativas"}),
    F("Uma das maiores cidades da Bahia, no meio do nada.", foto('arraial', zoom=[0.7, 0.4])),
    F("Aqui ninguém paga imposto à República. Quem planta, divide. Quem tem gado, ajuda quem não tem.", {"tipo": "documento", "titulo": "AS REGRAS DE BELO MONTE", "txt": "Sem imposto à República. Quem planta, divide. Quem tem gado, ajuda quem não tem."}),
    F("Para você, que chegou sem nada, isso é muito. Um teto de barro, um pouco de farinha, e um lugar onde ninguém te expulsa.", barras(75, 55, 60, "UM TETO")),
    F("Mas para os fazendeiros da região, que estão perdendo trabalhadores, Belo Monte virou um problema.", {"tipo": "carimbo_doc", "titulo": "AOS OLHOS DOS FAZENDEIROS", "txt": "UM PROBLEMA"}),
    F("E para a Igreja, que perdeu o controle de um pregador, também.", {"tipo": "carimbo_doc", "titulo": "AOS OLHOS DA IGREJA", "txt": "UM PROBLEMA"}),
    F("Antes de continuar, me responde uma coisa. Se você estivesse aqui, sem nada, você ficaria em Belo Monte?", {"tipo": "escolha", "a": "FICAR", "b": "IR EMBORA", "quando": "JANEIRO DE 1897"}),
    F("Escreve ficar ou ir embora nos comentários, agora. No final do vídeo, você descobre se sobreviveu.", {"tipo": "escolha", "a": "FICAR", "b": "IR EMBORA", "txt": "COMENTE AGORA", "quando": "JANEIRO DE 1897"}),
]

cap2 = [
    F("Parte dois. Três derrotas.", {"tipo": "capitulo", "n": "PARTE DOIS", "txt": "TRÊS DERROTAS"}),
    F("Tudo começa com uma briga por madeira.", {"tipo": "documento", "titulo": "ENCOMENDA", "txt": "Tábuas para a igreja nova de Belo Monte. Pagas. Não entregues.", "carimbo": "NÃO ENTREGUE"}),
    F("O Conselheiro encomenda tábuas para a igreja nova, paga, e a madeira não chega.", foto('arraial', zoom=[0.62, 0.7])),
    F("Corre o boato de que os conselheiristas vão buscar a madeira à força.", {"tipo": "carimbo_doc", "titulo": "BOATO", "txt": "VÃO À FORÇA"}),
    F("O governo da Bahia manda cerca de cem soldados.", {"tipo": "numero", "txt": "100", "rotulo": "soldados na 1ª expedição"}),
    F("Em novembro de mil oitocentos e noventa e seis, no povoado de Uauá, eles são surpreendidos pelos sertanejos. E recuam.", linha(1)),
    F("Em janeiro de mil oitocentos e noventa e sete, vem a segunda expedição, com algumas centenas de soldados.", {"tipo": "carimbo_doc", "titulo": "2ª EXPEDIÇÃO · JANEIRO DE 1897", "txt": "REPELIDA"}),
    F("Também é repelida.", barras(70, 45, 45, "2 A 0")),
    F("Aí a República perde a paciência.", {"tipo": "carimbo_doc", "titulo": "RIO DE JANEIRO · GOVERNO FEDERAL", "txt": "3ª EXPEDIÇÃO"}),
    F("A terceira expedição tem cerca de mil e trezentos soldados, com canhões.", {"tipo": "numero", "txt": "1.300", "rotulo": "soldados na 3ª expedição"}),
    F("Quem comanda é o coronel Moreira César.", {"tipo": "ficha", "titulo": "FICHA · O COMANDANTE", "linhas": [["NOME", "Moreira César"], ["POSTO", "Coronel"], ["APELIDO", "Corta-cabeças"]], "rodape": "Comandante da 3ª expedição"}),
    F("O apelido dele era corta-cabeças. Ele tinha mandado executar mais de cem pessoas numa revolta em Santa Catarina.", {"tipo": "numero", "txt": "100", "rotulo": "executados em Santa Catarina, mais de"}),
    F("Em março de mil oitocentos e noventa e sete, ele ataca Belo Monte.", linha(2)),
    F("E morre no ataque. O segundo no comando, o coronel Tamarindo, também morre.", {"tipo": "carimbo_doc", "titulo": "3ª EXPEDIÇÃO · MARÇO DE 1897", "txt": "DERROTADA"}),
    F("A tropa foge, largando armas e munição pelo caminho.", barras(68, 40, 40, "ARMAS LARGADAS")),
    F("No Rio de Janeiro, a notícia cai como uma bomba.", {"tipo": "documento", "titulo": "IMPRENSA DO RIO · MARÇO DE 1897", "txt": "Derrota em Canudos. Morto o coronel Moreira César."}),
    F("Os jornais dizem que Canudos é um complô para trazer de volta o imperador.", {"tipo": "carimbo_doc", "titulo": "O QUE DIZEM OS JORNAIS", "txt": "COMPLÔ?"}),
    F("E o governo decide que agora não é mais uma expedição. É uma guerra.", {"tipo": "carimbo_doc", "titulo": "DECISÃO DO GOVERNO", "txt": "GUERRA"}),
    F("Para você, em Belo Monte, as armas largadas pela tropa viraram motivo de festa. Mas é a última boa notícia.", barras(65, 35, 30, "A ÚLTIMA BOA NOTÍCIA")),
    F("E se você está gostando de viver a história por dentro, se inscreve no canal. Cada vídeo aqui é uma época diferente do Brasil, com documentos reais.", {"tipo": "mesa", "fotos": [A['arraial'], A['batalhao'], A['vila'], A['prisioneiros'], A['cavalaria']], "txt": "INSCREVA-SE"}),
]

cap3 = [
    F("Parte três. O cerco.", {"tipo": "capitulo", "n": "PARTE TRÊS", "txt": "O CERCO"}),
    F("A quarta expedição sai em junho de mil oitocentos e noventa e sete, comandada pelo general Artur Oscar.", linha(3)),
    F("Ela chega a reunir mais de oito mil soldados em volta do arraial.", {"tipo": "numero", "txt": "8.000", "rotulo": "soldados em volta do arraial, mais de"}),
    F("Ao todo, cerca de doze mil homens, de dezessete estados, foram mobilizados.", {"tipo": "comparacao", "a": "MORADORES", "va": 25000, "b": "SOLDADOS", "vb": 12000, "ate": "b"}),
    F("Com eles vem um fotógrafo, Flávio de Barros.", foto('batalhao')),
    F("Boa parte das fotos deste vídeo foi feita por ele, durante a guerra.", foto('batalhao24')),
    F("E vem a Matadeira. Um canhão Whitworth de calibre trinta e dois, arrastado por centenas de quilômetros de caatinga.", foto('matadeira', selo="MATADEIRA")),
    F("Os tiros caem no meio das casas de barro. Não existe abrigo que aguente.", barras(50, 25, 12, "SEM ABRIGO")),
    F("O Exército fecha o cerco e corta o caminho até o rio.", foto('plano', zoom=[0.5, 0.45], ar=0.75)),
    F("Agora o inimigo não é só a bala. É a sede.", {"tipo": "carimbo_doc", "titulo": "O NOVO INIMIGO", "txt": "SEDE"}),
    F("Para abastecer tanta gente, o próprio ministro da Guerra, o marechal Carlos Machado Bittencourt, vai até o sertão organizar os comboios de comida e munição.", {"tipo": "ficha", "titulo": "FICHA · O MINISTRO", "linhas": [["NOME", "Machado Bittencourt"], ["CARGO", "Ministro da Guerra"], ["MISSÃO", "Abastecer o cerco"]], "rodape": "Organizou os comboios a partir de Monte Santo"}),
    F("Do lado de fora, chegam carroças e mulas. Do lado de dentro, não chega nada.", {"tipo": "comparacao", "a": "COMIDA DO EXÉRCITO", "va": 100, "b": "COMIDA EM BELO MONTE", "vb": 8, "ate": "b"}),
    F("A comida acaba. As pessoas comem o pouco que encontram.", barras(42, 10, 8, "SEM COMIDA")),
    F("Os feridos e os doentes morrem dentro das casas.", {"tipo": "bolso"}),
    F("Se você ainda está aqui em setembro, o seu painel está assim. E ainda vai piorar.", barras(35, 6, 5, "SETEMBRO")),
    F("No dia vinte e dois de setembro, Antônio Conselheiro morre dentro do arraial, provavelmente de disenteria.", {"tipo": "data", "txt": "22 DE SETEMBRO", "sub": "morre Antônio Conselheiro", "ano": "1897"}),
    F("Os sertanejos enterram o corpo e continuam lutando.", foto('vila', zoom=[0.5, 0.6])),
    F("As duas igrejas viram trincheiras. E depois, ruínas.", foto('arraial', zoom=[0.65, 0.72], selo="RUÍNAS")),
]

cap4 = [
    F("Parte quatro. O veredito.", {"tipo": "capitulo", "n": "PARTE QUATRO", "txt": "O VEREDITO"}),
    F("No começo de outubro, o Exército oferece rendição.", linha(4)),
    F("Cerca de trezentas pessoas saem. Quase todas mulheres, crianças e velhos, magros até o osso.", {"tipo": "numero", "txt": "300", "rotulo": "pessoas se rendem, cerca de"}),
    F("Esta é uma das fotos mais famosas da história do Brasil. São eles.", foto('prisioneiros', w=1300, ar=0.62)),
    F("Os homens que se rendem, em muitos casos, são degolados. Os soldados chamavam aquilo de gravata vermelha.", {"tipo": "carimbo_doc", "titulo": "O QUE OS SOLDADOS CHAMAVAM", "txt": "GRAVATA VERMELHA"}),
    F("E quem não se rende, luta até o fim.", foto('cavalaria')),
    F("Belo Monte cai em cinco de outubro de mil oitocentos e noventa e sete.", {"tipo": "data", "txt": "5 DE OUTUBRO", "sub": "Belo Monte cai", "ano": "1897"}),
    F("O Exército contou cinco mil e duzentas casas. E queimou todas.", {"tipo": "numero", "txt": "5.200", "rotulo": "casas queimadas"}),
    F("Os mortos de Belo Monte são estimados em até vinte e cinco mil.", {"tipo": "numero", "txt": "25 mil", "rotulo": "mortos em Belo Monte, estimativa mais alta"}),
    F("Do lado do Exército, as estimativas falam em cerca de cinco mil mortos.", {"tipo": "comparacao", "a": "BELO MONTE", "va": 25000, "b": "EXÉRCITO", "vb": 5000, "ate": "b"}),
    F("Euclides da Cunha, que estava lá como jornalista, escreveu que Canudos não se rendeu.", {"tipo": "documento", "titulo": "OS SERTÕES · EUCLIDES DA CUNHA, 1902", "txt": "Canudos não se rendeu."}),
    F("Os últimos defensores eram quatro. Um velho, dois homens feitos e uma criança.", {"tipo": "numero", "txt": "4", "rotulo": "últimos defensores"}),
    F("Então, quanto você dura?", {"tipo": "titulo", "txt": "QUANTO\nVOCÊ DUROU?"}),
    F("Se você saiu de Belo Monte antes do cerco de junho, provavelmente sobreviveu. Pobre, sem casa, mas vivo.", barras(55, 20, 40, "FUGIU: VIVO")),
    F("Se ficou até o fim, as chances são quase nulas. Fome, sede, bala ou degola.", barras(0, 0, 0, "FICOU: FIM")),
    F("E se você se rendeu em outubro, tudo dependia de quem você era.", {"tipo": "escolha", "a": "MULHER OU CRIANÇA", "b": "HOMEM", "quando": "OUTUBRO DE 1897"}),
    F("Muitas mulheres e crianças sobreviveram, algumas levadas como criadas para outras cidades.", foto('prisioneiros', zoom=[0.5, 0.6])),
    F("Para os homens, render-se muitas vezes era só outra forma de morrer.", {"tipo": "carimbo_doc", "titulo": "RENDIÇÃO · HOMENS", "txt": "DEGOLA"}),
    F("Cinco anos depois, Euclides publicou Os Sertões, um dos livros mais importantes da literatura brasileira.", {"tipo": "documento", "titulo": "OS SERTÕES · 1902", "txt": "Euclides da Cunha. Sobre a guerra de Canudos."}),
    F("E nos anos sessenta, o governo construiu uma barragem no rio Vaza-Barris, o açude de Cocorobó.", {"tipo": "carimbo_doc", "titulo": "RIO VAZA-BARRIS · ANOS 1960", "txt": "AÇUDE DE COCOROBÓ"}),
    F("A água cobriu o lugar onde ficava Belo Monte.", foto('arraial', selo="SUBMERSO")),
    F("Até hoje, quando a seca é forte e a água baixa, as ruínas da velha igreja aparecem de novo.", foto('vila', zoom=[0.5, 0.45])),
    F("Em mil novecentos e oitenta e seis, a área da guerra virou o Parque Estadual de Canudos. Ainda dá para ver as trincheiras e os lugares dos combates.", {"tipo": "carimbo_doc", "titulo": "BAHIA · 1986", "txt": "PARQUE ESTADUAL DE CANUDOS"}),
    F("Então lembra do que você respondeu lá no começo. Ficar ou ir embora?", {"tipo": "escolha", "a": "FICAR", "b": "IR EMBORA", "quando": "JANEIRO DE 1897"}),
    F("Se você respondeu ir embora antes de junho, você provavelmente sobreviveu. Se respondeu ficar, você estava entre os milhares que não saíram de Belo Monte.", barras(55, 20, 40, "IR EMBORA: VIVO")),
    F("Com fotos e documentos reais da época, essa foi a sua chance.", {"tipo": "mesa", "fotos": [A['prisioneiros'], A['arraial'], A['batalhao'], A['vila'], A['cavalaria']], "txt": "FOTOS E DOCUMENTOS REAIS"}),
    F("Agora me conta nos comentários: você sabia que essa guerra tinha acontecido? Aprendeu na escola, ou está ouvindo pela primeira vez?", {"tipo": "escolha", "a": "JÁ SABIA", "b": "PRIMEIRA VEZ", "txt": "COMENTE A SUA", "quando": "1897"}),
    F("E manda esse vídeo para alguém que gosta de história. Muita gente nunca ouviu falar de Canudos.", {"tipo": "mesa", "fotos": [A['prisioneiros'], A['arraial'], A['batalhao']], "txt": "COMPARTILHE"}),
    F("Se inscreve e ativa o sininho, porque no próximo, você acorda em outra época do Brasil. E escreve aqui embaixo qual época você quer viver.", {"tipo": "fim"}),
]

spec = {
    "id": "qvd002a", "canal": "quanto-voce-dura", "titulo": "Você acorda em Canudos, 1897. Quanto tempo você dura?",
    "motor": "piper", "voz": "cadu", "velocidade": 0.95, "lang": "pt-br", "legenda": True, "acento": "#e9c46a", "marca": "QUANTO VOCÊ DURA?", "trilha": 0.13, "cauda": 4.0,
    "numeros": {"mil oitocentos e noventa e sete": "1897", "mil oitocentos e noventa e seis": "1896", "mil oitocentos e noventa e três": "1893",
                "cinco mil e duzentas": "5.200", "vinte e cinco mil": "25 mil", "mil e trezentos": "1.300", "cinco mil": "5 mil", "oito mil": "8 mil", "doze mil": "12 mil",
                "trezentas": "300", "dezessete": "17", "vinte e dois de setembro": "22 de setembro", "cinco de outubro": "5 de outubro", "trinta e dois": "32",
                "vinte anos": "20 anos", "cem": "100", "mil oitocentos e trinta": "1830", "mil novecentos e oitenta e seis": "1986"},
    "blocos": [],
}
nomes = {1: 'O homem do sertão', 2: 'Três derrotas', 3: 'O cerco', 4: 'O veredito'}
for i, cap in enumerate([intro, cap1, cap2, cap3, cap4]):
    cena = {"tipo": "arte" if i == 0 else "capitulo", "v": [v for _, v in cap]}
    if i: cena.update({"n": i, "titulo": nomes[i]})
    spec["blocos"].append({"cena": cena, "falas": [t for t, _ in cap]})
ant = None
for b in spec['blocos']:
    for v in b['cena']['v']:
        if v['tipo'] == 'barras':
            if ant: v['_de'] = {'s': ant['s'], 'd': ant['d'], 'g': ant['g']}
            ant = v
json.dump(spec, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'spec.json'), 'w'), ensure_ascii=False, indent=1)
txt = ' '.join(t for b in spec['blocos'] for t in b['falas'])
print(len(txt.split()), 'palavras', sum(len(b['falas']) for b in spec['blocos']), 'falas')

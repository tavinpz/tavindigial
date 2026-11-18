"""Quanto Você Dura? #003 (composição Arte): São Paulo, outubro de 1918, gripe espanhola.
Fonte principal: Bertucci-Martins, L. "Conselhos ao povo: educação contra a influenza de 1918". História, Ciências, Saúde –
Manguinhos, v.12, n.1, 2005 (scielo.br/pdf/hcsm/v12n1/07.pdf): datas, Conselhos ao Povo, fechamentos, 4/11 (7.786 doentes, 172 mortos),
5.331 mortos, 528.295 habitantes, ao menos 116.777 doentes. Rodrigues Alves: presidente eleito, morreu em janeiro de 1919 (Wikipédia).
Fotos: Vincenzo Pastore (São Paulo, c. 1910, domínio público, Wikimedia Commons / IMS) e fotos de 1918 nos EUA (domínio público).
"""
import json, os, shutil

ARQ = '/home/claude/estudio-longo/quanto-voce-dura/arquivo_sp1918/'
PUB = '/home/claude/estudio-longo/atlas-motion/public/arte/qvd/'
A = {
    'direita': 'rua_direita_vincenzo_pastore_jpg.jpg', 'se': 'largo_da_s_vincenzo_pastore_jpg.jpg', 'mercado': 'movimento_em_frente_ao_mercado_municipal.jpg',
    'luz': 'ferrovi_rio_l_jornal_cercado_por_carrega.jpg', 'galinha': 'vendedora_de_galinha_vincenzo_pastore_jp.jpg', 'procissao': 'prociss_o_na_rua_direita_vincenzo_pastor.jpg',
    'engraxates': 'garotos_engraxates_vincenzo_pastore_jpg.jpg', 'casario': 'casario_da_rua_da_esperan_a_vincenzo_pas.jpg', 'jornal': 'homem_lendo_jornal_na_porta_de_estabelec.jpg',
    'belavista': 'vista_do_bairro_da_bela_vista_a_partir_d.jpg', 'oakland': '1918_flu_in_oakland_jpg.jpg', 'policia': '165_ww_269b_25_police_l_restored_jpg.jpg',
    'maca': '1918_flu_outbreak_redcrosslittercarriers.jpg', 'enfermaria': '1918_flu_outbreak_jpg.jpg', 'ra': 'rodrigues_alves_jpg.jpg', 'mulher': 'mulher_com_crian_as_em_terreno_baldio_vi.jpg',
}
VP = ' · Foto: Vincenzo Pastore'
LEG = {
    'direita': 'Rua Direita, São Paulo, 1909' + VP, 'se': 'Largo da Sé, São Paulo, c. 1912' + VP, 'mercado': 'Em frente ao Mercado, São Paulo, c. 1910' + VP,
    'luz': 'Em frente à Estação da Luz, c. 1910' + VP, 'galinha': 'Vendedora de galinhas, São Paulo, c. 1910' + VP, 'procissao': 'Procissão na Rua Direita, c. 1910' + VP,
    'engraxates': 'Garotos engraxates, São Paulo, c. 1910' + VP, 'casario': 'Casario da Rua da Esperança, c. 1912' + VP, 'jornal': 'Homem lendo jornal, São Paulo, c. 1910' + VP,
    'belavista': 'Bela Vista vista do Viaduto do Chá, c. 1911' + VP, 'oakland': 'Hospital de emergência num auditório, Oakland (EUA), 1918',
    'policia': 'Policiais de máscara, Seattle (EUA), dezembro de 1918', 'maca': 'Cruz Vermelha carregando doente, Washington (EUA), 1918',
    'enfermaria': 'Enfermaria da gripe, Washington (EUA), 1918', 'ra': 'Rodrigues Alves, presidente eleito em 1918', 'mulher': 'Mulher com crianças, São Paulo, c. 1910' + VP,
}
for a in A.values():
    if os.path.exists(ARQ + a) and not os.path.exists(PUB + a): shutil.copy(ARQ + a, PUB + a)

_rot = [0]
def foto(k, **kw):
    _rot[0] += 1
    r = [-2.5, 1.8, -1.2, 2.4, -2.0][_rot[0] % 5]
    d = {"tipo": "foto", "arq": A[k], "leg": LEG[k], "rot": r, "entra": ["cai", "dir", "esq", "cai"][_rot[0] % 4], "zoom": kw.pop('zoom', None)}
    if k in ('direita', 'luz', 'galinha', 'procissao', 'engraxates', 'mulher', 'ra'): d.update({"w": 620, "ar": 1.3})
    d.update(kw)
    return d
def F(t, v): return (t, v)
def barras(s, d, g, txt=None): return {"tipo": "barras", "s": s, "d": d, "g": g, "txt": txt}
DATAS = [["13/out", "1º caso"], ["15/out", "confirmado"], ["22/out", "1ª morte"], ["4/nov", "o pior dia"], ["fim/nov", "a queda"]]
def linha(i): return {"tipo": "linha", "titulo": "LINHA DO TEMPO · SÃO PAULO, 1918", "datas": DATAS, "ativo": i}

DOENTES, MORTOS, POP = 116777, 5331, 528295

intro = [
    F("São Paulo. Outubro de mil novecentos e dezoito.", {"tipo": "data", "txt": "SÃO PAULO", "sub": "outubro de 1918", "ano": "1918"}),
    F("A cidade tem pouco mais de meio milhão de habitantes, e não para de crescer.", foto('se')),
    F("E você acabou de acordar aqui. Sem dinheiro, e sem conhecer ninguém.", {"tipo": "bolso"}),
    F("Quanto tempo você dura?", {"tipo": "titulo", "txt": "QUANTO TEMPO\nVOCÊ DURA?"}),
    F("Funciona assim. Você é um operário, e trabalha numa fábrica da cidade.", foto('mercado')),
    F("Tudo o que vai acontecer com você aconteceu de verdade, com datas e números de verdade.", {"tipo": "documento", "titulo": "FONTES DESTE VÍDEO", "txt": "Registros do Serviço Sanitário, jornais de 1918 e pesquisa histórica publicada."}),
    F("E você acompanha três coisas. Sua saúde. Seu dinheiro. E sua segurança.", barras(85, 35, 70)),
    F("Se qualquer uma delas zerar, acabou.", barras(85, 35, 70, "SE ZERAR, ACABOU")),
]

cap1 = [
    F("Parte um. A notícia que vem de longe.", {"tipo": "capitulo", "n": "PARTE UM", "txt": "A NOTÍCIA QUE VEM DE LONGE"}),
    F("Desde junho, os jornais de São Paulo falam de uma gripe que está matando gente na Europa.", foto('jornal')),
    F("O mundo está no fim de uma guerra. E a doença viaja nos navios, junto com os soldados.", foto('maca')),
    F("Em setembro, as notícias ficam mais frequentes. Mas a gripe ainda parece um problema dos outros.", {"tipo": "documento", "titulo": "JORNAIS DE SÃO PAULO · SETEMBRO DE 1918", "txt": "A gripe se espalha pela Europa. No Brasil, ainda se fala dela como coisa distante."}),
    F("No Rio de Janeiro, ela já chegou.", {"tipo": "carimbo_doc", "titulo": "RIO DE JANEIRO · OUTUBRO DE 1918", "txt": "A GRIPE CHEGOU"}),
    F("E no dia nove de outubro, os jornais contam que jogadores de futebol amador vindos do Rio caíram doentes.", {"tipo": "documento", "titulo": "JORNAIS · 9 DE OUTUBRO", "txt": "Jogadores amadores vindos do Rio estão doentes."}),
    F("No dia treze, o primeiro caso registrado da cidade entra no Hospital de Isolamento. Um estudante que chegou do Rio.", linha(0)),
    F("Dois dias depois, o Serviço Sanitário do Estado confirma. A gripe está em São Paulo.", linha(1)),
    F("Quem comanda o Serviço Sanitário é o médico Arthur Neiva.", {"tipo": "ficha", "titulo": "FICHA · SERVIÇO SANITÁRIO", "linhas": [["DIRETOR", "Arthur Neiva"], ["ÓRGÃO", "Serviço Sanitário"], ["DATA", "15/10/1918"]], "rodape": "Confirmou a gripe na cidade"}),
    F("E ele publica nos jornais os Conselhos ao Povo.", {"tipo": "documento", "titulo": "CONSELHOS AO POVO", "txt": "Evite aglomerações. Não faça visitas. Tome quinino todos os dias."}),
    F("Evitar aglomerações. Não fazer visitas.", {"tipo": "lista", "titulo": "CONSELHOS AO POVO", "itens": ["Evitar aglomerações", "Não fazer visitas"]}),
    F("E tomar todos os dias uma dose de quinino.", {"tipo": "lista", "titulo": "CONSELHOS AO POVO", "itens": ["Evitar aglomerações", "Não fazer visitas", "Quinino todo dia"]}),
    F("O problema é que o quinino é remédio de malária. Contra a gripe, não adiantava.", {"tipo": "carimbo_doc", "titulo": "QUININO", "txt": "NÃO FUNCIONA"}),
    F("Mas você não sabe disso. E você trabalha numa fábrica cheia de gente.", barras(80, 35, 55, "FÁBRICA CHEIA")),
]

cap2 = [
    F("Parte dois. A cidade fecha.", {"tipo": "capitulo", "n": "PARTE DOIS", "txt": "A CIDADE FECHA"}),
    F("No dia vinte e dois de outubro, os jornais anunciam as primeiras mortes.", linha(2)),
    F("E São Paulo começa a fechar.", {"tipo": "carimbo_doc", "titulo": "SÃO PAULO · OUTUBRO DE 1918", "txt": "FECHADO"}),
    F("Escolas fechadas. Depois, as faculdades.", {"tipo": "lista", "titulo": "FECHADOS", "itens": ["Escolas", "Faculdades"]}),
    F("Teatros e cinemas. Concertos de banda. Os jardins públicos.", {"tipo": "lista", "titulo": "FECHADOS", "itens": ["Escolas", "Faculdades", "Teatros e cinemas", "Concertos e jardins"]}),
    F("Até as missas e as reuniões religiosas diminuem.", foto('procissao')),
    F("E as autoridades pedem uma coisa que parece estranha para mil novecentos e dezoito.", {"tipo": "carimbo_doc", "titulo": "AVISO À POPULAÇÃO", "txt": "SEM APERTO DE MÃO"}),
    F("Nada de aperto de mão. Nada de abraço. Nada de beijo.", {"tipo": "lista", "titulo": "EVITE", "itens": ["Aperto de mão", "Abraço", "Beijo"]}),
    F("As escolas vazias viram postos médicos, com médicos, remédio e comida.", {"tipo": "documento", "titulo": "POSTO DE SOCORRO", "txt": "Escola transformada em posto médico. Atendimento, remédios e comida.", "carimbo": "POSTO"}),
    F("Em outras cidades do mundo, auditórios inteiros viraram hospital.", foto('oakland', w=1150, ar=0.66)),
    F("E se a fábrica fecha, ou se você fica doente, você não recebe.", barras(70, 15, 50, "SEM SALÁRIO")),
]

cap3 = [
    F("Parte três. O pior dia.", {"tipo": "capitulo", "n": "PARTE TRÊS", "txt": "O PIOR DIA"}),
    F("A gripe de mil novecentos e dezoito não é uma gripe comum.", foto('enfermaria')),
    F("Febre alta, dor no corpo inteiro. E, em muitos casos, pneumonia.", barras(40, 15, 40, "FEBRE")),
    F("E ela mata muita gente jovem. Gente da sua idade.", foto('engraxates')),
    F("No fim de outubro, as mortes disparam.", {"tipo": "carimbo_doc", "titulo": "SÃO PAULO · FIM DE OUTUBRO", "txt": "AS MORTES DISPARAM"}),
    F("E então chega o quatro de novembro.", linha(3)),
    F("Num único dia, são sete mil setecentos e oitenta e seis doentes.", {"tipo": "numero", "txt": "7.786", "rotulo": "doentes em 4 de novembro"}),
    F("E cento e setenta e dois mortos.", {"tipo": "numero", "txt": "172", "rotulo": "mortos em 4 de novembro"}),
    F("Em quase toda casa tem alguém de cama. Muita gente não consegue trabalhar.", foto('belavista')),
    F("Se você ficou doente no começo de novembro, o seu painel está assim.", barras(25, 10, 35, "4 DE NOVEMBRO")),
    F("Em meados de novembro, a curva finalmente vira.", linha(4)),
    F("E no fim do mês, as mortes começam a cair.", {"tipo": "carimbo_doc", "titulo": "SÃO PAULO · FIM DE NOVEMBRO", "txt": "A CURVA CAI"}),
]

cap4 = [
    F("Parte quatro. O veredito.", {"tipo": "capitulo", "n": "PARTE QUATRO", "txt": "O VEREDITO"}),
    F("Quando a gripe passa, São Paulo faz as contas.", {"tipo": "documento", "titulo": "SERVIÇO SANITÁRIO · BALANÇO", "txt": "Doentes, mortos e população da cidade em 1918."}),
    F("A cidade tinha quinhentos e vinte e oito mil habitantes.", {"tipo": "numero", "txt": "528 mil", "rotulo": "habitantes de São Paulo"}),
    F("Pelo menos cento e dezesseis mil ficaram doentes. Mais de um em cada cinco.", {"tipo": "numero", "txt": "116 mil", "rotulo": "doentes, pelo menos"}),
    F("E os mortos oficiais foram cinco mil trezentos e trinta e um.", {"tipo": "numero", "txt": "5.331", "rotulo": "mortos oficiais"}),
    F("Cerca de um por cento da cidade. Em menos de dois meses.", {"tipo": "comparacao", "a": "DOENTES", "va": DOENTES, "b": "MORTOS", "vb": MORTOS, "ate": "b"}),
    F("E a gripe não escolheu classe. Rodrigues Alves tinha sido eleito presidente do Brasil em mil novecentos e dezoito.", foto('ra')),
    F("Pegou a gripe, e morreu em janeiro de mil novecentos e dezenove, antes de tomar posse.", {"tipo": "carimbo_doc", "titulo": "PRESIDENTE ELEITO · RODRIGUES ALVES", "txt": "NÃO TOMOU POSSE"}),
    F("Então, quanto você dura?", {"tipo": "titulo", "txt": "QUANTO\nVOCÊ DUROU?"}),
    F(f"A chance de pegar a gripe era alta. Mais de uma em cada cinco pessoas.", barras(30, 10, 40, "1 EM CADA 5 ADOECEU")),
    F(f"Mas, entre os doentes registrados, morreram cerca de quatro ou cinco em cada cem.", {"tipo": "numero", "txt": "4,6%", "rotulo": "dos doentes morreram"}),
    F("Então, se você ficou longe das aglomerações e teve sorte, provavelmente atravessou novembro. Fraco, sem dinheiro, mas vivo.", barras(60, 10, 60, "VIVO")),
    F("E se ficou doente no pior momento, sem cama e sem médico, as suas chances caíam muito.", barras(10, 5, 20, "O PIOR MOMENTO")),
    F("No mundo, a gripe de mil novecentos e dezoito matou dezenas de milhões de pessoas.", foto('policia')),
    F("Com fotos e documentos reais da época, essa foi a sua chance.", {"tipo": "mesa", "fotos": [A['se'], A['oakland'], A['mercado'], A['enfermaria'], A['belavista']], "txt": "FOTOS E DOCUMENTOS REAIS"}),
    F("E você? Ficaria em casa, ou iria trabalhar mesmo assim? Me conta nos comentários.", {"tipo": "escolha", "a": "FICAR EM CASA", "b": "TRABALHAR", "txt": "COMENTE A SUA", "quando": "OUTUBRO DE 1918"}),
    F("E se inscreve, porque no próximo, você acorda em outra época do Brasil.", {"tipo": "fim"}),
]

spec = {
    "id": "qvd003a", "canal": "quanto-voce-dura", "titulo": "Você acorda em São Paulo, 1918, na gripe espanhola. Quanto tempo você dura?",
    "motor": "piper", "voz": "cadu", "velocidade": 0.95, "lang": "pt-br", "legenda": True, "acento": "#e9c46a", "marca": "QUANTO VOCÊ DURA?", "trilha": 0.13, "cauda": 4.0,
    "numeros": {"mil novecentos e dezoito": "1918", "mil novecentos e dezenove": "1919", "nove de outubro": "9 de outubro", "treze": "13", "vinte e dois de outubro": "22 de outubro",
                "quatro de novembro": "4 de novembro", "sete mil setecentos e oitenta e seis": "7.786", "cento e setenta e dois": "172",
                "quinhentos e vinte e oito mil": "528 mil", "cento e dezesseis mil": "116 mil", "cinco mil trezentos e trinta e um": "5.331", "um por cento": "1%"},
    "blocos": [],
}
nomes = {1: 'A notícia que vem de longe', 2: 'A cidade fecha', 3: 'O pior dia', 4: 'O veredito'}
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
print(len(txt.split()), 'palavras', sum(len(b['falas']) for b in spec['blocos']), 'falas', 'letalidade', round(MORTOS / DOENTES * 100, 1), 'mortos/pop', round(MORTOS / POP * 100, 2))
faltam = [k for k, a in A.items() if not os.path.exists(PUB + a)]
print('fotos faltando:', faltam)

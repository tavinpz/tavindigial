"""Quanto Você Dura? #001 (direção de arte nova, composição Arte): Rio de Janeiro, novembro de 1904.
Fatos conferidos: Wikipédia (Revolta da Vacina), Agência Brasil (Oswaldo Cruz, 2022). Fotos: domínio público
(Augusto Malta / IMS, imprensa de 1904) e Wellcome Collection (CC BY 4.0). Voz: Piper cadu (aprovada).
Cada fala = um visual. Blocos = capítulos.
"""
import json, os

A = {  # apelidos das fotos
    'virado': 'bonde_virado_revolta_da_vacina_jpg.jpg', 'depredado': 'bonde_revolta_da_vacina_jpg.jpg',
    'charge': 'guerra_vaccino_obrigateza_jpg.jpg', 'noite14': 'na_noite_de_14_sucessos_lament_veis_jpg.jpg',
    'pracaxv': 'mictorio_pracaxv_augustomalta_1904_jpg.jpg', 'canteiro': 'canteiro_de_obras_pr_ximo_ao_largo_da_mi.jpg',
    'avenida': 'avenida_central_2_acervo_do_instituto_mo.jpg', 'se': 'bonde_em_frente_a_igreja_do_sant_ssimo_s.jpg',
    'porto': 'cais_do_porto_2_acervo_do_instituto_more.jpg', 'largo': 'antigo_largo_do_pa_o_mercado_da_praia_do.jpg',
    'arsenal': 'arsenal_da_marinha_antigo_arsenal_de_gue.jpg', 'ilha': 'ba_a_de_guanabara_vista_da_ilha_das_cobr.jpg',
    'gloria': 'demoli_o_do_mercado_da_gl_ria_ao_fundo_o.jpg', 'carroca': 'horses_and_carriages_yellow_fever_prophy.jpg',
    'hospital': 'hospital_st_sebastiao_isolating_yellow_f.jpg', 'desinfeta': 'man_with_clayton_disinfector_wellcome_l0.jpg',
    'telhado': 'spraying_roofs_to_prevent_yellow_fever_w.jpg',
}
LEG = {
    'virado': 'Bonde virado na Revolta da Vacina, novembro de 1904', 'depredado': 'Bonde depredado, novembro de 1904',
    'charge': 'Charge “Guerra Vaccino-Obrigateza!”, outubro de 1904', 'noite14': '“Na noite de 14”: ilustração publicada em 26/11/1904',
    'pracaxv': 'Praça XV, 1904 · Foto: Augusto Malta', 'canteiro': 'Obras no centro do Rio, começo do século XX · Acervo IMS',
    'avenida': 'Avenida Central, depois de pronta · Acervo IMS', 'se': 'Bonde no centro do Rio, começo do século XX · Acervo IMS',
    'porto': 'Cais do porto do Rio, começo do século XX · Acervo IMS', 'largo': 'Largo do Paço e mercado do peixe, c. 1900–1910 · Acervo IMS',
    'arsenal': 'Arsenal de Marinha, centro do Rio · Acervo IMS', 'ilha': 'Baía de Guanabara vista da Ilha das Cobras, c. 1902',
    'gloria': 'Demolição do mercado da Glória, começo do século XX', 'carroca': 'Equipe contra a febre amarela, 1909 · Wellcome Collection',
    'hospital': 'Hospital de isolamento da febre amarela, 1909 · Wellcome Collection', 'desinfeta': 'Homem com desinfetador · Wellcome Collection',
    'telhado': 'Brigada pulverizando telhados contra o mosquito · Wellcome Collection',
}
_rot = [0]
def foto(k, **kw):
    _rot[0] += 1
    r = [-2.5, 1.8, -1.2, 2.4, -2.0][_rot[0] % 5]
    d = {"tipo": "foto", "arq": A[k], "leg": LEG[k], "rot": r, "entra": ["cai", "dir", "esq", "cai"][_rot[0] % 4], "zoom": kw.pop('zoom', None)}
    d.update(kw)
    return d
def F(t, v): return (t, v)
def barras(s, d, g, txt=None):  # saúde, dinheiro, segurança (0–100)
    return {"tipo": "barras", "s": s, "d": d, "g": g, "txt": txt}

intro = [
    F("Rio de Janeiro, treze de novembro de mil novecentos e quatro.", {"tipo": "data", "txt": "RIO DE JANEIRO", "sub": "13 de novembro de 1904"}),
    F("Os bondes estão pegando fogo.", foto('virado', w=1060, ar=0.56)),
    F("E você acabou de acordar aqui.", foto('se')),
    F("Sem dinheiro, e sem conhecer ninguém.", {"tipo": "bolso"}),
    F("Quanto tempo você dura?", {"tipo": "titulo", "txt": "QUANTO TEMPO\nVOCÊ DURA?"}),
    F("Funciona assim. Você é um trabalhador do porto.", foto('porto')),
    F("E mora num cortiço no centro da cidade.", foto('largo', zoom=[0.6, 0.5])),
    F("Tudo o que vai acontecer com você aconteceu de verdade, com números de verdade.", {"tipo": "documento", "titulo": "FONTES DESTE VÍDEO", "txt": "Registros oficiais da revolta, jornais e fotografias de 1904."}),
    F("E você acompanha três coisas. Sua saúde. Seu dinheiro. E sua segurança.", barras(80, 40, 70)),
    F("Se qualquer uma delas zerar, acabou.", barras(80, 40, 70, "SE ZERAR, ACABOU")),
]

cap1 = [
    F("Parte um. A cidade que mata.", {"tipo": "capitulo", "n": "PARTE UM", "txt": "A CIDADE QUE MATA"}),
    F("O Rio é a capital do Brasil, e não para de crescer.", foto('avenida', zoom=[0.3, 0.6])),
    F("Em mil oitocentos e noventa, eram quinhentos e vinte e dois mil moradores.", {"tipo": "numero", "txt": "522 mil", "rotulo": "moradores do Rio em 1890"}),
    F("Em mil novecentos e seis, já seriam oitocentos e onze mil.", {"tipo": "numero", "txt": "811 mil", "rotulo": "moradores do Rio em 1906"}),
    F("E muita gente se espreme no centro, perto do porto, onde está o trabalho.", foto('porto', zoom=[0.7, 0.4])),
    F("Em cortiços. Casarões velhos divididos em quartos minúsculos.", foto('largo', zoom=[0.3, 0.6])),
    F("Uma família inteira em cada quarto. E as doenças moram junto.", barras(65, 40, 70)),
    F("A primeira ameaça é a varíola.", {"tipo": "carimbo_doc", "titulo": "AMEAÇA Nº 1", "txt": "VARÍOLA"}),
    F("Febre alta. O corpo coberto de bolhas. Quem sobrevive fica marcado.", foto('hospital')),
    F("Só em mil novecentos e quatro, a varíola matou cerca de três mil e quinhentas pessoas no Rio.", {"tipo": "numero", "txt": "3.500", "rotulo": "mortos de varíola no Rio em 1904"}),
    F("A segunda ameaça é a febre amarela, transmitida por um mosquito.", {"tipo": "carimbo_doc", "titulo": "AMEAÇA Nº 2", "txt": "FEBRE AMARELA"}),
    F("Em mil novecentos e dois, ela matava cerca de mil pessoas por ano na cidade.", {"tipo": "numero", "txt": "1.000", "rotulo": "mortos por ano · febre amarela, 1902"}),
    F("E a terceira, a peste bubônica, espalhada pelas pulgas dos ratos.", {"tipo": "carimbo_doc", "titulo": "AMEAÇA Nº 3", "txt": "PESTE BUBÔNICA"}),
    F("Três epidemias ao mesmo tempo, na mesma cidade.", barras(45, 40, 70, "SAÚDE EM QUEDA")),
    F("Para enfrentar isso, o governo chamou um médico de pouco mais de trinta anos.", {"tipo": "ficha", "linhas": [["NOME", "Oswaldo Cruz"], ["IDADE", "30 e poucos"], ["CARGO", "Saúde Pública"]], "rodape": "Diretor-geral de Saúde Pública desde 1903", "titulo": "FICHA · OSWALDO CRUZ"}),
    F("Oswaldo Cruz, diretor-geral de Saúde Pública.", {"tipo": "documento", "titulo": "DIRETORIA GERAL DE SAÚDE PÚBLICA", "txt": "Diretor-geral: Oswaldo Cruz. Desde 1903."}),
    F("Ele tinha estudado no Instituto Pasteur, em Paris. O primeiro brasileiro a fazer isso.", {"tipo": "ficha", "linhas": [["FORMAÇÃO", "Instituto Pasteur"], ["CIDADE", "Paris"], ["VOLTA", "1899"]], "rodape": "Primeiro brasileiro no Instituto Pasteur", "titulo": "FICHA · OSWALDO CRUZ"}),
    F("Voltou ao Brasil em mil oitocentos e noventa e nove. E agora tem uma cidade inteira para limpar.", foto('largo', zoom=[0.5, 0.4])),
    F("E ele declara guerra aos ratos.", {"tipo": "numero", "txt": "150", "rotulo": "ratos por mês: a cota de cada funcionário"}),
    F("Cada funcionário tinha que entregar pelo menos cento e cinquenta ratos por mês.", {"tipo": "carimbo_doc", "titulo": "ORDEM DE SERVIÇO", "txt": "150 RATOS / MÊS"}),
    F("E o governo passou a comprar rato de quem matasse um.", {"tipo": "bolso", "modo": "rato"}),
    F("Pela primeira vez, rato vira dinheiro. E isso diz muito sobre a cidade em que você acordou.", barras(45, 45, 50, "RATO VIRA DINHEIRO")),
    F("Contra o mosquito, entram as brigadas sanitárias.", foto('carroca')),
    F("Elas percorrem a cidade com inseticida, atrás de larvas.", foto('telhado')),
    F("E entram nas casas.", foto('desinfeta')),
    F("O dono de uma casa considerada insalubre pode ser obrigado a reformar. Ou a demolir.", {"tipo": "documento", "titulo": "INTIMAÇÃO", "txt": "Reformar ou demolir o imóvel considerado insalubre.", "carimbo": "INTIMADO"}),
    F("Para você, isso quer dizer uma coisa. A qualquer hora, o governo pode entrar no seu quarto.", barras(45, 40, 50, "SEGURANÇA EM QUEDA")),
    F("E não é só a saúde.", foto('gloria')),
    F("Ao mesmo tempo, o prefeito Pereira Passos está rasgando o centro da cidade.", foto('canteiro')),
    F("Ruas alargadas. Cortiços derrubados. Os pobres empurrados para longe do centro.", foto('gloria', zoom=[0.6, 0.6])),
    F("É ali que vai nascer a Avenida Central.", foto('avenida')),
    F("O cortiço do lado foi demolido. O seu pode ser o próximo.", barras(45, 30, 40, "SEU CORTIÇO PODE CAIR")),
]

cap2 = [
    F("Parte dois. A lei.", {"tipo": "capitulo", "n": "PARTE DOIS", "txt": "A LEI"}),
    F("Trinta e um de outubro de mil novecentos e quatro.", {"tipo": "linha", "datas": [["31/10", "Lei"]], "ativo": 0}),
    F("O Congresso aprova a lei que torna obrigatória a vacina contra a varíola.", {"tipo": "documento", "titulo": "LEI DE 31 DE OUTUBRO DE 1904", "txt": "Vacinação obrigatória contra a varíola em todo o país.", "carimbo": "OBRIGATÓRIA"}),
    F("Cinco de novembro. É fundada a Liga Contra a Vacina Obrigatória.", {"tipo": "linha", "datas": [["31/10", "Lei"], ["5/11", "Liga contra"]], "ativo": 1}),
    F("Os jornais de oposição atacam a lei sem parar.", foto('charge')),
    F("Nove de novembro. Hoje.", {"tipo": "linha", "datas": [["31/10", "Lei"], ["5/11", "Liga contra"], ["9/11", "Regulamento"]], "ativo": 2}),
    F("O jornal A Notícia publica o plano do regulamento da vacina.", {"tipo": "documento", "titulo": "A NOTÍCIA · 9 DE NOVEMBRO DE 1904", "txt": "Publicado o plano do regulamento da vacinação obrigatória."}),
    F("E a cidade lê o que vem por aí.", {"tipo": "lista", "titulo": "COMPROVANTE DE VACINA PARA:", "itens": []}),
    F("Comprovante de vacina para matricular os filhos na escola.", {"tipo": "lista", "titulo": "COMPROVANTE DE VACINA PARA:", "itens": ["matricular na escola"]}),
    F("Para trabalhar no governo, ou numa fábrica.", {"tipo": "lista", "titulo": "COMPROVANTE DE VACINA PARA:", "itens": ["matricular na escola", "emprego público ou fábrica"]}),
    F("Para se hospedar, para viajar.", {"tipo": "lista", "titulo": "COMPROVANTE DE VACINA PARA:", "itens": ["matricular na escola", "emprego público ou fábrica", "hotel, pensão e viagem"]}),
    F("Para casar. E até para votar.", {"tipo": "lista", "titulo": "COMPROVANTE DE VACINA PARA:", "itens": ["matricular na escola", "emprego público ou fábrica", "hotel, pensão e viagem", "casar e votar"]}),
    F("E multa para quem recusar.", {"tipo": "carimbo_doc", "titulo": "QUEM RECUSAR", "txt": "MULTA"}),
    F("Na sua rua, ninguém confia no governo.", foto('pracaxv')),
    F("As mesmas pessoas que derrubam casas agora querem furar o seu braço.", barras(45, 30, 35)),
    F("E a oposição espalha um argumento que pega fogo.", foto('charge', zoom=[0.55, 0.45])),
    F("Que a vacina obrigaria esposas e filhas a se despir na frente de estranhos.", {"tipo": "documento", "titulo": "O ARGUMENTO DA OPOSIÇÃO", "txt": "A vacina seria uma ofensa à honra das famílias."}),
    F("Numa cidade com medo, um argumento assim vale mais que um decreto.", foto('noite14', zoom=[0.4, 0.5])),
    F("E agora você tem que escolher. Vacina, ou barricada?", {"tipo": "escolha", "a": "VACINA", "b": "BARRICADA"}),
]

cap3 = [
    F("Parte três. Sete dias de guerra.", {"tipo": "capitulo", "n": "PARTE TRÊS", "txt": "SETE DIAS DE GUERRA"}),
    F("Dez de novembro. Começa.", {"tipo": "linha", "datas": [["10/11", "Começa"]], "ativo": 0}),
    F("Grupos se juntam no centro. A polícia ataca. A multidão revida.", foto('noite14')),
    F("Em poucas horas, a briga se espalha por bairros inteiros.", foto('se', zoom=[0.5, 0.4])),
    F("No bairro da Saúde, perto do porto, levantam barricadas no meio da rua.", foto('porto', zoom=[0.4, 0.6])),
    F("Na avenida Passos e nas ruas em volta, também.", {"tipo": "mapa_rio"}),
    F("Treze de novembro. A cidade parou.", {"tipo": "linha", "datas": [["10/11", "Começa"], ["13/11", "A cidade para"]], "ativo": 1}),
    F("Ninguém trabalha. E você não recebe.", barras(45, 10, 30, "SEM SALÁRIO")),
    F("Até o fim do dia, a companhia de bondes vai contar vinte e dois carros destruídos.", foto('depredado', w=760, ar=1.1, lado=-300, selo="22", selo_sub="BONDES DESTRUÍDOS ATÉ 13/11", selo_em=0.35)),
    F("Mais de cem lampiões de gás são quebrados.", {"tipo": "numero", "txt": "+100", "icone": "lampiao", "rotulo": "lampiões de gás danificados"}),
    F("E mais de setecentos ficam fora de serviço.", {"tipo": "numero", "txt": "+700", "icone": "lampiao", "rotulo": "lampiões fora de serviço"}),
    F("Cortam os fios da iluminação elétrica da Avenida Central.", foto('avenida', zoom=[0.6, 0.3])),
    F("Ruas inteiras ficam no escuro.", {"tipo": "escuro"}),
    F("Atacam delegacias, a fábrica de gás, lojas de armas.", {"tipo": "ficha", "linhas": [["DELEGACIAS", "atacadas"], ["FÁBRICA DE GÁS", "atacada"], ["LOJAS DE ARMAS", "atacadas"]], "rodape": "13 de novembro de 1904", "titulo": "ALVOS DA REVOLTA"}),
    F("E na madrugada do dia catorze para o quinze, ainda há uma tentativa de golpe militar.", {"tipo": "documento", "titulo": "14–15 DE NOVEMBRO", "txt": "Militares tentam tomar o poder durante a revolta.", "carimbo": "FRACASSA"}),
    F("Ela fracassa.", foto('arsenal')),
    F("E a revolta não para. Atacam o Moinho Inglês, uma fábrica de farinha.", {"tipo": "ficha", "linhas": [["MOINHO INGLÊS", "atacado"], ["FÁBRICA DE VELAS", "atacada"], ["BARCA DE PETRÓPOLIS", "atacada"]], "rodape": "Revolta da Vacina, novembro de 1904", "titulo": "ALVOS DA REVOLTA"}),
    F("Uma fábrica de velas. E até a barca de Petrópolis.", foto('porto', zoom=[0.2, 0.5])),
    F("Na rua Senador Dantas, arrancam as árvores que tinham acabado de ser plantadas.", foto('canteiro', zoom=[0.5, 0.5])),
    F("E viram as carroças das obras públicas no meio da rua.", foto('gloria', zoom=[0.3, 0.4])),
    F("Dezesseis de novembro.", {"tipo": "linha", "datas": [["10/11", "Começa"], ["13/11", "A cidade para"], ["16/11", "Estado de sítio"]], "ativo": 2}),
    F("O governo decreta estado de sítio.", {"tipo": "carimbo_doc", "titulo": "16 DE NOVEMBRO DE 1904", "txt": "ESTADO DE SÍTIO"}),
    F("E, no mesmo dia, suspende a vacinação obrigatória.", {"tipo": "documento", "titulo": "16 DE NOVEMBRO DE 1904", "txt": "A vacinação obrigatória é suspensa.", "carimbo": "SUSPENSA"}),
    F("O saldo oficial.", {"tipo": "ficha", "linhas": [["MORTOS", "30"], ["FERIDOS", "110"], ["PRESOS", "945"]], "rodape": "10 a 16 de novembro de 1904"}),
    F("Trinta mortos. Cento e dez feridos.", {"tipo": "ficha", "linhas": [["MORTOS", "30"], ["FERIDOS", "110"], ["PRESOS", "945"]], "rodape": "10 a 16 de novembro de 1904"}),
    F("Novecentas e quarenta e cinco pessoas presas.", {"tipo": "numero", "txt": "945", "rotulo": "presos na Revolta da Vacina"}),
    F("Levadas para a Ilha das Cobras, no meio da baía.", foto('ilha')),
    F("Os presos que foram para lá sofreram maus-tratos.", foto('ilha', zoom=[0.3, 0.6])),
    F("Quatrocentos e sessenta e um deles, os que tinham antecedentes criminais,", {"tipo": "numero", "txt": "461", "rotulo": "com antecedentes criminais"}),
    F("foram embarcados em navios e mandados para o Acre.", {"tipo": "mapa", "txt": "461", "sub": "DEPORTADOS PARA O ACRE"}),
    F("Sete estrangeiros também foram expulsos do país.", {"tipo": "numero", "txt": "7", "rotulo": "estrangeiros deportados"}),
    F("E os outros quatrocentos e oitenta e um foram soltos.", {"tipo": "numero", "txt": "481", "rotulo": "presos libertados"}),
    F("A milhares de quilômetros de casa.", {"tipo": "mapa", "txt": "461", "sub": "DEPORTADOS PARA O ACRE"}),
    F("Então, se você foi para a barricada, as chances de ser preso eram reais.", barras(40, 10, 5, "BARRICADA: PRESO")),
    F("E ser preso podia significar o Acre. Uma viagem só de ida.", {"tipo": "carimbo_doc", "titulo": "DESTINO", "txt": "ACRE"}),
]

cap4 = [
    F("Parte quatro. O veredito.", {"tipo": "capitulo", "n": "PARTE QUATRO", "txt": "O VEREDITO"}),
    F("Agora, o número que muda tudo.", {"tipo": "escolha", "a": "REVOLTA", "b": "VARÍOLA"}),
    F("A revolta matou trinta pessoas.", {"tipo": "comparacao", "a": "A REVOLTA", "va": 30, "b": "A VARÍOLA, 1904", "vb": 3500, "ate": "a"}),
    F("A varíola, a doença que a vacina queria parar, matou cerca de três mil e quinhentas no mesmo ano.", {"tipo": "comparacao", "a": "A REVOLTA", "va": 30, "b": "A VARÍOLA, 1904", "vb": 3500, "ate": "b"}),
    F("Mais de cem vezes mais.", {"tipo": "numero", "txt": "×100", "rotulo": "a varíola matou mais de cem vezes mais"}),
    F("E sem a vacina obrigatória, a doença voltou.", foto('hospital', zoom=[0.6, 0.5])),
    F("Em mil novecentos e oito, uma nova epidemia de varíola matou quase seis mil e quatrocentas pessoas no Rio.", {"tipo": "numero", "txt": "6.400", "rotulo": "mortos de varíola no Rio em 1908"}),
    F("Quase o dobro de mil novecentos e quatro.", {"tipo": "comparacao", "a": "VARÍOLA, 1904", "va": 3500, "b": "VARÍOLA, 1908", "vb": 6400, "ate": "b"}),
    F("E Oswaldo Cruz? A guerra contra a peste deu certo.", {"tipo": "carimbo_doc", "titulo": "PESTE BUBÔNICA", "txt": "VENCIDA"}),
    F("Entre mil novecentos e três e mil novecentos e nove, as mortes por peste caíram mais de vinte vezes.", {"tipo": "numero", "txt": "÷20", "rotulo": "mortes por peste, 1903 a 1909"}),
    F("Em mil novecentos e sete, a febre amarela deixou de ser epidemia no Rio.", {"tipo": "carimbo_doc", "titulo": "FEBRE AMARELA · 1907", "txt": "FIM DA EPIDEMIA"}),
    F("E ele ganhou o prêmio principal de um congresso de higiene em Berlim.", {"tipo": "documento", "titulo": "BERLIM · 1907", "txt": "14º Congresso Internacional de Higiene e Demografia: prêmio principal para Oswaldo Cruz."}),
    F("O médico que a cidade odiou em mil novecentos e quatro morreu em mil novecentos e dezessete, com quarenta e quatro anos.", {"tipo": "ficha", "linhas": [["NOME", "Oswaldo Cruz"], ["MORTE", "1917"], ["IDADE", "44 anos"]], "rodape": "Diretor-geral de Saúde Pública", "titulo": "FICHA · OSWALDO CRUZ"}),
    F("Então, quanto tempo você dura?", {"tipo": "titulo", "txt": "QUANTO TEMPO\nVOCÊ DURA?"}),
    F("Se você ficou longe das barricadas e tomou a vacina, provavelmente atravessou novembro inteiro.", barras(70, 15, 60, "VACINA: VIVO")),
    F("Com fome. Sem salário. Com medo. Mas vivo.", {"tipo": "bolso"}),
    F("Se foi para a barricada, você tinha boas chances de parar na Ilha das Cobras.", foto('ilha')),
    F("E talvez num navio para o Acre.", {"tipo": "mapa", "txt": "461", "sub": "DEPORTADOS PARA O ACRE"}),
    F("E se escapou da revolta, mas não se vacinou?", {"tipo": "escolha", "a": "VACINA", "b": "SEM VACINA"}),
    F("O perigo de verdade continuava andando pelas ruas. E ele matava muito mais.", barras(10, 15, 60, "SEM VACINA: O MAIOR RISCO")),
    F("A Avenida Central ficou pronta e virou o cartão-postal da cidade.", foto('avenida')),
    F("E a varíola? O último caso no Brasil foi em mil novecentos e setenta e um.", {"tipo": "carimbo_doc", "titulo": "VARÍOLA · BRASIL", "txt": "ÚLTIMO CASO: 1971"}),
    F("Em mil novecentos e oitenta, ela foi declarada erradicada do planeta.", {"tipo": "carimbo_doc", "titulo": "VARÍOLA · MUNDO", "txt": "ERRADICADA: 1980"}),
    F("Com fotos e documentos reais da época, essa foi a sua chance.", {"tipo": "mesa", "fotos": [A['virado'], A['charge'], A['se'], A['noite14'], A['avenida']], "txt": "FOTOS E DOCUMENTOS REAIS"}),
    F("E você, o que teria feito? Vacina ou barricada? Me conta nos comentários.", {"tipo": "escolha", "a": "VACINA", "b": "BARRICADA", "txt": "COMENTE A SUA"}),
    F("E se inscreve, porque no próximo, você acorda em outra época do Brasil.", {"tipo": "fim"}),
]

spec = {
    "id": "qvd001a", "canal": "quanto-voce-dura", "titulo": "Você acorda no Rio de 1904, no meio da Revolta da Vacina. Quanto tempo você dura?",
    "motor": "piper", "voz": "cadu", "velocidade": 0.95, "lang": "pt-br", "legenda": True, "acento": "#e9c46a", "marca": "QUANTO VOCÊ DURA?", "trilha": 0.13, "cauda": 4.0,
    "numeros": {"treze de novembro de mil novecentos e quatro": "13 de novembro de 1904", "mil oitocentos e noventa": "1890", "mil novecentos e seis": "1906",
                "quinhentos e vinte e dois mil": "522 mil", "oitocentos e onze mil": "811 mil", "mil novecentos e quatro": "1904", "três mil e quinhentas": "3.500",
                "mil novecentos e dois": "1902", "cento e cinquenta": "150", "trinta e um de outubro": "31 de outubro", "cinco de novembro": "5 de novembro",
                "nove de novembro": "9 de novembro", "dez de novembro": "10 de novembro", "treze de novembro": "13 de novembro", "dezesseis de novembro": "16 de novembro",
                "vinte e dois": "22", "cem": "100", "setecentos": "700", "catorze": "14", "quinze": "15", "trinta": "30", "cento e dez": "110",
                "novecentas e quarenta e cinco": "945", "quatrocentos e sessenta e um": "461", "mil novecentos e oito": "1908", "seis mil e quatrocentas": "6.400",
                "mil novecentos e sete": "1907", "mil oitocentos e noventa e nove": "1899", "quatrocentos e oitenta e um": "481", "mil novecentos e três": "1903", "mil novecentos e nove": "1909", "mil novecentos e dezessete": "1917", "quarenta e quatro": "44", "vinte vezes": "20 vezes", "mil novecentos e setenta e um": "1971", "mil novecentos e oitenta": "1980"},
    "blocos": [],
}
nomes = {1: 'A cidade que mata', 2: 'A lei', 3: 'Sete dias de guerra', 4: 'O veredito'}
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

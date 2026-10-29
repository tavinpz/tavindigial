# Operação do Concrete Atlas

## Conta
- Gmail dedicado ao canal (ex.: concreteatlas.studio@gmail.com), com verificação em 2 etapas.
- Canal criado como **conta de marca** ("usar um nome personalizado"): permite vários donos e transferir/vender o canal depois.
- Verificar telefone em youtube.com/verify (libera capa personalizada e vídeos acima de 15 min).
- AdSense: um só por pessoa. Todos os canais (este e o de economia) se ligam ao mesmo AdSense, com seus dados reais.
- Nada de VPN para "parecer EUA", comprar views/inscritos ou trocar de país do canal.

## Rotina semanal (1 sessão por semana)
1. Tavin manda 7–8 temas (ou aprova sugestões).
2. Claude pesquisa, manda roteiros em português, Tavin aprova.
3. Claude entrega 7 Shorts + 1 longo (quando entrar o longo) com título, descrição e fontes.
4. Tavin sobe tudo no YouTube Studio e **agenda** 1 Short por dia (ex.: 12h de Nova York = 13h/14h Brasília).
5. Registrar em canal/publicacoes.md.

## Fluxo com o painel (tavindigital.online/painel → Vídeos)
1. Claude pesquisa temas (metade em alta, metade atemporais), confere cada número em fonte aberta e escreve o roteiro com uma pergunta para comentar no meio e a chamada no fim.
2. Claude gera voz, animação e som, renderiza (~10 min por vídeo) e revisa quadro a quadro.
3. `python3 motor/enviar_painel.py` sobe vídeo, capa, título, descrição, legendas de TikTok e Instagram, comentário fixado e dia/hora para o painel.
4. Tavin abre o painel: baixa (ou "Mandar para o app" no celular), posta no YouTube (agendando) e no TikTok, e marca "Postei".
5. Instagram: depois de conectar a conta do canal, é só clicar Agendar no painel; o Reel sai sozinho no horário.

## O que protege a monetização
- Tema escolhido e roteiro aprovado por pessoa (guardar o registro).
- Cada vídeo com estrutura e visual próprios; variar tipos de cena.
- Fatos com fonte na descrição; nada de notícia do dia ou tragédia explorada.
- Marcar "conteúdo alterado ou sintético: Sim".
- Ritmo humano: 1 Short/dia nas semanas 1–2; no máximo 2/dia depois.
- Pelo menos 1 vídeo longo por semana a partir do mês 2.

## Como os concorrentes crescem (e o que copiamos)
- **Título é metade do jogo.** Fórmulas que mais rendem no nicho: "How [país] Built the Impossible [coisa de $X]", "Why [lugar] Can't…", "The Insane Scale of…", "[$X bilhões] [obra] That…". O maior canal novo do nicho (NextGen Manufacturing, 170 mil inscritos em ~11 meses) cresceu só com títulos e temas assim.
- **Temas que puxam views:** Japão, China, Dubai/Arábia Saudita, Holanda, Egito/Nilo, estreitos (Ormuz, Malaca), obras abandonadas ou com problema, ângulo de dinheiro e de crise.
- **Pergunta no 1º segundo e fim na resposta.** O Short corta assim que responde; nada de enrolação no final (a chamada para seguir dura ~3 s).
- **Séries numeradas** ajudam a pessoa a maratonar: "Impossible Builds #1, #2…".
- **Comentário fixado** em todo vídeo com uma pergunta polêmica ("Qual é mais difícil: o Canal do Panamá ou o de Suez?") + fonte.
- **Ligar o Short a um vídeo relacionado** (campo "Vídeo relacionado" no upload) assim que houver o primeiro longo.
- **Mesmo arquivo no TikTok, Reels e Facebook Reels**, com legenda adaptada — custo zero e testa o tema antes.
- **Volume:** o crescimento estável aparece depois de ~200 Shorts. 1 por dia é o mínimo; o painel do Studio mostra "visualizou vs. deslizou" — acima de 70% visualizou é sinal de gancho bom.

## Monetização (quando chegar)
- YouTube: 1.000 inscritos + 4.000 h de vídeo longo em 12 meses, ou 1.000 + 10 mi de views em Shorts em 90 dias.
- Afiliados: Amazon (livros de engenharia e geografia, globos, mapas, LEGO Architecture), viagens a obras famosas.
- Produto próprio: pôsteres dos mapas (impressão sob demanda), pacote digital de mapas, newsletter semanal com um mapa.
- Patrocínio (a partir de ~10–30 mil inscritos): Ground News, NordVPN, Brilliant e similares compram este público.

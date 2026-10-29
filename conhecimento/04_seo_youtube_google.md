# 04 · SEO no YouTube e no Google

## Onde vêm as views
- **Shorts:** quase tudo vem do feed (deslizar). SEO ajuda pouco no feed; ajuda na **busca**, na aba do canal e no Google. Por isso título e descrição continuam importando, mas o gancho manda.
- **Longos:** busca + sugeridos + página inicial. Aqui SEO e miniatura pesam muito (cliques e tempo assistido decidem até onde o vídeo vai).

## Título
- A palavra de busca principal, escrita como as pessoas buscam ("Panama Canal", "Strait of Hormuz"), no começo quando der.
- Promessa clara + curiosidade. Sem CAPS LOCK inteiro, sem emoji no título.

## Descrição (modelo)
```
[1ª frase = resposta curta com a palavra-chave — é o trecho que aparece na busca e no Google.]
[2–3 frases com os números do vídeo.]

New megaproject every day. Follow @ConcreteAtlas.

Sources:
[link 1]
[link 2]

Concrete Atlas: maps, data and engineering. Every script is researched and fact-checked by a person; the narration is a synthetic voice.

#[lugar] #[assunto] #megaprojects #engineering #geography
```
- **Padrão de hashtags (YouTube, TikTok e Instagram): sempre 5** = 2 do vídeo (lugar + assunto) + as 3 do canal `#megaprojects #engineering #geography`. As 3 primeiras aparecem sobre o título no YouTube. O Instagram aceita no máximo 5 por post (desde dez/2025); o YouTube ignora todas se passar de 15.
- **Tags por vídeo:** campo `yt_tags` no `canal/videos.json` (6–8 termos do vídeo + as tags do canal, até ~450 caracteres); aparece no painel com botão Copiar.
- **Tags padrão do canal** (Studio → Configurações → Padrões de upload → Tags), separadas por vírgula: `megaprojects, engineering, geography, maps, infrastructure, civil engineering, how it was built, explained, megaproject, world geography, concrete atlas`
- Em vídeos longos: **capítulos** com tempo começando em `0:00` (o Google mostra como "momentos-chave" na busca).

## Tags
Peso pequeno hoje. Usar só para variações de escrita e nomes (Panamá/Panama, Three Gorges/Sanxia). Não gastar tempo nisso.

## Legendas e idiomas
- Subir a legenda **.srt corrigida** (temos as falas exatas): melhora busca e acessibilidade, e evita erro em nomes de lugar.
- Traduzir **título e descrição** para português e espanhol (Studio → Idiomas): o vídeo aparece na busca nesses idiomas sem mudar o áudio. Depois testar **áudio dublado** (multi-idioma) nos melhores vídeos.

## Playlists e canal
- Playlists por formato e região ("Impossible Builds", "Why the Map Looks Like This", "Asia's Megaprojects"). Título de playlist também é indexado.
- Trailer do canal (quando houver longo) e seções na página do canal.

## Google (ranquear fora do YouTube)
- O Google mostra vídeos do YouTube na busca, em "Vídeos", "Short videos" e às vezes nas AI Overviews. O que ajuda: título igual à pergunta que a pessoa faz ("Why isn't the Netherlands underwater?"), primeira frase da descrição respondendo, capítulos nos longos, legenda corrigida.
- **Próximo passo de SEO forte:** uma página do Concrete Atlas no nosso site (ex.: tavindigital.online/atlas ou domínio próprio) com um artigo curto por vídeo: o vídeo embutido, o texto com o roteiro, o mapa, as fontes, e marcação `VideoObject` (schema.org). Isso dá ao Google uma página de texto para ranquear e manda tráfego para o canal. Também abre caminho para vender pôsteres dos mapas.
- Medir no Google Search Console (quando houver o site do Atlas).

## Pesquisa de palavra-chave
- vidIQ (pelo conector no Claude): volume e concorrência de palavras, outliers, ideias.
- Autocompletar da busca do YouTube e "As pessoas também perguntam" do Google: perguntas reais para títulos.
- Google Trends: comparar temas e ver o que está subindo (filtro "Pesquisa do YouTube").

## Fontes
- [YouTube SEO in 2026 — vidIQ](https://www.vidiq.com/blog/post/youtube-seo/)

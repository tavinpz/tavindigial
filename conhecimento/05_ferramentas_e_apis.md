# 05 · Ferramentas e APIs

## vidIQ no Claude (o mais útil)
- O vidIQ tem conector oficial (MCP). Dois jeitos:
  1. **Diretório** (mais rápido, só leitura): claude.ai/directory/vidiq → Connect → login no vidIQ.
  2. **Conector personalizado** (todas as ferramentas): Claude → Personalizar → Conectores → Adicionar conector personalizado → nome `vidIQ`, URL `https://mcp.vidiq.com/mcp` → login.
- Na conversa: + → Conectores → ligar vidIQ, e começar o pedido com "Use vidIQ to…".
- O que dá para pedir: palavras-chave (volume/concorrência), **vídeos outliers** do nicho, transcrições, análise do nosso canal (views, retenção, origem do tráfego), temas dos comentários, ideias de título e capítulos. O conector personalizado também pode **editar vídeos nossos** (título, descrição, tags, agendamento, miniatura) — só fazer isso com a aprovação do Tavin, vídeo por vídeo.
- Custo: conectar é grátis em qualquer plano; cada chamada gasta créditos do plano (a maioria 5 créditos). Plano grátis ≈ 150 créditos/mês (≈ 30 pesquisas); Boost ≈ 2.000/mês. Perguntar "How many vidIQ credits do I have left?" para ver o saldo. Créditos acabam = espera o próximo mês, então usar para decisões (escolher temas, títulos), não para curiosidade.

## APIs do Google
- **YouTube Data API v3** (grátis, cota diária de 10.000 unidades): dados públicos de vídeos e canais, busca (cada busca gasta 100 unidades), comentários. Bom para listar outliers de canais concorrentes e acompanhar números. Upload pela API de projeto não auditado fica privado, então o upload continua manual/agendado no Studio.
- **YouTube Analytics API** (grátis, OAuth do canal): retenção, origem do tráfego, inscritos por vídeo. Dá para alimentar o painel com isso no futuro.
- **Google Trends:** site gratuito (trends.google.com, filtro "Pesquisa do YouTube"). A API oficial está em alpha com acesso por inscrição (aberta a testadores em jul/2025); bibliotecas não oficiais (pytrends) quebram com frequência.
- **Google Search Console:** quando o site do Atlas existir.

## Outras plataformas
- **TikTok:** Creator Search Insights (no app, busca → "Creator Search Insights") mostra o que as pessoas buscam e não encontram. A API de postagem gratuita só publica como privado até a auditoria (semanas), então postar no app.
- **Instagram:** o painel posta Reels agendados pela API da Meta depois que o token da conta do canal é salvo em Conexões.

## Nosso painel (tavindigital.online/painel → Vídeos)
- Colunas: Em produção · Para programar · Upload feito · Programado · Postado. Arrastar o cartão muda as 3 redes juntas; clicar numa rede muda só ela.
- Cada vídeo: **Baixar vídeo** (1080×1920, H.264, ~8–9 Mbps, qualidade de upload), capa, título, descrição, legendas TikTok/Instagram, comentário fixado, data.
- Botões: Programei · Já postei · Cancelar · Painel posta sozinho (Instagram). No celular: "Mandar para o app".
- Confere sozinho a cada 30 min (`conferir-postagens`): lê o feed do canal do YouTube e o Instagram, marca como Postado e traz as views. Para isso, o link do canal precisa estar salvo em Conexões.
- Envio de vídeos: `motor/enviar_painel.py` (Storage do Supabase do Tavin Digital, ~1 GB grátis; hoje ~370 MB usados, então apagar do Storage os vídeos já postados há mais de 30 dias quando chegar perto do limite).

## Ideias de automação (fazer quando o canal tiver tração)
- Relatório semanal automático: Analytics API → resumo no WhatsApp/e-mail com os 2 melhores e 2 piores.
- Lista diária de outliers do nicho (Data API) para sugerir temas.
- Página do Atlas no site gerada a partir do `videos.json` (ver `04_seo_youtube_google.md`).

## Fontes
- [How to use vidIQ in Claude — vidIQ](https://vidiq.com/how-to-use-vidiq-in-claude/)
- [vidIQ MCP review — OutlierKit](https://outlierkit.com/resources/vidiq-mcp/)
- [Introducing the Google Trends API (alpha) — Google](https://developers.google.com/search/blog/2025/07/trends-api)

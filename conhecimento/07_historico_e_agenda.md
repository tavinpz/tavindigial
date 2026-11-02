# 07 · Histórico, agenda e decisões

## Situação em 02/11/2026
- 25 Shorts prontos (001–025). 6 já no ar no YouTube (001, 011, 012, 010, 003, 013), 004 e 014 programados no Studio, o resto no painel em "Para programar".
- Fila: 1 por dia às 13h de Brasília, de 02/11 a 20/11, sem buracos. O próximo lote deve começar em **21/11** (ca-026 em diante).
- Canal criado como conta de marca; identidade em `marca/`.
- 001–010: temas atemporais. 011–020: temas em alta. 021–025: família "água e engenharia contra o mar", feitos a partir das métricas dos 3 primeiros dias.

## Métricas dos 3 primeiros dias (30/10 a 01/11, Studio)
- 6 Shorts, 1.304 views. "Why Isn't the Netherlands Underwater?" fez 1.132; os outros de 17 a 85.
- Só 34,6% "continuaram a ver" (65,4% deslizaram). ~10 s assistidos por view em vídeos de 36–53 s.
- 91% das views do feed de Shorts. Público: homens 35–44; 33% das views da Holanda.
- Funcionou: título em pergunta de curiosidade + tema água/engenharia contra o mar.

## Regras do lote 021–025 (valem para os próximos até nova análise)
- 25–35 s (os 5 ficaram entre 31,7 e 34,5 s; o 001 tinha ~45 s).
- Quadro 1 já mostra a própria estrutura (sem o globo de abertura) com a pergunta escrita; a voz fala a pergunta no primeiro segundo.
- Título = pergunta, até 50 caracteres. Um número concreto dito até o segundo 5.
- Loop: sem cartela de logo no fim; a última fala repete a pergunta e a última cena repete a imagem da abertura.
- Motor: cenas novas em `motion/src/scenes/Agua.tsx` (maeslant, tamisa, dique, barragem, polder); no mapa, `instantaneo`, `sem_globo`, `area` (furo de lago, ex.: Flevopolder), `area_modo`, `lago_cor`, `rotas_juntas`; no spec, `gancho_y`, `cauda` e `legenda` (grafia na legenda quando a voz usa grafia fonética, ex.: "Eye-sel-meer" → IJsselmeer).

## Agenda (fonte da verdade: `canal/videos.json`)
| Data | ID | Título |
|---|---|---|
| 30/10 | ca-001 | Why Isn't the Netherlands Underwater? (no ar) |
| 31/10 | ca-011 | A Fifth of the World's Oil Goes Through This Gap (no ar) |
| 31/10 | ca-012 | This Tower Isn't Even Halfway Up Yet (no ar) |
| 01/11 | ca-010 | There's a Cathedral Under Tokyo (no ar) |
| 01/11 | ca-003 | This Ship Cost the World $9.6 Billion a Day (no ar) |
| 01/11 | ca-013 | A $50 Billion AI Data Center in a Town of 2,000 (no ar) |
| 02/11 | ca-008 | How Does Venice Stop the Sea? |
| 03/11 | ca-018 | Why Are They Sinking 89 Blocks Into the Sea? |
| 04/11 | ca-002 | How Do Ships Climb 26 Meters in Panama? |
| 05/11 | ca-004 | This Dam Made Earth's Day Longer (programado no Studio) |
| 06/11 | ca-014 | China's Next Dam Is 3 Times the Three Gorges (programado no Studio) |
| 07/11 | ca-021 | How Do the Dutch Close the Sea? |
| 08/11 | ca-024 | Why Doesn't London Flood? |
| 09/11 | ca-022 | How Did the Dutch Turn a Sea Into a Lake? |
| 10/11 | ca-025 | How Does Singapore Hold Back the Sea? |
| 11/11 | ca-023 | How Did the Dutch Build Land From the Sea? |
| 12/11 | ca-005 | Trains Drive 75 Meters Under the Sea |
| 13/11 | ca-007 | Hong Kong Flattened Two Islands for an Airport |
| 14/11 | ca-019 | Europe and Africa Are Only 14 km Apart |
| 15/11 | ca-015 | Italy Approved This Bridge, Then Blocked It |
| 16/11 | ca-009 | Why You Can't Drive to South America |
| 17/11 | ca-016 | The World's Highest Bridge: 625 m Above the River |
| 18/11 | ca-017 | The 170 km City That Stopped |
| 19/11 | ca-006 | 2,450 Meters of Mountain Above This Train |
| 20/11 | ca-020 | Africa's Biggest Dam and the Fight Over the Nile |

## Decisões já tomadas
- **TikTok:** postagem manual no app (a API gratuita só posta privado até auditoria).
- **Instagram:** pelo painel, agendado, depois de salvar o token da conta do canal em Conexões.
- **Painel conferindo sozinho:** o status muda para Postado e as views chegam sem ninguém marcar.
- **Armazenamento:** vídeos de entrega no Storage do Supabase do Tavin Digital (plano grátis de 1 GB).
- **Motor:** Remotion (`motion/`) é o de produção; o motor antigo de `motor/cenas.py` serve só para a voz e como reserva.
- **Voz:** Kokoro `am_michael` 1.08 (Apache 2.0, uso comercial liberado).
- **Lotes:** o Tavin manda ou aprova os temas; o roteiro sempre passa por ele antes do render.
- **Tema trocado no lote 021–025:** muralhas antitsunami do Japão viraram Afsluitdijk (o tema exigiria o tsunami de 2011 no centro; regra de não explorar tragédia).
- **Títulos em pergunta** nos pendentes da mesma família: 008, 018, 002.

## Próximos passos sugeridos
1. Comparar "continuaram a ver" e retenção dos 021–025 com o 001 depois de 3–5 dias de cada um no ar.
2. Se o formato curto + pergunta + loop ganhar, aplicar no lote 026+ e reeditar os pendentes mais longos.
3. Conectar o vidIQ no Claude e usar para escolher os temas do próximo lote.
4. Mês 2: primeiro vídeo longo (6–12 min) sobre o tema de Short que mais rendeu (hoje: Holanda/água).
5. Série "Dutch vs the Sea" no recurso de séries do Shorts (001, 021, 022, 023).

# 07 · Histórico, agenda e decisões

## Situação em 29/10/2026
- 20 Shorts prontos (001–020), no painel, com título, descrição, fontes, legendas e comentário fixado.
- Postagem começa em **30/10/2026**: 1 por dia às 13h de Brasília, até 18/11. O próximo lote deve começar em **19/11** (ca-021 em diante).
- Canal criado como conta de marca; identidade em `marca/`.
- 001–010: temas atemporais. 011–020: temas em alta, com pergunta para comentar no meio.

## Agenda (fonte da verdade: `canal/videos.json`)
| Data | ID | Título |
|---|---|---|
| 30/10 | ca-001 | Why Isn't the Netherlands Underwater? |
| 31/10 | ca-011 | A Fifth of the World's Oil Goes Through This Gap |
| 01/11 | ca-003 | This Ship Cost the World $9.6 Billion a Day |
| 02/11 | ca-012 | This Tower Isn't Even Halfway Up Yet |
| 03/11 | ca-010 | There's a Cathedral Under Tokyo |
| 04/11 | ca-013 | A $50 Billion AI Data Center in a Town of 2,000 |
| 05/11 | ca-004 | This Dam Made Earth's Day Longer |
| 06/11 | ca-014 | China's Next Dam Is 3 Times the Three Gorges |
| 07/11 | ca-002 | Ships Climb a Lake 26 Meters Above the Sea |
| 08/11 | ca-015 | Italy Approved This Bridge, Then Blocked It |
| 09/11 | ca-009 | Why You Can't Drive to South America |
| 10/11 | ca-016 | The World's Highest Bridge: 625 m Above the River |
| 11/11 | ca-008 | Venice Has a Wall You Can't See |
| 12/11 | ca-017 | The 170 km City That Stopped |
| 13/11 | ca-005 | Trains Drive 75 Meters Under the Sea |
| 14/11 | ca-018 | They're Sinking 89 Giant Blocks Into the Sea |
| 15/11 | ca-006 | 2,450 Meters of Mountain Above This Train |
| 16/11 | ca-019 | Europe and Africa Are Only 14 km Apart |
| 17/11 | ca-007 | Hong Kong Flattened Two Islands for an Airport |
| 18/11 | ca-020 | Africa's Biggest Dam and the Fight Over the Nile |

## Decisões já tomadas
- **TikTok:** postagem manual no app (a API gratuita só posta privado até auditoria).
- **Instagram:** pelo painel, agendado, depois de salvar o token da conta do canal em Conexões.
- **Painel conferindo sozinho:** o status muda para Postado e as views chegam sem ninguém marcar.
- **Armazenamento:** vídeos de entrega no Storage do Supabase do Tavin Digital (plano grátis de 1 GB; ~370 MB usados com os 20).
- **Motor:** Remotion (`motion/`) é o de produção; o motor antigo de `motor/cenas.py` serve só para a voz e como reserva.
- **Voz:** Kokoro `am_michael` 1.08 (Apache 2.0, uso comercial liberado).
- **Lotes:** o Tavin manda ou aprova 7–8 temas por semana; o roteiro sempre passa por ele antes do render.

## Próximos passos sugeridos
1. Depois de 7 dias no ar: primeira análise (ver rotina em `03_viralizacao.md`) e lote 021–027 baseado nos vencedores.
2. Conectar o vidIQ no Claude e usar para escolher os temas do próximo lote.
3. Mês 2: primeiro vídeo longo (6–12 min) sobre o tema de Short que mais rendeu.
4. Página do Atlas no site com um artigo por vídeo (SEO no Google + pôsteres).
5. Legendas .srt e título/descrição em português e espanhol nos vídeos que forem bem.

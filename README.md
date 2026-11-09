# Arquibancada 🏟️

App pessoal (PWA) com placares, notícias e regras de **Futebol, F1, UFC e Basquete (NBA)**, com notificações no celular.

- Tela inicial com 4 botões (foto + nome) → cada esporte tem 3 abas: **Placares**, **Infos gerais** (tabela + notícias) e **Regras** (resumo, novidades 2026, detalhes e "teste sua memória").
- Futebol: Brasileirão, Copa do Brasil, Libertadores, Paulistão, Premier League, La Liga, Champions, Europa League e Seleção (dá pra mudar em Configurações).
- Notificações: lembrete 30 min e 5 min antes, gols/expulsões ao vivo, fim de quarto (NBA), resultados de lutas, resultado final e resumo diário às 8h.

## Dados
- Placares, calendário e tabelas: API pública da ESPN (sem chave).
- Notícias: Google Notícias (RSS em português).

## Variáveis de ambiente (Vercel)
| Nome | O que é |
|---|---|
| `DATABASE_URL` | Banco Neon (Postgres) — guarda inscrições de notificação |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Chaves do Web Push (`npx web-push generate-vapid-keys`) |
| `VAPID_SUBJECT` | `mailto:seu-email` |
| `CRON_SECRET` | Senha do endpoint `/api/cron` |

## Notificações
O endpoint `/api/cron?key=CRON_SECRET` verifica os jogos e envia os avisos. Ele precisa ser chamado a cada minuto
(ex.: cron-job.org grátis) — o GitHub Actions (`.github/workflows/cron.yml`, a cada 5 min) fica como reserva.
`/api/cron?dry=1` mostra os avisos que seriam gerados agora, sem enviar nada.

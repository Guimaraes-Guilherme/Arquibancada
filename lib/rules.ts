import type { SportId } from "./sports";

export type Bloco = { titulo: string; itens: string[] };
export type Flash = { p: string; r: string };
export type Regras = { atualizado: string; resumo: string[]; novidades: Bloco; blocos: Bloco[]; flash: Flash[]; fonte: string };

export const REGRAS: Record<SportId, Regras> = {
  futebol: {
    atualizado: "nov/2026 · Regras do Jogo IFAB 2026/27 (valem desde 1º/jul/2026)",
    fonte: "IFAB (theifab.com) e regulamentos da CBF/Conmebol/UEFA",
    resumo: [
      "2 tempos de 45 min + acréscimos. 11 contra 11.",
      "Vitória = 3 pontos, empate = 1, derrota = 0.",
      "Até 5 substituições, em no máximo 3 paradas (o intervalo não conta).",
      "Amarelo = advertência. 2 amarelos = vermelho. Vermelho = expulso, time fica com 1 a menos.",
      "Impedido: estar à frente da bola E do penúltimo adversário no momento do passe, no campo de ataque.",
    ],
    novidades: {
      titulo: "O que mudou em 2026/27",
      itens: [
        "Contagem de 5 segundos no lateral e no tiro de meta: se demorar, o lateral vai pro adversário e o tiro de meta vira escanteio pro adversário.",
        "Jogador substituído tem 10 segundos para sair. Se enrolar, o reserva só pode entrar depois de 1 minuto de bola rolando.",
        "Jogador atendido em campo (ou que fez o jogo parar por lesão) precisa ficar 1 minuto fora depois do reinício.",
        "VAR agora também revisa: segundo amarelo claramente errado, cartão para o jogador/time errado e (se a competição quiser) escanteio claramente errado.",
        "Se o juiz der vantagem numa chance clara de gol e sair o gol, não tem mais amarelo pra quem fez a falta.",
        "Bola ao chão volta para o time que teria ficado com a posse.",
        "Já valia desde 2025: goleiro com a bola nas mãos por mais de 8 segundos = escanteio para o adversário.",
      ],
    },
    blocos: [
      {
        titulo: "Quando o VAR pode chamar",
        itens: ["Gol (impedimento, falta, mão no lance)", "Pênalti marcado ou não marcado", "Vermelho direto", "Cartão para o jogador errado", "Novo: segundo amarelo claramente errado"],
      },
      {
        titulo: "Mata-mata e desempate",
        itens: [
          "Em jogo de ida e volta, empate no agregado vai pros pênaltis (gol fora de casa não vale mais desde 2021/22 na UEFA e Conmebol).",
          "Pênaltis: 5 cobranças para cada lado; se empatar, alternadas até alguém errar.",
          "Prorrogação (2 × 15 min) só em competições que preveem — ex.: finais únicas da UEFA.",
        ],
      },
      {
        titulo: "Brasileirão Série A",
        itens: ["20 times, 38 rodadas, pontos corridos (turno e returno).", "Quem somar mais pontos é campeão.", "Os 4 últimos caem para a Série B.", "Desempate: vitórias, saldo de gols, gols marcados, confronto direto…"],
      },
      {
        titulo: "Copa do Brasil 2026 (formato novo)",
        itens: [
          "126 clubes — maior edição da história.",
          "Times da Série A entram direto na 5ª fase.",
          "Fases iniciais em jogo único; da 5ª fase até a semi, ida e volta.",
          "Final em JOGO ÚNICO pela primeira vez: 6/dez/2026 no Mané Garrincha (Brasília). Empate → pênaltis.",
          "O vice ganha vaga na fase preliminar da Libertadores 2027.",
        ],
      },
      {
        titulo: "Libertadores",
        itens: ["Fase de grupos: 8 grupos de 4; os 2 primeiros avançam.", "3º colocado do grupo cai para a Sul-Americana.", "Oitavas, quartas e semi em ida e volta.", "Final em jogo único, em sede definida antes."],
      },
      {
        titulo: "Champions e Europa League (formato suíço)",
        itens: [
          "36 times numa tabela única (\"fase de liga\"), cada um faz 8 jogos contra adversários diferentes.",
          "1º ao 8º: direto para as oitavas.",
          "9º ao 24º: playoff de ida e volta por vaga nas oitavas.",
          "25º em diante: eliminado.",
          "Final em jogo único.",
        ],
      },
      {
        titulo: "Premier League e La Liga",
        itens: ["20 times, 38 rodadas, pontos corridos.", "Os 3 últimos são rebaixados.", "Premier desempata por saldo de gols; La Liga olha primeiro o confronto direto."],
      },
      {
        titulo: "Cartões e suspensões",
        itens: ["Vermelho direto: suspensão automática no jogo seguinte da mesma competição (pode ser mais, via julgamento).", "No Brasileirão, 3 amarelos acumulados = 1 jogo de suspensão."],
      },
    ],
    flash: [
      { p: "Quanto tempo o goleiro pode segurar a bola?", r: "8 segundos. Passou disso: escanteio pro adversário." },
      { p: "Quanto tempo para cobrar lateral ou tiro de meta (quando o juiz conta)?", r: "5 segundos. Lateral vai pro adversário; tiro de meta vira escanteio." },
      { p: "Quantas substituições cada time pode fazer?", r: "5, em até 3 paradas (fora o intervalo)." },
      { p: "Quantos caem no Brasileirão?", r: "4 (17º ao 20º)." },
      { p: "Quem vai direto pras oitavas da Champions?", r: "Do 1º ao 8º da fase de liga." },
      { p: "Como é a final da Copa do Brasil 2026?", r: "Jogo único em 6/dez, no Mané Garrincha. Empate → pênaltis." },
      { p: "Jogador atendido em campo precisa fazer o quê?", r: "Ficar 1 minuto fora depois que o jogo recomeça." },
    ],
  },

  f1: {
    atualizado: "nov/2026 · Regulamento FIA 2026 (nova era de carros e motores)",
    fonte: "FIA e formula1.com",
    resumo: [
      "22 carros, 11 equipes (Cadillac estreou em 2026; Sauber virou Audi).",
      "Fim de semana: treinos livres → classificação → corrida (domingo).",
      "Pontos até o 10º: 25-18-15-12-10-8-6-4-2-1. Não existe mais ponto extra pela volta mais rápida.",
      "Sprint (sábado em alguns GPs): pontua do 1º ao 8º (8-7-6-5-4-3-2-1).",
      "Dois campeonatos: Pilotos e Construtores (soma dos 2 carros).",
    ],
    novidades: {
      titulo: "O que mudou em 2026 (a maior mudança da história)",
      itens: [
        "Fim do DRS. Agora existe a Aero Ativa: asas dianteira e traseira mudam entre Modo Reta (menos arrasto, mais velocidade) e Modo Curva (mais pressão aerodinâmica). Todos usam, a volta toda, nas zonas liberadas.",
        "Modo Ultrapassagem: quem está a menos de 1 segundo do carro da frente ganha energia elétrica extra para atacar.",
        "Boost: botão que o piloto usa para despejar a energia da bateria onde quiser (atacar ou defender).",
        "Recharge: recuperar energia nas frenagens e no fim das retas.",
        "Motor ~50% combustão e ~50% elétrico; a parte elétrica quase triplicou (350 kW). Saiu o MGU-H.",
        "Combustível 100% sustentável.",
        "Carros menores e mais leves, com menos pressão aerodinâmica.",
      ],
    },
    blocos: [
      {
        titulo: "Classificação (Q1, Q2, Q3)",
        itens: ["Q1: 18 min — os 6 mais lentos ficam de fora (largam do 17º ao 22º).", "Q2: 15 min — mais 6 eliminados (11º ao 16º).", "Q3: 12 min — os 10 melhores brigam pela pole."],
      },
      {
        titulo: "Pneus",
        itens: [
          "Macio = faixa vermelha (rápido, gasta logo).",
          "Médio = amarela.",
          "Duro = branca (lento, dura mais).",
          "Intermediário = verde (pista úmida). Chuva = azul.",
          "Em corrida seca, cada piloto é obrigado a usar pelo menos 2 tipos diferentes → pelo menos 1 pit stop.",
        ],
      },
      {
        titulo: "Bandeiras",
        itens: [
          "Amarela: perigo, proibido ultrapassar.",
          "Verde: pista liberada.",
          "Azul: deixe passar o carro mais rápido (retardatário).",
          "Vermelha: sessão interrompida.",
          "Preta: piloto desclassificado.",
          "Preta e branca (diagonal): aviso por conduta.",
          "SC = Safety Car na pista; VSC = Safety Car virtual (todos reduzem a velocidade).",
        ],
      },
      {
        titulo: "Punições",
        itens: ["5 ou 10 segundos somados ao tempo (ou cumpridos no pit).", "Drive-through: passar pelo pit lane sem parar.", "Stop-go de 10 s.", "Perda de posições no grid da próxima corrida.", "Pontos na superlicença: 12 em 12 meses = suspensão de 1 corrida."],
      },
      {
        titulo: "Fim de semana Sprint",
        itens: ["Sexta: 1 treino livre + classificação Sprint.", "Sábado: corrida Sprint (~100 km) + classificação do GP.", "Domingo: corrida principal."],
      },
    ],
    flash: [
      { p: "O que substituiu o DRS em 2026?", r: "A Aero Ativa (Modo Reta e Modo Curva) + o Modo Ultrapassagem." },
      { p: "Quando o piloto ganha o Modo Ultrapassagem?", r: "Quando está a menos de 1 segundo do carro da frente." },
      { p: "Quantos pontos o vencedor ganha?", r: "25 (na Sprint, 8)." },
      { p: "Ainda existe ponto pela volta mais rápida?", r: "Não, acabou em 2025." },
      { p: "Quantos ficam de fora no Q1?", r: "6 (com 22 carros no grid)." },
      { p: "Cor do pneu macio?", r: "Vermelha." },
      { p: "Bandeira azul significa…", r: "Deixe passar o carro mais rápido (está tomando volta)." },
    ],
  },

  ufc: {
    atualizado: "nov/2026 · Regras Unificadas do MMA (ABC)",
    fonte: "Association of Boxing Commissions — Unified Rules of MMA",
    resumo: [
      "Rounds de 5 min, com 1 min de descanso.",
      "Lutas normais: 3 rounds. Disputa de cinturão e luta principal: 5 rounds.",
      "Cada round vale 10 pontos para o vencedor: 10-9 normal, 10-8 se dominou muito.",
      "Vence por: nocaute (KO), nocaute técnico (TKO), finalização, decisão dos 3 juízes, desclassificação.",
      "Cartel \"20-3-0\" = 20 vitórias, 3 derrotas, 0 empates.",
    ],
    novidades: {
      titulo: "Mudanças recentes",
      itens: [
        "Cotovelada 12-6 (de cima para baixo, reta) foi LIBERADA desde nov/2024.",
        "Novo conceito de \"lutador no chão\": qualquer parte do corpo que não sejam as mãos ou os pés tocando o chão. Com só a mão no chão, já pode tomar joelhada na cabeça.",
        "Atenção: cada comissão atlética escolhe se adota a versão nova — em alguns eventos (ex.: Nova Jersey em 2025) a regra antiga ainda foi usada.",
        "Em ago/2026 a ABC aprovou novas mudanças nas regras, com implementação pedida para nov/2027.",
      ],
    },
    blocos: [
      {
        titulo: "Tipos de decisão",
        itens: ["Unânime: os 3 juízes deram o mesmo vencedor.", "Dividida: 2 juízes para um, 1 para o outro.", "Majoritária: 2 para um, 1 deu empate.", "Empate e \"sem resultado\" (no contest) também existem."],
      },
      {
        titulo: "Principais faltas",
        itens: [
          "Cabeçada, dedo no olho, morder, puxar cabelo.",
          "Golpe na virilha e na nuca/coluna.",
          "Joelhada ou chute na cabeça de quem está no chão.",
          "Segurar a grade ou o calção do adversário.",
          "Falta pode tirar ponto ou causar desclassificação.",
        ],
      },
      {
        titulo: "Categorias de peso (limite)",
        itens: [
          "Mosca: 56,7 kg (125 lb)",
          "Galo: 61,2 kg (135 lb)",
          "Pena: 65,8 kg (145 lb)",
          "Leve: 70,3 kg (155 lb)",
          "Meio-médio: 77,1 kg (170 lb)",
          "Médio: 83,9 kg (185 lb)",
          "Meio-pesado: 93 kg (205 lb)",
          "Pesado: 120,2 kg (265 lb)",
          "Feminino: palha 52,2 kg, mosca, galo e pena com os mesmos limites masculinos.",
        ],
      },
      {
        titulo: "Como um evento funciona",
        itens: ["Card preliminar → card principal.", "UFC numerado (ex.: UFC 334) = evento grande, geralmente com disputa de cinturão.", "UFC Fight Night = eventos menores, luta principal de 5 rounds.", "Pesagem na véspera: quem passa do limite perde parte da bolsa (e a luta pode virar peso combinado)."],
      },
    ],
    flash: [
      { p: "Quanto dura um round?", r: "5 minutos (1 min de descanso)." },
      { p: "Quantos rounds tem uma disputa de cinturão?", r: "5." },
      { p: "A cotovelada 12-6 é legal?", r: "Sim, desde nov/2024 (onde a comissão adotou a regra nova)." },
      { p: "O que é decisão dividida?", r: "2 juízes deram vitória para um lutador e 1 juiz para o outro." },
      { p: "Limite do peso-leve?", r: "70,3 kg (155 lb)." },
      { p: "O que significa 10-8 num round?", r: "Domínio grande de um lutador naquele round." },
    ],
  },

  basquete: {
    atualizado: "nov/2026 · Regras NBA temporada 2026-27",
    fonte: "NBA (nba.com / pr.nba.com)",
    resumo: [
      "4 quartos de 12 min. Empatou? Prorrogação de 5 min (quantas precisar).",
      "Cesta normal = 2 pontos, de fora do arco = 3, lance livre = 1.",
      "24 segundos para arremessar em cada posse.",
      "6 faltas pessoais = jogador eliminado do jogo.",
      "Temporada regular de 82 jogos → play-in → playoffs em séries melhor de 7.",
    ],
    novidades: {
      titulo: "O que mudou em 2026-27",
      itens: [
        "NBA Cup: as semifinais agora são na casa do time de melhor campanha; só a final é em local neutro. Grupos de 30/out a 27/nov, mata-mata a partir de 4/dez, final em 11/dez.",
        "Jogos da NBA Cup contam na classificação normal — menos a final.",
        "Juízes com atenção especial aos empurrões do atacante para criar espaço (push-off).",
        "Nova loteria do draft (sistema 3-2-1), com 16 times e chances mais niveladas, contra o \"tanking\".",
        "Desde 2025-26: arremessos desesperados do meio da quadra no fim dos 3 primeiros quartos não contam no aproveitamento do jogador (\"heave rule\").",
      ],
    },
    blocos: [
      {
        titulo: "Tempo e violações",
        itens: [
          "8 segundos para passar do meio da quadra.",
          "3 segundos: atacante não pode ficar parado no garrafão.",
          "Defesa também tem regra de 3 segundos no garrafão.",
          "Andar com a bola (travelling) e dois dribles = perde a posse.",
        ],
      },
      {
        titulo: "Faltas",
        itens: [
          "A partir da 5ª falta do time no quarto, toda falta vira lance livre (bônus).",
          "Falta técnica: reclamação/conduta — 1 lance livre para o adversário. 2 técnicas = expulso.",
          "Falta flagrante 1 (desnecessária) e 2 (desnecessária e excessiva → expulsão).",
        ],
      },
      {
        titulo: "Linha de 3",
        itens: ["7,24 m no topo do arco.", "6,71 m nos cantos (por isso o \"corner three\" é mais curto)."],
      },
      {
        titulo: "Desafio do técnico",
        itens: ["O técnico pode pedir revisão de vídeo (coach's challenge).", "Se acertar o primeiro desafio, ganha um segundo."],
      },
      {
        titulo: "Pós-temporada",
        itens: ["2 conferências (Leste e Oeste), 15 times cada.", "1º ao 6º: direto nos playoffs.", "7º ao 10º: play-in pelas 2 últimas vagas.", "Playoffs: 4 rodadas, todas melhor de 7 (quem vence 4 jogos passa)."],
      },
    ],
    flash: [
      { p: "Quanto dura um quarto na NBA?", r: "12 minutos (prorrogação: 5)." },
      { p: "Quantas faltas eliminam o jogador?", r: "6." },
      { p: "Quanto tempo de posse?", r: "24 segundos." },
      { p: "Quem joga o play-in?", r: "Do 7º ao 10º de cada conferência." },
      { p: "Onde são as semifinais da NBA Cup em 2026-27?", r: "Na casa do time de melhor campanha (só a final é neutra)." },
      { p: "Quantos jogos para vencer uma série de playoff?", r: "4 (melhor de 7)." },
    ],
  },
};

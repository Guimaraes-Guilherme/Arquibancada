export type SportId = "futebol" | "f1" | "ufc" | "basquete";

export const SPORTS: Record<SportId, { nome: string; cor: string; img: string; espn: string }> = {
  futebol: { nome: "Futebol", cor: "#4CC13A", img: "/img/futebol.jpg", espn: "soccer" },
  f1: { nome: "F1", cor: "#FF3355", img: "/img/f1.jpg", espn: "racing/f1" },
  ufc: { nome: "UFC", cor: "#FFFFFF", img: "/img/ufc.jpg", espn: "mma/ufc" },
  basquete: { nome: "Basquete", cor: "#FF8A00", img: "/img/basquete.jpg", espn: "basketball/nba" },
};

export const SPORT_IDS = Object.keys(SPORTS) as SportId[];

export type Liga = { id: string; nome: string; curto: string; grupo: string; padrao: boolean; tabela: boolean };

// "selecao" é especial: jogos do Brasil (time 205 na ESPN)
export const LIGAS: Liga[] = [
  { id: "bra.1", nome: "Brasileirão Série A", curto: "Brasileirão", grupo: "Brasil e América do Sul", padrao: true, tabela: true },
  { id: "bra.copa_do_brazil", nome: "Copa do Brasil", curto: "Copa do Brasil", grupo: "Brasil e América do Sul", padrao: true, tabela: false },
  { id: "conmebol.libertadores", nome: "Libertadores", curto: "Libertadores", grupo: "Brasil e América do Sul", padrao: true, tabela: true },
  { id: "bra.camp.paulista", nome: "Campeonato Paulista", curto: "Paulistão", grupo: "Brasil e América do Sul", padrao: true, tabela: true },
  { id: "conmebol.sudamericana", nome: "Sul-Americana", curto: "Sul-Americana", grupo: "Brasil e América do Sul", padrao: false, tabela: true },
  { id: "eng.1", nome: "Premier League", curto: "Premier League", grupo: "Europa", padrao: true, tabela: true },
  { id: "esp.1", nome: "La Liga", curto: "La Liga", grupo: "Europa", padrao: true, tabela: true },
  { id: "ita.1", nome: "Serie A (Itália)", curto: "Serie A", grupo: "Europa", padrao: false, tabela: true },
  { id: "ger.1", nome: "Bundesliga", curto: "Bundesliga", grupo: "Europa", padrao: false, tabela: true },
  { id: "fra.1", nome: "Ligue 1", curto: "Ligue 1", grupo: "Europa", padrao: false, tabela: true },
  { id: "uefa.champions", nome: "Champions League", curto: "Champions", grupo: "Copas internacionais", padrao: true, tabela: true },
  { id: "uefa.europa", nome: "Europa League", curto: "Europa League", grupo: "Copas internacionais", padrao: true, tabela: true },
  { id: "selecao", nome: "Jogos da Seleção", curto: "Seleção", grupo: "Copas internacionais", padrao: true, tabela: false },
];

export const LIGAS_PADRAO = LIGAS.filter((l) => l.padrao).map((l) => l.id);
export const ligaPorId = (id: string) => LIGAS.find((l) => l.id === id);

export type Notifs = {
  lembrete30: boolean;
  lembrete5: boolean;
  inicio: boolean;
  aoVivo: boolean;
  final: boolean;
  resumo: boolean;
};

export const NOTIFS_PADRAO: Notifs = { lembrete30: true, lembrete5: true, inicio: false, aoVivo: true, final: true, resumo: true };

export const NOTIF_LABELS: Record<keyof Notifs, string> = {
  lembrete30: "Lembrete 30 min antes",
  lembrete5: "Lembrete 5 min antes",
  inicio: "Quando começar",
  aoVivo: "Gols e lances ao vivo",
  final: "Resultado final",
  resumo: "Resumo diário (8h)",
};

export type Prefs = { ligas: string[]; esportes: SportId[]; notifs: Notifs };
export const PREFS_PADRAO: Prefs = { ligas: LIGAS_PADRAO, esportes: SPORT_IDS, notifs: NOTIFS_PADRAO };

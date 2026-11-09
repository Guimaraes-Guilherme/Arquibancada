import { LIGAS, ligaPorId } from "./sports";

const SITE = "https://site.api.espn.com/apis/site/v2/sports";
const CORE = "https://site.api.espn.com/apis/v2/sports";
export const TZ = "America/Sao_Paulo";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

export async function getJson(url: string, revalidate = 60): Promise<Any | null> {
  try {
    const r = await fetch(url, { next: { revalidate }, headers: { "accept-encoding": "gzip" } });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

/** "YYYY-MM-DD" no fuso de Brasília */
export function diaBR(d: Date | string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(d));
}
export function hojeBR() {
  return diaBR(new Date());
}
function addDias(dia: string, n: number) {
  const d = new Date(dia + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const espnDia = (dia: string) => dia.replaceAll("-", "");

function revalidateFor(dia: string) {
  const hoje = hojeBR();
  if (dia === hoje || dia === addDias(hoje, -1)) return 30;
  return dia < hoje ? 3600 : 600;
}

/* ---------------- Tipos normalizados ---------------- */

export type Estado = "pre" | "in" | "post";
export type Lance = { tipo: "gol" | "amarelo" | "vermelho" | "penalti-perdido"; min: string; jogador: string; lado: "casa" | "fora"; obs?: string };
export type Time = { nome: string; sigla: string; logo?: string; placar?: string; penaltis?: string; vencedor?: boolean; campanha?: string };
export type Jogo = {
  id: string;
  liga: string;
  ligaNome: string;
  inicio: string;
  estado: Estado;
  status: string;
  casa: Time;
  fora: Time;
  lances: Lance[];
  fase?: string;
};

function traduzStatusFutebol(st: Any): string {
  const t = st?.type ?? {};
  const name: string = t.name ?? "";
  if (name.includes("POSTPONED")) return "Adiado";
  if (name.includes("CANCELED")) return "Cancelado";
  if (name.includes("SUSPENDED")) return "Suspenso";
  if (t.state === "pre") return "";
  if (t.state === "in") {
    if (name.includes("HALFTIME")) return "Intervalo";
    if (name.includes("SHOOTOUT")) return "Pênaltis";
    if (name.includes("END_OF_REGULATION") || name.includes("END_PERIOD")) return "Fim do tempo normal";
    return st.displayClock ?? t.shortDetail ?? "Ao vivo";
  }
  const sd: string = t.shortDetail ?? "";
  if (sd.includes("Pens")) return "Fim (pênaltis)";
  if (sd.includes("AET")) return "Fim (prorrogação)";
  return "Encerrado";
}

function placar(s: Any): string | undefined {
  if (s == null) return undefined;
  if (typeof s === "object") return s.displayValue ?? String(s.value ?? "");
  return String(s);
}

const PAISES: Record<string, string> = {
  Brazil: "Brasil", Argentina: "Argentina", Uruguay: "Uruguai", Colombia: "Colômbia", Chile: "Chile", Paraguay: "Paraguai", Peru: "Peru",
  Ecuador: "Equador", Bolivia: "Bolívia", Venezuela: "Venezuela", Japan: "Japão", Singapore: "Singapura", Germany: "Alemanha",
  France: "França", Spain: "Espanha", England: "Inglaterra", Italy: "Itália", Portugal: "Portugal", Netherlands: "Holanda",
  Belgium: "Bélgica", Croatia: "Croácia", Mexico: "México", "United States": "EUA", USA: "EUA", Morocco: "Marrocos", Senegal: "Senegal",
  "South Korea": "Coreia do Sul", Australia: "Austrália", Canada: "Canadá", Switzerland: "Suíça", Norway: "Noruega", Tunisia: "Tunísia",
  Nigeria: "Nigéria", Ghana: "Gana", Cameroon: "Camarões", Egypt: "Egito", "Saudi Arabia": "Arábia Saudita", Qatar: "Catar",
};
function timeDe(c: Any): Time {
  const t = c?.team ?? {};
  const n = t.shortDisplayName ?? t.displayName ?? t.name ?? "?";
  return {
    nome: PAISES[n] ?? n,
    sigla: t.abbreviation ?? "",
    logo: t.logo ?? t.logos?.[0]?.href,
    placar: placar(c?.score),
    penaltis: c?.shootoutScore != null ? String(c.shootoutScore) : undefined,
    vencedor: c?.winner,
    campanha: c?.records?.[0]?.summary,
  };
}

function lancesDe(comp: Any, idCasa: string): Lance[] {
  const out: Lance[] = [];
  for (const d of comp?.details ?? []) {
    const txt: string = d?.type?.text ?? "";
    let tipo: Lance["tipo"] | null = null;
    let obs: string | undefined;
    if (d.scoringPlay || /goal/i.test(txt)) {
      tipo = "gol";
      if (d.ownGoal || /own/i.test(txt)) obs = "contra";
      else if (d.penaltyKick || /penalty/i.test(txt)) obs = "pênalti";
    } else if (/red/i.test(txt)) tipo = "vermelho";
    else if (/yellow/i.test(txt)) tipo = "amarelo";
    else if (/penalty.*(missed|saved)/i.test(txt)) tipo = "penalti-perdido";
    if (!tipo) continue;
    if (d.shootout) continue;
    out.push({
      tipo,
      min: d?.clock?.displayValue ?? "",
      jogador: d?.athletesInvolved?.[0]?.displayName ?? d?.athletesInvolved?.[0]?.shortName ?? "",
      lado: String(d?.team?.id) === idCasa ? "casa" : "fora",
      obs,
    });
  }
  return out;
}

export function jogoDeEvento(e: Any, liga: string, ligaNome: string): Jogo {
  const comp = e.competitions?.[0] ?? {};
  const cs: Any[] = comp.competitors ?? [];
  const h = cs.find((c) => c.homeAway === "home") ?? cs[0];
  const a = cs.find((c) => c.homeAway === "away") ?? cs[1];
  const st = comp.status ?? e.status;
  return {
    id: String(e.id),
    liga,
    ligaNome,
    inicio: e.date,
    estado: (st?.type?.state ?? "pre") as Estado,
    status: traduzStatusFutebol(st),
    casa: timeDe(h),
    fora: timeDe(a),
    lances: lancesDe(comp, String(h?.team?.id ?? h?.id)),
    fase: comp?.notes?.[0]?.headline ?? e?.season?.slug,
  };
}

/* ---------------- Futebol ---------------- */

async function scoreboardDia(path: string, dia: string): Promise<Any[]> {
  // A ESPN agrupa os dias no horário dos EUA (sempre atrás de Brasília),
  // então o dia D de Brasília cai em D ou D-1 deles.
  const rv = revalidateFor(dia);
  const [a, b] = await Promise.all([
    getJson(`${SITE}/${path}/scoreboard?dates=${espnDia(addDias(dia, -1))}&limit=200`, rv),
    getJson(`${SITE}/${path}/scoreboard?dates=${espnDia(dia)}&limit=200`, rv),
  ]);
  const evs = [...(a?.events ?? []), ...(b?.events ?? [])];
  const vistos = new Set<string>();
  return evs.filter((e) => {
    if (vistos.has(e.id)) return false;
    vistos.add(e.id);
    return diaBR(e.date) === dia;
  });
}

async function jogosSelecao(dia?: string): Promise<Jogo[]> {
  const [prox, res] = await Promise.all([
    getJson(`${SITE}/soccer/all/teams/205/schedule?fixture=true`, 300),
    getJson(`${SITE}/soccer/all/teams/205/schedule`, 300),
  ]);
  const evs: Any[] = [...(res?.events ?? []), ...(prox?.events ?? [])];
  const vistos = new Set<string>();
  const out: Jogo[] = [];
  for (const e of evs) {
    if (vistos.has(e.id)) continue;
    vistos.add(e.id);
    if (dia && diaBR(e.date) !== dia) continue;
    out.push(jogoDeEvento(e, "selecao", "Seleção Brasileira"));
  }
  // Se o jogo for hoje, busca o placar ao vivo no scoreboard da competição
  for (const j of out) {
    if (diaBR(j.inicio) !== hojeBR()) continue;
    const e = evs.find((x) => String(x.id) === j.id);
    const slug = e?.league?.slug ?? e?.competitions?.[0]?.league?.slug;
    if (!slug) continue;
    const evs2 = await scoreboardDia(`soccer/${slug}`, hojeBR());
    const ev = evs2.find((x) => String(x.id) === j.id);
    if (ev) Object.assign(j, jogoDeEvento(ev, "selecao", "Seleção Brasileira"));
  }
  return out;
}

export async function futebolDoDia(dia: string, ligas: string[]): Promise<Jogo[]> {
  const ids = ligas.filter((l) => ligaPorId(l));
  const listas = await Promise.all(
    ids.map(async (id) => {
      if (id === "selecao") return jogosSelecao(dia);
      const evs = await scoreboardDia(`soccer/${id}`, dia);
      return evs.map((e) => jogoDeEvento(e, id, ligaPorId(id)!.curto));
    }),
  );
  // Remove jogos da Seleção que já apareceram em outra liga
  const todos = listas.flat();
  const vistos = new Set<string>();
  return todos
    .filter((j) => (vistos.has(j.id) ? false : (vistos.add(j.id), true)))
    .sort((a, b) => ordemLiga(a.liga) - ordemLiga(b.liga) || a.inicio.localeCompare(b.inicio));
}
const ordemLiga = (id: string) => LIGAS.findIndex((l) => l.id === id);

/* ---------------- Basquete (NBA) ---------------- */

function traduzStatusNBA(st: Any): string {
  const t = st?.type ?? {};
  if (t.state === "pre") return "";
  if (t.name?.includes("POSTPONED")) return "Adiado";
  if (t.state === "post") return (t.shortDetail ?? "").includes("OT") ? "Final (prorrogação)" : "Final";
  if (t.name?.includes("HALFTIME")) return "Intervalo";
  if (t.name?.includes("END_PERIOD")) return `Fim do ${st.period}º quarto`;
  const p = st.period > 4 ? `Prorr. ${st.period - 4}` : `${st.period}º Q`;
  return `${p} · ${st.displayClock}`;
}

export async function nbaDoDia(dia: string): Promise<Jogo[]> {
  const evs = await scoreboardDia("basketball/nba", dia);
  return evs
    .map((e) => {
      const j = jogoDeEvento(e, "nba", "NBA");
      j.status = traduzStatusNBA(e.competitions?.[0]?.status ?? e.status);
      j.lances = [];
      const lideres = e.competitions?.[0]?.competitors ?? [];
      j.fase = e.competitions?.[0]?.notes?.[0]?.headline;
      // cestinha de cada time
      for (const c of lideres) {
        const pts = (c.leaders ?? []).find((l: Any) => l.name === "points")?.leaders?.[0];
        if (pts) {
          j.lances.push({ tipo: "gol", min: `${pts.displayValue}`, jogador: pts.athlete?.shortName ?? "", lado: c.homeAway === "home" ? "casa" : "fora" });
        }
      }
      return j;
    })
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
}

/* ---------------- F1 ---------------- */

export type Sessao = { nome: string; inicio: string; estado: Estado; top: { pos: number; nome: string; flag?: string }[] };
export type GP = { id: string; nome: string; inicio: string; fim: string; estado: Estado; circuito: string; local: string; sessoes: Sessao[] };

const NOMES_SESSAO: Record<string, string> = {
  FP1: "Treino Livre 1",
  FP2: "Treino Livre 2",
  FP3: "Treino Livre 3",
  Qual: "Classificação",
  SS: "Classificação Sprint",
  SQ: "Classificação Sprint",
  Sprint: "Sprint",
  Race: "Corrida",
};

export async function temporadaF1(): Promise<GP[]> {
  const ano = new Date().getUTCFullYear();
  const d = await getJson(`${SITE}/racing/f1/scoreboard?dates=${ano}`, 60);
  return (d?.events ?? []).map((e: Any) => ({
    id: String(e.id),
    nome: traduzGP(e.name ?? e.shortName),
    inicio: e.date,
    fim: e.endDate,
    estado: (e.status?.type?.state ?? "pre") as Estado,
    circuito: e.circuit?.fullName ?? "",
    local: [e.circuit?.address?.city, e.circuit?.address?.country].filter(Boolean).join(", "),
    sessoes: (e.competitions ?? []).map((c: Any) => ({
      nome: NOMES_SESSAO[c.type?.abbreviation] ?? c.type?.abbreviation ?? "Sessão",
      inicio: c.date,
      estado: (c.status?.type?.state ?? "pre") as Estado,
      top: (c.competitors ?? [])
        .filter((x: Any) => x.order)
        .sort((x: Any, y: Any) => x.order - y.order)
        .slice(0, 10)
        .map((x: Any) => ({ pos: x.order, nome: x.athlete?.displayName ?? "", flag: x.athlete?.flag?.href })),
    })),
  }));
}

function traduzGP(nome: string): string {
  const sede = nome.match(/ in ([\p{L} ]+)$/u)?.[1];
  if (sede) return `${traduzGP(nome.replace(/ in [\p{L} ]+$/u, ""))} (${sede === "Malaysia" ? "na Malásia" : sede})`;
  // remove patrocinadores: "MSC Cruises São Paulo Grand Prix" -> "GP de São Paulo"
  const m = nome.match(/([\p{L} .'-]+?) (?:Grand Prix|GP)\b/u);
  if (!m) return nome;
  const palavras = m[1].trim().split(" ");
  const paises: Record<string, string> = {
    Australian: "da Austrália", Chinese: "da China", Japanese: "do Japão", Bahrain: "do Bahrein", "Saudi Arabian": "da Arábia Saudita",
    Miami: "de Miami", Canadian: "do Canadá", Monaco: "de Mônaco", Spanish: "da Espanha", Austrian: "da Áustria", British: "da Grã-Bretanha",
    Belgian: "da Bélgica", Hungarian: "da Hungria", Dutch: "da Holanda", Italian: "da Itália", Azerbaijan: "do Azerbaijão",
    Singapore: "de Singapura", "United States": "dos EUA", "Mexico City": "da Cidade do México", "São Paulo": "de São Paulo",
    "Las Vegas": "de Las Vegas", Qatar: "do Catar", "Abu Dhabi": "de Abu Dhabi", Madrid: "de Madri", "Barcelona-Catalunya": "de Barcelona",
    Emilia: "da Emília-Romanha", Portuguese: "de Portugal",
  };
  for (let i = 0; i < palavras.length; i++) {
    const chave = palavras.slice(i).join(" ");
    if (paises[chave]) return `GP ${paises[chave]}`;
  }
  return `GP ${palavras.slice(-2).join(" ")}`;
}

/* ---------------- UFC ---------------- */

export type Luta = { id: string; categoria: string; inicio: string; estado: Estado; status: string; a: Lutador; b: Lutador };
export type Lutador = { nome: string; cartel?: string; flag?: string; vencedor?: boolean };
export type EventoUFC = { id: string; nome: string; inicio: string; estado: Estado; local: string; lutas: Luta[] };

const CATEGORIAS: Record<string, string> = {
  Flyweight: "Peso-mosca", Bantamweight: "Peso-galo", Featherweight: "Peso-pena", Lightweight: "Peso-leve",
  Welterweight: "Peso-meio-médio", Middleweight: "Peso-médio", "Light Heavyweight": "Peso-meio-pesado", Heavyweight: "Peso-pesado",
  "W Strawweight": "Palha (fem.)", "W Flyweight": "Mosca (fem.)", "W Bantamweight": "Galo (fem.)", "W Featherweight": "Pena (fem.)",
  Catchweight: "Peso combinado",
};

export async function temporadaUFC(): Promise<EventoUFC[]> {
  const ano = new Date().getUTCFullYear();
  const [d, d2] = await Promise.all([
    getJson(`${SITE}/mma/ufc/scoreboard?dates=${ano}`, 120),
    getJson(`${SITE}/mma/ufc/scoreboard`, 30),
  ]);
  const map = new Map<string, Any>();
  for (const e of d?.events ?? []) map.set(String(e.id), e);
  for (const e of d2?.events ?? []) map.set(String(e.id), e); // versão mais fresca (ao vivo)
  return [...map.values()]
    .map((e: Any) => {
      const v = e.competitions?.[0]?.venue ?? e.venues?.[0];
      return {
        id: String(e.id),
        nome: e.name,
        inicio: e.date,
        estado: (e.status?.type?.state ?? "pre") as Estado,
        local: [v?.fullName, v?.address?.city].filter(Boolean).join(" · "),
        lutas: (e.competitions ?? [])
          .map((c: Any) => {
            const [x, y] = c.competitors ?? [];
            const st = c.status ?? {};
            const est = (st.type?.state ?? "pre") as Estado;
            return {
              id: String(c.id),
              categoria: CATEGORIAS[c.type?.abbreviation] ?? c.type?.abbreviation ?? "",
              inicio: c.date,
              estado: est,
              status:
                est === "post" ? `Fim · R${st.period} ${st.displayClock ?? ""}`.trim() : est === "in" ? `Ao vivo · R${st.period ?? 1}` : "",
              a: lutador(x),
              b: lutador(y),
            } as Luta;
          })
          .reverse(), // luta principal primeiro
      } as EventoUFC;
    })
    .sort((a, b) => a.inicio.localeCompare(b.inicio));
}
function lutador(c: Any): Lutador {
  return {
    nome: c?.athlete?.displayName ?? "A definir",
    cartel: c?.records?.[0]?.summary,
    flag: c?.athlete?.flag?.href,
    vencedor: c?.winner,
  };
}

/* ---------------- Tabelas ---------------- */

export type Linha = { pos: number; nome: string; logo?: string; cols: string[] };
export type Tabela = { titulo: string; colunas: string[]; linhas: Linha[] };

const stat = (e: Any, n: string) => e.stats?.find((s: Any) => s.name === n)?.displayValue ?? "";

export async function tabelas(path: string): Promise<Tabela[]> {
  const d = await getJson(`${CORE}/${path}/standings`, 600);
  const grupos: Any[] = d?.children ?? [];
  if (path === "racing/f1") {
    return grupos.map((g, i) => ({
      titulo: i === 0 ? "Pilotos" : "Construtores",
      colunas: ["Pts"],
      linhas: (g.standings?.entries ?? []).map((e: Any) => ({
        pos: Number(stat(e, "rank")),
        nome: (e.athlete ?? e.team)?.displayName ?? "",
        logo: e.athlete?.flag?.href,
        cols: [stat(e, "championshipPts")],
      })),
    }));
  }
  if (path === "basketball/nba") {
    return grupos.map((g) => ({
      titulo: g.name === "Eastern Conference" ? "Conferência Leste" : "Conferência Oeste",
      colunas: ["V", "D", "%"],
      linhas: (g.standings?.entries ?? [])
        .map((e: Any) => ({
          pos: Number(stat(e, "playoffSeed")),
          nome: e.team?.shortDisplayName ?? e.team?.displayName,
          logo: e.team?.logos?.[0]?.href ?? `https://a.espncdn.com/i/teamlogos/nba/500/${String(e.team?.abbreviation).toLowerCase()}.png`,
          cols: [stat(e, "wins"), stat(e, "losses"), stat(e, "winPercent")],
        }))
        .sort((a: Linha, b: Linha) => a.pos - b.pos),
    }));
  }
  return grupos.map((g) => ({
    titulo: traduzGrupo(g.name),
    colunas: ["P", "J", "V", "E", "D", "SG"],
    linhas: (g.standings?.entries ?? [])
      .map((e: Any) => ({
        pos: Number(stat(e, "rank")),
        nome: e.team?.shortDisplayName ?? e.team?.displayName,
        logo: e.team?.logos?.[0]?.href ?? `https://a.espncdn.com/i/teamlogos/soccer/500/${e.team?.id}.png`,
        cols: [stat(e, "points"), stat(e, "gamesPlayed"), stat(e, "wins"), stat(e, "ties"), stat(e, "losses"), stat(e, "pointDifferential")],
      }))
      .sort((a: Linha, b: Linha) => a.pos - b.pos),
  }));
}
function traduzGrupo(n: string) {
  if (/^Group /.test(n)) return n.replace("Group", "Grupo");
  if (n === "League Phase") return "Fase de liga";
  if (/^\d{4}/.test(n)) return "Classificação";
  return n;
}

/* ---------------- Usado pelo cron ---------------- */

export async function proximosJogosFutebol(ligas: string[]): Promise<Jogo[]> {
  const hoje = hojeBR();
  const [a, b] = await Promise.all([futebolDoDia(addDias(hoje, -1), ligas), futebolDoDia(hoje, ligas)]);
  return [...a, ...b];
}
export async function jogosNBAHojeOntem(): Promise<Jogo[]> {
  const hoje = hojeBR();
  const [a, b] = await Promise.all([nbaDoDia(addDias(hoje, -1)), nbaDoDia(hoje)]);
  return [...a, ...b];
}
export { addDias };

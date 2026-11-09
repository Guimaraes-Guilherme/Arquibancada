import { NextRequest, NextResponse } from "next/server";
import type { PushSubscription } from "web-push";
import { garanteTabelas, limpaAntigos, marca, sql } from "@/lib/db";
import { envia, type Msg } from "@/lib/push";
import { diaBR, hojeBR, jogosNBAHojeOntem, proximosJogosFutebol, temporadaF1, temporadaUFC, TZ, type Jogo } from "@/lib/espn";
import { ligaPorId, PREFS_PADRAO, type Notifs, type Prefs, type SportId } from "@/lib/sports";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Inscricao = { endpoint: string; sub: PushSubscription; prefs: Prefs };
type Aviso = { chave: string; sport: SportId; liga?: string; tipo: keyof Notifs; msg: Msg };

const hora = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
const minutosAte = (iso: string) => (new Date(iso).getTime() - Date.now()) / 60000;
const placar = (j: Jogo) => `${j.casa.nome} ${j.casa.placar ?? 0} x ${j.fora.placar ?? 0} ${j.fora.nome}`;
const confronto = (j: Jogo) => `${j.casa.nome} x ${j.fora.nome}`;

function lembretes(id: string, inicio: string, estado: string, sport: SportId, liga: string | undefined, titulo: string, oque: string, url: string): Aviso[] {
  const out: Aviso[] = [];
  if (estado !== "pre") return out;
  const m = minutosAte(inicio);
  if (m > 6 && m <= 31) out.push({ chave: `l30:${id}`, sport, liga, tipo: "lembrete30", msg: { titulo, corpo: `${oque} começa em ${Math.round(m)} min (${hora(inicio)})`, url, tag: id } });
  if (m > -2 && m <= 6) out.push({ chave: `l5:${id}`, sport, liga, tipo: "lembrete5", msg: { titulo: `⏰ ${titulo}`, corpo: `${oque} começa em ${Math.max(1, Math.round(m))} min!`, url, tag: id } });
  return out;
}

function avisosJogo(j: Jogo, sport: SportId): Aviso[] {
  const url = `/${sport}`;
  const nomeLiga = sport === "basquete" ? "NBA" : j.liga === "selecao" ? "Seleção 🇧🇷" : ligaPorId(j.liga)?.curto ?? "";
  const liga = sport === "futebol" ? j.liga : undefined;
  const out = lembretes(j.id, j.inicio, j.estado, sport, liga, nomeLiga, confronto(j), url);
  const recente = Date.now() - new Date(j.inicio).getTime() < 6 * 3600000;
  if (j.estado === "in") {
    out.push({ chave: `ini:${j.id}`, sport, liga, tipo: "inicio", msg: { titulo: `${nomeLiga} · Começou!`, corpo: confronto(j), url, tag: j.id } });
    if (sport === "futebol") {
      for (const l of j.lances) {
        if (l.tipo !== "gol" && l.tipo !== "vermelho") continue;
        const time = l.lado === "casa" ? j.casa.nome : j.fora.nome;
        const titulo = l.tipo === "gol" ? `⚽ GOL ${l.obs === "contra" ? "contra " : ""}— ${time}` : `🟥 Expulsão — ${time}`;
        out.push({
          chave: `${l.tipo}:${j.id}:${l.min}:${l.jogador}`,
          sport, liga, tipo: "aoVivo",
          msg: { titulo, corpo: `${placar(j)}\n${l.jogador} ${l.min}`, url, tag: j.id },
        });
      }
    } else {
      // basquete: placar ao fim de cada quarto
      const m = j.status.match(/Fim do (\d)º quarto|Intervalo/);
      if (m) {
        const q = m[1] ?? "2";
        out.push({ chave: `q:${j.id}:${q}`, sport, tipo: "aoVivo", msg: { titulo: `🏀 NBA · ${j.status}`, corpo: placar(j), url, tag: j.id } });
      }
    }
  }
  if (j.estado === "post" && recente && !/Adiado|Cancelado/.test(j.status)) {
    out.push({ chave: `fim:${j.id}`, sport, liga, tipo: "final", msg: { titulo: `${nomeLiga} · Fim de jogo`, corpo: placar(j) + (j.casa.penaltis ? ` (pên. ${j.casa.penaltis}-${j.fora.penaltis})` : ""), url, tag: j.id } });
  }
  return out;
}

async function coletaAvisos(ligas: string[], sports: Set<SportId>) {
  const avisos: Aviso[] = [];
  const hoje = { futebol: [] as Jogo[], nba: [] as Jogo[], f1: [] as string[], ufc: [] as string[] };
  const [fut, nba, f1, ufc] = await Promise.all([
    sports.has("futebol") && ligas.length ? proximosJogosFutebol(ligas) : Promise.resolve([] as Jogo[]),
    sports.has("basquete") ? jogosNBAHojeOntem() : Promise.resolve([] as Jogo[]),
    sports.has("f1") ? temporadaF1() : Promise.resolve([]),
    sports.has("ufc") ? temporadaUFC() : Promise.resolve([]),
  ]);
  const dia = hojeBR();
  for (const j of fut) { avisos.push(...avisosJogo(j, "futebol")); if (diaBR(j.inicio) === dia) hoje.futebol.push(j); }
  for (const j of nba) { avisos.push(...avisosJogo(j, "basquete")); if (diaBR(j.inicio) === dia) hoje.nba.push(j); }

  for (const gp of f1) {
    for (const s of gp.sessoes) {
      const id = `${gp.id}:${s.nome}`;
      if (Math.abs(minutosAte(s.inicio)) > 60 * 30) continue;
      if (diaBR(s.inicio) === dia) hoje.f1.push(`${hora(s.inicio)} ${s.nome} · ${gp.nome}`);
      avisos.push(...lembretes(id, s.inicio, s.estado, "f1", undefined, `🏎️ F1 · ${gp.nome}`, s.nome, "/f1"));
      if (s.estado === "in") avisos.push({ chave: `ini:${id}`, sport: "f1", tipo: "inicio", msg: { titulo: `🏎️ ${gp.nome}`, corpo: `${s.nome} começou!`, url: "/f1" } });
      if (s.estado === "post" && s.top.length && -minutosAte(s.inicio) < 6 * 60) {
        const top3 = s.top.slice(0, 3).map((p) => `${p.pos}º ${p.nome}`).join(" · ");
        const tipo: keyof Notifs = /Corrida|Sprint|Classificação/.test(s.nome) ? "final" : "aoVivo";
        avisos.push({ chave: `fim:${id}`, sport: "f1", tipo, msg: { titulo: `🏁 ${gp.nome} · ${s.nome}`, corpo: s.nome === "Corrida" ? `🏆 ${s.top[0].nome} venceu!\n${top3}` : top3, url: "/f1" } });
      }
    }
  }
  for (const ev of ufc) {
    if (Math.abs(minutosAte(ev.inicio)) > 60 * 30) continue;
    if (diaBR(ev.inicio) === dia || diaBR(ev.lutas[0]?.inicio ?? ev.inicio) === dia) hoje.ufc.push(`${hora(ev.inicio)} ${ev.nome}`);
    avisos.push(...lembretes(ev.id, ev.inicio, ev.estado, "ufc", undefined, "🥊 UFC", ev.nome, "/ufc"));
    const principal = ev.lutas[0];
    if (principal && principal.inicio !== ev.inicio) {
      avisos.push(...lembretes(`main:${ev.id}`, principal.inicio, principal.estado, "ufc", undefined, "🥊 UFC · Card principal", `Card principal (${principal.a.nome} x ${principal.b.nome})`, "/ufc"));
    }
    ev.lutas.forEach((l, i) => {
      if (l.estado !== "post" || -minutosAte(l.inicio) > 10 * 60) return;
      const venc = l.a.vencedor ? l.a : l.b.vencedor ? l.b : null;
      const perd = venc === l.a ? l.b : l.a;
      const corpo = venc ? `${venc.nome} venceu ${perd.nome} · ${l.status.replace("Fim · ", "")}` : `${l.a.nome} x ${l.b.nome} · ${l.status}`;
      avisos.push({ chave: `luta:${l.id}`, sport: "ufc", tipo: i === 0 ? "final" : "aoVivo", msg: { titulo: `🥊 ${i === 0 ? "Luta principal" : l.categoria}`, corpo, url: "/ufc" } });
    });
  }
  return { avisos, hoje };
}

function resumoDiario(p: Prefs, hoje: Awaited<ReturnType<typeof coletaAvisos>>["hoje"]): Msg | null {
  const linhas: string[] = [];
  if (p.esportes.includes("futebol")) {
    const js = hoje.futebol.filter((j) => p.ligas.includes(j.liga));
    if (js.length) linhas.push(`⚽ ${js.length} jogo${js.length > 1 ? "s" : ""}: ` + js.slice(0, 4).map((j) => `${hora(j.inicio)} ${confronto(j)}`).join(" · ") + (js.length > 4 ? "…" : ""));
  }
  if (p.esportes.includes("f1") && hoje.f1.length) linhas.push(`🏎️ ${hoje.f1.join(" · ")}`);
  if (p.esportes.includes("ufc") && hoje.ufc.length) linhas.push(`🥊 ${hoje.ufc.join(" · ")}`);
  if (p.esportes.includes("basquete") && hoje.nba.length) linhas.push(`🏀 ${hoje.nba.length} jogos da NBA hoje`);
  if (!linhas.length) return null;
  return { titulo: "📅 Agenda de hoje", corpo: linhas.join("\n"), url: "/", tag: "resumo" };
}

export async function GET(req: NextRequest) {
  const segredo = process.env.CRON_SECRET;
  const chave = req.nextUrl.searchParams.get("key") ?? req.headers.get("authorization")?.replace("Bearer ", "");
  if (segredo && chave !== segredo) return NextResponse.json({ erro: "não autorizado" }, { status: 401 });

  // ?dry=1 → só mostra os avisos que seriam gerados agora (sem banco, sem enviar)
  if (req.nextUrl.searchParams.get("dry")) {
    const { avisos, hoje } = await coletaAvisos(PREFS_PADRAO.ligas, new Set(PREFS_PADRAO.esportes));
    return NextResponse.json({ avisos, resumo: resumoDiario(PREFS_PADRAO, hoje) });
  }

  await garanteTabelas();
  const subs = (await sql()`SELECT endpoint, sub, prefs FROM inscricoes`) as Inscricao[];
  if (!subs.length) return NextResponse.json({ ok: true, inscricoes: 0 });
  for (const s of subs) s.prefs = { ...PREFS_PADRAO, ...s.prefs, notifs: { ...PREFS_PADRAO.notifs, ...(s.prefs?.notifs ?? {}) } };

  const ligas = [...new Set(subs.flatMap((s) => s.prefs.ligas))];
  const sports = new Set(subs.flatMap((s) => s.prefs.esportes));
  const { avisos, hoje } = await coletaAvisos(ligas, sports);

  let enviados = 0;
  for (const a of avisos) {
    const alvo = subs.filter((s) => s.prefs.esportes.includes(a.sport) && s.prefs.notifs[a.tipo] && (!a.liga || s.prefs.ligas.includes(a.liga)));
    if (!alvo.length) continue;
    if (!(await marca(a.chave))) continue;
    for (const s of alvo) if (await envia(s.sub, a.msg)) enviados++;
  }

  // Resumo diário: entre 8h e 8h59 de Brasília
  const h = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: TZ }));
  if (h === 8) {
    for (const s of subs) {
      if (!s.prefs.notifs.resumo) continue;
      const msg = resumoDiario(s.prefs, hoje);
      if (msg && (await marca(`resumo:${hojeBR()}:${s.endpoint.slice(-40)}`)) && (await envia(s.sub, msg))) enviados++;
    }
    await limpaAntigos();
  }
  return NextResponse.json({ ok: true, inscricoes: subs.length, avisos: avisos.length, enviados });
}

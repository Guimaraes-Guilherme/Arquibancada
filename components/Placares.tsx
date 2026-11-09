"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Jogo, Lance } from "@/lib/espn";
import { ligaPorId } from "@/lib/sports";
import { addDias, diaBR, hora, rotuloDia } from "./fmt";
import { useJson } from "./prefs";

const ICONE: Record<Lance["tipo"], string> = { gol: "⚽", amarelo: "🟨", vermelho: "🟥", "penalti-perdido": "❌" };

export function FaixaDatas({ dia, setDia }: { dia: string; setDia: (d: string) => void }) {
  const hoje = diaBR(new Date());
  const dias = useMemo(() => Array.from({ length: 14 }, (_, i) => addDias(hoje, i - 4)), [hoje]);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector(".on")?.scrollIntoView({ inline: "center", block: "nearest" });
  }, []);
  return (
    <div className="datas" ref={ref}>
      {dias.map((d) => (
        <button key={d} className={`data ${d === dia ? "on" : ""}`} onClick={() => setDia(d)}>
          <b>{rotuloDia(d)}</b>
          <span>{d.slice(8, 10)}/{d.slice(5, 7)}</span>
        </button>
      ))}
    </div>
  );
}

function CartaoJogo({ j, basquete }: { j: Jogo; basquete?: boolean }) {
  const [aberto, setAberto] = useState(false);
  const vivo = j.estado === "in";
  const fim = j.estado === "post";
  const n = (x?: string) => Number(x ?? 0);
  const casaPerdeu = fim && (j.fora.vencedor || n(j.fora.placar) > n(j.casa.placar));
  const foraPerdeu = fim && (j.casa.vencedor || n(j.casa.placar) > n(j.fora.placar));
  const temLances = j.lances.length > 0;
  const statusTxt = j.estado === "pre" ? (j.status || hora(j.inicio)) : j.status;
  return (
    <div>
      <button className="jogo" onClick={() => temLances && setAberto(!aberto)}>
        <div className={`hora ${vivo ? "vivo" : ""}`}>{statusTxt}</div>
        <div className="times">
          {[{ t: j.casa, perdeu: casaPerdeu }, { t: j.fora, perdeu: foraPerdeu }].map(({ t, perdeu }, i) => (
            <div key={i} className={`time ${perdeu ? "perdeu" : ""}`}>
              {t.logo ? <img src={t.logo} alt="" loading="lazy" /> : <span style={{ width: 22 }} />}
              <span className="nome">
                {t.nome}
                {basquete && t.campanha ? <small>{t.campanha}</small> : null}
              </span>
              {j.estado !== "pre" && (
                <span className="pl">
                  {t.placar}
                  {t.penaltis ? <small>({t.penaltis})</small> : null}
                </span>
              )}
            </div>
          ))}
        </div>
      </button>
      {aberto && temLances && (
        <div className="lances">
          {basquete && <div style={{ color: "var(--sub)", fontSize: 12 }}>Cestinhas</div>}
          {j.lances.map((l, i) => (
            <div key={i} className={`lance ${l.lado}`}>
              {basquete ? (
                <>
                  <span>🏀</span>
                  <span>{l.jogador} · {l.min} pts</span>
                </>
              ) : (
                <>
                  <span className="min">{l.min}</span>
                  <span>{ICONE[l.tipo]}</span>
                  <span>{l.jogador}{l.obs ? ` (${l.obs})` : ""}</span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {!aberto && temLances && !basquete && (
        <div className="fase">
          {j.lances.filter((l) => l.tipo === "gol").length > 0 ? "Toque para ver os gols e cartões" : "Toque para ver os cartões"}
        </div>
      )}
    </div>
  );
}

export function Carregando() {
  return (
    <>
      <div className="carregando" />
      <div className="carregando" />
      <div className="carregando" />
    </>
  );
}

export default function Placares({ sport, ligas }: { sport: "futebol" | "basquete"; ligas: string[] }) {
  const [dia, setDia] = useState(() => diaBR(new Date()));
  const ehHoje = dia === diaBR(new Date()) || dia === addDias(diaBR(new Date()), -1);
  const url = sport === "futebol" ? `/api/scores/futebol?dia=${dia}&ligas=${ligas.join(",")}` : `/api/scores/basquete?dia=${dia}`;
  const { data, carregando } = useJson<Jogo[]>(url, ehHoje ? 30000 : undefined);

  const grupos = useMemo(() => {
    const m = new Map<string, Jogo[]>();
    for (const j of data ?? []) {
      const k = sport === "futebol" ? j.liga : "NBA";
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(j);
    }
    return [...m.entries()];
  }, [data, sport]);

  const aoVivo = (data ?? []).filter((j) => j.estado === "in").length;

  return (
    <>
      <FaixaDatas dia={dia} setDia={setDia} />
      {carregando && !data ? (
        <Carregando />
      ) : !data || data.length === 0 ? (
        <div className="vazio">
          Nenhum jogo {rotuloDia(dia) === "Hoje" ? "hoje" : "nesse dia"}
          {sport === "futebol" ? " nas ligas que você acompanha." : "."}
          <br />
          Arraste as datas para ver outros dias.
        </div>
      ) : (
        <>
          {aoVivo > 0 && (
            <div className="secao" style={{ color: "var(--ao-vivo)" }}>
              ● {aoVivo} {aoVivo === 1 ? "jogo" : "jogos"} ao vivo
            </div>
          )}
          {grupos.map(([k, jogos]) => (
            <div key={k}>
              <div className="secao">
                {sport === "futebol" ? (k === "selecao" ? "🇧🇷 Seleção Brasileira" : ligaPorId(k)?.nome ?? k) : "NBA"}
              </div>
              <div className="card lista">
                {jogos.map((j) => (
                  <CartaoJogo key={j.id} j={j} basquete={sport === "basquete"} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}

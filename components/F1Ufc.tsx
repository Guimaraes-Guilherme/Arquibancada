"use client";
import { useEffect, useState } from "react";
import type { EventoUFC, GP, Luta, Sessao } from "@/lib/espn";
import { diaMes, hora, mes, quando } from "./fmt";
import { useJson } from "./prefs";
import { Carregando } from "./Placares";

function Contagem({ alvo }: { alvo: string }) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = Math.max(0, new Date(alvo).getTime() - agora);
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return (
    <div className="contagem">
      {[[d, "dias"], [h, "horas"], [m, "min"], [s, "seg"]].map(([v, l]) => (
        <div key={l}>
          <b>{String(v).padStart(2, "0")}</b>
          <span>{l}</span>
        </div>
      ))}
    </div>
  );
}

function Podio({ s, max = 3 }: { s: Sessao; max?: number }) {
  return (
    <div className="podio">
      {s.top.slice(0, max).map((p) => (
        <div key={p.pos}>
          <span className={`p p${p.pos}`}>{p.pos}º</span>
          {p.flag && <img src={p.flag} alt="" />}
          <span>{p.nome}</span>
        </div>
      ))}
    </div>
  );
}

function SessaoLinha({ s }: { s: Sessao }) {
  const [aberto, setAberto] = useState(false);
  const corrida = s.nome === "Corrida";
  return (
    <div className="sessao" onClick={() => s.top.length > 3 && setAberto(!aberto)}>
      <div className="sessao-top">
        <b>{s.nome}</b>
        {s.estado === "in" ? <span className="vivo">● AO VIVO</span> : <span>{quando(s.inicio)}</span>}
      </div>
      {s.top.length > 0 && <Podio s={s} max={aberto ? 10 : 3} />}
      {s.top.length > 3 && <div className="mais">{aberto ? "Mostrar menos" : corrida ? "Ver top 10" : "Ver mais"}</div>}
    </div>
  );
}

export function F1Inicio() {
  const { data } = useJson<GP[]>("/api/scores/f1", 60000);
  if (!data) return <Carregando />;
  const agora = Date.now();
  const atual = data.find((g) => g.estado === "in") ?? data.find((g) => new Date(g.fim).getTime() > agora && g.estado !== "post");
  const passados = data.filter((g) => g.estado === "post");
  const ultimo = passados[passados.length - 1];
  const proxSessao = atual?.sessoes.find((s) => s.estado !== "post");
  return (
    <>
      {atual && (
        <>
          <div className="secao">{atual.estado === "in" ? "Fim de semana em andamento" : "Próximo GP"}</div>
          <div className="card">
            <div className="hero">
              <h2>{atual.nome}</h2>
              <div className="loc">{atual.circuito} · {atual.local}</div>
              {proxSessao && proxSessao.estado === "pre" && (
                <>
                  <div style={{ marginTop: 14, fontSize: 13, color: "var(--sub)" }}>Falta para: <b style={{ color: "#fff" }}>{proxSessao.nome}</b></div>
                  <Contagem alvo={proxSessao.inicio} />
                </>
              )}
            </div>
            <div className="lista" style={{ borderTop: "1px solid var(--linha)" }}>
              {atual.sessoes.map((s, i) => (
                <SessaoLinha key={i} s={s} />
              ))}
            </div>
          </div>
        </>
      )}
      {ultimo && (
        <>
          <div className="secao">Último GP · {ultimo.nome}</div>
          <div className="card lista">
            {[...ultimo.sessoes].reverse().map((s, i) => (
              <SessaoLinha key={i} s={s} />
            ))}
          </div>
        </>
      )}
      <div className="secao">Calendário {new Date().getFullYear()}</div>
      <div className="card lista">
        {data.map((g) => {
          const corrida = g.sessoes.find((s) => s.nome === "Corrida");
          const venc = corrida?.top[0];
          return (
            <div key={g.id} className={`cal ${g.estado === "post" ? "passado" : ""} ${g.id === atual?.id ? "prox" : ""}`}>
              <div className="dia">
                <b>{diaMes(corrida?.inicio ?? g.inicio)}</b>
                <span>{mes(corrida?.inicio ?? g.inicio)}</span>
              </div>
              <div className="info">
                <b>{g.nome}</b>
                <span>{venc ? `🏆 ${venc.nome}` : corrida ? `Corrida ${hora(corrida.inicio)} · ${g.local}` : g.local}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function LutaCard({ l, principal }: { l: Luta; principal?: boolean }) {
  const cls = (v?: boolean) => (l.estado === "post" ? (v ? "venceu" : "perdeu") : "");
  return (
    <div className={`luta ${principal ? "principal" : ""}`}>
      <div className="luta-cat">
        <span>{principal ? "Luta principal · " : ""}{l.categoria}</span>
        {l.estado === "in" ? <span className="vivo">● {l.status}</span> : <span>{l.estado === "post" ? l.status : ""}</span>}
      </div>
      <div className="lutadores">
        <div className={`lutador ${cls(l.a.vencedor)}`}>
          <span>{l.a.vencedor && l.estado === "post" ? "✓ " : ""}{l.a.nome}</span>
          <small>{l.a.flag && <img src={l.a.flag} alt="" />}{l.a.cartel}</small>
        </div>
        <span className="vs">VS</span>
        <div className={`lutador b ${cls(l.b.vencedor)}`}>
          <span>{l.b.nome}{l.b.vencedor && l.estado === "post" ? " ✓" : ""}</span>
          <small>{l.b.cartel}{l.b.flag && <img src={l.b.flag} alt="" />}</small>
        </div>
      </div>
    </div>
  );
}

function EventoCard({ e, titulo, contagem }: { e: EventoUFC; titulo: string; contagem?: boolean }) {
  const [todas, setTodas] = useState(false);
  const lutas = todas ? e.lutas : e.lutas.slice(0, 5);
  return (
    <>
      <div className="secao">{titulo}</div>
      <div className="card">
        <div className="hero">
          <h2>{e.nome}</h2>
          <div className="loc">{quando(e.inicio)}{e.local ? ` · ${e.local}` : ""}</div>
          {contagem && e.estado === "pre" && <Contagem alvo={e.inicio} />}
        </div>
        <div className="lista" style={{ borderTop: "1px solid var(--linha)" }}>
          {lutas.map((l, i) => (
            <LutaCard key={l.id} l={l} principal={i === 0} />
          ))}
          {e.lutas.length > 5 && (
            <button className="sessao mais" style={{ width: "100%", textAlign: "left" }} onClick={() => setTodas(!todas)}>
              {todas ? "Mostrar menos" : `Ver card completo (${e.lutas.length} lutas)`}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export function UfcInicio() {
  const { data } = useJson<EventoUFC[]>("/api/scores/ufc", 60000);
  if (!data) return <Carregando />;
  const agora = Date.now();
  const vivo = data.find((e) => e.estado === "in");
  const proximo = data.find((e) => e.estado === "pre" && new Date(e.inicio).getTime() > agora - 3600000);
  const passados = data.filter((e) => e.estado === "post");
  const ultimo = passados[passados.length - 1];
  const futuros = data.filter((e) => e.estado === "pre" && e.id !== proximo?.id);
  return (
    <>
      {vivo && <EventoCard e={vivo} titulo="● Ao vivo agora" />}
      {proximo && <EventoCard e={proximo} titulo="Próximo evento" contagem />}
      {ultimo && <EventoCard e={ultimo} titulo="Último evento · resultados" />}
      {futuros.length > 0 && (
        <>
          <div className="secao">Próximos eventos</div>
          <div className="card lista">
            {futuros.map((e) => (
              <div key={e.id} className="cal">
                <div className="dia">
                  <b>{diaMes(e.inicio)}</b>
                  <span>{mes(e.inicio)}</span>
                </div>
                <div className="info">
                  <b>{e.nome}</b>
                  <span>{hora(e.inicio)}{e.local ? ` · ${e.local}` : ""}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

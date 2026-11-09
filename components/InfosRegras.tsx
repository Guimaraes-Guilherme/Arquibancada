"use client";
import { useState } from "react";
import type { Tabela } from "@/lib/espn";
import type { Noticia } from "@/lib/news";
import { REGRAS } from "@/lib/rules";
import { ligaPorId, type SportId } from "@/lib/sports";
import { tempoAtras } from "./fmt";
import { useJson } from "./prefs";
import { Carregando } from "./Placares";

function TabelaView({ t, limite }: { t: Tabela; limite?: number }) {
  const [tudo, setTudo] = useState(!limite);
  const linhas = tudo ? t.linhas : t.linhas.slice(0, limite);
  return (
    <div className="card">
      <table className="tabela">
        <thead>
          <tr>
            <th>#</th>
            <th>{t.titulo}</th>
            {t.colunas.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.nome}>
              <td className="pos">{l.pos}</td>
              <td className="t">
                <div>
                  {l.logo && <img src={l.logo} alt="" loading="lazy" style={t.colunas.length === 1 ? { width: 18, height: 12, objectFit: "cover" } : undefined} />}
                  <span>{l.nome}</span>
                </div>
              </td>
              {l.cols.map((c, i) => (
                <td key={i} className={i === 0 ? "pts" : ""}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {limite && t.linhas.length > limite && (
        <button className="sessao mais" style={{ width: "100%", textAlign: "left" }} onClick={() => setTudo(!tudo)}>
          {tudo ? "Mostrar menos" : "Ver tabela completa"}
        </button>
      )}
    </div>
  );
}

function Noticias({ sport }: { sport: SportId }) {
  const { data } = useJson<Noticia[]>(`/api/news/${sport}`);
  if (!data) return <Carregando />;
  if (data.length === 0) return <div className="vazio">Sem notícias agora.</div>;
  return (
    <div className="card lista">
      {data.slice(0, 20).map((n) => (
        <a key={n.link} className="noticia" href={n.link} target="_blank" rel="noreferrer">
          <b>{n.titulo}</b>
          <span>{n.fonte} · {tempoAtras(n.data)}</span>
        </a>
      ))}
    </div>
  );
}

export function Infos({ sport, ligas }: { sport: SportId; ligas: string[] }) {
  const ligasTabela = ligas.filter((l) => ligaPorId(l)?.tabela);
  const [liga, setLiga] = useState(ligasTabela[0] ?? "bra.1");
  const [grupo, setGrupo] = useState(0);
  const temTabela = sport !== "ufc";
  const url = temTabela ? `/api/standings/${sport}${sport === "futebol" ? `?liga=${liga}` : ""}` : null;
  const { data: tabelas, carregando } = useJson<Tabela[]>(url);

  return (
    <>
      {temTabela && (
        <>
          <div className="secao">{sport === "f1" ? "Campeonato" : "Classificação"}</div>
          {sport === "futebol" && (
            <div className="chips">
              {ligasTabela.map((l) => (
                <button key={l} className={`chip ${l === liga ? "on" : ""}`} onClick={() => { setLiga(l); setGrupo(0); }}>
                  {ligaPorId(l)?.curto}
                </button>
              ))}
            </div>
          )}
          {carregando || !tabelas ? (
            <Carregando />
          ) : tabelas.length === 0 ? (
            <div className="vazio">Sem tabela disponível agora.</div>
          ) : (
            <>
              {tabelas.length > 1 && (
                <div className="chips">
                  {tabelas.map((t, i) => (
                    <button key={t.titulo} className={`chip ${i === grupo ? "on" : ""}`} onClick={() => setGrupo(i)}>
                      {t.titulo}
                    </button>
                  ))}
                </div>
              )}
              {tabelas[grupo] && <TabelaView key={`${liga}-${grupo}`} t={tabelas[grupo]} limite={tabelas[grupo].linhas.length > 12 ? 10 : undefined} />}
            </>
          )}
        </>
      )}
      <div className="secao">Notícias</div>
      <Noticias sport={sport} />
    </>
  );
}

export function RegrasView({ sport }: { sport: SportId }) {
  const r = REGRAS[sport];
  const [abertos, setAbertos] = useState<Set<number>>(new Set());
  return (
    <>
      <div className="secao">Em 30 segundos</div>
      <div className="card bloco">
        <ul className="resumo">
          {r.resumo.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>

      <div className="secao">Novidades</div>
      <div className="card bloco novidade">
        <h3>{r.novidades.titulo}</h3>
        <ul className="resumo">
          {r.novidades.itens.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>

      <div className="secao">Regras em detalhe</div>
      {r.blocos.map((b) => (
        <details key={b.titulo} className="card bloco">
          <summary>{b.titulo}</summary>
          <ul className="resumo">
            {b.itens.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </details>
      ))}

      <div className="secao">Teste sua memória</div>
      <div className="card lista">
        {r.flash.map((f, i) => {
          const on = abertos.has(i);
          return (
            <button
              key={f.p}
              className={`flash ${on ? "aberto" : ""}`}
              onClick={() => {
                const n = new Set(abertos);
                if (on) n.delete(i);
                else n.add(i);
                setAbertos(n);
              }}
            >
              <b>{f.p}</b>
              <span>{on ? f.r : "Toque para ver a resposta"}</span>
            </button>
          );
        })}
      </div>
      <div className="atualizado">
        Atualizado em {r.atualizado}.<br />
        Fonte: {r.fonte}.
      </div>
    </>
  );
}

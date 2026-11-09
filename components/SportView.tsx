"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SPORTS, type SportId } from "@/lib/sports";
import Placares from "./Placares";
import { F1Inicio, UfcInicio } from "./F1Ufc";
import { Infos, RegrasView } from "./InfosRegras";
import { usePrefs } from "./prefs";

const ABAS = [
  { id: "inicio", nome: "Placares", icone: <path d="M3 5h18v14H3zM12 5v14M3 12h4M17 12h4" /> },
  { id: "infos", nome: "Infos gerais", icone: <path d="M4 5h16M4 10h16M4 15h10M4 20h7" /> },
  { id: "regras", nome: "Regras", icone: <path d="M6 3h10l4 4v14H6zM16 3v4h4M9 12h8M9 16h6" /> },
];

export default function SportView({ sport }: { sport: SportId }) {
  const s = SPORTS[sport];
  const params = useSearchParams();
  const router = useRouter();
  const aba = params.get("aba") ?? "inicio";
  const [prefs, , pronto] = usePrefs();
  const ligas = prefs.ligas;

  return (
    <div className="app" style={{ ["--cor" as string]: s.cor }}>
      <header className="topo">
        <Link href="/" className="voltar" aria-label="Voltar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </Link>
        <span className="faixa" />
        <h1>{s.nome}</h1>
        {sport === "futebol" && (
          <Link href="/config" className="chip" style={{ fontSize: 12 }}>Ligas</Link>
        )}
      </header>
      <main className="conteudo">
        {aba === "inicio" &&
          (sport === "f1" ? <F1Inicio /> : sport === "ufc" ? <UfcInicio /> : pronto ? <Placares sport={sport} ligas={ligas} /> : null)}
        {aba === "infos" && pronto && <Infos sport={sport} ligas={ligas} />}
        {aba === "regras" && <RegrasView sport={sport} />}
      </main>
      <nav className="abas">
        <div className="abas-in">
          {ABAS.map((a) => (
            <button
              key={a.id}
              className={`aba ${aba === a.id ? "on" : ""}`}
              onClick={() => {
                router.replace(`/${sport}${a.id === "inicio" ? "" : `?aba=${a.id}`}`, { scroll: false });
                window.scrollTo({ top: 0 });
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{a.icone}</svg>
              {a.nome}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

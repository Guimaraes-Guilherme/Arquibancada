"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LIGAS, NOTIF_LABELS, SPORTS, SPORT_IDS, type Notifs, type Prefs } from "@/lib/sports";
import { usePrefs } from "@/components/prefs";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function b64ParaBytes(b64: string) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

function Check({ on }: { on: boolean }) {
  return (
    <span className={`check ${on ? "on" : ""}`}>
      {on && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
      )}
    </span>
  );
}

async function enviaInscricao(prefs: Prefs, teste = false) {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return false;
  const r = await fetch("/api/push/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sub, prefs, teste }) });
  return r.ok;
}

export default function Config() {
  const [prefs, setPrefs, pronto] = usePrefs();
  const [inscrito, setInscrito] = useState<boolean | null>(null);
  const [suporte, setSuporte] = useState<"ok" | "ios" | "nao">("ok");
  const [toast, setToast] = useState("");
  const primeira = useRef(true);

  useEffect(() => {
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const instalado = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) setSuporte(ios && !instalado ? "ios" : "nao");
    else
      navigator.serviceWorker.ready.then((r) => r.pushManager.getSubscription()).then((s) => setInscrito(!!s)).catch(() => setInscrito(false));
  }, []);

  // sincroniza as preferências com o servidor quando mudarem
  useEffect(() => {
    if (!pronto) return;
    if (primeira.current) { primeira.current = false; return; }
    if (!inscrito) return;
    const t = setTimeout(() => enviaInscricao(prefs).catch(() => {}), 600);
    return () => clearTimeout(t);
  }, [prefs, inscrito, pronto]);

  const aviso = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  async function ativar() {
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return aviso("Permissão negada nas configurações do celular");
      const reg = await navigator.serviceWorker.ready;
      await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ParaBytes(VAPID) });
      const ok = await enviaInscricao(prefs, true);
      setInscrito(ok);
      aviso(ok ? "Notificações ligadas! ✅" : "Erro ao salvar no servidor");
    } catch {
      aviso("Não foi possível ativar");
    }
  }
  async function desativar() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await fetch("/api/push/subscribe", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ endpoint: sub.endpoint }) });
      await sub.unsubscribe();
    }
    setInscrito(false);
    aviso("Notificações desligadas");
  }

  const toggleLiga = (id: string) =>
    setPrefs({ ...prefs, ligas: prefs.ligas.includes(id) ? prefs.ligas.filter((l) => l !== id) : [...prefs.ligas, id] });
  const toggleSport = (id: (typeof SPORT_IDS)[number]) =>
    setPrefs({ ...prefs, esportes: prefs.esportes.includes(id) ? prefs.esportes.filter((s) => s !== id) : [...prefs.esportes, id] });
  const toggleNotif = (k: keyof Notifs) => setPrefs({ ...prefs, notifs: { ...prefs.notifs, [k]: !prefs.notifs[k] } });

  const grupos = [...new Set(LIGAS.map((l) => l.grupo))];

  return (
    <div className="app" style={{ ["--cor" as string]: "#4CC13A", paddingBottom: 40 }}>
      <header className="topo">
        <Link href="/" className="voltar" aria-label="Voltar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </Link>
        <h1>Configurações</h1>
      </header>
      <main className="conteudo">
        <div className="secao">Notificações</div>
        {suporte === "ios" ? (
          <div className="card bloco">
            <h3>Instale o app primeiro</h3>
            <div className="aviso" style={{ padding: 0 }}>
              No iPhone, as notificações só funcionam com o app instalado: toque em <b>Compartilhar</b> → <b>Adicionar à Tela de Início</b>, abra pelo ícone e volte aqui.
            </div>
          </div>
        ) : suporte === "nao" ? (
          <div className="aviso">Este navegador não suporta notificações.</div>
        ) : inscrito ? (
          <button className="botao sec" onClick={desativar}>🔔 Notificações ligadas · desligar</button>
        ) : (
          <button className="botao" onClick={ativar}>🔔 Ativar notificações</button>
        )}
        <div className="card lista" style={{ marginTop: 12 }}>
          {(Object.keys(NOTIF_LABELS) as (keyof Notifs)[]).map((k) => (
            <button key={k} className="opcao" onClick={() => toggleNotif(k)}>
              <Check on={prefs.notifs[k]} />
              {NOTIF_LABELS[k]}
            </button>
          ))}
        </div>

        <div className="secao">Esportes que eu acompanho</div>
        <div className="card lista">
          {SPORT_IDS.map((id) => (
            <button key={id} className="opcao" style={{ ["--cor" as string]: SPORTS[id].cor }} onClick={() => toggleSport(id)}>
              <Check on={prefs.esportes.includes(id)} />
              {SPORTS[id].nome}
              {id === "f1" && <span style={{ color: "var(--sub)", fontSize: 13, marginLeft: "auto" }}>Fórmula 1</span>}
              {id === "basquete" && <span style={{ color: "var(--sub)", fontSize: 13, marginLeft: "auto" }}>NBA</span>}
            </button>
          ))}
        </div>

        {grupos.map((g) => (
          <div key={g}>
            <div className="secao">⚽ {g}</div>
            <div className="card lista">
              {LIGAS.filter((l) => l.grupo === g).map((l) => (
                <button key={l.id} className="opcao" onClick={() => toggleLiga(l.id)}>
                  <Check on={prefs.ligas.includes(l.id)} />
                  {l.nome}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="aviso">As ligas marcadas aparecem nos placares do Futebol e nas notificações.</div>
      </main>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

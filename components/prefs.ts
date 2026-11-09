"use client";
import { useEffect, useState } from "react";
import { PREFS_PADRAO, type Prefs } from "@/lib/sports";

const CHAVE = "arq-prefs";
export function lerPrefs(): Prefs {
  try {
    const p = JSON.parse(localStorage.getItem(CHAVE) || "null");
    if (p) return { ...PREFS_PADRAO, ...p, notifs: { ...PREFS_PADRAO.notifs, ...(p.notifs || {}) } };
  } catch {}
  return PREFS_PADRAO;
}
export function salvarPrefs(p: Prefs) {
  try { localStorage.setItem(CHAVE, JSON.stringify(p)); } catch {}
}
export function usePrefs(): [Prefs, (p: Prefs) => void, boolean] {
  const [p, setP] = useState<Prefs>(PREFS_PADRAO);
  const [pronto, setPronto] = useState(false);
  useEffect(() => { setP(lerPrefs()); setPronto(true); }, []);
  return [p, (n) => { setP(n); salvarPrefs(n); }, pronto];
}

export function useJson<T>(url: string | null, intervaloMs?: number): { data: T | null; carregando: boolean } {
  const [data, setData] = useState<T | null>(null);
  const [carregando, setCarregando] = useState(true);
  useEffect(() => {
    if (!url) return;
    let vivo = true;
    setCarregando(true);
    setData(null);
    const busca = () =>
      fetch(url)
        .then((r) => r.json())
        .then((d) => { if (vivo) { setData(d); setCarregando(false); } })
        .catch(() => vivo && setCarregando(false));
    busca();
    const t = intervaloMs ? setInterval(busca, intervaloMs) : undefined;
    return () => { vivo = false; if (t) clearInterval(t); };
  }, [url, intervaloMs]);
  return { data, carregando };
}

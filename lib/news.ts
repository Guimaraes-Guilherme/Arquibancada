import type { SportId } from "./sports";

export type Noticia = { titulo: string; link: string; fonte: string; data: string };

const BUSCAS: Record<SportId, string> = {
  futebol: "futebol (Brasileirão OR Libertadores OR \"Copa do Brasil\" OR Champions OR \"Premier League\" OR \"La Liga\" OR Seleção)",
  f1: "\"Fórmula 1\" (piloto OR corrida OR GP OR equipe OR classificação)",
  ufc: "UFC (luta OR lutador OR cinturão OR evento)",
  basquete: "NBA basquete",
};

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}
const tag = (xml: string, t: string) => decode(xml.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`))?.[1] ?? "");

export async function noticias(sport: SportId, extra?: string): Promise<Noticia[]> {
  const q = extra ? `${extra} when:3d` : `${BUSCAS[sport]} when:2d`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
  try {
    const r = await fetch(url, { next: { revalidate: 900 } });
    if (!r.ok) return [];
    const xml = await r.text();
    const itens = xml.split("<item>").slice(1);
    const vistos = new Set<string>();
    return itens
      .map((it) => {
        const fonte = tag(it, "source");
        let titulo = tag(it, "title");
        if (fonte && titulo.endsWith(` - ${fonte}`)) titulo = titulo.slice(0, -(fonte.length + 3));
        return { titulo, link: tag(it, "link"), fonte, data: new Date(tag(it, "pubDate")).toISOString() };
      })
      .filter((n) => !/instagram|youtube|tiktok|facebook/i.test(n.fonte))
      .filter((n) => (vistos.has(n.titulo) ? false : (vistos.add(n.titulo), true)))
      .sort((a, b) => b.data.localeCompare(a.data))
      .slice(0, 30);
  } catch {
    return [];
  }
}

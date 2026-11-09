export const TZ = "America/Sao_Paulo";
export const hora = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
export const diaCurto = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: TZ }).replace(".", "");
export const diaMes = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", timeZone: TZ });
export const mes = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { month: "short", timeZone: TZ }).replace(".", "");
export const diaBR = (d: Date | string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(d));
export function addDias(dia: string, n: number) {
  const d = new Date(dia + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function rotuloDia(dia: string) {
  const hoje = diaBR(new Date());
  if (dia === hoje) return "Hoje";
  if (dia === addDias(hoje, -1)) return "Ontem";
  if (dia === addDias(hoje, 1)) return "Amanhã";
  return new Date(dia + "T12:00:00Z").toLocaleDateString("pt-BR", { weekday: "short", timeZone: "UTC" }).replace(".", "");
}
export function tempoAtras(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `há ${Math.max(m, 1)} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `há ${h} h`;
  return `há ${Math.round(h / 24)} d`;
}
export function quando(iso: string) {
  const d = diaBR(iso);
  const hoje = diaBR(new Date());
  const r = d === hoje ? "Hoje" : d === addDias(hoje, 1) ? "Amanhã" : d === addDias(hoje, -1) ? "Ontem" : diaCurto(iso);
  return `${r}, ${hora(iso)}`;
}

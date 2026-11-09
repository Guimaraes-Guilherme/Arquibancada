import { neon } from "@neondatabase/serverless";

let pronto = false;
export function sql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL não configurada");
  return neon(url);
}
export async function garanteTabelas() {
  if (pronto) return;
  const q = sql();
  await q`CREATE TABLE IF NOT EXISTS inscricoes (endpoint text PRIMARY KEY, sub jsonb NOT NULL, prefs jsonb NOT NULL, criado timestamptz DEFAULT now())`;
  await q`CREATE TABLE IF NOT EXISTS enviados (chave text PRIMARY KEY, em timestamptz DEFAULT now())`;
  pronto = true;
}
/** true se a chave é nova (ainda não foi enviada) */
export async function marca(chave: string): Promise<boolean> {
  const r = await sql()`INSERT INTO enviados (chave) VALUES (${chave}) ON CONFLICT DO NOTHING RETURNING chave`;
  return r.length > 0;
}
export async function limpaAntigos() {
  await sql()`DELETE FROM enviados WHERE em < now() - interval '4 days'`;
}

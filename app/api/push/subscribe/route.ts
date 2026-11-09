import { NextRequest, NextResponse } from "next/server";
import { garanteTabelas, sql } from "@/lib/db";
import { envia } from "@/lib/push";

export async function POST(req: NextRequest) {
  const { sub, prefs, teste } = await req.json();
  if (!sub?.endpoint) return NextResponse.json({ erro: "inscrição inválida" }, { status: 400 });
  await garanteTabelas();
  await sql()`INSERT INTO inscricoes (endpoint, sub, prefs) VALUES (${sub.endpoint}, ${JSON.stringify(sub)}, ${JSON.stringify(prefs)})
    ON CONFLICT (endpoint) DO UPDATE SET sub = EXCLUDED.sub, prefs = EXCLUDED.prefs`;
  if (teste) await envia(sub, { titulo: "Arquibancada 🏟️", corpo: "Notificações ligadas! Vou te avisar dos jogos, corridas e lutas.", url: "/" });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { endpoint } = await req.json();
  await garanteTabelas();
  await sql()`DELETE FROM inscricoes WHERE endpoint = ${endpoint}`;
  return NextResponse.json({ ok: true });
}

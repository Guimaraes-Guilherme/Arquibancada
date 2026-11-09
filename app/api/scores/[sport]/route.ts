import { NextRequest, NextResponse } from "next/server";
import { futebolDoDia, nbaDoDia, temporadaF1, temporadaUFC, hojeBR } from "@/lib/espn";
import { LIGAS_PADRAO } from "@/lib/sports";

export async function GET(req: NextRequest, { params }: { params: Promise<{ sport: string }> }) {
  const { sport } = await params;
  const dia = req.nextUrl.searchParams.get("dia") || hojeBR();
  const ligas = req.nextUrl.searchParams.get("ligas")?.split(",").filter(Boolean) ?? LIGAS_PADRAO;
  let data: unknown;
  if (sport === "futebol") data = await futebolDoDia(dia, ligas);
  else if (sport === "basquete") data = await nbaDoDia(dia);
  else if (sport === "f1") data = await temporadaF1();
  else if (sport === "ufc") data = await temporadaUFC();
  else return NextResponse.json({ erro: "esporte inválido" }, { status: 404 });
  return NextResponse.json(data, { headers: { "cache-control": "public, s-maxage=30, stale-while-revalidate=60" } });
}

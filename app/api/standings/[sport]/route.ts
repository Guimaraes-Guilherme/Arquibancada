import { NextRequest, NextResponse } from "next/server";
import { tabelas } from "@/lib/espn";
import { ligaPorId } from "@/lib/sports";

export async function GET(req: NextRequest, { params }: { params: Promise<{ sport: string }> }) {
  const { sport } = await params;
  let path: string;
  if (sport === "f1") path = "racing/f1";
  else if (sport === "basquete") path = "basketball/nba";
  else if (sport === "futebol") {
    const liga = req.nextUrl.searchParams.get("liga") ?? "bra.1";
    if (!ligaPorId(liga)?.tabela) return NextResponse.json([]);
    path = `soccer/${liga}`;
  } else return NextResponse.json([]);
  return NextResponse.json(await tabelas(path), { headers: { "cache-control": "public, s-maxage=600" } });
}

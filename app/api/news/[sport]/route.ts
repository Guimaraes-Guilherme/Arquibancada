import { NextRequest, NextResponse } from "next/server";
import { noticias } from "@/lib/news";
import { SPORTS, type SportId } from "@/lib/sports";

export async function GET(req: NextRequest, { params }: { params: Promise<{ sport: string }> }) {
  const { sport } = await params;
  if (!(sport in SPORTS)) return NextResponse.json([], { status: 404 });
  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  return NextResponse.json(await noticias(sport as SportId, q), { headers: { "cache-control": "public, s-maxage=600" } });
}

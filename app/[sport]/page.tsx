import { notFound } from "next/navigation";
import { Suspense } from "react";
import SportView from "@/components/SportView";
import { SPORTS, SPORT_IDS, type SportId } from "@/lib/sports";

export function generateStaticParams() {
  return SPORT_IDS.map((sport) => ({ sport }));
}

export default async function Page({ params }: { params: Promise<{ sport: string }> }) {
  const { sport } = await params;
  if (!(sport in SPORTS)) notFound();
  return (
    <Suspense>
      <SportView sport={sport as SportId} />
    </Suspense>
  );
}

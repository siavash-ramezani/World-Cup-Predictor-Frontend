import { apiGet, requireSession } from "@/lib/api";
import type { Match, Wrapped } from "@/lib/types";
import MatchesClient from "@/components/MatchesClient";

export const metadata = { title: "Past matches · World Cup Predictor" };

export default async function MatchesPage() {
  await requireSession();
  const { data: matches } = await apiGet<Wrapped<Match[]>>("/matches?status=finished");
  return <MatchesClient matches={matches} />;
}

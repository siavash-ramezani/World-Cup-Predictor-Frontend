import { apiGet, requireSession } from "@/lib/api";
import type { Match, Wrapped } from "@/lib/types";
import MatchesClient from "@/components/MatchesClient";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata() {
  const t = await getT();
  return { title: `${t.matches.title} · ${t.common.appName}` };
}

export default async function MatchesPage() {
  await requireSession();
  const { data: matches } = await apiGet<Wrapped<Match[]>>("/matches?status=finished");
  return <MatchesClient matches={matches} />;
}

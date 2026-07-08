import { redirect } from "next/navigation";
import { apiGet, requireSession } from "@/lib/api";
import type { MatchDetail, Wrapped } from "@/lib/types";
import MatchDetailClient from "@/components/MatchDetailClient";

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession();

  const { data: match } = await apiGet<Wrapped<MatchDetail>>(`/matches/${id}/detail`);

  // Settled fixtures have their own screen.
  if (match.is_finished) redirect(`/match/${id}/results`);

  return <MatchDetailClient match={match} isGuest={session.user?.is_guest ?? false} />;
}

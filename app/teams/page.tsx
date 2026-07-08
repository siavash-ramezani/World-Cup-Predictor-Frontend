import { apiGet, requireSession } from "@/lib/api";
import type { TeamListItem, Wrapped } from "@/lib/types";
import TeamsClient from "@/components/TeamsClient";

export const metadata = { title: "Teams · World Cup Predictor" };

export default async function TeamsPage() {
  await requireSession();
  const { data: teams } = await apiGet<Wrapped<TeamListItem[]>>("/teams");
  return <TeamsClient teams={teams} />;
}

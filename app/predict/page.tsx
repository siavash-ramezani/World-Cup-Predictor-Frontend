import { apiGet, requireSession } from "@/lib/api";
import type { ApiUser, Match, Wrapped } from "@/lib/types";
import { isSameDay, parseApiTime } from "@/lib/format";
import PredictClient from "@/components/PredictClient";

export default async function PredictPage() {
  const session = await requireSession();

  const [me, matches] = await Promise.all([
    apiGet<Wrapped<ApiUser>>("/me"),
    apiGet<Wrapped<Match[]>>("/matches?status=upcoming"),
  ]);

  // Grouped on the server so the tabs can't disagree with the client clock.
  const now = new Date();
  const open = matches.data.filter((m) => m.is_prediction_open);
  const today = open.filter((m) => isSameDay(new Date(parseApiTime(m.match_time)), now));
  const upcoming = open.filter((m) => !isSameDay(new Date(parseApiTime(m.match_time)), now));
  const locked = matches.data.filter((m) => !m.is_prediction_open);

  const initialTab = today.length ? 0 : upcoming.length ? 1 : 2;

  return (
    <PredictClient
      groups={{ today, upcoming, locked }}
      initialTab={initialTab}
      totalPoints={me.data.total_points ?? 0}
      isGuest={session.user?.is_guest ?? false}
    />
  );
}

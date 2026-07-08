// Types mirroring the live Laravel API (`/api/v1`). Verified against real responses.

export type Outcome = "home" | "draw" | "away";

export type ApiUser = {
  id: number;
  name: string;
  avatar_url: string;
  is_admin: boolean;
  is_guest: boolean;
  bale_linked: boolean;
  mobile?: string;
  total_points?: number;
};

/** The minimal user we persist in the session cookie. */
export type SessionUser = Pick<ApiUser, "id" | "name" | "avatar_url" | "is_guest" | "is_admin">;

export type Team = { name: string; flag: string };

export type Scoring = { multiplier: number; exact_points: number; result_points: number };

export type Prediction = {
  home: number;
  away: number;
  label: string;
  points_earned?: number;
  reward_type?: string;
};

export type MyCall = { outcome: Outcome; label: string };

export type DollarBet = {
  active: boolean;
  predicted_outcome: Outcome | null;
  won: boolean | null;
  payout: number | null;
};

export type Match = {
  id: number;
  round: string;
  round_label: string;
  match_number: string | null;
  home: Team;
  away: Team;
  home_score: number | null;
  away_score: number | null;
  status: "upcoming" | "live" | "finished";
  is_finished: boolean;
  is_prediction_open: boolean;
  match_time: string;
  match_time_label: string;
  prediction_deadline: string;
  venue: string | null;
  result_label: string | null;
  scoring: Scoring;
  my_prediction: Prediction | null;
  my_call: MyCall | null;
  dollar_bet: DollarBet | null;
  dollar_bet_count: number;
};

export type CommunityPick = {
  user: Pick<ApiUser, "id" | "name" | "avatar_url" | "is_admin" | "is_guest" | "bale_linked">;
  prediction: Prediction;
  points_earned: number;
  dollar_bet: DollarBet | null;
};

export type Community = {
  total_predictions: number;
  multiplier: number;
  win_probability: Record<Outcome, { count: number; percent: number }>;
  dollar: { total: number; home: number; draw: number; away: number };
  picks: CommunityPick[];
};

/** `community` is null (and `community_locked` true) until the prediction deadline. */
export type MatchDetail = Match & {
  community_locked: boolean;
  community: Community | null;
};

export type DashboardUser = ApiUser & {
  total_points: number;
  rank: number | null;
  rank_delta: number | null;
  total_players: number;
  points_this_week: number;
};

export type RecentResult = {
  match: Match;
  prediction: Prediction;
  points_earned: number;
};

export type Dashboard = {
  user: DashboardUser;
  next_match: Match | null;
  recent_results: RecentResult[];
};

export type LeaderRow = {
  id: number;
  name: string;
  avatar_url: string;
  points: number;
  count: number;
  rank: number;
  rank_delta: number | null;
};

export type DollarRow = {
  id: number;
  name: string;
  avatar_url: string;
  participated: number;
  balance: number;
  wins: number;
  losses: number;
};

export type RankSeries = { name: string; ranks: (number | null)[] };

export type DailyPoints = { dates: string[]; points: number[]; match_counts: number[] };

export type TeamBubble = {
  name: string;
  flag: string;
  matches: number;
  avg_actual: number;
  avg_predicted: number;
};

/** GET /teams — one row per team. */
export type TeamListItem = {
  name: string;
  flag: string;
  played: number;
  wins: number;
  gf: number;
  ga: number;
  gd: number;
};

export type TeamStats = {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
};

/** Team fixtures omit the caller's own prediction/bet fields. */
export type TeamMatch = Omit<Match, "my_prediction" | "my_call" | "dollar_bet" | "dollar_bet_count">;

/** NOTE: `total_points` and `exact_count` arrive as strings (SQL aggregates). */
export type TopPredictor = {
  id: number;
  name: string;
  avatar_url: string;
  total_points: string | number;
  pred_count: number;
  exact_count: string | number;
};

/** GET /teams/{name} */
export type TeamDetail = {
  name: string;
  flag: string;
  stats: TeamStats;
  matches: TeamMatch[];
  top_predictors: TopPredictor[];
};

/** GET /users/{id} — public profile of an active, non-admin player. */
export type PublicProfile = {
  user: Pick<ApiUser, "id" | "name" | "avatar_url" | "is_admin" | "is_guest" | "bale_linked">;
  total_points: number;
  total_predictions: number;
  correct_count: number;
  exact_count: number;
  daily_points: { dates: string[]; points: number[] };
  distribution: { exact: number; result: number; diff: number; none: number };
  predictions: { match: Match; prediction: Prediction; points_earned: number }[];
};

// ---- envelope shapes ----
export type Wrapped<T> = { data: T };
export type WrappedMeta<T, M> = { data: T; meta: M };

export type LoginRes = Wrapped<{ token: string; token_type: string; user: ApiUser }>;
export type LeaderboardRes = WrappedMeta<LeaderRow[], { total_players: number; me: LeaderRow | null }>;
export type DollarRes = WrappedMeta<DollarRow[], { me: DollarRow | null; your_balance: number }>;
export type RankTrendRes = WrappedMeta<{ dates: string[]; series: RankSeries[] }, { me_name: string }>;
export type StatsRes = Wrapped<{ daily_points: DailyPoints; team_bubbles: { teams: TeamBubble[] } }>;

export type Locale = "en" | "ar";
export const LOCALES: Locale[] = ["en", "ar"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "wcp_locale";

export function isLocale(v: unknown): v is Locale {
  return v === "en" || v === "ar";
}

export function dirOf(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export type Dictionary = {
  locale: Locale;
  dir: "ltr" | "rtl";

  common: {
    appName: string;
    metaDescription: string;
    signIn: string;
    you: string;
    pts: string;
    footer: string;
    arrow: string;
  };

  tabbar: {
    home: string;
    predict: string;
    ranks: string;
    profile: string;
  };

  a11y: {
    back: string;
    increase: string;
    decrease: string;
    searchTeams: string;
    searchMatches: string;
    switchLanguage: string;
  };

  verdict: {
    exact: string;
    result: string;
    missed: string;
    pending: string;
    exactLong: string;
    resultLong: string;
    missedLong: string;
    pendingLong: string;
    draw: string;
    teamWin: (team: string) => string;
  };

  greeting: {
    morning: string;
    afternoon: string;
    evening: string;
  };

  countdown: {
    locked: string;
    now: string;
    day: string;
    hour: string;
    minute: string;
    second: string;
  };

  home: {
    totalPoints: string;
    rankOf: (rank: number, total: number) => string;
    playersCount: (n: number) => string;
    pointsThisWeek: (n: number) => string;
    noPointsThisWeek: string;
    locksIn: string;
    edit: string;
    predict: string;
    noUpcoming: string;
    recentResults: string;
    seeAll: string;
    noSettled: string;
    makeAPick: string;
    picked: (label: string) => string;
  };

  predict: {
    title: string;
    picksLockIn: string;
    noPicksOpen: string;
    tabToday: string;
    tabUpcoming: string;
    tabLocked: string;
    guestBrowsing: string;
    signInToSubmit: string;
    emptyToday: string;
    emptyUpcoming: string;
    emptyLocked: string;
    saved: string;
    exactPlus: (n: number) => string;
    yourCall: string;
    lockedIn: string;
    lockedNoPick: string;
    matchDetails: string;
    submitting: string;
    allSaved: string;
    submitN: (n: number) => string;
    savedNPicks: (n: number) => string;
  };

  matchDetail: {
    locksInLower: string;
    now: string;
    guestCantPredict: string;
    toPlay: string;
    predictionsLocked: string;
    yourPrediction: string;
    winProbability: string;
    community: string;
    hiddenPicks: string;
    exactScore: string;
    rightResult: string;
    everyonesPicks: string;
    more: (n: number) => string;
    saving: string;
    updatePrediction: string;
    savePrediction: string;
    predictionSaved: string;
  };

  matchResults: {
    title: string;
    fullTime: string;
    youPicked: (label: string) => string;
    predictionsCount: (n: number) => string;
    communityUnavailable: string;
    pointsPredictions: string;
    inCount: (n: number) => string;
    allPredictions: string;
  };

  teams: {
    title: string;
    searchPlaceholder: string;
    sortAZ: string;
    sortBest: string;
    noTeamsMatch: (q: string) => string;
    playedShort: (n: number) => string;
  };

  teamDetail: {
    header: string;
    played: string;
    goalsFor: string;
    goalsAgainst: string;
    record: string;
    wins: string;
    draws: string;
    losses: string;
    matches: string;
    noFixtures: string;
    vs: string;
    at: string;
    upcoming: string;
    topPredictors: string;
    topPredictorsSub: (team: string) => string;
    noTopPredictors: string;
    predictionsCount: (n: number) => string;
    exactCount: (n: number) => string;
  };

  matches: {
    title: string;
    searchPlaceholder: string;
    all: string;
    matchesLabel: string;
    predictedLabel: string;
    exactLabel: string;
    ptsLabel: string;
    noMatches: string;
    noPick: string;
  };

  ranks: {
    title: string;
    playersCount: (n: number) => string;
    tabPoints: string;
    tabRank: string;
    tabStats: string;
    noPlayersRanked: string;
    headerHash: string;
    headerPlayer: string;
    headerDelta: string;
    headerPts: string;
    predictionsCount: (n: number) => string;
    ofTotalPlayers: (shown: number, total: number) => string;
    rankOverTime: string;
    lastNDays: (n: number) => string;
    peakedAt: (rank: number, date: string) => string;
    nowAt: (rank: number) => string;
    noRankHistory: string;
    pickPlayerBelow: string;
    shownOf: (shown: number, total: number) => string;
    showAll: string;
    onlyMe: string;
    noTournamentStats: string;
    totalPoints: string;
    avgPerDay: string;
    bestDay: string;
    dailyPointsDistributed: string;
    dailyPointsFooter: string;
  };

  profile: {
    title: string;
    guestReadOnly: string;
    player: string;
    rankHash: (n: number) => string;
    ofPlayers: (n: number) => string;
    guestNotice: string;
    totalPointsLabel: string;
    predictionsLabel: string;
    shortcuts: string;
    linkPublicProfile: string;
    linkPastMatches: string;
    linkTeams: string;
    linkMakePicks: string;
    linkLeaderboards: string;
    exitGuest: string;
    signOut: string;
    footer: string;
    language: string;
    editName: string;
    saveName: string;
    savingName: string;
    cancelEditName: string;
  };

  login: {
    metaTitle: string;
    brandLine1: string;
    brandLine2: string;
    tagline: string;
    countryLabel: string;
    countrySa: string;
    countryAe: string;
    countryPl: string;
    mobileLabel: string;
    mobilePlaceholder: string;
    passwordLabel: string;
    signingIn: string;
    signIn: string;
    or: string;
    continuingGuest: string;
    continueGuest: string;
    guestFootnote: string;
  };

  userProfile: {
    header: string;
    you: string;
    exactScoresCount: (n: number) => string;
    exactRatePct: (n: number) => string;
    totalPointsLabel: string;
    predictionsLabel: string;
    accuracyLabel: string;
    breakdownTitle: string;
    dExact: string;
    dResult: string;
    dDiff: string;
    dMissed: string;
    pointsPerDay: string;
    recentPredictions: string;
    noPredictions: string;
    earlierPredictions: (n: number) => string;
  };

  error: {
    title: string;
    body: string;
    tryAgain: string;
  };

  actions: {
    enterMobilePassword: string;
    sessionExpired: string;
    guestMustSignIn: string;
  };
};

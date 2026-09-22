const API_HOST = "api-football-v1.p.rapidapi.com";
const BASE_URL = `https://${API_HOST}/v3`;

export const LEAGUES = {
  ligue1: { id: 61, name: "Ligue 1" },
  ligue2: { id: 62, name: "Ligue 2" },
} as const;

export type LeagueKey = keyof typeof LEAGUES;

export function getCurrentSeason(): number {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const year = now.getFullYear();
  return month >= 7 ? year : year - 1;
}

async function callApi<T>(
  path: string,
  params: Record<string, string | number>,
  revalidateSeconds: number
): Promise<T> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    throw new Error("RAPIDAPI_KEY manquante dans les variables d'environnement");
  }

  const search = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  );

  const res = await fetch(`${BASE_URL}${path}?${search.toString()}`, {
    headers: {
      "x-rapidapi-key": apiKey,
      "x-rapidapi-host": API_HOST,
    },
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new Error(`Erreur API-Football (${path}): ${res.status}`);
  }

  const json = await res.json();
  return json.response as T;
}

export interface Team {
  team: {
    id: number;
    name: string;
    code: string | null;
    country: string;
    founded: number | null;
    logo: string;
  };
  venue: {
    name: string | null;
    city: string | null;
  };
}

export async function getTeams(leagueId: number): Promise<Team[]> {
  return callApi<Team[]>(
    "/teams",
    { league: leagueId, season: getCurrentSeason() },
    60 * 60 * 24 // 24h : la composition des championnats change rarement
  );
}

export interface StandingRow {
  rank: number;
  team: { id: number; name: string; logo: string };
  points: number;
  goalsDiff: number;
  form: string | null;
  status: string;
  description: string | null;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: { for: number; against: number };
  };
}

interface StandingsResponse {
  league: {
    id: number;
    name: string;
    season: number;
    standings: StandingRow[][];
  };
}

export async function getStandings(leagueId: number): Promise<StandingRow[]> {
  const data = await callApi<StandingsResponse[]>(
    "/standings",
    { league: leagueId, season: getCurrentSeason() },
    60 * 30 // 30 min
  );
  return data[0]?.league.standings[0] ?? [];
}

export interface Fixture {
  fixture: {
    id: number;
    date: string;
    status: { long: string; short: string; elapsed: number | null };
  };
  league: { id: number; name: string; round: string };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
}

export async function getLiveFixtures(): Promise<Fixture[]> {
  const all = await callApi<Fixture[]>(
    "/fixtures",
    { live: "all" },
    30 // 30 s
  );
  const leagueIds = new Set<number>([LEAGUES.ligue1.id, LEAGUES.ligue2.id]);
  return all.filter((f) => leagueIds.has(f.league.id));
}

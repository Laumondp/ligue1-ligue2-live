const API_HOST = "sofascore.p.rapidapi.com";
const BASE_URL = `https://${API_HOST}`;

export const LEAGUES = {
  ligue1: { tournamentId: 34, name: "Ligue 1" },
  ligue2: { tournamentId: 182, name: "Ligue 2" },
  premierLeague: { tournamentId: 17, name: "Premier League" },
  laliga: { tournamentId: 8, name: "LaLiga" },
} as const;

export type LeagueKey = keyof typeof LEAGUES;

function headers() {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    throw new Error("RAPIDAPI_KEY manquante dans les variables d'environnement");
  }
  return {
    "x-rapidapi-key": apiKey,
    "x-rapidapi-host": API_HOST,
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Le plan gratuit de cette API limite fortement les requêtes concurrentes :
// on retente avec un court délai en cas de 429 plutôt que d'échouer directement.
async function callApi(
  path: string,
  params: Record<string, string | number>,
  revalidateSeconds: number
): Promise<Response> {
  const search = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  );
  const url = `${BASE_URL}${path}?${search.toString()}`;

  let res: Response | null = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    res = await fetch(url, {
      headers: headers(),
      next: { revalidate: revalidateSeconds },
    });
    if (res.status !== 429) return res;
    await delay(1000 * (attempt + 1));
  }
  return res!;
}

export interface SofascoreTeam {
  id: number;
  name: string;
  shortName: string;
}

export interface StandingRow {
  position: number;
  team: SofascoreTeam;
  points: number;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  scoresFor: number;
  scoresAgainst: number;
  scoreDiffFormatted: string;
}

export async function getCurrentSeasonId(tournamentId: number): Promise<number> {
  const res = await callApi(
    "/tournaments/get-seasons",
    { tournamentId },
    60 * 60 * 24 // 24h
  );
  if (!res.ok) throw new Error(`Erreur Sofascore (seasons): ${res.status}`);
  const data = await res.json();
  const seasons: { id: number }[] = data.seasons ?? [];
  if (seasons.length === 0) throw new Error("Aucune saison trouvée");
  return seasons[0].id;
}

export async function getStandings(tournamentId: number): Promise<StandingRow[]> {
  const seasonId = await getCurrentSeasonId(tournamentId);
  const res = await callApi(
    "/tournaments/get-standings",
    { tournamentId, seasonId, type: "total" },
    60 * 30 // 30 min
  );
  if (!res.ok) throw new Error(`Erreur Sofascore (standings): ${res.status}`);
  const data = await res.json();
  const rows = data.standings?.[0]?.rows ?? [];

  return rows.map((row: {
    position: number;
    team: { id: number; name: string; shortName: string };
    points: number;
    matches: number;
    wins: number;
    draws: number;
    losses: number;
    scoresFor: number;
    scoresAgainst: number;
    scoreDiffFormatted: string;
  }) => ({
    position: row.position,
    team: { id: row.team.id, name: row.team.name, shortName: row.team.shortName },
    points: row.points,
    matches: row.matches,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    scoresFor: row.scoresFor,
    scoresAgainst: row.scoresAgainst,
    scoreDiffFormatted: row.scoreDiffFormatted,
  }));
}

export async function getTeams(tournamentId: number): Promise<SofascoreTeam[]> {
  const standings = await getStandings(tournamentId);
  return standings
    .map((row) => row.team)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export interface Fixture {
  id: number;
  tournamentName: string;
  status: { type: string; description: string };
  startTimestamp: number;
  homeTeam: SofascoreTeam;
  awayTeam: SofascoreTeam;
  homeScore: number | null;
  awayScore: number | null;
}

async function getLiveEventsForTournament(tournamentId: number, tournamentName: string): Promise<Fixture[]> {
  const res = await callApi(
    "/tournaments/get-live-events",
    { tournamentId },
    30 // 30 s
  );
  if (!res.ok) return []; // panne ponctuelle ou quota atteint : on n'affiche rien plutôt qu'une erreur
  const data = await res.json();
  if (data.error) return []; // aucun match en direct sur ce championnat
  const events: {
    id: number;
    startTimestamp: number;
    status: { type: string; description: string };
    homeTeam: { id: number; name: string; shortName: string };
    awayTeam: { id: number; name: string; shortName: string };
    homeScore?: { current?: number };
    awayScore?: { current?: number };
  }[] = data.events ?? [];

  return events.map((e) => ({
    id: e.id,
    tournamentName,
    status: e.status,
    startTimestamp: e.startTimestamp,
    homeTeam: { id: e.homeTeam.id, name: e.homeTeam.name, shortName: e.homeTeam.shortName },
    awayTeam: { id: e.awayTeam.id, name: e.awayTeam.name, shortName: e.awayTeam.shortName },
    homeScore: e.homeScore?.current ?? null,
    awayScore: e.awayScore?.current ?? null,
  }));
}

// Appels séquentiels (pas de Promise.all) : le palier gratuit de l'API tolère mal
// les requêtes concurrentes, cf. historique des 429 sur cette fonction.
export async function getLiveFixtures(
  leagues: { tournamentId: number; name: string }[]
): Promise<Fixture[]> {
  const fixtures: Fixture[] = [];
  for (const league of leagues) {
    fixtures.push(...(await getLiveEventsForTournament(league.tournamentId, league.name)));
  }
  return fixtures;
}

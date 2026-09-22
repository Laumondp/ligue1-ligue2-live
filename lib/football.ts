const API_HOST = "sofascore.p.rapidapi.com";
const BASE_URL = `https://${API_HOST}`;

export const LEAGUES = {
  ligue1: { tournamentId: 34, name: "Ligue 1" },
  ligue2: { tournamentId: 182, name: "Ligue 2" },
  premierLeague: { tournamentId: 17, name: "Premier League" },
  laliga: { tournamentId: 8, name: "LaLiga" },
  serieA: { tournamentId: 23, name: "Serie A" },
  bundesliga: { tournamentId: 35, name: "Bundesliga" },
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

export async function getStandings(
  tournamentId: number,
  type: "total" | "home" | "away" = "total"
): Promise<StandingRow[]> {
  const seasonId = await getCurrentSeasonId(tournamentId);
  const res = await callApi(
    "/tournaments/get-standings",
    { tournamentId, seasonId, type },
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

export interface TeamRecord {
  team: SofascoreTeam;
  leagueLabel: string;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  pointsPerMatch: number;
  scoresFor: number;
  scoresForPerMatch: number;
  scoresAgainst: number;
  scoresAgainstPerMatch: number;
  goalDiffPerMatch: number;
}

export interface LeagueComparison {
  bestAttackTotal: TeamRecord[];
  bestAttackPerMatch: TeamRecord[];
  bestDefensePerMatch: TeamRecord[];
  bestForm: TeamRecord[];
  bestGoalDiff: TeamRecord[];
  mostWins: TeamRecord[];
  mostDraws: TeamRecord[];
  mostLosses: TeamRecord[];
  bestHome: TeamRecord[];
  bestAway: TeamRecord[];
}

function toRecord(row: StandingRow, leagueLabel: string): TeamRecord {
  return {
    team: row.team,
    leagueLabel,
    matches: row.matches,
    wins: row.wins,
    draws: row.draws,
    losses: row.losses,
    points: row.points,
    pointsPerMatch: row.points / row.matches,
    scoresFor: row.scoresFor,
    scoresForPerMatch: row.scoresFor / row.matches,
    scoresAgainst: row.scoresAgainst,
    scoresAgainstPerMatch: row.scoresAgainst / row.matches,
    goalDiffPerMatch: (row.scoresFor - row.scoresAgainst) / row.matches,
  };
}

// Un championnat en panne (quota, 429...) ne doit pas faire échouer toute la
// comparaison : on l'ignore simplement et on garde les autres.
async function getAllRecords(type: "total" | "home" | "away"): Promise<TeamRecord[]> {
  const records: TeamRecord[] = [];
  for (const league of Object.values(LEAGUES)) {
    try {
      const rows = await getStandings(league.tournamentId, type);
      records.push(
        ...rows.filter((row) => row.matches > 0).map((row) => toRecord(row, league.name))
      );
    } catch {
      continue;
    }
  }
  return records;
}

// Séquentiel (total, puis home, puis away) pour la même raison que
// getLiveFixtures : le palier gratuit tolère mal les appels concurrents.
export async function getLeagueComparison(limit = 8): Promise<LeagueComparison> {
  const total = await getAllRecords("total");
  const home = await getAllRecords("home");
  const away = await getAllRecords("away");

  const topBy = (records: TeamRecord[], compare: (a: TeamRecord, b: TeamRecord) => number) =>
    [...records].sort(compare).slice(0, limit);

  return {
    bestAttackTotal: topBy(total, (a, b) => b.scoresFor - a.scoresFor),
    bestAttackPerMatch: topBy(total, (a, b) => b.scoresForPerMatch - a.scoresForPerMatch),
    bestDefensePerMatch: topBy(total, (a, b) => a.scoresAgainstPerMatch - b.scoresAgainstPerMatch),
    bestForm: topBy(total, (a, b) => b.pointsPerMatch - a.pointsPerMatch),
    bestGoalDiff: topBy(total, (a, b) => b.goalDiffPerMatch - a.goalDiffPerMatch),
    mostWins: topBy(total, (a, b) => b.wins - a.wins),
    mostDraws: topBy(total, (a, b) => b.draws - a.draws),
    mostLosses: topBy(total, (a, b) => b.losses - a.losses),
    bestHome: topBy(home, (a, b) => b.pointsPerMatch - a.pointsPerMatch),
    bestAway: topBy(away, (a, b) => b.pointsPerMatch - a.pointsPerMatch),
  };
}

export interface TopScorer {
  player: { id: number; name: string };
  team: SofascoreTeam;
  leagueLabel: string;
  goals: number;
  appearances: number;
  goalsPerMatch: number;
}

// Le classement des buteurs par match (forme récente) demanderait un appel par
// joueur pour son historique récent : bien trop coûteux pour le palier gratuit
// (une centaine de joueurs à couvrir contre 100 requêtes/jour). On se limite
// donc au total de buts et au ratio buts/match, déjà fournis par cet appel.
async function getTopScorersForLeague(
  tournamentId: number,
  leagueLabel: string,
  limit: number
): Promise<TopScorer[]> {
  const seasonId = await getCurrentSeasonId(tournamentId);
  const res = await callApi(
    "/tournaments/get-top-players",
    { tournamentId, seasonId, type: "overall" },
    60 * 60 * 6 // 6h : les buteurs ne changent pas à chaque minute
  );
  if (!res.ok) return [];
  const data = await res.json();
  const rows: {
    player: { id: number; name: string };
    team: { id: number; name: string; shortName: string };
    statistics: { goals: number; appearances: number };
  }[] = data.goals ?? [];

  return rows.slice(0, limit).map((row) => ({
    player: { id: row.player.id, name: row.player.name },
    team: { id: row.team.id, name: row.team.name, shortName: row.team.shortName },
    leagueLabel,
    goals: row.statistics.goals,
    appearances: row.statistics.appearances,
    goalsPerMatch: row.statistics.appearances ? row.statistics.goals / row.statistics.appearances : 0,
  }));
}

export async function getTopScorersComparison(limit = 15, perLeague = 10): Promise<TopScorer[]> {
  const all: TopScorer[] = [];
  for (const league of Object.values(LEAGUES)) {
    try {
      all.push(...(await getTopScorersForLeague(league.tournamentId, league.name, perLeague)));
    } catch {
      continue;
    }
  }
  return all.sort((a, b) => b.goals - a.goals).slice(0, limit);
}

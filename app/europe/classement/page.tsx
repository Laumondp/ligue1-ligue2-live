import { getStandings, LEAGUES } from "@/lib/football";
import StandingsView from "@/components/StandingsView";

async function loadStandings() {
  try {
    const premierLeague = await getStandings(LEAGUES.premierLeague.tournamentId);
    const laliga = await getStandings(LEAGUES.laliga.tournamentId);
    const serieA = await getStandings(LEAGUES.serieA.tournamentId);
    const bundesliga = await getStandings(LEAGUES.bundesliga.tournamentId);
    const eredivisie = await getStandings(LEAGUES.eredivisie.tournamentId);
    const portugal = await getStandings(LEAGUES.portugal.tournamentId);
    const belgium = await getStandings(LEAGUES.belgium.tournamentId);
    const switzerland = await getStandings(LEAGUES.switzerland.tournamentId);
    return { premierLeague, laliga, serieA, bundesliga, eredivisie, portugal, belgium, switzerland };
  } catch {
    return null;
  }
}

export default async function EuropeClassementPage() {
  const data = await loadStandings();

  if (!data) {
    return (
      <div className="text-center text-zinc-500 py-16">
        Impossible de charger le classement pour le moment. Vérifiez la clé API.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Classement</h1>
      <StandingsView
        groups={[
          { key: "premierLeague", label: "Premier League", rows: data.premierLeague },
          { key: "laliga", label: "LaLiga", rows: data.laliga },
          { key: "serieA", label: "Serie A", rows: data.serieA },
          { key: "bundesliga", label: "Bundesliga", rows: data.bundesliga },
          { key: "eredivisie", label: "Eredivisie", rows: data.eredivisie },
          { key: "portugal", label: "Liga Portugal", rows: data.portugal },
          { key: "belgium", label: "Pro League", rows: data.belgium },
          { key: "switzerland", label: "Swiss Super League", rows: data.switzerland },
        ]}
      />
    </div>
  );
}

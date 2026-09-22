import { getTeams, LEAGUES } from "@/lib/football";
import TeamsView from "@/components/TeamsView";

async function loadTeams() {
  try {
    const premierLeague = await getTeams(LEAGUES.premierLeague.tournamentId);
    const laliga = await getTeams(LEAGUES.laliga.tournamentId);
    const serieA = await getTeams(LEAGUES.serieA.tournamentId);
    const bundesliga = await getTeams(LEAGUES.bundesliga.tournamentId);
    const eredivisie = await getTeams(LEAGUES.eredivisie.tournamentId);
    const portugal = await getTeams(LEAGUES.portugal.tournamentId);
    const belgium = await getTeams(LEAGUES.belgium.tournamentId);
    const switzerland = await getTeams(LEAGUES.switzerland.tournamentId);
    return { premierLeague, laliga, serieA, bundesliga, eredivisie, portugal, belgium, switzerland };
  } catch {
    return null;
  }
}

export default async function EuropeEquipesPage() {
  const data = await loadTeams();

  if (!data) {
    return (
      <div className="text-center text-zinc-500 py-16">
        Impossible de charger les équipes pour le moment. Vérifiez la clé API.
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Équipes</h1>
      <TeamsView
        groups={[
          { key: "premierLeague", label: "Premier League", teams: data.premierLeague },
          { key: "laliga", label: "LaLiga", teams: data.laliga },
          { key: "serieA", label: "Serie A", teams: data.serieA },
          { key: "bundesliga", label: "Bundesliga", teams: data.bundesliga },
          { key: "eredivisie", label: "Eredivisie", teams: data.eredivisie },
          { key: "portugal", label: "Liga Portugal", teams: data.portugal },
          { key: "belgium", label: "Pro League", teams: data.belgium },
          { key: "switzerland", label: "Swiss Super League", teams: data.switzerland },
        ]}
      />
    </div>
  );
}

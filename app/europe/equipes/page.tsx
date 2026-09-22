import { getTeams, LEAGUES } from "@/lib/football";
import TeamsView from "@/components/TeamsView";

async function loadTeams() {
  try {
    const premierLeague = await getTeams(LEAGUES.premierLeague.tournamentId);
    const laliga = await getTeams(LEAGUES.laliga.tournamentId);
    return { premierLeague, laliga };
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
        ]}
      />
    </div>
  );
}

import { getTeams, LEAGUES } from "@/lib/football";
import TeamsView from "@/components/TeamsView";

async function loadTeams() {
  try {
    const ligue1 = await getTeams(LEAGUES.ligue1.tournamentId);
    const ligue2 = await getTeams(LEAGUES.ligue2.tournamentId);
    return { ligue1, ligue2 };
  } catch {
    return null;
  }
}

export default async function EquipesPage() {
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
      <TeamsView ligue1={data.ligue1} ligue2={data.ligue2} />
    </div>
  );
}

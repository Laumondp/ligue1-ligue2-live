import { getStandings, LEAGUES } from "@/lib/football";
import StandingsView from "@/components/StandingsView";

async function loadStandings() {
  try {
    const ligue1 = await getStandings(LEAGUES.ligue1.tournamentId);
    const ligue2 = await getStandings(LEAGUES.ligue2.tournamentId);
    return { ligue1, ligue2 };
  } catch {
    return null;
  }
}

export default async function ClassementPage() {
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
      <StandingsView ligue1={data.ligue1} ligue2={data.ligue2} />
    </div>
  );
}

import { getStandings, LEAGUES } from "@/lib/football";
import StandingsView from "@/components/StandingsView";

async function loadStandings() {
  try {
    const premierLeague = await getStandings(LEAGUES.premierLeague.tournamentId);
    const laliga = await getStandings(LEAGUES.laliga.tournamentId);
    return { premierLeague, laliga };
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
        ]}
      />
    </div>
  );
}

import StatsView from "@/components/StatsView";

export default function StatistiquesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Statistiques</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Comparatif entre toutes les équipes de Ligue 1, Ligue 2, Premier League,
        LaLiga, Serie A et Bundesliga, actualisé automatiquement.
      </p>
      <StatsView />
    </div>
  );
}

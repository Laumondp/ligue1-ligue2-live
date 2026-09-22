import LiveMatches from "@/components/LiveMatches";

export default function EuropeDirectPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Direct</h1>
      <LiveMatches
        apiPath="/api/live-europe"
        emptyMessage="Aucun match en direct actuellement en Premier League ou LaLiga."
      />
    </div>
  );
}

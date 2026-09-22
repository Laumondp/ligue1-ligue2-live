import { getLeagueComparison, getTopScorersComparison } from "@/lib/football";

export async function GET() {
  try {
    const comparison = await getLeagueComparison();
    const topScorers = await getTopScorersComparison();
    return Response.json({ comparison, topScorers });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}

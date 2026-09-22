import { getLiveFixtures, LEAGUES } from "@/lib/football";

export async function GET() {
  try {
    const fixtures = await getLiveFixtures([LEAGUES.premierLeague, LEAGUES.laliga]);
    return Response.json({ fixtures });
  } catch (error) {
    return Response.json(
      { fixtures: [], error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}

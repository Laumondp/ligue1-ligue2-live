import { getLiveFixtures } from "@/lib/football";

export async function GET() {
  try {
    const fixtures = await getLiveFixtures();
    return Response.json({ fixtures });
  } catch (error) {
    return Response.json(
      { fixtures: [], error: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}

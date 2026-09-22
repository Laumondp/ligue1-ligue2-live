const API_HOST = "sofascore.p.rapidapi.com";
const BASE_URL = `https://${API_HOST}`;

export async function GET() {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return Response.json({ error: "RAPIDAPI_KEY manquante" }, { status: 500 });
  }
  const headers = { "x-rapidapi-key": apiKey, "x-rapidapi-host": API_HOST };

  const url = `${BASE_URL}/tournaments/get-top-players?tournamentId=17&seasonId=96668&type=overall`;
  const res = await fetch(url, { headers });
  const data = await res.json();

  return Response.json({
    status: res.status,
    topPlayersKeys: Object.keys(data.topPlayers ?? {}),
    goalsFirstItem: data.topPlayers?.goals?.[0] ?? null,
    goalsCount: data.topPlayers?.goals?.length ?? 0,
  });
}

const API_HOST = "sofascore.p.rapidapi.com";
const BASE_URL = `https://${API_HOST}`;

const CANDIDATE_PATHS = [
  "/tournaments/get-top-players",
  "/tournaments/get-top-teams",
  "/tournaments/get-topplayers",
  "/tournaments/top-players",
  "/tournaments/get-players-statistics",
];

export async function GET() {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return Response.json({ error: "RAPIDAPI_KEY manquante" }, { status: 500 });
  }
  const headers = { "x-rapidapi-key": apiKey, "x-rapidapi-host": API_HOST };

  const results = [];
  for (const path of CANDIDATE_PATHS) {
    const url = `${BASE_URL}${path}?tournamentId=17&seasonId=96668&type=overall`;
    try {
      const res = await fetch(url, { headers });
      const text = await res.text();
      results.push({ path, status: res.status, bodyPreview: text.slice(0, 300) });
    } catch (error) {
      results.push({ path, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return Response.json({ results });
}

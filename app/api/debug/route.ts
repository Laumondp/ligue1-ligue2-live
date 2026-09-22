export async function GET() {
  const apiKey = process.env.RAPIDAPI_KEY;
  const res = await fetch(
    "https://sofascore.p.rapidapi.com/tournaments/get-standings?tournamentId=34&seasonId=96127&type=total",
    {
      headers: {
        "x-rapidapi-key": apiKey ?? "",
        "x-rapidapi-host": "sofascore.p.rapidapi.com",
      },
      cache: "no-store",
    }
  );
  const text = await res.text();
  return Response.json({
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    bodyStart: text.slice(0, 500),
  });
}

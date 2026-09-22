const HOST = "sofascore.p.rapidapi.com";

async function call(path: string, apiKey: string) {
  const res = await fetch(`https://${HOST}${path}`, {
    headers: { "x-rapidapi-key": apiKey, "x-rapidapi-host": HOST },
    cache: "no-store",
  });
  const text = await res.text();
  return { status: res.status, bodyStart: text.slice(0, 1500) };
}

export async function GET() {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return Response.json({ error: "no key" });

  const tournamentId = 10783; // Ligue des Nations UEFA
  const seasons = await call(`/tournaments/get-seasons?tournamentId=${tournamentId}`, apiKey);

  let seasonId: number | null = null;
  try {
    seasonId = JSON.parse(seasons.bodyStart).seasons?.[0]?.id ?? null;
  } catch {}

  const standings = seasonId
    ? await call(
        `/tournaments/get-standings?tournamentId=${tournamentId}&seasonId=${seasonId}&type=total`,
        apiKey
      )
    : null;

  const events = seasonId
    ? await call(
        `/tournaments/get-events?tournamentId=${tournamentId}&seasonId=${seasonId}&round=1`,
        apiKey
      )
    : null;

  return Response.json({ seasons, seasonId, standings, events });
}

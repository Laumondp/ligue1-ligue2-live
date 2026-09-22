const API_HOST = "sofascore.p.rapidapi.com";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    return new Response("RAPIDAPI_KEY manquante", { status: 500 });
  }

  const url = `https://${API_HOST}/teams/get-logo?teamId=${encodeURIComponent(teamId)}`;
  const requestHeaders = {
    "x-rapidapi-key": apiKey,
    "x-rapidapi-host": API_HOST,
  };

  let res: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(url, {
      headers: requestHeaders,
      next: { revalidate: 60 * 60 * 24 * 30 }, // 30 jours, un logo ne change pas
    });
    if (res.status !== 429) break;
    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
  }

  if (!res || !res.ok) {
    return new Response("Logo introuvable", { status: 404 });
  }

  const buffer = await res.arrayBuffer();
  return new Response(buffer, {
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "image/webp",
      "Cache-Control": "public, max-age=2592000, immutable",
    },
  });
}

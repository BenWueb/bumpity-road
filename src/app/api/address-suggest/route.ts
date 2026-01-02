import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type GooglePlacesAutocompleteResponse = {
  status: string;
  predictions?: Array<{
    description: string;
    place_id: string;
  }>;
  error_message?: string;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    const sessionToken = (searchParams.get("sessionToken") ?? "").trim();

    if (q.length < 3) return NextResponse.json({ suggestions: [] });
    if (q.length > 200)
      return NextResponse.json({ error: "Query too long" }, { status: 400 });

    // Support "one key for everything" setups:
    // - `GOOGLE_MAPS_API_KEY` (server-only) preferred when available
    // - fallback to `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` if user only configured one key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return NextResponse.json({ suggestions: [] });

    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/autocomplete/json"
    );
    url.searchParams.set("input", q);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("language", "en");
    url.searchParams.set("types", "address");
    url.searchParams.set("components", "country:us|country:ca");
    url.searchParams.set("limit", "6");
    if (sessionToken) url.searchParams.set("sessiontoken", sessionToken);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(url.toString(), {
      headers: {
        // If the API key is restricted by HTTP referrer, include a referrer derived from the incoming request.
        // (This is common when using a single key across client + server.)
        Referer: req.headers.get("origin") ?? "http://localhost:3000",
      },
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        {
          error: "Failed to fetch suggestions",
          ...(process.env.NODE_ENV !== "production"
            ? { upstreamStatus: res.status, upstreamBody: text.slice(0, 500) }
            : {}),
        },
        { status: 502 }
      );
    }

    const data = (await res.json()) as GooglePlacesAutocompleteResponse;

    // Google returns 200 OK even on errors; check "status".
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return NextResponse.json(
        {
          error: "Failed to fetch suggestions",
          ...(process.env.NODE_ENV !== "production"
            ? { upstreamStatus: data.status, upstreamBody: data.error_message }
            : {}),
        },
        { status: 502 }
      );
    }

    const suggestions = (data.predictions ?? [])
      .filter((p) => p?.description && p?.place_id)
      .slice(0, 6)
      .map((p) => ({ description: p.description, placeId: p.place_id }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error fetching address suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}

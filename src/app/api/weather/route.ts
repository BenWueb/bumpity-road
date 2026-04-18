import { NextResponse } from "next/server";

const LAT = 46.987414;
const LON = -94.2226322;

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Weather API not configured" },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=imperial&appid=${apiKey}`,
      { next: { revalidate: 600 } }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Weather API error" },
        { status: 502 }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      weatherMain: data.weather?.[0]?.main ?? null,
      windSpeed: data.wind?.speed ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 }
    );
  }
}

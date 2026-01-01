import {
  Droplets,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Thermometer,
  ThermometerSun,
  Wind,
} from "lucide-react";
import {

} from "lucide-react";

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
  };
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
    deg: number;
  };
  visibility?: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
  name: string;
  cod: number;
  message?: string;
}

interface LocationData {
  name: string;
  lat: number;
  lon: number;
}

function formatTemp(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return Math.round(value).toString();
}

function formatPercent(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return Math.round(value).toString();
}

function formatNumber(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return Math.round(value).toString();
}

function formatMilesFromMeters(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  const miles = value / 1609.34;
  if (!Number.isFinite(miles)) return "--";
  if (miles >= 10) return "10+";
  return miles.toFixed(1);
}

function formatTimeFromUnixSeconds(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  const d = new Date(value * 1000);
  if (Number.isNaN(d.getTime())) return "--";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

function formatWindDir(deg?: number) {
  if (typeof deg !== "number" || Number.isNaN(deg)) return "";
  const dirs = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const idx = Math.round((((deg % 360) + 360) % 360) / 22.5) % 16;
  return dirs[idx];
}

export function WeatherCardSkeleton() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50 via-background to-indigo-50 dark:from-sky-950/30 dark:via-background dark:to-indigo-950/20" />
      <div className="relative px-6 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="h-5 w-40 animate-pulse rounded-md bg-accent" />
            <div className="mt-2 h-4 w-28 animate-pulse rounded-md bg-accent" />
          </div>
          <div className="h-12 w-12 animate-pulse rounded-xl bg-accent" />
        </div>
      </div>
      <div className="relative px-6 pb-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="h-10 w-24 animate-pulse rounded-md bg-accent" />
            <div className="mt-2 h-4 w-20 animate-pulse rounded-md bg-accent" />
          </div>
          <div className="grid gap-2 text-right">
            <div className="h-4 w-28 animate-pulse rounded-md bg-accent" />
            <div className="h-4 w-24 animate-pulse rounded-md bg-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function WeatherCard() {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full  rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="px-6 pt-6">
          <div className="text-base font-semibold leading-none">Weather</div>
        </div>
        <div className="px-6 pb-6 text-sm text-muted-foreground">
          Missing <code className="font-mono">OPENWEATHER_API_KEY</code>.
        </div>
      </div>
    );
  }

  try {
    const [weatherRes, locationRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=46.987414&lon=-94.2226322&units=imperial&appid=${apiKey}`,
        { next: { revalidate: 600 } }
      ),
      fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=46.987414&lon=-94.2226322&appid=${apiKey}`,
        { next: { revalidate: 600 } }
      ),
    ]);

    if (!weatherRes.ok) {
      throw new Error(`Weather API error: ${weatherRes.status}`);
    }
    if (!locationRes.ok) {
      throw new Error(`Location API error: ${locationRes.status}`);
    }

    const weatherData: WeatherData = await weatherRes.json();
    const locationData: LocationData[] = await locationRes.json();

    const placeName = locationData[0]?.name ?? weatherData.name ?? "Unknown";
    const description = weatherData.weather?.[0]?.description ?? "";
    const icon = weatherData.weather?.[0]?.icon;
    const iconUrl = icon
      ? `https://openweathermap.org/img/wn/${icon}@2x.png`
      : null;

    return (
      <div className="relative w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50 via-background to-indigo-50 dark:from-sky-950/30 dark:via-background dark:to-indigo-950/20" />

        <div className="relative px-6 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="truncate text-base font-semibold leading-none">
                {placeName}
              </div>
              <div className="mt-1 text-sm text-muted-foreground capitalize">
                {description || "—"}
              </div>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-background/60 shadow-sm backdrop-blur">
              {iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={iconUrl}
                  alt={description || "Weather icon"}
                  width={48}
                  height={48}
                  className="h-10 w-10"
                />
              ) : (
                <ThermometerSun className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        <div className="relative px-6 pb-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-semibold tracking-tight">
                  {formatTemp(weatherData.main.temp)}°
                </div>
                <div className="text-sm text-muted-foreground">F</div>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Thermometer className="h-4 w-4" />
                <span>
                  Feels like {formatTemp(weatherData.main.feels_like)}°F
                </span>
              </div>
            </div>

            <div className="grid gap-2 text-right text-sm text-muted-foreground">
              <div className="flex items-center justify-end gap-2">
                <Droplets className="h-4 w-4" />
                <span>
                  Humidity {formatPercent(weatherData.main.humidity)}%
                </span>
              </div>
              <div className="text-xs">
                {weatherData.coord.lat.toFixed(3)},{" "}
                {weatherData.coord.lon.toFixed(3)}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 rounded-lg border bg-background/60 px-3 py-2 shadow-sm backdrop-blur">
              <Thermometer className="h-4 w-4" />
              <div className="min-w-0">
                <div className="text-xs">Low / High</div>
                <div className="truncate text-sm text-foreground">
                  {formatTemp(weatherData.main.temp_min)}° /{" "}
                  {formatTemp(weatherData.main.temp_max)}°F
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border bg-background/60 px-3 py-2 shadow-sm backdrop-blur">
              <Wind className="h-4 w-4" />
              <div className="min-w-0">
                <div className="text-xs">Wind</div>
                <div className="truncate text-sm text-foreground">
                  {formatNumber(weatherData.wind?.speed)} mph{" "}
                  <span className="text-muted-foreground">
                    {formatWindDir(weatherData.wind?.deg)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border bg-background/60 px-3 py-2 shadow-sm backdrop-blur">
              <Gauge className="h-4 w-4" />
              <div className="min-w-0">
                <div className="text-xs">Pressure</div>
                <div className="truncate text-sm text-foreground">
                  {weatherData.main?.pressure ?? "--"} hPa
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border bg-background/60 px-3 py-2 shadow-sm backdrop-blur">
              <Eye className="h-4 w-4" />
              <div className="min-w-0">
                <div className="text-xs">Visibility</div>
                <div className="truncate text-sm text-foreground">
                  {formatMilesFromMeters(weatherData.visibility)} mi
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border bg-background/60 px-3 py-2 shadow-sm backdrop-blur">
              <Sunrise className="h-4 w-4" />
              <div className="min-w-0">
                <div className="text-xs">Sunrise</div>
                <div className="truncate text-sm text-foreground">
                  {formatTimeFromUnixSeconds(weatherData.sys?.sunrise)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border bg-background/60 px-3 py-2 shadow-sm backdrop-blur">
              <Sunset className="h-4 w-4" />
              <div className="min-w-0">
                <div className="text-xs">Sunset</div>
                <div className="truncate text-sm text-foreground">
                  {formatTimeFromUnixSeconds(weatherData.sys?.sunset)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div className="w-full  rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="px-6 pt-6">
          <div className="text-base font-semibold leading-none">Weather</div>
        </div>
        <div className="px-6 pb-6 text-sm text-muted-foreground">
          Failed to load weather. Please try again later.
        </div>
      </div>
    );
  }
}

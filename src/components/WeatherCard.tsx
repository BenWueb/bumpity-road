import Image from "next/image";
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
import { CARD_GRADIENTS } from "@/lib/ui-gradients";

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

interface ForecastEntry {
  dt: number;
  main: { temp: number; temp_min: number; temp_max: number };
  weather: { description: string; icon: string }[];
  dt_txt: string;
}

interface ForecastResponse {
  list: ForecastEntry[];
  city: { timezone: number };
}

interface DailySummary {
  key: string;
  label: string;
  high: number;
  low: number;
  icon: string;
  description: string;
}

function aggregateDailyForecast(forecast: ForecastResponse): DailySummary[] {
  const tzOffsetSec = forecast.city?.timezone ?? 0;
  const tzOffsetMs = tzOffsetSec * 1000;

  const localDateKey = (unixSec: number) => {
    const local = new Date(unixSec * 1000 + tzOffsetMs);
    const y = local.getUTCFullYear();
    const m = String(local.getUTCMonth() + 1).padStart(2, "0");
    const d = String(local.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const groups = new Map<string, ForecastEntry[]>();
  for (const entry of forecast.list ?? []) {
    const key = localDateKey(entry.dt);
    const arr = groups.get(key);
    if (arr) arr.push(entry);
    else groups.set(key, [entry]);
  }

  const todayKey = localDateKey(Math.floor(Date.now() / 1000));
  const sortedKeys = Array.from(groups.keys()).sort();
  const futureKeys = sortedKeys.filter((k) => k > todayKey).slice(0, 5);

  return futureKeys.map((key) => {
    const entries = groups.get(key)!;
    let high = -Infinity;
    let low = Infinity;
    for (const e of entries) {
      const max = e.main?.temp_max ?? e.main?.temp;
      const min = e.main?.temp_min ?? e.main?.temp;
      if (typeof max === "number" && max > high) high = max;
      if (typeof min === "number" && min < low) low = min;
    }

    let representative = entries[Math.floor(entries.length / 2)];
    let bestDistance = Infinity;
    for (const e of entries) {
      const local = new Date(e.dt * 1000 + tzOffsetMs);
      const hour = local.getUTCHours();
      const distance = Math.abs(hour - 12);
      if (distance < bestDistance) {
        bestDistance = distance;
        representative = e;
      }
    }

    const icon = representative.weather?.[0]?.icon ?? "";
    const description = representative.weather?.[0]?.description ?? "";

    const [yStr, mStr, dStr] = key.split("-");
    const labelDate = new Date(
      Date.UTC(Number(yStr), Number(mStr) - 1, Number(dStr))
    );
    const todayParts = todayKey.split("-");
    const todayDate = new Date(
      Date.UTC(
        Number(todayParts[0]),
        Number(todayParts[1]) - 1,
        Number(todayParts[2])
      )
    );
    const dayDiff = Math.round(
      (labelDate.getTime() - todayDate.getTime()) / 86_400_000
    );
    const label =
      dayDiff === 1
        ? "Tomorrow"
        : new Intl.DateTimeFormat(undefined, {
            weekday: "short",
            timeZone: "UTC",
          }).format(labelDate);

    return {
      key,
      label,
      high,
      low,
      icon,
      description,
    };
  });
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
      <div className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.sky}`} />
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
          <div className="text-sm font-semibold leading-none md:text-lg">
            Weather
          </div>
        </div>
        <div className="px-6 pb-6 text-sm text-muted-foreground">
          Missing <code className="font-mono">OPENWEATHER_API_KEY</code>.
        </div>
      </div>
    );
  }

  try {
    const [weatherRes, locationRes, forecastRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=46.987414&lon=-94.2226322&units=imperial&appid=${apiKey}`,
        { next: { revalidate: 600 } }
      ),
      fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=46.987414&lon=-94.2226322&appid=${apiKey}`,
        { next: { revalidate: 600 } }
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=46.987414&lon=-94.2226322&units=imperial&appid=${apiKey}`,
        { next: { revalidate: 600 } }
      ).catch(() => null),
    ]);

    if (!weatherRes.ok) {
      throw new Error(`Weather API error: ${weatherRes.status}`);
    }
    if (!locationRes.ok) {
      throw new Error(`Location API error: ${locationRes.status}`);
    }

    const weatherData: WeatherData = await weatherRes.json();
    const locationData: LocationData[] = await locationRes.json();

    let dailyForecast: DailySummary[] = [];
    if (forecastRes && forecastRes.ok) {
      try {
        const forecastData: ForecastResponse = await forecastRes.json();
        dailyForecast = aggregateDailyForecast(forecastData);
      } catch {
        dailyForecast = [];
      }
    }

    const placeName = locationData[0]?.name ?? weatherData.name ?? "Unknown";
    const description = weatherData.weather?.[0]?.description ?? "";
    const icon = weatherData.weather?.[0]?.icon;
    const iconUrl = icon
      ? `https://openweathermap.org/img/wn/${icon}@2x.png`
      : null;

    return (
      <div className="relative w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.sky}`} />

        <div className="relative px-4 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold leading-none sm:text-base md:text-lg">
                {placeName}
              </div>
              <div className="mt-1 text-xs text-muted-foreground capitalize sm:text-sm">
                {description || "—"}
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-background/60 shadow-sm backdrop-blur sm:h-12 sm:w-12">
              {iconUrl ? (
                <Image
                  src={iconUrl}
                  alt={description || "Weather icon"}
                  width={48}
                  height={48}
                  unoptimized
                  className="h-8 w-8 sm:h-10 sm:w-10"
                />
              ) : (
                <ThermometerSun className="h-5 w-5 text-muted-foreground sm:h-6 sm:w-6" />
              )}
            </div>
          </div>
        </div>

        <div className="relative px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {formatTemp(weatherData.main.temp)}°
                </div>
                <div className="text-sm text-muted-foreground">F</div>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                <Thermometer className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>
                  Feels like {formatTemp(weatherData.main.feels_like)}°F
                </span>
              </div>
            </div>

            <div className="hidden gap-2 text-right text-sm text-muted-foreground sm:grid">
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
            
            {/* Mobile: compact stats */}
            <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground sm:hidden">
              <div className="flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                <span>{formatPercent(weatherData.main.humidity)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Wind className="h-3 w-3" />
                <span>{formatNumber(weatherData.wind?.speed)} mph</span>
              </div>
            </div>
          </div>

          {/* Detailed stats grid - hidden on mobile */}
          <div className="mt-4 hidden grid-cols-2 gap-2 text-sm text-muted-foreground sm:grid">
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

          {dailyForecast.length > 0 && (
            <div className="mt-3">
              <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                5-day forecast
              </div>
              <div className="grid grid-cols-5 gap-1">
                {dailyForecast.map((day) => {
                  const dayIconUrl = day.icon
                    ? `https://openweathermap.org/img/wn/${day.icon}.png`
                    : null;
                  return (
                    <div
                      key={day.key}
                      className="flex flex-col items-center gap-0.5 rounded-md border bg-background/60 px-1 py-1 text-center shadow-sm backdrop-blur"
                    >
                      <div className="text-[10px] font-medium leading-tight text-foreground">
                        {day.label}
                      </div>
                      {dayIconUrl ? (
                        <Image
                          src={dayIconUrl}
                          alt={day.description || "Forecast icon"}
                          width={32}
                          height={32}
                          unoptimized
                          className="h-7 w-7"
                        />
                      ) : (
                        <ThermometerSun className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div className="text-[10px] leading-tight text-foreground">
                        <span className="font-medium">
                          {formatTemp(day.high)}°
                        </span>
                        <span className="text-muted-foreground">
                          {" / "}
                          {formatTemp(day.low)}°
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div className="w-full  rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="px-6 pt-6">
          <div className="text-sm font-semibold leading-none md:text-lg">
            Weather
          </div>
        </div>
        <div className="px-6 pb-6 text-sm text-muted-foreground">
          Failed to load weather. Please try again later.
        </div>
      </div>
    );
  }
}

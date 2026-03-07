import {
  NESTING_ACTIVITIES,
  WEATHER_CONDITIONS,
  WIND_CONDITIONS,
  DISTURBANCES,
  LOON_BEHAVIORS,
} from "@/types/loon";

export function getNestingLabel(value: string | null): string {
  if (!value) return "";
  return NESTING_ACTIVITIES.find((n) => n.value === value)?.label ?? value;
}

export function getWeatherLabel(value: string | null): string {
  if (!value) return "";
  return WEATHER_CONDITIONS.find((w) => w.value === value)?.label ?? value;
}

export function getWindLabel(value: string | null): string {
  if (!value) return "";
  return WIND_CONDITIONS.find((w) => w.value === value)?.label ?? value;
}

export function getDisturbanceLabel(value: string | null): string {
  if (!value) return "";
  return DISTURBANCES.find((d) => d.value === value)?.label ?? value;
}

export function getBehaviorLabel(value: string): string {
  return LOON_BEHAVIORS.find((b) => b.value === value)?.label ?? value;
}

export function formatLoonDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getTotalLoons(
  obs: Pick<
    import("@/types/loon").LoonObservation,
    "adultsCount" | "chicksCount" | "juvenilesCount"
  >
): number {
  return obs.adultsCount + obs.chicksCount + obs.juvenilesCount;
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

export function deriveSavedLocations(
  observations: Pick<
    import("@/types/loon").LoonObservation,
    "lakeName" | "lakeArea" | "latitude" | "longitude"
  >[]
): import("@/types/loon").SavedLocation[] {
  const map = new Map<string, import("@/types/loon").SavedLocation>();
  for (const o of observations) {
    if (o.latitude == null || o.longitude == null) continue;
    const key = `${o.lakeName}|${o.lakeArea ?? ""}|${o.latitude.toFixed(5)}|${o.longitude.toFixed(5)}`;
    const existing = map.get(key);
    if (existing) existing.count++;
    else
      map.set(key, {
        lakeName: o.lakeName,
        lakeArea: o.lakeArea,
        latitude: o.latitude,
        longitude: o.longitude,
        count: 1,
      });
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export function getNestingGradient(nesting: string | null): string {
  switch (nesting) {
    case "incubating":
    case "nest_building":
      return "from-amber-500/10 to-orange-500/5";
    case "hatched":
    case "chicks_riding":
      return "from-emerald-500/10 to-green-500/5";
    case "failed":
      return "from-rose-500/10 to-red-500/5";
    default:
      return "from-sky-500/10 to-blue-500/5";
  }
}

export function getWeatherIcon(weather: string | null): string {
  switch (weather) {
    case "clear":
      return "☀️";
    case "partly_cloudy":
      return "⛅";
    case "overcast":
      return "☁️";
    case "light_rain":
    case "rain":
      return "🌧️";
    case "fog":
      return "🌫️";
    case "snow":
      return "❄️";
    default:
      return "";
  }
}

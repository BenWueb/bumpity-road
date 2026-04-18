import {
  FISH_SPECIES,
  FISH_BEHAVIORS,
  BAIT_TYPES,
  WEATHER_CONDITIONS,
  WIND_CONDITIONS,
  DISTURBANCES,
} from "@/types/fishing";

export function getSpeciesLabel(value: string): string {
  return FISH_SPECIES.find((s) => s.value === value)?.label ?? value;
}

export function getFishBehaviorLabel(value: string): string {
  return FISH_BEHAVIORS.find((b) => b.value === value)?.label ?? value;
}

export function getBaitLabel(value: string): string {
  return BAIT_TYPES.find((b) => b.value === value)?.label ?? value;
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

export function formatFishDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

export function deriveSavedLocations(
  observations: Pick<
    import("@/types/fishing").FishObservation,
    "lakeName" | "lakeArea" | "latitude" | "longitude"
  >[]
): import("@/types/fishing").SavedLocation[] {
  const map = new Map<string, import("@/types/fishing").SavedLocation>();
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

export function getSpeciesGradient(species: string[]): string {
  if (!species || species.length === 0) {
    return "from-cyan-500/10 to-teal-500/5";
  }
  const first = species[0];
  switch (first) {
    case "walleye":
      return "from-amber-500/10 to-yellow-500/5";
    case "northern_pike":
    case "muskie":
      return "from-emerald-500/10 to-green-500/5";
    case "smallmouth_bass":
    case "largemouth_bass":
      return "from-lime-500/10 to-green-500/5";
    case "lake_trout":
    case "whitefish":
      return "from-sky-500/10 to-blue-500/5";
    case "perch":
    case "bluegill":
    case "crappie":
    case "rock_bass":
      return "from-orange-500/10 to-amber-500/5";
    default:
      return "from-cyan-500/10 to-teal-500/5";
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

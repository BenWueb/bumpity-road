import type { LucideIcon } from "lucide-react";
import {
  Bird,
  Fish,
  Flower2,
  Leaf,
  MoreHorizontal,
  Mountain,
  Ship,
  ShoppingBag,
  Snowflake,
  Sparkles,
  Sun,
  Tent,
  Waves,
} from "lucide-react";

export type AdventureSeason = {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
};

export type AdventureCategory = {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
};

export const ADVENTURE_SEASONS: AdventureSeason[] = [
  {
    value: "all",
    label: "All Seasons",
    icon: Sparkles,
    color: "text-violet-500",
  },
  { value: "spring", label: "Spring", icon: Flower2, color: "text-pink-500" },
  { value: "summer", label: "Summer", icon: Sun, color: "text-amber-500" },
  { value: "fall", label: "Fall", icon: Leaf, color: "text-orange-500" },
  { value: "winter", label: "Winter", icon: Snowflake, color: "text-sky-500" },
];

export const ADVENTURE_CATEGORIES: AdventureCategory[] = [
  { value: "fishing", label: "Fishing", icon: Fish, color: "text-blue-500" },
  { value: "hiking", label: "Hiking", icon: Mountain, color: "text-green-600" },
  { value: "shopping", label: "Shopping", icon: ShoppingBag, color: "text-pink-500" },
  { value: "wildlife", label: "Wildlife", icon: Bird, color: "text-amber-600" },
  { value: "boating", label: "Boating", icon: Ship, color: "text-cyan-500" },
  { value: "camping", label: "Camping", icon: Tent, color: "text-orange-500" },
  { value: "swimming", label: "Swimming", icon: Waves, color: "text-sky-500" },
  { value: "other", label: "Other", icon: MoreHorizontal, color: "text-gray-500" },
];

export function getSeasonInfo(season: string) {
  return ADVENTURE_SEASONS.find((s) => s.value === season) || ADVENTURE_SEASONS[1];
}

export function getCategoryInfo(category: string) {
  return (
    ADVENTURE_CATEGORIES.find((c) => c.value === category) || ADVENTURE_CATEGORIES[7]
  );
}

export function getAdventureSeasons(a: {
  seasons?: string[] | null;
  season?: string | null;
}): string[] {
  const seasons = Array.isArray(a.seasons) && a.seasons.length > 0 ? a.seasons : [];
  if (seasons.length > 0) return seasons;
  if (typeof a.season === "string" && a.season) return [a.season];
  return ["all"];
}



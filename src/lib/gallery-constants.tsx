import { Leaf, Snowflake, Sun, TreeDeciduous } from "lucide-react";

export const SEASONS = [
  { value: "spring", label: "Spring", icon: Leaf, color: "text-green-500" },
  { value: "summer", label: "Summer", icon: Sun, color: "text-yellow-500" },
  {
    value: "fall",
    label: "Fall",
    icon: TreeDeciduous,
    color: "text-orange-500",
  },
  { value: "winter", label: "Winter", icon: Snowflake, color: "text-blue-400" },
] as const;

export const ACTIVITIES = [
  { value: "fishing", label: "Fishing" },
  { value: "hiking", label: "Hiking" },
  { value: "bird_watching", label: "Bird Watching" },
  { value: "camping", label: "Camping" },
  { value: "food & drink", label: "Food & Drinks" },
  { value: "boating", label: "Boating" },
  { value: "wildlife", label: "Wildlife" },
  { value: "scenic", label: "Scenic" },
  { value: "other", label: "Other" },
] as const;

export function getSeasonIcon(season: string | null) {
  const s = SEASONS.find((x) => x.value === season);
  if (!s) return null;
  const Icon = s.icon;
  return <Icon className={`h-4 w-4 ${s.color}`} />;
}

export function getActivityLabel(activity: string | null) {
  return ACTIVITIES.find((a) => a.value === activity)?.label ?? activity;
}



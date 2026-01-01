export const COLOR_OPTIONS = [
  {
    value: "amber",
    label: "Amber",
    bg: "bg-amber-400",
    gradient:
      "from-amber-50 via-background to-orange-50 dark:from-amber-950/20 dark:via-background dark:to-orange-950/10",
  },
  {
    value: "rose",
    label: "Rose",
    bg: "bg-rose-400",
    gradient:
      "from-rose-50 via-background to-pink-50 dark:from-rose-950/20 dark:via-background dark:to-pink-950/10",
  },
  {
    value: "sky",
    label: "Sky",
    bg: "bg-sky-400",
    gradient:
      "from-sky-50 via-background to-blue-50 dark:from-sky-950/20 dark:via-background dark:to-blue-950/10",
  },
  {
    value: "violet",
    label: "Violet",
    bg: "bg-violet-400",
    gradient:
      "from-violet-50 via-background to-purple-50 dark:from-violet-950/20 dark:via-background dark:to-purple-950/10",
  },
  {
    value: "emerald",
    label: "Emerald",
    bg: "bg-emerald-400",
    gradient:
      "from-emerald-50 via-background to-teal-50 dark:from-emerald-950/20 dark:via-background dark:to-teal-950/10",
  },
  {
    value: "slate",
    label: "Slate",
    bg: "bg-slate-400",
    gradient:
      "from-slate-50 via-background to-gray-50 dark:from-slate-950/20 dark:via-background dark:to-gray-950/10",
  },
] as const;

export type ColorOption = (typeof COLOR_OPTIONS)[number];
export type ColorValue = ColorOption["value"];

export const DEFAULT_COLOR: ColorValue = "amber";

export function getGradientForColor(color: string | null): string {
  const option = COLOR_OPTIONS.find((c) => c.value === color);
  return option?.gradient ?? COLOR_OPTIONS[0].gradient;
}


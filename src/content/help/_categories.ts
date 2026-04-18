import { Lightbulb, Rocket, Sparkles } from "lucide-react";
import type { ComponentType } from "react";

export type HelpCategory = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  order: number;
};

export const HELP_CATEGORIES: HelpCategory[] = [
  { id: "getting-started", label: "Getting Started", icon: Rocket, order: 1 },
  { id: "features", label: "Features", icon: Sparkles, order: 2 },
  { id: "concepts", label: "Concepts", icon: Lightbulb, order: 3 },
];

export function getCategoryMeta(id: string) {
  return HELP_CATEGORIES.find((c) => c.id === id);
}

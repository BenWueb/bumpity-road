import {
  Refrigerator,
  SprayCan,
  TreePine,
  Wrench,
} from "lucide-react";
import type { ComponentType } from "react";

export type SopCategory = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  order: number;
};

export const SOP_CATEGORIES: SopCategory[] = [
  { id: "appliances", label: "Appliances", icon: Refrigerator, order: 1 },
  { id: "cleaning", label: "Cleaning", icon: SprayCan, order: 2 },
  { id: "seasonal", label: "Seasonal", icon: TreePine, order: 3 },
  { id: "systems", label: "Systems & Maintenance", icon: Wrench, order: 4 },
];

export function getCategoryMeta(id: string) {
  return SOP_CATEGORIES.find((c) => c.id === id);
}

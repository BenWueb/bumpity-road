import { BookOpen, DoorOpen, Refrigerator, Snowflake, Wrench } from "lucide-react";
import type { ComponentType } from "react";

export type SopCategory = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  order: number;
};

export const SOP_CATEGORIES: SopCategory[] = [
  { id: "reference", label: "Reference & Contacts", icon: BookOpen, order: 1 },
  { id: "visits", label: "Arrival & Departure", icon: DoorOpen, order: 2 },
  { id: "systems", label: "Systems & Heating", icon: Wrench, order: 3 },
  { id: "appliances", label: "Appliances", icon: Refrigerator, order: 4 },
  { id: "seasonal", label: "Seasonal & Winter", icon: Snowflake, order: 5 },
];

export function getCategoryMeta(id: string) {
  return SOP_CATEGORIES.find((c) => c.id === id);
}

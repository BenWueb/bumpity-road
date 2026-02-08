import {
  Wrench,
  TreePine,
  MoreHorizontal,
  Zap,
  Receipt,
  Package,
  Shield,
  TrendingUp,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { EXPENSE_CATEGORIES } from "@/types/expense";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";

/**
 * Get the display label for an expense category
 */
export function getCategoryLabel(category: string): string {
  const categoryMap: Record<string, string> = {
    maintenance: "Maintenance & Repairs",
    utilities: "Utilities & Services",
    landscaping: "Landscaping & Outdoor",
    supplies: "Supplies & Materials",
    tax_fees: "Tax & Fees",
    insurance: "Insurance",
    improvements: "Improvements & Upgrades",
    emergency: "Emergency & Unexpected",
    other: "Other",
  };
  return categoryMap[category] || category;
}

/**
 * Get the display label for an expense subcategory
 */
export function getSubcategoryLabel(subcategory: string | null): string | null {
  if (!subcategory) return null;
  return subcategory
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Get the icon component for an expense category
 */
export function getCategoryIcon(category: string): LucideIcon {
  const iconMap: Record<string, LucideIcon> = {
    maintenance: Wrench,
    utilities: Zap,
    landscaping: TreePine,
    supplies: Package,
    tax_fees: Receipt,
    insurance: Shield,
    improvements: TrendingUp,
    emergency: AlertTriangle,
    other: MoreHorizontal,
  };
  return iconMap[category] || MoreHorizontal;
}

/**
 * Get the gradient class for an expense category (for card backgrounds)
 */
export function getCategoryGradient(category: string): string {
  const gradientMap: Record<string, string> = {
    maintenance: CARD_GRADIENTS.slate,
    utilities: CARD_GRADIENTS.emerald,
    landscaping: CARD_GRADIENTS.rose,
    supplies: CARD_GRADIENTS.violet,
    tax_fees: CARD_GRADIENTS.amber,
    insurance: CARD_GRADIENTS.sky,
    improvements: CARD_GRADIENTS.violet,
    emergency: CARD_GRADIENTS.rose,
    other: CARD_GRADIENTS.slate,
  };
  return gradientMap[category] || CARD_GRADIENTS.slate;
}

/**
 * Get the color gradient for an expense category (for bar charts)
 */
export function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    maintenance: "from-slate-500 to-slate-600",
    utilities: "from-emerald-500 to-emerald-600",
    landscaping: "from-rose-500 to-rose-600",
    supplies: "from-violet-500 to-violet-600",
    tax_fees: "from-amber-500 to-amber-600",
    insurance: "from-sky-500 to-sky-600",
    improvements: "from-violet-500 to-violet-600",
    emergency: "from-rose-500 to-rose-600",
    other: "from-slate-500 to-slate-600",
  };
  return colorMap[category] || "from-slate-500 to-slate-600";
}

/**
 * Format a date string to a readable format
 */
export function formatExpenseDate(dateString: string | null): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date string to a short format (month and day only)
 */
export function formatExpenseDateShort(dateString: string | null): string {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Get category label from EXPENSE_CATEGORIES
 */
export function getCategoryLabelFromList(category: string): string {
  return EXPENSE_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

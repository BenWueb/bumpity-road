import {
  Wrench,
  TreePine,
  Waves,
  MoreHorizontal,
  Zap,
  Receipt,
  Package,
  Shield,
  TrendingUp,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { EXPENSE_CATEGORIES, EXPENSE_SUBCATEGORIES, type ExpenseCategory } from "@/types/expense";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";

/**
 * Get the display label for an expense category
 */
export function getCategoryLabel(category: string): string {
  const categoryMap: Record<string, string> = {
    maintenance: "Maintenance & Repairs",
    utilities: "Utilities & Services",
    landscaping: "Landscaping & Outdoor",
    marine: "Marine & Waterfront",
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
  // Search through all category subcategory mappings for the label
  for (const categoryKey in EXPENSE_SUBCATEGORIES) {
    const subs = EXPENSE_SUBCATEGORIES[categoryKey as ExpenseCategory];
    const found = subs.find((s) => s.value === subcategory);
    if (found) return found.label;
  }
  // Fallback: title-case the value
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
    marine: Waves,
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
    marine: CARD_GRADIENTS.sky,
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
    marine: "from-cyan-500 to-sky-600",
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
 * Get a solid hex color for an expense category (for SVG charts)
 */
export function getCategoryHexColor(category: string): string {
  const colorMap: Record<string, string> = {
    maintenance: "#64748b",   // slate-500
    utilities: "#10b981",     // emerald-500
    landscaping: "#f43f5e",   // rose-500
    marine: "#06b6d4",        // cyan-500
    supplies: "#8b5cf6",      // violet-500
    tax_fees: "#f59e0b",      // amber-500
    insurance: "#0ea5e9",     // sky-500
    improvements: "#a78bfa",  // violet-400
    emergency: "#fb7185",     // rose-400
    other: "#94a3b8",         // slate-400
  };
  return colorMap[category] || "#94a3b8";
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

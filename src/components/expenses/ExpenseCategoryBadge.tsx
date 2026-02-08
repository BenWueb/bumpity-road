import { getCategoryIcon, getCategoryLabel, getSubcategoryLabel } from "@/lib/expense-utils";

interface ExpenseCategoryBadgeProps {
  category: string;
  subcategory?: string | null;
  showIcon?: boolean;
  variant?: "default" | "compact";
  className?: string;
}

export function ExpenseCategoryBadge({
  category,
  subcategory,
  showIcon = true,
  variant = "default",
  className = "",
}: ExpenseCategoryBadgeProps) {
  const CategoryIcon = getCategoryIcon(category);
  const categoryLabel = getCategoryLabel(category);
  const subcategoryLabel = getSubcategoryLabel(subcategory || null);

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
        {showIcon && (
          <CategoryIcon className="h-3 w-3 text-muted-foreground" />
        )}
        <span className="text-[11px] text-muted-foreground">
          {categoryLabel}
        </span>
        {subcategoryLabel && (
          <span className="text-[11px] text-muted-foreground/70">
            • {subcategoryLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      <span className="flex w-fit items-center gap-1 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground whitespace-nowrap">
        {showIcon && <CategoryIcon className="h-2.5 w-2.5 shrink-0" />}
        <span className="truncate">{categoryLabel}</span>
      </span>
      {subcategoryLabel && (
        <span className="flex w-fit items-center rounded-full bg-secondary/70 px-1.5 py-0.5 text-[10px] text-secondary-foreground whitespace-nowrap">
          {subcategoryLabel}
        </span>
      )}
    </div>
  );
}

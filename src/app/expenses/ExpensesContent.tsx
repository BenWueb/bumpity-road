"use client";

import { useState, useMemo, useCallback } from "react";
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES, EXPENSE_SUBCATEGORIES } from "@/types/expense";
import { getCategoryLabelFromList, getCategoryColor, getCategoryHexColor } from "@/lib/expense-utils";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { PageHeader } from "@/components/PageHeader";
import {
  Wrench,
  Filter,
  X,
  Lightbulb,
  Receipt,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  Download,
  ArrowLeft,
} from "lucide-react";
import ExpenseCard from "@/components/expenses/ExpenseCard";
import ExpenseDetailsView from "@/components/expenses/ExpenseDetailsView";
import ExpenseForm from "@/components/expenses/ExpenseForm";

import * as XLSX from "xlsx";

type ViewMode = "cards" | "details";

interface ExpensesContentProps {
  initialExpenses: Expense[];
  currentUserId?: string;
}

export default function ExpensesContent({
  initialExpenses,
  currentUserId,
}: ExpensesContentProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"incurred" | "wishlist">(
    "incurred"
  );
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategory | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [paidFilter, setPaidFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [barChartCategory, setBarChartCategory] = useState<ExpenseCategory | null>(null);

  const hasActiveFilters =
    !!selectedCategory || !!dateFrom || !!dateTo || !!amountMin || !!amountMax || paidFilter !== "all";

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setDateFrom("");
    setDateTo("");
    setAmountMin("");
    setAmountMax("");
    setPaidFilter("all");
    setBarChartCategory(null);
  };

  // Split into incurred and planned
  const incurredExpenses = useMemo(
    () => expenses.filter((e) => !e.isPlanned),
    [expenses]
  );
  const plannedExpenses = useMemo(
    () => expenses.filter((e) => e.isPlanned),
    [expenses]
  );

  // Active list based on tab
  const activeExpenses =
    activeTab === "incurred" ? incurredExpenses : plannedExpenses;

  // Filter by category, date range, and amount range
  const filteredExpenses = useMemo(() => {
    return activeExpenses.filter((e) => {
      // Category filter
      if (selectedCategory && e.category !== selectedCategory) return false;

      // Date range filter
      if (dateFrom && e.date) {
        if (new Date(e.date) < new Date(dateFrom)) return false;
      }
      if (dateTo && e.date) {
        // Include the entire "to" day
        const toEnd = new Date(dateTo);
        toEnd.setHours(23, 59, 59, 999);
        if (new Date(e.date) > toEnd) return false;
      }
      // If date filter is set but expense has no date, exclude it
      if ((dateFrom || dateTo) && !e.date) return false;

      // Amount range filter
      const minAmt = amountMin ? parseFloat(amountMin) : null;
      const maxAmt = amountMax ? parseFloat(amountMax) : null;
      if (minAmt !== null && !isNaN(minAmt) && e.cost < minAmt) return false;
      if (maxAmt !== null && !isNaN(maxAmt) && e.cost > maxAmt) return false;

      // Paid/unpaid filter (only applies to incurred)
      if (paidFilter === "paid" && !e.isPaid) return false;
      if (paidFilter === "unpaid" && e.isPaid) return false;

      return true;
    });
  }, [activeExpenses, selectedCategory, dateFrom, dateTo, amountMin, amountMax, paidFilter]);

  // Calculate totals
  const incurredTotal = useMemo(
    () => incurredExpenses.reduce((sum, e) => sum + e.cost, 0),
    [incurredExpenses]
  );
  const plannedTotal = useMemo(
    () => plannedExpenses.reduce((sum, e) => sum + e.cost, 0),
    [plannedExpenses]
  );

  // Sort incurred by date (oldest to newest), planned by vote score (highest first)
  const sortedExpenses = useMemo(() => {
    if (activeTab === "incurred") {
      return [...filteredExpenses].sort(
        (a, b) =>
          new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
      );
    }
    // Wishlist: highest voted first
    return [...filteredExpenses].sort((a, b) => b.voteScore - a.voteScore);
  }, [filteredExpenses, activeTab]);

  // Group incurred expenses by year and month
  const expensesByYearAndMonth = useMemo(() => {
    if (activeTab !== "incurred") return {};
    const grouped: Record<number, Record<number, Expense[]>> = {};

    sortedExpenses.forEach((expense) => {
      const date = expense.date ? new Date(expense.date) : new Date();
      const year = date.getFullYear();
      const month = date.getMonth();

      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][month]) grouped[year][month] = [];
      grouped[year][month].push(expense);
    });

    return grouped;
  }, [sortedExpenses, activeTab]);

  const sortedYears = useMemo(() => {
    return Object.keys(expensesByYearAndMonth)
      .map(Number)
      .sort((a, b) => a - b);
  }, [expensesByYearAndMonth]);

  const getSortedMonths = (year: number) => {
    return Object.keys(expensesByYearAndMonth[year] || {})
      .map(Number)
      .sort((a, b) => a - b);
  };

  const getMonthName = (month: number) => {
    const date = new Date(2000, month, 1);
    return date.toLocaleDateString("en-US", { month: "long" });
  };

  const handleExpenseCreated = (newExpense: Expense) => {
    setExpenses((prev) => [...prev, newExpense]);
    setShowForm(false);
    // Switch to the right tab
    if (newExpense.isPlanned) setActiveTab("wishlist");
    else setActiveTab("incurred");
  };

  const handleExpenseUpdated = (updatedExpense: Expense) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === updatedExpense.id ? updatedExpense : e))
    );
  };

  const handleExpenseDeleted = (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  };


  // Calculate expenses by category for the bar chart (only for incurred expenses)
  const expensesByCategory = useMemo(() => {
    if (activeTab !== "incurred") return {};
    
    const grouped: Record<string, { total: number; count: number }> = {};
    
    filteredExpenses.forEach((expense) => {
      const category = expense.category;
      if (!grouped[category]) {
        grouped[category] = { total: 0, count: 0 };
      }
      grouped[category].total += expense.cost;
      grouped[category].count += 1;
    });
    
    return grouped;
  }, [filteredExpenses, activeTab]);

  const maxCategoryTotal = useMemo(() => {
    const totals = Object.values(expensesByCategory).map((g) => g.total);
    return Math.max(...totals, 0);
  }, [expensesByCategory]);

  const sortedCategories = useMemo(() => {
    return EXPENSE_CATEGORIES.map((cat) => ({
      ...cat,
      total: expensesByCategory[cat.value]?.total || 0,
      count: expensesByCategory[cat.value]?.count || 0,
    })).sort((a, b) => b.total - a.total);
  }, [expensesByCategory]);

  // Subcategory breakdown when a category is drilled into
  const expensesBySubcategory = useMemo(() => {
    if (!barChartCategory || activeTab !== "incurred") return [];

    const grouped: Record<string, { total: number; count: number }> = {};

    filteredExpenses
      .filter((e) => e.category === barChartCategory)
      .forEach((expense) => {
        const sub = expense.subcategory || "uncategorized";
        if (!grouped[sub]) grouped[sub] = { total: 0, count: 0 };
        grouped[sub].total += expense.cost;
        grouped[sub].count += 1;
      });

    // Get all known subcategories for this category and merge
    const knownSubs = EXPENSE_SUBCATEGORIES[barChartCategory] || [];
    const allSubs = knownSubs.map((s) => ({
      value: s.value,
      label: s.label,
      total: grouped[s.value]?.total || 0,
      count: grouped[s.value]?.count || 0,
    }));

    // Add any uncategorized entries not in the known list
    if (grouped["uncategorized"]) {
      allSubs.push({
        value: "uncategorized" as never,
        label: "Uncategorized",
        total: grouped["uncategorized"].total,
        count: grouped["uncategorized"].count,
      });
    }

    return allSubs.sort((a, b) => b.total - a.total);
  }, [barChartCategory, filteredExpenses, activeTab]);

  const maxSubcategoryTotal = useMemo(() => {
    const totals = expensesBySubcategory.map((s) => s.total);
    return Math.max(...totals, 0);
  }, [expensesBySubcategory]);

  // Donut chart data: segments with start/end angles and colors
  const donutData = useMemo(() => {
    if (activeTab !== "incurred") return { segments: [], total: 0 };

    const items = barChartCategory
      ? expensesBySubcategory.filter((s) => s.total > 0)
      : sortedCategories.filter((c) => c.total > 0);

    const total = items.reduce((sum, item) => sum + item.total, 0);
    if (total === 0) return { segments: [], total: 0 };

    let cumulativeAngle = 0;
    const segments = items.map((item, index) => {
      const fraction = item.total / total;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + fraction * 360;
      cumulativeAngle = endAngle;

      const color = barChartCategory
        ? getCategoryHexColor(barChartCategory)
        : getCategoryHexColor(item.value);

      // Lighten subcategory colors by adjusting opacity
      const opacity = barChartCategory
        ? 1 - (index * 0.12)
        : 1;

      return {
        value: item.value,
        label: item.label,
        total: item.total,
        fraction,
        startAngle,
        endAngle,
        color,
        opacity: Math.max(opacity, 0.3),
      };
    });

    return { segments, total };
  }, [activeTab, barChartCategory, sortedCategories, expensesBySubcategory]);

  const handleExportExcel = useCallback(() => {
    const rows = sortedExpenses.map((e) => ({
      Title: e.title,
      Category: getCategoryLabelFromList(e.category),
      Date: e.date
        ? new Date(e.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "",
      Cost: e.cost,
      Description: e.description ?? "",
      Type: e.isPlanned ? "Wishlist" : "Incurred",
      "Added By": e.user?.name ?? "",
      ...(e.isPlanned
        ? { "Vote Score": e.voteScore, Comments: e.comments.length }
        : {}),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Auto-size columns
    const colWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(
        key.length,
        ...rows.map((r) => String((r as Record<string, unknown>)[key] ?? "").length)
      ) + 2,
    }));
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    const sheetName =
      activeTab === "wishlist" ? "Wishlist" : "Incurred Expenses";
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(
      workbook,
      `expenses-${activeTab}-${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  }, [sortedExpenses, activeTab]);

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        icon={<Wrench className="h-6 w-6" />}
        title="Expenses"
        subtitle={
          activeTab === "incurred"
            ? `Total spent: $${incurredTotal.toLocaleString()}`
            : `Wishlist estimate: ~$${plannedTotal.toLocaleString()}`
        }
        innerClassName="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-6"
        desktopAction={
          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={handleExportExcel}
              disabled={sortedExpenses.length === 0}
              className="flex items-center gap-2 rounded-md bg-linear-to-br from-emerald-500 to-teal-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:from-emerald-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50 dark:from-emerald-600 dark:to-teal-700 dark:hover:from-emerald-700 dark:hover:to-teal-800"
              title="Export to Excel"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Add Expense
            </button>
          </div>
        }
        mobileAction={
          <button
            onClick={() => setShowForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Add Expense
          </button>
        }
      />

      <div className="flex-1 overflow-x-hidden overflow-y-scroll">
        <div className="mx-auto max-w-6xl p-4 md:p-6">
          {showForm && (
            <div className="mb-6">
              <ExpenseForm
                defaultPlanned={activeTab === "wishlist"}
                onExpenseCreated={handleExpenseCreated}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {/* Tab switcher and View toggle side by side */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Tab switcher */}
            <ToggleGroup
              options={[
                {
                  value: "incurred",
                  label: "Incurred",
                  icon: <Receipt className="h-4 w-4" />,
                  badge:
                    incurredExpenses.length > 0 ? (
                      <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold">
                        {incurredExpenses.length}
                      </span>
                    ) : undefined,
                },
                {
                  value: "wishlist",
                  label: "Wishlist",
                  icon: <Lightbulb className="h-4 w-4" />,
                  badge:
                    plannedExpenses.length > 0 ? (
                      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        {plannedExpenses.length}
                      </span>
                    ) : undefined,
                },
              ]}
              value={activeTab}
              onChange={(value) => {
                setActiveTab(value as "incurred" | "wishlist");
                clearAllFilters();
              }}
            />

            {/* View toggle */}
            <ToggleGroup
              options={[
                {
                  value: "cards",
                  label: "Cards",
                  icon: <LayoutGrid className="h-4 w-4" />,
                },
                {
                  value: "details",
                  label: "Details",
                  icon: <List className="h-4 w-4" />,
                },
              ]}
              value={viewMode}
              onChange={(value) => setViewMode(value as ViewMode)}
            />

          </div>

          {/* Filters */}
          <div className="mb-6 rounded-lg border bg-card shadow-sm">
            {/* Filter header / toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-colors hover:bg-accent/50"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {[
                      selectedCategory,
                      dateFrom || dateTo ? "date" : null,
                      amountMin || amountMax ? "amount" : null,
                      paidFilter !== "all" ? "paid" : null,
                    ].filter(Boolean).length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      clearAllFilters();
                    }}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                    Clear all
                  </span>
                )}
                {showFilters ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {showFilters && (
              <div className="space-y-4 border-t px-4 py-4">
                {/* Category filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:py-1.5 ${
                        selectedCategory === null
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      All
                    </button>
                    {EXPENSE_CATEGORIES.map((category) => (
                      <button
                        key={category.value}
                        onClick={() =>
                          setSelectedCategory(
                            selectedCategory === category.value
                              ? null
                              : category.value
                          )
                        }
                        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:py-1.5 ${
                          selectedCategory === category.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment status filter (only for incurred) */}
                {activeTab === "incurred" && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Payment Status
                    </label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {(
                        [
                          { value: "all", label: "All" },
                          { value: "paid", label: "Paid" },
                          { value: "unpaid", label: "Unpaid" },
                        ] as const
                      ).map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setPaidFilter(option.value)}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:py-1.5 ${
                            paidFilter === option.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date range & Amount range in a row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Date range */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      Date range
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="From"
                      />
                      <span className="hidden text-xs text-muted-foreground sm:inline">to</span>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="To"
                      />
                    </div>
                  </div>

                  {/* Amount range */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5" />
                      Amount range
                    </label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="relative w-full">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={amountMin}
                          onChange={(e) => setAmountMin(e.target.value)}
                          className="w-full rounded-md border bg-background py-2 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Min"
                        />
                      </div>
                      <span className="hidden text-xs text-muted-foreground sm:inline">to</span>
                      <div className="relative w-full">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={amountMax}
                          onChange={(e) => setAmountMax(e.target.value)}
                          className="w-full rounded-md border bg-background py-2 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Max"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Charts - Bar + Donut (only for incurred expenses, hidden on mobile) */}
          {activeTab === "incurred" && (
            <div className="mb-6 hidden h-[400px] gap-4 md:flex">
              {/* Bar Chart */}
              <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg border bg-card p-4 shadow-sm">
                {barChartCategory ? (
                  <>
                    <div className="mb-4 flex h-9 items-center gap-2">
                      <button
                        onClick={clearAllFilters}
                        className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        All Categories
                      </button>
                      <span className="text-sm text-muted-foreground">/</span>
                      <span className="min-w-0 truncate text-sm font-semibold text-foreground">
                        {getCategoryLabelFromList(barChartCategory)}
                      </span>
                    </div>
                    <div className="mt-auto flex flex-1 items-end justify-between gap-1 sm:gap-2">
                      {expensesBySubcategory.map((sub) => {
                        const percentage = maxSubcategoryTotal > 0
                          ? Math.max((sub.total / maxSubcategoryTotal) * 100, sub.total > 0 ? 3 : 0)
                          : 0;

                        return (
                          <div key={sub.value} className="flex flex-1 flex-col items-center justify-end gap-2">
                            <div className="relative flex h-44 w-full max-w-[48px] flex-col justify-end">
                              {sub.total > 0 ? (
                                <>
                                  <div
                                    className={`w-full rounded-t bg-linear-to-t ${getCategoryColor(barChartCategory)} transition-all duration-500`}
                                    style={{ height: `${percentage}%` }}
                                  />
                                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold tabular-nums text-foreground">
                                    ${sub.total.toLocaleString(undefined, {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    })}
                                  </div>
                                </>
                              ) : (
                                <div className="w-full rounded-t border border-dashed border-muted-foreground/30 bg-transparent transition-all duration-500" style={{ height: "2px" }} />
                              )}
                            </div>
                            <div className="flex min-h-10 flex-col items-center justify-start gap-0.5 text-center">
                              <span className={`line-clamp-2 text-[10px] font-medium leading-tight ${sub.total > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                                {sub.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4 flex h-9 items-center gap-2">
                      <span className="flex items-center gap-1.5 px-2 py-1 text-sm font-semibold text-foreground">
                        All Categories
                      </span>
                    </div>
                    <div className="mt-auto flex flex-1 items-end justify-between gap-1 sm:gap-2">
                      {sortedCategories.map((category) => {
                        const percentage = maxCategoryTotal > 0
                          ? Math.max((category.total / maxCategoryTotal) * 100, category.total > 0 ? 3 : 0)
                          : 0;

                        return (
                          <div
                            key={category.value}
                            className="flex flex-1 cursor-pointer flex-col items-center justify-end gap-2 transition-opacity hover:opacity-80"
                            onClick={() => {
                              setBarChartCategory(category.value as ExpenseCategory);
                              setSelectedCategory(category.value as ExpenseCategory);
                            }}
                          >
                            <div className="relative flex h-44 w-full max-w-[48px] flex-col justify-end">
                              {category.total > 0 ? (
                                <>
                                  <div
                                    className={`w-full rounded-t bg-linear-to-t ${getCategoryColor(category.value)} transition-all duration-500`}
                                    style={{ height: `${percentage}%` }}
                                  />
                                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold tabular-nums text-foreground">
                                    ${category.total.toLocaleString(undefined, {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    })}
                                  </div>
                                </>
                              ) : (
                                <div className="w-full rounded-t border border-dashed border-muted-foreground/30 bg-transparent transition-all duration-500" style={{ height: "2px" }} />
                              )}
                            </div>
                            <div className="flex min-h-10 flex-col items-center justify-start gap-0.5 text-center">
                              <span className={`line-clamp-2 text-[10px] font-medium leading-tight ${category.total > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                                {category.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Donut Chart */}
              <div className="flex h-full w-72 shrink-0 flex-col rounded-lg border bg-card p-4 shadow-sm">
                <span className="mb-2 px-2 py-1 text-sm font-semibold text-foreground">
                  Breakdown
                </span>
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-hidden">
                  {/* SVG Donut */}
                  <div className="relative">
                    <svg viewBox="0 0 120 120" className="h-40 w-40">
                      {donutData.segments.length > 0 ? (
                        donutData.segments.map((seg) => {
                          const r = 48;
                          const cx = 60;
                          const cy = 60;
                          const circumference = 2 * Math.PI * r;
                          const startRad = ((seg.startAngle - 90) * Math.PI) / 180;
                          const endRad = ((seg.endAngle - 90) * Math.PI) / 180;

                          // Arc path
                          const x1 = cx + r * Math.cos(startRad);
                          const y1 = cy + r * Math.sin(startRad);
                          const x2 = cx + r * Math.cos(endRad);
                          const y2 = cy + r * Math.sin(endRad);
                          const largeArc = seg.endAngle - seg.startAngle > 180 ? 1 : 0;

                          // For a single segment spanning full circle
                          if (seg.fraction >= 0.9999) {
                            return (
                              <circle
                                key={seg.value}
                                cx={cx}
                                cy={cy}
                                r={r}
                                fill="none"
                                stroke={seg.color}
                                strokeWidth="20"
                                opacity={seg.opacity}
                              />
                            );
                          }

                          return (
                            <path
                              key={seg.value}
                              d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
                              fill="none"
                              stroke={seg.color}
                              strokeWidth="20"
                              opacity={seg.opacity}
                              strokeLinecap="butt"
                            />
                          );
                        })
                      ) : (
                        <circle
                          cx="60"
                          cy="60"
                          r="48"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="20"
                          className="text-muted-foreground/20"
                          strokeDasharray="4 4"
                        />
                      )}
                    </svg>
                    {/* Center total */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold tabular-nums text-foreground">
                        ${donutData.total.toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </span>
                      <span className="text-[10px] text-muted-foreground">total</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex min-h-0 w-full flex-1 flex-col gap-1 overflow-y-auto px-1 pr-2">
                    {donutData.segments.map((seg) => (
                      <div key={seg.value} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-sm"
                            style={{ backgroundColor: seg.color, opacity: seg.opacity }}
                          />
                          <span className="truncate text-[10px] text-muted-foreground">
                            {seg.label}
                          </span>
                        </div>
                        <span className="shrink-0 text-[10px] font-medium tabular-nums text-foreground">
                          {(seg.fraction * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                 
                  </div>
                </div>
              </div>
            </div>
          )}

          {sortedExpenses.length === 0 ? (
            <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
              <p className="text-sm text-muted-foreground">
                {hasActiveFilters
                  ? `No ${
                      activeTab === "wishlist" ? "wishlist items" : "expenses"
                    } match your filters.`
                  : activeTab === "wishlist"
                  ? "No wishlist items yet. Add something you'd like to do!"
                  : "No expenses yet. Add your first expense to get started!"}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-3 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : viewMode === "details" ? (
            /* Details view — flat table */
            <ExpenseDetailsView
              expenses={sortedExpenses}
              currentUserId={currentUserId}
              isWishlist={activeTab === "wishlist"}
              onExpenseUpdated={handleExpenseUpdated}
              onExpenseDeleted={handleExpenseDeleted}
            />
          ) : activeTab === "incurred" ? (
            /* Incurred: grouped by year/month cards */
            <div className="space-y-8">
              {sortedYears.map((year) => {
                const months = getSortedMonths(year);
                const yearTotal = months.reduce(
                  (sum, month) =>
                    sum +
                    (expensesByYearAndMonth[year]?.[month] || []).reduce(
                      (s, e) => s + e.cost,
                      0
                    ),
                  0
                );

                return (
                  <div key={year} className="space-y-6">
                    <div className="sticky top-0 z-10 border-b bg-background/95 pb-2 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-foreground">
                          {year}
                        </h2>
                        <span className="text-sm font-medium text-muted-foreground">
                          ${yearTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {months.map((month) => {
                        const monthExpenses =
                          expensesByYearAndMonth[year]?.[month] || [];
                        const monthTotal = monthExpenses.reduce(
                          (sum, e) => sum + e.cost,
                          0
                        );

                        return (
                          <div key={`${year}-${month}`} className="space-y-3">
                            <div className="flex items-center justify-between pb-1">
                              <h3 className="text-lg font-semibold text-foreground">
                                {getMonthName(month)}
                              </h3>
                              <span className="text-sm text-muted-foreground">
                                ${monthTotal.toLocaleString()}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {monthExpenses.map((expense) => (
                                <ExpenseCard
                                  key={expense.id}
                                  expense={expense}
                                  currentUserId={currentUserId}
                                  onExpenseUpdated={handleExpenseUpdated}
                                  onExpenseDeleted={handleExpenseDeleted}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Wishlist: flat grid sorted by votes */
            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {sortedExpenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  currentUserId={currentUserId}
                  onExpenseUpdated={handleExpenseUpdated}
                  onExpenseDeleted={handleExpenseDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

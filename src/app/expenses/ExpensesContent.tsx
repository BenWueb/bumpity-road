"use client";

import { useState, useMemo, useCallback } from "react";
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from "@/types/expense";
import { getCategoryLabelFromList, getCategoryColor } from "@/lib/expense-utils";
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
} from "lucide-react";
import ExpenseCard from "@/components/expenses/ExpenseCard";
import ExpenseDetailsView from "@/components/expenses/ExpenseDetailsView";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";
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

  const hasActiveFilters =
    !!selectedCategory || !!dateFrom || !!dateTo || !!amountMin || !!amountMax;

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setDateFrom("");
    setDateTo("");
    setAmountMin("");
    setAmountMax("");
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

      return true;
    });
  }, [activeExpenses, selectedCategory, dateFrom, dateTo, amountMin, amountMax]);

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

      <div className="flex-1 overflow-auto">
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

            {/* Filter count summary (when filters collapsed) */}
            {hasActiveFilters && !showFilters && (
              <span className="text-xs text-muted-foreground">
                {sortedExpenses.length} of {activeExpenses.length} shown
              </span>
            )}
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

          {/* Bar Chart - Expenses by Category (only for incurred expenses, hidden on mobile) */}
          {activeTab === "incurred" && (
            <div className="mb-6 hidden rounded-lg border bg-card p-4 pt-8 shadow-sm md:block">
             
              <div className="flex items-end justify-between gap-1 sm:gap-2">
                {sortedCategories.map((category) => {
                  const percentage = maxCategoryTotal > 0 
                    ? (category.total / maxCategoryTotal) * 100 
                    : 0;
                  
                  return (
                    <div key={category.value} className="flex flex-1 flex-col items-center gap-2">
                      <div className="relative flex h-48 w-full max-w-[60px] flex-col justify-end">
                        {category.total > 0 ? (
                          <>
                            <div
                              className={`w-full rounded-t bg-linear-to-t ${getCategoryColor(category.value)} transition-all duration-500`}
                              style={{ height: `${percentage}%` }}
                            />
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold tabular-nums text-foreground">
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
                      <div className="flex min-h-12 flex-col items-center justify-start gap-0.5 text-center">
                        <span className={`line-clamp-2 text-xs font-medium leading-tight ${category.total > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                          {category.label}
                        </span>
                        {category.count > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            {category.count} {category.count === 1 ? "expense" : "expenses"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
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

                            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

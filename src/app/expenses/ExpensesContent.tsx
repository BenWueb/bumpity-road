"use client";

import { useState, useMemo } from "react";
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from "@/types/expense";
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
} from "lucide-react";
import ExpenseCard from "@/components/expenses/ExpenseCard";
import ExpenseForm from "@/components/expenses/ExpenseForm";

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
        desktopAction={
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            Add Expense
          </button>
        }
      />

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          {showForm && (
            <div className="mb-6">
              <ExpenseForm
                defaultPlanned={activeTab === "wishlist"}
                onExpenseCreated={handleExpenseCreated}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {/* Tab switcher */}
          <div className="mb-6 flex items-center gap-1 rounded-lg bg-muted p-1">
            <button
              onClick={() => {
                setActiveTab("incurred");
                clearAllFilters();
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "incurred"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Receipt className="h-4 w-4" />
              Incurred
              {incurredExpenses.length > 0 && (
                <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold">
                  {incurredExpenses.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("wishlist");
                clearAllFilters();
              }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "wishlist"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lightbulb className="h-4 w-4" />
              Wishlist
              {plannedExpenses.length > 0 && (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                  {plannedExpenses.length}
                </span>
              )}
            </button>
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
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
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
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
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
                    <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <Calendar className="h-3.5 w-3.5" />
                      Date range
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="From"
                      />
                      <span className="text-xs text-muted-foreground shrink-0">to</span>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="To"
                      />
                    </div>
                  </div>

                  {/* Amount range */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <DollarSign className="h-3.5 w-3.5" />
                      Amount range
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={amountMin}
                          onChange={(e) => setAmountMin(e.target.value)}
                          className="w-full rounded-md border bg-background py-1.5 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Min"
                        />
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">to</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={amountMax}
                          onChange={(e) => setAmountMax(e.target.value)}
                          className="w-full rounded-md border bg-background py-1.5 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Max"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

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
          ) : activeTab === "incurred" ? (
            /* Incurred: grouped by year/month */
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

                    <div className="space-y-6 pl-4 md:pl-6">
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

                            <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

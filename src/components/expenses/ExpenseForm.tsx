"use client";

import { useState } from "react";
import { Expense, EXPENSE_CATEGORIES } from "@/types/expense";
import { Lightbulb, Receipt } from "lucide-react";

interface ExpenseFormProps {
  expense?: Expense;
  defaultPlanned?: boolean;
  onExpenseCreated?: (expense: Expense) => void;
  onExpenseUpdated?: (expense: Expense) => void;
  onCancel: () => void;
}

export default function ExpenseForm({
  expense,
  defaultPlanned = false,
  onExpenseCreated,
  onExpenseUpdated,
  onCancel,
}: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [isPlanned, setIsPlanned] = useState(
    expense?.isPlanned ?? defaultPlanned
  );
  const [formData, setFormData] = useState({
    title: expense?.title || "",
    description: expense?.description || "",
    cost: expense?.cost?.toString() || "",
    date: expense?.date
      ? new Date(expense.date).toISOString().split("T")[0]
      : isPlanned
      ? ""
      : today,
    category: expense?.category || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    const cost = parseFloat(formData.cost);
    if (isNaN(cost) || cost < 0) {
      alert("Please enter a valid cost");
      return;
    }

    if (!isPlanned && !formData.date) {
      alert("Date is required for incurred expenses");
      return;
    }

    if (!formData.category) {
      alert("Category is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = "/api/expenses";
      const method = expense ? "PATCH" : "POST";
      const body = expense
        ? {
            id: expense.id,
            ...formData,
            cost,
            date: formData.date || null,
            isPlanned,
          }
        : { ...formData, cost, date: formData.date || null, isPlanned };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save expense");
      }

      const { expense: savedExpense } = await response.json();

      if (expense && onExpenseUpdated) {
        onExpenseUpdated(savedExpense);
      } else if (onExpenseCreated) {
        onExpenseCreated(savedExpense);
      }
    } catch (error) {
      console.error("Error saving expense:", error);
      alert(error instanceof Error ? error.message : "Failed to save expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Planned / Incurred toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsPlanned(false);
              if (!formData.date) {
                setFormData((prev) => ({ ...prev, date: today }));
              }
            }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              !isPlanned
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Receipt className="h-4 w-4" />
            Incurred
          </button>
          <button
            type="button"
            onClick={() => {
              setIsPlanned(true);
              setFormData((prev) => ({ ...prev, date: "" }));
            }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isPlanned
                ? "bg-amber-500 text-white"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            <Lightbulb className="h-4 w-4" />
            Wishlist
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder={
                isPlanned
                  ? "What would you like to do?"
                  : "What was the expense?"
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="cost" className="text-sm font-medium">
              {isPlanned ? "Estimated Cost *" : "Cost *"}
            </label>
            <input
              id="cost"
              type="number"
              step="0.01"
              min="0"
              value={formData.cost}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, cost: e.target.value }))
              }
              placeholder="0.00"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium">
              {isPlanned ? "Target Date (optional)" : "Date Completed *"}
            </label>
            <input
              id="date"
              type="date"
              value={formData.date}
              min={isPlanned ? today : undefined}
              max={isPlanned ? undefined : today}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required={!isPlanned}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Category *
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="">Select category</option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder={
              isPlanned
                ? "Why would this be a good investment?"
                : "Additional details about the expense..."
            }
            rows={3}
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : expense
              ? "Update"
              : isPlanned
              ? "Add to Wishlist"
              : "Add Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}

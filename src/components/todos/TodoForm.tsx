"use client";

import { KANBAN_COLUMNS, RECURRING_OPTIONS } from "@/lib/todo-constants";
import { coerceTodoStatus, Todo, TodoStatus, UserInfo } from "@/types/todo";
import { useState } from "react";
import { UserSearchPicker } from "./UserSearchPicker";

type Props = {
  initialData?: Partial<Todo>;
  onSubmit: (data: {
    title: string;
    details: string | null;
    recurring: string | null;
    status: TodoStatus;
    assignedToId: string | null;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  showStatusField?: boolean;
  submitLabel?: string;
  submittingLabel?: string;
};

export function TodoForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  showStatusField = false,
  submitLabel = "Add",
  submittingLabel = "Adding...",
}: Props) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [details, setDetails] = useState(initialData?.details ?? "");
  const [recurring, setRecurring] = useState<string | null>(initialData?.recurring ?? null);
  const [status, setStatus] = useState<TodoStatus>(initialData?.status ?? "todo");
  const [assignee, setAssignee] = useState<UserInfo | null>(initialData?.assignedTo ?? null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    await onSubmit({
      title: title.trim(),
      details: details.trim() || null,
      recurring,
      status,
      assignedToId: assignee?.id ?? null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title..."
        autoFocus
        className="w-full rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        placeholder="Details (optional)..."
        rows={2}
        className="w-full resize-none rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <div className={showStatusField ? "grid grid-cols-2 gap-2" : ""}>
        {showStatusField && (
          <select
            value={status}
            onChange={(e) => setStatus(coerceTodoStatus(e.target.value))}
            className="rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {KANBAN_COLUMNS.map((col) => (
              <option key={col.id} value={col.id}>
                {col.label}
              </option>
            ))}
          </select>
        )}
        <select
          value={recurring ?? ""}
          onChange={(e) => setRecurring(e.target.value || null)}
          className="w-full rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {RECURRING_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value ?? ""}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <UserSearchPicker value={assignee} onChange={setAssignee} />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}


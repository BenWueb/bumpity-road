"use client";

import { Todo } from "@/types/todo";
import { ChevronDown, Trash2 } from "lucide-react";
import { RecurringBadge } from "./RecurringBadge";
import { KANBAN_COLUMNS } from "@/lib/todo-constants";

type Props = {
  todo: Todo;
  isOwner: boolean;
  isExpanded: boolean;
  viewerUserId?: string;
  onToggle?: () => void;
  onDelete?: () => void;
  onExpand: () => void;
  children?: React.ReactNode; // For expanded content
};

export function TodoItem({
  todo,
  isOwner,
  isExpanded,
  viewerUserId,
  onToggle,
  onDelete,
  onExpand,
  children,
}: Props) {
  const column = KANBAN_COLUMNS.find((c) => c.id === todo.status);
  const StatusIcon = column?.icon;
  const statusLabel = column?.label ?? todo.status;

  const assignmentLabel =
    todo.assignedTo?.id && viewerUserId && todo.assignedTo.id === viewerUserId
      ? "Assigned to you"
      : todo.assignedTo
      ? "Assigned"
      : "Unassigned";

  return (
    <div className={`group relative rounded-lg border bg-background/60 shadow-sm backdrop-blur ${isExpanded ? "z-40" : ""}`}>
      <div className="flex items-start gap-3 px-3 py-2">
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            {StatusIcon ? (
              <StatusIcon
                className={`h-5 w-5 ${
                  todo.status === "done"
                    ? "text-emerald-500"
                    : todo.status === "in_progress"
                    ? "text-blue-500"
                    : "text-muted-foreground"
                }`}
              />
            ) : null}
          </button>
        ) : (
          <div className="mt-0.5 shrink-0 text-muted-foreground">
            {StatusIcon ? (
              <StatusIcon
                className={`h-5 w-5 ${
                  todo.status === "done"
                    ? "text-emerald-500"
                    : todo.status === "in_progress"
                    ? "text-blue-500"
                    : "text-muted-foreground"
                }`}
              />
            ) : null}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <span
              className={[
                "min-w-0 flex-1 truncate text-sm font-medium",
                todo.completed
                  ? "text-muted-foreground line-through"
                  : "text-foreground",
              ].join(" ")}
            >
              {todo.title}
            </span>

            {/* Pills (match Account task row) */}
            <div className="hidden shrink-0 items-center gap-1 sm:flex">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium md:text-xs ${
                  todo.assignedTo?.id &&
                  viewerUserId &&
                  todo.assignedTo.id === viewerUserId
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                    : todo.assignedTo
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
                }`}
                title={assignmentLabel}
              >
                {assignmentLabel}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium md:text-xs ${
                  todo.status === "done"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : todo.status === "in_progress"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
                }`}
                title={statusLabel}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {todo.assignedTo ? (
              <span className="text-xs text-muted-foreground">
                → {todo.assignedTo.name}
              </span>
            ) : !isOwner ? (
              <span className="text-xs text-muted-foreground">
                from {todo.user.name}
              </span>
            ) : null}
            {todo.completedBy && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                ✓ {todo.completedBy.name}
                {todo.completedAt && (
                  <span className="ml-1 text-muted-foreground">
                    {new Date(todo.completedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
              </span>
            )}
          </div>
          {todo.recurring && (
            <div className="mt-1.5">
              <RecurringBadge
                recurring={todo.recurring}
                anchorDate={todo.dueDate ?? todo.createdAt}
              />
            </div>
          )}
        </div>

        {isOwner && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="mt-0.5 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={onExpand}
          className="mt-0.5 shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          title={isExpanded ? "Collapse" : "Edit"}
        >
          <ChevronDown
            className={[
              "h-4 w-4 transition-transform",
              isExpanded ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>
      </div>

      {isExpanded && children && (
        <div className="border-t px-3 py-3">{children}</div>
      )}
    </div>
  );
}

"use client";

import { Todo } from "@/types/todo";
import { ChevronDown, Circle, CircleCheck, Trash2 } from "lucide-react";
import { RecurringBadge } from "./RecurringBadge";

type Props = {
  todo: Todo;
  isOwner: boolean;
  isExpanded: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
  onExpand: () => void;
  children?: React.ReactNode; // For expanded content
};

export function TodoItem({
  todo,
  isOwner,
  isExpanded,
  onToggle,
  onDelete,
  onExpand,
  children,
}: Props) {
  return (
    <div className={`group relative rounded-lg border bg-background/60 shadow-sm backdrop-blur ${isExpanded ? "z-40" : ""}`}>
      <div className="flex items-start gap-3 px-3 py-2">
        {onToggle ? (
          <button
            type="button"
            onClick={onToggle}
            className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            {todo.completed ? (
              <CircleCheck className="h-5 w-5 text-emerald-500" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>
        ) : (
          <div className="mt-0.5 shrink-0 text-muted-foreground">
            {todo.completed ? (
              <CircleCheck className="h-5 w-5 text-emerald-500" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <span
            className={[
              "block text-sm font-medium",
              todo.completed
                ? "text-muted-foreground line-through"
                : "text-foreground",
            ].join(" ")}
          >
            {todo.title}
          </span>

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

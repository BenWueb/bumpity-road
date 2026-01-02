"use client";

import { KANBAN_COLUMNS } from "@/lib/todo-constants";
import { coerceTodoStatus, Todo, TodoStatus } from "@/types/todo";
import { RecurringBadge } from "@/components/todos";
import { GripVertical, Pencil, Trash2 } from "lucide-react";

type Props = {
  todo: Todo;
  cardGradient: string;
  userId?: string;
  isLoggedIn: boolean;
  isDragging: boolean;
  canMove: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onUpdateStatus?: (status: TodoStatus) => void;
};

export function KanbanTodoCard({
  todo,
  cardGradient,
  userId,
  isLoggedIn,
  isDragging,
  canMove,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
  onUpdateStatus,
}: Props) {
  const isOwner = todo.userId === userId;

  return (
    <div
      draggable={canMove}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={[
        "group overflow-hidden rounded-lg border p-2.5 shadow-sm",
        cardGradient,
        canMove ? "cursor-grab active:cursor-grabbing" : "cursor-default",
        isDragging ? "opacity-60" : "",
      ].join(" ")}
    >
      <div className="flex items-start gap-2">
        {canMove && (
          <div
            className="mt-0.5 shrink-0 text-muted-foreground/70"
            title="Drag to move"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        <div className="min-w-0 flex-1 md:overflow-hidden">
          <div className="break-words text-[13px] font-medium leading-tight md:truncate">
            {todo.title}
          </div>
          {todo.details && (
            <p className="mt-1 break-words text-[11px] leading-snug text-muted-foreground md:line-clamp-2">
              {todo.details}
            </p>
          )}

          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            {todo.assignedTo && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                → {todo.assignedTo.name}
              </span>
            )}
            <span className="text-[9px] text-muted-foreground">
              by {todo.user.name}
            </span>
            {todo.completedBy && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                ✓ {todo.completedBy.name}
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

          {/* Mobile status dropdown */}
          {canMove && (
            <div className="mt-1.5">
              <select
                value={todo.status}
                onChange={(e) =>
                  onUpdateStatus?.(coerceTodoStatus(e.target.value))
                }
                className="w-full rounded-md border bg-background px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {KANBAN_COLUMNS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {isLoggedIn && isOwner && (
          <div className="flex shrink-0 gap-0.5">
            <button
              type="button"
              onClick={onEdit}
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              title="Edit task"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title="Delete task"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}



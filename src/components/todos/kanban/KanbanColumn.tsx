"use client";

import { KANBAN_COLUMNS } from "@/lib/todo-constants";
import { Todo, TodoStatus } from "@/types/todo";
import { KanbanTodoCard } from "./KanbanTodoCard";
import { ChevronDown, Plus } from "lucide-react";

type Column = (typeof KANBAN_COLUMNS)[number];

type Props = {
  col: Column;
  todos: Todo[];
  isExpanded: boolean;
  isLoggedIn: boolean;
  userId?: string;
  draggingId: string | null;
  dragOverStatus: TodoStatus | null;
  onToggle: () => void;
  onOpenAdd: () => void;
  onEditTodo: (todo: Todo) => void;
  onDeleteTodo: (id: string) => void;
  onUpdateStatus: (id: string, status: TodoStatus) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDragStartTodo: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
};

export function KanbanColumn({
  col,
  todos,
  isExpanded,
  isLoggedIn,
  userId,
  draggingId,
  dragOverStatus,
  onToggle,
  onOpenAdd,
  onEditTodo,
  onDeleteTodo,
  onUpdateStatus,
  onDragOver,
  onDrop,
  onDragLeave,
  onDragStartTodo,
  onDragEnd,
}: Props) {
  const Icon = col.icon;
  const isDragOver = dragOverStatus === col.id;

  return (
    <div
      className={`w-full overflow-hidden rounded-lg border border-t-4 bg-muted/30 ${col.color}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-3 py-2.5"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{col.label}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {todos.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isLoggedIn && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onOpenAdd();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onOpenAdd();
                }
              }}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Add task"
              title="Add task"
            >
              <Plus className="h-4 w-4" />
            </span>
          )}

          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isExpanded && (
        <div
          className={[
            "w-full border-t px-2 pb-2 pt-1.5",
            "min-h-0 md:min-h-[520px]",
            isDragOver ? "bg-emerald-500/5" : "",
          ].join(" ")}
        >
          <div className="space-y-1.5">
            {todos.map((todo) => {
              const isOwner = todo.userId === userId;
              const canMove =
                isLoggedIn && (isOwner || todo.assignedTo?.id === userId);
              const isDragging = draggingId === todo.id;

              return (
                <KanbanTodoCard
                  key={todo.id}
                  todo={todo}
                  cardGradient={col.cardGradient}
                  userId={userId}
                  isLoggedIn={isLoggedIn}
                  isDragging={isDragging}
                  canMove={canMove}
                  onDragStart={(e) => {
                    if (!canMove) return;
                    onDragStartTodo(e, todo.id);
                  }}
                  onDragEnd={onDragEnd}
                  onEdit={() => onEditTodo(todo)}
                  onDelete={() => onDeleteTodo(todo.id)}
                  onUpdateStatus={(status) => onUpdateStatus(todo.id, status)}
                />
              );
            })}

            {todos.length === 0 && (
              <div className="mb-1.5 flex h-12 items-center justify-center rounded-lg border-2 border-muted-foreground/20 text-xs text-muted-foreground md:border-dashed">
                No tasks
              </div>
            )}

            {/* Always-visible drop targets (desktop only) so DnD is discoverable */}
            <div className="hidden pt-1 md:block">
              <div className="space-y-1.5">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={[
                      "h-12 rounded-lg border-2 border-dashed",
                      "bg-background/30",
                      isDragOver
                        ? "border-emerald-500/60"
                        : "border-muted-foreground/20",
                    ].join(" ")}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



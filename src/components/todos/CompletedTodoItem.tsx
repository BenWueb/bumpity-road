"use client";

import { Todo } from "@/types/todo";
import { CircleCheck, Trash2 } from "lucide-react";

type Props = {
  todo: Todo;
  isOwner: boolean;
  onUncomplete: () => void;
  onDelete: () => void;
};

export function CompletedTodoItem({ todo, isOwner, onUncomplete, onDelete }: Props) {
  return (
    <div className="group flex items-start gap-3 rounded-lg border bg-background/60 px-3 py-2 shadow-sm backdrop-blur">
      <button
        type="button"
        onClick={onUncomplete}
        className="mt-0.5 shrink-0 text-emerald-500 transition-colors hover:text-foreground"
      >
        <CircleCheck className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1">
        <span className="block text-sm text-muted-foreground line-through">{todo.title}</span>
        {todo.details && (
          <p className="mt-0.5 text-xs text-muted-foreground/70 line-clamp-1">{todo.details}</p>
        )}
        {todo.completedBy && (
          <p className="mt-0.5 text-xs text-emerald-600/80 dark:text-emerald-400/80">
            Completed by {todo.completedBy.name}
          </p>
        )}
      </div>
      {isOwner && (
        <button
          type="button"
          onClick={onDelete}
          className="mt-0.5 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}


import Link from "next/link";
import { ChevronDown, Circle, ListTodo, UserCheck } from "lucide-react";
import { KANBAN_COLUMNS } from "@/lib/todo-constants";
import { RecurringBadge } from "@/components/todos";
import { AccountCard } from "./AccountCard";
import type { Todo } from "@/types/todo";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";

type Props = {
  todos: Todo[];
  tasksCreated: Todo[];
  tasksAssigned: Todo[];
  createdExpanded: boolean;
  assignedExpanded: boolean;
  onToggleCreated: () => void;
  onToggleAssigned: () => void;
  userId: string;
};

export function TasksCard({
  todos,
  tasksCreated,
  tasksAssigned,
  createdExpanded,
  assignedExpanded,
  onToggleCreated,
  onToggleAssigned,
  userId,
}: Props) {
  return (
    <AccountCard
      gradientClassName={CARD_GRADIENTS.slate}
    >
      <div className="relative">
        <div className="flex items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
          <h3 className="text-sm font-semibold md:text-lg">Your Tasks</h3>
          <span className="text-xs text-muted-foreground md:text-sm">
            {todos.length} total
          </span>
        </div>

        {todos.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground md:px-6 md:py-8">
            <ListTodo className="mx-auto mb-2 h-6 w-6 opacity-50 md:h-8 md:w-8" />
            <p>No tasks yet.</p>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              Add one, assign it (optional), and keep it moving.
            </p>
            <Link
              href="/todos"
              className="mt-3 inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
            >
              Go to Tasks
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {/* Tasks You Created */}
            <div>
              <button
                type="button"
                onClick={onToggleCreated}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-accent/50 md:px-6 md:py-3"
              >
                <div className="flex items-center gap-2">
                  <ListTodo className="h-3.5 w-3.5 text-muted-foreground md:h-4 md:w-4" />
                  <span className="text-xs font-medium md:text-sm">
                    Tasks You Created
                  </span>
                  <span className="text-[10px] text-muted-foreground md:text-xs">
                    ({tasksCreated.length})
                  </span>
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-muted-foreground transition-transform md:h-4 md:w-4 ${
                    createdExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              {createdExpanded && (
                <div className="border-t bg-background/50">
                  {tasksCreated.length === 0 ? (
                    <div className="px-4 py-3 text-center text-xs text-muted-foreground md:px-6 md:py-4 md:text-sm">
                      No tasks created yet
                    </div>
                  ) : (
                    <div className="divide-y">
                      {tasksCreated.slice(0, 10).map((todo) => (
                        <TaskRow key={todo.id} todo={todo} userId={userId} />
                      ))}
                      {tasksCreated.length > 10 && (
                        <div className="px-4 py-1.5 text-center text-[10px] text-muted-foreground md:px-6 md:py-2 md:text-xs">
                          +{tasksCreated.length - 10} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tasks Assigned to You */}
            <div>
              <button
                type="button"
                onClick={onToggleAssigned}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-accent/50 md:px-6 md:py-3"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="h-3.5 w-3.5 text-muted-foreground md:h-4 md:w-4" />
                  <span className="text-xs font-medium md:text-sm">
                    Tasks Assigned to You
                  </span>
                  <span className="text-[10px] text-muted-foreground md:text-xs">
                    ({tasksAssigned.length})
                  </span>
                </div>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-muted-foreground transition-transform md:h-4 md:w-4 ${
                    assignedExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              {assignedExpanded && (
                <div className="border-t bg-background/50">
                  {tasksAssigned.length === 0 ? (
                    <div className="px-4 py-3 text-center text-xs text-muted-foreground md:px-6 md:py-4 md:text-sm">
                      No tasks assigned to you
                    </div>
                  ) : (
                    <div className="divide-y">
                      {tasksAssigned.slice(0, 10).map((todo) => (
                        <TaskRow key={todo.id} todo={todo} userId={userId} />
                      ))}
                      {tasksAssigned.length > 10 && (
                        <div className="px-4 py-1.5 text-center text-[10px] text-muted-foreground md:px-6 md:py-2 md:text-xs">
                          +{tasksAssigned.length - 10} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-center px-4 py-3 md:px-6 md:py-4">
              <Link
                href="/todos"
                className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
              >
                View all {todos.length} tasks
              </Link>
            </div>
          </div>
        )}
      </div>
    </AccountCard>
  );
}

function TaskRow({ todo, userId }: { todo: Todo; userId: string }) {
  const column = KANBAN_COLUMNS.find((c) => c.id === todo.status);
  const StatusIcon = column?.icon ?? Circle;
  const isOwner = todo.userId === userId;
  const assignmentLabel = todo.assignedTo?.id === userId
    ? "Assigned to you"
    : todo.assignedTo
    ? "Assigned"
    : "Unassigned";

  return (
    <div className="flex items-center gap-2 px-4 py-2 md:gap-4 md:px-6 md:py-3">
      <StatusIcon
        className={`h-4 w-4 shrink-0 md:h-5 md:w-5 ${
          todo.status === "done"
            ? "text-emerald-500"
            : todo.status === "in_progress"
            ? "text-blue-500"
            : "text-muted-foreground"
        }`}
      />
      <div className="min-w-0 flex-1">
        <div
          className={`truncate text-xs font-medium md:text-sm ${
            todo.completed ? "text-muted-foreground line-through" : ""
          }`}
        >
          {todo.title}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1 md:gap-2">
          {todo.assignedTo && (
            <span className="text-[10px] text-muted-foreground md:text-xs">
              → {todo.assignedTo.name}
            </span>
          )}
          {!isOwner && (
            <span className="text-[10px] text-muted-foreground md:text-xs">
              from {todo.user.name}
            </span>
          )}
          {todo.completedBy && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 md:text-xs">
              ✓ by {todo.completedBy.name}
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
          {todo.recurring && (
            <RecurringBadge
              recurring={todo.recurring}
              anchorDate={todo.dueDate ?? todo.createdAt}
            />
          )}
        </div>
      </div>
      <div className="hidden shrink-0 items-center gap-1 sm:flex">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium md:text-xs ${
            todo.assignedTo?.id === userId
              ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
              : todo.assignedTo
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
              : "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
          }`}
        >
          {assignmentLabel}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium md:text-xs ${
            todo.status === "done"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              : todo.status === "in_progress"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              : "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
          }`}
        >
          {column?.label ?? todo.status}
        </span>
      </div>
    </div>
  );
}



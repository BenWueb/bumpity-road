"use client";

import { authClient } from "@/lib/auth-client";
import { RECURRING_OPTIONS } from "@/lib/todo-constants";
import { Todo, UserInfo } from "@/types/todo";
import { useTodos } from "@/hooks/use-todos";
import { useClickOutside } from "@/hooks/use-click-outside";
import { CheckSquare, ChevronDown, CircleCheck, Plus } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import {
  CompletedTodoItem,
  RecurringBadge,
  TodoItem,
  UserSearchPicker,
} from "./todos";

export function TodoCardSkeleton() {
  return (
    <div className="relative w-full  overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-teal-50 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/20" />
      <div className="relative px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="h-4 w-20 animate-pulse rounded-md bg-accent sm:h-5 sm:w-24" />
            <div className="mt-2 h-3 w-28 animate-pulse rounded-md bg-accent sm:h-4 sm:w-32" />
          </div>
          <div className="h-8 w-8 animate-pulse rounded-md bg-accent sm:h-9 sm:w-9" />
        </div>
      </div>
      <div className="relative space-y-2 px-4 pb-4 pt-3 sm:space-y-3 sm:px-6 sm:pb-6 sm:pt-4">
        <div className="h-10 w-full animate-pulse rounded-lg bg-accent" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-accent" />
        <div className="hidden h-10 w-full animate-pulse rounded-lg bg-accent sm:block" />
      </div>
    </div>
  );
}

type TodoCardClientProps = {
  initialTodos?: Todo[];
};

export default function TodoCard({ initialTodos }: TodoCardClientProps = {}) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const {
    todos,
    setTodos,
    isLoading,
    addTodo,
    deleteTodo,
    toggleComplete,
    assignTodo,
    updateTodo,
    pendingTodos,
    completedTodos,
  } = useTodos(userId);

  // Initialize with server data if provided
  useState(() => {
    if (initialTodos && initialTodos.length > 0) {
      setTodos(initialTodos);
    }
  });

  // New todo form state
  const [showInput, setShowInput] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [newRecurring, setNewRecurring] = useState<string | null>(null);
  const [newAssignee, setNewAssignee] = useState<UserInfo | null>(null);
  const [adding, setAdding] = useState(false);

  // Expanded todo
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [completedCollapsed, setCompletedCollapsed] = useState(true);

  const addFormRef = useRef<HTMLFormElement>(null);

  // Close add form on outside click
  const handleCloseAddForm = useCallback(() => {
    setShowInput(false);
    setNewTitle("");
    setNewDetails("");
    setNewRecurring(null);
    setNewAssignee(null);
  }, []);

  useClickOutside(addFormRef, handleCloseAddForm, showInput);

  async function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || adding) return;

    setAdding(true);
    try {
      await addTodo({
        title: newTitle.trim(),
        details: newDetails.trim() || null,
        recurring: newRecurring,
        assignedToId: newAssignee?.id ?? null,
      });
      handleCloseAddForm();
    } finally {
      setAdding(false);
    }
  }

  async function handleUpdateTodo(
    id: string,
    updates: Partial<Pick<Todo, "title" | "details" | "recurring">>
  ) {
    await updateTodo({ id, ...updates });
  }

  if (isLoading) return <TodoCardSkeleton />;

  const isLoggedIn = !!session?.user;
  const pendingCount = pendingTodos.length;

  return (
    <div className="relative w-full  overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-teal-50 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/20" />

      <div className="relative px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold leading-none sm:text-base">
              Tasks
            </div>
            <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {isLoggedIn
                ? pendingCount === 0
                  ? "All done!"
                  : `${pendingCount} task${
                      pendingCount === 1 ? "" : "s"
                    } remaining`
                : "Sign in to use"}
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background/60 shadow-sm backdrop-blur sm:h-9 sm:w-9">
            <CheckSquare className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
          </div>
        </div>
      </div>

      <div className="relative px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4">
        {!isLoggedIn ? (
          <div className="text-sm text-muted-foreground">
            Log in to manage your tasks.
          </div>
        ) : (
          <>
            {/* Add new todo */}
            {showInput ? (
              <form
                ref={addFormRef}
                onSubmit={handleAddTodo}
                className="relative z-10 mb-3 space-y-2 rounded-lg border bg-background/60 p-3 shadow-sm backdrop-blur"
              >
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Task title..."
                  autoFocus
                  className="w-full rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <textarea
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="Details (optional)..."
                  rows={2}
                  className="w-full resize-none rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <select
                  value={newRecurring ?? ""}
                  onChange={(e) => setNewRecurring(e.target.value || null)}
                  className="w-full rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {RECURRING_OPTIONS.map((opt) => (
                    <option key={opt.label} value={opt.value ?? ""}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <UserSearchPicker
                  value={newAssignee}
                  onChange={setNewAssignee}
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseAddForm}
                    className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding || !newTitle.trim()}
                    className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {adding ? "Adding..." : "Add"}
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowInput(true)}
                className="mb-3 flex w-full items-center gap-2 rounded-lg border border-dashed bg-background/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                Add task
              </button>
            )}

            {/* Todo list */}
            {todos && todos.length > 0 ? (
              <div className="space-y-2">
                {/* Pending tasks */}
                {pendingTodos.slice(0, 6).map((todo) => {
                  const isOwner = todo.userId === userId;
                  const isExpanded = expandedId === todo.id;

                  return (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      isOwner={isOwner}
                      isExpanded={isExpanded}
                      onToggle={() => toggleComplete(todo.id, true)}
                      onDelete={() => deleteTodo(todo.id)}
                      onExpand={() =>
                        setExpandedId(isExpanded ? null : todo.id)
                      }
                    >
                      {/* Expanded edit form for owners */}
                      {isOwner ? (
                        <ExpandedEditForm
                          todo={todo}
                          onUpdateTitle={(title) =>
                            handleUpdateTodo(todo.id, { title })
                          }
                          onUpdateDetails={(details) =>
                            handleUpdateTodo(todo.id, { details })
                          }
                          onUpdateRecurring={(recurring) =>
                            handleUpdateTodo(todo.id, { recurring })
                          }
                          onAssign={(user) => assignTodo(todo.id, user)}
                          onDone={() => setExpandedId(null)}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {todo.details || "No details."}
                        </p>
                      )}
                    </TodoItem>
                  );
                })}
                {pendingTodos.length > 6 && (
                  <div className="text-center text-xs text-muted-foreground">
                    +{pendingTodos.length - 6} more
                  </div>
                )}

                {/* Completed section */}
                {completedTodos.length > 0 && (
                  <div className="mt-3 rounded-lg border bg-background/40">
                    <button
                      type="button"
                      onClick={() => setCompletedCollapsed(!completedCollapsed)}
                      className="flex w-full items-center justify-between px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <span className="flex items-center gap-2">
                        <CircleCheck className="h-4 w-4 text-emerald-500" />
                        Completed ({completedTodos.length})
                      </span>
                      <ChevronDown
                        className={[
                          "h-4 w-4 transition-transform",
                          completedCollapsed ? "" : "rotate-180",
                        ].join(" ")}
                      />
                    </button>

                    {!completedCollapsed && (
                      <div className="space-y-2 border-t px-3 py-2">
                        {completedTodos.slice(0, 5).map((todo) => (
                          <CompletedTodoItem
                            key={todo.id}
                            todo={todo}
                            isOwner={todo.userId === userId}
                            onUncomplete={() => toggleComplete(todo.id, false)}
                            onDelete={() => deleteTodo(todo.id)}
                          />
                        ))}
                        {completedTodos.length > 5 && (
                          <div className="text-center text-xs text-muted-foreground">
                            +{completedTodos.length - 5} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No tasks yet. Add one above!
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Expanded edit form sub-component
type ExpandedEditFormProps = {
  todo: Todo;
  onUpdateTitle: (title: string) => void;
  onUpdateDetails: (details: string | null) => void;
  onUpdateRecurring: (recurring: string | null) => void;
  onAssign: (user: UserInfo | null) => void;
  onDone: () => void;
};

function ExpandedEditForm({
  todo,
  onUpdateTitle,
  onUpdateDetails,
  onUpdateRecurring,
  onAssign,
  onDone,
}: ExpandedEditFormProps) {
  const [title, setTitle] = useState(todo.title);
  const [details, setDetails] = useState(todo.details ?? "");

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => onUpdateTitle(title)}
        placeholder="Task title..."
        className="w-full rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <textarea
        value={details}
        onChange={(e) => setDetails(e.target.value)}
        onBlur={() => onUpdateDetails(details || null)}
        placeholder="Details (optional)..."
        rows={2}
        className="w-full resize-none rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <select
        value={todo.recurring ?? ""}
        onChange={(e) => onUpdateRecurring(e.target.value || null)}
        className="w-full rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {RECURRING_OPTIONS.map((opt) => (
          <option key={opt.label} value={opt.value ?? ""}>
            {opt.label}
          </option>
        ))}
      </select>

      <UserSearchPicker value={todo.assignedTo} onChange={onAssign} />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onDone}
          className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
        >
          Done
        </button>
      </div>
    </div>
  );
}

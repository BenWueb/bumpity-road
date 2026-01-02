"use client";

import { authClient } from "@/lib/auth-client";
import { KANBAN_COLUMNS, RECURRING_OPTIONS } from "@/lib/todo-constants";
import { useTodos } from "@/hooks/use-todos";
import { Todo, UserInfo } from "@/types/todo";
import { RecurringBadge, UserSearchPicker } from "@/components/todos";
import {
  CheckSquare,
  ChevronDown,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";

type Props = {
  initialTodos?: Todo[];
};

export default function TodosKanban({ initialTodos }: Props) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  const {
    todos,
    setTodos,
    isLoading,
    addTodo,
    deleteTodo,
    updateStatus,
    updateTodo,
    getTodosByStatus,
  } = useTodos(userId);

  // Initialize with server data if provided
  useState(() => {
    if (initialTodos && initialTodos.length > 0) {
      setTodos(initialTodos);
    }
  });

  // Add/Edit task modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [addToColumn, setAddToColumn] = useState<string>("todo");
  const [newTitle, setNewTitle] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [newRecurring, setNewRecurring] = useState<string | null>(null);
  const [newAssignee, setNewAssignee] = useState<UserInfo | null>(null);
  const [adding, setAdding] = useState(false);

  // Drag state
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Mobile collapsed state - track which columns are expanded
  const [expandedColumns, setExpandedColumns] = useState<
    Record<string, boolean>
  >({
    todo: true,
    in_progress: true,
    done: false,
  });

  function toggleColumn(columnId: string) {
    setExpandedColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  }

  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on outside click
  const closeModal = useCallback(() => {
    setShowAddModal(false);
    setEditingTodo(null);
    setNewTitle("");
    setNewDetails("");
    setNewRecurring(null);
    setNewAssignee(null);
  }, []);

  useClickOutside(modalRef, closeModal, showAddModal);

  function openAddModal(columnId: string) {
    setAddToColumn(columnId);
    setEditingTodo(null);
    setNewTitle("");
    setNewDetails("");
    setNewRecurring(null);
    setNewAssignee(null);
    setShowAddModal(true);
  }

  function openEditModal(todo: Todo) {
    setEditingTodo(todo);
    setNewTitle(todo.title);
    setNewDetails(todo.details ?? "");
    setNewRecurring(todo.recurring);
    setNewAssignee(todo.assignedTo);
    setAddToColumn(todo.status);
    setShowAddModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || adding) return;

    setAdding(true);
    try {
      if (editingTodo) {
        await updateTodo({
          id: editingTodo.id,
          title: newTitle.trim(),
          details: newDetails.trim() || null,
          recurring: newRecurring,
          status: addToColumn,
          assignedToId: newAssignee?.id ?? null,
        });
      } else {
        await addTodo({
          title: newTitle.trim(),
          details: newDetails.trim() || null,
          recurring: newRecurring,
          status: addToColumn,
          assignedToId: newAssignee?.id ?? null,
        });
      }
      closeModal();
    } finally {
      setAdding(false);
    }
  }

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent, status: string) {
    e.preventDefault();
    if (draggingId) {
      updateStatus(draggingId, status);
    }
    setDraggingId(null);
  }

  const isLoggedIn = !!session?.user;
  const todosList = todos.length > 0 ? todos : initialTodos ?? [];
  const showLoading = isLoading && !initialTodos?.length;

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <div className="border-b bg-card/50">
        <div className="mx-auto max-w-6xl overflow-hidden px-3 py-3 md:px-6 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg md:h-12 md:w-12 md:rounded-xl">
                <CheckSquare className="h-4 w-4 md:h-6 md:w-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold md:text-2xl">Tasks</h1>
                <p className="hidden text-sm text-muted-foreground md:block">
                  Manage your to-do list
                </p>
              </div>
            </div>

            {isLoggedIn && (
              <button
                onClick={() => {
                  setAddToColumn("todo");
                  setShowAddModal(true);
                }}
                className="hidden items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 md:flex"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile action button */}
      {isLoggedIn && (
        <div className="border-b bg-card/30 px-3 py-2 md:hidden">
          <button
            onClick={() => {
              setAddToColumn("todo");
              setShowAddModal(true);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2 text-sm font-medium text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      )}

      <div className="mx-auto box-border w-full max-w-6xl px-3 py-3 md:px-6 md:py-6">
        {showLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-muted-foreground">Loading tasks...</div>
          </div>
        ) : (
          <>
            {/* Mobile: Stacked collapsible columns */}
            <div className="flex w-full flex-col gap-2 md:flex-row md:justify-center">
              {KANBAN_COLUMNS.map((col) => {
                const columnTodos = todosList.filter(
                  (t) => t.status === col.id
                );
                const Icon = col.icon;
                const isExpanded = expandedColumns[col.id];

                return (
                  <div
                    key={col.id}
                    className={`w-full overflow-hidden rounded-lg border border-t-4 bg-muted/30 ${col.color}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.id)}
                  >
                    <button
                      type="button"
                      onClick={() => toggleColumn(col.id)}
                      className="flex w-full items-center justify-between px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{col.label}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {columnTodos.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isLoggedIn && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              openAddModal(col.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.stopPropagation();
                                openAddModal(col.id);
                              }
                            }}
                            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
                      <div className="w-full space-y-1.5 border-t px-2 pb-2 pt-1.5">
                        {columnTodos.map((todo) => {
                          const isOwner = todo.userId === userId;
                          const canMove =
                            isLoggedIn &&
                            (isOwner || todo.assignedTo?.id === userId);

                          return (
                            <div
                              key={todo.id}
                              className={`group overflow-hidden rounded-lg border p-2.5 shadow-sm ${col.cardGradient}`}
                            >
                              <div className="flex items-start gap-2">
                                <div className="min-w-0 flex-1 overflow-hidden">
                                  <div className="truncate text-[13px] font-medium leading-tight">
                                    {todo.title}
                                  </div>
                                  {todo.details && (
                                    <p className="mt-1 text-[11px] leading-snug text-muted-foreground line-clamp-2">
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
                                        anchorDate={
                                          todo.dueDate ?? todo.createdAt
                                        }
                                      />
                                    </div>
                                  )}

                                  {/* Mobile status dropdown */}
                                  {canMove && (
                                    <div className="mt-1.5">
                                      <select
                                        value={todo.status}
                                        onChange={(e) =>
                                          updateStatus(todo.id, e.target.value)
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
                                      onClick={() => openEditModal(todo)}
                                      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                                      title="Edit task"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => deleteTodo(todo.id)}
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
                        })}

                        {columnTodos.length === 0 && (
                          <div className="flex h-12 items-center justify-center rounded-lg border-2 border-dashed text-xs text-muted-foreground">
                            No tasks
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Add/Edit task modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 md:p-4">
            <div
              ref={modalRef}
              className="w-full max-w-md rounded-lg border bg-background p-4 shadow-xl md:p-6"
            >
              <div className="mb-3 flex items-center justify-between md:mb-4">
                <h2 className="text-base font-semibold md:text-lg">
                  {editingTodo ? "Edit Task" : "Add Task"}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium md:text-sm">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Task title..."
                    autoFocus
                    className="w-full rounded-md border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring md:px-3 md:py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium md:text-sm">
                    Details
                  </label>
                  <textarea
                    value={newDetails}
                    onChange={(e) => setNewDetails(e.target.value)}
                    placeholder="Add details..."
                    rows={2}
                    className="w-full resize-none rounded-md border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring md:px-3 md:py-2 md:rows-3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium md:text-sm">
                      Column
                    </label>
                    <select
                      value={addToColumn}
                      onChange={(e) => setAddToColumn(e.target.value)}
                      className="w-full rounded-md border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring md:px-3 md:py-2 md:text-sm"
                    >
                      {KANBAN_COLUMNS.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium md:text-sm">
                      Repeat
                    </label>
                    <select
                      value={newRecurring ?? ""}
                      onChange={(e) => setNewRecurring(e.target.value || null)}
                      className="w-full rounded-md border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring md:px-3 md:py-2 md:text-sm"
                    >
                      {RECURRING_OPTIONS.map((opt) => (
                        <option key={opt.label} value={opt.value ?? ""}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium md:text-sm">
                    Assign to
                  </label>
                  <UserSearchPicker
                    value={newAssignee}
                    onChange={setNewAssignee}
                    placeholder="Select user (optional)"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1 md:pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent md:px-4 md:py-2 md:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding || !newTitle.trim()}
                    className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50 md:px-4 md:py-2 md:text-sm"
                  >
                    {adding
                      ? editingTodo
                        ? "Saving..."
                        : "Adding..."
                      : editingTodo
                      ? "Save"
                      : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { authClient } from "@/lib/auth-client";
import { KANBAN_COLUMNS, RECURRING_OPTIONS } from "@/lib/todo-constants";
import { useTodos } from "@/hooks/use-todos";
import { Todo, UserInfo } from "@/types/todo";
import { RecurringBadge, UserSearchPicker } from "@/components/todos";
import {
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

  if (isLoading && !initialTodos?.length) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show tasks to everyone - logged in users can add/edit their own

  const todosList = todos.length > 0 ? todos : initialTodos ?? [];

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
      </div>

      {/* Mobile: Stacked collapsible columns */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto md:hidden">
        {KANBAN_COLUMNS.map((col) => {
          const columnTodos = todosList.filter((t) => t.status === col.id);
          const Icon = col.icon;
          const isExpanded = expandedColumns[col.id];

          return (
            <div
              key={col.id}
              className={`rounded-lg border border-t-4 bg-muted/30 ${col.color}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <button
                type="button"
                onClick={() => toggleColumn(col.id)}
                className="flex w-full items-center justify-between px-4 py-3"
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
                <div className="space-y-2 border-t px-3 pb-3 pt-2">
                  {columnTodos.map((todo) => {
                    const isOwner = todo.userId === userId;
                    const canMove =
                      isLoggedIn && (isOwner || todo.assignedTo?.id === userId);

                    return (
                      <div
                        key={todo.id}
                        className={`group rounded-lg border p-3 shadow-sm ${col.cardGradient}`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium">
                              {todo.title}
                            </div>
                            {todo.details && (
                              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                {todo.details}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              {todo.recurring && (
                                <RecurringBadge
                                  recurring={todo.recurring}
                                  anchorDate={todo.dueDate ?? todo.createdAt}
                                />
                              )}
                              {todo.assignedTo && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                                  → {todo.assignedTo.name}
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground">
                                by {todo.user.name}
                              </span>
                              {todo.completedBy && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                  ✓ {todo.completedBy.name}
                                </span>
                              )}
                            </div>

                            {/* Mobile status dropdown */}
                            {canMove && (
                              <div className="mt-2">
                                <select
                                  value={todo.status}
                                  onChange={(e) =>
                                    updateStatus(todo.id, e.target.value)
                                  }
                                  className="w-full rounded-md border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
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
                            <div className="flex shrink-0 gap-1">
                              <button
                                type="button"
                                onClick={() => openEditModal(todo)}
                                className="text-muted-foreground hover:text-foreground"
                                title="Edit task"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteTodo(todo.id)}
                                className="text-muted-foreground hover:text-destructive"
                                title="Delete task"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {columnTodos.length === 0 && (
                    <div className="flex h-16 items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground">
                      No tasks
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop: Horizontal Kanban columns */}
      <div className="hidden flex-1 gap-4 overflow-x-auto pb-4 md:flex">
        {KANBAN_COLUMNS.map((col) => {
          const columnTodos = todosList.filter((t) => t.status === col.id);
          const Icon = col.icon;

          return (
            <div
              key={col.id}
              className={`flex w-80 shrink-0 flex-col rounded-lg border border-t-4 bg-muted/30 ${col.color}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{col.label}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {columnTodos.length}
                  </span>
                </div>
                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => openAddModal(col.id)}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {columnTodos.map((todo) => {
                  const isOwner = todo.userId === userId;
                  const canDrag =
                    isLoggedIn && (isOwner || todo.assignedTo?.id === userId);

                  return (
                    <div
                      key={todo.id}
                      draggable={canDrag}
                      onDragStart={(e) =>
                        canDrag && handleDragStart(e, todo.id)
                      }
                      className={`group rounded-lg border p-3 shadow-sm transition-shadow hover:shadow-md ${
                        col.cardGradient
                      } ${canDrag ? "cursor-grab" : ""} ${
                        draggingId === todo.id ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {canDrag && (
                          <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium">
                            {todo.title}
                          </div>
                          {todo.details && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                              {todo.details}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {todo.recurring && (
                              <RecurringBadge
                                recurring={todo.recurring}
                                anchorDate={todo.dueDate ?? todo.createdAt}
                              />
                            )}
                            {todo.assignedTo && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                                → {todo.assignedTo.name}
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              by {todo.user.name}
                            </span>
                            {todo.completedBy && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                ✓ {todo.completedBy.name}
                              </span>
                            )}
                          </div>
                        </div>
                        {isLoggedIn && isOwner && (
                          <div className="flex shrink-0 gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(todo)}
                              className="text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                              title="Edit task"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTodo(todo.id)}
                              className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                              title="Delete task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {columnTodos.length === 0 && (
                  <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit task modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            ref={modalRef}
            className="w-full max-w-md rounded-lg border bg-background p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingTodo ? "Edit Task" : "Add Task"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Task title..."
                  autoFocus
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Details
                </label>
                <textarea
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="Add details..."
                  rows={3}
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Column
                  </label>
                  <select
                    value={addToColumn}
                    onChange={(e) => setAddToColumn(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {KANBAN_COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Repeat
                  </label>
                  <select
                    value={newRecurring ?? ""}
                    onChange={(e) => setNewRecurring(e.target.value || null)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
                <label className="mb-1 block text-sm font-medium">
                  Assign to
                </label>
                <UserSearchPicker
                  value={newAssignee}
                  onChange={setNewAssignee}
                  placeholder="Select user (optional)"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding || !newTitle.trim()}
                  className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {adding
                    ? editingTodo
                      ? "Saving..."
                      : "Adding..."
                    : editingTodo
                    ? "Save Changes"
                    : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

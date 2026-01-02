"use client";

import { authClient } from "@/lib/auth-client";
import { KANBAN_COLUMNS } from "@/lib/todo-constants";
import { useTodos } from "@/hooks/use-todos";
import { Todo, TodoStatus } from "@/types/todo";
import { CheckSquare, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { KanbanColumn } from "@/components/todos/kanban/KanbanColumn";
import { TodoModal } from "@/components/todos/kanban/TodoModal";
import { PageHeader } from "@/components/PageHeader";

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
  } = useTodos(userId);

  // Hydrate with server data (avoid side-effects inside useState initializer)
  useEffect(() => {
    if (!initialTodos?.length) return;
    setTodos((prev) => (prev.length === 0 ? initialTodos : prev));
  }, [initialTodos, setTodos]);

  // Add/Edit task modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [addToColumn, setAddToColumn] = useState<TodoStatus>("todo");
  const [adding, setAdding] = useState(false);

  // Drag state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TodoStatus | null>(null);

  // Mobile collapsed state - track which columns are expanded
  const [expandedColumns, setExpandedColumns] = useState<
    Record<TodoStatus, boolean>
  >({
    todo: true,
    in_progress: true,
    done: true,
  });

  // Ensure defaults apply even during Fast Refresh (which can preserve state).
  useEffect(() => {
    setExpandedColumns({ todo: true, in_progress: true, done: true });
  }, []);

  function toggleColumn(columnId: TodoStatus) {
    setExpandedColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  }

  const closeModal = useCallback(() => {
    setShowAddModal(false);
    setEditingTodo(null);
  }, []);

  function openAddModal(columnId: TodoStatus) {
    setAddToColumn(columnId);
    setEditingTodo(null);
    setShowAddModal(true);
  }

  function openEditModal(todo: Todo) {
    setEditingTodo(todo);
    setAddToColumn(todo.status);
    setShowAddModal(true);
  }

  async function handleSubmit(data: {
    title: string;
    details: string | null;
    recurring: string | null;
    status: TodoStatus;
    assignedToId: string | null;
  }) {
    if (!data.title.trim() || adding) return;
    setAdding(true);
    try {
      if (editingTodo) {
        await updateTodo({
          id: editingTodo.id,
          title: data.title.trim(),
          details: data.details,
          recurring: data.recurring,
          status: data.status,
          assignedToId: data.assignedToId,
        });
      } else {
        await addTodo({
          title: data.title.trim(),
          details: data.details,
          recurring: data.recurring,
          status: data.status,
          assignedToId: data.assignedToId,
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
    // Helps some browsers (and gives us a fallback if local state is lost)
    try {
      e.dataTransfer.setData("text/plain", id);
    } catch {
      // no-op
    }
  }

  function handleDragOver(e: React.DragEvent, status: TodoStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStatus(status);
  }

  function handleDrop(e: React.DragEvent, status: TodoStatus) {
    e.preventDefault();
    const idFromData = (() => {
      try {
        return e.dataTransfer.getData("text/plain") || null;
      } catch {
        return null;
      }
    })();
    const id = draggingId ?? idFromData;
    if (id) {
      updateStatus(id, status);
    }
    setDraggingId(null);
    setDragOverStatus(null);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverStatus(null);
  }

  const isLoggedIn = !!session?.user;
  const todosList = todos.length > 0 ? todos : initialTodos ?? [];
  const showLoading = isLoading && !initialTodos?.length;

  return (
    <div className="min-h-screen w-full bg-background">
      <PageHeader
        title="Tasks"
        subtitle={<span className="hidden md:inline">Manage your to-do list</span>}
        icon={<CheckSquare className="h-4 w-4 md:h-6 md:w-6" />}
        iconWrapperClassName="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-sky-500 to-blue-600 text-white shadow-lg md:h-12 md:w-12 md:rounded-xl"
        innerClassName="mx-auto max-w-6xl overflow-hidden px-3 py-3 md:px-6 md:py-6"
        desktopAction={
          isLoggedIn ? (
            <button
              onClick={() => {
                setAddToColumn("todo");
                setShowAddModal(true);
              }}
              className="hidden items-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 md:flex"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          ) : null
        }
        mobileAction={
          isLoggedIn ? (
            <button
              onClick={() => {
                setAddToColumn("todo");
                setShowAddModal(true);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-3 py-2 text-sm font-medium text-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          ) : null
        }
        mobileActionClassName="border-b bg-card/30 px-3 py-2 md:hidden"
      />

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
                const isExpanded = expandedColumns[col.id];

                return (
                  <KanbanColumn
                    key={col.id}
                    col={col}
                    todos={columnTodos}
                    isExpanded={isExpanded}
                    isLoggedIn={isLoggedIn}
                    userId={userId}
                    draggingId={draggingId}
                    dragOverStatus={dragOverStatus}
                    onToggle={() => toggleColumn(col.id)}
                    onOpenAdd={() => openAddModal(col.id)}
                    onEditTodo={openEditModal}
                    onDeleteTodo={deleteTodo}
                    onUpdateStatus={updateStatus}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDrop={(e) => handleDrop(e, col.id)}
                    onDragLeave={() => {
                      // avoid flicker when moving between children
                      setDragOverStatus((prev) =>
                        prev === col.id ? null : prev
                      );
                    }}
                    onDragStartTodo={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                );
              })}
            </div>
          </>
        )}

        <TodoModal
          isOpen={showAddModal}
          isSubmitting={adding}
          editingTodo={editingTodo}
          defaultStatus={addToColumn}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

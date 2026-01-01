"use client";

import { Todo, TodoCreateInput, TodoUpdateInput, UserInfo } from "@/types/todo";
import { useCallback, useEffect, useState } from "react";

export function useTodos(userId: string | undefined) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/todos");
      if (!res.ok) throw new Error("Failed to load todos");
      const data = await res.json();
      setTodos(data.todos ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load todos");
      setTodos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadTodos();
    } else {
      setTodos([]);
      setIsLoading(false);
    }
  }, [userId, loadTodos]);

  const addTodo = useCallback(async (input: TodoCreateInput): Promise<Todo | null> => {
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTodos((prev) => [data.todo, ...prev]);
      return data.todo;
    } catch {
      return null;
    }
  }, []);

  const updateTodo = useCallback(async (input: TodoUpdateInput): Promise<Todo | null> => {
    const { id, ...updates } = input;

    // Optimistic update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );

    try {
      const res = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === id ? data.todo : t)));
      return data.todo;
    } catch {
      loadTodos(); // Revert on error
      return null;
    }
  }, [loadTodos]);

  const deleteTodo = useCallback(async (id: string): Promise<boolean> => {
    const prev = todos;
    setTodos((t) => t.filter((todo) => todo.id !== id));

    try {
      const res = await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
      return res.ok;
    } catch {
      setTodos(prev);
      return false;
    }
  }, [todos]);

  const toggleComplete = useCallback(async (id: string, completed: boolean): Promise<void> => {
    const status = completed ? "done" : "todo";

    // Optimistic update (without completedBy - will be set from server response)
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed, status } : t))
    );

    try {
      const res = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        const data = await res.json();
        // Update with server response to get completedBy info
        setTodos((prev) => prev.map((t) => (t.id === id ? data.todo : t)));
      }
    } catch {
      setTodos((prev) =>
        prev.map((t) =>
          t.id === id
            ? { ...t, completed: !completed, status: completed ? "todo" : "done" }
            : t
        )
      );
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: string): Promise<void> => {
    // Optimistic update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, completed: status === "done" } : t))
    );

    try {
      const res = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        const data = await res.json();
        // Update with server response to get completedBy info
        setTodos((prev) => prev.map((t) => (t.id === id ? data.todo : t)));
      }
    } catch {
      loadTodos();
    }
  }, [loadTodos]);

  const assignTodo = useCallback(async (todoId: string, user: UserInfo | null): Promise<void> => {
    setTodos((prev) =>
      prev.map((t) => (t.id === todoId ? { ...t, assignedTo: user } : t))
    );

    try {
      await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: todoId, assignedToId: user?.id ?? null }),
      });
    } catch {
      loadTodos();
    }
  }, [loadTodos]);

  // Derived state
  const pendingTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  const getTodosByStatus = useCallback(
    (status: string) => todos.filter((t) => t.status === status),
    [todos]
  );

  return {
    todos,
    setTodos,
    isLoading,
    error,
    loadTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    updateStatus,
    assignTodo,
    pendingTodos,
    completedTodos,
    getTodosByStatus,
  };
}


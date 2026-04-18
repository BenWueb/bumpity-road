import { prisma } from "@/utils/prisma";
import { unstable_cache } from "next/cache";
import { coerceTodoStatus, Todo } from "@/types/todo";

async function fetchAllTodos(): Promise<Todo[]> {
  const todos = await prisma.todo.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      user: { select: { id: true, name: true } },
      completedBy: { select: { id: true, name: true } },
    },
  });

  // Transform to match the Todo type
  return todos.map((t) => ({
    id: t.id,
    title: t.title,
    details: t.details,
    completed: t.completed,
    completedAt: t.completedAt?.toISOString() ?? null,
    status: coerceTodoStatus(t.status),
    recurring: t.recurring,
    dueDate: t.dueDate?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
    userId: t.userId,
    user: t.user,
    assignedTo: t.assignedTo,
    completedBy: t.completedBy,
  }));
}

export const TODOS_CACHE_TAG = "todos-all";

// Cached version - shared for all users. Invalidated explicitly by
// `revalidateTag(TODOS_CACHE_TAG)` from the /api/todos mutation handlers,
// with a 60-second time-based fallback.
const getCachedTodos = unstable_cache(
  () => fetchAllTodos(),
  ["todos-all"],
  {
    tags: [TODOS_CACHE_TAG],
    revalidate: 60,
  }
);

export async function getTodosServer(): Promise<Todo[]> {
  return getCachedTodos();
}

// Export for use in revalidation
export { fetchAllTodos };

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

// Cached version - shared for all users
const getCachedTodos = unstable_cache(
  () => fetchAllTodos(),
  ["todos-all"],
  {
    revalidate: 60, // Revalidate every 60 seconds
  }
);

export async function getTodosServer(): Promise<Todo[]> {
  return getCachedTodos();
}

// Export for use in revalidation
export { fetchAllTodos };

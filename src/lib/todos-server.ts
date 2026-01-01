import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { Todo } from "@/types/todo";

async function fetchTodosForUser(userId: string): Promise<Todo[]> {
  const todos = await prisma.todo.findMany({
    where: {
      OR: [{ userId }, { assignedToId: userId }],
    },
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
    status: t.status,
    recurring: t.recurring,
    dueDate: t.dueDate?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
    userId: t.userId,
    user: t.user,
    assignedTo: t.assignedTo,
    completedBy: t.completedBy,
  }));
}

// Cached version of fetchTodosForUser
function getCachedTodos(userId: string) {
  return unstable_cache(
    () => fetchTodosForUser(userId),
    [`todos-${userId}`],
    {
      revalidate: 60, // Revalidate every 60 seconds
    }
  )();
}

export async function getTodosServer(): Promise<Todo[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  if (!session?.user?.id) {
    return [];
  }

  return getCachedTodos(session.user.id);
}

// Export for use in revalidation
export { fetchTodosForUser };

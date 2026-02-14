import { prisma } from "@/utils/prisma";
import { unstable_cache } from "next/cache";
import { Expense } from "@/types/expense";

// Shared include for expense queries
const expenseInclude = {
  user: { select: { id: true, name: true } },
  comments: {
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" as const },
  },
  votes: {
    include: { user: { select: { id: true, name: true } } },
  },
};

// Transform a raw Prisma expense to our Expense type
function transformExpense(
  e: Awaited<ReturnType<typeof prisma.expense.findFirst>> & {
    comments: Array<{ id: string; content: string; expenseId: string; userId: string; user: { id: string; name: string }; createdAt: Date; updatedAt: Date }>;
    votes: Array<{ id: string; value: number; expenseId: string; userId: string; user: { id: string; name: string }; createdAt: Date }>;
    user: { id: string; name: string };
  },
  viewerUserId?: string
): Expense {
  const voteScore = e.votes.reduce((sum, v) => sum + v.value, 0);
  const userVote = viewerUserId
    ? e.votes.find((v) => v.userId === viewerUserId)?.value ?? null
    : null;

  return {
    id: e.id,
    title: e.title,
    description: e.description,
    cost: e.cost,
    date: e.date?.toISOString() ?? null,
    category: e.category as Expense["category"],
    subcategory: e.subcategory as Expense["subcategory"],
    isPlanned: e.isPlanned,
    checkNumber: e.checkNumber ?? null,
    isPaid: e.isPaid ?? true,
    receiptImageUrl: e.receiptImageUrl,
    receiptImagePublicId: e.receiptImagePublicId,
    userId: e.userId,
    user: e.user,
    comments: e.comments.map((c) => ({
      id: c.id,
      content: c.content,
      expenseId: c.expenseId,
      userId: c.userId,
      user: c.user,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    votes: e.votes.map((v) => ({
      id: v.id,
      value: v.value,
      expenseId: v.expenseId,
      userId: v.userId,
      user: v.user,
      createdAt: v.createdAt.toISOString(),
    })),
    voteScore,
    userVote,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

async function fetchAllExpenses(): Promise<Expense[]> {
  const expenses = await prisma.expense.findMany({
    orderBy: { createdAt: "desc" },
    include: expenseInclude,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return expenses.map((e: any) => transformExpense(e));
}

// Cached version - shared for all users
const getCachedExpenses = unstable_cache(
  () => fetchAllExpenses(),
  ["expenses-all"],
  {
    revalidate: 60,
  }
);

export async function getExpensesServer(): Promise<Expense[]> {
  return getCachedExpenses();
}

export { fetchAllExpenses, expenseInclude, transformExpense };

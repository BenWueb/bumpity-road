import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

function revalidateExpensesCache() {
  revalidatePath("/expenses");
}

async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { userId: session.user.id };
}

// POST: toggle or change a vote
// Body: { expenseId: string, value: 1 | -1 }
// If user already voted the same value, removes the vote (toggle off).
// If user voted the opposite, flips the vote.
export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck) return adminCheck.error;

  const body = await req.json();
  const { expenseId, value } = body as {
    expenseId?: string;
    value?: number;
  };

  if (!expenseId || (value !== 1 && value !== -1)) {
    return NextResponse.json({ error: "expenseId and value (1 or -1) required" }, { status: 400 });
  }

  // Verify expense exists
  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  // Check for existing vote
  const existingVote = await prisma.expenseVote.findUnique({
    where: {
      expenseId_userId: {
        expenseId,
        userId: adminCheck.userId,
      },
    },
  });

  let userVote: number | null = null;

  if (existingVote) {
    if (existingVote.value === value) {
      // Same vote — toggle off (remove)
      await prisma.expenseVote.delete({ where: { id: existingVote.id } });
      userVote = null;
    } else {
      // Different vote — flip
      await prisma.expenseVote.update({
        where: { id: existingVote.id },
        data: { value },
      });
      userVote = value;
    }
  } else {
    // New vote
    await prisma.expenseVote.create({
      data: {
        value,
        expenseId,
        userId: adminCheck.userId,
      },
    });
    userVote = value;
  }

  // Recalculate score
  const votes = await prisma.expenseVote.findMany({ where: { expenseId } });
  const voteScore = votes.reduce((sum: number, v: { value: number }) => sum + v.value, 0);

  revalidateExpensesCache();

  return NextResponse.json({ voteScore, userVote });
}

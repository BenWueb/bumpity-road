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

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck) return adminCheck.error;

  const body = await req.json();
  const { expenseId, content } = body as {
    expenseId?: string;
    content?: string;
  };

  if (!expenseId || !content?.trim()) {
    return NextResponse.json({ error: "Expense ID and content required" }, { status: 400 });
  }

  // Verify the expense exists
  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }

  const comment = await prisma.expenseComment.create({
    data: {
      content: content.trim(),
      expenseId,
      userId: adminCheck.userId,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  const transformed = {
    id: comment.id,
    content: comment.content,
    expenseId: comment.expenseId,
    userId: comment.userId,
    user: comment.user,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };

  revalidateExpensesCache();

  return NextResponse.json({ comment: transformed });
}

export async function DELETE(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck) return adminCheck.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Comment ID required" }, { status: 400 });
  }

  const existing = await prisma.expenseComment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.expenseComment.delete({ where: { id } });

  revalidateExpensesCache();

  return NextResponse.json({ success: true });
}

import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { expenseInclude, transformExpense } from "@/lib/expenses-server";
import { deleteCloudinaryImage } from "@/utils/cloudinary";

function revalidateExpensesCache() {
  revalidatePath("/");
  revalidatePath("/expenses");
  revalidatePath("/account");
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

export async function GET() {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck) return adminCheck.error;

  const expenses = await prisma.expense.findMany({
    orderBy: { createdAt: "desc" },
    include: expenseInclude,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformed = expenses.map((e: any) => transformExpense(e));

  return NextResponse.json({ expenses: transformed });
}

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck) return adminCheck.error;

  const body = await req.json();
  const {
    title,
    description,
    cost,
    date,
    category,
    subcategory,
    isPlanned,
    receiptImageUrl,
    receiptImagePublicId,
  } = body as {
    title?: string;
    description?: string;
    cost?: number;
    date?: string;
    category?: string;
    subcategory?: string | null;
    isPlanned?: boolean;
    receiptImageUrl?: string | null;
    receiptImagePublicId?: string | null;
  };

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  if (typeof cost !== "number" || cost < 0) {
    return NextResponse.json({ error: "Valid cost required" }, { status: 400 });
  }

  // Date is required for incurred expenses, optional for planned
  if (!isPlanned && !date) {
    return NextResponse.json({ error: "Date required for incurred expenses" }, { status: 400 });
  }

  const validCategories = ["maintenance", "utilities", "landscaping", "marine", "supplies", "tax_fees", "insurance", "improvements", "emergency", "other"];
  if (!category || !validCategories.includes(category)) {
    return NextResponse.json({ error: "Valid category required" }, { status: 400 });
  }

  const expense = await prisma.expense.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      cost,
      date: date ? new Date(date) : null,
      category,
      subcategory: subcategory || null,
      isPlanned: isPlanned || false,
      receiptImageUrl: receiptImageUrl || null,
      receiptImagePublicId: receiptImagePublicId || null,
      userId: adminCheck.userId,
    },
    include: expenseInclude,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformed = transformExpense(expense as any, adminCheck.userId);

  revalidateExpensesCache();

  return NextResponse.json({ expense: transformed });
}

export async function PATCH(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck) return adminCheck.error;

  const body = await req.json();
  const {
    id,
    title,
    description,
    cost,
    date,
    category,
    subcategory,
    isPlanned,
    receiptImageUrl,
    receiptImagePublicId,
    removeReceipt,
  } = body as {
    id?: string;
    title?: string;
    description?: string | null;
    cost?: number;
    date?: string | null;
    category?: string;
    subcategory?: string | null;
    isPlanned?: boolean;
    receiptImageUrl?: string | null;
    receiptImagePublicId?: string | null;
    removeReceipt?: boolean;
  };

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (title !== undefined && !title.trim()) {
    return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
  }

  if (cost !== undefined && (typeof cost !== "number" || cost < 0)) {
    return NextResponse.json({ error: "Valid cost required" }, { status: 400 });
  }

  const validCategories = ["maintenance", "utilities", "landscaping", "marine", "supplies", "tax_fees", "insurance", "improvements", "emergency", "other"];
  if (category !== undefined && !validCategories.includes(category)) {
    return NextResponse.json({ error: "Valid category required" }, { status: 400 });
  }

  // Handle receipt image deletion if requested
  if (removeReceipt && existing.receiptImagePublicId) {
    try {
      await deleteCloudinaryImage(existing.receiptImagePublicId);
    } catch (error) {
      // Log error but continue with expense update
      console.error("Error deleting receipt image from Cloudinary:", error);
    }
  }

  // If receipt is being updated, delete old receipt from Cloudinary
  if (
    receiptImagePublicId !== undefined &&
    receiptImagePublicId !== existing.receiptImagePublicId &&
    existing.receiptImagePublicId
  ) {
    try {
      await deleteCloudinaryImage(existing.receiptImagePublicId);
    } catch (error) {
      // Log error but continue with expense update
      console.error("Error deleting old receipt image from Cloudinary:", error);
    }
  }

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
      ...(cost !== undefined ? { cost } : {}),
      ...(date !== undefined ? { date: date ? new Date(date) : null } : {}),
      ...(category !== undefined ? { category } : {}),
      ...(subcategory !== undefined ? { subcategory: subcategory || null } : {}),
      ...(isPlanned !== undefined ? { isPlanned } : {}),
      ...(receiptImageUrl !== undefined ? { receiptImageUrl: receiptImageUrl || null } : {}),
      ...(receiptImagePublicId !== undefined
        ? { receiptImagePublicId: receiptImagePublicId || null }
        : {}),
      ...(removeReceipt ? { receiptImageUrl: null, receiptImagePublicId: null } : {}),
    },
    include: expenseInclude,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformed = transformExpense(expense as any, adminCheck.userId);

  revalidateExpensesCache();

  return NextResponse.json({ expense: transformed });
}

export async function DELETE(req: NextRequest) {
  const adminCheck = await requireAdmin();
  if ("error" in adminCheck) return adminCheck.error;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete receipt image from Cloudinary if it exists
  if (existing.receiptImagePublicId) {
    try {
      await deleteCloudinaryImage(existing.receiptImagePublicId);
    } catch (error) {
      // Log error but continue with expense deletion
      console.error("Error deleting receipt image from Cloudinary:", error);
    }
  }

  await prisma.expense.delete({ where: { id } });

  revalidateExpensesCache();

  return NextResponse.json({ success: true });
}

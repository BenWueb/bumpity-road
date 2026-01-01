import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Helper to revalidate todos cache for affected users
function revalidateTodosCache() {
  // Revalidate home page and todos page
  revalidatePath("/");
  revalidatePath("/todos");
  revalidatePath("/account");
}

export async function GET() {
  // Fetch ALL todos - the tasks board is viewable by everyone
  const todos = await prisma.todo.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      user: { select: { id: true, name: true } },
      completedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ todos });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, details, assignedToId, recurring, dueDate, status } = body as {
    title?: string;
    details?: string;
    assignedToId?: string;
    recurring?: string | null;
    dueDate?: string | null;
    status?: string;
  };

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const todo = await prisma.todo.create({
    data: {
      title: title.trim(),
      details: details?.trim() || null,
      userId: session.user.id,
      recurring: recurring || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: status || "todo",
      ...(assignedToId ? { assignedToId } : {}),
    },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      user: { select: { id: true, name: true } },
      completedBy: { select: { id: true, name: true } },
    },
  });

  // Revalidate cache
  revalidateTodosCache();

  return NextResponse.json({ todo });
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, completed, title, details, assignedToId, recurring, dueDate, status } =
    body as {
      id?: string;
      completed?: boolean;
      title?: string;
      details?: string | null;
      assignedToId?: string | null;
      recurring?: string | null;
      dueDate?: string | null;
      status?: string;
    };

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  // Verify ownership or assignment
  const existing = await prisma.todo.findUnique({ where: { id } });
  const isOwner = existing?.userId === session.user.id;
  const isAssignee = existing?.assignedToId === session.user.id;

  if (!existing || (!isOwner && !isAssignee)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Determine if task is being completed
  const isBeingCompleted =
    (typeof completed === "boolean" && completed && !existing.completed) ||
    (typeof status === "string" && status === "done" && existing.status !== "done");

  // Determine if task is being uncompleted
  const isBeingUncompleted =
    (typeof completed === "boolean" && !completed && existing.completed) ||
    (typeof status === "string" && status !== "done" && existing.status === "done");

  // Only owner can reassign, change title/details/recurring; assignee can toggle completed/status
  const todo = await prisma.todo.update({
    where: { id },
    data: {
      ...(typeof completed === "boolean" ? { completed } : {}),
      ...(typeof status === "string" ? { status, completed: status === "done" } : {}),
      ...(isOwner && typeof title === "string" ? { title: title.trim() } : {}),
      ...(isOwner && details !== undefined
        ? { details: details?.trim() || null }
        : {}),
      ...(isOwner && assignedToId !== undefined ? { assignedToId } : {}),
      ...(isOwner && recurring !== undefined ? { recurring } : {}),
      ...(isOwner && dueDate !== undefined
        ? { dueDate: dueDate ? new Date(dueDate) : null }
        : {}),
      // Track who completed the task
      ...(isBeingCompleted
        ? { completedById: session.user.id, completedAt: new Date() }
        : {}),
      ...(isBeingUncompleted
        ? { completedById: null, completedAt: null }
        : {}),
    },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      user: { select: { id: true, name: true } },
      completedBy: { select: { id: true, name: true } },
    },
  });

  // Revalidate cache
  revalidateTodosCache();

  return NextResponse.json({ todo });
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  // Verify ownership
  const existing = await prisma.todo.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.todo.delete({ where: { id } });

  // Revalidate cache
  revalidateTodosCache();

  return NextResponse.json({ success: true });
}

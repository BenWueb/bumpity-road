import { auth } from "@/utils/auth";
import { checkAndAwardFeedbackBadges } from "@/utils/badges";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  // Only bug admins can view all feedback
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isBugAdmin: true },
  });

  if (!user?.isBugAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ feedback });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, title, description } = body as {
    type?: string;
    title?: string;
    description?: string;
  };

  if (!type || !title?.trim() || !description?.trim()) {
    return NextResponse.json(
      { error: "Type, title, and description are required" },
      { status: 400 }
    );
  }

  if (!["bug", "feature"].includes(type)) {
    return NextResponse.json(
      { error: "Type must be 'bug' or 'feature'" },
      { status: 400 }
    );
  }

  // Get user if logged in (optional)
  let userId: string | null = null;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
      asResponse: false,
    });
    userId = session?.user?.id ?? null;
  } catch {
    // Not logged in, that's fine
  }

  const feedback = await prisma.feedback.create({
    data: {
      type,
      title: title.trim(),
      description: description.trim(),
      userId,
    },
  });

  // Check and award feedback badges if user is logged in
  let newBadges: string[] = [];
  if (userId) {
    newBadges = await checkAndAwardFeedbackBadges(userId);
  }

  return NextResponse.json({ feedback, newBadges });
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isBugAdmin: true },
  });

  if (!user?.isBugAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { id, status } = body as { id?: string; status?: string };

  if (!id || !status) {
    return NextResponse.json(
      { error: "ID and status are required" },
      { status: 400 }
    );
  }

  if (!["open", "in_progress", "resolved", "closed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const feedback = await prisma.feedback.update({
    where: { id },
    data: { status },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ feedback });
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isBugAdmin: true },
  });

  if (!user?.isBugAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  await prisma.feedback.delete({ where: { id } });

  return NextResponse.json({ success: true });
}


import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { deleteCloudinaryImage } from "@/utils/cloudinary";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { PUZZLE_SELECT, serializePuzzle } from "@/lib/puzzle-server";

export async function GET() {
  const entries = await prisma.puzzleEntry.findMany({
    orderBy: { createdAt: "desc" },
    select: PUZZLE_SELECT,
  });

  let isAdmin = false;
  let currentUserId: string | null = null;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
      asResponse: false,
    });
    if (session?.user?.id) {
      currentUserId = session.user.id;
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isAdmin: true },
      });
      isAdmin = user?.isAdmin ?? false;
    }
  } catch {
    // Not logged in
  }

  return NextResponse.json({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entries: (entries as any[]).map(serializePuzzle),
    isAdmin,
    currentUserId,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Sign in to add a puzzle" },
      { status: 401 },
    );
  }

  const body = await req.json();
  const { status, notes, imageUrl, imagePublicId, color } = body as {
    status?: string;
    notes?: string;
    imageUrl?: string;
    imagePublicId?: string;
    color?: string;
  };

  if (!imageUrl || !imagePublicId) {
    return NextResponse.json(
      { error: "An image is required" },
      { status: 400 },
    );
  }

  const normalizedStatus =
    status === "in_progress" ? "in_progress" : "completed";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });
  const userName = user?.name ?? "Anonymous";

  const now = new Date();

  const entry = await prisma.puzzleEntry.create({
    data: {
      status: normalizedStatus,
      completedAt: normalizedStatus === "completed" ? now : null,
      notes: notes?.trim() || null,
      imageUrl,
      imagePublicId,
      color: color || null,
      userId: session.user.id,
      contributions: {
        create: [
          {
            userId: session.user.id,
            userName,
          },
        ],
      },
    },
    select: PUZZLE_SELECT,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return NextResponse.json({ entry: serializePuzzle(entry as any) });
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
  const { id, notes, color } = body as {
    id?: string;
    notes?: string;
    color?: string | null;
  };

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const existing = await prisma.puzzleEntry.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Not found or unauthorized" },
      { status: 404 },
    );
  }

  const entry = await prisma.puzzleEntry.update({
    where: { id },
    data: {
      ...(notes !== undefined ? { notes: notes?.trim() || null } : {}),
      ...(color !== undefined ? { color } : {}),
    },
    select: PUZZLE_SELECT,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return NextResponse.json({ entry: serializePuzzle(entry as any) });
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
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const existing = await prisma.puzzleEntry.findUnique({
    where: { id },
    select: { userId: true, imagePublicId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });
  const isOwner = existing.userId === session.user.id;
  const isAdmin = user?.isAdmin ?? false;

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await deleteCloudinaryImage(existing.imagePublicId);
  await prisma.puzzleEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

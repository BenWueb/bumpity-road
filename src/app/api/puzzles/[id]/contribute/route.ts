import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { PUZZLE_SELECT, serializePuzzle } from "@/lib/puzzle-server";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Sign in to work on a puzzle" },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    markComplete?: boolean;
  };
  const markComplete = body.markComplete === true;

  const existing = await prisma.puzzleEntry.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
  }

  // Once a puzzle is completed it can no longer be worked on.
  if (existing.status === "completed") {
    return NextResponse.json(
      { error: "This puzzle is already complete" },
      { status: 409 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });
  const userName = user?.name ?? "Anonymous";

  // Idempotently add the contributor (no-op if they already joined).
  await prisma.puzzleContribution.upsert({
    where: {
      puzzleId_userId: { puzzleId: id, userId: session.user.id },
    },
    create: {
      puzzleId: id,
      userId: session.user.id,
      userName,
    },
    update: {
      // Refresh the snapshot of the user's name in case it changed.
      userName,
    },
  });

  if (markComplete) {
    await prisma.puzzleEntry.update({
      where: { id },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    });
  }

  const entry = await prisma.puzzleEntry.findUnique({
    where: { id },
    select: PUZZLE_SELECT,
  });

  if (!entry) {
    return NextResponse.json({ error: "Puzzle not found" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return NextResponse.json({ entry: serializePuzzle(entry as any) });
}

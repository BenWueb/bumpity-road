import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function GET() {
  const entries = await prisma.guestbookEntry.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      message: true,
      color: true,
      createdAt: true,
      // Don't expose ownerToken to clients
    },
  });

  // Check if current user is admin
  let isAdmin = false;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
      asResponse: false,
    });
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isAdmin: true },
      });
      isAdmin = user?.isAdmin ?? false;
    }
  } catch {
    // Not logged in, that's fine
  }

  return NextResponse.json({ entries, isAdmin });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, message, color } = body as {
    name?: string;
    message?: string;
    color?: string;
  };

  if (!name?.trim() || !message?.trim()) {
    return NextResponse.json(
      { error: "Name and message are required" },
      { status: 400 }
    );
  }

  const ownerToken = generateToken();

  const entry = await prisma.guestbookEntry.create({
    data: {
      name: name.trim(),
      message: message.trim(),
      color: color || null,
      ownerToken,
    },
    select: {
      id: true,
      name: true,
      message: true,
      color: true,
      createdAt: true,
    },
  });

  // Return the token so the client can store it
  return NextResponse.json({ entry, ownerToken });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, name, message, color, ownerToken } = body as {
    id?: string;
    name?: string;
    message?: string;
    color?: string | null;
    ownerToken?: string;
  };

  if (!id || !ownerToken) {
    return NextResponse.json(
      { error: "ID and ownerToken are required" },
      { status: 400 }
    );
  }

  // Verify ownership
  const existing = await prisma.guestbookEntry.findUnique({ where: { id } });
  if (!existing || existing.ownerToken !== ownerToken) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  const entry = await prisma.guestbookEntry.update({
    where: { id },
    data: {
      ...(name?.trim() ? { name: name.trim() } : {}),
      ...(message?.trim() ? { message: message.trim() } : {}),
      ...(color !== undefined ? { color } : {}),
    },
    select: {
      id: true,
      name: true,
      message: true,
      color: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ entry });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const ownerToken = searchParams.get("token");
  const adminDelete = searchParams.get("admin") === "true";

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  // Check if admin delete first (before fetching entry to avoid null token issue)
  if (adminDelete) {
    const session = await auth.api.getSession({
      headers: await headers(),
      asResponse: false,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Admin can delete - just check if entry exists
    const count = await prisma.guestbookEntry.count({ where: { id } });
    if (count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.guestbookEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  }

  // Owner delete - requires token match
  if (!ownerToken) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const existing = await prisma.guestbookEntry.findUnique({
    where: { id },
    select: { ownerToken: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!existing.ownerToken || existing.ownerToken !== ownerToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.guestbookEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

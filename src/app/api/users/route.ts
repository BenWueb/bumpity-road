import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const query = searchParams.get("q") ?? "";

  // If fetching a specific user by ID (for admin check etc.)
  if (id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isAdmin: true,
        isBugAdmin: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  }

  // Search users by name or email (include current user so you can assign to yourself)
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
    take: 10,
  });

  return NextResponse.json({ users });
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
  const { name, image } = body as { name?: string; image?: string | null };

  if (name !== undefined && !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (name === undefined && image === undefined) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(image !== undefined ? { image } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isBugAdmin: true,
      badges: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    user: {
      ...user,
      createdAt: user.createdAt.toISOString(),
    },
  });
}


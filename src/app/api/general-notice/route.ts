import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) return null;

  return session.user.id;
}

export async function GET() {
  const notice = await prisma.generalNotice.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ notice });
}

export async function POST(req: NextRequest) {
  const userId = await requireAdmin();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { message, enabled } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const existing = await prisma.generalNotice.findFirst();

  let notice;
  if (existing) {
    notice = await prisma.generalNotice.update({
      where: { id: existing.id },
      data: {
        message: message.trim(),
        enabled: enabled ?? true,
        updatedBy: userId,
      },
    });
  } else {
    notice = await prisma.generalNotice.create({
      data: {
        message: message.trim(),
        enabled: enabled ?? true,
        updatedBy: userId,
      },
    });
  }

  revalidateTag("general-notice", "max");

  return NextResponse.json({ notice });
}

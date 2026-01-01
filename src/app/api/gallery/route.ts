import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { deleteCloudinaryImage } from "@/utils/cloudinary";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  // Gallery is public - anyone can view
  const images = await prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ images });
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
  const {
    publicId,
    url,
    width,
    height,
    caption,
    description,
    photographerName,
    season,
    activity,
  } = body as {
    publicId?: string;
    url?: string;
    width?: number;
    height?: number;
    caption?: string;
    description?: string;
    photographerName?: string;
    season?: string;
    activity?: string;
  };

  if (!publicId || !url) {
    return NextResponse.json(
      { error: "publicId and url are required" },
      { status: 400 }
    );
  }

  const image = await prisma.galleryImage.create({
    data: {
      publicId,
      url,
      width: width ?? null,
      height: height ?? null,
      caption: caption?.trim() || null,
      description: description?.trim() || null,
      photographerName: photographerName?.trim() || null,
      season: season || null,
      activity: activity || null,
      userId: session.user.id,
    },
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ image });
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
  const existing = await prisma.galleryImage.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete from Cloudinary first
  await deleteCloudinaryImage(existing.publicId);

  // Then delete from database
  await prisma.galleryImage.delete({ where: { id } });

  return NextResponse.json({ success: true });
}

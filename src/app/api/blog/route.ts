import { auth } from "@/utils/auth";
import { checkAndAwardBlogBadges } from "@/utils/badges";
import { deleteCloudinaryImages } from "@/utils/cloudinary";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Date.now().toString(36)
  );
}

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true, image: true } },
      images: { select: { id: true, publicId: true, url: true, width: true, height: true } },
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json({ posts });
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
  const { title, content, images } = body as {
    title?: string;
    content?: string;
    images?: { publicId: string; url: string; width?: number; height?: number }[];
  };

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 }
    );
  }

  const slug = generateSlug(title);

  const post = await prisma.post.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      slug,
      userEmail: session.user.email,
      userId: session.user.id,
      images: images?.length
        ? {
            create: images.map((img) => ({
              publicId: img.publicId,
              url: img.url,
              width: img.width,
              height: img.height,
            })),
          }
        : undefined,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      images: { select: { id: true, publicId: true, url: true, width: true, height: true } },
      _count: { select: { comments: true } },
    },
  });

  // Check and award blog badges
  const newBadges = await checkAndAwardBlogBadges(session.user.id);

  revalidatePath("/blog");
  return NextResponse.json({ post, newBadges });
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
  const { id, title, content, addImages, removeImageIds } = body as {
    id?: string;
    title?: string;
    content?: string;
    addImages?: { publicId: string; url: string; width?: number; height?: number }[];
    removeImageIds?: string[];
  };

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const existing = await prisma.post.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only owner can edit
  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Remove images if specified
  if (removeImageIds && removeImageIds.length > 0) {
    // Get the publicIds before deleting
    const imagesToDelete = await prisma.postImage.findMany({
      where: {
        id: { in: removeImageIds },
        postId: id,
      },
      select: { publicId: true },
    });

    // Delete from Cloudinary
    const publicIds = imagesToDelete.map((img) => img.publicId);
    await deleteCloudinaryImages(publicIds);

    // Delete from database
    await prisma.postImage.deleteMany({
      where: {
        id: { in: removeImageIds },
        postId: id,
      },
    });
  }

  // Add new images if specified
  if (addImages && addImages.length > 0) {
    await prisma.postImage.createMany({
      data: addImages.map((img) => ({
        publicId: img.publicId,
        url: img.url,
        width: img.width,
        height: img.height,
        postId: id,
      })),
    });
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...(title?.trim() ? { title: title.trim() } : {}),
      ...(content?.trim() ? { content: content.trim() } : {}),
    },
    select: {
      id: true,
      title: true,
      content: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true, image: true } },
      images: { select: { id: true, publicId: true, url: true, width: true, height: true } },
      _count: { select: { comments: true } },
    },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  return NextResponse.json({ post });
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

  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check if user is owner or admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (post.userId !== session.user.id && !user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get all images associated with the post before deleting
  const images = await prisma.postImage.findMany({
    where: { postId: id },
    select: { publicId: true },
  });

  // Delete images from Cloudinary
  const publicIds = images.map((img) => img.publicId);
  await deleteCloudinaryImages(publicIds);

  // Delete the post (cascades to images in database)
  await prisma.post.delete({ where: { id } });

  revalidatePath("/blog");
  return NextResponse.json({ success: true });
}


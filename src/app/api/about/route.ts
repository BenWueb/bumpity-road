import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { deleteCloudinaryImage } from "@/utils/cloudinary";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const KEYS = {
  title: "aboutTitle",
  content: "aboutContent",
  heroUrl: "aboutHeroImageUrl",
  heroPublicId: "aboutHeroImagePublicId",
} as const;

function defaultAbout() {
  return {
    title: "About",
    content: "Coming soon...",
    heroImageUrl: null as string | null,
    heroImagePublicId: null as string | null,
    updatedAt: null as string | null,
  };
}

async function getCanEdit(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });
  if (!session?.user?.id) return false;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAboutAdmin: true },
  });

  return !!user?.isAboutAdmin;
}

export async function GET() {
  try {
    const [title, content, heroUrl, heroPublicId, canEdit] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: KEYS.title } }),
      prisma.siteSetting.findUnique({ where: { key: KEYS.content } }),
      prisma.siteSetting.findUnique({ where: { key: KEYS.heroUrl } }),
      prisma.siteSetting.findUnique({ where: { key: KEYS.heroPublicId } }),
      getCanEdit(),
    ]);

    const fallback = defaultAbout();

    const updatedAt =
      content?.updatedAt?.toISOString() ??
      title?.updatedAt?.toISOString() ??
      heroUrl?.updatedAt?.toISOString() ??
      null;

    return NextResponse.json({
      about: {
        title: title?.value || fallback.title,
        content: content?.value || fallback.content,
        heroImageUrl: heroUrl?.value || null,
        heroImagePublicId: heroPublicId?.value || null,
        updatedAt,
      },
      canEdit,
    });
  } catch (error) {
    console.error("Error fetching about:", error);
    return NextResponse.json(
      { error: "Failed to load about" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
      asResponse: false,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAboutAdmin: true },
    });

    if (!user?.isAboutAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as {
      title?: string;
      content?: string;
      heroImageUrl?: string | null;
      heroImagePublicId?: string | null;
    };

    const title = (body.title ?? "").trim();
    const content = (body.content ?? "").trim();
    const heroImageUrl = body.heroImageUrl ?? null;
    const heroImagePublicId = body.heroImagePublicId ?? null;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // If hero image changed, delete old one
    const existingHeroPublicId = await prisma.siteSetting.findUnique({
      where: { key: KEYS.heroPublicId },
    });
    if (
      existingHeroPublicId?.value &&
      heroImagePublicId &&
      heroImagePublicId !== existingHeroPublicId.value
    ) {
      await deleteCloudinaryImage(existingHeroPublicId.value);
    }

    await Promise.all([
      prisma.siteSetting.upsert({
        where: { key: KEYS.title },
        update: { value: title },
        create: { key: KEYS.title, value: title },
      }),
      prisma.siteSetting.upsert({
        where: { key: KEYS.content },
        update: { value: content },
        create: { key: KEYS.content, value: content },
      }),
      prisma.siteSetting.upsert({
        where: { key: KEYS.heroUrl },
        update: { value: heroImageUrl ?? "" },
        create: { key: KEYS.heroUrl, value: heroImageUrl ?? "" },
      }),
      prisma.siteSetting.upsert({
        where: { key: KEYS.heroPublicId },
        update: { value: heroImagePublicId ?? "" },
        create: { key: KEYS.heroPublicId, value: heroImagePublicId ?? "" },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating about:", error);
    return NextResponse.json(
      { error: "Failed to update about" },
      { status: 500 }
    );
  }
}

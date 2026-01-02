import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { deleteCloudinaryImage } from "@/utils/cloudinary";
import { checkAndAwardAdventureBadges } from "@/utils/badges";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET - fetch all adventures
export async function GET() {
  try {
    const adventures = await prisma.adventure.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json({ adventures });
  } catch (error) {
    console.error("Error fetching adventures:", error);
    return NextResponse.json(
      { error: "Failed to fetch adventures" },
      { status: 500 }
    );
  }
}

// POST - create a new adventure
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
      asResponse: false,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      address,
      season,
      seasons,
      category,
      headerImage,
      headerImagePublicId,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!description?.trim()) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    if (!address?.trim()) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const normalizedSeasons: string[] =
      Array.isArray(seasons) && seasons.length > 0
        ? seasons.filter((s) => typeof s === "string" && s.trim()).map((s) => s.trim())
        : typeof season === "string" && season.trim()
          ? [season.trim()]
          : [];

    if (normalizedSeasons.length === 0) {
      return NextResponse.json(
        { error: "At least one season is required" },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    if (!headerImage || !headerImagePublicId) {
      return NextResponse.json({ error: "Header image is required" }, { status: 400 });
    }

    const adventure = await prisma.adventure.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        address: address.trim(),
        // store multi-season; also keep legacy season for older UI/code paths
        seasons: normalizedSeasons,
        season: normalizedSeasons[0] ?? "all",
        category,
        headerImage,
        headerImagePublicId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    const newBadges = await checkAndAwardAdventureBadges(session.user.id);

    return NextResponse.json({ adventure, newBadges });
  } catch (error) {
    console.error("Error creating adventure:", error);
    return NextResponse.json(
      { error: "Failed to create adventure" },
      { status: 500 }
    );
  }
}

// PATCH - update an adventure
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
      asResponse: false,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      title,
      description,
      address,
      season,
      seasons,
      category,
      headerImage,
      headerImagePublicId,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.adventure.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // If header image changed, delete the old one from Cloudinary
    if (headerImagePublicId && headerImagePublicId !== existing.headerImagePublicId) {
      await deleteCloudinaryImage(existing.headerImagePublicId);
    }

    if (typeof address === "string" && !address.trim()) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const normalizedSeasons: string[] | null =
      Array.isArray(seasons)
        ? seasons
            .filter((s) => typeof s === "string" && s.trim())
            .map((s) => s.trim())
        : typeof season === "string" && season.trim()
          ? [season.trim()]
          : null;

    if (Array.isArray(seasons) && (normalizedSeasons ?? []).length === 0) {
      return NextResponse.json(
        { error: "At least one season is required" },
        { status: 400 }
      );
    }

    const adventure = await prisma.adventure.update({
      where: { id },
      data: {
        ...(title?.trim() ? { title: title.trim() } : {}),
        ...(description?.trim() ? { description: description.trim() } : {}),
        ...(typeof address === "string" && address.trim()
          ? { address: address.trim() }
          : {}),
        ...(normalizedSeasons ? { seasons: normalizedSeasons } : {}),
        ...(typeof season === "string" && season ? { season } : {}),
        ...(category ? { category } : {}),
        ...(headerImage ? { headerImage } : {}),
        ...(headerImagePublicId ? { headerImagePublicId } : {}),
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json({ adventure });
  } catch (error) {
    console.error("Error updating adventure:", error);
    return NextResponse.json(
      { error: "Failed to update adventure" },
      { status: 500 }
    );
  }
}

// DELETE - delete an adventure
export async function DELETE(req: NextRequest) {
  try {
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

    // Verify ownership or admin
    const existing = await prisma.adventure.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });

    if (existing.userId !== session.user.id && !user?.isAdmin) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Delete the header image from Cloudinary
    await deleteCloudinaryImage(existing.headerImagePublicId);

    await prisma.adventure.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting adventure:", error);
    return NextResponse.json(
      { error: "Failed to delete adventure" },
      { status: 500 }
    );
  }
}


import { auth } from "@/utils/auth";
import { checkAndAwardLoonBadges } from "@/utils/badges";
import { prisma } from "@/utils/prisma";
import { deleteCloudinaryImage } from "@/utils/cloudinary";
import { headers } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { LOON_STATS_CACHE_TAG } from "@/components/LoonDashboardCard";

// Invalidates the LoonDashboardCard stats cache (used on the home page) and
// refreshes pages that render loon data so updates show up immediately.
function revalidateLoonsCache() {
  revalidateTag(LOON_STATS_CACHE_TAG, "max");
  revalidatePath("/");
  revalidatePath("/loon");
  revalidatePath("/account");
}

const LOON_SELECT = {
  id: true,
  date: true,
  time: true,
  lakeName: true,
  lakeArea: true,
  latitude: true,
  longitude: true,
  adultsCount: true,
  pairedAdultsCount: true,
  unpairedAdultsCount: true,
  chicksCount: true,
  juvenilesCount: true,
  duration: true,
  loonIds: true,
  nestingActivity: true,
  behaviors: true,
  weather: true,
  windCondition: true,
  disturbance: true,
  notes: true,
  imageUrls: true,
  imagePublicIds: true,
  userId: true,
  user: { select: { id: true, name: true } },
  createdAt: true,
} as const;

export async function GET() {
  const observations = await prisma.loonObservation.findMany({
    orderBy: { date: "desc" },
    select: LOON_SELECT,
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

  return NextResponse.json({ observations, isAdmin, currentUserId });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Sign in to log an observation" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const {
    date,
    time,
    lakeName,
    lakeArea,
    latitude,
    longitude,
    adultsCount,
    pairedAdultsCount,
    unpairedAdultsCount,
    chicksCount,
    juvenilesCount,
    duration,
    loonIds,
    nestingActivity,
    behaviors,
    weather,
    windCondition,
    disturbance,
    notes,
    imageUrls,
    imagePublicIds,
  } = body;

  if (!lakeName?.trim()) {
    return NextResponse.json(
      { error: "Lake name is required" },
      { status: 400 }
    );
  }

  if (!date) {
    return NextResponse.json(
      { error: "Observation date is required" },
      { status: 400 }
    );
  }

  const parsedAdults = parseInt(adultsCount) || 0;
  const parsedPaired = pairedAdultsCount != null ? parseInt(pairedAdultsCount) || 0 : null;
  const parsedUnpaired = unpairedAdultsCount != null ? parseInt(unpairedAdultsCount) || 0 : null;
  if ((parsedPaired ?? 0) + (parsedUnpaired ?? 0) > parsedAdults) {
    return NextResponse.json(
      { error: "Paired + unpaired cannot exceed total adults" },
      { status: 400 }
    );
  }

  const observation = await prisma.loonObservation.create({
    data: {
      date: new Date(date),
      time: time?.trim() || null,
      lakeName: lakeName.trim(),
      lakeArea: lakeArea?.trim() || null,
      latitude: latitude != null ? parseFloat(latitude) : null,
      longitude: longitude != null ? parseFloat(longitude) : null,
      adultsCount: parsedAdults,
      pairedAdultsCount: parsedPaired,
      unpairedAdultsCount: parsedUnpaired,
      chicksCount: parseInt(chicksCount) || 0,
      juvenilesCount: parseInt(juvenilesCount) || 0,
      duration: duration != null ? parseInt(duration) || null : null,
      loonIds: Array.isArray(loonIds) ? loonIds.filter(Boolean) : [],
      nestingActivity: nestingActivity || null,
      behaviors: Array.isArray(behaviors) ? behaviors : [],
      weather: weather || null,
      windCondition: windCondition || null,
      disturbance: disturbance || null,
      notes: notes?.trim() || null,
      imageUrls: Array.isArray(imageUrls) ? imageUrls.filter(Boolean) : [],
      imagePublicIds: Array.isArray(imagePublicIds) ? imagePublicIds.filter(Boolean) : [],
      userId: session.user.id,
    },
    select: LOON_SELECT,
  });

  const newBadges = await checkAndAwardLoonBadges(session.user.id);

  revalidateLoonsCache();

  return NextResponse.json({ observation, newBadges });
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
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const existing = await prisma.loonObservation.findUnique({
    where: { id },
    select: {
      userId: true,
      imagePublicIds: true,
      adultsCount: true,
      pairedAdultsCount: true,
      unpairedAdultsCount: true,
    },
  });

  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Not found or unauthorized" },
      { status: 404 }
    );
  }

  // Clean up removed images from Cloudinary
  if (Array.isArray(updates.removedImagePublicIds)) {
    for (const publicId of updates.removedImagePublicIds) {
      if (publicId && existing.imagePublicIds.includes(publicId)) {
        await deleteCloudinaryImage(publicId);
      }
    }
  }

  const data: Record<string, unknown> = {};
  if (updates.date) data.date = new Date(updates.date);
  if (updates.time !== undefined) data.time = updates.time?.trim() || null;
  if (updates.lakeName?.trim()) data.lakeName = updates.lakeName.trim();
  if (updates.lakeArea !== undefined)
    data.lakeArea = updates.lakeArea?.trim() || null;
  if (updates.latitude !== undefined)
    data.latitude = updates.latitude != null ? parseFloat(updates.latitude) : null;
  if (updates.longitude !== undefined)
    data.longitude = updates.longitude != null ? parseFloat(updates.longitude) : null;
  if (updates.adultsCount !== undefined)
    data.adultsCount = parseInt(updates.adultsCount) || 0;
  if (updates.pairedAdultsCount !== undefined)
    data.pairedAdultsCount = updates.pairedAdultsCount != null ? parseInt(updates.pairedAdultsCount) || 0 : null;
  if (updates.unpairedAdultsCount !== undefined)
    data.unpairedAdultsCount = updates.unpairedAdultsCount != null ? parseInt(updates.unpairedAdultsCount) || 0 : null;
  if (updates.chicksCount !== undefined)
    data.chicksCount = parseInt(updates.chicksCount) || 0;
  if (updates.juvenilesCount !== undefined)
    data.juvenilesCount = parseInt(updates.juvenilesCount) || 0;
  if (updates.duration !== undefined)
    data.duration = updates.duration != null ? parseInt(updates.duration) || null : null;
  if (updates.loonIds !== undefined)
    data.loonIds = Array.isArray(updates.loonIds)
      ? updates.loonIds.filter(Boolean)
      : [];
  if (updates.nestingActivity !== undefined)
    data.nestingActivity = updates.nestingActivity || null;
  if (updates.behaviors !== undefined)
    data.behaviors = Array.isArray(updates.behaviors) ? updates.behaviors : [];
  if (updates.weather !== undefined) data.weather = updates.weather || null;
  if (updates.windCondition !== undefined)
    data.windCondition = updates.windCondition || null;
  if (updates.disturbance !== undefined)
    data.disturbance = updates.disturbance || null;
  if (updates.notes !== undefined) data.notes = updates.notes?.trim() || null;
  if (updates.imageUrls !== undefined)
    data.imageUrls = Array.isArray(updates.imageUrls) ? updates.imageUrls.filter(Boolean) : [];
  if (updates.imagePublicIds !== undefined)
    data.imagePublicIds = Array.isArray(updates.imagePublicIds) ? updates.imagePublicIds.filter(Boolean) : [];

  const finalAdults = (data.adultsCount as number | undefined) ?? existing.adultsCount;
  const finalPaired = data.pairedAdultsCount !== undefined
    ? (data.pairedAdultsCount as number | null)
    : existing.pairedAdultsCount;
  const finalUnpaired = data.unpairedAdultsCount !== undefined
    ? (data.unpairedAdultsCount as number | null)
    : existing.unpairedAdultsCount;
  if ((finalPaired ?? 0) + (finalUnpaired ?? 0) > finalAdults) {
    return NextResponse.json(
      { error: "Paired + unpaired cannot exceed total adults" },
      { status: 400 }
    );
  }

  const observation = await prisma.loonObservation.update({
    where: { id },
    data,
    select: LOON_SELECT,
  });

  revalidateLoonsCache();

  return NextResponse.json({ observation });
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

  const existing = await prisma.loonObservation.findUnique({
    where: { id },
    select: { userId: true, imagePublicIds: true },
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

  for (const publicId of existing.imagePublicIds) {
    if (publicId) await deleteCloudinaryImage(publicId);
  }

  await prisma.loonObservation.delete({ where: { id } });

  revalidateLoonsCache();

  return NextResponse.json({ success: true });
}

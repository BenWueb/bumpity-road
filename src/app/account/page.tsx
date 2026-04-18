import { Suspense } from "react";
import { auth } from "@/utils/auth";
import { checkAndAwardMembershipBadges } from "@/utils/badges";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AccountContent } from "./AccountContent";
import { coerceTodoStatus } from "@/types/todo";

// `headers()`/`getSession` already mark this route as dynamic implicitly,
// so we don't need an explicit `force-dynamic`. Removing it lets Next opt
// into PPR / streaming for the static parts of the response.

async function getAccountData() {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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

  if (!user) {
    redirect("/login");
  }

  // Check and award membership duration badges
  const newMembershipBadges = await checkAndAwardMembershipBadges(session.user.id);
  
  // If new badges were awarded, refresh user data to include them
  let updatedBadges = user.badges;
  if (newMembershipBadges.length > 0) {
    updatedBadges = [...user.badges, ...newMembershipBadges];
  }

  // Fetch todos, posts, adventures, gallery images, loon + fish observations in parallel
  const [todos, posts, adventures, galleryImages, loonObservations, fishObservations] = await Promise.all([
    prisma.todo.findMany({
      where: {
        OR: [{ userId: session.user.id }, { assignedToId: session.user.id }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        user: { select: { id: true, name: true, email: true } },
        completedBy: { select: { id: true, name: true } },
      },
    }),
    prisma.post.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        images: { take: 1, select: { url: true, publicId: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.adventure.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        address: true,
        category: true,
        seasons: true,
        season: true,
        headerImage: true,
        createdAt: true,
      },
    }),
    prisma.galleryImage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        publicId: true,
        url: true,
        width: true,
        height: true,
        caption: true,
        createdAt: true,
      },
    }),
    prisma.loonObservation.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      select: {
        id: true,
        date: true,
        lakeName: true,
        adultsCount: true,
        pairedAdultsCount: true,
        unpairedAdultsCount: true,
        chicksCount: true,
        juvenilesCount: true,
        duration: true,
        imageUrls: true,
        createdAt: true,
      },
    }),
    prisma.fishObservation.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      select: {
        id: true,
        date: true,
        lakeName: true,
        species: true,
        totalCount: true,
        imageUrls: true,
        createdAt: true,
      },
    }),
  ]);

  const formattedTodos = todos.map((t) => ({
    id: t.id,
    title: t.title,
    details: t.details,
    completed: t.completed,
    completedAt: t.completedAt?.toISOString() ?? null,
    status: coerceTodoStatus(t.status),
    recurring: t.recurring,
    dueDate: t.dueDate?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
    userId: t.userId,
    user: t.user,
    assignedTo: t.assignedTo,
    completedBy: t.completedBy,
  }));

  const formattedPosts = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    createdAt: p.createdAt.toISOString(),
    thumbnail: p.images[0]?.url ?? null,
    commentCount: p._count.comments,
  }));

  const formattedAdventures = adventures.map((a) => ({
    id: a.id,
    title: a.title,
    address: a.address,
    category: a.category,
    seasons: a.seasons,
    season: a.season ?? null,
    headerImage: a.headerImage,
    createdAt: a.createdAt.toISOString(),
  }));

  const formattedGalleryImages = galleryImages.map((img) => ({
    id: img.id,
    publicId: img.publicId,
    url: img.url,
    width: img.width,
    height: img.height,
    caption: img.caption,
    createdAt: img.createdAt.toISOString(),
  }));

  const formattedLoonObservations = loonObservations.map((obs) => ({
    id: obs.id,
    date: obs.date.toISOString(),
    lakeName: obs.lakeName,
    adultsCount: obs.adultsCount,
    pairedAdultsCount: obs.pairedAdultsCount,
    unpairedAdultsCount: obs.unpairedAdultsCount,
    chicksCount: obs.chicksCount,
    juvenilesCount: obs.juvenilesCount,
    duration: obs.duration,
    imageUrls: obs.imageUrls,
    createdAt: obs.createdAt.toISOString(),
  }));

  const formattedFishObservations = fishObservations.map((obs) => ({
    id: obs.id,
    date: obs.date.toISOString(),
    lakeName: obs.lakeName,
    species: obs.species,
    totalCount: obs.totalCount,
    imageUrls: obs.imageUrls,
    createdAt: obs.createdAt.toISOString(),
  }));

  // Fetch feedback if user is a bug admin
  let formattedFeedback: {
    id: string;
    type: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
    user: { id: string; name: string; email: string } | null;
  }[] = [];

  if (user.isBugAdmin) {
    const feedback = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    formattedFeedback = feedback.map((f) => ({
      id: f.id,
      type: f.type,
      title: f.title,
      description: f.description,
      status: f.status,
      createdAt: f.createdAt.toISOString(),
      user: f.user,
    }));
  }

  return {
    user: {
      ...user,
      badges: updatedBadges,
      createdAt: user.createdAt.toISOString(),
    },
    todos: formattedTodos,
    posts: formattedPosts,
    adventures: formattedAdventures,
    galleryImages: formattedGalleryImages,
    loonObservations: formattedLoonObservations,
    fishObservations: formattedFishObservations,
    feedback: formattedFeedback,
    newMembershipBadges,
  };
}

function AccountSkeleton() {
  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded-md bg-accent" />
          <div className="h-4 w-32 animate-pulse rounded-md bg-accent" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-48 animate-pulse rounded-xl border bg-accent" />
          <div className="h-48 animate-pulse rounded-xl border bg-accent" />
        </div>
        <div className="h-64 animate-pulse rounded-xl border bg-accent" />
      </div>
    </div>
  );
}

async function AccountData() {
  const data = await getAccountData();
  return (
    <AccountContent
      user={data.user}
      todos={data.todos}
      posts={data.posts}
      adventures={data.adventures}
      galleryImages={data.galleryImages}
      loonObservations={data.loonObservations}
      fishObservations={data.fishObservations}
      feedback={data.feedback}
      newMembershipBadges={data.newMembershipBadges}
    />
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountSkeleton />}>
      <AccountData />
    </Suspense>
  );
}

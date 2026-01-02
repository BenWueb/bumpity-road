"use client";

import { authClient } from "@/lib/auth-client";
import { KANBAN_COLUMNS } from "@/lib/todo-constants";
import { Todo } from "@/types/todo";
import { RecurringBadge } from "@/components/todos";
import {
  Camera,
  ListTodo,
  LogOut,
  NotebookPen,
  TentTree,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { emitBadgesEarned } from "@/utils/badges-client";
import { getBadgeInfo } from "@/lib/badge-definitions";
import type {
  AccountAdventure,
  AccountFeedback,
  AccountGalleryImage,
  AccountPost,
  AccountUser,
} from "@/types/account";
import { FeedbackAdminCard } from "@/components/account/FeedbackAdminCard";
import { ProfileCard } from "@/components/account/ProfileCard";
import { ActivityOverviewCard } from "@/components/account/ActivityOverviewCard";
import { TasksCard } from "@/components/account/TasksCard";
import { BlogPostsCard } from "@/components/account/BlogPostsCard";
import { AdventuresCard } from "@/components/account/AdventuresCard";
import { GalleryPhotosCard } from "@/components/account/GalleryPhotosCard";

type Props = {
  user: AccountUser;
  todos: Todo[];
  posts: AccountPost[];
  adventures: AccountAdventure[];
  galleryImages: AccountGalleryImage[];
  feedback: AccountFeedback[];
  newMembershipBadges?: string[];
};

const ACCOUNT_BADGE_OVERRIDES: Record<
  string,
  { name?: string; description?: string; icon?: string }
> = {
  // Historical copy used on the account page
  GUESTBOOK_SIGNER: { name: "Left a Mark" },
};

function getAccountBadgeInfo(badge: string) {
  const base = getBadgeInfo(badge);
  const o = ACCOUNT_BADGE_OVERRIDES[badge];
  return o ? { ...base, ...o } : base;
}

// Task badges in order from lowest to highest
const TASK_BADGE_HIERARCHY = [
  "TASK_ROOKIE",
  "TASK_WARRIOR",
  "TASK_MASTER",
  "TASK_LEGEND",
];

// Blog badges in order from lowest to highest
const BLOG_BADGE_HIERARCHY = [
  "BLOGGER_FIRST",
  "BLOGGER_CONTRIBUTOR",
  "BLOGGER_WRITER",
  "BLOGGER_AUTHOR",
];

// Feedback badges in order from lowest to highest
const FEEDBACK_BADGE_HIERARCHY = [
  "FEEDBACK_FIRST",
  "FEEDBACK_CONTRIBUTOR",
  "FEEDBACK_ADVOCATE",
  "FEEDBACK_CHAMPION",
];

// Membership badges in order from lowest to highest
const MEMBERSHIP_BADGE_HIERARCHY = [
  "MEMBER_1_YEAR",
  "MEMBER_2_YEARS",
  "MEMBER_3_YEARS",
  "MEMBER_5_YEARS",
  "MEMBER_10_YEARS",
];

// Non-hierarchical badges (always show if earned or as placeholder)
const STANDALONE_BADGES = ["OG", "GUESTBOOK_SIGNER", "ADVENTURER_FIRST"];

// Get all badges to display with earned status
function getBadgesForDisplay(
  earnedBadges: string[]
): { badge: string; earned: boolean }[] {
  const result: { badge: string; earned: boolean }[] = [];
  const earnedSet = new Set(earnedBadges);

  // Add standalone badges
  for (const badge of STANDALONE_BADGES) {
    result.push({ badge, earned: earnedSet.has(badge) });
  }

  // Add task badges - show highest earned OR next to earn
  let highestTaskIndex = -1;
  for (const badge of TASK_BADGE_HIERARCHY) {
    if (earnedSet.has(badge)) {
      highestTaskIndex = TASK_BADGE_HIERARCHY.indexOf(badge);
    }
  }
  // Show highest earned task badge
  if (highestTaskIndex >= 0) {
    result.push({
      badge: TASK_BADGE_HIERARCHY[highestTaskIndex],
      earned: true,
    });
  }
  // Show next task badge to earn (if any)
  const nextTaskIndex = highestTaskIndex + 1;
  if (nextTaskIndex < TASK_BADGE_HIERARCHY.length) {
    result.push({ badge: TASK_BADGE_HIERARCHY[nextTaskIndex], earned: false });
  }

  // Add blog badges - show highest earned OR next to earn
  let highestBlogIndex = -1;
  for (const badge of BLOG_BADGE_HIERARCHY) {
    if (earnedSet.has(badge)) {
      highestBlogIndex = BLOG_BADGE_HIERARCHY.indexOf(badge);
    }
  }
  // Show highest earned blog badge
  if (highestBlogIndex >= 0) {
    result.push({
      badge: BLOG_BADGE_HIERARCHY[highestBlogIndex],
      earned: true,
    });
  }
  // Show next blog badge to earn (if any)
  const nextBlogIndex = highestBlogIndex + 1;
  if (nextBlogIndex < BLOG_BADGE_HIERARCHY.length) {
    result.push({ badge: BLOG_BADGE_HIERARCHY[nextBlogIndex], earned: false });
  }

  // Add feedback badges - show highest earned OR next to earn
  let highestFeedbackIndex = -1;
  for (const badge of FEEDBACK_BADGE_HIERARCHY) {
    if (earnedSet.has(badge)) {
      highestFeedbackIndex = FEEDBACK_BADGE_HIERARCHY.indexOf(badge);
    }
  }
  // Show highest earned feedback badge
  if (highestFeedbackIndex >= 0) {
    result.push({
      badge: FEEDBACK_BADGE_HIERARCHY[highestFeedbackIndex],
      earned: true,
    });
  }
  // Show next feedback badge to earn (if any)
  const nextFeedbackIndex = highestFeedbackIndex + 1;
  if (nextFeedbackIndex < FEEDBACK_BADGE_HIERARCHY.length) {
    result.push({
      badge: FEEDBACK_BADGE_HIERARCHY[nextFeedbackIndex],
      earned: false,
    });
  }

  // Add membership badges - show highest earned OR next to earn
  let highestMembershipIndex = -1;
  for (const badge of MEMBERSHIP_BADGE_HIERARCHY) {
    if (earnedSet.has(badge)) {
      highestMembershipIndex = MEMBERSHIP_BADGE_HIERARCHY.indexOf(badge);
    }
  }
  // Show highest earned membership badge
  if (highestMembershipIndex >= 0) {
    result.push({
      badge: MEMBERSHIP_BADGE_HIERARCHY[highestMembershipIndex],
      earned: true,
    });
  }
  // Show next membership badge to earn (if any)
  const nextMembershipIndex = highestMembershipIndex + 1;
  if (nextMembershipIndex < MEMBERSHIP_BADGE_HIERARCHY.length) {
    result.push({
      badge: MEMBERSHIP_BADGE_HIERARCHY[nextMembershipIndex],
      earned: false,
    });
  }

  return result;
}

export function AccountContent({
  user,
  todos: initialTodos,
  posts,
  adventures,
  galleryImages,
  feedback: initialFeedback,
  newMembershipBadges,
}: Props) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [feedback, setFeedback] = useState(initialFeedback);
  // Initial display: collapsed regardless of item count (still user-toggleable)
  const [createdExpanded, setCreatedExpanded] = useState(false);
  const [assignedExpanded, setAssignedExpanded] = useState(false);

  // Emit badge event if new membership badges were awarded
  useEffect(() => {
    emitBadgesEarned(newMembershipBadges);
  }, [newMembershipBadges]);

  // Split todos into created by user and assigned to user
  const tasksCreated = initialTodos.filter((t) => t.userId === user.id);
  const tasksAssigned = initialTodos.filter(
    (t) => t.assignedTo?.id === user.id && t.userId !== user.id
  );

  const todosByStatus = {
    todo: initialTodos.filter((t) => t.status === "todo"),
    in_progress: initialTodos.filter((t) => t.status === "in_progress"),
    done: initialTodos.filter((t) => t.status === "done"),
  };

  const createdDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  async function handleUpdateFeedbackStatus(id: string, status: string) {
    const prev = feedback;
    setFeedback((f) =>
      f.map((item) => (item.id === id ? { ...item, status } : item))
    );

    try {
      const res = await fetch("/api/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        setFeedback(prev);
      }
    } catch {
      setFeedback(prev);
    }
  }

  async function handleDeleteFeedback(id: string) {
    if (!confirm("Delete this feedback?")) return;

    const prev = feedback;
    setFeedback((f) => f.filter((item) => item.id !== id));

    try {
      const res = await fetch(`/api/feedback?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        setFeedback(prev);
      }
    } catch {
      setFeedback(prev);
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold md:text-2xl">Account</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Manage your profile and view your tasks
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50 sm:w-auto"
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>

        {/* Badges */}
        <div>
          <div className="mb-2 text-center md:mb-3">
            <h2 className="text-sm font-semibold md:text-lg">Badges</h2>
            <p className="text-[10px] text-muted-foreground md:text-sm">
              {(user.badges ?? []).length} badge
              {(user.badges ?? []).length !== 1 ? "s" : ""} earned
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 md:gap-3">
            {getBadgesForDisplay(user.badges ?? []).map(({ badge, earned }) => {
              const info = getAccountBadgeInfo(badge);
              return earned ? (
                <div
                  key={badge}
                  className="group relative flex items-center gap-1 rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-2 py-1 text-xs font-medium text-white shadow-md transition-transform hover:scale-105 md:gap-2 md:px-4 md:py-2 md:text-sm"
                  title={info?.description}
                >
                  <span className="text-sm md:text-base">
                    {info?.icon || "🏅"}
                  </span>
                  <span>{info?.name || badge}</span>
                </div>
              ) : (
                <div
                  key={badge}
                  className="h-6 w-14 rounded-full border-2 border-dashed border-amber-300 bg-amber-50/30 dark:border-amber-700 dark:bg-amber-950/20 md:h-10 md:w-28"
                  title="Mystery badge - keep exploring!"
                />
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/todos"
            className="flex items-center justify-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            <ListTodo className="h-4 w-4 text-muted-foreground" />
            Go to Tasks
          </Link>
          <Link
            href="/add-blog-post"
            className="flex items-center justify-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            <NotebookPen className="h-4 w-4 text-muted-foreground" />
            New Blog Post
          </Link>
          <Link
            href="/gallery"
            className="flex items-center justify-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Camera className="h-4 w-4 text-muted-foreground" />
            Upload Photo
          </Link>
          <Link
            href="/adventures"
            className="flex items-center justify-center gap-2 rounded-xl border bg-background px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            <TentTree className="h-4 w-4 text-muted-foreground" />
            New Adventure
          </Link>
        </div>

        {/* Feedback (Bug Admin only) */}
        {user.isBugAdmin && (
          <FeedbackAdminCard
            feedback={feedback}
            onUpdateStatus={handleUpdateFeedbackStatus}
            onDelete={handleDeleteFeedback}
          />
        )}

        {/* User info cards */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          <ProfileCard user={user} createdDate={createdDate} />
          <ActivityOverviewCard
            postsCount={posts.length}
            adventuresCount={adventures.length}
            photosCount={galleryImages.length}
            todoCount={todosByStatus.todo.length}
            inProgressCount={todosByStatus.in_progress.length}
            doneCount={todosByStatus.done.length}
          />
        </div>

        {/* Tasks */}
        <TasksCard
          todos={initialTodos}
          tasksCreated={tasksCreated}
          tasksAssigned={tasksAssigned}
          createdExpanded={createdExpanded}
          assignedExpanded={assignedExpanded}
          onToggleCreated={() => setCreatedExpanded(!createdExpanded)}
          onToggleAssigned={() => setAssignedExpanded(!assignedExpanded)}
          userId={user.id}
        />

        {/* Blog Posts */}
        <BlogPostsCard posts={posts} />

        {/* Adventures */}
        <AdventuresCard adventures={adventures} />

        {/* Gallery Photos */}
        <GalleryPhotosCard galleryImages={galleryImages} />
      </div>
    </div>
  );
}

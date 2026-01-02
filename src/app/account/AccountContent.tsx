"use client";

import { authClient } from "@/lib/auth-client";
import { KANBAN_COLUMNS } from "@/lib/todo-constants";
import { Todo } from "@/types/todo";
import { RecurringBadge } from "@/components/todos";
import {
  Bug,
  Calendar,
  Camera,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  Lightbulb,
  ListTodo,
  LogOut,
  Mail,
  MessageCircle,
  MessageSquarePlus,
  NotebookPen,
  TentTree,
  Trash2,
  User,
  UserCheck,
} from "lucide-react";
import { CldImage } from "next-cloudinary";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { emitBadgesEarned } from "@/utils/badges-client";
import { getBadgeInfo } from "@/lib/badge-definitions";

type UserData = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isBugAdmin: boolean;
  badges?: string[] | null;
  createdAt: string;
};

type PostData = {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  thumbnail: string | null;
  commentCount: number;
};

type AdventureData = {
  id: string;
  title: string;
  address: string;
  category: string;
  seasons: string[];
  season: string | null;
  headerImage: string;
  createdAt: string;
};

type GalleryImageData = {
  id: string;
  publicId: string;
  url: string;
  width: number | null;
  height: number | null;
  caption: string | null;
  createdAt: string;
};

type FeedbackData = {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
};

type Props = {
  user: UserData;
  todos: Todo[];
  posts: PostData[];
  adventures: AdventureData[];
  galleryImages: GalleryImageData[];
  feedback: FeedbackData[];
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
  const [createdExpanded, setCreatedExpanded] = useState(true);
  const [assignedExpanded, setAssignedExpanded] = useState(true);

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
                  className="group relative flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1 text-xs font-medium text-white shadow-md transition-transform hover:scale-105 md:gap-2 md:px-4 md:py-2 md:text-sm"
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

        {/* User info cards */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          {/* Profile card */}
          <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50 via-background to-purple-50 dark:from-violet-950/30 dark:via-background dark:to-purple-950/20" />
            <div className="relative p-4 md:p-6">
              <div className="flex items-center gap-3  md:gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-gradient-to-br from-violet-100 to-purple-100 text-lg font-bold text-violet-600 dark:from-violet-900/50 dark:to-purple-900/50 dark:text-violet-300 md:h-16 md:w-16 md:text-2xl">
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-semibold md:text-xl">
                    {user.name}
                  </h2>
                  <div className="mt-1 space-y-0.5 md:mt-2 md:space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground md:text-sm">
                      <Mail className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground md:text-sm">
                      <Calendar className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" />
                      <span>Joined {createdDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats card */}
          <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-teal-50 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/20" />
            <div className="relative p-4 md:p-6">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
                <h3 className="text-sm font-semibold md:text-base">
                  Activity Overview
                </h3>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3  md:mt-4 md:gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 md:text-3xl">
                    {posts.length}
                  </div>
                  <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground md:mt-1 md:text-xs">
                    <NotebookPen className="h-3 w-3" />
                    Blog Posts
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 md:text-3xl">
                    {adventures.length}
                  </div>
                  <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground md:mt-1 md:text-xs">
                    <TentTree className="h-3 w-3" />
                    Adventures
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 md:text-3xl">
                    {galleryImages.length}
                  </div>
                  <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground md:mt-1 md:text-xs">
                    <Camera className="h-3 w-3" />
                    Photos
                  </div>
                </div>
              </div>
              <div className="mt-3 border-t pt-3 md:mt-4 md:pt-4">
                <div className="grid grid-cols-3 gap-1 md:gap-2">
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-600 dark:text-slate-400 md:text-xl">
                      {todosByStatus.todo.length}
                    </div>
                    <div className="mt-0.5 flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground md:gap-1 md:text-xs">
                      <Circle className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      To Do
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400 md:text-xl">
                      {todosByStatus.in_progress.length}
                    </div>
                    <div className="mt-0.5 flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground md:gap-1 md:text-xs">
                      <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      In Progress
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 md:text-xl">
                      {todosByStatus.done.length}
                    </div>
                    <div className="mt-0.5 flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground md:gap-1 md:text-xs">
                      <CheckCircle2 className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      Done
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-50 via-background to-gray-50 dark:from-slate-950/30 dark:via-background dark:to-gray-950/20" />
          <div className="relative">
            <div className="flex items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
              <h3 className="text-sm font-semibold md:text-base">Your Tasks</h3>
              <span className="text-xs text-muted-foreground md:text-sm">
                {initialTodos.length} total
              </span>
            </div>

            {initialTodos.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground md:px-6 md:py-8 md:text-base">
                <ListTodo className="mx-auto mb-2 h-6 w-6 opacity-50 md:h-8 md:w-8" />
                <p>No tasks yet.</p>
                <Link
                  href="/todos"
                  className="mt-3 inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
                >
                  Go to Tasks
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {/* Tasks You Created */}
                <div>
                  <button
                    type="button"
                    onClick={() => setCreatedExpanded(!createdExpanded)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-accent/50 md:px-6 md:py-3"
                  >
                    <div className="flex items-center gap-2">
                      <ListTodo className="h-3.5 w-3.5 text-muted-foreground md:h-4 md:w-4" />
                      <span className="text-xs font-medium md:text-sm">
                        Tasks You Created
                      </span>
                      <span className="text-[10px] text-muted-foreground md:text-xs">
                        ({tasksCreated.length})
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-muted-foreground transition-transform md:h-4 md:w-4 ${
                        createdExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {createdExpanded && (
                    <div className="border-t bg-background/50">
                      {tasksCreated.length === 0 ? (
                        <div className="px-4 py-3 text-center text-xs text-muted-foreground md:px-6 md:py-4 md:text-sm">
                          No tasks created yet
                        </div>
                      ) : (
                        <div className="divide-y">
                          {tasksCreated.slice(0, 10).map((todo) => (
                            <TaskRow
                              key={todo.id}
                              todo={todo}
                              userId={user.id}
                            />
                          ))}
                          {tasksCreated.length > 10 && (
                            <div className="px-4 py-1.5 text-center text-[10px] text-muted-foreground md:px-6 md:py-2 md:text-xs">
                              +{tasksCreated.length - 10} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tasks Assigned to You */}
                <div>
                  <button
                    type="button"
                    onClick={() => setAssignedExpanded(!assignedExpanded)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-accent/50 md:px-6 md:py-3"
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-3.5 w-3.5 text-muted-foreground md:h-4 md:w-4" />
                      <span className="text-xs font-medium md:text-sm">
                        Tasks Assigned to You
                      </span>
                      <span className="text-[10px] text-muted-foreground md:text-xs">
                        ({tasksAssigned.length})
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-muted-foreground transition-transform md:h-4 md:w-4 ${
                        assignedExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {assignedExpanded && (
                    <div className="border-t bg-background/50">
                      {tasksAssigned.length === 0 ? (
                        <div className="px-4 py-3 text-center text-xs text-muted-foreground md:px-6 md:py-4 md:text-sm">
                          No tasks assigned to you
                        </div>
                      ) : (
                        <div className="divide-y">
                          {tasksAssigned.slice(0, 10).map((todo) => (
                            <TaskRow
                              key={todo.id}
                              todo={todo}
                              userId={user.id}
                            />
                          ))}
                          {tasksAssigned.length > 10 && (
                            <div className="px-4 py-1.5 text-center text-[10px] text-muted-foreground md:px-6 md:py-2 md:text-xs">
                              +{tasksAssigned.length - 10} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Blog Posts */}
        <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50 via-background to-purple-50 dark:from-violet-950/30 dark:via-background dark:to-purple-950/20" />
          <div className="relative">
            <div className="flex items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
              <div className="flex items-center gap-2">
                <NotebookPen className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
                <h3 className="text-sm font-semibold md:text-base">
                  Your Blog Posts
                </h3>
              </div>
              <span className="text-xs text-muted-foreground md:text-sm">
                {posts.length} post{posts.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="divide-y">
              {posts.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground md:px-6 md:py-8 md:text-base">
                  <NotebookPen className="mx-auto mb-2 h-6 w-6 opacity-50 md:h-8 md:w-8" />
                  <p>No blog posts yet.</p>
                  <Link
                    href="/blog"
                    className="mt-3 inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
                  >
                    Write your first post
                  </Link>
                </div>
              ) : (
                posts.slice(0, 5).map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/50 md:gap-4 md:px-6 md:py-3"
                  >
                    {/* Thumbnail */}
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-accent md:h-12 md:w-12">
                      {post.thumbnail ? (
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground/50 md:text-lg">
                          📝
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium md:text-sm">
                        {post.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground md:gap-3 md:text-xs">
                        <span>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        {post.commentCount > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-2.5 w-2.5 md:h-3 md:w-3" />
                            {post.commentCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
              {posts.length > 5 && (
                <Link
                  href="/blog"
                  className="block px-4 py-2.5 text-center text-xs text-primary hover:underline md:px-6 md:py-3 md:text-sm"
                >
                  View all {posts.length} posts →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Adventures */}
        <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-teal-50 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/20" />
          <div className="relative">
            <div className="flex items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
              <div className="flex items-center gap-2">
                <TentTree className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
                <h3 className="text-sm font-semibold md:text-base">
                  Your Adventures
                </h3>
              </div>
              <span className="text-xs text-muted-foreground md:text-sm">
                {adventures.length} adventure
                {adventures.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="divide-y">
              {adventures.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground md:px-6 md:py-8 md:text-base">
                  <TentTree className="mx-auto mb-2 h-6 w-6 opacity-50 md:h-8 md:w-8" />
                  <p>No adventures yet.</p>
                  <Link
                    href="/adventures"
                    className="mt-3 inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
                  >
                    Create your first adventure
                  </Link>
                </div>
              ) : (
                adventures.slice(0, 5).map((a) => (
                  <Link
                    key={a.id}
                    href={`/adventures/${a.id}`}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/50 md:gap-4 md:px-6 md:py-3"
                  >
                    {/* Thumbnail */}
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-accent md:h-12 md:w-12">
                      <img
                        src={a.headerImage}
                        alt={a.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium md:text-sm">
                        {a.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground md:gap-3 md:text-xs">
                        <span className="truncate">{a.address}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="shrink-0">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
              {adventures.length > 5 && (
                <Link
                  href="/adventures"
                  className="block px-4 py-2.5 text-center text-xs text-primary hover:underline md:px-6 md:py-3 md:text-sm"
                >
                  View all {adventures.length} adventures →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Gallery Photos */}
        <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-50 via-background to-pink-50 dark:from-rose-950/30 dark:via-background dark:to-pink-950/20" />
          <div className="relative">
            <div className="flex items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
                <h3 className="text-sm font-semibold md:text-base">
                  Your Photos
                </h3>
              </div>
              <span className="text-xs text-muted-foreground md:text-sm">
                {galleryImages.length} photo
                {galleryImages.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="p-3 md:p-4">
              {galleryImages.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground md:py-8 md:text-base">
                  <Camera className="mx-auto mb-2 h-6 w-6 opacity-50 md:h-8 md:w-8" />
                  <p>No photos uploaded yet.</p>
                  <Link
                    href="/gallery"
                    className="mt-3 inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
                  >
                    Upload your first photo
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6 md:gap-2 lg:grid-cols-8">
                    {galleryImages.slice(0, 16).map((img) => (
                      <Link
                        key={img.id}
                        href="/gallery"
                        className="group aspect-square overflow-hidden rounded-lg bg-accent"
                      >
                        <CldImage
                          src={img.publicId}
                          width={100}
                          height={100}
                          alt={img.caption ?? "Gallery photo"}
                          crop="fill"
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                      </Link>
                    ))}
                  </div>
                  {galleryImages.length > 16 && (
                    <Link
                      href="/gallery"
                      className="mt-3 block text-center text-xs text-primary hover:underline md:mt-4 md:text-sm"
                    >
                      View all {galleryImages.length} photos →
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Feedback (Bug Admin only) */}
        {user.isBugAdmin && (
          <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-50 via-background to-orange-50 dark:from-amber-950/30 dark:via-background dark:to-orange-950/20" />
            <div className="relative">
              <div className="flex items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
                <div className="flex items-center gap-2">
                  <MessageSquarePlus className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
                  <h3 className="text-sm font-semibold md:text-base">
                    Feedback & Bug Reports
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground md:text-sm">
                  {feedback.length} item{feedback.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y">
                {feedback.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground md:px-6 md:py-8 md:text-base">
                    <MessageSquarePlus className="mx-auto mb-2 h-6 w-6 opacity-50 md:h-8 md:w-8" />
                    <p>No feedback submitted yet.</p>
                  </div>
                ) : (
                  feedback.map((item) => (
                    <div
                      key={item.id}
                      className="group px-4 py-3 md:px-6 md:py-4"
                    >
                      <div className="flex items-start gap-2 md:gap-3">
                        <div
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full md:h-8 md:w-8 ${
                            item.type === "bug"
                              ? "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
                              : "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400"
                          }`}
                        >
                          {item.type === "bug" ? (
                            <Bug className="h-3 w-3 md:h-4 md:w-4" />
                          ) : (
                            <Lightbulb className="h-3 w-3 md:h-4 md:w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h4 className="text-xs font-medium md:text-sm">
                                {item.title}
                              </h4>
                              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground md:gap-2 md:text-xs">
                                <span>{item.user?.name ?? "Anonymous"}</span>
                                <span>•</span>
                                <span>
                                  {new Date(
                                    item.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={item.status}
                                onChange={(e) =>
                                  handleUpdateFeedbackStatus(
                                    item.id,
                                    e.target.value
                                  )
                                }
                                className={`rounded-full border-0 px-2 py-0.5 text-[10px] font-medium focus:outline-none focus:ring-2 focus:ring-ring md:px-2 md:py-1 md:text-xs ${
                                  item.status === "resolved"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                    : item.status === "in_progress"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                                    : item.status === "closed"
                                    ? "bg-slate-100 text-slate-500 dark:bg-slate-900/40 dark:text-slate-400"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                }`}
                              >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                              </select>
                              <button
                                onClick={() => handleDeleteFeedback(item.id)}
                                className="rounded p-1 text-muted-foreground transition-opacity hover:bg-accent hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              </button>
                            </div>
                          </div>
                          <p className="mt-1.5 text-xs text-muted-foreground md:mt-2 md:text-sm">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Task row sub-component
function TaskRow({ todo, userId }: { todo: Todo; userId: string }) {
  const column = KANBAN_COLUMNS.find((c) => c.id === todo.status);
  const StatusIcon = column?.icon ?? Circle;
  const isOwner = todo.userId === userId;

  return (
    <div className="flex items-center gap-2 px-4 py-2 md:gap-4 md:px-6 md:py-3">
      <StatusIcon
        className={`h-4 w-4 shrink-0 md:h-5 md:w-5 ${
          todo.status === "done"
            ? "text-emerald-500"
            : todo.status === "in_progress"
            ? "text-blue-500"
            : "text-muted-foreground"
        }`}
      />
      <div className="min-w-0 flex-1">
        <div
          className={`truncate text-xs font-medium md:text-sm ${
            todo.completed ? "text-muted-foreground line-through" : ""
          }`}
        >
          {todo.title}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1 md:gap-2">
          {todo.assignedTo && (
            <span className="text-[10px] text-muted-foreground md:text-xs">
              → {todo.assignedTo.name}
            </span>
          )}
          {!isOwner && (
            <span className="text-[10px] text-muted-foreground md:text-xs">
              from {todo.user.name}
            </span>
          )}
          {todo.completedBy && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 md:text-xs">
              ✓ by {todo.completedBy.name}
              {todo.completedAt && (
                <span className="ml-1 text-muted-foreground">
                  {new Date(todo.completedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
            </span>
          )}
          {todo.recurring && (
            <RecurringBadge
              recurring={todo.recurring}
              anchorDate={todo.dueDate ?? todo.createdAt}
            />
          )}
        </div>
      </div>
      <div
        className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium sm:block md:text-xs ${
          todo.status === "done"
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
            : todo.status === "in_progress"
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
            : "bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
        }`}
      >
        {column?.label ?? todo.status}
      </div>
    </div>
  );
}

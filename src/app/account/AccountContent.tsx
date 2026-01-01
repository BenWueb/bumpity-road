"use client";

import { authClient } from "@/lib/auth-client";
import { useTodos } from "@/hooks/use-todos";
import { KANBAN_COLUMNS } from "@/lib/todo-constants";
import { Todo } from "@/types/todo";
import { RecurringBadge } from "@/components/todos";
import {
  Bug,
  Calendar,
  Camera,
  CheckCircle2,
  Circle,
  Clock,
  Lightbulb,
  ListTodo,
  LogOut,
  Mail,
  MessageCircle,
  MessageSquarePlus,
  NotebookPen,
  Trash2,
  User,
} from "lucide-react";
import { CldImage } from "next-cloudinary";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type UserData = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isBugAdmin: boolean;
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
  galleryImages: GalleryImageData[];
  feedback: FeedbackData[];
};

export function AccountContent({ user, todos: initialTodos, posts, galleryImages, feedback: initialFeedback }: Props) {
  const router = useRouter();
  const { todos, getTodosByStatus } = useTodos(user.id);
  const [loggingOut, setLoggingOut] = useState(false);
  const [feedback, setFeedback] = useState(initialFeedback);

  // Use client todos if available, otherwise use initial server data
  const todoList = todos.length > 0 ? todos : initialTodos;

  const todosByStatus = {
    todo: todoList.filter((t) => t.status === "todo"),
    in_progress: todoList.filter((t) => t.status === "in_progress"),
    done: todoList.filter((t) => t.status === "done"),
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
    setFeedback((f) => f.map((item) => (item.id === id ? { ...item, status } : item)));

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
    <div className="p-8">
      <div className="max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Account</h1>
            <p className="text-muted-foreground">
              Manage your profile and view your tasks
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>

        {/* User info cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile card */}
          <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50 via-background to-purple-50 dark:from-violet-950/30 dark:via-background dark:to-purple-950/20" />
            <div className="relative p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 bg-gradient-to-br from-violet-100 to-purple-100 text-2xl font-bold text-violet-600 dark:from-violet-900/50 dark:to-purple-900/50 dark:text-violet-300">
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-xl font-semibold">{user.name}</h2>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
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
            <div className="relative p-6">
              <div className="flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Activity Overview</h3>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">
                    {posts.length}
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <NotebookPen className="h-3 w-3" />
                    Blog Posts
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                    {galleryImages.length}
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Camera className="h-3 w-3" />
                    Photos
                  </div>
                </div>
              </div>
              <div className="mt-4 border-t pt-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="text-xl font-bold text-slate-600 dark:text-slate-400">
                      {todosByStatus.todo.length}
                    </div>
                    <div className="mt-0.5 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Circle className="h-3 w-3" />
                      To Do
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {todosByStatus.in_progress.length}
                    </div>
                    <div className="mt-0.5 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      In Progress
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {todosByStatus.done.length}
                    </div>
                    <div className="mt-0.5 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3" />
                      Done
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent tasks */}
        <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-50 via-background to-gray-50 dark:from-slate-950/30 dark:via-background dark:to-gray-950/20" />
          <div className="relative">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="font-semibold">Your Tasks</h3>
              <span className="text-sm text-muted-foreground">
                {todoList.length} total
              </span>
            </div>
            <div className="divide-y">
              {todoList.length === 0 ? (
                <div className="px-6 py-8 text-center text-muted-foreground">
                  No tasks yet. Create one from the home page or tasks page!
                </div>
              ) : (
                todoList.slice(0, 10).map((todo) => {
                  const column = KANBAN_COLUMNS.find((c) => c.id === todo.status);
                  const StatusIcon = column?.icon ?? Circle;
                  const isOwner = todo.userId === user.id;

                  return (
                    <div
                      key={todo.id}
                      className="flex items-center gap-4 px-6 py-3"
                    >
                      <StatusIcon
                        className={`h-5 w-5 shrink-0 ${
                          todo.status === "done"
                            ? "text-emerald-500"
                            : todo.status === "in_progress"
                              ? "text-blue-500"
                              : "text-muted-foreground"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div
                          className={`truncate text-sm font-medium ${
                            todo.completed ? "text-muted-foreground line-through" : ""
                          }`}
                        >
                          {todo.title}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          {todo.recurring && <RecurringBadge recurring={todo.recurring} anchorDate={todo.dueDate ?? todo.createdAt} />}
                          {todo.assignedTo && (
                            <span className="text-xs text-muted-foreground">
                              → {todo.assignedTo.name}
                            </span>
                          )}
                          {!isOwner && (
                            <span className="text-xs text-muted-foreground">
                              from {todo.user.name}
                            </span>
                          )}
                          {todo.completedBy && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400">
                              ✓ by {todo.completedBy.name}
                              {todo.completedAt && (
                                <span className="ml-1 text-muted-foreground">
                                  {new Date(todo.completedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
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
                })
              )}
              {todoList.length > 10 && (
                <div className="px-6 py-3 text-center text-sm text-muted-foreground">
                  +{todoList.length - 10} more tasks
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Blog Posts */}
        <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50 via-background to-purple-50 dark:from-violet-950/30 dark:via-background dark:to-purple-950/20" />
          <div className="relative">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <NotebookPen className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Your Blog Posts</h3>
              </div>
              <span className="text-sm text-muted-foreground">
                {posts.length} post{posts.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="divide-y">
              {posts.length === 0 ? (
                <div className="px-6 py-8 text-center text-muted-foreground">
                  <NotebookPen className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>No blog posts yet.</p>
                  <Link
                    href="/blog"
                    className="mt-2 inline-block text-sm text-primary hover:underline"
                  >
                    Write your first post →
                  </Link>
                </div>
              ) : (
                posts.slice(0, 5).map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="flex items-center gap-4 px-6 py-3 transition-colors hover:bg-accent/50"
                  >
                    {/* Thumbnail */}
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-accent">
                      {post.thumbnail ? (
                        <img
                          src={post.thumbnail}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg text-muted-foreground/50">
                          📝
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {post.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        {post.commentCount > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
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
                  className="block px-6 py-3 text-center text-sm text-primary hover:underline"
                >
                  View all {posts.length} posts →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Gallery Photos */}
        <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-50 via-background to-pink-50 dark:from-rose-950/30 dark:via-background dark:to-pink-950/20" />
          <div className="relative">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Your Photos</h3>
              </div>
              <span className="text-sm text-muted-foreground">
                {galleryImages.length} photo{galleryImages.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="p-4">
              {galleryImages.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Camera className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>No photos uploaded yet.</p>
                  <Link
                    href="/gallery"
                    className="mt-2 inline-block text-sm text-primary hover:underline"
                  >
                    Upload your first photo →
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
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
                      className="mt-4 block text-center text-sm text-primary hover:underline"
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
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div className="flex items-center gap-2">
                  <MessageSquarePlus className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Feedback & Bug Reports</h3>
                </div>
                <span className="text-sm text-muted-foreground">
                  {feedback.length} item{feedback.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y">
                {feedback.length === 0 ? (
                  <div className="px-6 py-8 text-center text-muted-foreground">
                    <MessageSquarePlus className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>No feedback submitted yet.</p>
                  </div>
                ) : (
                  feedback.map((item) => (
                    <div key={item.id} className="group px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            item.type === "bug"
                              ? "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
                              : "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400"
                          }`}
                        >
                          {item.type === "bug" ? (
                            <Bug className="h-4 w-4" />
                          ) : (
                            <Lightbulb className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-medium">{item.title}</h4>
                              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{item.user?.name ?? "Anonymous"}</span>
                                <span>•</span>
                                <span>
                                  {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={item.status}
                                onChange={(e) =>
                                  handleUpdateFeedbackStatus(item.id, e.target.value)
                                }
                                className={`rounded-full border-0 px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring ${
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
                                className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-destructive group-hover:opacity-100"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
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


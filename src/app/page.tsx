import Header from "@/components/Header";
import Calendar, { CalendarSkeleton } from "@/components/Calendar";
import WeatherCard, { WeatherCardSkeleton } from "@/components/WeatherCard";
import { TodoCardSkeleton } from "@/components/TodoCard";
import { TodoCardServer } from "@/components/TodoCardServer";
import { Suspense } from "react";
import Link from "next/link";
import { BookOpen, Camera, NotebookPen } from "lucide-react";

export default function Home() {
  return (
    <div className="p-8">
      <div className="flex flex-col gap-6">
        <Header />

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            href="/gallery"
            className="group relative flex h-24 items-center gap-4 overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-50 via-background to-pink-50 dark:from-rose-950/20 dark:via-background dark:to-pink-950/10" />
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 transition-transform group-hover:scale-110 dark:bg-rose-900/30 dark:text-rose-400">
              <Camera className="h-6 w-6" />
            </div>
            <div className="relative">
              <h3 className="font-semibold">Gallery</h3>
              <p className="text-sm text-muted-foreground">Share a photo</p>
            </div>
          </Link>

          <Link
            href="/guestbook"
            className="group relative flex h-24 items-center gap-4 overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-50 via-background to-orange-50 dark:from-amber-950/20 dark:via-background dark:to-orange-950/10" />
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 transition-transform group-hover:scale-110 dark:bg-amber-900/30 dark:text-amber-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="relative">
              <h3 className="font-semibold">Guestbook</h3>
              <p className="text-sm text-muted-foreground">Leave a message</p>
            </div>
          </Link>

          <Link
            href="/blog"
            className="group relative flex h-24 items-center gap-4 overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50 via-background to-purple-50 dark:from-violet-950/20 dark:via-background dark:to-purple-950/10" />
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 transition-transform group-hover:scale-110 dark:bg-violet-900/30 dark:text-violet-400">
              <NotebookPen className="h-6 w-6" />
            </div>
            <div className="relative">
              <h3 className="font-semibold">Blog</h3>
              <p className="text-sm text-muted-foreground">
                Read & write posts
              </p>
            </div>
          </Link>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Suspense fallback={<WeatherCardSkeleton />}>
            <WeatherCard />
          </Suspense>
          <Suspense fallback={<CalendarSkeleton />}>
            <Calendar />
          </Suspense>
          <Suspense fallback={<TodoCardSkeleton />}>
            <TodoCardServer />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

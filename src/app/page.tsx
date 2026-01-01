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
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:gap-6">
        <Header />

        {/* Quick Action Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <Link
            href="/gallery"
            className="group relative flex h-16 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border bg-card p-2 shadow-sm transition-all hover:shadow-md sm:h-24 sm:flex-row sm:gap-4 sm:p-5"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-50 via-background to-pink-50 dark:from-rose-950/20 dark:via-background dark:to-pink-950/10" />
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 transition-transform group-hover:scale-110 dark:bg-rose-900/30 dark:text-rose-400 sm:h-12 sm:w-12">
              <Camera className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div className="relative text-center sm:text-left">
              <h3 className="text-xs font-semibold sm:text-base">Gallery</h3>
              <p className="hidden text-sm text-muted-foreground sm:block">
                Share a photo
              </p>
            </div>
          </Link>

          <Link
            href="/guestbook"
            className="group relative flex h-16 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border bg-card p-2 shadow-sm transition-all hover:shadow-md sm:h-24 sm:flex-row sm:gap-4 sm:p-5"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-50 via-background to-orange-50 dark:from-amber-950/20 dark:via-background dark:to-orange-950/10" />
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 transition-transform group-hover:scale-110 dark:bg-amber-900/30 dark:text-amber-400 sm:h-12 sm:w-12">
              <BookOpen className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div className="relative text-center sm:text-left">
              <h3 className="text-xs font-semibold sm:text-base">Guestbook</h3>
              <p className="hidden text-sm text-muted-foreground sm:block">
                Leave a message
              </p>
            </div>
          </Link>

          <Link
            href="/blog"
            className="group relative flex h-16 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border bg-card p-2 shadow-sm transition-all hover:shadow-md sm:h-24 sm:flex-row sm:gap-4 sm:p-5"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50 via-background to-purple-50 dark:from-violet-950/20 dark:via-background dark:to-purple-950/10" />
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 transition-transform group-hover:scale-110 dark:bg-violet-900/30 dark:text-violet-400 sm:h-12 sm:w-12">
              <NotebookPen className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div className="relative text-center sm:text-left">
              <h3 className="text-xs font-semibold sm:text-base">Blog</h3>
              <p className="hidden text-sm text-muted-foreground sm:block">
                Read & write posts
              </p>
            </div>
          </Link>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
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

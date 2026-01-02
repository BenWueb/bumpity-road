import Header from "@/components/Header";
import Calendar, { CalendarSkeleton } from "@/components/Calendar";
import WeatherCard, { WeatherCardSkeleton } from "@/components/WeatherCard";
import { TodoCardSkeleton } from "@/components/TodoCard";
import { TodoCardServer } from "@/components/TodoCardServer";
import { Suspense } from "react";
import Link from "next/link";
import { BookOpen, Camera, NotebookPen, UtensilsCrossed } from "lucide-react";

export default function Home() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:gap-6">
        <Header />

        {/* Quick Action Cards */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <Link
            href="/gallery"
            className="group relative flex h-14 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border bg-card p-2 shadow-sm transition-all hover:shadow-md sm:h-20 sm:gap-1.5 md:h-24 lg:h-28 lg:flex-row lg:justify-start lg:gap-4 lg:p-5"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-50 via-background to-pink-50 dark:from-rose-950/20 dark:via-background dark:to-pink-950/10" />
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 transition-transform group-hover:scale-110 dark:bg-rose-900/30 dark:text-rose-400 sm:h-10 sm:w-10 lg:h-12 lg:w-12">
              <Camera className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            </div>
            <div className="relative hidden text-center sm:block lg:text-left">
              <h3 className="text-xs font-semibold sm:text-sm lg:text-base">
                Gallery
              </h3>
              <p className="hidden text-sm text-muted-foreground lg:block">
                Share a photo
              </p>
            </div>
          </Link>

          <Link
            href="/guestbook"
            className="group relative flex h-14 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border bg-card p-2 shadow-sm transition-all hover:shadow-md sm:h-20 sm:gap-1.5 md:h-24 lg:h-28 lg:flex-row lg:justify-start lg:gap-4 lg:p-5"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-50 via-background to-orange-50 dark:from-amber-950/20 dark:via-background dark:to-orange-950/10" />
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 transition-transform group-hover:scale-110 dark:bg-amber-900/30 dark:text-amber-400 sm:h-10 sm:w-10 lg:h-12 lg:w-12">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            </div>
            <div className="relative hidden text-center sm:block lg:text-left">
              <h3 className="text-xs font-semibold sm:text-sm lg:text-base">
                Guestbook
              </h3>
              <p className="hidden text-sm text-muted-foreground lg:block">
                Leave a message
              </p>
            </div>
          </Link>

          <Link
            href="/blog"
            className="group relative flex h-14 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border bg-card p-2 shadow-sm transition-all hover:shadow-md sm:h-20 sm:gap-1.5 md:h-24 lg:h-28 lg:flex-row lg:justify-start lg:gap-4 lg:p-5"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50 via-background to-purple-50 dark:from-violet-950/20 dark:via-background dark:to-purple-950/10" />
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 transition-transform group-hover:scale-110 dark:bg-violet-900/30 dark:text-violet-400 sm:h-10 sm:w-10 lg:h-12 lg:w-12">
              <NotebookPen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            </div>
            <div className="relative hidden text-center sm:block lg:text-left">
              <h3 className="text-xs font-semibold sm:text-sm lg:text-base">
                Blog
              </h3>
              <p className="hidden text-sm text-muted-foreground lg:block">
                Read & write posts
              </p>
            </div>
          </Link>

          <Link
            href="https://www.joanskitchen.app"
            target="_blank"
            className="group relative flex h-14 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border bg-card p-2 shadow-sm transition-all hover:shadow-md sm:h-20 sm:gap-1.5 md:h-24 lg:h-28 lg:flex-row lg:justify-start lg:gap-4 lg:p-5"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-teal-50 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/20" />
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition-transform group-hover:scale-110 dark:bg-emerald-900/30 dark:text-emerald-400 sm:h-10 sm:w-10 lg:h-12 lg:w-12">
              <UtensilsCrossed className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            </div>
            <div className="relative hidden text-center sm:block lg:text-left">
              <h3 className="text-xs font-semibold sm:text-sm lg:text-base">
                Recipes
              </h3>
              <p className="hidden text-sm text-muted-foreground lg:block">
                Browse recipes
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

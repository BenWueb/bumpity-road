import Header from "@/components/Header";
import Calendar, { CalendarSkeleton } from "@/components/Calendar";
import WeatherCard, { WeatherCardSkeleton } from "@/components/WeatherCard";
import { TodoCardSkeleton } from "@/components/TodoCard";
import { TodoCardServer } from "@/components/TodoCardServer";
import { Suspense } from "react";
import Link from "next/link";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";
import {
  BookOpen,
  Camera,
  Compass,
  NotebookPen,
  UtensilsCrossed,
} from "lucide-react";

export default function Home() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:gap-6">
        <Header />

        {/* Quick Action Cards */}
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-3 lg:gap-4 xl:grid-cols-5">
          <Link
            href="/gallery"
            className="group relative flex h-12 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border bg-card p-1.5 shadow-sm transition-all hover:shadow-md sm:h-20 sm:gap-1.5 md:h-20 md:flex-row md:justify-start md:gap-3 md:p-4 lg:h-24 lg:gap-4 lg:p-5 xl:h-28"
          >
            <div className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.rose}`} />
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 transition-transform group-hover:scale-110 dark:bg-rose-900/30 dark:text-rose-400 sm:h-10 sm:w-10 md:h-10 md:w-10 lg:h-11 lg:w-11 xl:h-12 xl:w-12">
              <Camera className="h-3.5 w-3.5 sm:h-5 sm:w-5 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
            </div>
            <div className="relative hidden text-center sm:block md:text-left">
              <h3 className="text-xs font-semibold sm:text-sm md:text-base">
                Gallery
              </h3>
              <p className="hidden text-sm text-muted-foreground lg:block">
                Share a photo
              </p>
            </div>
          </Link>

          <Link
            href="/adventures"
            className="group relative flex h-12 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border bg-card p-1.5 shadow-sm transition-all hover:shadow-md sm:h-20 sm:gap-1.5 md:h-20 md:flex-row md:justify-start md:gap-3 md:p-4 lg:h-24 lg:gap-4 lg:p-5 xl:h-28"
          >
            <div className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.sky}`} />
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700 transition-transform group-hover:scale-110 dark:bg-sky-900/30 dark:text-sky-300 sm:h-10 sm:w-10 md:h-10 md:w-10 lg:h-11 lg:w-11 xl:h-12 xl:w-12">
              <Compass className="h-3.5 w-3.5 sm:h-5 sm:w-5 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
            </div>
            <div className="relative hidden text-center sm:block md:text-left">
              <h3 className="text-xs font-semibold sm:text-sm md:text-base">
                Adventures
              </h3>
              <p className="hidden text-sm text-muted-foreground lg:block">
                Explore & share
              </p>
            </div>
          </Link>

          <Link
            href="/guestbook"
            className="group relative flex h-12 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border bg-card p-1.5 shadow-sm transition-all hover:shadow-md sm:h-20 sm:gap-1.5 md:h-20 md:flex-row md:justify-start md:gap-3 md:p-4 lg:h-24 lg:gap-4 lg:p-5 xl:h-28"
          >
            <div className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.amber}`} />
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 transition-transform group-hover:scale-110 dark:bg-amber-900/30 dark:text-amber-400 sm:h-10 sm:w-10 md:h-10 md:w-10 lg:h-11 lg:w-11 xl:h-12 xl:w-12">
              <BookOpen className="h-3.5 w-3.5 sm:h-5 sm:w-5 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
            </div>
            <div className="relative hidden text-center sm:block md:text-left">
              <h3 className="text-xs font-semibold sm:text-sm md:text-base">
                Guestbook
              </h3>
              <p className="hidden text-sm text-muted-foreground lg:block">
                Leave a message
              </p>
            </div>
          </Link>

          <Link
            href="/blog"
            className="group relative hidden h-14 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border bg-card p-2 shadow-sm transition-all hover:shadow-md sm:h-20 sm:gap-1.5 md:h-20 md:flex-row md:justify-start md:gap-3 md:p-4 lg:h-24 lg:gap-4 lg:p-5 xl:flex xl:h-28"
          >
            <div className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.violet}`} />
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600 transition-transform group-hover:scale-110 dark:bg-violet-900/30 dark:text-violet-400 sm:h-10 sm:w-10 md:h-10 md:w-10 lg:h-11 lg:w-11 xl:h-12 xl:w-12">
              <NotebookPen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
            </div>
            <div className="relative hidden text-center sm:block md:text-left">
              <h3 className="text-xs font-semibold sm:text-sm md:text-base">
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
            className="group relative flex h-12 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border bg-card p-1.5 shadow-sm transition-all hover:shadow-md sm:h-20 sm:gap-1.5 md:h-20 md:flex-row md:justify-start md:gap-3 md:p-4 lg:h-24 lg:gap-4 lg:p-5 xl:h-28"
          >
            <div className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.emerald}`} />
            <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition-transform group-hover:scale-110 dark:bg-emerald-900/30 dark:text-emerald-400 sm:h-10 sm:w-10 md:h-10 md:w-10 lg:h-11 lg:w-11 xl:h-12 xl:w-12">
              <UtensilsCrossed className="h-3.5 w-3.5 sm:h-5 sm:w-5 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
            </div>
            <div className="relative hidden text-center sm:block md:text-left">
              <h3 className="text-xs font-semibold sm:text-sm md:text-base">
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

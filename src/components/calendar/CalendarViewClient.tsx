"use client";

import dynamic from "next/dynamic";

// FullCalendar + its plugins are very large. Defer loading them until the
// page shell has painted, and skip SSR — the calendar is purely interactive
// and renders best client-side.
const CalendarView = dynamic(() => import("./CalendarView"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="h-7 w-48 animate-pulse rounded-md bg-accent" />
        <div className="flex gap-2">
          <div className="h-8 w-8 animate-pulse rounded-md bg-accent" />
          <div className="h-8 w-8 animate-pulse rounded-md bg-accent" />
          <div className="h-8 w-24 animate-pulse rounded-md bg-accent" />
        </div>
      </div>
      <div className="mt-4 h-[480px] w-full animate-pulse rounded-lg bg-accent" />
    </div>
  ),
});

export default CalendarView;

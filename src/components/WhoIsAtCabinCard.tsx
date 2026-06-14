"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Users } from "lucide-react";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";
import {
  formatEventDay,
  formatEventEndLabel,
  getActiveCabinEvents,
  getUpcomingCabinEvents,
  type CalendarEventLike,
} from "@/lib/calendar-utils";

function WhoIsAtCabinSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.emerald}`} />
      <div className="relative px-4 py-3 sm:px-5 sm:py-4">
        <div className="h-4 w-40 animate-pulse rounded-md bg-accent" />
        <div className="mt-2 h-3 w-56 animate-pulse rounded-md bg-accent" />
      </div>
    </div>
  );
}

export default function WhoIsAtCabinCard() {
  const [events, setEvents] = useState<CalendarEventLike[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError(null);
        const res = await fetch("/api/calendar?maxResults=20");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { events: CalendarEventLike[] };
        if (!cancelled) setEvents(data.events ?? []);
      } catch {
        if (!cancelled) {
          setEvents([]);
          setError("Could not load calendar.");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    if (!events) return null;

    const now = new Date();
    const active = getActiveCabinEvents(events, now);
    const upcoming = getUpcomingCabinEvents(events, now);

    if (active.length > 0) {
      const primary = active[0];
      const through = formatEventEndLabel(primary);
      const names = active.map((event) => event.summary).join(", ");
      return {
        mode: "active" as const,
        text: through
          ? `At the cabin: ${names} · through ${through}`
          : `At the cabin: ${names}`,
      };
    }

    if (upcoming.length > 0) {
      const next = upcoming[0];
      return {
        mode: "upcoming" as const,
        text: `No one scheduled now · Next: ${next.summary} (${formatEventDay(next.start)})`,
      };
    }

    return {
      mode: "empty" as const,
      text: "No cabin stays on the calendar right now.",
    };
  }, [events]);

  if (events === null) return <WhoIsAtCabinSkeleton />;

  return (
    <Link
      href="/calendar"
      className="group relative block overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.emerald}`} />
      <div className="relative flex items-start gap-3 px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background/60 text-emerald-700 shadow-sm backdrop-blur dark:text-emerald-300 sm:h-10 sm:w-10">
          <Users className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Who&apos;s at the cabin</p>
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            {error ?? summary?.text}
          </p>
        </div>
      </div>
    </Link>
  );
}

export { WhoIsAtCabinSkeleton };

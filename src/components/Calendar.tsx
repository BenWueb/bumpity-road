"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type CalendarEvent = {
  id: string;
  summary: string;
  start: string | null;
  end: string | null;
  location: string | null;
  htmlLink: string | null;
};

function formatWhen(isoOrDate: string | null) {
  if (!isoOrDate) return "—";

  // All-day events come back as YYYY-MM-DD (no timezone).
  const isAllDay = /^\d{4}-\d{2}-\d{2}$/.test(isoOrDate);
  const d = isAllDay ? new Date(`${isoOrDate}T00:00:00`) : new Date(isoOrDate);

  if (Number.isNaN(d.getTime())) return "—";

  if (isAllDay) {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(d);
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function CalendarSkeleton() {
  return (
    <div className="relative w-full  overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50 via-background to-indigo-50 dark:from-sky-950/30 dark:via-background dark:to-indigo-950/20" />
      <div className="relative px-6 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="h-5 w-32 animate-pulse rounded-md bg-accent" />
            <div className="mt-2 h-4 w-40 animate-pulse rounded-md bg-accent" />
          </div>
          <div className="h-9 w-9 animate-pulse rounded-md bg-accent" />
        </div>
      </div>
      <div className="relative space-y-3 px-6 pb-6 pt-4">
        <div className="h-10 w-full animate-pulse rounded-lg bg-accent" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-accent" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-accent" />
      </div>
    </div>
  );
}

const Calendar = () => {
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError(null);
        const res = await fetch("/api/calendar?maxResults=8");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as { events: CalendarEvent[] };
        if (!cancelled) setEvents(data.events ?? []);
      } catch {
        if (!cancelled) {
          setEvents([]);
          setError("Failed to load calendar.");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const content = useMemo(() => {
    if (events === null) return <CalendarSkeleton />;

    return (
      <div className="relative w-full  overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-50 via-background to-indigo-50 dark:from-sky-950/30 dark:via-background dark:to-indigo-950/20" />

        <div className="relative px-6 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="truncate text-base font-semibold leading-none">
                Calendar
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Upcoming events
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background/60 shadow-sm backdrop-blur">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="relative px-6 pb-6 pt-4">
          {error ? (
            <div className="text-sm text-muted-foreground">{error}</div>
          ) : events.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No upcoming events.
            </div>
          ) : (
            <div className="space-y-2">
              {events.slice(0, 6).map((e) => (
                <div
                  key={e.id}
                  className="rounded-lg border bg-background/60 px-3 py-2 shadow-sm backdrop-blur"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {e.summary}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {formatWhen(e.start)}
                      </div>
                    </div>
                    {e.location ? (
                      <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="max-w-[9rem] truncate">
                          {e.location}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }, [events, error]);

  return content;
};

export default Calendar;

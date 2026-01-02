"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";

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
      <div className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.sky}`} />
      <div className="relative px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="h-4 w-24 animate-pulse rounded-md bg-accent sm:h-5 sm:w-32" />
            <div className="mt-2 h-3 w-32 animate-pulse rounded-md bg-accent sm:h-4 sm:w-40" />
          </div>
          <div className="h-8 w-8 animate-pulse rounded-md bg-accent sm:h-9 sm:w-9" />
        </div>
      </div>
      <div className="relative space-y-2 px-4 pb-4 pt-3 sm:space-y-3 sm:px-6 sm:pb-6 sm:pt-4">
        <div className="h-10 w-full animate-pulse rounded-lg bg-accent" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-accent" />
        <div className="hidden h-10 w-full animate-pulse rounded-lg bg-accent sm:block" />
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
        <div className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.sky}`} />

        <div className="relative px-4 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold leading-none sm:text-base md:text-lg">
                Calendar
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Upcoming events
              </div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background/60 shadow-sm backdrop-blur sm:h-9 sm:w-9">
              <CalendarDays className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
            </div>
          </div>
        </div>

        <div className="relative px-4 pb-4 pt-3 sm:px-6 sm:pb-6 sm:pt-4">
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

"use client";

import { useCallback, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { DatesSetArg, EventClickArg } from "@fullcalendar/core";
import type { EventInput } from "@fullcalendar/core";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Clock,
  LayoutGrid,
} from "lucide-react";

type ApiEvent = {
  id: string;
  summary: string;
  start: string | null;
  end: string | null;
  location: string | null;
  htmlLink: string | null;
};

type ViewType = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listYear";

const VIEW_OPTIONS: { value: ViewType; label: string; icon: React.ReactNode }[] = [
  { value: "listYear", label: "All", icon: <List className="h-4 w-4" /> },
  { value: "dayGridMonth", label: "Month", icon: <LayoutGrid className="h-4 w-4" /> },
  { value: "timeGridWeek", label: "Week", icon: <CalendarIcon className="h-4 w-4" /> },
  { value: "timeGridDay", label: "Day", icon: <Clock className="h-4 w-4" /> },
];

export default function CalendarView() {
  const calendarRef = useRef<FullCalendar>(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [activeView, setActiveView] = useState<ViewType>("listYear");
  const eventCache = useRef<Map<string, EventInput[]>>(new Map());

  const fetchEvents = useCallback(
    async (
      info: { startStr: string; endStr: string },
      successCallback: (events: EventInput[]) => void,
      failureCallback: (error: Error) => void
    ) => {
      const rangeKey = `${info.startStr}_${info.endStr}`;
      const cached = eventCache.current.get(rangeKey);
      if (cached) {
        successCallback(cached);
        return;
      }

      try {
        const params = new URLSearchParams({
          timeMin: info.startStr,
          timeMax: info.endStr,
          maxResults: "250",
        });
        const res = await fetch(`/api/calendar?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as { events: ApiEvent[] };

        const events: EventInput[] = data.events.map((e) => {
          const isAllDay = e.start ? /^\d{4}-\d{2}-\d{2}$/.test(e.start) : false;
          return {
            id: e.id,
            title: e.summary,
            start: e.start ?? undefined,
            end: e.end ?? undefined,
            allDay: isAllDay,
            extendedProps: {
              location: e.location,
              htmlLink: e.htmlLink,
            },
          };
        });

        eventCache.current.set(rangeKey, events);
        successCallback(events);
      } catch (err) {
        failureCallback(err instanceof Error ? err : new Error(String(err)));
      }
    },
    []
  );

  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    setCurrentTitle(arg.view.title);
    setActiveView(arg.view.type as ViewType);
  }, []);

  const handleEventClick = useCallback((info: EventClickArg) => {
    const link = info.event.extendedProps.htmlLink;
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  }, []);

  const goToday = () => calendarRef.current?.getApi().today();
  const goPrev = () => calendarRef.current?.getApi().prev();
  const goNext = () => calendarRef.current?.getApi().next();
  const changeView = (view: ViewType) => {
    calendarRef.current?.getApi().changeView(view);
    setActiveView(view);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background shadow-sm transition-colors hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-background shadow-sm transition-colors hover:bg-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="rounded-lg border bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
          >
            Today
          </button>
          <h2 className="ml-2 text-lg font-semibold md:text-xl">{currentTitle}</h2>
        </div>

        {/* View switcher */}
        <div className="flex rounded-lg border bg-background p-1 shadow-sm">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => changeView(opt.value)}
              className={[
                "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:text-sm",
                activeView === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              ].join(" ")}
            >
              {opt.icon}
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="fc-custom overflow-hidden rounded-xl border bg-card shadow-sm">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="listYear"
          headerToolbar={false}
          events={fetchEvents}
          datesSet={handleDatesSet}
          eventClick={handleEventClick}
          height="auto"
          dayMaxEvents={5}
          nowIndicator
          eventDisplay="block"
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: "short",
          }}
        />
      </div>
    </div>
  );
}

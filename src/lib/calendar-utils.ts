export type CalendarEventLike = {
  id: string;
  summary: string;
  start: string | null;
  end: string | null;
};

function isAllDayDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseStart(value: string) {
  return isAllDayDate(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
}

function parseEnd(start: string, end: string | null) {
  if (!end) {
    const startDate = parseStart(start);
    if (isAllDayDate(start)) {
      const nextDay = new Date(startDate);
      nextDay.setDate(nextDay.getDate() + 1);
      return nextDay;
    }
    return startDate;
  }

  if (isAllDayDate(start) && isAllDayDate(end)) {
    return new Date(`${end}T00:00:00`);
  }

  return new Date(end);
}

/** True when `now` falls within the event window (handles Google all-day exclusivity). */
export function isEventActiveNow(
  event: CalendarEventLike,
  now = new Date()
): boolean {
  if (!event.start) return false;

  const start = parseStart(event.start);
  if (Number.isNaN(start.getTime())) return false;

  const end = parseEnd(event.start, event.end);
  if (Number.isNaN(end.getTime())) return false;

  return now >= start && now < end;
}

export function getActiveCabinEvents(
  events: CalendarEventLike[],
  now = new Date()
): CalendarEventLike[] {
  return events.filter((event) => isEventActiveNow(event, now));
}

export function getUpcomingCabinEvents(
  events: CalendarEventLike[],
  now = new Date(),
  withinDays = 7
): CalendarEventLike[] {
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + withinDays);

  return events
    .filter((event) => {
      if (!event.start || isEventActiveNow(event, now)) return false;
      const start = parseStart(event.start);
      return !Number.isNaN(start.getTime()) && start > now && start <= horizon;
    })
    .sort((a, b) => {
      const aStart = parseStart(a.start!);
      const bStart = parseStart(b.start!);
      return aStart.getTime() - bStart.getTime();
    });
}

export function formatEventDay(value: string | null) {
  if (!value) return "—";

  const date = isAllDayDate(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatEventEndLabel(event: CalendarEventLike) {
  if (!event.end) return null;

  if (isAllDayDate(event.start!) && isAllDayDate(event.end)) {
    const exclusiveEnd = new Date(`${event.end}T00:00:00`);
    exclusiveEnd.setDate(exclusiveEnd.getDate() - 1);
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
    }).format(exclusiveEnd);
  }

  return formatEventDay(event.end);
}

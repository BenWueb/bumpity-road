import { getRecentGuestbookEntries } from "@/lib/guestbook-server";
import { GuestbookCarouselClient } from "./GuestbookCarouselClient";

export async function GuestbookCarousel() {
  const entries = await getRecentGuestbookEntries(5);
  if (entries.length === 0) return null;
  return <GuestbookCarouselClient entries={entries} />;
}

export function GuestbookCarouselSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="animate-pulse p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-3/4 rounded bg-muted" />
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}

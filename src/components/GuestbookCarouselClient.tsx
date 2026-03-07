"use client";

import { GuestbookEntry } from "@/types/guestbook";
import { getGradientForColor } from "@/lib/guestbook-constants";
import { Carousel } from "@/components/ui/Carousel";
import { Quote } from "lucide-react";
import Link from "next/link";

function formatRelativeDate(isoDate: string) {
  const now = Date.now();
  const diff = now - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(new Date(isoDate));
}

type Props = {
  entries: GuestbookEntry[];
};

export function GuestbookCarouselClient({ entries }: Props) {
  return (
    <Link href="/guestbook" className="block">
      <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
        <Carousel interval={6000} showArrows={false}>
          {entries.map((entry) => (
            <div key={entry.id} className="relative">
              <div
                className={`pointer-events-none absolute inset-0 bg-linear-to-br ${getGradientForColor(
                  entry.color
                )}`}
              />
              <div className="relative flex flex-col items-center justify-center px-8 pb-6 pt-4 text-center">
                <Quote className="mb-2 h-5 w-5 text-muted-foreground/40" />
                <p className="max-w-3xl text-sm text-foreground/80 md:text-lg">
                  {entry.message}
                </p>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground/70">
                    — {entry.name}
                  </span>
                  <span>·</span>
                  <span>{formatRelativeDate(entry.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </Link>
  );
}

import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import { getGuestbookData } from "@/lib/guestbook-server";
import { GuestbookList } from "@/components/guestbook";

function GuestbookSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[3fr,400px]">
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border bg-card p-4">
            <div className="mb-2 h-4 w-32 rounded bg-accent" />
            <div className="h-4 w-full rounded bg-accent" />
            <div className="mt-1 h-4 w-3/4 rounded bg-accent" />
          </div>
        ))}
      </div>
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="animate-pulse rounded-xl border bg-card p-6">
          <div className="mb-4 h-6 w-40 rounded bg-accent" />
          <div className="space-y-4">
            <div className="h-10 rounded bg-accent" />
            <div className="h-24 rounded bg-accent" />
            <div className="flex gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 w-8 rounded-full bg-accent" />
              ))}
            </div>
            <div className="h-10 rounded bg-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function GuestbookContent() {
  const { entries, isAdmin } = await getGuestbookData();
  return <GuestbookList initialEntries={entries} initialIsAdmin={isAdmin} />;
}

export default function GuestbookPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg md:h-12 md:w-12">
              <BookOpen className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold md:text-2xl">Guestbook</h1>
              <p className="text-xs text-muted-foreground md:text-sm">
                Leave a message for us!
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <Suspense fallback={<GuestbookSkeleton />}>
          <GuestbookContent />
        </Suspense>
      </div>
    </div>
  );
}

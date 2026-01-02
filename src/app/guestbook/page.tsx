import { Suspense } from "react";
import { BookOpen } from "lucide-react";
import { getGuestbookData } from "@/lib/guestbook-server";
import { GuestbookList } from "@/components/guestbook";
import { PageHeader } from "@/components/PageHeader";

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
      <PageHeader
        title="Guestbook"
        subtitle="Leave a message for us!"
        icon={<BookOpen className="h-5 w-5 md:h-6 md:w-6" />}
        iconWrapperClassName="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-purple-600 text-white shadow-lg md:h-12 md:w-12"
      />

      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <Suspense fallback={<GuestbookSkeleton />}>
          <GuestbookContent />
        </Suspense>
      </div>
    </div>
  );
}

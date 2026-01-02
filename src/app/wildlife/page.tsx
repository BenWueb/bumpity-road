"use client";

import { Panda } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export default function WildlifePage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Wildlife"
        subtitle="Coming Soon"
        icon={<Panda className="h-5 w-5 md:h-6 md:w-6" />}
        iconWrapperClassName="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-lime-500 to-green-600 text-white shadow-lg md:h-12 md:w-12"
      />

      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
          <p className="mx-auto max-w-md text-sm text-muted-foreground md:text-base">
            Discover the wildlife around the cabin - from deer and bears to birds and more.
          </p>
        </div>
      </div>
    </div>
  );
}


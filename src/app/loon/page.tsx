import { Binoculars } from "lucide-react";

export default function LoonPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4 text-center md:p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border bg-gradient-to-br from-sky-100 to-blue-100 text-sky-600 shadow-sm dark:from-sky-900/30 dark:to-blue-900/30 dark:text-sky-400 md:h-20 md:w-20">
        <Binoculars className="h-8 w-8 md:h-10 md:w-10" />
      </div>
      <h1 className="mt-6 text-2xl font-bold md:text-3xl">Loons</h1>
      <p className="mt-2 text-sm text-muted-foreground md:text-base">
        Coming Soon
      </p>
      <p className="mt-4 max-w-md text-xs text-muted-foreground/70 md:text-sm">
        Learn about the loons on the lake - their calls, behaviors, and how to spot them.
      </p>
    </div>
  );
}


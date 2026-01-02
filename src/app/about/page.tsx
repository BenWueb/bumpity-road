import { Info } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4 text-center md:p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border bg-gradient-to-br from-violet-100 to-purple-100 text-violet-600 shadow-sm dark:from-violet-900/30 dark:to-purple-900/30 dark:text-violet-400 md:h-20 md:w-20">
        <Info className="h-8 w-8 md:h-10 md:w-10" />
      </div>
      <h1 className="mt-6 text-2xl font-bold md:text-3xl">About</h1>
      <p className="mt-2 text-sm text-muted-foreground md:text-base">
        Coming Soon
      </p>
      <p className="mt-4 max-w-md text-xs text-muted-foreground/70 md:text-sm">
        Learn more about Bumpity Road and the cabin.
      </p>
    </div>
  );
}

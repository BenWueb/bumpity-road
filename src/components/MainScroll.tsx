"use client";

import { usePathname } from "next/navigation";

// Some sections render their own full-height layout with an internal scroll
// container. Applying the global mobile bottom padding (FAB clearance) to
// <main> in those sections would leave an empty strip below the content, so
// we skip it there and let each section's own scroll container add its
// clearance instead.
export default function MainScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const ownsScroll =
    pathname.startsWith("/sop") ||
    pathname.startsWith("/help") ||
    pathname.startsWith("/expenses") ||
    pathname.startsWith("/fishing") ||
    pathname.startsWith("/loon");

  return (
    <main
      className={[
        "min-w-0 flex-1",
        ownsScroll ? "overflow-hidden" : "overflow-y-auto pb-20 md:pb-0",
      ].join(" ")}
    >
      {children}
    </main>
  );
}

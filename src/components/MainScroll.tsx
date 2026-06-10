"use client";

import { usePathname } from "next/navigation";

// The SOP and help sections render their own full-height two-pane layout with an
// internal scroll container. Applying the global mobile bottom padding (FAB
// clearance) to <main> in those sections would leave an empty strip below the
// two-pane, so we skip it there and let the doc content pane add its own
// clearance instead.
export default function MainScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const inDocsSection =
    pathname.startsWith("/sop") || pathname.startsWith("/help");

  return (
    <main
      className={[
        "min-w-0 flex-1 overflow-y-auto",
        inDocsSection ? "" : "pb-20 md:pb-0",
      ].join(" ")}
    >
      {children}
    </main>
  );
}

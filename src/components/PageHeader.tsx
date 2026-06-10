"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { getHelpHrefForPath } from "@/lib/help-links";

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  icon: ReactNode;

  /**
   * Desktop (md+) action shown on the right side of the header row.
   * Commonly a primary CTA button or a sign-in link.
   */
  desktopAction?: ReactNode;

  /**
   * Mobile-only action row rendered below the header.
   * Commonly a full-width CTA.
   */
  mobileAction?: ReactNode;

  /**
   * Contextual "Need help?" link. Defaults to the help doc that matches the
   * current route. Pass an explicit href to override, or `null` to hide it.
   */
  helpHref?: string | null;

  /**
   * Custom styling hooks to match existing pages without forcing a redesign.
   */
  headerClassName?: string;
  innerClassName?: string;
  iconWrapperClassName?: string;
  mobileActionClassName?: string;
};

export function PageHeader({
  title,
  subtitle,
  icon,
  desktopAction,
  mobileAction,
  helpHref,
  headerClassName,
  innerClassName,
  iconWrapperClassName,
  mobileActionClassName,
}: Props) {
  const pathname = usePathname();
  const resolvedHelpHref =
    helpHref === undefined ? getHelpHrefForPath(pathname) : helpHref;

  return (
    <>
      <div className={headerClassName ?? "border-b bg-card/50"}>
        <div
          className={
            innerClassName ??
            "mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-6"
          }
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={
                  iconWrapperClassName ??
                  "flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-slate-500 to-slate-700 text-white shadow-lg md:h-12 md:w-12"
                }
              >
                {icon}
              </div>
              <div>
                <h1 className="text-xl font-bold md:text-2xl">{title}</h1>
                {subtitle && (
                  <p className="text-xs text-muted-foreground md:text-sm">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {resolvedHelpHref && (
                <Link
                  href={resolvedHelpHref}
                  className="inline-flex items-center gap-2 rounded-lg border bg-background/60 px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground"
                  title="Need help?"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Need help?</span>
                </Link>
              )}
              {desktopAction}
            </div>
          </div>
        </div>
      </div>

      {mobileAction && (
        <div className={mobileActionClassName ?? "sticky top-0 z-10 border-b bg-card/80 px-4 py-3 backdrop-blur-sm md:hidden"}>
          {mobileAction}
        </div>
      )}
    </>
  );
}



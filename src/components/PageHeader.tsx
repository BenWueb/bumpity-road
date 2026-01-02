"use client";

import { ReactNode } from "react";

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
  headerClassName,
  innerClassName,
  iconWrapperClassName,
  mobileActionClassName,
}: Props) {
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

            {desktopAction}
          </div>
        </div>
      </div>

      {mobileAction && (
        <div className={mobileActionClassName ?? "border-b bg-card/30 px-4 py-3 md:hidden"}>
          {mobileAction}
        </div>
      )}
    </>
  );
}



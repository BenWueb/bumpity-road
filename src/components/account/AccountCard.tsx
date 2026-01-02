import type { ReactNode } from "react";
import { clsx } from "clsx";

type Props = {
  gradientClassName: string;
  children: ReactNode;
  className?: string;
};

export function AccountCard({ gradientClassName, children, className }: Props) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-xl border bg-card shadow-sm",
        className
      )}
    >
      <div
        className={clsx(
          "pointer-events-none absolute inset-0",
          gradientClassName
        )}
      />
      <div className="relative">{children}</div>
    </div>
  );
}



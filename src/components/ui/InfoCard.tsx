import type { ReactNode } from "react";
import { clsx } from "clsx";

type Props = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
};

export function InfoCard({
  title,
  icon,
  children,
  className,
  titleClassName,
}: Props) {
  return (
    <section className={clsx("rounded-xl border p-4 shadow-sm", className)}>
      <div
        className={clsx(
          "flex items-center gap-2 text-sm font-semibold text-muted-foreground",
          titleClassName
        )}
      >
        {icon}
        <span>{title}</span>
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}



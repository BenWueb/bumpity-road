"use client";

import { usePathname } from "next/navigation";

import Link from "next/link";

interface Props {
  message: string;
}

export default function LoonGlobalNotice({ message }: Props) {
  const pathname = usePathname();

  if (pathname === "/loon") return null;

  return (
    <Link
      href="/loon"
      className="group block w-full border-b bg-amber-50 px-3 py-2 dark:border-amber-500/20 dark:bg-amber-950/40"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-center text-center text-xs font-medium text-amber-950 md:text-sm dark:text-amber-50">
        <span>{message}</span>
      </div>
    </Link>
  );
}

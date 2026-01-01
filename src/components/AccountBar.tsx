"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogIn, LogOut, Settings, User } from "lucide-react";

function initialsFromName(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "U";
  const parts = n.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

export default function AccountBar({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function onLogout() {
    setOpen(false);
    // Use the dynamic signOut method which triggers session atom update
    await authClient.signOut();
    router.refresh();
  }
  return (
    <div className="border-t p-2">
      {isPending ? (
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="h-9 w-9 animate-pulse rounded-full bg-accent" />
          {collapsed ? null : (
            <div className="min-w-0 flex-1">
              <div className="h-4 w-28 animate-pulse rounded-md bg-accent" />
              <div className="mt-2 h-3 w-36 animate-pulse rounded-md bg-accent" />
            </div>
          )}
        </div>
      ) : (
        <div ref={containerRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={[
              "w-full rounded-md px-2 py-2 transition-colors",
              "flex cursor-pointer items-center gap-3",
              "hover:bg-accent",
            ].join(" ")}
            title={
              collapsed
                ? session?.user?.name ?? session?.user?.email ?? "Account"
                : undefined
            }
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-sm font-semibold">
              {initialsFromName(session?.user?.name)}
            </div>

            {collapsed ? null : (
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate text-sm font-medium">
                  {session?.user?.name ?? "Guest"}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {session?.user?.email ?? "Not signed in"}
                </div>
              </div>
            )}

            {collapsed ? null : (
              <Settings className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {open ? (
            <div className="absolute bottom-14 left-0 right-0 z-20 rounded-md border bg-background shadow-lg">
              <div className="p-1">
                {session?.user ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent"
                    >
                      <User className="h-4 w-4" />
                      Account
                    </Link>
                    <button
                      type="button"
                      onClick={onLogout}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent"
                    >
                      <LogIn className="h-4 w-4" />
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent"
                    >
                      <User className="h-4 w-4" />
                      Create account
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

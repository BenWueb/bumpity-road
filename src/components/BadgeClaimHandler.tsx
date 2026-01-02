"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Award, X } from "lucide-react";
import { getBadgeInfo } from "@/lib/badge-definitions";

export default function BadgeClaimHandler() {
  const { data: session } = authClient.useSession();
  const [showSuccess, setShowSuccess] = useState(false);
  const [badgesEarned, setBadgesEarned] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Handle OG badge from signup
  useEffect(() => {
    if (!session?.user?.id) return;

    const pendingAnswer = localStorage.getItem("pendingBadgeAnswer");
    if (!pendingAnswer) return;

    localStorage.removeItem("pendingBadgeAnswer");

    async function claimBadge() {
      try {
        const res = await fetch("/api/badges", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            badge: "OG",
            answer: pendingAnswer,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          setBadgesEarned([data.badge]);
          setShowSuccess(true);
        } else if (data.error === "Incorrect answer") {
          setError("That wasn't the right answer, but nice try!");
        }
      } catch {
        // Silently fail
      }
    }

    claimBadge();
  }, [session?.user?.id]);

  // Listen for task completion badges
  useEffect(() => {
    function handleBadgesEarned(event: CustomEvent<{ badges: string[] }>) {
      if (event.detail.badges && event.detail.badges.length > 0) {
        setBadgesEarned(event.detail.badges);
        setShowSuccess(true);
      }
    }

    window.addEventListener(
      "badgesEarned",
      handleBadgesEarned as EventListener
    );
    return () => {
      window.removeEventListener(
        "badgesEarned",
        handleBadgesEarned as EventListener
      );
    };
  }, []);

  function handleClose() {
    setShowSuccess(false);
    setBadgesEarned([]);
    setError(null);
  }

  if (!showSuccess && !error) return null;

  const currentBadge = badgesEarned[0];
  const badgeInfo = currentBadge ? getBadgeInfo(currentBadge) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-sm rounded-xl border bg-card p-6 shadow-xl">
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {showSuccess && currentBadge && badgeInfo && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-4xl shadow-lg">
              {badgeInfo.icon}
            </div>
            <h2 className="text-xl font-bold text-orange-500 dark:text-orange-400">
              {badgeInfo.name} Badge Earned
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {badgeInfo.description}
            </p>
            {badgesEarned.length > 1 && (
              <p className="mt-2 text-xs text-muted-foreground">
                +{badgesEarned.length - 1} more badge
                {badgesEarned.length > 2 ? "s" : ""}!
              </p>
            )}
            <button
              onClick={handleClose}
              className="mt-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2 text-sm font-medium text-white shadow-sm hover:from-amber-600 hover:to-orange-600"
            >
              Awesome!
            </button>
          </div>
        )}

        {error && (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Award className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-semibold">Almost!</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <button
              onClick={handleClose}
              className="mt-4 rounded-lg border px-6 py-2 text-sm font-medium hover:bg-accent"
            >
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

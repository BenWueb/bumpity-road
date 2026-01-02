"use client";

/**
 * Emit a global event whenever a user earns new badges.
 *
 * Consumers (e.g. `src/components/BadgeClaimHandler.tsx`) can listen for
 * `window.addEventListener("badgesEarned", ...)`.
 */
export function emitBadgesEarned(badges: unknown): void {
  if (typeof window === "undefined") return;
  if (!Array.isArray(badges) || badges.length === 0) return;

  window.dispatchEvent(
    new CustomEvent("badgesEarned", { detail: { badges } })
  );
}



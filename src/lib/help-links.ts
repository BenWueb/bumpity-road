/**
 * Maps app routes to their matching help doc. Used to render a contextual
 * "Need help?" link in the page header.
 */
const ROUTE_HELP_MAP: { prefix: string; href: string }[] = [
  { prefix: "/guestbook", href: "/help/features/guestbook" },
  { prefix: "/puzzles", href: "/help/features/puzzles" },
  { prefix: "/gallery", href: "/help/features/gallery" },
  { prefix: "/blog", href: "/help/features/blog" },
  { prefix: "/adventures", href: "/help/features/adventures" },
  { prefix: "/loon", href: "/help/features/loons" },
  { prefix: "/fishing", href: "/help/features/fishing" },
  { prefix: "/todos", href: "/help/features/tasks" },
  { prefix: "/account", href: "/help/features/account-and-badges" },
  { prefix: "/expenses", href: "/help/features/expenses" },
];

/**
 * Returns the help doc href for a given pathname, or `null` when there's no
 * dedicated help page for that route.
 */
export function getHelpHrefForPath(pathname: string): string | null {
  if (pathname === "/") return "/help/features/home-dashboard";
  for (const { prefix, href } of ROUTE_HELP_MAP) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return href;
  }
  return null;
}

import { getBadgeInfo } from "@/lib/badge-definitions";

const ACCOUNT_BADGE_OVERRIDES: Record<
  string,
  { name?: string; description?: string; icon?: string }
> = {
  GUESTBOOK_SIGNER: { name: "Left a Mark" },
};

export function getAccountBadgeInfo(badge: string) {
  const base = getBadgeInfo(badge);
  const o = ACCOUNT_BADGE_OVERRIDES[badge];
  return o ? { ...base, ...o } : base;
}

const TASK_BADGE_HIERARCHY = [
  "TASK_ROOKIE",
  "TASK_WARRIOR",
  "TASK_MASTER",
  "TASK_LEGEND",
];

const BLOG_BADGE_HIERARCHY = [
  "BLOGGER_FIRST",
  "BLOGGER_CONTRIBUTOR",
  "BLOGGER_WRITER",
  "BLOGGER_AUTHOR",
];

const FEEDBACK_BADGE_HIERARCHY = [
  "FEEDBACK_FIRST",
  "FEEDBACK_CONTRIBUTOR",
  "FEEDBACK_ADVOCATE",
  "FEEDBACK_CHAMPION",
];

const MEMBERSHIP_BADGE_HIERARCHY = [
  "MEMBER_1_YEAR",
  "MEMBER_2_YEARS",
  "MEMBER_3_YEARS",
  "MEMBER_5_YEARS",
  "MEMBER_10_YEARS",
];

const LOON_BADGE_HIERARCHY = [
  "LOON_SPOTTER",
  "LOON_WATCHER",
  "LOON_TRACKER",
  "LOON_RANGER",
];

const FISHING_BADGE_HIERARCHY = [
  "FISHING_NOVICE",
  "FISHING_ANGLER",
  "FISHING_PRO",
  "FISHING_MASTER",
];

const STANDALONE_BADGES = ["OG", "GUESTBOOK_SIGNER", "ADVENTURER_FIRST"];

function addHierarchyBadges(
  result: { badge: string; earned: boolean }[],
  earnedSet: Set<string>,
  hierarchy: string[],
) {
  let highestIndex = -1;
  for (const badge of hierarchy) {
    if (earnedSet.has(badge)) {
      highestIndex = hierarchy.indexOf(badge);
    }
  }
  if (highestIndex >= 0) {
    result.push({ badge: hierarchy[highestIndex], earned: true });
  }
  const nextIndex = highestIndex + 1;
  if (nextIndex < hierarchy.length) {
    result.push({ badge: hierarchy[nextIndex], earned: false });
  }
}

export function getBadgesForDisplay(
  earnedBadges: string[],
): { badge: string; earned: boolean }[] {
  const result: { badge: string; earned: boolean }[] = [];
  const earnedSet = new Set(earnedBadges);

  for (const badge of STANDALONE_BADGES) {
    result.push({ badge, earned: earnedSet.has(badge) });
  }

  addHierarchyBadges(result, earnedSet, TASK_BADGE_HIERARCHY);
  addHierarchyBadges(result, earnedSet, BLOG_BADGE_HIERARCHY);
  addHierarchyBadges(result, earnedSet, FEEDBACK_BADGE_HIERARCHY);
  addHierarchyBadges(result, earnedSet, LOON_BADGE_HIERARCHY);
  addHierarchyBadges(result, earnedSet, FISHING_BADGE_HIERARCHY);
  addHierarchyBadges(result, earnedSet, MEMBERSHIP_BADGE_HIERARCHY);

  return result;
}

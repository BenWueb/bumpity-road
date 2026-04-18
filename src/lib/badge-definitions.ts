export type BadgeInfo = {
  name: string;
  description: string;
  icon: string;
};

// Client-safe badge metadata (no Prisma imports).
export const BADGE_DEFINITIONS: Record<string, BadgeInfo> = {
  OG: {
    name: "OG",
    description: "One of the originals - you've been here awhile!",
    icon: "⭐",
  },
  TASK_ROOKIE: {
    name: "Task Rookie",
    description: "Completed 5 tasks",
    icon: "🌱",
  },
  TASK_WARRIOR: {
    name: "Task Warrior",
    description: "Completed 10 tasks",
    icon: "⚔️",
  },
  TASK_MASTER: {
    name: "Task Master",
    description: "Completed 20 tasks",
    icon: "🏆",
  },
  TASK_LEGEND: {
    name: "Task Legend",
    description: "Completed 100 tasks",
    icon: "👑",
  },
  GUESTBOOK_SIGNER: {
    name: "Guest",
    description: "Signed the guestbook",
    icon: "✍️",
  },
  BLOGGER_FIRST: {
    name: "First Post",
    description: "Published your first blog post",
    icon: "📝",
  },
  BLOGGER_CONTRIBUTOR: {
    name: "Contributor",
    description: "Published 3 blog posts",
    icon: "📰",
  },
  BLOGGER_WRITER: {
    name: "Writer",
    description: "Published 5 blog posts",
    icon: "✒️",
  },
  BLOGGER_AUTHOR: {
    name: "Author",
    description: "Published 10 blog posts",
    icon: "📚",
  },
  FEEDBACK_FIRST: {
    name: "Helper",
    description: "Submitted your first feedback",
    icon: "💡",
  },
  FEEDBACK_CONTRIBUTOR: {
    name: "Bug Hunter",
    description: "Submitted 3 feedback reports",
    icon: "🔍",
  },
  FEEDBACK_ADVOCATE: {
    name: "Advocate",
    description: "Submitted 5 feedback reports",
    icon: "📣",
  },
  FEEDBACK_CHAMPION: {
    name: "Champion",
    description: "Submitted 10 feedback reports",
    icon: "🦸",
  },
  MEMBER_1_YEAR: {
    name: "1 Year",
    description: "Member for 1 year",
    icon: "🎂",
  },
  MEMBER_2_YEARS: {
    name: "2 Years",
    description: "Member for 2 years",
    icon: "🎉",
  },
  MEMBER_3_YEARS: {
    name: "3 Years",
    description: "Member for 3 years",
    icon: "🌟",
  },
  MEMBER_5_YEARS: {
    name: "5 Years",
    description: "Member for 5 years",
    icon: "💎",
  },
  MEMBER_10_YEARS: {
    name: "10 Years",
    description: "Member for 10 years",
    icon: "🏛️",
  },
  ADVENTURER_FIRST: {
    name: "Adventurer",
    description: "Created your first adventure",
    icon: "🧭",
  },
  LOON_SPOTTER: {
    name: "Loon Spotter",
    description: "Logged your first loon observation",
    icon: "🦆",
  },
  LOON_WATCHER: {
    name: "Loon Watcher",
    description: "Logged 5 loon observations",
    icon: "🔭",
  },
  LOON_TRACKER: {
    name: "Loon Tracker",
    description: "Logged 10 loon observations",
    icon: "📋",
  },
  LOON_RANGER: {
    name: "Loon Ranger",
    description: "Logged 25 loon observations",
    icon: "🏅",
  },
  FISHING_NOVICE: {
    name: "Fishing Novice",
    description: "Logged your first fishing report",
    icon: "🎣",
  },
  FISHING_ANGLER: {
    name: "Angler",
    description: "Logged 5 fishing reports",
    icon: "🐟",
  },
  FISHING_PRO: {
    name: "Fishing Pro",
    description: "Logged 10 fishing reports",
    icon: "🐠",
  },
  FISHING_MASTER: {
    name: "Fishing Master",
    description: "Logged 25 fishing reports",
    icon: "🏆",
  },
};

export function getBadgeInfo(badge: string): BadgeInfo {
  return (
    BADGE_DEFINITIONS[badge] || {
      name: badge,
      description: "Special badge",
      icon: "🏅",
    }
  );
}



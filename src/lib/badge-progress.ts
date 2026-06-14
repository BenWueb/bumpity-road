export type BadgeProgressStats = {
  tasksCompleted: number;
  blogPosts: number;
  feedbackSubmitted: number;
  loonObservations: number;
  fishObservations: number;
  membershipYears: number;
};

const BADGE_REQUIREMENTS: Record<
  string,
  { stat: keyof BadgeProgressStats; target: number; unit: string }
> = {
  TASK_ROOKIE: { stat: "tasksCompleted", target: 5, unit: "tasks completed" },
  TASK_WARRIOR: { stat: "tasksCompleted", target: 10, unit: "tasks completed" },
  TASK_MASTER: { stat: "tasksCompleted", target: 20, unit: "tasks completed" },
  TASK_LEGEND: { stat: "tasksCompleted", target: 100, unit: "tasks completed" },
  BLOGGER_FIRST: { stat: "blogPosts", target: 1, unit: "blog posts" },
  BLOGGER_CONTRIBUTOR: { stat: "blogPosts", target: 3, unit: "blog posts" },
  BLOGGER_WRITER: { stat: "blogPosts", target: 5, unit: "blog posts" },
  BLOGGER_AUTHOR: { stat: "blogPosts", target: 10, unit: "blog posts" },
  FEEDBACK_FIRST: { stat: "feedbackSubmitted", target: 1, unit: "submissions" },
  FEEDBACK_CONTRIBUTOR: { stat: "feedbackSubmitted", target: 3, unit: "submissions" },
  FEEDBACK_ADVOCATE: { stat: "feedbackSubmitted", target: 5, unit: "submissions" },
  FEEDBACK_CHAMPION: { stat: "feedbackSubmitted", target: 10, unit: "submissions" },
  LOON_SPOTTER: { stat: "loonObservations", target: 1, unit: "loon logs" },
  LOON_WATCHER: { stat: "loonObservations", target: 5, unit: "loon logs" },
  LOON_TRACKER: { stat: "loonObservations", target: 10, unit: "loon logs" },
  LOON_RANGER: { stat: "loonObservations", target: 25, unit: "loon logs" },
  FISHING_NOVICE: { stat: "fishObservations", target: 1, unit: "fish logs" },
  FISHING_ANGLER: { stat: "fishObservations", target: 5, unit: "fish logs" },
  FISHING_PRO: { stat: "fishObservations", target: 10, unit: "fish logs" },
  FISHING_MASTER: { stat: "fishObservations", target: 25, unit: "fish logs" },
  MEMBER_1_YEAR: { stat: "membershipYears", target: 1, unit: "years as a member" },
  MEMBER_2_YEARS: { stat: "membershipYears", target: 2, unit: "years as a member" },
  MEMBER_3_YEARS: { stat: "membershipYears", target: 3, unit: "years as a member" },
  MEMBER_5_YEARS: { stat: "membershipYears", target: 5, unit: "years as a member" },
  MEMBER_10_YEARS: { stat: "membershipYears", target: 10, unit: "years as a member" },
};

export function getBadgeProgressHint(
  badge: string,
  stats: BadgeProgressStats,
): string | null {
  const req = BADGE_REQUIREMENTS[badge];
  if (!req) return null;

  const current =
    req.stat === "membershipYears"
      ? Math.floor(stats.membershipYears * 10) / 10
      : stats[req.stat];

  if (current >= req.target) return null;

  if (req.stat === "membershipYears") {
    const remaining = Math.ceil((req.target - stats.membershipYears) * 10) / 10;
    return remaining <= 0.1
      ? "Almost there!"
      : `${remaining} more year${remaining === 1 ? "" : "s"} to unlock`;
  }

  return `${current}/${req.target} ${req.unit}`;
}

export function computeMembershipYears(createdAt: string | Date): number {
  const start = new Date(createdAt);
  const now = new Date();
  return (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
}

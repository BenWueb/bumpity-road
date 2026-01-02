import { prisma } from "@/utils/prisma";

// Badge definitions
export const BADGE_DEFINITIONS: Record<
  string,
  { name: string; description: string; icon: string }
> = {
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
};

// Task completion milestones
const TASK_MILESTONES = [
  { count: 5, badge: "TASK_ROOKIE" },
  { count: 10, badge: "TASK_WARRIOR" },
  { count: 20, badge: "TASK_MASTER" },
  { count: 100, badge: "TASK_LEGEND" },
];

// Blog post milestones
const BLOG_MILESTONES = [
  { count: 1, badge: "BLOGGER_FIRST" },
  { count: 3, badge: "BLOGGER_CONTRIBUTOR" },
  { count: 5, badge: "BLOGGER_WRITER" },
  { count: 10, badge: "BLOGGER_AUTHOR" },
];

// Feedback milestones
const FEEDBACK_MILESTONES = [
  { count: 1, badge: "FEEDBACK_FIRST" },
  { count: 3, badge: "FEEDBACK_CONTRIBUTOR" },
  { count: 5, badge: "FEEDBACK_ADVOCATE" },
  { count: 10, badge: "FEEDBACK_CHAMPION" },
];

// Membership duration milestones (in years)
const MEMBERSHIP_MILESTONES = [
  { years: 1, badge: "MEMBER_1_YEAR" },
  { years: 2, badge: "MEMBER_2_YEARS" },
  { years: 3, badge: "MEMBER_3_YEARS" },
  { years: 5, badge: "MEMBER_5_YEARS" },
  { years: 10, badge: "MEMBER_10_YEARS" },
];

/**
 * Check and award task completion badges for a user
 * Call this after a task is marked as complete
 */
export async function checkAndAwardTaskBadges(
  userId: string
): Promise<string[]> {
  // Get user's current badges
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { badges: true },
  });

  if (!user) return [];

  // Count tasks completed by this user
  const completedCount = await prisma.todo.count({
    where: {
      completedById: userId,
      completed: true,
    },
  });

  const newBadges: string[] = [];

  // Check each milestone
  for (const milestone of TASK_MILESTONES) {
    if (
      completedCount >= milestone.count &&
      !user.badges.includes(milestone.badge)
    ) {
      newBadges.push(milestone.badge);
    }
  }

  // Award new badges
  if (newBadges.length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        badges: {
          push: newBadges,
        },
      },
    });
  }

  return newBadges;
}

/**
 * Get badge info for display
 */
export function getBadgeInfo(badge: string) {
  return (
    BADGE_DEFINITIONS[badge] || {
      name: badge,
      description: "Special badge",
      icon: "🏅",
    }
  );
}

/**
 * Check and award blog post badges for a user
 * Call this after a user creates a new blog post
 */
export async function checkAndAwardBlogBadges(
  userId: string
): Promise<string[]> {
  // Get user's current badges
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { badges: true },
  });

  if (!user) return [];

  // Count blog posts by this user
  const postCount = await prisma.post.count({
    where: { userId },
  });

  const newBadges: string[] = [];

  // Check each milestone
  for (const milestone of BLOG_MILESTONES) {
    if (
      postCount >= milestone.count &&
      !user.badges.includes(milestone.badge)
    ) {
      newBadges.push(milestone.badge);
    }
  }

  // Award new badges
  if (newBadges.length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        badges: {
          push: newBadges,
        },
      },
    });
  }

  return newBadges;
}

/**
 * Check and award feedback badges for a user
 * Call this after a user submits feedback
 */
export async function checkAndAwardFeedbackBadges(
  userId: string
): Promise<string[]> {
  // Get user's current badges
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { badges: true },
  });

  if (!user) return [];

  // Count feedback submitted by this user
  const feedbackCount = await prisma.feedback.count({
    where: { userId },
  });

  const newBadges: string[] = [];

  // Check each milestone
  for (const milestone of FEEDBACK_MILESTONES) {
    if (
      feedbackCount >= milestone.count &&
      !user.badges.includes(milestone.badge)
    ) {
      newBadges.push(milestone.badge);
    }
  }

  // Award new badges
  if (newBadges.length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        badges: {
          push: newBadges,
        },
      },
    });
  }

  return newBadges;
}

/**
 * Check and award membership duration badges for a user
 * Call this when user views their account page
 */
export async function checkAndAwardMembershipBadges(
  userId: string
): Promise<string[]> {
  // Get user's current badges and creation date
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { badges: true, createdAt: true },
  });

  if (!user) return [];

  // Calculate years since account creation
  const now = new Date();
  const createdAt = new Date(user.createdAt);
  const yearsSinceCreation =
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365);

  const newBadges: string[] = [];

  // Check each milestone
  for (const milestone of MEMBERSHIP_MILESTONES) {
    if (
      yearsSinceCreation >= milestone.years &&
      !user.badges.includes(milestone.badge)
    ) {
      newBadges.push(milestone.badge);
    }
  }

  // Award new badges
  if (newBadges.length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        badges: {
          push: newBadges,
        },
      },
    });
  }

  return newBadges;
}

/**
 * Award the guestbook signer badge to a user
 * Call this after a user signs the guestbook
 */
export async function awardGuestbookBadge(userId: string): Promise<boolean> {
  // Get user's current badges
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { badges: true },
  });

  if (!user) return false;

  // Check if user already has this badge
  if (user.badges?.includes("GUESTBOOK_SIGNER")) {
    return false; // Already has badge
  }

  // Award the badge
  await prisma.user.update({
    where: { id: userId },
    data: {
      badges: {
        push: "GUESTBOOK_SIGNER",
      },
    },
  });

  return true;
}

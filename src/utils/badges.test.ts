jest.mock("@/utils/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn(), update: jest.fn() },
    todo: { count: jest.fn() },
    post: { count: jest.fn() },
    adventure: { count: jest.fn() },
    loonObservation: { count: jest.fn() },
    fishObservation: { count: jest.fn() },
    feedback: { count: jest.fn() },
  },
}));

import { prisma } from "@/utils/prisma";
import {
  checkAndAwardTaskBadges,
  checkAndAwardBlogBadges,
  checkAndAwardAdventureBadges,
  checkAndAwardLoonBadges,
  checkAndAwardFishingBadges,
  checkAndAwardFeedbackBadges,
  checkAndAwardMembershipBadges,
  awardGuestbookBadge,
} from "./badges";

const mockedPrisma = prisma as unknown as {
  user: { findUnique: jest.Mock; update: jest.Mock };
  todo: { count: jest.Mock };
  post: { count: jest.Mock };
  adventure: { count: jest.Mock };
  loonObservation: { count: jest.Mock };
  fishObservation: { count: jest.Mock };
  feedback: { count: jest.Mock };
};

beforeEach(() => {
  jest.clearAllMocks();
});

/**
 * Test factory: every milestone-based award function shares the same shape.
 * (userId) -> findUnique(badges) -> count(...) -> push new badges.
 */
function describeMilestoneFunction(
  name: string,
  fn: (userId: string) => Promise<string[]>,
  countMock: jest.Mock,
  // [count, badge] pairs in ascending order
  milestones: Array<[number, string]>
) {
  describe(name, () => {
    it("returns [] and does not update when user does not exist", async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);
      countMock.mockResolvedValue(999);

      const result = await fn("u1");
      expect(result).toEqual([]);
      expect(mockedPrisma.user.update).not.toHaveBeenCalled();
    });

    it("returns [] when count is below the first milestone", async () => {
      mockedPrisma.user.findUnique.mockResolvedValue({ badges: [] });
      countMock.mockResolvedValue(milestones[0][0] - 1);

      const result = await fn("u1");
      expect(result).toEqual([]);
      expect(mockedPrisma.user.update).not.toHaveBeenCalled();
    });

    it("awards a single milestone badge when reached with empty badges", async () => {
      mockedPrisma.user.findUnique.mockResolvedValue({ badges: [] });
      countMock.mockResolvedValue(milestones[0][0]);

      const result = await fn("u1");
      expect(result).toEqual([milestones[0][1]]);
      expect(mockedPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: { badges: { push: [milestones[0][1]] } },
      });
    });

    if (milestones.length >= 2) {
      it("returns only NEW badges when the user already has earlier ones", async () => {
        const [, firstBadge] = milestones[0];
        const [secondCount, secondBadge] = milestones[1];

        mockedPrisma.user.findUnique.mockResolvedValue({
          badges: [firstBadge],
        });
        countMock.mockResolvedValue(secondCount);

        const result = await fn("u1");
        expect(result).toEqual([secondBadge]);
        expect(mockedPrisma.user.update).toHaveBeenCalledWith({
          where: { id: "u1" },
          data: { badges: { push: [secondBadge] } },
        });
      });
    }

    it("returns [] and does not update when all milestones are already owned at top count", async () => {
      const allBadges = milestones.map(([, b]) => b);
      const topCount = milestones[milestones.length - 1][0];

      mockedPrisma.user.findUnique.mockResolvedValue({ badges: allBadges });
      countMock.mockResolvedValue(topCount);

      const result = await fn("u1");
      expect(result).toEqual([]);
      expect(mockedPrisma.user.update).not.toHaveBeenCalled();
    });
  });
}

describeMilestoneFunction(
  "checkAndAwardTaskBadges",
  checkAndAwardTaskBadges,
  mockedPrisma.todo.count,
  [
    [5, "TASK_ROOKIE"],
    [10, "TASK_WARRIOR"],
    [20, "TASK_MASTER"],
    [100, "TASK_LEGEND"],
  ]
);

describeMilestoneFunction(
  "checkAndAwardBlogBadges",
  checkAndAwardBlogBadges,
  mockedPrisma.post.count,
  [
    [1, "BLOGGER_FIRST"],
    [3, "BLOGGER_CONTRIBUTOR"],
    [5, "BLOGGER_WRITER"],
    [10, "BLOGGER_AUTHOR"],
  ]
);

describeMilestoneFunction(
  "checkAndAwardAdventureBadges",
  checkAndAwardAdventureBadges,
  mockedPrisma.adventure.count,
  [[1, "ADVENTURER_FIRST"]]
);

describeMilestoneFunction(
  "checkAndAwardLoonBadges",
  checkAndAwardLoonBadges,
  mockedPrisma.loonObservation.count,
  [
    [1, "LOON_SPOTTER"],
    [5, "LOON_WATCHER"],
    [10, "LOON_TRACKER"],
    [25, "LOON_RANGER"],
  ]
);

describeMilestoneFunction(
  "checkAndAwardFishingBadges",
  checkAndAwardFishingBadges,
  mockedPrisma.fishObservation.count,
  [
    [1, "FISHING_NOVICE"],
    [5, "FISHING_ANGLER"],
    [10, "FISHING_PRO"],
    [25, "FISHING_MASTER"],
  ]
);

describeMilestoneFunction(
  "checkAndAwardFeedbackBadges",
  checkAndAwardFeedbackBadges,
  mockedPrisma.feedback.count,
  [
    [1, "FEEDBACK_FIRST"],
    [3, "FEEDBACK_CONTRIBUTOR"],
    [5, "FEEDBACK_ADVOCATE"],
    [10, "FEEDBACK_CHAMPION"],
  ]
);

describe("checkAndAwardTaskBadges (multi-milestone leap)", () => {
  it("awards every newly-crossed milestone in a single call", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({ badges: [] });
    mockedPrisma.todo.count.mockResolvedValue(20);

    const result = await checkAndAwardTaskBadges("u1");
    expect(result).toEqual(["TASK_ROOKIE", "TASK_WARRIOR", "TASK_MASTER"]);
    expect(mockedPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: {
        badges: { push: ["TASK_ROOKIE", "TASK_WARRIOR", "TASK_MASTER"] },
      },
    });
  });
});

describe("checkAndAwardMembershipBadges", () => {
  function createdAtYearsAgo(years: number): Date {
    const ms = Date.now() - years * 365 * 24 * 60 * 60 * 1000;
    return new Date(ms);
  }

  it("returns [] when user does not exist", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);
    expect(await checkAndAwardMembershipBadges("u1")).toEqual([]);
    expect(mockedPrisma.user.update).not.toHaveBeenCalled();
  });

  it("awards no badge when account is < 1 year old", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({
      badges: [],
      createdAt: createdAtYearsAgo(0.5),
    });
    expect(await checkAndAwardMembershipBadges("u1")).toEqual([]);
    expect(mockedPrisma.user.update).not.toHaveBeenCalled();
  });

  it("awards MEMBER_1_YEAR after 1+ years", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({
      badges: [],
      // 1.1 years buffers against floating-point edge cases at the 1-year boundary
      createdAt: createdAtYearsAgo(1.1),
    });
    const result = await checkAndAwardMembershipBadges("u1");
    expect(result).toEqual(["MEMBER_1_YEAR"]);
  });

  it("awards every crossed milestone after 11+ years", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({
      badges: [],
      createdAt: createdAtYearsAgo(11),
    });
    const result = await checkAndAwardMembershipBadges("u1");
    expect(result).toEqual([
      "MEMBER_1_YEAR",
      "MEMBER_2_YEARS",
      "MEMBER_3_YEARS",
      "MEMBER_5_YEARS",
      "MEMBER_10_YEARS",
    ]);
  });

  it("awards only the new milestone when earlier ones are already owned", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({
      badges: ["MEMBER_1_YEAR", "MEMBER_2_YEARS"],
      createdAt: createdAtYearsAgo(3.1),
    });
    const result = await checkAndAwardMembershipBadges("u1");
    expect(result).toEqual(["MEMBER_3_YEARS"]);
  });
});

describe("awardGuestbookBadge", () => {
  it("returns false when user does not exist", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);
    expect(await awardGuestbookBadge("u1")).toBe(false);
    expect(mockedPrisma.user.update).not.toHaveBeenCalled();
  });

  it("returns false when the user already has GUESTBOOK_SIGNER", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({
      badges: ["GUESTBOOK_SIGNER"],
    });
    expect(await awardGuestbookBadge("u1")).toBe(false);
    expect(mockedPrisma.user.update).not.toHaveBeenCalled();
  });

  it("returns true and pushes the badge for a new signer", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({ badges: [] });
    expect(await awardGuestbookBadge("u1")).toBe(true);
    expect(mockedPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { badges: { push: "GUESTBOOK_SIGNER" } },
    });
  });
});

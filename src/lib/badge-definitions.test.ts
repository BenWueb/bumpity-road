import { BADGE_DEFINITIONS, getBadgeInfo } from "./badge-definitions";

describe("badge-definitions", () => {
  describe("getBadgeInfo", () => {
    it("returns the entry for known keys", () => {
      const info = getBadgeInfo("TASK_ROOKIE");
      expect(info).toBe(BADGE_DEFINITIONS.TASK_ROOKIE);
      expect(info.name).toBe("Task Rookie");
      expect(info.icon).toBe("🌱");
    });

    it("returns the OG badge for the OG key", () => {
      expect(getBadgeInfo("OG").name).toBe("OG");
    });

    it("returns a fallback for unknown keys", () => {
      const info = getBadgeInfo("NOT_A_REAL_BADGE");
      expect(info).toEqual({
        name: "NOT_A_REAL_BADGE",
        description: "Special badge",
        icon: "🏅",
      });
    });
  });

  describe("BADGE_DEFINITIONS", () => {
    it("includes all expected badge keys", () => {
      const keys = Object.keys(BADGE_DEFINITIONS);
      expect(keys).toContain("TASK_ROOKIE");
      expect(keys).toContain("TASK_LEGEND");
      expect(keys).toContain("GUESTBOOK_SIGNER");
      expect(keys).toContain("BLOGGER_FIRST");
      expect(keys).toContain("MEMBER_10_YEARS");
      expect(keys).toContain("ADVENTURER_FIRST");
      expect(keys).toContain("LOON_RANGER");
      expect(keys).toContain("FISHING_MASTER");
      expect(keys).toContain("FEEDBACK_CHAMPION");
    });

    it("every entry has name, description, and icon", () => {
      for (const key of Object.keys(BADGE_DEFINITIONS)) {
        const info = BADGE_DEFINITIONS[key];
        expect(typeof info.name).toBe("string");
        expect(info.name.length).toBeGreaterThan(0);
        expect(typeof info.description).toBe("string");
        expect(info.description.length).toBeGreaterThan(0);
        expect(typeof info.icon).toBe("string");
        expect(info.icon.length).toBeGreaterThan(0);
      }
    });
  });
});

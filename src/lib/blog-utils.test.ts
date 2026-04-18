import {
  formatDate,
  formatLongDate,
  formatShortDate,
  wasEdited,
} from "./blog-utils";

describe("blog-utils", () => {
  describe("formatDate", () => {
    it("accepts an ISO string", () => {
      const out = formatDate("2024-06-15T12:00:00.000Z");
      expect(typeof out).toBe("string");
      expect(out.length).toBeGreaterThan(0);
    });

    it("accepts a Date object", () => {
      const out = formatDate(new Date("2024-06-15T12:00:00.000Z"));
      expect(typeof out).toBe("string");
      expect(out.length).toBeGreaterThan(0);
    });

    it("returns the same value for both input types", () => {
      const iso = "2024-06-15T12:00:00.000Z";
      expect(formatDate(iso)).toBe(formatDate(new Date(iso)));
    });
  });

  describe("formatLongDate", () => {
    it("accepts an ISO string and a Date", () => {
      const iso = "2024-06-15T12:00:00.000Z";
      expect(formatLongDate(iso)).toBe(formatLongDate(new Date(iso)));
    });
  });

  describe("formatShortDate", () => {
    it("formats a Date to a non-empty string", () => {
      const out = formatShortDate(new Date("2024-06-15T12:00:00.000Z"));
      expect(typeof out).toBe("string");
      expect(out.length).toBeGreaterThan(0);
    });
  });

  describe("wasEdited", () => {
    const created = "2024-06-15T12:00:00.000Z";
    const createdMs = new Date(created).getTime();

    it("returns false when updatedAt equals createdAt", () => {
      expect(wasEdited({ createdAt: created, updatedAt: created })).toBe(false);
    });

    it("returns false at exactly 60s after createdAt (boundary)", () => {
      const updated = new Date(createdMs + 60_000).toISOString();
      expect(wasEdited({ createdAt: created, updatedAt: updated })).toBe(false);
    });

    it("returns true when updatedAt is more than 60s after createdAt", () => {
      const updated = new Date(createdMs + 60_001).toISOString();
      expect(wasEdited({ createdAt: created, updatedAt: updated })).toBe(true);
    });

    it("works with Date objects", () => {
      const createdDate = new Date(created);
      const updatedDate = new Date(createdMs + 120_000);
      expect(
        wasEdited({
          createdAt: createdDate as unknown as string,
          updatedAt: updatedDate as unknown as string,
        })
      ).toBe(true);
    });
  });
});

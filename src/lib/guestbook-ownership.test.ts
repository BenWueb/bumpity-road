import {
  getOwnedEntries,
  saveOwnedEntry,
  removeOwnedEntry,
  getTokenForEntry,
  getOwnedIds,
} from "./guestbook-ownership";

describe("guestbook-ownership", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getOwnedEntries", () => {
    it("returns an empty array when nothing is stored", () => {
      expect(getOwnedEntries()).toEqual([]);
    });

    it("returns an empty array when storage contains corrupt JSON", () => {
      localStorage.setItem("guestbook:owned", "{not valid json");
      expect(getOwnedEntries()).toEqual([]);
    });

    it("parses stored entries", () => {
      localStorage.setItem(
        "guestbook:owned",
        JSON.stringify([{ id: "a", token: "tok-a" }])
      );
      expect(getOwnedEntries()).toEqual([{ id: "a", token: "tok-a" }]);
    });
  });

  describe("saveOwnedEntry / getTokenForEntry / getOwnedIds", () => {
    it("round-trips a saved entry", () => {
      saveOwnedEntry("a", "tok-a");
      saveOwnedEntry("b", "tok-b");

      expect(getOwnedEntries()).toEqual([
        { id: "a", token: "tok-a" },
        { id: "b", token: "tok-b" },
      ]);
      expect(getTokenForEntry("a")).toBe("tok-a");
      expect(getTokenForEntry("b")).toBe("tok-b");
      expect(getOwnedIds()).toEqual(new Set(["a", "b"]));
    });

    it("getTokenForEntry returns null for unknown ids", () => {
      saveOwnedEntry("a", "tok-a");
      expect(getTokenForEntry("nope")).toBeNull();
    });
  });

  describe("removeOwnedEntry", () => {
    it("removes the entry with the given id", () => {
      saveOwnedEntry("a", "tok-a");
      saveOwnedEntry("b", "tok-b");
      removeOwnedEntry("a");

      expect(getOwnedEntries()).toEqual([{ id: "b", token: "tok-b" }]);
      expect(getTokenForEntry("a")).toBeNull();
    });

    it("is a no-op when the id doesn't exist", () => {
      saveOwnedEntry("a", "tok-a");
      removeOwnedEntry("nope");
      expect(getOwnedEntries()).toEqual([{ id: "a", token: "tok-a" }]);
    });
  });
});

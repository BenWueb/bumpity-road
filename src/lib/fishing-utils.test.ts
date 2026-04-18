import {
  getSpeciesLabel,
  getFishBehaviorLabel,
  getBaitLabel,
  getWeatherLabel,
  getWindLabel,
  getDisturbanceLabel,
  formatFishDate,
  sanitizeFilename,
  deriveSavedLocations,
  getSpeciesGradient,
  getWeatherIcon,
} from "./fishing-utils";

describe("fishing-utils", () => {
  describe("label getters", () => {
    it("getSpeciesLabel: returns label for known, input for unknown", () => {
      expect(getSpeciesLabel("walleye")).toBe("Walleye");
      expect(getSpeciesLabel("zzz")).toBe("zzz");
    });

    it("getFishBehaviorLabel: returns label for known, input for unknown", () => {
      expect(getFishBehaviorLabel("biting")).toBe("Biting / active");
      expect(getFishBehaviorLabel("zzz")).toBe("zzz");
    });

    it("getBaitLabel: returns label for known, input for unknown", () => {
      expect(getBaitLabel("live_worm")).toBe("Live worm / nightcrawler");
      expect(getBaitLabel("zzz")).toBe("zzz");
    });

    it("getWeatherLabel: returns label for known, input for unknown, '' for null", () => {
      expect(getWeatherLabel("clear")).toBe("Clear / Sunny");
      expect(getWeatherLabel("zzz")).toBe("zzz");
      expect(getWeatherLabel(null)).toBe("");
    });

    it("getWindLabel: returns label for known, input for unknown, '' for null", () => {
      expect(getWindLabel("calm")).toBe("Calm");
      expect(getWindLabel("zzz")).toBe("zzz");
      expect(getWindLabel(null)).toBe("");
    });

    it("getDisturbanceLabel: returns label for known, input for unknown, '' for null", () => {
      expect(getDisturbanceLabel("boat_traffic")).toBe("Boat traffic");
      expect(getDisturbanceLabel("zzz")).toBe("zzz");
      expect(getDisturbanceLabel(null)).toBe("");
    });
  });

  describe("formatFishDate", () => {
    it("formats an ISO date to a non-empty string", () => {
      const out = formatFishDate("2024-06-15T12:00:00.000Z");
      expect(typeof out).toBe("string");
      expect(out.length).toBeGreaterThan(0);
    });
  });

  describe("sanitizeFilename", () => {
    it("strips non-alphanumerics, collapses spaces, lowercases", () => {
      expect(sanitizeFilename("Hello, World!")).toBe("hello-world");
      expect(sanitizeFilename("My  Cool   Fish  ")).toBe("my-cool-fish-");
    });
  });

  describe("deriveSavedLocations", () => {
    it("dedupes by lakeName + lakeArea + lat/lng (5dp), increments count", () => {
      const result = deriveSavedLocations([
        { lakeName: "Lake A", lakeArea: "north", latitude: 1.123456, longitude: 2.0 },
        { lakeName: "Lake A", lakeArea: "north", latitude: 1.123459, longitude: 2.0 },
        { lakeName: "Lake B", lakeArea: null, latitude: 5.0, longitude: 6.0 },
      ]);
      expect(result).toHaveLength(2);
      const lakeA = result.find((l) => l.lakeName === "Lake A");
      expect(lakeA?.count).toBe(2);
    });

    it("skips entries with null latitude or longitude", () => {
      const result = deriveSavedLocations([
        { lakeName: "Lake A", lakeArea: null, latitude: null, longitude: 2.0 },
        { lakeName: "Lake B", lakeArea: null, latitude: 1.0, longitude: 2.0 },
      ]);
      expect(result).toHaveLength(1);
      expect(result[0].lakeName).toBe("Lake B");
    });

    it("sorts by count descending", () => {
      const result = deriveSavedLocations([
        { lakeName: "A", lakeArea: null, latitude: 1, longitude: 1 },
        { lakeName: "B", lakeArea: null, latitude: 2, longitude: 2 },
        { lakeName: "B", lakeArea: null, latitude: 2, longitude: 2 },
      ]);
      expect(result[0].lakeName).toBe("B");
      expect(result[1].lakeName).toBe("A");
    });
  });

  describe("getSpeciesGradient", () => {
    it("returns the default gradient for empty array", () => {
      expect(getSpeciesGradient([])).toContain("cyan");
    });

    it("returns the walleye gradient for walleye", () => {
      expect(getSpeciesGradient(["walleye"])).toContain("amber");
    });

    it("returns the pike/muskie gradient for pike or muskie", () => {
      expect(getSpeciesGradient(["northern_pike"])).toContain("emerald");
      expect(getSpeciesGradient(["muskie"])).toContain("emerald");
    });

    it("returns the bass gradient for smallmouth/largemouth", () => {
      expect(getSpeciesGradient(["smallmouth_bass"])).toContain("lime");
      expect(getSpeciesGradient(["largemouth_bass"])).toContain("lime");
    });

    it("returns the trout/whitefish gradient", () => {
      expect(getSpeciesGradient(["lake_trout"])).toContain("sky");
      expect(getSpeciesGradient(["whitefish"])).toContain("sky");
    });

    it("returns the panfish gradient for perch/bluegill/crappie/rock_bass", () => {
      expect(getSpeciesGradient(["perch"])).toContain("orange");
      expect(getSpeciesGradient(["bluegill"])).toContain("orange");
      expect(getSpeciesGradient(["crappie"])).toContain("orange");
      expect(getSpeciesGradient(["rock_bass"])).toContain("orange");
    });

    it("uses the first species when multiple are provided", () => {
      expect(getSpeciesGradient(["walleye", "muskie"])).toContain("amber");
    });

    it("returns the default gradient for unknown species", () => {
      expect(getSpeciesGradient(["zzz"])).toContain("cyan");
    });
  });

  describe("getWeatherIcon", () => {
    it("maps each known weather condition to an emoji", () => {
      expect(getWeatherIcon("clear")).toBe("☀️");
      expect(getWeatherIcon("rain")).toBe("🌧️");
      expect(getWeatherIcon("light_rain")).toBe("🌧️");
      expect(getWeatherIcon("fog")).toBe("🌫️");
      expect(getWeatherIcon("snow")).toBe("❄️");
    });

    it("returns empty string for null and unknown", () => {
      expect(getWeatherIcon(null)).toBe("");
      expect(getWeatherIcon("zzz")).toBe("");
    });
  });
});

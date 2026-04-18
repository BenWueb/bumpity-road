import {
  getNestingLabel,
  getWeatherLabel,
  getWindLabel,
  getDisturbanceLabel,
  getBehaviorLabel,
  formatLoonDate,
  getTotalLoons,
  sanitizeFilename,
  deriveSavedLocations,
  getNestingGradient,
  getWeatherIcon,
} from "./loon-utils";

describe("loon-utils", () => {
  describe("label getters", () => {
    it("getNestingLabel: returns label for known, input for unknown, '' for null", () => {
      expect(getNestingLabel("incubating")).toBe("Incubating eggs");
      expect(getNestingLabel("zzz")).toBe("zzz");
      expect(getNestingLabel(null)).toBe("");
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

    it("getBehaviorLabel: returns label for known, input for unknown", () => {
      expect(getBehaviorLabel("feeding")).toBe("Feeding");
      expect(getBehaviorLabel("zzz")).toBe("zzz");
    });
  });

  describe("formatLoonDate", () => {
    it("formats an ISO date to a non-empty string", () => {
      const out = formatLoonDate("2024-06-15T12:00:00.000Z");
      expect(typeof out).toBe("string");
      expect(out.length).toBeGreaterThan(0);
    });
  });

  describe("getTotalLoons", () => {
    it("sums adults + chicks + juveniles", () => {
      expect(
        getTotalLoons({ adultsCount: 2, chicksCount: 1, juvenilesCount: 3 })
      ).toBe(6);
    });

    it("returns 0 when all counts are 0", () => {
      expect(
        getTotalLoons({ adultsCount: 0, chicksCount: 0, juvenilesCount: 0 })
      ).toBe(0);
    });
  });

  describe("sanitizeFilename", () => {
    it("strips non-alphanumerics, collapses spaces, lowercases", () => {
      expect(sanitizeFilename("Hello, World!")).toBe("hello-world");
      expect(sanitizeFilename("My  Cool   Loon  ")).toBe("my-cool-loon-");
    });

    it("preserves digits and existing alphanumerics", () => {
      expect(sanitizeFilename("Loon 42 Sighting")).toBe("loon-42-sighting");
    });

    it("strips punctuation entirely", () => {
      expect(sanitizeFilename("a/b\\c.d?e")).toBe("abcde");
    });
  });

  describe("deriveSavedLocations", () => {
    it("returns empty array for empty input", () => {
      expect(deriveSavedLocations([])).toEqual([]);
    });

    it("dedupes by lakeName + lakeArea + lat/lng (5dp), increments count", () => {
      const result = deriveSavedLocations([
        { lakeName: "Lake A", lakeArea: "north", latitude: 1.123456, longitude: 2.0 },
        { lakeName: "Lake A", lakeArea: "north", latitude: 1.123459, longitude: 2.0 },
        { lakeName: "Lake A", lakeArea: "north", latitude: 1.123456, longitude: 2.0 },
        { lakeName: "Lake B", lakeArea: null, latitude: 5.0, longitude: 6.0 },
      ]);
      expect(result).toEqual([
        {
          lakeName: "Lake A",
          lakeArea: "north",
          latitude: 1.123456,
          longitude: 2.0,
          count: 3,
        },
        {
          lakeName: "Lake B",
          lakeArea: null,
          latitude: 5.0,
          longitude: 6.0,
          count: 1,
        },
      ]);
    });

    it("skips entries with null latitude or longitude", () => {
      const result = deriveSavedLocations([
        { lakeName: "Lake A", lakeArea: null, latitude: null, longitude: 2.0 },
        { lakeName: "Lake B", lakeArea: null, latitude: 1.0, longitude: null },
        { lakeName: "Lake C", lakeArea: null, latitude: 1.0, longitude: 2.0 },
      ]);
      expect(result).toHaveLength(1);
      expect(result[0].lakeName).toBe("Lake C");
    });

    it("sorts by count descending", () => {
      const result = deriveSavedLocations([
        { lakeName: "A", lakeArea: null, latitude: 1, longitude: 1 },
        { lakeName: "B", lakeArea: null, latitude: 2, longitude: 2 },
        { lakeName: "B", lakeArea: null, latitude: 2, longitude: 2 },
        { lakeName: "B", lakeArea: null, latitude: 2, longitude: 2 },
        { lakeName: "C", lakeArea: null, latitude: 3, longitude: 3 },
        { lakeName: "C", lakeArea: null, latitude: 3, longitude: 3 },
      ]);
      expect(result.map((l) => l.lakeName)).toEqual(["B", "C", "A"]);
    });
  });

  describe("getNestingGradient", () => {
    it("returns the incubating/nest_building gradient", () => {
      expect(getNestingGradient("incubating")).toContain("amber");
      expect(getNestingGradient("nest_building")).toContain("amber");
    });

    it("returns the hatched/chicks_riding gradient", () => {
      expect(getNestingGradient("hatched")).toContain("emerald");
      expect(getNestingGradient("chicks_riding")).toContain("emerald");
    });

    it("returns the failed gradient", () => {
      expect(getNestingGradient("failed")).toContain("rose");
    });

    it("returns the default sky/blue gradient for null and unknown", () => {
      expect(getNestingGradient(null)).toContain("sky");
      expect(getNestingGradient("zzz")).toContain("sky");
    });
  });

  describe("getWeatherIcon", () => {
    it("maps each known weather condition to an emoji", () => {
      expect(getWeatherIcon("clear")).toBe("☀️");
      expect(getWeatherIcon("partly_cloudy")).toBe("⛅");
      expect(getWeatherIcon("overcast")).toBe("☁️");
      expect(getWeatherIcon("light_rain")).toBe("🌧️");
      expect(getWeatherIcon("rain")).toBe("🌧️");
      expect(getWeatherIcon("fog")).toBe("🌫️");
      expect(getWeatherIcon("snow")).toBe("❄️");
    });

    it("returns empty string for null and unknown", () => {
      expect(getWeatherIcon(null)).toBe("");
      expect(getWeatherIcon("zzz")).toBe("");
    });
  });
});

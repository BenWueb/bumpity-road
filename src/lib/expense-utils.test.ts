import {
  Wrench,
  Zap,
  TreePine,
  Waves,
  Package,
  Receipt,
  Shield,
  TrendingUp,
  AlertTriangle,
  MoreHorizontal,
} from "lucide-react";
import {
  getCategoryLabel,
  getSubcategoryLabel,
  getCategoryIcon,
  getCategoryGradient,
  getCategoryColor,
  getCategoryHexColor,
  formatExpenseDate,
  formatExpenseDateShort,
  getCategoryLabelFromList,
} from "./expense-utils";
import { CARD_GRADIENTS } from "./ui-gradients";

describe("expense-utils", () => {
  describe("getCategoryLabel", () => {
    it("returns the mapped label for known categories", () => {
      expect(getCategoryLabel("maintenance")).toBe("Maintenance & Repairs");
      expect(getCategoryLabel("utilities")).toBe("Utilities & Services");
      expect(getCategoryLabel("other")).toBe("Other");
    });

    it("returns the input verbatim for unknown categories", () => {
      expect(getCategoryLabel("totally_unknown")).toBe("totally_unknown");
    });
  });

  describe("getSubcategoryLabel", () => {
    it("returns null when given null", () => {
      expect(getSubcategoryLabel(null)).toBeNull();
    });

    it("returns the mapped label for a known subcategory", () => {
      expect(getSubcategoryLabel("plumbing")).toBe("Plumbing");
      expect(getSubcategoryLabel("water_sewer")).toBe("Water & Sewer");
    });

    it("title-cases unknown subcategory values as a fallback", () => {
      expect(getSubcategoryLabel("foo_bar_baz")).toBe("Foo Bar Baz");
    });
  });

  describe("getCategoryIcon", () => {
    it("returns the expected lucide icon for known categories", () => {
      expect(getCategoryIcon("maintenance")).toBe(Wrench);
      expect(getCategoryIcon("utilities")).toBe(Zap);
      expect(getCategoryIcon("landscaping")).toBe(TreePine);
      expect(getCategoryIcon("marine")).toBe(Waves);
      expect(getCategoryIcon("supplies")).toBe(Package);
      expect(getCategoryIcon("tax_fees")).toBe(Receipt);
      expect(getCategoryIcon("insurance")).toBe(Shield);
      expect(getCategoryIcon("improvements")).toBe(TrendingUp);
      expect(getCategoryIcon("emergency")).toBe(AlertTriangle);
      expect(getCategoryIcon("other")).toBe(MoreHorizontal);
    });

    it("falls back to MoreHorizontal for unknown categories", () => {
      expect(getCategoryIcon("zzzz")).toBe(MoreHorizontal);
    });
  });

  describe("getCategoryGradient", () => {
    it("returns the mapped CARD_GRADIENT for known categories", () => {
      expect(getCategoryGradient("utilities")).toBe(CARD_GRADIENTS.emerald);
      expect(getCategoryGradient("marine")).toBe(CARD_GRADIENTS.sky);
    });

    it("falls back to slate for unknown categories", () => {
      expect(getCategoryGradient("zzzz")).toBe(CARD_GRADIENTS.slate);
    });
  });

  describe("getCategoryColor", () => {
    it("returns the mapped color for known categories", () => {
      expect(getCategoryColor("utilities")).toBe("from-emerald-500 to-emerald-600");
    });

    it("falls back to slate for unknown categories", () => {
      expect(getCategoryColor("zzzz")).toBe("from-slate-500 to-slate-600");
    });
  });

  describe("getCategoryHexColor", () => {
    it("returns the mapped hex for known categories", () => {
      expect(getCategoryHexColor("utilities")).toBe("#10b981");
    });

    it("falls back to slate-400 for unknown categories", () => {
      expect(getCategoryHexColor("zzzz")).toBe("#94a3b8");
    });
  });

  describe("formatExpenseDate", () => {
    it("returns em-dash for null", () => {
      expect(formatExpenseDate(null)).toBe("—");
    });

    it("returns a non-empty formatted string for a valid ISO date", () => {
      const out = formatExpenseDate("2024-06-15T12:00:00.000Z");
      expect(typeof out).toBe("string");
      expect(out.length).toBeGreaterThan(0);
      expect(out).not.toBe("—");
    });
  });

  describe("formatExpenseDateShort", () => {
    it("returns em-dash for null", () => {
      expect(formatExpenseDateShort(null)).toBe("—");
    });

    it("returns a non-empty formatted string for a valid ISO date", () => {
      const out = formatExpenseDateShort("2024-06-15T12:00:00.000Z");
      expect(typeof out).toBe("string");
      expect(out.length).toBeGreaterThan(0);
      expect(out).not.toBe("—");
    });
  });

  describe("getCategoryLabelFromList", () => {
    it("returns the label from EXPENSE_CATEGORIES", () => {
      expect(getCategoryLabelFromList("maintenance")).toBe(
        "Maintenance & Repairs"
      );
    });

    it("returns the input verbatim for unknown categories", () => {
      expect(getCategoryLabelFromList("zzzz")).toBe("zzzz");
    });
  });
});

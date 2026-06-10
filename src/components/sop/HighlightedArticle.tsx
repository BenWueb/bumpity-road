"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "CODE", "PRE"]);
const HIGHLIGHT_NAME = "sop-search";

// Injected at runtime: the ::highlight() pseudo-element isn't understood by the
// build-time CSS parser (Lightning CSS), so the browser parses it instead.
const HIGHLIGHT_STYLE = `::highlight(${HIGHLIGHT_NAME}){background-color:#fde68a;color:#1f2937;}.dark ::highlight(${HIGHLIGHT_NAME}){background-color:rgb(245 158 11 / 0.45);color:inherit;}`;

function ensureHighlightStyle() {
  if (typeof document === "undefined") return;
  if (document.getElementById("sop-search-highlight-style")) return;
  const style = document.createElement("style");
  style.id = "sop-search-highlight-style";
  style.textContent = HIGHLIGHT_STYLE;
  document.head.appendChild(style);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function HighlightedArticle({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const container = ref.current;
    const win = window as unknown as {
      Highlight?: new (...init: Range[]) => unknown;
      CSS?: { highlights?: Map<string, unknown> };
    };
    const highlights = win.CSS?.highlights;
    const HighlightCtor = win.Highlight;

    // Clear any previous highlight (also covers unsupported browsers gracefully).
    if (highlights) highlights.delete(HIGHLIGHT_NAME);
    if (!container || !highlights || !HighlightCtor) return;

    ensureHighlightStyle();

    const q = new URLSearchParams(window.location.search).get("q");
    if (!q) return;

    const tokens = q
      .trim()
      .split(/\s+/)
      .filter((t) => t.length >= 2)
      .map(escapeRegExp);
    if (tokens.length === 0) return;

    const testPattern = new RegExp(tokens.join("|"), "i");
    const matchPattern = new RegExp(tokens.join("|"), "gi");

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !node.nodeValue.trim())
          return NodeFilter.FILTER_REJECT;
        return testPattern.test(node.nodeValue)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    });

    const ranges: Range[] = [];
    let firstRange: Range | null = null;
    let current = walker.nextNode();
    while (current) {
      const value = current.nodeValue ?? "";
      matchPattern.lastIndex = 0;
      let match = matchPattern.exec(value);
      while (match) {
        const range = document.createRange();
        range.setStart(current, match.index);
        range.setEnd(current, match.index + match[0].length);
        ranges.push(range);
        if (!firstRange) firstRange = range;
        if (match[0].length === 0) matchPattern.lastIndex += 1;
        match = matchPattern.exec(value);
      }
      current = walker.nextNode();
    }

    if (ranges.length === 0) return;

    highlights.set(HIGHLIGHT_NAME, new HighlightCtor(...ranges) as never);

    if (firstRange) {
      const target =
        firstRange.startContainer.parentElement ?? container;
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }

    return () => {
      if (highlights) highlights.delete(HIGHLIGHT_NAME);
    };
  }, [pathname]);

  return (
    <article ref={ref} className="prose-custom">
      {children}
    </article>
  );
}

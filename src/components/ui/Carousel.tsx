"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CarouselProps = {
  children: React.ReactNode[];
  /** Auto-advance interval in ms (0 to disable). Default 5000. */
  interval?: number;
  /** Pause auto-advance on hover. Default true. */
  pauseOnHover?: boolean;
  /** Show navigation arrows. Default true. */
  showArrows?: boolean;
  /** Show dot indicators. Default true. */
  showDots?: boolean;
  className?: string;
};

export function Carousel({
  children,
  interval = 5000,
  pauseOnHover = true,
  showArrows = true,
  showDots = true,
  className = "",
}: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const count = children.length;

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % count) + count) % count);
    },
    [count]
  );

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (interval <= 0 || paused || count <= 1) return;
    timerRef.current = setInterval(next, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [interval, paused, next, count]);

  if (count === 0) return null;

  return (
    <div
      className={`group/carousel relative overflow-hidden ${className}`}
      onMouseEnter={pauseOnHover ? () => setPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setPaused(false) : undefined}
    >
      <div className="relative min-h-px">
        {children.map((child, i) => (
          <div
            key={i}
            className={`transition-opacity duration-500 ease-in-out ${
              i === current
                ? "relative opacity-100"
                : "pointer-events-none absolute inset-0 opacity-0"
            }`}
            aria-hidden={i !== current}
          >
            {child}
          </div>
        ))}
      </div>

      {showArrows && count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/50 group-hover/carousel:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/50 group-hover/carousel:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {showDots && count > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {children.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current
                  ? "w-4 bg-foreground/70"
                  : "w-1.5 bg-foreground/30 hover:bg-foreground/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

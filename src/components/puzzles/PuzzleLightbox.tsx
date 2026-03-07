"use client";

import { PuzzleEntry } from "@/types/puzzle";
import { getGradientForColor } from "@/lib/guestbook-constants";
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  entries: PuzzleEntry[];
  selectedEntry: PuzzleEntry;
  selectedIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

function formatDate(isoDate: string) {
  const d = new Date(isoDate);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const SCALE_STEP = 0.5;

export function PuzzleLightbox({
  entries,
  selectedEntry,
  selectedIndex,
  onClose,
  onPrevious,
  onNext,
}: Props) {
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const translateStart = useRef({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const lastPinchDist = useRef<number | null>(null);

  const isZoomed = scale > 1;

  const resetZoom = useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  // Reset zoom when navigating to a different puzzle
  useEffect(() => {
    resetZoom();
  }, [selectedIndex, resetZoom]);

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(s + SCALE_STEP, MAX_SCALE));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(prev - SCALE_STEP, MIN_SCALE);
      if (next === 1) setTranslate({ x: 0, y: 0 });
      return next;
    });
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" && !isZoomed) {
        e.preventDefault();
        onPrevious();
      } else if (e.key === "ArrowRight" && !isZoomed) {
        e.preventDefault();
        onNext();
      } else if (e.key === "Escape") {
        if (isZoomed) resetZoom();
        else onClose();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        zoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        resetZoom();
      }
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, onNext, onPrevious, isZoomed, resetZoom, zoomIn, zoomOut]);

  // Mouse wheel zoom
  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container) return;

    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    }

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [zoomIn, zoomOut]);

  // Pinch-to-zoom on touch
  function handleTouchStartZoom(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.hypot(dx, dy);
    } else if (e.touches.length === 1) {
      if (isZoomed) {
        setIsDragging(true);
        dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        translateStart.current = { ...translate };
      }
      touchStartX.current = e.touches[0].clientX;
    }
  }

  function handleTouchMoveZoom(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (lastPinchDist.current !== null) {
        const delta = dist - lastPinchDist.current;
        if (Math.abs(delta) > 8) {
          if (delta > 0) zoomIn();
          else zoomOut();
          lastPinchDist.current = dist;
        }
      }
    } else if (e.touches.length === 1) {
      if (isZoomed && isDragging) {
        const dx = e.touches[0].clientX - dragStart.current.x;
        const dy = e.touches[0].clientY - dragStart.current.y;
        setTranslate({
          x: translateStart.current.x + dx,
          y: translateStart.current.y + dy,
        });
      }
      touchEndX.current = e.touches[0].clientX;
    }
  }

  function handleTouchEndZoom() {
    lastPinchDist.current = null;
    if (isDragging) {
      setIsDragging(false);
      return;
    }
    if (!isZoomed) {
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 50) {
        if (diff > 0) onNext();
        else onPrevious();
      }
    }
  }

  // Mouse drag to pan when zoomed
  function handleMouseDown(e: React.MouseEvent) {
    if (!isZoomed) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    translateStart.current = { ...translate };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging || !isZoomed) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setTranslate({
      x: translateStart.current.x + dx,
      y: translateStart.current.y + dy,
    });
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  // Double-click to toggle zoom
  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (isZoomed) {
      resetZoom();
    } else {
      setScale(2.5);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 md:p-4"
      onClick={isZoomed ? undefined : onClose}
    >
      {selectedIndex > 0 && !isZoomed && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute left-4 top-1/2 z-50 hidden -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur transition-colors hover:bg-black/70 md:block"
          aria-label="Previous puzzle"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {selectedIndex < entries.length - 1 && !isZoomed && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 z-50 hidden -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur transition-colors hover:bg-black/70 md:block"
          aria-label="Next puzzle"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      <div
        className="relative flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-background shadow-2xl md:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={isZoomed ? resetZoom : onClose}
          className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-1.5 text-white backdrop-blur transition-colors hover:bg-black/70 md:right-3 md:top-3 md:p-2"
        >
          <X className="h-4 w-4 md:h-5 md:w-5" />
        </button>

        <div className="absolute left-2 top-2 z-10 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur md:left-3 md:top-3 md:px-3 md:text-sm">
          {selectedIndex + 1} / {entries.length}
        </div>

        {/* Zoom controls — horizontal, top center */}
        <div className="absolute left-1/2 top-2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/50 px-1.5 py-1 backdrop-blur md:top-3 md:gap-1.5 md:px-2 md:py-1.5">
          <button
            type="button"
            onClick={zoomOut}
            disabled={scale <= MIN_SCALE}
            className="rounded-full p-1 text-white transition-colors hover:bg-white/20 disabled:opacity-30 md:p-1.5"
            title="Zoom out (-)"
          >
            <Minus className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
          <span className="min-w-[3ch] text-center text-xs font-medium text-white md:text-sm">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={zoomIn}
            disabled={scale >= MAX_SCALE}
            className="rounded-full p-1 text-white transition-colors hover:bg-white/20 disabled:opacity-30 md:p-1.5"
            title="Zoom in (+)"
          >
            <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </button>
          {isZoomed && (
            <button
              type="button"
              onClick={resetZoom}
              className="rounded-full p-1 text-white transition-colors hover:bg-white/20 md:p-1.5"
              title="Reset zoom (0)"
            >
              <RotateCcw className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </button>
          )}
        </div>

        <div
          ref={imageContainerRef}
          className="relative flex-1 overflow-hidden bg-black/20"
          style={{ cursor: isZoomed ? (isDragging ? "grabbing" : "grab") : "zoom-in" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          onTouchStart={handleTouchStartZoom}
          onTouchMove={handleTouchMoveZoom}
          onTouchEnd={handleTouchEndZoom}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedEntry.imageUrl}
            alt={`Puzzle completed by ${selectedEntry.completedBy}`}
            className="max-h-[55vh] w-full object-contain md:max-h-[70vh]"
            draggable={false}
            style={{
              transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
              transition: isDragging ? "none" : "transform 0.2s ease-out",
              transformOrigin: "center center",
            }}
          />
        </div>

        <div className="relative shrink-0 overflow-hidden border-t">
          <div
            className={`pointer-events-none absolute inset-0 bg-linear-to-br ${getGradientForColor(
              selectedEntry.color
            )}`}
          />
          <div className="relative p-3 md:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold md:text-base">
                  {selectedEntry.completedBy}
                </h3>
                <p className="text-xs text-muted-foreground md:text-sm">
                  Completed {formatDate(selectedEntry.completedDate)}
                </p>
              </div>
            </div>

            {selectedEntry.notes && (
              <p className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground md:text-sm">
                {selectedEntry.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

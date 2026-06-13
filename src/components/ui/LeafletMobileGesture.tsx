"use client";

import { Hand } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";

const MOBILE_BREAKPOINT = 768;
const DRAG_THRESHOLD_PX = 10;
const HINT_AUTO_HIDE_MS = 1500;
const MOBILE_TOUCH_ACTION = "pan-y pinch-zoom";

function isMobileViewport() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

export function LeafletMobileGesture() {
  const map = useMap();
  const [showHint, setShowHint] = useState(false);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const hintShownRef = useRef(false);

  function clearHintTimer() {
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
  }

  function hideHint() {
    clearHintTimer();
    setShowHint(false);
    hintShownRef.current = false;
  }

  function scheduleHintHide() {
    clearHintTimer();
    hintTimerRef.current = setTimeout(() => {
      setShowHint(false);
      hintShownRef.current = false;
    }, HINT_AUTO_HIDE_MS);
  }

  function showDragHint() {
    if (hintShownRef.current) return;
    hintShownRef.current = true;
    setShowHint(true);
    scheduleHintHide();
  }

  useEffect(() => {
    if (!isMobileViewport()) return;

    const container = map.getContainer();
    const previousTouchAction = container.style.touchAction;

    function disableMapDrag() {
      map.dragging.disable();
      container.style.touchAction = MOBILE_TOUCH_ACTION;
    }

    function enableMapDrag() {
      map.dragging.enable();
      container.style.touchAction = "none";
    }

    disableMapDrag();

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length >= 2) {
        touchStartRef.current = null;
        hideHint();
        enableMapDrag();
        return;
      }

      if (e.touches.length === 1) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length >= 2) {
        touchStartRef.current = null;
        hideHint();
        enableMapDrag();
        return;
      }

      if (e.touches.length !== 1 || !touchStartRef.current) return;

      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      const distance = Math.hypot(dx, dy);

      if (distance > DRAG_THRESHOLD_PX) {
        showDragHint();
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (e.touches.length >= 2) return;

      touchStartRef.current = null;

      if (e.touches.length === 0) {
        disableMapDrag();
        scheduleHintHide();
      }
    }

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: true });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    container.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      clearHintTimer();
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("touchcancel", onTouchEnd);
      container.style.touchAction = previousTouchAction;
      map.dragging.enable();
    };
  }, [map]);

  if (!showHint) return null;

  return createPortal(
    <div
      className="pointer-events-none absolute inset-0 z-1000 flex items-center justify-center bg-black/40"
      aria-live="polite"
    >
      <div className="flex animate-pulse flex-col items-center gap-2 rounded-lg bg-black/60 px-5 py-4 text-center text-white backdrop-blur-sm">
        <Hand className="h-8 w-8" />
        <p className="max-w-[200px] text-sm font-medium">
          Use two fingers to move the map
        </p>
      </div>
    </div>,
    map.getContainer()
  );
}

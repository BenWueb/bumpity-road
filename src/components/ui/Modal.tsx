"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  /**
   * If true (default), clicking the dark overlay closes the modal.
   */
  closeOnOverlayClick?: boolean;
  /**
   * If true (default), pressing Escape closes the modal.
   */
  closeOnEscape?: boolean;
  /**
   * If true (default), shows an X button in the header when `title` is provided.
   */
  showCloseButton?: boolean;
  /**
   * Tailwind classes for the overlay container.
   */
  overlayClassName?: string;
  /**
   * Tailwind classes for the panel.
   */
  panelClassName?: string;
};

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  overlayClassName,
  panelClassName,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Disable background scroll while open
  useEffect(() => {
    if (!mounted || !isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen, mounted]);

  useEffect(() => {
    if (!mounted || !isOpen || !closeOnEscape) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeOnEscape, isOpen, mounted, onClose]);

  const overlayCls = useMemo(
    () =>
      overlayClassName ??
      "fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 md:p-4",
    [overlayClassName]
  );

  const panelCls = useMemo(
    () =>
      panelClassName ??
      "w-full max-w-md rounded-xl border bg-background p-4 shadow-xl md:p-6",
    [panelClassName]
  );

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className={overlayCls}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={panelCls}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="mb-3 flex items-center justify-between md:mb-4">
            <h2 className="text-base font-semibold md:text-lg">{title}</h2>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}



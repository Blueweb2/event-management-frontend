"use client";

import {
  useEffect,
  useId,
  type ReactNode,
} from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnOverlayClick?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  closeOnOverlayClick = true,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  /*
   * Close modal with Escape key
   */
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [isOpen, onClose]);

  /*
   * Prevent background scrolling
   */
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  /*
   * Don't render when closed
   */
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div
      className={[
        "fixed inset-0 z-50",
        "flex items-end justify-center",
        "bg-[var(--sage-dark)]/45",
        "backdrop-blur-[2px]",
        "sm:items-center sm:p-4",
      ].join(" ")}
      onMouseDown={(event) => {
        if (
          closeOnOverlayClick &&
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={
          description ? descriptionId : undefined
        }
        className={[
          "w-full",
          "bg-[var(--cream)]",
          "border border-[var(--border)]",
          "shadow-2xl",
          "rounded-t-3xl sm:rounded-2xl",
          "max-h-[90vh] overflow-y-auto",
          sizes[size],
          "animate-in fade-in zoom-in-95 duration-200",
        ].join(" ")}
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        {/* Header */}
        {(title || description) && (
          <div
            className={[
              "flex items-start justify-between gap-4",
              "border-b border-[var(--border)]",
              "p-5 sm:p-6",
            ].join(" ")}
          >
            {/* Title & Description */}
            <div className="min-w-0">
              {title && (
                <h2
                  id={titleId}
                  className="text-xl font-semibold text-[var(--sage-dark)]"
                >
                  {title}
                </h2>
              )}

              {description && (
                <p
                  id={descriptionId}
                  className="mt-1.5 text-sm leading-6 text-[var(--taupe)]"
                >
                  {description}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className={[
                "shrink-0",
                "rounded-full p-2",
                "text-[var(--taupe)]",
                "transition-all duration-200",
                "hover:bg-[var(--sage-light)]",
                "hover:text-[var(--sage-dark)]",
                "focus:outline-none",
                "focus:ring-2 focus:ring-[var(--sage)]",
                "active:scale-95",
              ].join(" ")}
            >
              <X size={20} strokeWidth={1.8} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-5 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
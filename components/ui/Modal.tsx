"use client";

import type {
  HTMLAttributes,
  ReactNode,
} from "react";

import { useEffect } from "react";

interface ModalProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = "",
  ...props
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );

      document.body.style.overflow =
        originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  const handleOverlayClick = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (
      closeOnOverlayClick &&
      event.target === event.currentTarget
    ) {
      onClose();
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-[#1F2023]/45
        p-4
        backdrop-blur-[2px]
      "
      onMouseDown={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={
        title ? "modal-title" : undefined
      }
    >
      <div
        className={`
          relative
          flex
          max-h-[90vh]
          w-full
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-[#E5E1D8]
          bg-white
          shadow-[0_20px_60px_rgba(31,32,35,0.18)]
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {/* Header */}
        {(title || description || showCloseButton) && (
          <div className="flex shrink-0 items-start justify-between border-b border-[#EEEAE2] px-5 py-4 sm:px-6 sm:py-5">
            <div className="min-w-0 pr-4">
              {title && (
                <h2
                  id="modal-title"
                  className="text-lg font-semibold tracking-[-0.01em] text-[#1F2023]"
                >
                  {title}
                </h2>
              )}

              {description && (
                <p className="mt-1 text-sm leading-5 text-[#77746D]">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  text-[#77746D]
                  transition-colors
                  hover:bg-[#F3F1EC]
                  hover:text-[#1F2023]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#B49A6A]/30
                "
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 border-t border-[#EEEAE2] bg-[#FCFBF8] px-5 py-4 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import type { ReactNode } from "react";

import Modal from "./Modal";
import Button from "./Button";

type ConfirmDialogVariant =
  | "danger"
  | "warning"
  | "default";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;

  title: string;
  description?: string;

  confirmText?: string;
  cancelText?: string;

  variant?: ConfirmDialogVariant;

  loading?: boolean;

  icon?: ReactNode;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  icon,
}: ConfirmDialogProps) {
  const iconStyles: Record<
    ConfirmDialogVariant,
    string
  > = {
    danger:
      "bg-[#FDECEC] text-[#B42318]",

    warning:
      "bg-[#FFF4D9] text-[#946A12]",

    default:
      "bg-[#F3EBDD] text-[#80683D]",
  };

  const buttonVariant =
    variant === "danger"
      ? "danger"
      : variant === "warning"
        ? "gold"
        : "primary";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      closeOnOverlayClick={!loading}
    >
      <div className="text-center">
        {/* Icon */}
        <div className="flex justify-center">
          <div
            className={`
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              ${iconStyles[variant]}
            `}
          >
            {icon || <DefaultWarningIcon />}
          </div>
        </div>

        {/* Content */}
        <h2 className="mt-4 text-lg font-semibold text-[#1F2023]">
          {title}
        </h2>

        {description && (
          <p className="mx-auto mt-2 max-w-sm text-sm leading-5 text-[#77746D]">
            {description}
          </p>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="sm:min-w-[110px]"
          >
            {cancelText}
          </Button>

          <Button
            variant={buttonVariant}
            onClick={onConfirm}
            loading={loading}
            className="sm:min-w-[110px]"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function DefaultWarningIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 2.8 19a2 2 0 0 0 1.73 3h14.94a2 2 0 0 0 1.73-3z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
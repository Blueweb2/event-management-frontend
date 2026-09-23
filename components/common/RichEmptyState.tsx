"use client";

import React from "react";
import { FolderOpen, Sparkles, Plus } from "lucide-react";

interface RichEmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export default function RichEmptyState({
  title = "No records found",
  description = "There are currently no items to display. Try adjusting your filters or create a new entry.",
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: RichEmptyStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-[#e8e1d8] bg-white/70 p-8 text-center backdrop-blur-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f4ebdd] to-[#e8dcc8] text-[#9a7b4f] shadow-sm">
        {icon || <FolderOpen size={32} />}
      </div>

      <h3 className="mt-4 text-lg font-bold text-[#29241f] sm:text-xl">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs leading-5 text-[#756d64] sm:text-sm">{description}</p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#9a7b4f] to-[#836338] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110 active:scale-[0.98]"
            >
              <Plus size={16} />
              <span>{actionLabel}</span>
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex items-center gap-2 rounded-xl border border-[#ded5cb] bg-white px-4 py-2.5 text-xs font-semibold text-[#403a34] transition hover:bg-[#f8f4ee]"
            >
              <Sparkles size={15} className="text-[#9a7b4f]" />
              <span>{secondaryActionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

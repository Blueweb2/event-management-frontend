"use client";

import { ClipboardList, Download, Plus } from "lucide-react";

interface DutiesHeaderProps {
  onAddDuty: () => void;
  onExportRoster?: () => void;
}

export default function DutiesHeader({
  onAddDuty,
  onExportRoster,
}: DutiesHeaderProps) {
  return (
    <header className="border-b border-[#eee8e1] pb-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7efe4] text-[#a7773f]">
              <ClipboardList size={16} />
            </span>

            <p className="text-sm font-semibold text-[#9a6c37]">
              Staff Duties & Operations
            </p>
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#29241f] sm:text-3xl">
            Manage Duties
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756d64]">
            Assign staff members to event duties, track checklist execution, and manage schedules.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          {onExportRoster && (
            <button
              type="button"
              onClick={onExportRoster}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#e3dbd2] bg-white px-4 text-xs sm:text-sm font-semibold text-[#403a34] shadow-sm transition hover:bg-[#f8f4ee] hover:text-[#29241f] sm:w-auto"
            >
              <Download size={17} className="text-[#a7773f] shrink-0" />
              <span>Export Roster (CSV)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAddDuty}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#b8894b] px-5 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:bg-[#a7773f] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#b8894b]/30 focus:ring-offset-2 sm:w-auto"
          >
            <Plus size={18} className="shrink-0" />
            <span>Add Duty</span>
          </button>
        </div>
      </div>
    </header>
  );
}
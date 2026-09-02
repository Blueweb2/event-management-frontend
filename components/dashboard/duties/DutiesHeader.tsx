"use client";

import { ClipboardList, Plus } from "lucide-react";

interface DutiesHeaderProps {
  onAddDuty: () => void;
}

export default function DutiesHeader({
  onAddDuty,
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
              Staff Duties
            </p>
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#29241f] sm:text-3xl">
            Manage Duties
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756d64]">
            Assign staff members to event duties and track their
            responsibilities.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddDuty}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#b8894b] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a7773f] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#b8894b]/30 focus:ring-offset-2 sm:w-auto"
        >
          <Plus size={18} />
          Add Duty
        </button>
      </div>
    </header>
  );
}
"use client";

import { ClipboardList } from "lucide-react";

import type { Duty } from "./constants";
import DutyCard from "./DutyCard";

interface DutiesListProps {
  duties: Duty[];
  onEdit: (duty: Duty) => void;
  onDelete: (duty: Duty) => void;
  onStatusChange: (duty: Duty) => void;
}

export default function DutiesList({
  duties,
  onEdit,
  onDelete,
  onStatusChange,
}: DutiesListProps) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#29241f]">
          Event Duties
        </h2>

        <p className="mt-1 text-xs text-[#9b938a]">
          {duties.length}{" "}
          {duties.length === 1 ? "duty" : "duties"} found
        </p>
      </div>

      {duties.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#ded5cb] bg-[#fdfbf8] px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f7efe4] text-[#a7773f]">
            <ClipboardList size={21} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-[#29241f]">
            No duties found
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#8d847b]">
            Try changing your filters or create a new duty.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {duties.map((duty) => (
            <DutyCard
              key={duty.id}
              duty={duty}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </section>
  );
}
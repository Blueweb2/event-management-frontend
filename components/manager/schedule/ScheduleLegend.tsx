"use client";

export default function ScheduleLegend() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 text-xs text-gray-500">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-[#4CAF50]" />
        Scheduled
      </div>

      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-[#B89563]" />
        Selected
      </div>
    </div>
  );
}
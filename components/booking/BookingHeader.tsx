import { Sparkles, CalendarPlus } from "lucide-react";

export default function BookingHeader() {
  return (
    <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-[#29241f] text-white shadow-xs">
          <CalendarPlus size={20} className="text-[#d8a86c]" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-xl font-black tracking-tight text-[#29241f]">
              Event Booking Studio
            </h1>
            <span className="hidden xs:inline-flex items-center gap-1 rounded-full bg-[#9A7B4F]/10 px-2 py-0.5 text-[10px] font-bold text-[#9A7B4F]">
              <Sparkles size={11} />
              <span>Instant Estimate</span>
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#756d64]">
            Customize services, catering, and generate your quote in minutes
          </p>
        </div>
      </div>
    </div>
  );
}
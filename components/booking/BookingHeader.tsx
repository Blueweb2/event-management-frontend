import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

interface BookingHeaderProps {
  onVoiceClick?: () => void;
}

export default function BookingHeader({ onVoiceClick }: BookingHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Link
          href="/manager"
          className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border border-[#d8cfc4] bg-[#faf8f5] text-[#29241f] hover:bg-[#eee8de] active:scale-95 transition shadow-2xs shrink-0"
          title="Return to Manager Dashboard"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-xl font-black tracking-tight text-[#29241f]">
              Create Event Proposal
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#B8894B]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#9A6C37] uppercase tracking-wider">
              <Sparkles size={11} /> AI Enabled
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#756d64]">
            Fill in event, client, food, and service details.
          </p>
        </div>
      </div>

      {onVoiceClick && (
        <button
          type="button"
          onClick={onVoiceClick}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#9A6C37] to-[#B8894B] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:brightness-105 active:scale-95 transition cursor-pointer"
        >
          <Sparkles size={13} className="text-[#FFE58F]" />
          <span>AI Voice Fill</span>
        </button>
      )}
    </div>
  );
}
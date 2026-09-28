import {ClipboardList} from "lucide-react";

export default function BookingHeader() {
  return (
    <div className="flex items-center mb-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--sage-light)] text-[var(--sage-dark)]">
        <ClipboardList size={24} />
      </div>

      <p className="text-sm font-semibold uppercase tracking-wider text-[var(--sage-dark)] ml-5">
        Event Booking
      </p>
    </div>
  );
};
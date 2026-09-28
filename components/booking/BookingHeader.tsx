import {
  CalendarDays,
  ClipboardList,
} from "lucide-react";

export default function BookingHeader() {
  return (
    <div className="mb-8">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--sage-light)] text-[var(--sage-dark)]">
        <ClipboardList size={24} />
      </div>

      <p className="text-sm font-semibold uppercase tracking-wider text-[var(--sage-dark)]">
        Event Booking
      </p>

   

 
    </div>
  );
}
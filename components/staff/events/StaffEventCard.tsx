import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";

export interface StaffEvent {
  id: string;
  name: string;
  type: string;
  date: string;
  time: string;
  location: string;
  guests: number;
  status: "Confirmed" | "Pending";
}

interface StaffEventCardProps {
  event: StaffEvent;
}

export default function StaffEventCard({
  event,
}: StaffEventCardProps) {
  const statusClasses = {
    Confirmed: "bg-[#edf5ed] text-[#557555]",
    Pending: "bg-[#fff4df] text-[#9a6c37]",
  };

  return (
    <article className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#d8cabc] hover:shadow-md sm:p-6">
      {/* Top */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-[#f7efe4] px-3 py-1 text-xs font-semibold text-[#9a6c37]">
            {event.type}
          </span>

          <h2 className="mt-3 text-lg font-bold text-[#29241f]">
            {event.name}
          </h2>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[event.status]}`}
        >
          {event.status}
        </span>
      </div>

      {/* Details */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Detail
          icon={<CalendarDays size={16} />}
          label="Date"
          value={event.date}
        />

        <Detail
          icon={<Clock3 size={16} />}
          label="Time"
          value={event.time}
        />

        <Detail
          icon={<MapPin size={16} />}
          label="Location"
          value={event.location}
        />

        <Detail
          icon={<Users size={16} />}
          label="Guests"
          value={`${event.guests} guests`}
        />
      </div>
    </article>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl bg-[#fbf8f4] p-3">
      <span className="mt-0.5 shrink-0 text-[#a7773f]">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#9b938a]">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-semibold text-[#403a34]">
          {value}
        </p>
      </div>
    </div>
  );
}
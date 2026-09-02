import {
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  ClipboardList,
  IndianRupee,
} from "lucide-react";

import Card from "@/components/ui/Card";

interface EventDetailsCardProps {
  date: string;
  time: string;
  location: string;
  guests: number;
  package: string;
  amount: string;
}

export default function EventDetailsCard({
  date,
  time,
  location,
  guests,
  package: packageName,
  amount,
}: EventDetailsCardProps) {
  return (
    <Card
      title="Event Details"
      description="Important information about this event."
      className="border-[#e8e1d8] shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Date */}
        <DetailItem
          icon={<CalendarDays size={19} />}
          label="Event Date"
          value={date}
        />

        {/* Time */}
        <DetailItem
          icon={<Clock3 size={19} />}
          label="Event Time"
          value={time}
        />

        {/* Location */}
        <DetailItem
          icon={<MapPin size={19} />}
          label="Location"
          value={location}
        />

        {/* Guests */}
        <DetailItem
          icon={<Users size={19} />}
          label="Number of Guests"
          value={`${guests} guests`}
        />

        {/* Package */}
        <DetailItem
          icon={<ClipboardList size={19} />}
          label="Package"
          value={packageName}
        />

        {/* Amount */}
        <DetailItem
          icon={<IndianRupee size={19} />}
          label="Booking Amount"
          value={amount}
        />
      </div>
    </Card>
  );
}

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DetailItem({
  icon,
  label,
  value,
}: DetailItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#eee8e1] bg-[#fdfbf8] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f7efe4] text-[#a7773f]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-[#9b938a]">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-[#29241f]">
          {value}
        </p>
      </div>
    </div>
  );
}
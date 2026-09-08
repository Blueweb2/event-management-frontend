import StaffEventCard, {
  type StaffEvent,
} from "@/components/staff/events/StaffEventCard";

interface StaffEventsListProps {
  events: StaffEvent[];
}

export default function StaffEventsList({
  events,
}: StaffEventsListProps) {
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      {events.map((event) => (
        <StaffEventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
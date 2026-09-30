import type { Event } from "@/lib/event.api";

import EventCard from "./EventCard";

interface EventListProps {
  events: Event[];
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
}

// ==========================================
// Event List
// ==========================================

export default function EventList({
  events,
  onEdit,
  onDelete,
}: EventListProps) {
  return (
    <div className="space-y-3">
      {events.map((event) => (
        <EventCard
          key={event._id}
          event={event}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
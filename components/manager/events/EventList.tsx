import type { Event } from "@/lib/event.api";

import EventCard from "./EventCard";

interface EventListProps {
  events: Event[];
}

// ==========================================
// Event List
// ==========================================

export default function EventList({
  events,
}: EventListProps) {
  return (
    <div className="space-y-3">
      {events.map((event) => (
        <EventCard
          key={event._id}
          event={event}
        />
      ))}
    </div>
  );
}
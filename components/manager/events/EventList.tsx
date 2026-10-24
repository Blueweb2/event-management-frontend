import { useMemo } from "react";
import type { Event } from "@/lib/event.api";
import type { EventFilterStatus } from "./EventFilters";
import EventCard from "./EventCard";
import EmptyEvents from "./EmptyEvents";

interface EventListProps {
  events: Event[];
  activeStatus?: EventFilterStatus;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  onStart?: (event: Event) => void;
  onAccept?: (event: Event) => void;
  onExport?: (event: Event) => void;
}

// ==========================================
// Event List with Smart Filtering & Compact Cards
// ==========================================

export default function EventList({
  events,
  activeStatus = "Ongoing",
  onEdit,
  onDelete,
  onStart,
  onAccept,
  onExport,
}: EventListProps) {
  const isCompletedStatus = (status?: string) => {
    const s = (status || "").toLowerCase();
    return s === "completed" || s === "settled" || s === "invoiced" || s === "cancelled";
  };

  const parseDateMs = (dateStr?: string) => {
    if (!dateStr) return 0;
    const t = new Date(dateStr).getTime();
    return isNaN(t) ? 0 : t;
  };

  // 1. If currently filtering by Ongoing
  if (activeStatus === "Ongoing") {
    const ongoingEvents = events
      .filter((e) => {
        const s = (e.status || "").toLowerCase();
        return (
          !isCompletedStatus(e.status) &&
          (s === "ongoing" || s === "in_progress" || s === "ready_to_start")
        );
      })
      .sort((a, b) => parseDateMs(a.eventDate) - parseDateMs(b.eventDate));

    if (ongoingEvents.length === 0) {
      return (
        <EmptyEvents
          title="No ongoing events today"
          description="There are no live events currently running."
        />
      );
    }

    return (
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h3 className="text-xs font-black uppercase tracking-wider text-[#29241f]">
            Live Ongoing Events ({ongoingEvents.length})
          </h3>
        </div>
        <div className="space-y-3">
          {ongoingEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onEdit={onEdit}
              onDelete={onDelete}
              onStart={onStart}
              onAccept={onAccept}
              onExport={onExport}
              isFeatured={true}
              compact={false}
            />
          ))}
        </div>
      </section>
    );
  }

  // 2. If currently filtering by Upcoming -> Render as small list cards
  if (activeStatus === "Upcoming") {
    const upcomingEvents = events
      .filter((e) => !isCompletedStatus(e.status))
      .sort((a, b) => parseDateMs(a.eventDate) - parseDateMs(b.eventDate));

    if (upcomingEvents.length === 0) {
      return (
        <EmptyEvents
          title="No upcoming events"
          description="No upcoming events scheduled."
        />
      );
    }

    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-200/60 pb-2.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-600">
            Upcoming Events ({upcomingEvents.length})
          </h3>
          <span className="text-[11px] font-medium text-gray-400">
            Click card to manage event details
          </span>
        </div>
        <div className="space-y-2">
          {upcomingEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onEdit={onEdit}
              onDelete={onDelete}
              onStart={onStart}
              onAccept={onAccept}
              onExport={onExport}
              compact={true}
            />
          ))}
        </div>
      </section>
    );
  }

  // 3. If currently filtering by Completed
  if (activeStatus === "Completed") {
    const completedEvents = events.sort(
      (a, b) => parseDateMs(b.eventDate) - parseDateMs(a.eventDate)
    );

    if (completedEvents.length === 0) {
      return (
        <EmptyEvents
          title="No completed events"
          description="Completed events will appear here."
        />
      );
    }

    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-200/60 pb-2.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
            Completed & Settled Events ({completedEvents.length})
          </h3>
        </div>
        <div className="space-y-2">
          {completedEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onEdit={onEdit}
              onDelete={onDelete}
              onExport={onExport}
              compact={true}
            />
          ))}
        </div>
      </section>
    );
  }

  // 4. If currently filtering by Cancelled
  if (activeStatus === "Cancelled") {
    if (events.length === 0) {
      return (
        <EmptyEvents
          title="No cancelled events"
          description="Cancelled events will appear here."
        />
      );
    }

    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-200/60 pb-2.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
            Cancelled Events ({events.length})
          </h3>
        </div>
        <div className="space-y-2">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onEdit={onEdit}
              onDelete={onDelete}
              compact={true}
            />
          ))}
        </div>
      </section>
    );
  }

  // 5. Fallback: Generic display
  return (
    <div className="space-y-2">
      {events.map((event) => (
        <EventCard
          key={event._id}
          event={event}
          onEdit={onEdit}
          onDelete={onDelete}
          onStart={onStart}
          onAccept={onAccept}
          onExport={onExport}
          compact={true}
        />
      ))}
    </div>
  );
}
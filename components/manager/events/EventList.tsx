import { useMemo } from "react";
import type { Event } from "@/lib/event.api";
import EventCard from "./EventCard";

interface EventListProps {
  events: Event[];
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
}

// ==========================================
// Event List with Smart Date & Status Sorting
// ==========================================

export function sortEventsByPriority(events: Event[]): Event[] {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();

  const isCompletedStatus = (status?: string) => {
    const s = (status || "").toLowerCase();
    return s === "completed" || s === "settled" || s === "invoiced" || s === "cancelled";
  };

  const parseDateMs = (dateStr?: string) => {
    if (!dateStr) return 0;
    const t = new Date(dateStr).getTime();
    return isNaN(t) ? 0 : t;
  };

  return [...events].sort((a, b) => {
    const aCompleted = isCompletedStatus(a.status);
    const bCompleted = isCompletedStatus(b.status);

    // 1. Completed events ALWAYS placed at the bottom
    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;

    const aTime = parseDateMs(a.eventDate);
    const bTime = parseDateMs(b.eventDate);

    // If both are NOT completed (Active, Ongoing, Upcoming):
    if (!aCompleted && !bCompleted) {
      const aIsUpcoming = aTime >= todayMs;
      const bIsUpcoming = bTime >= todayMs;

      // Upcoming (from today's date onwards) placed before past dates
      if (aIsUpcoming && !bIsUpcoming) return -1;
      if (!aIsUpcoming && bIsUpcoming) return 1;

      // Both upcoming (>= today): sort nearest first (ascending)
      if (aIsUpcoming && bIsUpcoming) {
        return aTime - bTime;
      }

      // Both past uncompleted: sort most recent past first
      return bTime - aTime;
    }

    // Both completed: sort most recent first at the bottom
    return bTime - aTime;
  });
}

export default function EventList({
  events,
  onEdit,
  onDelete,
}: EventListProps) {
  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const isCompletedStatus = (status?: string) => {
    const s = (status || "").toLowerCase();
    return s === "completed" || s === "settled" || s === "invoiced" || s === "cancelled";
  };

  const parseDateMs = (dateStr?: string) => {
    if (!dateStr) return 0;
    const t = new Date(dateStr).getTime();
    return isNaN(t) ? 0 : t;
  };

  const isEventToday = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    return d.toDateString() === now.toDateString();
  };

  // 1. In-Progress Events (Top-most, full view card - ONLY today's active in-progress events)
  const inProgressEvents = useMemo(() => {
    return events
      .filter((e) => {
        if (isCompletedStatus(e.status)) return false;
        const s = (e.status || "").toLowerCase();
        const isActiveStatus = s === "in_progress" || s === "ongoing";
        return isActiveStatus && isEventToday(e.eventDate);
      })
      .sort((a, b) => parseDateMs(a.eventDate) - parseDateMs(b.eventDate));
  }, [events]);

  const inProgressIds = useMemo(
    () => new Set(inProgressEvents.map((e) => e._id)),
    [inProgressEvents]
  );

  // 2. Upcoming Events (From today onwards, full view card)
  const upcomingEvents = useMemo(() => {
    return events
      .filter((e) => {
        if (inProgressIds.has(e._id)) return false;
        if (isCompletedStatus(e.status)) return false;
        const t = parseDateMs(e.eventDate);
        return t >= todayStart;
      })
      .sort((a, b) => parseDateMs(a.eventDate) - parseDateMs(b.eventDate));
  }, [events, inProgressIds, todayStart]);

  const upcomingIds = useMemo(
    () => new Set(upcomingEvents.map((e) => e._id)),
    [upcomingEvents]
  );

  // 3. Completed & Past Events (Bottom, small compact cards + click to elaborate)
  const completedEvents = useMemo(() => {
    return events
      .filter((e) => {
        if (inProgressIds.has(e._id) || upcomingIds.has(e._id)) return false;
        return true;
      })
      .sort((a, b) => parseDateMs(b.eventDate) - parseDateMs(a.eventDate));
  }, [events, inProgressIds, upcomingIds]);

  return (
    <div className="space-y-6">
      {/* 1. In-Progress Events (Most Top - Full View) */}
      {inProgressEvents.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#29241f]">
              In-Progress Live Events ({inProgressEvents.length})
            </h3>
          </div>
          <div className="space-y-3">
            {inProgressEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onEdit={onEdit}
                onDelete={onDelete}
                isFeatured={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. Upcoming Events (Top / Middle - Full View) */}
      {upcomingEvents.length > 0 && (
        <section className="space-y-3">
          {inProgressEvents.length > 0 && (
            <div className="flex items-center gap-2 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#756d64]">
                Upcoming Scheduled Events ({upcomingEvents.length})
              </h3>
            </div>
          )}
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onEdit={onEdit}
                onDelete={onDelete}
                isFeatured={false}
                compact={false}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. Completed & Past Events (Bottom - Small Cards + Click to Elaborate) */}
      {completedEvents.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-t border-gray-200/70 pt-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
              Completed & Settled Events ({completedEvents.length})
            </h3>
            <span className="text-[10px] font-medium text-gray-400">
              Click small card to elaborate
            </span>
          </div>

          <div className="space-y-2">
            {completedEvents.map((event) => (
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
      )}
    </div>
  );
}
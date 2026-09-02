import DashboardHeader from "@/components/dashboard/DashboardHeader";
import EventStats from "@/components/dashboard/events/EventStats";
import EventFilters from "@/components/dashboard/events/EventFilters";
import EventsTable from "@/components/dashboard/events/EventsTable";
import EventCard from "@/components/dashboard/events/EventCard";
import { events } from "@/components/dashboard/events/constants";

export default function EventsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <DashboardHeader role="manager" />

      {/* Event Statistics */}
      <EventStats />

      {/* Filters */}
      <EventFilters />

      {/* Desktop Table */}
      <div className="hidden md:block">
        <EventsTable />
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
          />
        ))}
      </div>
    </div>
  );
}
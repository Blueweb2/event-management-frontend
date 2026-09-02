import { notFound } from "next/navigation";

import EventDetailsHeader from "@/components/dashboard/events/EventDetailsHeader";
import EventDetailsCard from "@/components/dashboard/events/EventDetailsCard";
import EventCustomerCard from "@/components/dashboard/events/EventCustomerCard";
import EventActions from "@/components/dashboard/events/EventActions";

import { events } from "@/components/dashboard/events/constants";

interface EventDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventDetailsPage({
  params,
}: EventDetailsPageProps) {
  const { id } = await params;

  const event = events.find(
    (item) => String(item.id) === id,
  );

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <EventDetailsHeader
        title={event.title}
        type={event.type}
        date={event.date}
        status={event.status}
      />

      {/* Event + Customer */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <EventDetailsCard
          date={event.date}
          time={event.time}
          location={event.location}
          guests={event.guests}
          package={event.package}
          amount={event.amount}
        />

        <EventCustomerCard
          name={event.customer}
          phone="+91 98765 43210"
          email="customer@example.com"
          message="Please make sure the event setup is completed before the guests arrive."
        />
      </div>

      {/* Actions */}
      <EventActions
        eventId={event.id}
        status={event.status}
      />
    </div>
  );
}
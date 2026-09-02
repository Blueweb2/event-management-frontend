import StaffEventsHeader from "@/components/staff/events/StaffEventsHeader";
import StaffEventsList from "@/components/staff/events/StaffEventsList";

import { staffEvents } from "@/components/staff/constants";

export default function StaffEventsPage() {
  return (
    <main className="py-5 sm:py-6">
      <StaffEventsHeader />

      <StaffEventsList events={staffEvents} />
    </main>
  );
}
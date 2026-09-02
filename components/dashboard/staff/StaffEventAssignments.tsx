"use client";

import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Plus,
  Users,
} from "lucide-react";

import type { StaffEvent, StaffMember } from "./constants";
import { staffEvents } from "./constants";
import AssignStaffModal from "./AssignStaffModal";

interface StaffEventAssignmentsProps {
  staff: StaffMember;
}

/*
 * Get events that can potentially be assigned.
 *
 * For now, we collect all events from staffEvents
 * and remove the events already assigned to this staff member.
 *
 * Later, when we connect the backend, this will come
 * from the events API/database.
 */
function getAvailableEvents(staffId: string): StaffEvent[] {
  const currentStaffEvents = staffEvents[staffId] ?? [];

  const assignedEventIds = new Set(
    currentStaffEvents.map((event) => event.id)
  );

  const allEvents = Object.values(staffEvents).flat();

  const uniqueEvents = Array.from(
    new Map(
      allEvents.map((event) => [event.id, event])
    ).values()
  );

  return uniqueEvents.filter(
    (event) => !assignedEventIds.has(event.id)
  );
}

export default function StaffEventAssignments({
  staff,
}: StaffEventAssignmentsProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const events: StaffEvent[] = staffEvents[staff.id] ?? [];

  return (
    <>
      <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-[#eee8e1] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[#29241f]">
              Event Assignments
            </h2>

            <p className="mt-1 text-xs text-[#8d847b]">
              Events currently assigned to {staff.name}.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#b8894b] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#a7773f]"
          >
            <Plus size={15} />
            Assign Event
          </button>
        </div>

        {/* Assigned Events */}
        {events.length > 0 ? (
          <div className="divide-y divide-[#eee8e1]">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-5 transition hover:bg-[#fdfbf8]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Event information */}
                  <div className="flex min-w-0 gap-3">
                    <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f] sm:flex">
                      <CalendarDays size={18} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-[#29241f]">
                          {event.title}
                        </h3>

                        <span className="rounded-full bg-[#edf5ed] px-2 py-1 text-[10px] font-semibold text-[#557555]">
                          {event.status}
                        </span>
                      </div>

                      <p className="mt-1 text-xs font-medium text-[#9a6c37]">
                        {event.type}
                      </p>

                      <div className="mt-3 grid gap-2 text-xs text-[#756d64] sm:grid-cols-2">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={13} />
                          {event.date} · {event.time}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} />
                          {event.location}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Users size={13} />
                          {event.guests} guests
                        </span>

                        <span>
                          Duty:{" "}
                          <strong className="font-semibold text-[#5f574f]">
                            {event.duty}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* View Event */}
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-[#ded5cb] px-3 py-2 text-xs font-semibold text-[#5f574f] transition hover:border-[#b8894b] hover:bg-[#f8f3ec] hover:text-[#8a6435]"
                  >
                    View Event
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-[#5f574f]">
              No events assigned
            </p>

            <p className="mt-1 text-xs text-[#9b938a]">
              Assign an event to this staff member.
            </p>
          </div>
        )}
      </section>

      {/* Assign Event Modal */}
      <AssignStaffModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        staff={staff}
        events={getAvailableEvents(staff.id)}
        onAssign={(eventId) => {
          console.log("Assign event:", eventId);
          console.log("Staff:", staff.id);
        }}
      />
    </>
  );
}
import assert from "node:assert/strict";
import test from "node:test";

import { mapAssignmentToDuty } from "./duty-mapper.ts";

test("maps a populated assignment into the duty card data", () => {
  const duty = mapAssignmentToDuty({
    _id: "assignment-1",
    event: {
      _id: "event-1",
      eventName: "Wedding Celebration",
      eventType: "Wedding",
      eventDate: "2026-09-12T00:00:00.000Z",
      eventTime: "18:00",
      location: "Grand Palace Kochi",
    },
    staff: {
      id: "staff-1",
      name: "Arun Kumar",
      username: "arun",
      email: "arun@example.com",
      phone: "9999999999",
      employeeId: "STF-001",
      department: "Operations",
      location: "Kochi",
    },
    dutyTitle: "Event Setup",
    description: "Prepare the venue.",
    dutyDate: "2026-09-12T00:00:00.000Z",
    startTime: "17:00",
    endTime: "19:00",
    status: "IN_PROGRESS",
    assignedBy: "manager-1",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
  });

  assert.deepEqual(duty, {
    id: "assignment-1",
    eventId: "event-1",
    title: "Event Setup",
    event: "Wedding Celebration",
    eventDate: "2026-09-12",
    startTime: "17:00",
    endTime: "19:00",
    location: "Grand Palace Kochi",
    staffId: "staff-1",
    staffName: "Arun Kumar",
    description: "Prepare the venue.",
    status: "IN_PROGRESS",
  });
});

test("keeps assignment IDs when populated event and staff are unavailable", () => {
  const duty = mapAssignmentToDuty({
    _id: "assignment-2",
    event: "booking-2",
    staff: "staff-2",
    dutyTitle: "Guest reception",
    dutyDate: "2026-10-01",
    startTime: "10:00",
    endTime: "12:00",
    status: "ASSIGNED",
    assignedBy: "manager-1",
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
  });

  assert.deepEqual(duty, {
    id: "assignment-2",
    eventId: "booking-2",
    title: "Guest reception",
    event: "Event unavailable",
    eventDate: "2026-10-01",
    startTime: "10:00",
    endTime: "12:00",
    location: "",
    staffId: "staff-2",
    staffName: "Staff unavailable",
    description: "",
    status: "ASSIGNED",
  });
});

export type DutyStatus =
  | "Pending"
  | "Assigned"
  | "Completed";

export interface Duty {
  id: string;
  title: string;
  event: string;
  eventDate: string;
  eventTime: string;
  location: string;
  staffId: string;
  staffName: string;
  description: string;
  status: DutyStatus;
}

export const dutyStatuses: DutyStatus[] = [
  "Pending",
  "Assigned",
  "Completed",
];

export const duties: Duty[] = [
  {
    id: "DUTY-001",
    title: "Event Setup",
    event: "Wedding Celebration",
    eventDate: "Sep 12, 2026",
    eventTime: "6:00 PM",
    location: "Grand Palace Kochi",
    staffId: "STF-001",
    staffName: "Arun Kumar",
    description:
      "Complete venue setup, seating arrangement, and stage preparation.",
    status: "Assigned",
  },
  {
    id: "DUTY-002",
    title: "Food Service",
    event: "Wedding Celebration",
    eventDate: "Sep 12, 2026",
    eventTime: "6:00 PM",
    location: "Grand Palace Kochi",
    staffId: "STF-002",
    staffName: "Meera Joseph",
    description:
      "Coordinate food counters and ensure timely meal service.",
    status: "Assigned",
  },
  {
    id: "DUTY-003",
    title: "Guest Coordination",
    event: "Birthday Celebration",
    eventDate: "Sep 15, 2026",
    eventTime: "7:00 PM",
    location: "Royal Banquet Hall",
    staffId: "STF-003",
    staffName: "Rahul Das",
    description:
      "Welcome guests and coordinate guest seating and requirements.",
    status: "Assigned",
  },
  {
    id: "DUTY-004",
    title: "Photography Coordination",
    event: "Engagement Ceremony",
    eventDate: "Sep 21, 2026",
    eventTime: "5:30 PM",
    location: "Lake View Convention Centre",
    staffId: "STF-004",
    staffName: "Anjali Thomas",
    description:
      "Coordinate with the photography team and manage event timings.",
    status: "Pending",
  },
  {
    id: "DUTY-005",
    title: "Venue Preparation",
    event: "Corporate Conference",
    eventDate: "Sep 18, 2026",
    eventTime: "10:00 AM",
    location: "Business Centre Kochi",
    staffId: "",
    staffName: "Unassigned",
    description:
      "Prepare conference hall, seating, registration desk, and equipment.",
    status: "Pending",
  },
  {
    id: "DUTY-006",
    title: "Cleanup",
    event: "Birthday Celebration",
    eventDate: "Sep 15, 2026",
    eventTime: "7:00 PM",
    location: "Royal Banquet Hall",
    staffId: "STF-005",
    staffName: "Vishnu Raj",
    description:
      "Handle post-event cleanup and ensure the venue is restored.",
    status: "Completed",
  },
];

export const dutyStats = {
  total: duties.length,
  pending: duties.filter((duty) => duty.status === "Pending").length,
  assigned: duties.filter((duty) => duty.status === "Assigned").length,
  completed: duties.filter((duty) => duty.status === "Completed").length,
};

export const availableStaff = [
  {
    id: "STF-001",
    name: "Arun Kumar",
  },
  {
    id: "STF-002",
    name: "Meera Joseph",
  },
  {
    id: "STF-003",
    name: "Rahul Das",
  },
  {
    id: "STF-004",
    name: "Anjali Thomas",
  },
  {
    id: "STF-005",
    name: "Vishnu Raj",
  },
];
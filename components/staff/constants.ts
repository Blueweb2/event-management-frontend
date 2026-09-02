export type EmploymentType = "Regular" | "Part-Time";

export type StaffStatus = "Active" | "Inactive";

export type DutyStatus =
  | "Pending"
  | "In Progress"
  | "Completed";

export type EventStatus =
  | "Confirmed"
  | "Pending";

export interface StaffProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  employmentType: EmploymentType;
  status: StaffStatus;
  joinedDate: string;
  location: string;
}

export interface StaffDuty {
  id: string;
  title: string;
  event: string;
  eventDate: string;
  eventTime: string;
  location: string;
  description: string;
  status: DutyStatus;
}

export interface StaffEvent {
  id: string;
  name: string;
  type: string;
  date: string;
  time: string;
  location: string;
  guests: number;
  status: EventStatus;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: "Present" | "Absent" | "Late";
  hours: string;
}

export const currentStaff: StaffProfile = {
  id: "STF-001",
  name: "Arun Kumar",
  phone: "+91 98765 43210",
  email: "arun@example.com",
  role: "Event Coordinator",
  employmentType: "Regular",
  status: "Active",
  joinedDate: "January 15, 2026",
  location: "Kochi, Kerala",
};

export const staffDuties: StaffDuty[] = [
  {
    id: "DUTY-001",
    title: "Event Setup",
    event: "Wedding Celebration",
    eventDate: "Sep 12, 2026",
    eventTime: "5:00 PM",
    location: "Grand Palace Kochi",
    description:
      "Complete venue setup, seating arrangement, and stage preparation.",
    status: "Pending",
  },
  {
    id: "DUTY-002",
    title: "Guest Coordination",
    event: "Birthday Celebration",
    eventDate: "Sep 15, 2026",
    eventTime: "6:30 PM",
    location: "Royal Banquet Hall",
    description:
      "Welcome guests and coordinate seating arrangements.",
    status: "In Progress",
  },
  {
    id: "DUTY-003",
    title: "Equipment Check",
    event: "Corporate Conference",
    eventDate: "Sep 18, 2026",
    eventTime: "8:30 AM",
    location: "Business Centre Kochi",
    description:
      "Check microphones, projector, speakers, and presentation equipment.",
    status: "Completed",
  },
  {
    id: "DUTY-004",
    title: "Venue Coordination",
    event: "Engagement Ceremony",
    eventDate: "Sep 21, 2026",
    eventTime: "4:00 PM",
    location: "Lake View Convention Centre",
    description:
      "Coordinate with the venue team before guest arrival.",
    status: "Pending",
  },
];

export const staffEvents: StaffEvent[] = [
  {
    id: "EVT-001",
    name: "Wedding Celebration",
    type: "Wedding",
    date: "Sep 12, 2026",
    time: "6:00 PM",
    location: "Grand Palace Kochi",
    guests: 250,
    status: "Confirmed",
  },
  {
    id: "EVT-002",
    name: "Birthday Celebration",
    type: "Birthday",
    date: "Sep 15, 2026",
    time: "7:00 PM",
    location: "Royal Banquet Hall",
    guests: 80,
    status: "Confirmed",
  },
  {
    id: "EVT-003",
    name: "Corporate Conference",
    type: "Corporate Event",
    date: "Sep 18, 2026",
    time: "10:00 AM",
    location: "Business Centre Kochi",
    guests: 120,
    status: "Pending",
  },
  {
    id: "EVT-004",
    name: "Engagement Ceremony",
    type: "Engagement",
    date: "Sep 21, 2026",
    time: "5:30 PM",
    location: "Lake View Convention Centre",
    guests: 150,
    status: "Confirmed",
  },
];

export const attendanceRecords: AttendanceRecord[] = [
  {
    id: "ATT-001",
    date: "Sep 01, 2026",
    checkIn: "08:55 AM",
    checkOut: "05:30 PM",
    status: "Present",
    hours: "8h 35m",
  },
  {
    id: "ATT-002",
    date: "Aug 31, 2026",
    checkIn: "09:10 AM",
    checkOut: "05:40 PM",
    status: "Late",
    hours: "8h 30m",
  },
  {
    id: "ATT-003",
    date: "Aug 30, 2026",
    checkIn: "08:50 AM",
    checkOut: "05:20 PM",
    status: "Present",
    hours: "8h 30m",
  },
  {
    id: "ATT-004",
    date: "Aug 29, 2026",
    checkIn: "09:00 AM",
    checkOut: "05:15 PM",
    status: "Present",
    hours: "8h 15m",
  },
  {
    id: "ATT-005",
    date: "Aug 28, 2026",
    checkIn: "-",
    checkOut: "-",
    status: "Absent",
    hours: "-",
  },
];

export const staffStats = {
  upcomingEvents: staffEvents.length,

  assignedDuties: staffDuties.filter(
    (duty) => duty.status !== "Completed"
  ).length,

  completedDuties: staffDuties.filter(
    (duty) => duty.status === "Completed"
  ).length,

  pendingDuties: staffDuties.filter(
    (duty) => duty.status === "Pending"
  ).length,
};

export type LeaveStatus =
  | "Pending"
  | "Approved"
  | "Rejected";

export interface LeaveRequest {
  id: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveStatus;
}

export const leaveRequests: LeaveRequest[] = [
  {
    id: "LEAVE-001",
    fromDate: "Sep 25, 2026",
    toDate: "Sep 26, 2026",
    reason: "Personal work",
    status: "Pending",
  },
];
export type DutyStatus = "Pending" | "In Progress" | "Completed";

export interface StaffDuty {
  id: string;
  title: string;
  eventName: string;
  event?: string;
  date: string;
  eventDate?: string;
  time: string;
  eventTime?: string;
  location: string;
  role: string;
  status: DutyStatus;
  priority: "High" | "Medium" | "Low";
  description: string;
}

export const staffDuties: StaffDuty[] = [
  {
    id: "DUTY-001",
    title: "Audio/Visual Console Coordination",
    eventName: "Annual Corporate Gala 2026",
    event: "Annual Corporate Gala 2026",
    date: "18 Dec 2026",
    eventDate: "18 Dec 2026",
    time: "4:00 PM - 10:30 PM",
    eventTime: "4:00 PM - 10:30 PM",
    location: "The Grand Hyatt, Ballroom A",
    role: "Technical Crew Lead",
    status: "In Progress",
    priority: "High",
    description: "Manage sound checks, speaker microphones, presentation slides, and ambient lighting.",
  },
  {
    id: "DUTY-002",
    title: "VIP Guest Welcoming & Escort",
    eventName: "Royal Palace Wedding Reception",
    event: "Royal Palace Wedding Reception",
    date: "20 Dec 2026",
    eventDate: "20 Dec 2026",
    time: "5:00 PM - 9:00 PM",
    eventTime: "5:00 PM - 9:00 PM",
    location: "Royal Palace, North Gate",
    role: "Guest Relations",
    status: "Pending",
    priority: "Medium",
    description: "Coordinate guest check-in, seat VIP dignitaries, and manage reception ushering.",
  },
  {
    id: "DUTY-003",
    title: "Stage Setup & Banner Assembly",
    eventName: "Tech Convention Product Launch",
    date: "22 Dec 2026",
    time: "9:00 AM - 1:00 PM",
    location: "Tech Convention Center, Hall 3",
    role: "Floor Setup Staff",
    status: "Pending",
    priority: "Medium",
    description: "Assemble stage backdrop, podium logos, exhibitor banners, and safety stanchions.",
  },
];

export interface StaffEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  role: string;
  manager: string;
  status: "Confirmed" | "Upcoming" | "Completed";
}

export const staffEvents: StaffEvent[] = [
  {
    id: "EVT-1048",
    title: "Annual Corporate Gala 2026",
    type: "Corporate",
    date: "18 Dec 2026",
    time: "6:00 PM - 11:00 PM",
    location: "The Grand Hyatt",
    role: "Lead Technician",
    manager: "Sarah Jenkins",
    status: "Confirmed",
  },
  {
    id: "EVT-1047",
    title: "Royal Palace Wedding Reception",
    type: "Wedding",
    date: "20 Dec 2026",
    time: "5:30 PM - 11:30 PM",
    location: "Royal Palace Grounds",
    role: "Guest Coordination",
    manager: "Marcus Vance",
    status: "Confirmed",
  },
  {
    id: "EVT-1046",
    title: "Tech Convention Product Launch",
    type: "Conference",
    date: "22 Dec 2026",
    time: "8:30 AM - 4:00 PM",
    location: "Tech Convention Center",
    role: "Floor Operations",
    manager: "Elena Rostova",
    status: "Upcoming",
  },
];

export interface ScheduleItem {
  id: string;
  day: string;
  date: string;
  shift: string;
  eventName: string;
  location: string;
  status: "Scheduled" | "Completed" | "Off";
}

export const staffSchedule: ScheduleItem[] = [
  {
    id: "SCH-1",
    day: "Mon",
    date: "15 Dec",
    shift: "09:00 AM - 05:00 PM",
    eventName: "Inventory & Equipment Check",
    location: "Central Warehouse",
    status: "Completed",
  },
  {
    id: "SCH-2",
    day: "Wed",
    date: "17 Dec",
    shift: "02:00 PM - 08:00 PM",
    eventName: "Rehearsal & Rigging",
    location: "The Grand Hyatt",
    status: "Completed",
  },
  {
    id: "SCH-3",
    day: "Fri",
    date: "18 Dec",
    shift: "04:00 PM - 11:30 PM",
    eventName: "Corporate Gala Live Event",
    location: "The Grand Hyatt",
    status: "Scheduled",
  },
];

export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  duration?: string;
  hours: string;
  eventName?: string;
  status: "Present" | "Absent" | "Late";
}

export const attendanceRecords: AttendanceRecord[] = [
  {
    id: "ATT-1",
    date: "17 Dec 2026",
    checkIn: "01:55 PM",
    checkOut: "08:05 PM",
    hours: "6h 10m",
    status: "Present",
  },
  {
    id: "ATT-2",
    date: "15 Dec 2026",
    checkIn: "09:02 AM",
    checkOut: "05:00 PM",
    hours: "7h 58m",
    status: "Present",
  },
  {
    id: "ATT-3",
    date: "12 Dec 2026",
    checkIn: "10:15 AM",
    checkOut: "06:00 PM",
    hours: "7h 45m",
    status: "Late",
  },
];

export const currentStaff = {
  id: "STF-001",
  name: "Arun Kumar",
  email: "staff@eventmanagement.com",
  role: "staff",
  employmentType: "Part-Time",
};

export interface LeaveRequest {
  id: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  type?: string;
}

export const leaveRequests: LeaveRequest[] = [
  {
    id: "LEV-1",
    fromDate: "2026-12-24",
    toDate: "2026-12-26",
    reason: "Family holiday commitment",
    status: "Approved",
    type: "Personal Leave",
  },
  {
    id: "LEV-2",
    fromDate: "2026-12-31",
    toDate: "2027-01-01",
    reason: "New Year celebration",
    status: "Pending",
    type: "Casual Leave",
  },
];

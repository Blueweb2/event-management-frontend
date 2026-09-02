export type StaffStatus = "Available" | "Busy" | "Off Duty";

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  status: StaffStatus;
  department: string;
  joinedDate: string;
  experience: string;
  upcomingEvents: number;
  completedEvents: number;
}

export interface StaffEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  guests: number;
  status: "Confirmed" | "Pending" | "Completed";
  duty: string;
}

export const staffMembers: StaffMember[] = [
  {
    id: "STF-001",
    name: "Anu Thomas",
    role: "Event Coordinator",
    phone: "+91 98765 11223",
    email: "anu@example.com",
    status: "Available",
    department: "Event Management",
    joinedDate: "January 12, 2025",
    experience: "4 years",
    upcomingEvents: 3,
    completedEvents: 28,
  },
  {
    id: "STF-002",
    name: "Rahul Raj",
    role: "Catering Staff",
    phone: "+91 98765 22334",
    email: "rahul@example.com",
    status: "Busy",
    department: "Catering",
    joinedDate: "March 8, 2025",
    experience: "3 years",
    upcomingEvents: 2,
    completedEvents: 21,
  },
  {
    id: "STF-003",
    name: "Meera Joseph",
    role: "Decoration Specialist",
    phone: "+91 91234 33445",
    email: "meera@example.com",
    status: "Available",
    department: "Decoration",
    joinedDate: "February 18, 2024",
    experience: "5 years",
    upcomingEvents: 4,
    completedEvents: 35,
  },
  {
    id: "STF-004",
    name: "Arun Kumar",
    role: "Photographer",
    phone: "+91 99887 44556",
    email: "arun@example.com",
    status: "Off Duty",
    department: "Photography",
    joinedDate: "June 22, 2025",
    experience: "2 years",
    upcomingEvents: 0,
    completedEvents: 16,
  },
  {
    id: "STF-005",
    name: "Priya Nair",
    role: "Event Coordinator",
    phone: "+91 87654 55667",
    email: "priya@example.com",
    status: "Available",
    department: "Event Management",
    joinedDate: "September 10, 2024",
    experience: "4 years",
    upcomingEvents: 2,
    completedEvents: 24,
  },
  {
    id: "STF-006",
    name: "Vishnu Menon",
    role: "Catering Staff",
    phone: "+91 94444 66778",
    email: "vishnu@example.com",
    status: "Busy",
    department: "Catering",
    joinedDate: "November 5, 2024",
    experience: "3 years",
    upcomingEvents: 3,
    completedEvents: 19,
  },
  {
    id: "STF-007",
    name: "Fathima Ali",
    role: "Decoration Specialist",
    phone: "+91 88990 77889",
    email: "fathima@example.com",
    status: "Available",
    department: "Decoration",
    joinedDate: "April 15, 2025",
    experience: "2 years",
    upcomingEvents: 1,
    completedEvents: 13,
  },
  {
    id: "STF-008",
    name: "Joseph Mathew",
    role: "Security Staff",
    phone: "+91 97777 88990",
    email: "joseph@example.com",
    status: "Available",
    department: "Security",
    joinedDate: "January 20, 2025",
    experience: "4 years",
    upcomingEvents: 2,
    completedEvents: 22,
  },
];

export const staffEvents: Record<string, StaffEvent[]> = {
  "STF-001": [
    {
      id: "EVT-001",
      title: "Wedding Celebration",
      type: "Wedding",
      date: "Sep 12, 2026",
      time: "6:00 PM",
      location: "Grand Palace, Kochi",
      guests: 250,
      status: "Confirmed",
      duty: "Event Coordination",
    },
    {
      id: "EVT-002",
      title: "Birthday Celebration",
      type: "Birthday",
      date: "Sep 15, 2026",
      time: "7:00 PM",
      location: "Royal Banquet Hall",
      guests: 80,
      status: "Confirmed",
      duty: "Event Coordination",
    },
    {
      id: "EVT-003",
      title: "Corporate Conference",
      type: "Corporate Event",
      date: "Sep 18, 2026",
      time: "10:00 AM",
      location: "Business Centre, Kochi",
      guests: 120,
      status: "Pending",
      duty: "Event Coordination",
    },
  ],

  "STF-002": [
    {
      id: "EVT-001",
      title: "Wedding Celebration",
      type: "Wedding",
      date: "Sep 12, 2026",
      time: "6:00 PM",
      location: "Grand Palace, Kochi",
      guests: 250,
      status: "Confirmed",
      duty: "Catering",
    },
    {
      id: "EVT-004",
      title: "Engagement Ceremony",
      type: "Engagement",
      date: "Sep 21, 2026",
      time: "5:30 PM",
      location: "Lake View Convention Centre",
      guests: 150,
      status: "Confirmed",
      duty: "Catering",
    },
  ],

  "STF-003": [
    {
      id: "EVT-001",
      title: "Wedding Celebration",
      type: "Wedding",
      date: "Sep 12, 2026",
      time: "6:00 PM",
      location: "Grand Palace, Kochi",
      guests: 250,
      status: "Confirmed",
      duty: "Decoration",
    },
    {
      id: "EVT-004",
      title: "Engagement Ceremony",
      type: "Engagement",
      date: "Sep 21, 2026",
      time: "5:30 PM",
      location: "Lake View Convention Centre",
      guests: 150,
      status: "Confirmed",
      duty: "Decoration",
    },
  ],
};

export const staffStats = {
  total: staffMembers.length,
  available: staffMembers.filter(
    (staff) => staff.status === "Available"
  ).length,
  busy: staffMembers.filter(
    (staff) => staff.status === "Busy"
  ).length,
  offDuty: staffMembers.filter(
    (staff) => staff.status === "Off Duty"
  ).length,
};
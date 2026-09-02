export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  bookings: number;
  lastBooking: string;
  status: "Active" | "Inactive";
  joinedDate: string;
}

export const customerStatusOptions = [
  "All",
  "Active",
  "Inactive",
] as const;

export type CustomerStatus =
  (typeof customerStatusOptions)[number];

export const customers: Customer[] = [
  {
    id: "CUS-001",
    name: "Anjali Menon",
    phone: "+91 98765 43210",
    email: "anjali@example.com",
    location: "Kochi, Kerala",
    bookings: 3,
    lastBooking: "Sep 12, 2026",
    status: "Active",
    joinedDate: "January 15, 2026",
  },
  {
    id: "CUS-002",
    name: "Rahul Kumar",
    phone: "+91 98765 12345",
    email: "rahul@example.com",
    location: "Ernakulam, Kerala",
    bookings: 1,
    lastBooking: "Sep 15, 2026",
    status: "Active",
    joinedDate: "March 8, 2026",
  },
  {
    id: "CUS-003",
    name: "Meera Nair",
    phone: "+91 91234 56789",
    email: "meera@example.com",
    location: "Kottayam, Kerala",
    bookings: 4,
    lastBooking: "Sep 21, 2026",
    status: "Active",
    joinedDate: "December 20, 2025",
  },
  {
    id: "CUS-004",
    name: "Arjun Thomas",
    phone: "+91 99887 66554",
    email: "arjun@example.com",
    location: "Thrissur, Kerala",
    bookings: 2,
    lastBooking: "Sep 18, 2026",
    status: "Active",
    joinedDate: "February 12, 2026",
  },
  {
    id: "CUS-005",
    name: "Neha Joseph",
    phone: "+91 87654 32109",
    email: "neha@example.com",
    location: "Alappuzha, Kerala",
    bookings: 1,
    lastBooking: "Aug 28, 2026",
    status: "Inactive",
    joinedDate: "November 5, 2025",
  },
  {
    id: "CUS-006",
    name: "Vishnu Raj",
    phone: "+91 94444 55667",
    email: "vishnu@example.com",
    location: "Kollam, Kerala",
    bookings: 2,
    lastBooking: "Aug 24, 2026",
    status: "Active",
    joinedDate: "April 18, 2026",
  },
  {
    id: "CUS-007",
    name: "Priya Menon",
    phone: "+91 88990 11223",
    email: "priya@example.com",
    location: "Kochi, Kerala",
    bookings: 5,
    lastBooking: "Aug 20, 2026",
    status: "Active",
    joinedDate: "October 11, 2025",
  },
  {
    id: "CUS-008",
    name: "Joseph Mathew",
    phone: "+91 97777 88990",
    email: "joseph@example.com",
    location: "Calicut, Kerala",
    bookings: 1,
    lastBooking: "Aug 16, 2026",
    status: "Inactive",
    joinedDate: "May 2, 2026",
  },
];

export const customerStats = {
  total: customers.length,

  active: customers.filter(
    (customer) => customer.status === "Active",
  ).length,

  inactive: customers.filter(
    (customer) => customer.status === "Inactive",
  ).length,

  returning: customers.filter(
    (customer) => customer.bookings > 1,
  ).length,
};

export const customerBookings = [
  {
    id: "BK-001",
    event: "Wedding Celebration",
    type: "Wedding",
    date: "Sep 12, 2026",
    time: "6:00 PM",
    location: "Grand Palace, Kochi",
    guests: 250,
    package: "Premium",
    amount: 85000,
    status: "Confirmed" as const,
  },
  {
    id: "BK-003",
    event: "Engagement Ceremony",
    type: "Engagement",
    date: "Jun 20, 2026",
    time: "5:30 PM",
    location: "Lake View Convention Centre",
    guests: 150,
    package: "Medium",
    amount: 50000,
    status: "Completed" as const,
  },
  {
    id: "BK-005",
    event: "Birthday Celebration",
    type: "Birthday",
    date: "Mar 15, 2026",
    time: "7:00 PM",
    location: "Royal Banquet Hall",
    guests: 80,
    package: "Starter",
    amount: 25000,
    status: "Completed" as const,
  },
];
export interface MonthlyReport {
  month: string;
  bookings: number;
  revenue: number;
}

export interface EventTypeReport {
  type: string;
  count: number;
  percentage: number;
}

export interface BookingStatusReport {
  status: "Confirmed" | "Pending" | "Completed" | "Cancelled";
  count: number;
}

export const monthlyReports: MonthlyReport[] = [
  {
    month: "Apr",
    bookings: 12,
    revenue: 85000,
  },
  {
    month: "May",
    bookings: 18,
    revenue: 125000,
  },
  {
    month: "Jun",
    bookings: 21,
    revenue: 148000,
  },
  {
    month: "Jul",
    bookings: 17,
    revenue: 119000,
  },
  {
    month: "Aug",
    bookings: 26,
    revenue: 176000,
  },
  {
    month: "Sep",
    bookings: 24,
    revenue: 164000,
  },
];

export const eventTypeReports: EventTypeReport[] = [
  {
    type: "Wedding",
    count: 38,
    percentage: 40,
  },
  {
    type: "Engagement",
    count: 22,
    percentage: 23,
  },
  {
    type: "Birthday",
    count: 18,
    percentage: 19,
  },
  {
    type: "Corporate Event",
    count: 12,
    percentage: 13,
  },
  {
    type: "Family Function",
    count: 5,
    percentage: 5,
  },
];

export const bookingStatusReports: BookingStatusReport[] = [
  {
    status: "Confirmed",
    count: 42,
  },
  {
    status: "Pending",
    count: 18,
  },
  {
    status: "Completed",
    count: 61,
  },
  {
    status: "Cancelled",
    count: 7,
  },
];

export const reportSummary = {
  totalRevenue: 817000,
  totalBookings: 128,
  totalCustomers: 96,
  completedBookings: 61,
  cancelledBookings: 7,
  averageBookingValue: 6383,
};
import DashboardHeader from "@/components/dashboard/DashboardHeader";

import ReportsHeader from "@/components/dashboard/reports/ReportsHeader";
import ReportStats from "@/components/dashboard/reports/ReportStats";
import RevenueReport from "@/components/dashboard/reports/RevenueReport";
import BookingReport from "@/components/dashboard/reports/BookingReport";
import EventTypeReport from "@/components/dashboard/reports/EventTypeReport";
import CustomerReport from "@/components/dashboard/reports/CustomerReport";
import BookingStatusReport from "@/components/dashboard/reports/BookingStatusReport";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader role="manager" />

      <ReportsHeader />

      <ReportStats />

      {/* Revenue + Bookings */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueReport />

        <BookingReport />
      </div>

      {/* Event types + Customers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <EventTypeReport />

        <CustomerReport />
      </div>

      {/* Booking status */}
      <BookingStatusReport />
    </div>
  );
}
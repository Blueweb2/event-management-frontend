import DashboardHeader from "./DashboardHeader";
import StatsCards from "./StatsCards";
import UpcomingEvents from "./UpcomingEvents";
import RecentBookings from "./RecentBookings";
import QuickActions from "./QuickActions";

interface DashboardOverviewProps {
  role?: "manager" | "staff";
}

export default function DashboardOverview({
  role = "manager",
}: DashboardOverviewProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <DashboardHeader role={role} />

      {/* Statistics */}
      <StatsCards />

      {/* Upcoming Events */}
      <UpcomingEvents />

      {/* Recent Bookings + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <RecentBookings />

        <QuickActions />
      </div>
    </div>
  );
}
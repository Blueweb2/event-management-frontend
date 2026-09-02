import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsCards from "@/components/dashboard/StatsCards";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import RecentBookings from "@/components/dashboard/RecentBookings";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader role="manager" />

      <StatsCards />

      <UpcomingEvents />

      <RecentBookings />
    </div>
  );
}
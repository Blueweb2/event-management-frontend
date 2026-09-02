import StatsCards from "@/components/dashboard/StatsCards";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import RecentBookings from "@/components/dashboard/RecentBookings";
import QuickActions from "@/components/dashboard/QuickActions";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <StatsCards />

      <UpcomingEvents />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <RecentBookings />
        <QuickActions />
      </div>
    </div>
  );
}
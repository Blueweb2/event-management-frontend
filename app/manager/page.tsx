import ManagerStats from "@/components/manager/dashboard/ManagerStats";
import UpcomingEvents from "@/components/manager/dashboard/UpcomingEvents";
import TodaySchedule from "@/components/manager/dashboard/TodaySchedule";
import RecentActivity from "@/components/manager/dashboard/RecentActivity";

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <section>
        <p className="text-sm font-medium text-[#9A7B4F]">
          Welcome back
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1F1F1F]">
          Good morning, Manager 👋
        </h1>

        <p className="mt-1 text-sm leading-5 text-gray-500">
          Here&apos;s what&apos;s happening with your events today.
        </p>
      </section>

      {/* Dashboard Stats */}
      <ManagerStats />

      {/* Upcoming Events */}
      <UpcomingEvents />

      {/* Today's Schedule */}
      <TodaySchedule />

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
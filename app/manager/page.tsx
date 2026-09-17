import Link from "next/link";
import ManagerStats from "@/components/manager/dashboard/ManagerStats";
import UpcomingEvents from "@/components/manager/dashboard/UpcomingEvents";

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#9A7B4F]">
            Welcome back
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1F1F1F]">
            Good morning, Manager 👋
          </h1>

          <p className="mt-1 text-sm leading-5 text-gray-500">
            Here&apos;s what&apos;s happening with your events today.
          </p>
        </div>

        <Link
          href="/booking"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#252525] px-5 text-sm font-semibold text-white transition active:scale-[0.98] sm:h-12 shrink-0 hover:bg-[#1f1f1f]"
        >
          New Booking
        </Link>
      </section>

      {/* Dashboard Stats */}
      <ManagerStats />

      {/* Upcoming Events */}
      <UpcomingEvents />

      {/* Today's Schedule
      <TodaySchedule /> */}

      {/* Recent Activity
      <RecentActivity /> */}
    </div>
  );
}
import StaffHeader from "@/components/staff/StaffHeader";
import StaffStats from "@/components/staff/StaffStats";
import TodayDuties from "@/components/staff/TodayDuties";
import UpcomingEvents from "@/components/staff/UpcomingEvents";

export default function StaffHomePage() {
  return (
    <main className="space-y-6 py-5 sm:space-y-8 sm:py-6">
      <StaffHeader />

      <section>
        <p className="text-sm font-semibold text-[#9a6c37]">
          Staff Portal
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#29241f] sm:text-3xl">
          Good morning, Arun 👋
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#756d64]">
          Here&apos;s your schedule and assigned work for today.
        </p>
      </section>

      <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b938a]">
              Today
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#29241f]">
              Your work is ready
            </h2>

            <p className="mt-1 text-sm text-[#756d64]">
              Check your duties and upcoming events.
            </p>
          </div>

          <div className="w-fit rounded-xl bg-[#edf5ed] px-4 py-3">
            <p className="text-xs font-medium text-[#557555]">
              Employment
            </p>

            <p className="mt-1 text-sm font-bold text-[#3f5f3f]">
              Regular Staff
            </p>
          </div>
        </div>
      </section>

      <StaffStats />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <TodayDuties />
        <UpcomingEvents />
      </div>
    </main>
  );
}
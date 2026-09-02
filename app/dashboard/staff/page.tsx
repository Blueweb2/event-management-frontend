import StaffStats from "@/components/dashboard/staff/StaffStats";
import StaffFilters from "@/components/dashboard/staff/StaffFilters";
import StaffList from "@/components/dashboard/staff/StaffList";
import StaffWorkload from "@/components/dashboard/staff/StaffWorkload";

export default function StaffPage() {
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <p className="text-sm font-semibold text-[#9a6c37]">
          Manager
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#29241f]">
          Staff Management
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#756d64]">
          View staff members, availability, workload, and event
          assignments.
        </p>
      </div>

      {/* Staff statistics */}
      <StaffStats />

        <StaffWorkload />

      {/* Filters */}
      <StaffFilters />

      {/* Staff list */}
      <StaffList />
    </div>
  );
}
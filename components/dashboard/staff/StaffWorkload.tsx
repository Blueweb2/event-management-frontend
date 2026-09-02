"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  UserRound,
  Users,
} from "lucide-react";

import {
  staffMembers,
  staffEvents,
  type StaffMember,
} from "./constants";

interface StaffWorkloadItem {
  staff: StaffMember;
  assigned: number;
  capacity: number;
  percentage: number;
  workload: "Low" | "Medium" | "High";
}

function getWorkloadData(): StaffWorkloadItem[] {
  return staffMembers.map((staff) => {
    const assigned = staffEvents[staff.id]?.length ?? 0;

    /*
     * For now each staff member can handle
     * up to 4 active event assignments.
     *
     * This can later come from the backend.
     */
    const capacity = 4;

    const percentage = Math.min(
      Math.round((assigned / capacity) * 100),
      100
    );

    let workload: StaffWorkloadItem["workload"] = "Low";

    if (percentage >= 75) {
      workload = "High";
    } else if (percentage >= 50) {
      workload = "Medium";
    }

    return {
      staff,
      assigned,
      capacity,
      percentage,
      workload,
    };
  });
}

export default function StaffWorkload() {
  const workloadData = getWorkloadData();

  const totalAssigned = workloadData.reduce(
    (total, item) => total + item.assigned,
    0
  );

  const availableStaff = staffMembers.filter(
    (staff) => staff.status === "Available"
  ).length;

  const busyStaff = staffMembers.filter(
    (staff) => staff.status === "Busy"
  ).length;

  const highWorkload = workloadData.filter(
    (item) => item.workload === "High"
  ).length;

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-[#eee8e1] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
                <Users size={17} />
              </div>

              <div>
                <h2 className="text-base font-bold text-[#29241f]">
                  Staff Workload
                </h2>

                <p className="mt-0.5 text-xs text-[#8d847b]">
                  Monitor event assignments across your team.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/staff"
            className="hidden items-center gap-1 text-xs font-semibold text-[#9a6c37] sm:inline-flex"
          >
            View Staff
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 divide-x divide-[#eee8e1] border-b border-[#eee8e1] sm:grid-cols-4">
        <SummaryItem
          icon={CalendarDays}
          label="Assigned"
          value={totalAssigned}
        />

        <SummaryItem
          icon={CheckCircle2}
          label="Available"
          value={availableStaff}
        />

        <SummaryItem
          icon={UserRound}
          label="Busy"
          value={busyStaff}
        />

        <SummaryItem
          icon={CircleAlert}
          label="High Load"
          value={highWorkload}
        />
      </div>

      {/* Staff list */}
      <div className="divide-y divide-[#eee8e1]">
        {workloadData.map((item) => {
          const initials = item.staff.name
            .split(" ")
            .map((name) => name[0])
            .slice(0, 2)
            .join("");

          return (
            <div
              key={item.staff.id}
              className="p-5 transition hover:bg-[#fdfbf8]"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5eee5] text-xs font-bold text-[#9a6c37]">
                  {initials}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#29241f]">
                        {item.staff.name}
                      </p>

                      <p className="mt-0.5 text-xs text-[#8d847b]">
                        {item.staff.role}
                      </p>
                    </div>

                    <WorkloadBadge workload={item.workload} />
                  </div>

                  {/* Assignment count */}
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-[#756d64]">
                      {item.assigned} of {item.capacity} events assigned
                    </span>

                    <span className="font-semibold text-[#5f574f]">
                      {item.percentage}%
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eee8e1]">
                    <div
                      className={[
                        "h-full rounded-full transition-all",
                        item.workload === "High"
                          ? "bg-[#b8894b]"
                          : item.workload === "Medium"
                            ? "bg-[#c8a879]"
                            : "bg-[#7d9b7d]",
                      ].join(" ")}
                      style={{
                        width: `${item.percentage}%`,
                      }}
                    />
                  </div>

                  {/* Status */}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-[11px] text-[#8d847b]">
                      <span
                        className={[
                          "h-1.5 w-1.5 rounded-full",
                          item.staff.status === "Available"
                            ? "bg-[#668866]"
                            : item.staff.status === "Busy"
                              ? "bg-[#b8894b]"
                              : "bg-[#aaa19a]",
                        ].join(" ")}
                      />

                      {item.staff.status}
                    </span>

                    <Link
                      href={`/dashboard/staff/${item.staff.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9a6c37] hover:text-[#7f5529]"
                    >
                      Details
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile view all */}
      <div className="border-t border-[#eee8e1] p-4 sm:hidden">
        <Link
          href="/dashboard/staff"
          className="flex items-center justify-center gap-1.5 rounded-full border border-[#ded5cb] px-4 py-2.5 text-xs font-semibold text-[#5f574f] transition hover:bg-[#f8f3ec]"
        >
          View All Staff
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="px-4 py-4 text-center">
      <Icon
        size={15}
        className="mx-auto text-[#a7773f]"
      />

      <p className="mt-1.5 text-lg font-bold text-[#29241f]">
        {value}
      </p>

      <p className="text-[10px] font-medium text-[#9b938a]">
        {label}
      </p>
    </div>
  );
}

function WorkloadBadge({
  workload,
}: {
  workload: "Low" | "Medium" | "High";
}) {
  const styles = {
    Low: "bg-[#edf5ed] text-[#557555]",
    Medium: "bg-[#fff5df] text-[#9a6c37]",
    High: "bg-[#f9e9df] text-[#9a5b3f]",
  };

  return (
    <span
      className={[
        "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
        styles[workload],
      ].join(" ")}
    >
      {workload}
    </span>
  );
}
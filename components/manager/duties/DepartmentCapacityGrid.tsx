"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Filter,
  Loader2,
  Phone,
  Search,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import {
  getDepartmentAvailability,
  DateAvailabilityResponse,
  DepartmentSummaryItem,
  DepartmentStaffMember,
} from "@/lib/department.api";
import { useAuth } from "@/hooks/useAuth";

interface DepartmentCapacityGridProps {
  onSelectStaffForDuty?: (staff: DepartmentStaffMember, date: string) => void;
}

export default function DepartmentCapacityGrid({
  onSelectStaffForDuty,
}: DepartmentCapacityGridProps) {
  const { token } = useAuth();
  const [targetDate, setTargetDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [data, setData] = useState<DateAvailabilityResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getDepartmentAvailability(targetDate, token || undefined);
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load department availability."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [targetDate, token]);

  const changeDateBy = (days: number) => {
    const d = new Date(targetDate);
    d.setDate(d.getDate() + days);
    setTargetDate(d.toISOString().slice(0, 10));
  };

  const filteredDepartments = data
    ? selectedDept === "ALL"
      ? data.departments
      : data.departments.filter((d) => d.department === selectedDept)
    : [];

  return (
    <div className="space-y-6">
      {/* Date Navigator Bar */}
      <section className="flex flex-col gap-4 rounded-3xl border border-[#e8e1d8] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-[#9a6c37] shrink-0" />
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#9a6c37]">
              Department Capacity Matrix
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-[#756d64]">
            Monitor staffing levels, leave records, and allocation capacity by department.
          </p>
        </div>

        {/* Date Selector Controls - Mobile Friendly */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex flex-1 items-center gap-1.5 sm:flex-initial">
            <button
              type="button"
              onClick={() => changeDateBy(-1)}
              className="flex-1 sm:flex-initial rounded-xl border border-gray-200 bg-white px-2.5 sm:px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 text-center"
            >
              ← Prev
            </button>

            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="h-9 min-w-0 flex-1 sm:flex-initial rounded-xl border border-gray-200 bg-[#faf8f5] px-2 text-xs font-bold text-gray-900 outline-none focus:border-[#9a6c37]"
            />

            <button
              type="button"
              onClick={() => changeDateBy(1)}
              className="flex-1 sm:flex-initial rounded-xl border border-gray-200 bg-white px-2.5 sm:px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 text-center"
            >
              Next →
            </button>
          </div>

          <button
            type="button"
            onClick={() => setTargetDate(new Date().toISOString().slice(0, 10))}
            className="w-full sm:w-auto rounded-xl bg-[#29241f] px-3.5 py-2 text-xs font-bold text-white hover:bg-black text-center"
          >
            Today
          </button>
        </div>
      </section>

      {/* KPI Cards */}
      {data && (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-[#e8e1d8] bg-white p-3 sm:p-4 text-center shadow-2xs">
            <p className="text-[10px] font-extrabold uppercase text-gray-400">
              Total Staff Pool
            </p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-[#29241f]">
              {data.totalStaff}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3 sm:p-4 text-center shadow-2xs">
            <p className="text-[10px] font-extrabold uppercase text-emerald-700">
              🟢 Available
            </p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-emerald-700">
              {data.availableStaff}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-3 sm:p-4 text-center shadow-2xs">
            <p className="text-[10px] font-extrabold uppercase text-amber-700">
              🟡 On Leave
            </p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-amber-700">
              {data.onLeaveStaff}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3 sm:p-4 text-center shadow-2xs">
            <p className="text-[10px] font-extrabold uppercase text-blue-700">
              🔵 Assigned
            </p>
            <p className="mt-1 text-xl sm:text-2xl font-black text-blue-700">
              {data.assignedStaff}
            </p>
          </div>
        </div>
      )}

      {/* Search & Department Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search staff by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-2xl border border-gray-200 bg-white pl-9 pr-4 text-xs outline-none focus:border-[#9a6c37]"
          />
        </div>

        {data && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none pb-1.5 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setSelectedDept("ALL")}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                selectedDept === "ALL"
                  ? "bg-[#9a6c37] text-white shadow-xs"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              All Departments ({data.departments.length})
            </button>

            {data.departments.map((d) => (
              <button
                key={d.department}
                type="button"
                onClick={() => setSelectedDept(d.department)}
                className={`flex shrink-0 items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                  selectedDept === d.department
                    ? "bg-[#9a6c37] text-white shadow-xs"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span>{d.department}</span>
                <span className="ml-1 rounded-md bg-black/10 px-1 py-0.2 text-[10px]">
                  {d.available}/{d.total}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-3xl border border-[#e8e1d8] bg-white p-8">
          <Loader2 className="h-7 w-7 animate-spin text-[#9a6c37]" />
          <p className="mt-3 text-xs font-semibold text-gray-500">
            Calculating department capacity...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-xs text-red-700">
          <AlertCircle className="mx-auto mb-2 h-6 w-6 text-red-500" />
          <p className="font-bold">{error}</p>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="rounded-3xl border border-[#e8e1d8] bg-white p-8 text-center text-xs text-gray-500">
          No departments matching your filter.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredDepartments.map((dept) => {
            const filteredStaff = dept.staff.filter((s) => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return (
                s.name.toLowerCase().includes(q) ||
                s.employeeId.toLowerCase().includes(q)
              );
            });

            const availRate =
              dept.total > 0
                ? Math.round((dept.available / dept.total) * 100)
                : 0;

            return (
              <div
                key={dept.department}
                className="flex flex-col justify-between rounded-3xl border border-[#e8e1d8] bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div>
                  {/* Department Title & Capacity Progress */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#faf6f0] text-lg text-[#9a6c37] border border-[#ede5d8]">
                        {getDepartmentEmoji(dept.department)}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#29241f]">
                          {dept.department}
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          {dept.available} of {dept.total} staff ready for duty
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-[#9a6c37]">
                        {availRate}%
                      </span>
                      <p className="text-[9px] uppercase font-bold text-gray-400">
                        Available
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#b8894b] transition-all duration-500"
                      style={{ width: `${availRate}%` }}
                    />
                  </div>

                  {/* Staff List */}
                  <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1">
                    {filteredStaff.length === 0 ? (
                      <p className="py-2 text-center text-xs text-gray-400">
                        No staff match your search.
                      </p>
                    ) : (
                      filteredStaff.map((staff) => (
                        <div
                          key={staff.id}
                          className="flex items-center justify-between rounded-2xl border border-gray-100 bg-[#faf8f5] p-2.5 transition hover:border-[#9a6c37]"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-xs font-bold text-[#29241f]">
                                {staff.name}
                              </p>
                              <span className="text-[10px] text-gray-400">
                                ({staff.employeeId})
                              </span>
                            </div>

                            <div className="mt-0.5 flex items-center gap-1 text-[10px]">
                              {staff.status === "AVAILABLE" && (
                                <span className="font-bold text-emerald-600">
                                  🟢 Ready for Duty
                                </span>
                              )}
                              {staff.status === "ON_LEAVE" && (
                                <span className="font-bold text-amber-600">
                                  🟡 On Leave ({staff.statusReason})
                                </span>
                              )}
                              {staff.status === "ASSIGNED" && (
                                <span className="font-bold text-blue-600">
                                  🔵 {staff.statusReason}
                                </span>
                              )}
                            </div>
                          </div>

                          {onSelectStaffForDuty && staff.status === "AVAILABLE" && (
                            <button
                              type="button"
                              onClick={() =>
                                onSelectStaffForDuty(staff, targetDate)
                              }
                              className="flex shrink-0 items-center gap-1 rounded-xl bg-[#29241f] px-2.5 py-1 text-[10px] font-bold text-white hover:bg-black"
                            >
                              <UserPlus size={12} />
                              Assign
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getDepartmentEmoji(dept = "") {
  const d = dept.toLowerCase();
  if (d.includes("cater") || d.includes("food") || d.includes("beverage"))
    return "🍽️";
  if (d.includes("decor") || d.includes("stage") || d.includes("floral"))
    return "🎨";
  if (d.includes("sound") || d.includes("audio") || d.includes("dj"))
    return "🔊";
  if (d.includes("photo") || d.includes("video") || d.includes("media"))
    return "📷";
  if (d.includes("security") || d.includes("guard")) return "🛡️";
  if (d.includes("logistic") || d.includes("transport")) return "🚚";
  if (d.includes("hospitality") || d.includes("usher")) return "🛎️";
  return "⚙️";
}

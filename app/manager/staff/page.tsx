"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Users,
  Clock3,
  UserCheck,
  CalendarDays,
  IndianRupee,
  Sparkles,
  Loader2,
} from "lucide-react";

import StaffDirectoryTab from "@/components/manager/staff/StaffDirectoryTab";
import StaffAvailabilityTab from "@/components/manager/staff/StaffAvailabilityTab";
import StaffAttendanceTab from "@/components/manager/staff/StaffAttendanceTab";
import StaffAssignmentsTab from "@/components/manager/staff/StaffAssignmentsTab";
import StaffPayrollTab from "@/components/manager/staff/StaffPayrollTab";

type StaffTabType = "directory" | "availability" | "attendance" | "assignments" | "schedule" | "payroll";

function ManagerStaffContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = (searchParams.get("tab") as StaffTabType) || "directory";
  const initialDate = searchParams.get("date") || undefined;
  const initialStaffId = searchParams.get("staffId") || searchParams.get("staff") || undefined;

  const [activeTab, setActiveTab] = useState<StaffTabType>(
    tabParam === "schedule" ? "assignments" : tabParam
  );

  useEffect(() => {
    const rawTab = searchParams.get("tab") as StaffTabType;
    if (rawTab) {
      const normalized = rawTab === "schedule" ? "assignments" : rawTab;
      if (["directory", "availability", "attendance", "assignments", "payroll"].includes(normalized)) {
        setActiveTab(normalized);
      }
    }
  }, [searchParams]);

  const switchTab = (tab: "directory" | "availability" | "attendance" | "assignments" | "payroll") => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("tab", tab);
    router.replace(`/manager/staff?${newParams.toString()}`);
  };

  return (
    <main className="space-y-6 pb-12">
      {/* ========================================================
          PAGE HEADER & TAB SUB-NAVIGATION
      ======================================================== */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#9A7B4F]/15 text-[#9A7B4F]">
              <Sparkles size={13} />
            </span>
            <p className="text-xs font-bold uppercase tracking-wider text-[#9A7B4F]">
              Staff Management Hub
            </p>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-[#1F1F1F]">
            Staff Members & Operations
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Centralized staff directory, working availability, daily attendance logs, shift assignments, and payroll compensation.
          </p>
        </div>

        {/* View Switcher Tabs - Responsive scrollable */}
        <div className="flex w-full overflow-x-auto rounded-2xl border border-[#e8e1d8] bg-white p-1.5 shadow-xs xl:w-auto">
          <div className="flex items-center gap-1 min-w-max">
            <button
              type="button"
              onClick={() => switchTab("directory")}
              className={`inline-flex items-center gap-1.5 shrink-0 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === "directory"
                  ? "bg-[#29241f] text-white shadow-xs"
                  : "text-gray-600 hover:bg-[#faf7f2] hover:text-gray-900"
              }`}
            >
              <Users size={14} className="shrink-0" />
              <span>1. Staff Directory</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab("availability")}
              className={`inline-flex items-center gap-1.5 shrink-0 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === "availability"
                  ? "bg-[#29241f] text-white shadow-xs"
                  : "text-gray-600 hover:bg-[#faf7f2] hover:text-gray-900"
              }`}
            >
              <Clock3 size={14} className="shrink-0" />
              <span>2. Availability & Leave</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab("attendance")}
              className={`inline-flex items-center gap-1.5 shrink-0 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === "attendance"
                  ? "bg-[#29241f] text-white shadow-xs"
                  : "text-gray-600 hover:bg-[#faf7f2] hover:text-gray-900"
              }`}
            >
              <UserCheck size={14} className="shrink-0" />
              <span>3. Attendance Logs</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab("assignments")}
              className={`inline-flex items-center gap-1.5 shrink-0 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === "assignments"
                  ? "bg-[#29241f] text-white shadow-xs"
                  : "text-gray-600 hover:bg-[#faf7f2] hover:text-gray-900"
              }`}
            >
              <CalendarDays size={14} className="shrink-0" />
              <span>4. Assignments & Schedule</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab("payroll")}
              className={`inline-flex items-center gap-1.5 shrink-0 rounded-xl px-3.5 sm:px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "payroll"
                  ? "bg-[#9A7B4F] text-white shadow-xs ring-2 ring-[#9A7B4F]/30"
                  : "bg-amber-50 text-[#9A7B4F] border border-amber-200/80 hover:bg-amber-100"
              }`}
            >
              <IndianRupee size={14} className="shrink-0 text-amber-700" />
              <span>5. Hours & Payroll</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          ACTIVE TAB CONTENT
      ======================================================== */}
      {activeTab === "directory" && <StaffDirectoryTab />}

      {activeTab === "availability" && (
        <StaffAvailabilityTab
          initialDate={initialDate}
          initialStaffId={initialStaffId}
        />
      )}

      {activeTab === "attendance" && (
        <StaffAttendanceTab
          initialDate={initialDate}
          initialStaffId={initialStaffId}
        />
      )}

      {activeTab === "assignments" && (
        <StaffAssignmentsTab initialStaffId={initialStaffId} />
      )}

      {activeTab === "payroll" && <StaffPayrollTab />}
    </main>
  );
}

export default function ManagerStaffPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#9A7B4F]/10 text-[#9A7B4F]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <p className="text-xs font-medium text-gray-500">Loading Staff Management Hub...</p>
        </div>
      }
    >
      <ManagerStaffContent />
    </Suspense>
  );
}
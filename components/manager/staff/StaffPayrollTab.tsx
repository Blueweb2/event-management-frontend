"use client";

import { useMemo, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import StaffHoursPayrollView from "@/components/manager/duties/StaffHoursPayrollView";
import ManageChecklistModal from "@/components/manager/duties/ManageChecklistModal";
import { useAssignments } from "@/hooks/useAssignments";
import { useAuth } from "@/hooks/useAuth";
import { mapAssignmentToDuty } from "@/lib/duty-mapper";
import type { Duty } from "@/components/manager/duties/constants";

export default function StaffPayrollTab() {
  const { user, token } = useAuth();
  const isChefManager =
    user?.role === "manager" &&
    (user?.department?.toLowerCase() === "kitchen" || user?.department?.toLowerCase() === "catering");

  const {
    assignments,
    loading,
    error,
    fetchAllAssignments,
    editAssignment,
  } = useAssignments({ token, autoFetch: !isChefManager });

  const [managingChecklistDuty, setManagingChecklistDuty] = useState<Duty | null>(null);

  const duties = useMemo(
    () =>
      assignments
        .filter((assignment) => assignment.status !== "CANCELLED")
        .map(mapAssignmentToDuty),
    [assignments]
  );

  const handleSaveChecklistModal = async (
    dutyId: string,
    updatedChecklist: Array<{ _id?: string; text: string; completed: boolean }>
  ) => {
    await editAssignment(dutyId, { checklist: updatedChecklist });
    await fetchAllAssignments();
  };

  if (isChefManager) {
    return (
      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 p-8 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100/70 text-amber-800 shadow-xs">
          <ShieldAlert size={28} />
        </div>
        <h3 className="mt-4 text-base font-bold text-gray-900">
          Payroll & Financial Compensation Restricted
        </h3>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-gray-600">
          As <span className="font-semibold text-amber-900">Chef Manager</span>, your permissions allow operational oversight of kitchen staff attendance, schedules, and duties.
          Detailed staff payroll calculations, hourly rates, and disbursements are restricted to Super Admin and Finance administrators.
        </p>
        <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-gray-700 border border-gray-200 shadow-xs">
          <span>Scope: Kitchen Department (Operations & Attendance only)</span>
        </div>
      </div>
    );
  }

  if (loading && duties.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white">
        <Loader2 size={26} className="animate-spin text-[#9A7B4F]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600 font-medium"
        >
          {error}
        </div>
      )}

      <StaffHoursPayrollView
        duties={duties}
        token={token || ""}
        onRefresh={fetchAllAssignments}
        onManageChecklist={setManagingChecklistDuty}
      />

      {managingChecklistDuty && (
        <ManageChecklistModal
          key={managingChecklistDuty.id}
          isOpen={Boolean(managingChecklistDuty)}
          duty={managingChecklistDuty}
          onClose={() => setManagingChecklistDuty(null)}
          onSaveChecklist={handleSaveChecklistModal}
        />
      )}
    </div>
  );
}

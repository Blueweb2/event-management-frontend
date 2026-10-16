"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import StaffHoursPayrollView from "@/components/manager/duties/StaffHoursPayrollView";
import ManageChecklistModal from "@/components/manager/duties/ManageChecklistModal";
import { useAssignments } from "@/hooks/useAssignments";
import { useAuth } from "@/hooks/useAuth";
import { mapAssignmentToDuty } from "@/lib/duty-mapper";
import type { Duty } from "@/components/manager/duties/constants";

export default function StaffPayrollTab() {
  const { token } = useAuth();
  const {
    assignments,
    loading,
    error,
    fetchAllAssignments,
    editAssignment,
  } = useAssignments({ token, autoFetch: true });

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

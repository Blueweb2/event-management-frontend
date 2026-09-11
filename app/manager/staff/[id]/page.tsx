"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import StaffProfile from "@/components/manager/staff/StaffProfile";
import LoadingState from "@/components/ui/Loading";
import ErrorMessage from "@/components/common/ErrorMessage";

import { useStaff } from "@/hooks/useStaff";

import type {
  ResetStaffPasswordResponse,
  Staff,
  UpdateStaffPayload,
} from "@/types/staff";

export default function StaffProfilePage() {
  const params = useParams();
  const router = useRouter();

  const staffId = params.id as string;

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const {
    selectedStaff,
    loading,
    error,
    fetchStaffById,
    editStaff,
    changeStaffStatus,
    changeStaffPassword,
    clearError,
  } = useStaff({
    token,
    autoFetch: false,
  });

  useEffect(() => {
    if (!token || !staffId) return;

    fetchStaffById(staffId);
  }, [token, staffId, fetchStaffById]);

  const handleEdit = async (
    id: string,
    payload: UpdateStaffPayload,
  ): Promise<Staff> => {
    const updatedStaff = await editStaff(id, payload);

    await fetchStaffById(id);

    return updatedStaff;
  };

  const handleStatusChange = async (
    id: string,
    isActive: boolean,
  ): Promise<Staff> => {
    const updatedStaff = await changeStaffStatus(
      id,
      isActive,
    );

    await fetchStaffById(id);

    return updatedStaff;
  };

  const handleResetPassword = async (
    id: string,
    newPassword: string,
  ): Promise<ResetStaffPasswordResponse> => {
    return changeStaffPassword(id, newPassword);
  };

  if (loading && !selectedStaff) {
    return (
      <div className="px-4 py-6">
        <LoadingState />
      </div>
    );
  }

  if (error && !selectedStaff) {
    return (
      <div className="px-4 py-6">
        <ErrorMessage
          message={error}
          onRetry={() => fetchStaffById(staffId)}
        />
      </div>
    );
  }

  if (!selectedStaff) {
    return (
      <div className="px-4 py-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
          <p className="text-sm text-gray-500">
            Staff member not found.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/manager/staff")
            }
            className="mt-4 min-h-11 rounded-xl bg-[#1F1F1F] px-5 text-sm font-medium text-white"
          >
            Back to Staff
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-5">
      {error && (
        <div className="mb-4">
          <ErrorMessage
            message={error}
            onRetry={clearError}
          />
        </div>
      )}

      <StaffProfile
        staff={selectedStaff}
        onStaffUpdated={handleEdit}
        onStatusChange={handleStatusChange}
        onPasswordReset={handleResetPassword}
      />
    </div>
  );
}
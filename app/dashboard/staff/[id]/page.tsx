import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import StaffDetailsHeader from "@/components/dashboard/staff/StaffDetailsHeader";
import StaffOverviewStats from "@/components/dashboard/staff/StaffOverviewStats";
import StaffAvailability from "@/components/dashboard/staff/StaffAvailability";
import StaffEventAssignments from "@/components/dashboard/staff/StaffEventAssignments";
import { staffMembers } from "@/components/dashboard/staff/constants";

interface StaffDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StaffDetailsPage({
  params,
}: StaffDetailsPageProps) {
  const { id } = await params;

  const staff = staffMembers.find((member) => member.id === id);

  if (!staff) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="rounded-2xl border border-[#e8e1d8] bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-[#29241f]">
            Staff member not found
          </h1>

          <p className="mt-2 text-sm text-[#756d64]">
            The staff member you are looking for does not exist.
          </p>

          <Link
            href="/dashboard/staff"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#b8894b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a7773f]"
          >
            <ArrowLeft size={16} />
            Back to Staff
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/staff"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#756d64] transition hover:text-[#9a6c37]"
      >
        <ArrowLeft size={16} />
        Back to Staff
      </Link>

      {/* Staff header */}
      <StaffDetailsHeader staff={staff} />

      {/* Overview */}
      <StaffOverviewStats staff={staff} />

      {/* Availability */}
      <StaffAvailability staff={staff} />

      {/* Assigned events */}
      <StaffEventAssignments staff={staff} />
    </div>
  );
}
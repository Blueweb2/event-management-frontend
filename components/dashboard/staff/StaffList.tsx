"use client";

import { useMemo, useState } from "react";

import StaffCard from "./StaffCard";
import StaffFilters from "./StaffFilters";
import { staffMembers } from "./constants";

export default function StaffList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filteredStaff = useMemo(() => {
    const query = search.trim().toLowerCase();

    return staffMembers.filter((staff) => {
      const matchesSearch =
        !query ||
        staff.name.toLowerCase().includes(query) ||
        staff.role.toLowerCase().includes(query) ||
        staff.department.toLowerCase().includes(query);

      const matchesStatus =
        status === "All" || staff.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  return (
    <div className="space-y-4">
      <StaffFilters
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#29241f]">
          Staff Members
        </p>

        <p className="text-xs text-[#8d847b]">
          {filteredStaff.length} member
          {filteredStaff.length === 1 ? "" : "s"}
        </p>
      </div>

      {filteredStaff.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredStaff.map((staff) => (
            <StaffCard
              key={staff.id}
              staff={staff}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#d8cec3] bg-white px-5 py-12 text-center">
          <p className="text-sm font-semibold text-[#5f574f]">
            No staff members found
          </p>

          <p className="mt-1 text-xs text-[#9b938a]">
            Try changing your search or status filter.
          </p>
        </div>
      )}
    </div>
  );
}
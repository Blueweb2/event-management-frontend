"use client";

import { useMemo, useState } from "react";

import AddDutyModal from "@/components/dashboard/duties/AddDutyModal";
import DutiesFilters from "@/components/dashboard/duties/DutiesFilters";
import DutiesHeader from "@/components/dashboard/duties/DutiesHeader";
import DutiesList from "@/components/dashboard/duties/DutiesList";
import DutiesStats from "@/components/dashboard/duties/DutiesStats";

import {
  duties as initialDuties,
  type Duty,
  type DutyStatus,
} from "@/components/dashboard/duties/constants";

export default function DutiesPage() {
  const [items, setItems] =
    useState<Duty[]>(initialDuties);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<
    "All" | DutyStatus
  >("All");

  const [modalOpen, setModalOpen] = useState(false);

  const [editingDuty, setEditingDuty] =
    useState<Duty | null>(null);

  const filteredDuties = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((duty) => {
      const matchesSearch =
        !query ||
        duty.title.toLowerCase().includes(query) ||
        duty.event.toLowerCase().includes(query) ||
        duty.staffName.toLowerCase().includes(query) ||
        duty.location.toLowerCase().includes(query);

      const matchesStatus =
        status === "All" || duty.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [items, search, status]);

  const handleAddDuty = () => {
    setEditingDuty(null);
    setModalOpen(true);
  };

  const handleEditDuty = (duty: Duty) => {
    setEditingDuty(duty);
    setModalOpen(true);
  };

  const handleDeleteDuty = (duty: Duty) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${duty.title}"?`
    );

    if (!confirmed) return;

    setItems((current) =>
      current.filter((item) => item.id !== duty.id)
    );
  };

  const handleStatusChange = (duty: Duty) => {
    const nextStatus: DutyStatus =
      duty.status === "Pending"
        ? "Assigned"
        : "Completed";

    setItems((current) =>
      current.map((item) =>
        item.id === duty.id
          ? {
              ...item,
              status: nextStatus,
            }
          : item
      )
    );
  };

  const handleSaveDuty = (duty: Duty) => {
    setItems((current) => {
      const exists = current.some(
        (item) => item.id === duty.id
      );

      if (exists) {
        return current.map((item) =>
          item.id === duty.id ? duty : item
        );
      }

      return [duty, ...current];
    });
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("All");
  };

  return (
    <div className="space-y-6 pb-8">
      <DutiesHeader onAddDuty={handleAddDuty} />

      <DutiesStats />

      <DutiesFilters
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onClear={handleClearFilters}
      />

      <DutiesList
        duties={filteredDuties}
        onEdit={handleEditDuty}
        onDelete={handleDeleteDuty}
        onStatusChange={handleStatusChange}
      />

      <AddDutyModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingDuty(null);
        }}
        onSave={handleSaveDuty}
        editingDuty={editingDuty}
      />
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";

import AddDutyModal, { type DutyFormValues } from "@/components/manager/duties/AddDutyModal";
import DutiesFilters from "@/components/manager/duties/DutiesFilters";
import DutiesHeader from "@/components/manager/duties/DutiesHeader";
import DutiesList from "@/components/manager/duties/DutiesList";
import DutiesStats from "@/components/manager/duties/DutiesStats";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { type Duty, type DutyStatus } from "@/components/manager/duties/constants";
import { useAssignments } from "@/hooks/useAssignments";
import { useAuth } from "@/hooks/useAuth";
import { useStaff } from "@/hooks/useStaff";
import { getEvents, type Event } from "@/lib/event.api";
import { mapAssignmentToDuty } from "@/lib/duty-mapper";

export default function DutiesPage() {
  const { token } = useAuth();
  const { assignments, loading: assignmentsLoading, error: assignmentsError, addAssignment, editAssignment, removeAssignment, fetchAllAssignments } = useAssignments({ token, autoFetch: false });
  const { staff, loading: staffLoading } = useStaff({ token });
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | DutyStatus>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDuty, setEditingDuty] = useState<Duty | null>(null);
  const [deletingDuty, setDeletingDuty] = useState<Duty | null>(null);

  useEffect(() => {
    if (!token) return;
    getEvents({ limit: 100 }, token)
      .then((result) => setEvents(result.data))
      .catch((error) => setEventsError(error instanceof Error ? error.message : "Failed to load events"));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const timer = window.setTimeout(() => { void fetchAllAssignments(); });
    return () => window.clearTimeout(timer);
  }, [token, fetchAllAssignments]);

  const duties = useMemo(() => assignments.filter((assignment) => assignment.status !== "CANCELLED").map(mapAssignmentToDuty), [assignments]);
  const filteredDuties = useMemo(() => {
    const query = search.trim().toLowerCase();
    return duties.filter((duty) => (!query || [duty.title, duty.event, duty.staffName, duty.location].some((value) => value.toLowerCase().includes(query))) && (status === "All" || duty.status === status));
  }, [duties, search, status]);

  const closeModal = () => { if (!assignmentsLoading) { setModalOpen(false); setEditingDuty(null); } };
  const handleSaveDuty = async (values: DutyFormValues) => {
    const payload = { staff: values.staff, dutyTitle: values.dutyTitle, description: values.description || undefined, dutyDate: values.dutyDate, startTime: values.startTime, endTime: values.endTime };
    if (editingDuty) await editAssignment(editingDuty.id, payload);
    else await addAssignment({ ...payload, event: values.event });
    closeModal();
  };
  const handleStatusChange = async (duty: Duty) => {
    const nextStatus: Partial<Record<DutyStatus, DutyStatus>> = { ASSIGNED: "IN_PROGRESS", ACCEPTED: "IN_PROGRESS", IN_PROGRESS: "COMPLETED" };
    const next = nextStatus[duty.status];
    if (next) await editAssignment(duty.id, { status: next });
  };

  const eventOptions = events.map((event) => ({ id: event._id, name: event.eventName, date: event.eventDate.slice(0, 10), time: event.eventTime }));
  const staffOptions = staff.filter((member) => member.isActive).map((member) => ({ id: member.id, name: member.name }));
  const loading = assignmentsLoading || staffLoading;
  const error = assignmentsError || eventsError;

  return <div className="space-y-6 pb-8">
    <DutiesHeader onAddDuty={() => { setEditingDuty(null); setModalOpen(true); }} />
    {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
    <DutiesStats duties={duties} />
    <DutiesFilters search={search} status={status} onSearchChange={setSearch} onStatusChange={setStatus} onClear={() => { setSearch(""); setStatus("All"); }} />
    <DutiesList duties={filteredDuties} loading={loading} onEdit={(duty) => { setEditingDuty(duty); setModalOpen(true); }} onDelete={setDeletingDuty} onStatusChange={handleStatusChange} />
    <ConfirmDialog isOpen={Boolean(deletingDuty)} onClose={() => setDeletingDuty(null)} onConfirm={async () => { if (deletingDuty) { await removeAssignment(deletingDuty.id); setDeletingDuty(null); } }} title="Delete duty?" description={deletingDuty ? `Are you sure you want to delete "${deletingDuty.title}"?` : undefined} confirmText="Delete duty" />
    {modalOpen && <AddDutyModal key={editingDuty?.id ?? "new"} open={modalOpen} onClose={closeModal} onSave={handleSaveDuty} editingDuty={editingDuty} events={eventOptions} staff={staffOptions} loading={loading} />}
  </div>;
}

"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Coffee,
  Disc,
  Info,
  Layers,
  ListChecks,
  Loader2,
  Lock,
  Music,
  Plus,
  Shield,
  Sparkles,
  Truck,
  UserCheck,
  UserPlus,
  Users,
  Utensils,
  Video,
  X,
  Palette,
  Volume2,
  Camera,
  
  BellRing,
  Settings,
} from "lucide-react";

import {
  getEventStaffingRequirements,
  EventStaffingResponse,
  StaffingStream,
  DepartmentStaffMember,
} from "@/lib/department.api";
import { createAssignment, updateAssignmentChecklist } from "@/lib/assignment.api";
import { useAuth } from "@/hooks/useAuth";
import ManageChecklistModal from "@/components/manager/duties/ManageChecklistModal";
import type { Duty } from "@/components/manager/duties/constants";

interface EventServiceStaffingMatrixProps {
  eventId: string;
  token?: string;
  onAssignmentCreated?: () => void;
}

export default function EventServiceStaffingMatrix({
  eventId,
  token: propToken,
  onAssignmentCreated,
}: EventServiceStaffingMatrixProps) {
  const { token: authJwt } = useAuth();
  const token = propToken || authJwt || "";

  const [data, setData] = useState<EventStaffingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStreamId, setSelectedStreamId] = useState<string>("all");

  // Quick Allocation Modal State
  const [allocatingStream, setAllocatingStream] = useState<StaffingStream | null>(
    null
  );
  const [allocatingStaff, setAllocatingStaff] =
    useState<DepartmentStaffMember | null>(null);
  const [dutyTitle, setDutyTitle] = useState("");
  const [role, setRole] = useState("");
  const [dutyDate, setDutyDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [hourlyRate, setHourlyRate] = useState<number>(25);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successToast, setSuccessToast] = useState("");

  // Managing Sub-duties Checklist Modal State
  const [managingChecklistDuty, setManagingChecklistDuty] = useState<Duty | null>(null);

  const loadMatrix = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getEventStaffingRequirements(eventId, token);
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dynamic staffing matrix."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      void loadMatrix();
    }
  }, [eventId, token]);

  const openAllocateModal = (
    stream: StaffingStream,
    staffMember?: DepartmentStaffMember
  ) => {
    setAllocatingStream(stream);
    setAllocatingStaff(staffMember || null);
    setModalError("");

    const defaultTitle =
      stream.streamType === "CATERING"
        ? "Catering & Service Steward"
        : `${stream.title} Specialist`;

    setDutyTitle(defaultTitle);
    setRole(stream.department);
    setDutyDate(data?.targetDate || "");
    setStartTime(data?.event.eventTime || "10:00");
    setHourlyRate(25);

    // Calculate default end time (+4 hours)
    if (data?.event.eventTime) {
      const [h, m] = data.event.eventTime.split(":").map(Number);
      const endH = (h + 5) % 24;
      setEndTime(
        `${endH.toString().padStart(2, "0")}:${(m || 0).toString().padStart(2, "0")}`
      );
    } else {
      setEndTime("15:00");
    }
    setNotes("");
  };

  const closeAllocateModal = () => {
    setAllocatingStream(null);
    setAllocatingStaff(null);
    setModalError("");
  };

  const handleAllocateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingStaff) {
      setModalError("Please select a staff member to allocate.");
      return;
    }

    if (!dutyTitle.trim() || !dutyDate || !startTime || !endTime) {
      setModalError("Please fill out all required assignment fields.");
      return;
    }

    try {
      setSubmitting(true);
      setModalError("");

      await createAssignment(
        {
          event: eventId,
          staff: allocatingStaff.id,
          dutyTitle: dutyTitle.trim(),
          role: role.trim() || allocatingStream?.department || "Operations",
          department: allocatingStream?.department || allocatingStaff.department,
          serviceName: allocatingStream?.title,
          dutyDate,
          startTime,
          endTime,
          hourlyRate: Number(hourlyRate) || 0,
          notes: notes.trim() || undefined,
        },
        token
      );

      setSuccessToast(`Allocated ${allocatingStaff.name} to ${dutyTitle}!`);
      setTimeout(() => setSuccessToast(""), 4000);
      closeAllocateModal();
      await loadMatrix();
      if (onAssignmentCreated) onAssignmentCreated();
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Failed to allocate staff duty."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-[#e8e1d8] bg-white p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#9a6c37]" />
        <p className="mt-3 text-xs font-bold text-[#756d64]">
          Analyzing customer booked services and staff availability...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-xs text-red-700">
        <AlertCircle className="mx-auto mb-2 h-6 w-6 text-red-500" />
        <p className="font-bold">{error || "Failed to load staffing matrix."}</p>
        <button
          type="button"
          onClick={loadMatrix}
          className="mt-3 rounded-xl bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredStreams =
    selectedStreamId === "all"
      ? data.staffingStreams
      : data.staffingStreams.filter((s) => s.streamId === selectedStreamId);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {successToast && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 shadow-sm animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <section className="rounded-3xl border border-[#e8e1d8] bg-gradient-to-br from-[#29241f] via-[#383129] to-[#1c1916] p-6 text-white shadow-md">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300/90">
              <Sparkles size={14} />
              <span>Event-Driven Dynamic Staff Allocation</span>
            </div>
            <h2 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">
              {data.event.eventName}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-300">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-amber-400" />
                {new Date(data.targetDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-amber-400" />
                {data.event.eventTime}
              </span>
              <span className="flex items-center gap-1">
                <Users size={13} className="text-amber-400" />
                {data.event.guests} Guests
              </span>
              {data.event.hasCatering && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-2.5 py-0.5 font-bold text-amber-200">
                  🍽️ Catering Included
                </span>
              )}
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-center">
              <p className="text-[10px] uppercase font-bold text-gray-400">
                Active Services
              </p>
              <p className="text-lg font-black text-amber-300">
                {data.staffingStreams.length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-center">
              <p className="text-[10px] uppercase font-bold text-gray-400">
                Available Staff
              </p>
              <p className="text-lg font-black text-emerald-300">
                {data.allStaffPool.filter((s) => s.isAvailable).length}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs by Service */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => setSelectedStreamId("all")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              selectedStreamId === "all"
                ? "bg-[#b8894b] text-white shadow-sm"
                : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
            }`}
          >
            All Required Services ({data.staffingStreams.length})
          </button>

          {data.staffingStreams.map((stream) => {
            const StreamIcon = getStreamIcon(stream.category);
            return (
              <button
                key={stream.streamId}
                type="button"
                onClick={() => setSelectedStreamId(stream.streamId)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  selectedStreamId === stream.streamId
                    ? "bg-[#b8894b] text-white shadow-sm"
                    : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                }`}
              >
                <StreamIcon size={14} />
                <span>{stream.title}</span>
                <span className="ml-1 rounded-full bg-black/30 px-1.5 py-0.2 text-[10px]">
                  {stream.allocatedCount}/{stream.recommendedStaffCount}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Dynamic Service Streams Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {filteredStreams.map((stream) => {
          const isFullyAllocated =
            stream.allocatedCount >= stream.recommendedStaffCount;
          const StreamIcon = getStreamIcon(stream.category);

          return (
            <div
              key={stream.streamId}
              className="flex flex-col justify-between rounded-3xl border border-[#e8e1d8] bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3 border-b border-[#f1ece5] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#faf6f0] text-[#9a6c37] border border-[#ede5d8]">
                      <StreamIcon size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9a6c37]">
                          {stream.department}
                        </span>
                        {stream.streamType === "CATERING" && (
                          <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-800">
                            Food & Drinks
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold text-[#29241f]">
                        {stream.title}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      isFullyAllocated
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {stream.allocatedCount} / {stream.recommendedStaffCount} Staffed
                  </span>
                </div>

                {/* Client's Requirement Specs */}
                <div className="mt-3.5 rounded-2xl bg-[#fdfbf9] border border-[#f0ebe3] p-3 text-xs">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#91887e]">
                    Client Booking Requirement
                  </p>
                  <p className="mt-0.5 text-[#3b342e] font-medium">
                    {stream.description}
                  </p>

                  {/* Catering Menu Items Snapshot */}
                  {stream.streamType === "CATERING" &&
                    stream.specDetails.items &&
                    stream.specDetails.items.length > 0 && (
                      <div className="mt-2.5 border-t border-[#f0ebe3] pt-2">
                        <p className="text-[10px] font-bold text-gray-500">
                          Menu Items ({stream.specDetails.items.length}):
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {stream.specDetails.items.slice(0, 5).map((item, idx) => (
                            <span
                              key={idx}
                              className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-semibold text-gray-700 border border-gray-200 shadow-2xs"
                            >
                              {item.dietary === "non-veg" ? "🍗" : "🥗"} {item.name}
                            </span>
                          ))}
                          {stream.specDetails.items.length > 5 && (
                            <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
                              +{stream.specDetails.items.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                </div>

                {/* Currently Assigned Duties */}
                {stream.assignedDuties.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-[#29241f]">
                      Assigned Personnel ({stream.assignedDuties.length}):
                    </p>
                    <div className="mt-2 space-y-2">
                      {stream.assignedDuties.map((duty) => {
                        const isAccepted = duty.status === "ACCEPTED";
                        const isRejected = duty.status === "REJECTED";
                        const checklistCount = (duty as any).checklist?.length || 0;
                        const completedCount = ((duty as any).checklist || []).filter(
                          (i: any) => i.completed
                        ).length;

                        return (
                          <div
                            key={duty._id}
                            className={`rounded-2xl border p-3 text-xs transition ${
                              isAccepted
                                ? "border-emerald-300 bg-emerald-50/70"
                                : isRejected
                                ? "border-rose-200 bg-rose-50/70"
                                : "border-amber-200 bg-amber-50/50"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <UserCheck
                                  size={15}
                                  className={
                                    isAccepted
                                      ? "text-emerald-600"
                                      : isRejected
                                      ? "text-rose-600"
                                      : "text-amber-600"
                                  }
                                />
                                <div>
                                  <span className="font-extrabold text-[#29241f]">
                                    {duty.staff?.name || "Assigned Staff"}
                                  </span>
                                  <span className="ml-1 text-[11px] text-gray-600">
                                    · {duty.dutyTitle}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                                    isAccepted
                                      ? "bg-emerald-100 text-emerald-800"
                                      : isRejected
                                      ? "bg-rose-100 text-rose-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {isAccepted
                                    ? "✓ Confirmed by Staff"
                                    : isRejected
                                    ? "Declined"
                                    : "Pending Acceptance"}
                                </span>

                                <span className="rounded-md bg-white border border-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-700">
                                  {duty.startTime} - {duty.endTime}
                                </span>
                              </div>
                            </div>

                            {/* Sub-duty / instructions callout */}
                            <div className="mt-2.5 flex items-center justify-between border-t border-black/5 pt-2">
                              <span className="text-[11px] font-semibold text-gray-600">
                                {checklistCount > 0
                                  ? `Sub-tasks: ${completedCount}/${checklistCount} completed`
                                  : isAccepted
                                  ? "Staff accepted! Assign sub-duty instructions below."
                                  : "Sub-duty instructions pending."}
                              </span>

                              <button
                                type="button"
                                onClick={() => {
                                  if (!isAccepted) {
                                    alert("Sub-tasks can only be assigned after the staff member accepts the event duty allocation.");
                                    return;
                                  }
                                  const dutyObj: Duty = {
                                    id: duty._id,
                                    eventId: data.event.id,
                                    title: duty.dutyTitle,
                                    event: data.event.eventName,
                                    eventDate: data.targetDate ? data.targetDate.slice(0, 10) : "",
                                    startTime: duty.startTime,
                                    endTime: duty.endTime,
                                    location: data.event.location || "",
                                    staffId: duty.staff?._id || "",
                                    staffName: duty.staff?.name || "Assigned Staff",
                                    description: (duty as any).description || "",
                                    status: (duty.status as any) || "ASSIGNED",
                                    department: stream.department,
                                    serviceName: stream.title,
                                    checklist: (duty as any).checklist || [],
                                  };
                                  setManagingChecklistDuty(dutyObj);
                                }}
                                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition shadow-2xs ${
                                  isAccepted
                                    ? "bg-emerald-700 text-white hover:bg-emerald-800"
                                    : "bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300"
                                }`}
                                title={!isAccepted ? "Sub-tasks can only be assigned after staff accepts duty" : ""}
                              >
                                <ListChecks size={13} />
                                <span>
                                  {isAccepted
                                    ? checklistCount > 0
                                      ? `Manage Sub-duties (${checklistCount})`
                                      : "+ Assign Sub-duties"
                                    : "Sub-duties (Awaiting Acceptance)"}
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Department Staff Pool */}
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#29241f]">
                      {stream.department} Staff Pool (
                      {
                        stream.departmentStaff.filter((s) => s.isAvailable)
                          .length
                      }{" "}
                      available today):
                    </p>
                  </div>

                  <div className="mt-2.5 max-h-56 space-y-2 overflow-y-auto pr-1">
                    {stream.departmentStaff.length === 0 ? (
                      <p className="py-2 text-center text-xs text-gray-500">
                        No staff members assigned to this department yet.
                      </p>
                    ) : (
                      stream.departmentStaff.map((staffMember) => (
                        <div
                          key={staffMember.id}
                          className="flex items-center justify-between rounded-2xl border border-[#eee7dc] bg-[#faf8f5] p-2.5 transition hover:border-[#9a6c37]"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-xs font-bold text-[#29241f]">
                                {staffMember.name}
                              </p>
                              <span className="text-[10px] text-gray-400">
                                ({staffMember.employeeId})
                              </span>
                            </div>

                            {/* Status Indicator */}
                            <div className="mt-0.5 flex items-center gap-1 text-[10px]">
                              {staffMember.status === "AVAILABLE" && (
                                <span className="flex items-center gap-1 font-bold text-emerald-600">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  Available for this Date
                                </span>
                              )}
                              {staffMember.status === "ON_LEAVE" && (
                                <span className="flex items-center gap-1 font-bold text-amber-600">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                  On Leave ({staffMember.statusReason})
                                </span>
                              )}
                              {staffMember.status === "ASSIGNED_OTHER" && (
                                <span className="flex items-center gap-1 font-bold text-blue-600">
                                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                  {staffMember.statusReason}
                                </span>
                              )}
                              {staffMember.status === "ASSIGNED_THIS_EVENT" && (
                                <span className="flex items-center gap-1 font-bold text-purple-600">
                                  <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                                  Already Assigned to Event
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Allocate Action */}
                          <button
                            type="button"
                            onClick={() =>
                              openAllocateModal(stream, staffMember)
                            }
                            disabled={!staffMember.isAvailable}
                            className={`flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition ${
                              staffMember.isAvailable
                                ? "bg-[#9a6c37] text-white hover:bg-[#83592a] shadow-xs"
                                : "cursor-not-allowed bg-gray-200 text-gray-400"
                            }`}
                          >
                            <UserPlus size={13} />
                            Allocate
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Button */}
              <div className="mt-5 border-t border-[#f1ece5] pt-3.5">
                <button
                  type="button"
                  onClick={() => openAllocateModal(stream)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#9a6c37] bg-white py-2 text-xs font-bold text-[#9a6c37] transition hover:bg-[#faf6f0]"
                >
                  <Plus size={14} />
                  Add Custom Duty for {stream.title}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Allocation Modal */}
      {allocatingStream && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl border border-[#e8e1d8] bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#9a6c37]">
                  Allocate to {allocatingStream.department}
                </p>
                <h3 className="text-lg font-black text-[#29241f]">
                  {allocatingStaff
                    ? `Assign ${allocatingStaff.name}`
                    : `New Duty: ${allocatingStream.title}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeAllocateModal}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X size={16} />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700 border border-red-200">
                <AlertCircle size={15} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAllocateSubmit} className="mt-4 space-y-4">
              {/* Staff Selector (if not preselected) */}
              {!allocatingStaff ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Select Available Staff Member *
                  </label>
                  <select
                    required
                    onChange={(e) => {
                      const found = allocatingStream.departmentStaff.find(
                        (s) => s.id === e.target.value
                      );
                      setAllocatingStaff(found || null);
                    }}
                    className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-[#9a6c37]"
                  >
                    <option value="">-- Choose Staff Member --</option>
                    {allocatingStream.departmentStaff.map((staff) => (
                      <option
                        key={staff.id}
                        value={staff.id}
                        disabled={!staff.isAvailable}
                      >
                        {staff.name} ({staff.employeeId}) — {staff.statusLabel}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl bg-[#faf8f5] border border-[#eee7dc] p-3 text-xs">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#b8894b] font-bold text-white">
                    {allocatingStaff.name[0]}
                  </div>
                  <div>
                    <p className="font-extrabold text-[#29241f]">
                      {allocatingStaff.name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      ID: {allocatingStaff.employeeId} · Department:{" "}
                      {allocatingStaff.department}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Duty Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Head Decorator / Buffet Steward"
                  value={dutyTitle}
                  onChange={(e) => setDutyTitle(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3 text-xs outline-none focus:border-[#9a6c37]"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Role / Sub-department
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3 text-xs outline-none focus:border-[#9a6c37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Duty Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dutyDate}
                    onChange={(e) => setDutyDate(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3 text-xs outline-none focus:border-[#9a6c37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3 text-xs outline-none focus:border-[#9a6c37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3 text-xs outline-none focus:border-[#9a6c37]"
                  />
                </div>
              </div>

              {/* Salary Per Hour & Payout Summary */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700">
                    Salary Per Hour ($/hr)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value) || 0)}
                    placeholder="e.g. 25.00"
                    className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3 text-xs outline-none focus:border-[#9a6c37]"
                  />
                </div>

                <div className="flex flex-col justify-center rounded-xl border border-[#eee8e1] bg-[#faf8f5] p-3 text-xs">
                  <p className="font-semibold text-gray-700">Calculated Payout</p>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-gray-600">
                    <span>Duration: <strong>{(() => {
                      if (!startTime || !endTime) return "0.0";
                      const [sH, sM] = startTime.split(":").map(Number);
                      const [eH, eM] = endTime.split(":").map(Number);
                      let startMin = sH * 60 + (sM || 0);
                      let endMin = eH * 60 + (eM || 0);
                      if (endMin < startMin) endMin += 24 * 60;
                      return (Math.max(0, endMin - startMin) / 60).toFixed(1);
                    })()} hrs</strong></span>
                    <span className="font-bold text-[#b8894b]">Est. Pay: ${(() => {
                      if (!startTime || !endTime) return "0.00";
                      const [sH, sM] = startTime.split(":").map(Number);
                      const [eH, eM] = endTime.split(":").map(Number);
                      let startMin = sH * 60 + (sM || 0);
                      let endMin = eH * 60 + (eM || 0);
                      if (endMin < startMin) endMin += 24 * 60;
                      const hours = Math.max(0, endMin - startMin) / 60;
                      return (hours * (Number(hourlyRate) || 0)).toFixed(2);
                    })()}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700">
                  Duty Instructions & Notes (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Special instructions, dress code, checklist items..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 p-3 text-xs outline-none focus:border-[#9a6c37]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAllocateModal}
                  className="h-11 flex-1 rounded-xl border border-gray-200 font-bold text-xs text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || !allocatingStaff}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#29241f] font-bold text-xs text-white hover:bg-black disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  {submitting ? "Allocating..." : "Confirm Allocation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-duty Checklist Instructions Modal */}
      <ManageChecklistModal
        isOpen={Boolean(managingChecklistDuty)}
        duty={managingChecklistDuty}
        onClose={() => setManagingChecklistDuty(null)}
        onSaveChecklist={async (dutyId, checklist) => {
          await updateAssignmentChecklist(dutyId, checklist, token);
          setSuccessToast("Sub-duty instructions assigned & saved successfully!");
          setTimeout(() => setSuccessToast(""), 4000);
          setManagingChecklistDuty(null);
          await loadMatrix();
          if (onAssignmentCreated) onAssignmentCreated();
        }}
      />
    </div>
  );
}

function getStreamIcon(category = "") {
  const cat = category.toLowerCase();

  if (
    cat.includes("cater") ||
    cat.includes("food") ||
    cat.includes("beverage") ||
    cat.includes("drink")
  ) {
    return Utensils;
  }

  if (
    cat.includes("decor") ||
    cat.includes("stage") ||
    cat.includes("floral")
  ) {
    return Palette;
  }

  if (
    cat.includes("sound") ||
    cat.includes("audio") ||
    cat.includes("dj") ||
    cat.includes("music")
  ) {
    return Volume2;
  }

  if (
    cat.includes("photo") ||
    cat.includes("video") ||
    cat.includes("media") ||
    cat.includes("reel")
  ) {
    return Camera;
  }

  if (cat.includes("security") || cat.includes("guard")) {
    return Shield;
  }

  if (cat.includes("logistic") || cat.includes("transport")) {
    return Truck;
  }

  if (cat.includes("hospitality") || cat.includes("usher")) {
    return BellRing;
  }

  return Settings;
}

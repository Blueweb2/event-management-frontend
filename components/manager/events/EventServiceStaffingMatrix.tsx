"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
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
  ChefHat,
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
import { formatTime24to12 } from "@/lib/time-utils";
import EventServiceSelectionSummary from "./EventServiceSelectionSummary";
import ServiceSelectionDetailModal from "./ServiceSelectionDetailModal";

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

  // Detailed Service Selection View Modal State
  const [selectedDetailStream, setSelectedDetailStream] = useState<StaffingStream | null>(null);

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
    const profileRate = (staffMember as any)?.hourlyRate || (staffMember as any)?.salary || 0;
    setHourlyRate(profileRate);

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

  const resolveStaffName = (staffField: any): string => {
    if (typeof staffField === "object" && staffField?.name) return staffField.name;
    const id = typeof staffField === "object" ? staffField?._id : staffField;
    if (!id) return "Assigned Staff";
    const found = data?.allStaffPool?.find((s) => String(s.id) === String(id));
    return found?.name || "Assigned Staff";
  };

  const openDutyChecklist = (duty: any, stream: StaffingStream) => {
    const isAccepted = ["ACCEPTED", "IN_PROGRESS", "COMPLETED"].includes(
      (duty.status || "").toUpperCase()
    );
    if (!isAccepted) {
      alert("Subtasks can only be managed after the staff member accepts their duty allocation.");
      return;
    }

    const staffId = duty.staff?._id || (typeof duty.staff === "string" ? duty.staff : "");
    const staffName = resolveStaffName(duty.staff);

    const dutyObj: Duty = {
      id: duty._id,
      eventId: data?.event?.id || eventId,
      title: duty.dutyTitle,
      event: data?.event?.eventName || "Event",
      eventDate: data?.targetDate ? data.targetDate.slice(0, 10) : "",
      startTime: duty.startTime,
      endTime: duty.endTime,
      location: data?.event?.location || "",
      staffId: staffId || "",
      staffName,
      description: (duty as any).description || "",
      status: (duty.status as any) || "ACCEPTED",
      department: stream.department,
      serviceName: stream.title,
      checklist: (duty as any).checklist || [],
    };
    setManagingChecklistDuty(dutyObj);
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

  const totalRecommended =
    data.staffingStreams.reduce((acc, s) => acc + s.recommendedStaffCount, 0) || 0;
  const totalAllocated =
    data.staffingStreams.reduce((acc, s) => acc + s.allocatedCount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {successToast && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 shadow-sm animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Section Card Container (Matching other sections on Event Details page) */}
      <section className="overflow-hidden rounded-3xl border border-[#e8e1d8] bg-white shadow-sm w-full max-w-full min-w-0">
        {/* Header */}
        <div className="border-b border-[#f1ece5] bg-gradient-to-r from-[#faf8f5] to-white p-4 sm:p-6 w-full max-w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full max-w-full min-w-0">
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-black tracking-tight text-[#29241f] flex items-center gap-2">
                <Layers size={18} className="text-[#9a6c37] shrink-0" />
                <span className="truncate">Event Services &amp; Staff</span>
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Booked services, staff needed, and team assignments
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
              <div className="flex items-center gap-2 bg-[#faf8f5] px-3 py-1.5 rounded-xl border border-[#eee7dc] text-xs">
                <Users size={13} className="text-[#9a6c37] shrink-0" />
                <span className="font-bold text-[#29241f] whitespace-nowrap">
                  {totalAllocated} / {totalRecommended} Staff Assigned
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500 font-medium whitespace-nowrap">
                  {data.staffingStreams.length} Service{data.staffingStreams.length === 1 ? "" : "s"}
                </span>
              </div>

              <button
                type="button"
                onClick={loadMatrix}
                disabled={loading}
                title="Refresh services and staffing"
                aria-label="Refresh services and staffing"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#ded5cb] bg-white text-[#756d64] hover:bg-[#f7f2ec] transition disabled:opacity-50"
              >
                <Loader2 size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-6 w-full max-w-full min-w-0">
          {/* Dynamic Service Streams Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full max-w-full min-w-0">
        {filteredStreams.map((stream) => {
          const isFullyAllocated =
            stream.allocatedCount >= stream.recommendedStaffCount;
          const StreamIcon = getStreamIcon(stream.category);

          const isCateringStream =
            stream.streamType === "CATERING" ||
            stream.streamId === "catering" ||
            stream.department?.toLowerCase().includes("cater");

          const cateringMenuItems = isCateringStream
            ? ((stream.specDetails?.items && stream.specDetails.items.length > 0
                ? stream.specDetails.items
                : data?.event?.foodMenu?.items) || [])
            : [];

          const servingType = isCateringStream
            ? (stream.specDetails?.servingType || data?.event?.foodMenu?.servingType || "")
            : "";

          const guestCount = isCateringStream
            ? (stream.specDetails?.guests || data?.event?.guests || 0)
            : 0;

          return (
            <div
              key={stream.streamId}
              className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-[#e8e1d8] bg-[#fcfbfa] hover:bg-white p-3.5 sm:p-5 shadow-2xs transition hover:shadow-sm w-full max-w-full min-w-0 overflow-hidden"
            >
              <div className="w-full max-w-full min-w-0">
                {/* Clean, Compact Service Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#f1ece5] pb-3.5 w-full max-w-full min-w-0">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#faf6f0] text-[#9a6c37] border border-[#ede5d8]">
                      <StreamIcon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#9a6c37]">
                          {stream.department}
                        </span>
                        {stream.streamType === "CATERING" && (
                          <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-800 shrink-0">
                            Food & Drinks
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-extrabold text-[#29241f] truncate max-w-full" title={stream.title}>
                        {stream.title}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`self-start sm:self-auto rounded-full px-2.5 py-1 text-xs font-bold shrink-0 ${
                      isFullyAllocated
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {stream.allocatedCount} / {stream.recommendedStaffCount} Staff Assigned
                  </span>
                </div>

                {/* Dedicated Client-Selected Items, Packages & Options Section */}
                <EventServiceSelectionSummary
                  stream={stream}
                  eventId={eventId}
                  onOpenDetails={(s) => setSelectedDetailStream(s)}
                />

                {/* Assigned Personnel List (Simple, compact rows) */}
                <div className="mt-3.5 space-y-1.5 w-full max-w-full min-w-0">
                  <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                    <span>Assigned Staff ({stream.assignedDuties.length})</span>
                  </div>

                  {stream.assignedDuties.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 py-3 text-center text-xs text-gray-400">
                      No staff assigned to this service yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-[#faf8f5]/40 overflow-hidden w-full max-w-full min-w-0">
                      {stream.assignedDuties.map((duty) => {
                        const statusUpper = (duty.status || "").toUpperCase();
                        const isAccepted = ["ACCEPTED", "IN_PROGRESS", "COMPLETED"].includes(statusUpper);
                        const isRejected = statusUpper === "REJECTED";
                        const staffName = resolveStaffName(duty.staff);
                        const checklist = (duty as any).checklist || [];
                        const checklistCount = checklist.length;
                        const completedCount = checklist.filter((i: any) => i.completed).length;

                        return (
                          <div
                            key={duty._id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 transition hover:bg-white w-full max-w-full min-w-0"
                          >
                            {/* Staff Info: Name · Shift Time · Status */}
                            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-xs min-w-0 flex-1">
                              <span className="font-bold text-[#29241f] truncate max-w-[120px] sm:max-w-[180px]" title={staffName}>
                                {staffName}
                              </span>
                              <span className="text-gray-300">·</span>
                              <span className="text-gray-600 font-medium text-[11px] shrink-0 whitespace-nowrap">
                                {formatTime24to12(duty.startTime)} – {formatTime24to12(duty.endTime)}
                              </span>
                              <span className="text-gray-300">·</span>
                              {isAccepted ? (
                                <button
                                  type="button"
                                  onClick={() => openDutyChecklist(duty, stream)}
                                  className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer shrink-0"
                                  title="Click to edit subtasks"
                                >
                                  <CheckCircle2 size={11} className="text-emerald-600" />
                                  <span>Accepted</span>
                                </button>
                              ) : isRejected ? (
                                <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200 shrink-0">
                                  Declined
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200 shrink-0">
                                  <Clock size={11} className="text-amber-600" />
                                  Pending
                                </span>
                              )}
                            </div>

                            {/* Action / Subtask button */}
                            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 min-w-0">
                              {isAccepted ? (
                                <button
                                  type="button"
                                  onClick={() => openDutyChecklist(duty, stream)}
                                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 transition cursor-pointer active:scale-95 shadow-2xs min-w-0"
                                  title="Click to manage and edit tasks"
                                >
                                  <ListChecks size={13} className="text-emerald-600 shrink-0" />
                                  <span className="truncate">
                                    Manage Tasks
                                    {checklistCount > 0
                                      ? ` (${completedCount}/${checklistCount})`
                                      : " (+ Add)"}
                                  </span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-gray-400 italic">
                                  Waiting for staff to accept
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Available Department Staff Pool (Clean, compact rows) */}
                <div className="mt-4 border-t border-[#f1ece5] pt-3 w-full max-w-full min-w-0">
                  <div className="flex items-center justify-between text-xs font-bold text-[#29241f]">
                    <span className="truncate">
                      {stream.department} Team (
                      {stream.departmentStaff.filter((s) => s.isAvailable).length} available):
                    </span>
                  </div>

                  <div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto pr-1 w-full max-w-full min-w-0">
                    {stream.departmentStaff.length === 0 ? (
                      <p className="py-2 text-center text-xs text-gray-400">
                        No staff members assigned to this department.
                      </p>
                    ) : (
                      stream.departmentStaff.map((staffMember) => {
                        const assignedDuty = data?.staffingStreams
                          ?.flatMap((s) => s.assignedDuties || [])
                          ?.find(
                            (d) =>
                              (d.staff?._id && String(d.staff._id) === String(staffMember.id)) ||
                              (d.staff && typeof d.staff === "string" && String(d.staff) === String(staffMember.id)) ||
                              (resolveStaffName(d.staff).trim().toLowerCase() === staffMember.name.trim().toLowerCase())
                          );

                        const isAccepted =
                          Boolean(assignedDuty) &&
                          ["ACCEPTED", "IN_PROGRESS", "COMPLETED"].includes(
                            (assignedDuty?.status || "").toUpperCase()
                          );

                        const isAssigned =
                          Boolean(assignedDuty) ||
                          staffMember.status === "ASSIGNED_THIS_EVENT";

                        return (
                          <div
                            key={staffMember.id}
                            className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition border w-full max-w-full min-w-0 gap-2 ${
                              isAccepted
                                ? "border-emerald-200 bg-emerald-50/40"
                                : isAssigned
                                ? "border-purple-100 bg-purple-50/30"
                                : "border-gray-100 bg-[#faf8f5]"
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-bold text-[#29241f] truncate max-w-[110px] sm:max-w-[160px]" title={staffMember.name}>
                                  {staffMember.name}
                                </span>
                                <span className="text-[10px] text-gray-400 shrink-0">
                                  ({staffMember.employeeId})
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] truncate">
                                {isAccepted ? (
                                  <span className="font-bold text-emerald-600">Accepted</span>
                                ) : isAssigned ? (
                                  <span className="font-bold text-purple-600">Assigned</span>
                                ) : staffMember.status === "AVAILABLE" ? (
                                  <span className="text-gray-500">Available</span>
                                ) : staffMember.status === "ON_LEAVE" ? (
                                  <span className="text-amber-600">On Leave</span>
                                ) : (
                                  <span className="text-gray-400 truncate">{staffMember.statusReason || "Unavailable"}</span>
                                )}
                              </div>
                            </div>

                            {/* Action Button */}
                            {isAccepted ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (assignedDuty) {
                                    openDutyChecklist(assignedDuty, stream);
                                  }
                                }}
                                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-200 transition cursor-pointer"
                                title="Click to edit subtasks"
                              >
                                <CheckCircle2 size={12} className="text-emerald-700" />
                                <span>Accepted</span>
                              </button>
                            ) : isAssigned ? (
                              <span className="shrink-0 rounded-lg border border-purple-200 bg-purple-50 px-2 py-1 text-[11px] font-bold text-purple-700">
                                Assigned
                              </span>
                            ) : staffMember.isAvailable ? (
                              <button
                                type="button"
                                onClick={() => openAllocateModal(stream, staffMember)}
                                className="shrink-0 rounded-lg bg-[#9a6c37] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#83592a] transition active:scale-95"
                              >
                                Assign
                              </button>
                            ) : (
                              <span className="shrink-0 rounded-lg bg-gray-100 px-2 py-1 text-[11px] text-gray-400">
                                {staffMember.status === "ON_LEAVE" ? "On Leave" : "Unavailable"}
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>



              </div>

              {/* Bottom Quick Button */}
              <div className="mt-3.5 border-t border-[#f1ece5] pt-2.5">
                {/* <button
                  type="button"
                  onClick={() => openAllocateModal(stream)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#9a6c37]/50 bg-white py-1.5 text-xs font-bold text-[#9a6c37] transition hover:bg-[#faf6f0]"
                >
                  <Plus size={13} />
                  <span>Assign Duty for {stream.title}</span>
                </button> */}
              </div>
            </div>
          );
        })}
          </div>
        </div>
      </section>

      {/* Quick Allocation Modal */}
      {allocatingStream && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative my-auto flex max-h-[92dvh] w-full max-w-lg flex-col rounded-3xl border border-[#e8e1d8] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-[#faf8f5] px-5 py-4 shrink-0">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#9a6c37]">
                  Assign to {allocatingStream.department}
                </p>
                <h3 className="text-base sm:text-lg font-black text-[#29241f]">
                  {allocatingStaff
                    ? `Assign ${allocatingStaff.name}`
                    : `New Task: ${allocatingStream.title}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeAllocateModal}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 hover:bg-gray-100 border border-gray-200 transition"
              >
                <X size={16} />
              </button>
            </div>

            {modalError && (
              <div className="mx-5 mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700 border border-red-200 shrink-0">
                <AlertCircle size={15} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Scrollable Form Body */}
            <form onSubmit={handleAllocateSubmit} className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Staff Selector (if not preselected) */}
                {!allocatingStaff ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-700">
                      Choose Available Staff *
                    </label>
                    <select
                      required
                      onChange={(e) => {
                        const found = allocatingStream.departmentStaff.find(
                          (s) => s.id === e.target.value
                        );
                        setAllocatingStaff(found || null);
                      }}
                      className="mt-1.5 h-12 w-full rounded-2xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#9a6c37]"
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
                    Role / Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Head Decorator / Buffet Steward"
                    value={dutyTitle}
                    onChange={(e) => setDutyTitle(e.target.value)}
                    className="mt-1.5 h-12 w-full rounded-2xl border border-gray-200 px-3.5 text-sm outline-none focus:border-[#9a6c37]"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700">
                      Sub-category / Speciality
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="mt-1.5 h-12 w-full rounded-2xl border border-gray-200 px-3.5 text-sm outline-none focus:border-[#9a6c37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700">
                      Work Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={dutyDate}
                      onChange={(e) => setDutyDate(e.target.value)}
                      className="mt-1.5 h-12 w-full rounded-2xl border border-gray-200 px-3.5 text-sm outline-none focus:border-[#9a6c37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700">
                      Start Time *
                      {startTime && (
                        <span className="ml-2 font-normal text-[#9a6c37]">
                          ({formatTime24to12(startTime)})
                        </span>
                      )}
                    </label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="mt-1.5 h-12 w-full rounded-2xl border border-gray-200 px-3.5 text-sm outline-none focus:border-[#9a6c37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700">
                      End Time *
                      {endTime && (
                        <span className="ml-2 font-normal text-[#9a6c37]">
                          ({formatTime24to12(endTime)})
                        </span>
                      )}
                    </label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="mt-1.5 h-12 w-full rounded-2xl border border-gray-200 px-3.5 text-sm outline-none focus:border-[#9a6c37]"
                    />
                  </div>
                </div>

                {/* Salary Per Hour & Payout Summary */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700">
                      Pay Rate per Hour (₹/hr)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value) || 0)}
                      placeholder="e.g. 500.00"
                      className="mt-1.5 h-12 w-full rounded-2xl border border-gray-200 px-3.5 text-sm outline-none focus:border-[#9a6c37]"
                    />
                    <p className="mt-1 text-[10px] text-gray-400">
                      Auto-filled from staff member&apos;s pay rate.
                    </p>
                  </div>

                  <div className="flex flex-col justify-center rounded-2xl border border-[#eee8e1] bg-[#faf8f5] p-3 text-xs">
                    <p className="font-semibold text-gray-700">Estimated Total Pay</p>
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
                      <span className="font-bold text-[#b8894b]">Est. Pay: ₹{(() => {
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
                    Instructions & Notes (optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Special instructions, dress code, checklist items..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-gray-200 p-3 text-sm outline-none focus:border-[#9a6c37]"
                  />
                </div>
              </div>

              {/* Sticky Modal Action Buttons at Bottom */}
              <div className="flex items-center gap-3 border-t border-gray-100 bg-[#faf8f5] px-5 py-3.5 shrink-0">
                <button
                  type="button"
                  onClick={closeAllocateModal}
                  className="h-12 flex-1 rounded-2xl border border-gray-300 bg-white font-bold text-xs text-gray-700 hover:bg-gray-50 active:scale-95 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || !allocatingStaff}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#29241f] font-bold text-xs text-white hover:bg-black active:scale-95 transition disabled:opacity-50 shadow-sm cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <UserPlus size={16} />
                  )}
                  {submitting ? "Assigning..." : "Confirm Assignment"}
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
        isCompleted={
          data?.event?.status === "COMPLETED" ||
          data?.event?.status === "Completed" ||
          data?.event?.status === "Settled" ||
          data?.event?.status === "Invoiced"
        }
        onClose={() => setManagingChecklistDuty(null)}
        onSaveChecklist={async (dutyId, checklist) => {
          await updateAssignmentChecklist(dutyId, checklist, token);
          setSuccessToast("Task instructions saved successfully!");
          setTimeout(() => setSuccessToast(""), 4000);
          setManagingChecklistDuty(null);
          await loadMatrix();
          if (onAssignmentCreated) onAssignmentCreated();
        }}
      />

      {/* Service Selection Detail Modal */}
      <ServiceSelectionDetailModal
        isOpen={Boolean(selectedDetailStream)}
        onClose={() => setSelectedDetailStream(null)}
        stream={selectedDetailStream}
        eventName={data?.event?.eventName}
        eventDate={data?.event?.eventDate}
        guests={data?.event?.guests}
        location={data?.event?.location}
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

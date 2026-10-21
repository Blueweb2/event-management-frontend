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
  ChefHat,
  BellRing,
  Settings,
} from "lucide-react";

import {
  getEventStaffingRequirements,
  calculateKitchenIngredients,
  getKitchenPurchaseRequests,
  type IngredientCalculationResult,
  EventStaffingResponse,
  StaffingStream,
  DepartmentStaffMember,
} from "@/lib/department.api";
import { createAssignment, updateAssignmentChecklist } from "@/lib/assignment.api";
import { useAuth } from "@/hooks/useAuth";
import ManageChecklistModal from "@/components/manager/duties/ManageChecklistModal";
import type { Duty } from "@/components/manager/duties/constants";
import { formatTime24to12 } from "@/lib/time-utils";

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

  // Collapsible Catering Menu & Chef Ingredients State
  const [cateringMenuExpanded, setCateringMenuExpanded] = useState(false);
  const [cateringCalcResult, setCateringCalcResult] = useState<IngredientCalculationResult | null>(null);
  const [chefPurchaseItems, setChefPurchaseItems] = useState<any[]>([]);
  const [cateringIngredientsLoading, setCateringIngredientsLoading] = useState(false);

  const loadCateringChefData = async () => {
    if (!eventId) return;
    try {
      setCateringIngredientsLoading(true);
      const [calcRes, reqsRes] = await Promise.all([
        calculateKitchenIngredients(eventId, 5, token).catch(() => ({ data: null })),
        getKitchenPurchaseRequests("", token).catch(() => ({ data: [] })),
      ]);

      if (calcRes?.data) {
        setCateringCalcResult(calcRes.data);
      }

      if (Array.isArray(reqsRes?.data)) {
        const eventRequests = reqsRes.data.filter(
          (pr: any) =>
            (pr.event?._id && String(pr.event._id) === String(eventId)) ||
            (pr.event && typeof pr.event === "string" && String(pr.event) === String(eventId))
        );
        const eventItems = eventRequests.flatMap((pr: any) =>
          (pr.items || []).map((it: any) => ({
            name: it.itemName,
            requiredQuantity: it.requiredQuantity,
            unit: it.unit || "pcs",
            notes: it.notes || pr.notes || "",
            isGroceryRequest: true,
          }))
        );
        setChefPurchaseItems(eventItems);
      }
    } catch {
      // ignore
    } finally {
      setCateringIngredientsLoading(false);
    }
  };

  const loadMatrix = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getEventStaffingRequirements(eventId, token);
      if (res.data) {
        setData(res.data);
      }
      void loadCateringChefData();
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
<h2 className="text-lg font-black text-[#29241f] flex items-center gap-2">
        <Layers size={16} className="text-[#9a6c37]" />
        Event Service 
      </h2>

      {/* Dynamic Service Streams Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
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

          const foodNotes = isCateringStream
            ? (data?.event?.foodMenu?.notes || "")
            : "";

          const dishesWithIngredients = isCateringStream
            ? (cateringCalcResult?.perItemCalculations?.filter(
                (dish) => Array.isArray(dish.ingredients) && dish.ingredients.length > 0
              ) || [])
            : [];

          const aggregatedList = isCateringStream
            ? (cateringCalcResult?.aggregatedIngredients || [])
            : [];

          const hasAnyChefIngredients =
            dishesWithIngredients.length > 0 ||
            aggregatedList.length > 0 ||
            chefPurchaseItems.length > 0;

          return (
            <div
              key={stream.streamId}
              className="flex flex-col justify-between rounded-3xl border border-[#e8e1d8] bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div>
                {/* Clean, Compact Service Header */}
                <div className="flex items-center justify-between border-b border-[#f1ece5] pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#faf6f0] text-[#9a6c37] border border-[#ede5d8]">
                      <StreamIcon size={18} />
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
                      <h3 className="text-sm font-extrabold text-[#29241f]">
                        {stream.title}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      isFullyAllocated
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {stream.allocatedCount} / {stream.recommendedStaffCount} Staffed
                  </span>
                </div>

                {/* Assigned Personnel List (Simple, compact rows) */}
                <div className="mt-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                    <span>Assigned Staff ({stream.assignedDuties.length})</span>
                  </div>

                  {stream.assignedDuties.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-200 py-3 text-center text-xs text-gray-400">
                      No staff assigned to this service yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-[#faf8f5]/40 overflow-hidden">
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
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 transition hover:bg-white"
                          >
                            {/* Staff Info: Name · Shift Time · Status */}
                            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                              <span className="font-bold text-[#29241f]">{staffName}</span>
                              <span className="text-gray-300">·</span>
                              <span className="text-gray-600 font-medium">
                                {formatTime24to12(duty.startTime)} – {formatTime24to12(duty.endTime)}
                              </span>
                              <span className="text-gray-300">·</span>
                              {isAccepted ? (
                                <button
                                  type="button"
                                  onClick={() => openDutyChecklist(duty, stream)}
                                  className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                                  title="Click to edit subtasks"
                                >
                                  <CheckCircle2 size={11} className="text-emerald-600" />
                                  <span>Accepted</span>
                                </button>
                              ) : isRejected ? (
                                <span className="inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
                                  Declined
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                                  <Clock size={11} className="text-amber-600" />
                                  Pending Acceptance
                                </span>
                              )}
                            </div>

                            {/* Action / Subtask button */}
                            <div className="flex items-center gap-2 shrink-0">
                              {isAccepted ? (
                                <button
                                  type="button"
                                  onClick={() => openDutyChecklist(duty, stream)}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 transition cursor-pointer active:scale-95 shadow-2xs"
                                  title="Click to manage and edit subtasks"
                                >
                                  <ListChecks size={13} className="text-emerald-600" />
                                  <span>
                                    Manage Subtasks
                                    {checklistCount > 0
                                      ? ` · ${completedCount}/${checklistCount} completed`
                                      : " (+ Add)"}
                                  </span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-gray-400 italic">
                                  Awaiting acceptance
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
                <div className="mt-4 border-t border-[#f1ece5] pt-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#29241f]">
                    <span>
                      {stream.department} Staff Pool (
                      {stream.departmentStaff.filter((s) => s.isAvailable).length} available):
                    </span>
                  </div>

                  <div className="mt-2 max-h-48 space-y-1.5 overflow-y-auto pr-1">
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
                            className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition border ${
                              isAccepted
                                ? "border-emerald-200 bg-emerald-50/40"
                                : isAssigned
                                ? "border-purple-100 bg-purple-50/30"
                                : "border-gray-100 bg-[#faf8f5]"
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="font-bold text-[#29241f] truncate">
                                  {staffMember.name}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  ({staffMember.employeeId})
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px]">
                                {isAccepted ? (
                                  <span className="font-bold text-emerald-600">Accepted</span>
                                ) : isAssigned ? (
                                  <span className="font-bold text-purple-600">Assigned</span>
                                ) : staffMember.status === "AVAILABLE" ? (
                                  <span className="text-gray-500">Available</span>
                                ) : staffMember.status === "ON_LEAVE" ? (
                                  <span className="text-amber-600">On Leave</span>
                                ) : (
                                  <span className="text-gray-400">{staffMember.statusReason || "Unavailable"}</span>
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
                                Choose
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

                {/* Collapsible Catering Menu & Chef-Added Ingredients Section */}
                {isCateringStream && (
                  <div className="mt-4 border-t border-[#f1ece5] pt-3">
                    {/* Compact Toggle Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setCateringMenuExpanded((prev) => !prev);
                        if (!cateringCalcResult && !cateringIngredientsLoading) {
                          void loadCateringChefData();
                        }
                      }}
                      className="flex w-full items-center justify-between rounded-xl border border-[#ede5d8] bg-[#faf8f5] px-3.5 py-2 text-xs font-bold text-[#785122] transition hover:bg-[#f3ede4] hover:border-[#dfd3c3] active:scale-[0.99] cursor-pointer"
                      aria-expanded={cateringMenuExpanded}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{cateringMenuExpanded ? "▲ Hide Catering Menu" : "▼ Show Catering Menu"}</span>
                        {cateringMenuItems.length > 0 && (
                          <span className="rounded-full bg-amber-100 border border-amber-300/70 px-1.5 py-0.2 text-[10px] font-extrabold text-amber-900">
                            {cateringMenuItems.length}
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] font-semibold text-[#9a6c37]">
                        {cateringMenuExpanded ? "Click to collapse" : "Menus & Ingredients"}
                      </span>
                    </button>

                    {/* Collapsible Expanded Content */}
                    {cateringMenuExpanded && (
                      <div className="mt-2.5 space-y-4 rounded-2xl border border-[#ede5d8] bg-[#fdfcf9] p-3 text-xs animate-in fade-in duration-200">
                        {/* 1. Client-Selected Catering Menus */}
                        <div>
                          <div className="flex items-center justify-between border-b border-[#f1ece5] pb-2 mb-2">
                            <div className="flex items-center gap-1.5 font-bold text-[#29241f]">
                              <Utensils size={13} className="text-[#9a6c37]" />
                              <span>Client-Selected Catering Menus</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                              {servingType && (
                                <span className="rounded bg-stone-100 px-1.5 py-0.5 font-medium text-stone-700 capitalize">
                                  Serving: {servingType}
                                </span>
                              )}
                              {guestCount > 0 && (
                                <span className="rounded bg-stone-100 px-1.5 py-0.5 font-medium text-stone-700">
                                  {guestCount} Guests
                                </span>
                              )}
                            </div>
                          </div>

                          {cateringMenuItems.length === 0 ? (
                            <p className="text-xs text-gray-500 italic py-1">
                              No catering menus selected for this event.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              <div className="grid gap-2 sm:grid-cols-2">
                                {cateringMenuItems.map((item, idx) => (
                                  <div
                                    key={item.name + idx}
                                    className="flex flex-col justify-between rounded-xl border border-[#ede5d8] bg-white p-2.5 shadow-2xs"
                                  >
                                    <div>
                                      <div className="flex items-start justify-between gap-1.5">
                                        <span className="font-bold text-[#29241f] leading-snug">
                                          {item.name}
                                        </span>
                                        {item.dietary && (
                                          <span
                                            className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${
                                              item.dietary === "VEG"
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                : item.dietary === "NON_VEG"
                                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                                : "bg-amber-50 text-amber-700 border border-amber-200"
                                            }`}
                                          >
                                            {item.dietary}
                                          </span>
                                        )}
                                      </div>
                                      <p className="mt-1 text-[11px] font-medium text-gray-500 capitalize">
                                        Category: {item.category || "General"}
                                      </p>
                                    </div>
                                    {(item.quantity || guestCount > 0) && (
                                      <div className="mt-1.5 flex items-center justify-between border-t border-gray-100 pt-1 text-[10px] text-gray-500">
                                        <span>Quantity / Servings:</span>
                                        <span className="font-semibold text-gray-800">
                                          {item.quantity ? `${item.quantity} portions` : `${guestCount} guests`}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {foodNotes && (
                                <div className="rounded-xl bg-amber-50/70 border border-amber-200/60 p-2.5 text-[11px] text-amber-900">
                                  <span className="font-bold">Client Notes & Customizations: </span>
                                  <span>{foodNotes}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 2. Chef-Added Ingredients */}
                        <div className="border-t border-[#f1ece5] pt-3">
                          <div className="flex items-center justify-between pb-2">
                            <div className="flex items-center gap-1.5 font-bold text-[#29241f]">
                              <ChefHat size={13} className="text-[#9a6c37]" />
                              <span>Chef-Added Ingredients</span>
                            </div>
                            {cateringIngredientsLoading && (
                              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <Loader2 size={11} className="animate-spin text-[#9a6c37]" />
                                <span>Loading...</span>
                              </div>
                            )}
                          </div>

                          {cateringIngredientsLoading && !hasAnyChefIngredients ? (
                            <div className="flex items-center justify-center py-3 text-xs text-gray-400">
                              <Loader2 size={14} className="animate-spin mr-1.5 text-[#9a6c37]" />
                              Loading event ingredients...
                            </div>
                          ) : !hasAnyChefIngredients ? (
                            <p className="text-xs text-gray-500 italic py-1">
                              No ingredients added by the chef yet.
                            </p>
                          ) : (
                            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                              {/* Grouped by Dish when perItemCalculations exists */}
                              {dishesWithIngredients.length > 0 ? (
                                dishesWithIngredients.map((dish, dIdx) => (
                                  <div
                                    key={dish.name + dIdx}
                                    className="rounded-xl border border-[#ede5d8] bg-white p-2.5 shadow-2xs"
                                  >
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 mb-1.5">
                                      <span className="font-bold text-xs text-[#29241f] flex items-center gap-1.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#9a6c37]" />
                                        {dish.name}
                                      </span>
                                      {dish.category && (
                                        <span className="text-[10px] text-gray-400 font-medium capitalize">
                                          {dish.category}
                                        </span>
                                      )}
                                    </div>
                                    <div className="grid gap-1.5 sm:grid-cols-2">
                                      {dish.ingredients.map((ing, iIdx) => (
                                        <div
                                          key={ing.name + iIdx}
                                          className="flex items-center justify-between rounded-lg bg-[#faf8f5] px-2 py-1 text-[11px]"
                                        >
                                          <div className="truncate pr-2">
                                            <span className="font-medium text-gray-800">{ing.name}</span>
                                            {ing.notes && (
                                              <span className="block text-[9px] text-gray-400 italic truncate">
                                                {ing.notes}
                                              </span>
                                            )}
                                          </div>
                                          <span className="shrink-0 font-bold text-[#785122]">
                                            {ing.requiredQuantity} {ing.unit}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))
                              ) : aggregatedList.length > 0 ? (
                                <div className="rounded-xl border border-[#ede5d8] bg-white p-2.5">
                                  <div className="grid gap-1.5 sm:grid-cols-2">
                                    {aggregatedList.map((ing, idx) => (
                                      <div
                                        key={ing.name + idx}
                                        className="flex items-center justify-between rounded-lg bg-[#faf8f5] px-2.5 py-1.5 text-[11px]"
                                      >
                                        <span className="font-medium text-gray-800">{ing.name}</span>
                                        <span className="shrink-0 font-bold text-[#785122]">
                                          {ing.requiredQuantity} {ing.unit}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : null}

                              {/* Additional Event-Specific Chef Grocery Requests */}
                              {chefPurchaseItems.length > 0 && (
                                <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-2.5">
                                  <div className="flex items-center justify-between border-b border-amber-200/50 pb-1 mb-1.5">
                                    <span className="font-bold text-xs text-amber-900">
                                      Event Grocery & Special Requests
                                    </span>
                                    <span className="text-[10px] text-amber-700 font-medium">
                                      {chefPurchaseItems.length} items
                                    </span>
                                  </div>
                                  <div className="grid gap-1.5 sm:grid-cols-2">
                                    {chefPurchaseItems.map((item, pIdx) => (
                                      <div
                                        key={item.name + pIdx}
                                        className="flex items-center justify-between rounded-lg bg-white/90 px-2 py-1 text-[11px] border border-amber-100"
                                      >
                                        <div className="truncate pr-2">
                                          <span className="font-medium text-gray-800">{item.name}</span>
                                          {item.notes && (
                                            <span className="block text-[9px] text-gray-400 italic truncate">
                                              {item.notes}
                                            </span>
                                          )}
                                        </div>
                                        <span className="shrink-0 font-bold text-amber-800">
                                          {item.requiredQuantity} {item.unit}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                  Allocate to {allocatingStream.department}
                </p>
                <h3 className="text-base sm:text-lg font-black text-[#29241f]">
                  {allocatingStaff
                    ? `Assign ${allocatingStaff.name}`
                    : `New Duty: ${allocatingStream.title}`}
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
                    Duty Title *
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
                      Role / Sub-department
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
                      Duty Date *
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
                      Hourly Pay Rate (₹/hr)
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
                      Auto-filled from staff member&apos;s base salary profile.
                    </p>
                  </div>

                  <div className="flex flex-col justify-center rounded-2xl border border-[#eee8e1] bg-[#faf8f5] p-3 text-xs">
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
                    Duty Instructions & Notes (optional)
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
        isCompleted={
          data?.event?.status === "COMPLETED" ||
          data?.event?.status === "Completed" ||
          data?.event?.status === "Settled" ||
          data?.event?.status === "Invoiced"
        }
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

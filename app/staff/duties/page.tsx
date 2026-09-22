"use client";

import { useEffect, useState, useMemo } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Play,
  Loader2,
  CheckSquare,
  Square,
  Sparkles,
  AlertCircle,
  BellRing,
  UserCheck,
  ListChecks,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useAssignments } from "@/hooks/useAssignments";
import { useAttendance } from "@/hooks/useAttendance";
import {
  acceptAssignment,
  updateAssignmentChecklist,
} from "@/lib/assignment.api";
import type { Assignment } from "@/types/assignment";
import { ListSkeleton } from "@/components/common/SkeletonLoaders";
import RichEmptyState from "@/components/common/RichEmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";

const getLocation = (): Promise<string> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve("Location tracking not supported by browser");
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(
            `Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          );
        },
        () => {
          resolve("Location permission denied or unavailable");
        },
        { timeout: 5000 }
      );
    }
  });
};

export default function StaffDutiesPage() {
  const { token, user } = useAuth();

  const {
    assignments,
    loading: assignmentsLoading,
    error: assignmentsError,
    fetchAssignments,
  } = useAssignments({
    token,
    filters: { staff: user?.id },
    autoFetch: true,
  });

  const {
    attendance,
    staffCheckIn,
    staffCheckOut,
    fetchAttendance,
  } = useAttendance({
    token,
    filters: { staff: user?.id },
    autoFetch: true,
  });

  // Local state for optimistic checklist and acceptance updates
  const [localDuties, setLocalDuties] = useState<Assignment[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [updatingChecklistId, setUpdatingChecklistId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>("");

  useEffect(() => {
    setLocalDuties(assignments);
  }, [assignments]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // ==========================================
  // Handle Shift Acceptance
  // ==========================================
  const handleAcceptShift = async (dutyId: string) => {
    if (!token) return;
    setAcceptingId(dutyId);

    try {
      const updated = await acceptAssignment(dutyId, token);
      setLocalDuties((prev) =>
        prev.map((d) => (d._id === dutyId ? { ...d, status: "ACCEPTED" } : d))
      );
      showToast("Shift accepted! See you on duty.");
      void fetchAssignments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to accept shift.");
    } finally {
      setAcceptingId(null);
    }
  };

  // ==========================================
  // Handle Checklist Sub-Task Toggle
  // ==========================================
  const handleToggleSubTask = async (
    dutyId: string,
    taskIndex: number
  ) => {
    if (!token) return;

    const targetDuty = localDuties.find((d) => d._id === dutyId);
    if (!targetDuty || !targetDuty.checklist) return;

    const updatedChecklist = targetDuty.checklist.map((item, idx) =>
      idx === taskIndex ? { ...item, completed: !item.completed } : item
    );

    // Optimistic UI Update
    setLocalDuties((prev) =>
      prev.map((d) =>
        d._id === dutyId ? { ...d, checklist: updatedChecklist } : d
      )
    );

    try {
      setUpdatingChecklistId(dutyId);
      await updateAssignmentChecklist(dutyId, updatedChecklist, token);
    } catch (err) {
      // Revert on failure
      setLocalDuties((prev) =>
        prev.map((d) =>
          d._id === dutyId ? { ...d, checklist: targetDuty.checklist } : d
        )
      );
      console.warn("Failed to update checklist item", err);
    } finally {
      setUpdatingChecklistId(null);
    }
  };

  // ==========================================
  // Attendance Clock-In / Clock-Out
  // ==========================================
  const handleCheckIn = async (dutyId: string) => {
    setProcessingId(dutyId);
    try {
      const locationNotes = await getLocation();
      await staffCheckIn({ duty: dutyId, notes: locationNotes });
      await fetchAttendance();
      showToast("Checked in successfully! Have a great shift.");
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCheckOut = async (dutyId: string) => {
    setProcessingId(dutyId);
    try {
      const locationNotes = await getLocation();
      await staffCheckOut({ duty: dutyId, notes: locationNotes });
      await fetchAttendance();
      showToast("Checked out successfully! Shift logged.");
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (assignmentsLoading && localDuties.length === 0) {
    return (
      <main className="space-y-4 py-5 sm:py-6">
        <div className="border-b border-[#e8e1d8] pb-6">
          <p className="text-sm font-semibold text-[#9a6c37]">Staff Portal</p>
          <h1 className="mt-1 text-2xl font-bold text-[#29241f] sm:text-3xl">
            My Duties & Shifts
          </h1>
        </div>
        <ListSkeleton count={4} />
      </main>
    );
  }

  if (assignmentsError) {
    return <ErrorMessage message={assignmentsError} />;
  }

  return (
    <main className="space-y-6 py-5 sm:py-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 shadow-lg animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-[#e8e1d8] pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#9a6c37]">
          Staff Operations
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[#29241f] sm:text-3xl">
          My Duties & Shift Roster
        </h1>
        <p className="mt-2 text-xs text-[#756d64] sm:text-sm">
          Review assigned shifts, accept duty schedules, and complete operational task checklists.
        </p>
      </header>

      {localDuties.length === 0 ? (
        <div className="mt-8">
          <RichEmptyState
            title="No Shifts Assigned Yet"
            description="You currently have no upcoming duty assignments. Enjoy your time off or check back once the manager publishes new shift rosters!"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {localDuties.map((assignment) => {
            const event =
              typeof assignment.event === "object" ? assignment.event : null;
            const dutyRecord = attendance.find(
              (att) =>
                (typeof att.duty === "object" ? att.duty._id : att.duty) ===
                assignment._id
            );

            const isCheckedIn = Boolean(dutyRecord?.checkIn && !dutyRecord?.checkOut);
            const isCompleted = Boolean(dutyRecord?.checkIn && dutyRecord?.checkOut);
            const isPendingAcceptance = assignment.status === "ASSIGNED";
            const isAccepted = assignment.status === "ACCEPTED";

            const checklist = assignment.checklist || [];
            const completedChecklistCount = checklist.filter((i) => i.completed).length;
            const checklistProgress =
              checklist.length > 0
                ? Math.round((completedChecklistCount / checklist.length) * 100)
                : 0;

            const deptCategory = assignment.role || "Operations";
            const deptEmoji = getDepartmentEmoji(deptCategory);

            return (
              <article
                key={assignment._id}
                className="overflow-hidden rounded-3xl border border-[#e8e1d8] bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Pending Acceptance Callout Banner */}
                {isPendingAcceptance && (
                  <div className="flex flex-col gap-2 border-b border-amber-200 bg-amber-50/80 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <BellRing size={16} className="text-amber-600 animate-bounce" />
                      <span>New Shift Assigned: Please confirm your acceptance.</span>
                    </div>

                    <button
                      type="button"
                      disabled={acceptingId === assignment._id}
                      onClick={() => handleAcceptShift(assignment._id)}
                      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 text-xs font-extrabold text-white shadow-xs transition hover:bg-amber-700 disabled:opacity-50"
                    >
                      {acceptingId === assignment._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <UserCheck size={14} />
                      )}
                      Accept Shift
                    </button>
                  </div>
                )}

                <div className="p-5 sm:p-6">
                  {/* Card Header */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#faf6f0] px-2.5 py-0.5 text-[11px] font-extrabold text-[#9a6c37] border border-[#ede5d8]">
                          {deptEmoji} {deptCategory}
                        </span>

                        {isAccepted && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                            ✓ Shift Accepted
                          </span>
                        )}

                        {isCheckedIn && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white animate-pulse">
                            ● Active Shift
                          </span>
                        )}
                      </div>

                      <h2 className="mt-2 text-lg font-black text-[#29241f] sm:text-xl">
                        {assignment.dutyTitle}
                      </h2>
                      <p className="text-xs font-medium text-[#8d847b]">
                        {event ? event.eventName : "Event"} · {event?.eventType || "Event"}
                      </p>
                    </div>

                    <DutyStatusPill
                      status={
                        isCompleted
                          ? "Completed"
                          : isCheckedIn
                          ? "In Progress"
                          : isAccepted
                          ? "Accepted"
                          : isPendingAcceptance
                          ? "Pending Acceptance"
                          : assignment.status
                      }
                    />
                  </div>

                  {/* Shift Info Grid */}
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <Info
                      icon={<CalendarDays size={16} />}
                      label="Duty Date"
                      value={
                        assignment.dutyDate
                          ? new Date(assignment.dutyDate).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "TBA"
                      }
                    />

                    <Info
                      icon={<Clock3 size={16} />}
                      label="Shift Hours"
                      value={`${assignment.startTime} - ${assignment.endTime}`}
                    />

                    <Info
                      icon={<MapPin size={16} />}
                      label="Location"
                      value={event?.location || "Venue location TBA"}
                    />
                  </div>

                  {/* Duty Description / Special Instructions */}
                  {(assignment.description || assignment.notes) && (
                    <div className="mt-4 rounded-2xl bg-[#faf8f5] border border-[#f0ebe3] p-4 text-xs">
                      <p className="font-extrabold uppercase tracking-wider text-[#9b938a] text-[10px]">
                        Duty Instructions & Notes
                      </p>
                      <p className="mt-1 leading-5 text-[#403a34]">
                        {assignment.description || assignment.notes}
                      </p>
                    </div>
                  )}

                  {/* ========================================================
                      Interactive Sub-Tasks Checklist Section
                  ======================================================== */}
                  {checklist.length > 0 && (
                    <div className="mt-5 rounded-2xl border border-[#eee7dc] bg-[#faf8f5] p-4 sm:p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#eee7dc] pb-3">
                        <div className="flex items-center gap-2">
                          <ListChecks size={18} className="text-[#9a6c37]" />
                          <h3 className="text-xs font-black uppercase tracking-wider text-[#29241f]">
                            Shift Sub-Task Checklist
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-extrabold text-[#9a6c37]">
                            {completedChecklistCount} of {checklist.length} Completed ({checklistProgress}%)
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-[#b8894b] transition-all duration-300"
                          style={{ width: `${checklistProgress}%` }}
                        />
                      </div>

                      {/* Checklist Items */}
                      <div className="mt-3.5 space-y-2">
                        {checklist.map((item, idx) => (
                          <button
                            type="button"
                            key={item._id || idx}
                            onClick={() => handleToggleSubTask(assignment._id, idx)}
                            className={`flex w-full items-start gap-3 rounded-xl border p-2.5 text-left text-xs transition ${
                              item.completed
                                ? "border-emerald-200 bg-emerald-50/50 text-gray-500"
                                : "border-gray-200 bg-white text-[#29241f] hover:border-[#b8894b]"
                            }`}
                          >
                            <span className="mt-0.5 shrink-0 text-emerald-600">
                              {item.completed ? (
                                <CheckSquare size={16} />
                              ) : (
                                <Square size={16} className="text-gray-400" />
                              )}
                            </span>

                            <span
                              className={`flex-1 font-medium ${
                                item.completed ? "line-through text-gray-400" : ""
                              }`}
                            >
                              {item.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attendance Check-in / Check-out Controls */}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
                    <div>
                      {isCompleted ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                          <CheckCircle2 size={16} />
                          <span>Shift Completed & Logged</span>
                        </div>
                      ) : isCheckedIn && dutyRecord?.checkIn ? (
                        <p className="text-xs text-gray-500">
                          Checked in at {new Date(dutyRecord.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500">
                          Check in when you arrive at the venue to record attendance.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCheckedIn && !isCompleted && (
                        <button
                          type="button"
                          disabled={processingId === assignment._id}
                          onClick={() => handleCheckIn(assignment._id)}
                          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#29241f] px-5 text-xs font-extrabold text-white shadow-sm transition hover:bg-black disabled:opacity-50"
                        >
                          {processingId === assignment._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Play size={14} />
                          )}
                          Clock In
                        </button>
                      )}

                      {isCheckedIn && (
                        <button
                          type="button"
                          disabled={processingId === assignment._id}
                          onClick={() => handleCheckOut(assignment._id)}
                          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-700 px-5 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-50"
                        >
                          {processingId === assignment._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          Clock Out
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

function DutyStatusPill({ status }: { status: string }) {
  const getClasses = () => {
    switch (status) {
      case "Pending Acceptance":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "Accepted":
        return "bg-blue-50 text-blue-800 border border-blue-200";
      case "In Progress":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "Completed":
        return "bg-gray-100 text-gray-700 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${getClasses()}`}
    >
      {status}
    </span>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | undefined;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#faf8f5] border border-[#eee7dc] p-3">
      <span className="text-[#a7773f] shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#9b938a]">
          {label}
        </p>
        <p className="mt-0.5 truncate text-xs font-extrabold text-[#403a34]">
          {value}
        </p>
      </div>
    </div>
  );
}

function getDepartmentEmoji(role = "") {
  const r = role.toLowerCase();
  if (r.includes("cater") || r.includes("food") || r.includes("chef") || r.includes("beverage"))
    return "🍽️";
  if (r.includes("decor") || r.includes("stage") || r.includes("floral"))
    return "🎨";
  if (r.includes("sound") || r.includes("audio") || r.includes("dj"))
    return "🔊";
  if (r.includes("photo") || r.includes("video") || r.includes("media") || r.includes("reel"))
    return "📷";
  if (r.includes("security") || r.includes("guard"))
    return "🛡️";
  if (r.includes("logistic") || r.includes("transport"))
    return "🚚";
  if (r.includes("hospitality") || r.includes("host") || r.includes("usher"))
    return "🛎️";
  return "⚙️";
}
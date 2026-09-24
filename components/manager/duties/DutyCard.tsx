"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  ListChecks,
  MapPin,
  MoreVertical,
  Trash2,
  User,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  UserX,
  UserCheck,
  RefreshCw,
  Building2,
} from "lucide-react";
import { useState } from "react";

import type { Duty } from "./constants";

interface DutyCardProps {
  duty: Duty;
  onEdit: (duty: Duty) => void;
  onDelete: (duty: Duty) => void;
  onStatusChange: (duty: Duty) => void;
  onToggleChecklist?: (dutyId: string, updatedChecklist: Array<{ _id?: string; text: string; completed: boolean }>) => void;
  onManageChecklist?: (duty: Duty) => void;
}

export default function DutyCard({
  duty,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleChecklist,
  onManageChecklist,
}: DutyCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);

  const checklistItems = duty.checklist || [];
  const completedCount = checklistItems.filter((i) => i.completed).length;
  const totalCount = checklistItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const statusClasses: Record<string, string> = {
    ASSIGNED: "bg-amber-50 text-amber-800 border border-amber-200/80",
    ACCEPTED: "bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold",
    REJECTED: "bg-rose-50 text-rose-700 border border-rose-200/80 font-bold",
    IN_PROGRESS: "bg-[#f8f0df] text-[#9a6c37]",
    COMPLETED: "bg-[#edf5ed] text-[#557555]",
    CANCELLED: "bg-[#fdf1ef] text-[#a15f57]",
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "Pending Confirmation";
      case "ACCEPTED":
        return "Confirmed by Staff";
      case "REJECTED":
        return "Declined by Staff";
      case "IN_PROGRESS":
        return "In Progress";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  const handleCheckitemClick = (index: number) => {
    if (!onToggleChecklist) return;
    const updated = checklistItems.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    );
    onToggleChecklist(duty.id, updated);
  };

  return (
    <article className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 flex flex-col justify-between">
      <div>
        {/* Top */}
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              duty.status === "REJECTED"
                ? "bg-rose-50 text-rose-600"
                : duty.status === "ACCEPTED"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-[#f7efe4] text-[#a7773f]"
            }`}
          >
            {duty.status === "REJECTED" ? (
              <UserX size={20} />
            ) : duty.status === "ACCEPTED" ? (
              <UserCheck size={20} />
            ) : (
              <CheckCircle2 size={20} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-[#29241f]">
                  {duty.title}
                </h3>

                <p className="mt-1 truncate text-sm text-[#756d64]">
                  {duty.event}
                </p>
              </div>

              <div className="relative shrink-0">
                <button
                  type="button"
                  aria-label={`More options for ${duty.title}`}
                  title="More options"
                  onClick={() => setMenuOpen((value) => !value)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8d847b] transition hover:bg-[#f7f3ee] hover:text-[#29241f]"
                >
                  <MoreVertical size={17} />
                </button>

                {menuOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Close menu"
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setMenuOpen(false)}
                    />

                    <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-xl border border-[#e8e1d8] bg-white p-1 shadow-lg">
                      {onManageChecklist && (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            onManageChecklist(duty);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-[#a7773f] hover:bg-[#faf6f0]"
                        >
                          <ListChecks size={14} />
                          Manage Subtasks
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit(duty);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#403a34] hover:bg-[#f8f4ee]"
                      >
                        <Edit3 size={14} />
                        Edit / Reassign
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(duty);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#a15f57] hover:bg-[#fdf1ef]"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  statusClasses[duty.status] || "bg-gray-100 text-gray-700"
                }`}
              >
                {duty.status === "ACCEPTED" && <UserCheck size={12} />}
                {duty.status === "REJECTED" && <AlertCircle size={12} />}
                {getStatusLabel(duty.status)}
              </span>

              {(duty.department || duty.serviceName) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  <Building2 size={10} />
                  {duty.serviceName || duty.department}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Staff Rejection Reason Banner */}
        {duty.status === "REJECTED" && duty.rejectionReason && (
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800">
            <div className="flex items-center gap-1.5 font-bold text-rose-900">
              <AlertCircle size={14} className="text-rose-600" />
              <span>Staff Reason for Declining:</span>
            </div>
            <p className="mt-1 text-[11px] font-medium leading-relaxed italic text-rose-800">
              "{duty.rejectionReason}"
            </p>
          </div>
        )}

        {/* Details */}
        <div className="mt-4 space-y-2.5 border-t border-[#eee8e1] pt-3">
          <div className="flex items-start gap-2.5">
            <CalendarDays
              size={15}
              className="mt-0.5 shrink-0 text-[#a7773f]"
            />

            <div>
              <p className="text-xs font-semibold text-[#403a34]">
                {duty.eventDate}
              </p>

              <p className="mt-0.5 flex items-center gap-1 text-xs text-[#9b938a]">
                <Clock3 size={12} />
                {duty.startTime} – {duty.endTime}
              </p>
            </div>
          </div>

          {duty.location && (
            <div className="flex items-start gap-2.5">
              <MapPin
                size={15}
                className="mt-0.5 shrink-0 text-[#a7773f]"
              />

              <p className="text-xs leading-5 text-[#756d64]">
                {duty.location}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <User
              size={15}
              className="shrink-0 text-[#a7773f]"
            />

            <p
              className={`text-xs font-semibold ${
                duty.staffId
                  ? "text-[#403a34]"
                  : "text-[#9a6c37]"
              }`}
            >
              Assigned: {duty.staffName}
            </p>
          </div>

          {/* Working Hours & Compensation Info */}
          {(duty.hourlyRate !== undefined || duty.totalHours !== undefined) && (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#faf8f5] border border-[#eee7dc] px-3 py-2 text-xs">
              <div>
                <span className="text-[11px] font-medium text-gray-500">Working Hours: </span>
                <strong className="text-gray-900">
                  {duty.totalHours ? `${duty.totalHours} hrs` : "Calculated upon schedule"}
                </strong>
                {duty.hourlyRate ? (
                  <span className="text-[11px] text-gray-500"> (@ ${duty.hourlyRate.toFixed(2)}/hr)</span>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-[#b8894b]">
                  ${(duty.totalAmount || (duty.totalHours && duty.hourlyRate ? duty.totalHours * duty.hourlyRate : 0)).toFixed(2)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    duty.paymentStatus === "PAID"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {duty.paymentStatus === "PAID" ? "PAID" : "PENDING"}
                </span>
              </div>
            </div>
          )}
        </div>

        {duty.description && (
          <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#8d847b]">
            {duty.description}
          </p>
        )}

        {/* Subtask Checklist Section */}
        {totalCount > 0 ? (
          <div className="mt-4 rounded-xl border border-[#eee8e1] bg-[#faf6f0] p-3">
            <div className="flex w-full items-center justify-between text-xs font-semibold text-[#403a34]">
              <button
                type="button"
                onClick={() => setShowChecklist((prev) => !prev)}
                className="flex items-center gap-1.5 hover:text-[#9a6c37]"
              >
                <ListChecks size={14} className="text-[#a7773f]" />
                <span>Subtasks ({completedCount}/{totalCount})</span>
                {showChecklist ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#9a6c37]">{progressPercent}%</span>
                {onManageChecklist && (
                  <button
                    type="button"
                    onClick={() => onManageChecklist(duty)}
                    className="rounded-md bg-white border border-[#d8cfc4] px-2 py-0.5 text-[10px] font-bold text-[#403a34] hover:bg-[#f7efe4]"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#eee8e1]">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progressPercent === 100 ? "bg-emerald-600" : "bg-[#9a7b4f]"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Expandable Sub-task items */}
            {showChecklist && (
              <div className="mt-3 space-y-1.5 border-t border-[#e8e1d8] pt-2">
                {checklistItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCheckitemClick(idx)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs text-[#29241f] transition hover:bg-[#f8f4ee]"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => {}} // Handled by div click
                      className="h-3.5 w-3.5 rounded border-[#d0c6ba] text-[#9a7b4f] focus:ring-[#9a7b4f]"
                    />
                    <span className={item.completed ? "line-through text-[#9b938a]" : "font-medium"}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* When no checklist items exist and shift is ACCEPTED */
          duty.status === "ACCEPTED" && onManageChecklist && (
            <div className="mt-3.5 flex items-center justify-between rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 p-2.5">
              <div className="text-[11px] font-semibold text-emerald-900">
                <span>Staff accepted! Ready for subtasks.</span>
              </div>
              <button
                type="button"
                onClick={() => onManageChecklist(duty)}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2.5 py-1 text-[11px] font-extrabold text-white transition hover:bg-emerald-800"
              >
                <ListChecks size={12} />
                <span>+ Assign Subtasks</span>
              </button>
            </div>
          )
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4">
        {duty.status === "REJECTED" ? (
          <button
            type="button"
            onClick={() => onEdit(duty)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 active:scale-[0.98]"
          >
            <RefreshCw size={14} />
            <span>Reassign Shift to Available Staff</span>
          </button>
        ) : ["ASSIGNED", "ACCEPTED", "IN_PROGRESS"].includes(duty.status) ? (
          <div className="flex gap-2">
            {onManageChecklist && (
              <button
                type="button"
                onClick={() => onManageChecklist(duty)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#d8cfc4] bg-white px-3 py-2 text-xs font-bold text-[#403a34] transition hover:bg-[#faf6f0]"
              >
                <ListChecks size={14} className="text-[#a7773f]" />
                <span>Sub-Tasks</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onStatusChange(duty)}
              className="flex-1 rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 py-2 text-xs font-semibold text-[#756d64] transition hover:bg-[#f8f4ee] hover:text-[#29241f]"
            >
              {duty.status === "IN_PROGRESS" ? "Mark Completed" : "Start Progress"}
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

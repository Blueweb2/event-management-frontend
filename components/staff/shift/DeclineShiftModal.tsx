"use client";

import { useState } from "react";
import { AlertCircle, AlertTriangle, Calendar, Clock, Loader2, X } from "lucide-react";
import type { Assignment } from "@/types/assignment";

interface DeclineShiftModalProps {
  duty: Assignment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dutyId: string, reason: string) => Promise<void>;
}

export default function DeclineShiftModal({
  duty,
  isOpen,
  onClose,
  onConfirm,
}: DeclineShiftModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !duty) return null;

  const eventName =
    typeof duty.event === "object" && duty.event?.eventName
      ? duty.event.eventName
      : "Assigned Event";

  const dateFormatted = duty.dutyDate
    ? new Date(duty.dutyDate).toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date pending";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for declining this shift.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onConfirm(duty._id, reason.trim());
      setReason("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to decline shift assignment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Decline Shift Duty
              </h2>
              <p className="text-xs text-gray-500">
                Notify manager with your reason
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Shift Details Preview */}
          <div className="rounded-2xl border border-gray-100 bg-[#fbf9f6] p-4 text-xs space-y-1.5">
            <div className="font-bold text-gray-900 text-sm">{duty.dutyTitle}</div>
            <div className="text-gray-600">{eventName}</div>
            <div className="flex items-center gap-3 text-gray-500 pt-1">
              <span className="inline-flex items-center gap-1">
                <Calendar size={13} className="text-[#9a6c37]" />
                {dateFormatted}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={13} className="text-[#9a6c37]" />
                {duty.startTime} - {duty.endTime}
              </span>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label
              htmlFor="decline-reason"
              className="block text-xs font-bold text-gray-800 mb-1.5"
            >
              Reason for Unavailability <span className="text-red-500">*</span>
            </label>
            <textarea
              id="decline-reason"
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Schedule conflict, family emergency, sickness, pre-booked appointment..."
              disabled={submitting}
              className="w-full rounded-2xl border border-gray-200 bg-white p-3.5 text-xs text-gray-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 placeholder:text-gray-400 resize-none disabled:bg-gray-50"
              required
            />
            <p className="mt-1 text-[11px] text-gray-400">
              This note will be sent immediately to the manager for swift duty reassignment.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || !reason.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                "Confirm Decline"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

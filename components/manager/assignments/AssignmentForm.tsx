"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  FileText,
  UserRound,
} from "lucide-react";

import type {
  Assignment,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
} from "@/types/assignment";

interface AssignmentFormProps {
  assignment?: Assignment | null;

  onSubmit: (
    payload:
      | CreateAssignmentPayload
      | UpdateAssignmentPayload,
  ) => Promise<void>;

  onCancel: () => void;

  loading?: boolean;
}

interface FormState {
  event: string;
  staff: string;
  dutyTitle: string;
  role: string;
  description: string;
  dutyDate: string;
  startTime: string;
  endTime: string;
  notes: string;
}

const initialForm: FormState = {
  event: "",
  staff: "",
  dutyTitle: "",
  role: "",
  description: "",
  dutyDate: "",
  startTime: "",
  endTime: "",
  notes: "",
};

export default function AssignmentForm({
  assignment,
  onSubmit,
  onCancel,
  loading = false,
}: AssignmentFormProps) {
  const isEditing = Boolean(assignment);

  const [form, setForm] =
    useState<FormState>(initialForm);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!assignment) {
      setForm(initialForm);
      return;
    }

    setForm({
      event:
        typeof assignment.event === "string"
          ? assignment.event
          : assignment.event._id,

      staff:
        typeof assignment.staff === "string"
          ? assignment.staff
          : assignment.staff.id,

      dutyTitle:
        assignment.dutyTitle ?? "",

      role:
        assignment.role ?? "",

      description:
        assignment.description ?? "",

      dutyDate:
        formatDateForInput(
          assignment.dutyDate,
        ),

      startTime:
        assignment.startTime ?? "",

      endTime:
        assignment.endTime ?? "",

      notes:
        assignment.notes ?? "",
    });
  }, [assignment]);

  const handleChange = (
    field: keyof FormState,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError(null);

    if (!form.event.trim()) {
      setError("Please enter the event ID.");
      return;
    }

    if (!form.staff.trim()) {
      setError("Please enter the staff ID.");
      return;
    }

    if (!form.dutyTitle.trim()) {
      setError("Duty title is required.");
      return;
    }

    if (!form.dutyDate) {
      setError("Duty date is required.");
      return;
    }

    if (!form.startTime) {
      setError("Start time is required.");
      return;
    }

    if (!form.endTime) {
      setError("End time is required.");
      return;
    }

    if (form.endTime <= form.startTime) {
      setError(
        "End time must be later than start time.",
      );
      return;
    }

    try {
      if (isEditing) {
        const payload: UpdateAssignmentPayload = {
          staff: form.staff.trim(),
          dutyTitle: form.dutyTitle.trim(),
          role:
            form.role.trim() || undefined,
          description:
            form.description.trim() || undefined,
          dutyDate: form.dutyDate,
          startTime: form.startTime,
          endTime: form.endTime,
          notes:
            form.notes.trim() || undefined,
        };

        await onSubmit(payload);
      } else {
        const payload: CreateAssignmentPayload = {
          event: form.event.trim(),
          staff: form.staff.trim(),
          dutyTitle: form.dutyTitle.trim(),
          role:
            form.role.trim() || undefined,
          description:
            form.description.trim() || undefined,
          dutyDate: form.dutyDate,
          startTime: form.startTime,
          endTime: form.endTime,
          notes:
            form.notes.trim() || undefined,
        };

        await onSubmit(payload);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save assignment.",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-[#1F1F1F]">
          {isEditing
            ? "Edit Assignment"
            : "Create Assignment"}
        </h2>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {isEditing
            ? "Update the assignment details below."
            : "Assign a staff member to an event."}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-100 bg-red-50 px-4 py-3"
        >
          <p className="text-xs leading-5 text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* Event */}
      <div>
        <label
          htmlFor="assignment-event"
          className="mb-1.5 block text-xs font-medium text-gray-700"
        >
          Event
        </label>

        <div className="relative">
          <CalendarDays
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            id="assignment-event"
            type="text"
            value={form.event}
            onChange={(e) =>
              handleChange(
                "event",
                e.target.value,
              )
            }
            disabled={isEditing || loading}
            placeholder="Enter event ID"
            className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-[#1F1F1F] outline-none placeholder:text-gray-400 focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        <p className="mt-1.5 text-[10px] text-gray-400">
          Use the event ID from your events data.
        </p>
      </div>

      {/* Staff */}
      <div>
        <label
          htmlFor="assignment-staff"
          className="mb-1.5 block text-xs font-medium text-gray-700"
        >
          Staff
        </label>

        <div className="relative">
          <UserRound
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            id="assignment-staff"
            type="text"
            value={form.staff}
            onChange={(e) =>
              handleChange(
                "staff",
                e.target.value,
              )
            }
            disabled={loading}
            placeholder="Enter staff ID"
            className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-[#1F1F1F] outline-none placeholder:text-gray-400 focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        <p className="mt-1.5 text-[10px] text-gray-400">
          Use the staff ID from your staff records.
        </p>
      </div>

      {/* Duty Title */}
      <div>
        <label
          htmlFor="assignment-duty-title"
          className="mb-1.5 block text-xs font-medium text-gray-700"
        >
          Duty Title
        </label>

        <input
          id="assignment-duty-title"
          type="text"
          value={form.dutyTitle}
          onChange={(e) =>
            handleChange(
              "dutyTitle",
              e.target.value,
            )
          }
          disabled={loading}
          placeholder="e.g. Guest Reception"
          className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#1F1F1F] outline-none placeholder:text-gray-400 focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:bg-gray-50"
        />
      </div>

      {/* Role */}
      <div>
        <label
          htmlFor="assignment-role"
          className="mb-1.5 block text-xs font-medium text-gray-700"
        >
          Role
          <span className="ml-1 text-gray-400">
            (Optional)
          </span>
        </label>

        <input
          id="assignment-role"
          type="text"
          value={form.role}
          onChange={(e) =>
            handleChange(
              "role",
              e.target.value,
            )
          }
          disabled={loading}
          placeholder="e.g. Receptionist"
          className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#1F1F1F] outline-none placeholder:text-gray-400 focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:bg-gray-50"
        />
      </div>

      {/* Date */}
      <div>
        <label
          htmlFor="assignment-date"
          className="mb-1.5 block text-xs font-medium text-gray-700"
        >
          Duty Date
        </label>

        <input
          id="assignment-date"
          type="date"
          value={form.dutyDate}
          onChange={(e) =>
            handleChange(
              "dutyDate",
              e.target.value,
            )
          }
          disabled={loading}
          className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#1F1F1F] outline-none focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:bg-gray-50"
        />
      </div>

      {/* Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="assignment-start-time"
            className="mb-1.5 block text-xs font-medium text-gray-700"
          >
            Start Time
          </label>

          <div className="relative">
            <Clock3
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="assignment-start-time"
              type="time"
              value={form.startTime}
              onChange={(e) =>
                handleChange(
                  "startTime",
                  e.target.value,
                )
              }
              disabled={loading}
              className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-2 text-sm text-[#1F1F1F] outline-none focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:bg-gray-50"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="assignment-end-time"
            className="mb-1.5 block text-xs font-medium text-gray-700"
          >
            End Time
          </label>

          <div className="relative">
            <Clock3
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="assignment-end-time"
              type="time"
              value={form.endTime}
              onChange={(e) =>
                handleChange(
                  "endTime",
                  e.target.value,
                )
              }
              disabled={loading}
              className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-2 text-sm text-[#1F1F1F] outline-none focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="assignment-description"
          className="mb-1.5 block text-xs font-medium text-gray-700"
        >
          Description
          <span className="ml-1 text-gray-400">
            (Optional)
          </span>
        </label>

        <div className="relative">
          <FileText
            size={17}
            className="pointer-events-none absolute left-3.5 top-3.5 text-gray-400"
          />

          <textarea
            id="assignment-description"
            value={form.description}
            onChange={(e) =>
              handleChange(
                "description",
                e.target.value,
              )
            }
            disabled={loading}
            rows={3}
            placeholder="Describe the staff duty..."
            className="w-full resize-none rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-[#1F1F1F] outline-none placeholder:text-gray-400 focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:bg-gray-50"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="assignment-notes"
          className="mb-1.5 block text-xs font-medium text-gray-700"
        >
          Notes
          <span className="ml-1 text-gray-400">
            (Optional)
          </span>
        </label>

        <textarea
          id="assignment-notes"
          value={form.notes}
          onChange={(e) =>
            handleChange(
              "notes",
              e.target.value,
            )
          }
          disabled={loading}
          rows={3}
          placeholder="Additional notes..."
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#1F1F1F] outline-none placeholder:text-gray-400 focus:border-[#9A7B4F] focus:ring-2 focus:ring-[#9A7B4F]/10 disabled:bg-gray-50"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="min-h-12 flex-1 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="min-h-12 flex-1 rounded-xl bg-[#1F1F1F] px-4 text-sm font-semibold text-white transition hover:bg-black active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEditing
              ? "Save Changes"
              : "Create Assignment"}
        </button>
      </div>
    </form>
  );
}

/* ==========================================
   HELPERS
========================================== */

function formatDateForInput(
  date: string,
): string {
  if (!date) return "";

  // Already in YYYY-MM-DD format
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return date;
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year =
    parsedDate.getFullYear();

  const month = String(
    parsedDate.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    parsedDate.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
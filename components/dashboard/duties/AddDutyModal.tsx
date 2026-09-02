"use client";

import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";

import {
  availableStaff,
  type Duty,
  type DutyStatus,
} from "./constants";

interface AddDutyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (duty: Duty) => void;
  editingDuty?: Duty | null;
}

const emptyForm = {
  title: "",
  event: "",
  eventDate: "",
  eventTime: "",
  location: "",
  staffId: "",
  staffName: "Unassigned",
  description: "",
  status: "Pending" as DutyStatus,
};

export default function AddDutyModal({
  open,
  onClose,
  onSave,
  editingDuty,
}: AddDutyModalProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;

    if (editingDuty) {
      setForm({
        title: editingDuty.title,
        event: editingDuty.event,
        eventDate: editingDuty.eventDate,
        eventTime: editingDuty.eventTime,
        location: editingDuty.location,
        staffId: editingDuty.staffId,
        staffName: editingDuty.staffName,
        description: editingDuty.description,
        status: editingDuty.status,
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, editingDuty]);

  if (!open) return null;

  const updateField = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleStaffChange = (staffId: string) => {
    const selectedStaff = availableStaff.find(
      (staff) => staff.id === staffId
    );

    setForm((current) => ({
      ...current,
      staffId,
      staffName: selectedStaff?.name ?? "Unassigned",
      status: staffId ? "Assigned" : "Pending",
    }));
  };

  const handleSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!form.title.trim() || !form.event.trim()) {
      return;
    }

    const duty: Duty = {
      id: editingDuty?.id ?? `DUTY-${Date.now()}`,
      title: form.title.trim(),
      event: form.event.trim(),
      eventDate: form.eventDate,
      eventTime: form.eventTime,
      location: form.location.trim(),
      staffId: form.staffId,
      staffName: form.staffName,
      description: form.description.trim(),
      status: form.status,
    };

    onSave(duty);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#29241f]/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#eee8e1] bg-white px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-[#29241f]">
              {editingDuty ? "Edit Duty" : "Add Duty"}
            </h2>

            <p className="mt-1 text-xs text-[#9b938a]">
              {editingDuty
                ? "Update duty details and assignment."
                : "Create a new event duty."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#8d847b] hover:bg-[#f7f3ee] hover:text-[#29241f]"
          >
            <X size={19} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5 sm:p-6"
        >
          {/* Duty Title */}
          <div>
            <label
              htmlFor="duty-title"
              className="mb-2 block text-xs font-semibold text-[#403a34]"
            >
              Duty Title
            </label>

            <input
              id="duty-title"
              type="text"
              required
              value={form.title}
              onChange={(e) =>
                updateField("title", e.target.value)
              }
              placeholder="e.g. Event Setup"
              className="h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 text-sm text-[#29241f] outline-none placeholder:text-[#b0a79e] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
            />
          </div>

          {/* Event */}
          <div>
            <label
              htmlFor="duty-event"
              className="mb-2 block text-xs font-semibold text-[#403a34]"
            >
              Event Name
            </label>

            <input
              id="duty-event"
              type="text"
              required
              value={form.event}
              onChange={(e) =>
                updateField("event", e.target.value)
              }
              placeholder="e.g. Wedding Celebration"
              className="h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 text-sm text-[#29241f] outline-none placeholder:text-[#b0a79e] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
            />
          </div>

          {/* Date + Time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="duty-date"
                className="mb-2 block text-xs font-semibold text-[#403a34]"
              >
                Event Date
              </label>

              <input
                id="duty-date"
                type="text"
                value={form.eventDate}
                onChange={(e) =>
                  updateField("eventDate", e.target.value)
                }
                placeholder="Sep 25, 2026"
                className="h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 text-sm text-[#29241f] outline-none placeholder:text-[#b0a79e] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
              />
            </div>

            <div>
              <label
                htmlFor="duty-time"
                className="mb-2 block text-xs font-semibold text-[#403a34]"
              >
                Event Time
              </label>

              <input
                id="duty-time"
                type="text"
                value={form.eventTime}
                onChange={(e) =>
                  updateField("eventTime", e.target.value)
                }
                placeholder="6:00 PM"
                className="h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 text-sm text-[#29241f] outline-none placeholder:text-[#b0a79e] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="duty-location"
              className="mb-2 block text-xs font-semibold text-[#403a34]"
            >
              Location
            </label>

            <input
              id="duty-location"
              type="text"
              value={form.location}
              onChange={(e) =>
                updateField("location", e.target.value)
              }
              placeholder="Event venue"
              className="h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 text-sm text-[#29241f] outline-none placeholder:text-[#b0a79e] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
            />
          </div>

          {/* Staff */}
          <div>
            <label
              htmlFor="duty-staff"
              className="mb-2 block text-xs font-semibold text-[#403a34]"
            >
              Assign Staff
            </label>

            <select
              id="duty-staff"
              value={form.staffId}
              onChange={(e) =>
                handleStaffChange(e.target.value)
              }
              className="h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 text-sm text-[#403a34] outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
            >
              <option value="">Unassigned</option>

              {availableStaff.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="duty-description"
              className="mb-2 block text-xs font-semibold text-[#403a34]"
            >
              Description
            </label>

            <textarea
              id="duty-description"
              rows={3}
              value={form.description}
              onChange={(e) =>
                updateField(
                  "description",
                  e.target.value
                )
              }
              placeholder="Describe the staff responsibility..."
              className="w-full resize-none rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 py-3 text-sm text-[#29241f] outline-none placeholder:text-[#b0a79e] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="duty-status"
              className="mb-2 block text-xs font-semibold text-[#403a34]"
            >
              Status
            </label>

            <select
              id="duty-status"
              value={form.status}
              onChange={(e) =>
                updateField(
                  "status",
                  e.target.value
                )
              }
              className="h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 text-sm text-[#403a34] outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
            >
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-xl border border-[#e3dbd2] px-5 text-sm font-semibold text-[#756d64] hover:bg-[#f8f4ee]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#b8894b] px-5 text-sm font-semibold text-white hover:bg-[#a7773f]"
            >
              <Save size={16} />

              {editingDuty
                ? "Save Changes"
                : "Add Duty"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState, useMemo } from "react";
import { Save, X, AlertTriangle, CheckCircle2, UserCheck, Filter, Plus, Trash2, ListChecks } from "lucide-react";

import type { Duty } from "./constants";
import { api } from "@/lib/api";

export type DutyFormValues = {
  event: string;
  staff: string;
  dutyTitle: string;
  description: string;
  dutyDate: string;
  startTime: string;
  endTime: string;
  hourlyRate?: number;
  checklist?: Array<{ _id?: string; text: string; completed: boolean }>;
};

type EventOption = { id: string; name: string; date: string; time: string };
type StaffOption = { id: string; name: string; department?: string };

interface AddDutyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: DutyFormValues) => Promise<void>;
  editingDuty?: Duty | null;
  events: EventOption[];
  staff: StaffOption[];
  loading?: boolean;
}

const emptyForm: DutyFormValues = {
  event: "",
  staff: "",
  dutyTitle: "",
  description: "",
  dutyDate: "",
  startTime: "",
  endTime: "",
  hourlyRate: 0,
  checklist: [],
};

const inputClass =
  "h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 text-sm text-[#29241f] outline-none placeholder:text-[#b0a79e] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10 disabled:opacity-50";

export default function AddDutyModal({
  open,
  onClose,
  onSave,
  editingDuty,
  events,
  staff,
  loading = false,
}: AddDutyModalProps) {
  const [form, setForm] = useState<DutyFormValues>(() =>
    editingDuty
      ? {
          event: editingDuty.eventId,
          staff: editingDuty.staffId,
          dutyTitle: editingDuty.title,
          description: editingDuty.description,
          dutyDate: editingDuty.eventDate,
          startTime: editingDuty.startTime,
          endTime: editingDuty.endTime,
          hourlyRate: editingDuty.hourlyRate || 0,
          checklist: editingDuty.checklist || [],
        }
      : emptyForm
  );
  const [newCheckitem, setNewCheckitem] = useState("");

  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [existingDateDuties, setExistingDateDuties] = useState<any[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // Fetch Duties on Selected Date for Conflict Detection
  // ==========================================
  useEffect(() => {
    if (!form.dutyDate) {
      setExistingDateDuties([]);
      return;
    }

    let isMounted = true;
    setCheckingAvailability(true);

    api<{ success: boolean; data: any[] }>(`/assignments?date=${form.dutyDate}`)
      .then((res) => {
        if (isMounted && res.data) {
          setExistingDateDuties(res.data);
        }
      })
      .catch((err) => {
        console.warn("Could not check staff schedule conflicts", err);
      })
      .finally(() => {
        if (isMounted) setCheckingAvailability(false);
      });

    return () => {
      isMounted = false;
    };
  }, [form.dutyDate]);

  if (!open) return null;

  const updateField = (field: keyof DutyFormValues, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const selectEvent = (id: string) => {
    const selected = events.find((event) => event.id === id);
    setForm((current) => ({
      ...current,
      event: id,
      dutyDate: selected?.date || current.dutyDate,
      startTime: selected?.time || current.startTime,
    }));
  };

  // Check if selected staff has a conflict on form.dutyDate
  const selectedStaffConflict = useMemo(() => {
    if (!form.staff || !form.dutyDate) return null;
    const conflict = existingDateDuties.find(
      (duty) =>
        (typeof duty.staff === "string" ? duty.staff : duty.staff?._id) === form.staff &&
        duty._id !== editingDuty?.id &&
        duty.status !== "CANCELLED" &&
        duty.status !== "REJECTED"
    );
    return conflict || null;
  }, [form.staff, form.dutyDate, existingDateDuties, editingDuty]);

  // Unique departments for filter
  const departments = useMemo(() => {
    const depts = new Set<string>();
    staff.forEach((s) => {
      if (s.department) depts.add(s.department);
    });
    return Array.from(depts);
  }, [staff]);

  const filteredStaff = useMemo(() => {
    if (departmentFilter === "ALL") return staff;
    return staff.filter((s) => s.department === departmentFilter);
  }, [staff, departmentFilter]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (
      !form.event ||
      !form.staff ||
      !form.dutyTitle.trim() ||
      !form.dutyDate ||
      !form.startTime ||
      !form.endTime
    ) {
      setError("Event, staff member, title, date, and times are required.");
      return;
    }

    if (form.endTime <= form.startTime) {
      setError("End time must be later than start time.");
      return;
    }

    try {
      await onSave({
        ...form,
        dutyTitle: form.dutyTitle.trim(),
        description: form.description.trim(),
        hourlyRate: Number(form.hourlyRate) || 0,
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save duty.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#29241f]/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#eee8e1] bg-white px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-[#29241f]">
              {editingDuty ? "Edit Duty" : "Assign Staff Duty"}
            </h2>
            <p className="mt-0.5 text-xs text-[#9b938a]">
              Smart dispatch & real-time conflict checking.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#8d847b] hover:bg-[#f7f3ee] disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
          {error && (
            <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          {/* Event Select */}
          <Field label="Event" htmlFor="duty-event">
            <select
              id="duty-event"
              value={form.event}
              onChange={(e) => selectEvent(e.target.value)}
              disabled={Boolean(editingDuty) || loading}
              required
              className={inputClass}
            >
              <option value="">Select an event</option>
              {editingDuty && !events.some((e) => e.id === form.event) && (
                <option value={form.event}>{editingDuty.event}</option>
              )}
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </Field>

          {/* Department Filter for Staff */}
          {departments.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#403a34] flex items-center gap-1">
                <Filter size={12} /> Filter Staff by Department
              </span>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="h-8 rounded-lg border border-[#e3dbd2] bg-white px-2 text-xs font-medium text-[#29241f]"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Staff Select with Conflict Badging */}
          <Field label="Assign Staff Member" htmlFor="duty-staff">
            <select
              id="duty-staff"
              value={form.staff}
              onChange={(e) => updateField("staff", e.target.value)}
              disabled={loading}
              required
              className={inputClass}
            >
              <option value="">Select a staff member</option>
              {filteredStaff.map((member) => {
                const isConflicted = existingDateDuties.some(
                  (d) =>
                    (typeof d.staff === "string" ? d.staff : d.staff?._id) === member.id &&
                    d._id !== editingDuty?.id &&
                    d.status !== "CANCELLED" &&
                    d.status !== "REJECTED"
                );

                return (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.department ? `(${member.department})` : ""}{" "}
                    {isConflicted ? "⚠️ [Assigned on Date]" : "🟢 [Available]"}
                  </option>
                );
              })}
            </select>
          </Field>

          {/* Real-time Conflict Warning Banner */}
          {selectedStaffConflict && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Schedule Conflict Warning</p>
                <p className="mt-0.5">
                  This staff member is already assigned to duty{" "}
                  <span className="font-semibold">&quot;{selectedStaffConflict.dutyTitle}&quot;</span> on{" "}
                  {form.dutyDate}.
                </p>
              </div>
            </div>
          )}

          {!selectedStaffConflict && form.staff && form.dutyDate && !checkingAvailability && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Staff member is available on {form.dutyDate}.</span>
            </div>
          )}

          {/* Duty Title */}
          <Field label="Duty Title" htmlFor="duty-title">
            <input
              id="duty-title"
              value={form.dutyTitle}
              onChange={(e) => updateField("dutyTitle", e.target.value)}
              disabled={loading}
              required
              placeholder="e.g. Event Setup / Stage Management"
              className={inputClass}
            />
          </Field>

          {/* Date & Time Grid */}
          <Field label="Duty Date" htmlFor="duty-date">
            <input
              id="duty-date"
              type="date"
              value={form.dutyDate}
              onChange={(e) => updateField("dutyDate", e.target.value)}
              disabled={loading}
              required
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Time" htmlFor="duty-start-time">
              <input
                id="duty-start-time"
                type="time"
                value={form.startTime}
                onChange={(e) => updateField("startTime", e.target.value)}
                disabled={loading}
                required
                className={inputClass}
              />
            </Field>

            <Field label="End Time" htmlFor="duty-end-time">
              <input
                id="duty-end-time"
                type="time"
                value={form.endTime}
                onChange={(e) => updateField("endTime", e.target.value)}
                disabled={loading}
                required
                className={inputClass}
              />
            </Field>
          </div>

          {/* Salary Per Hour & Working Hours Summary */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Salary Per Hour ($/hr)" htmlFor="duty-hourly-rate">
              <input
                id="duty-hourly-rate"
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g. 25.00"
                value={form.hourlyRate ?? 0}
                onChange={(e) => updateField("hourlyRate" as any, e.target.value)}
                disabled={loading}
                className={inputClass}
              />
            </Field>

            <div className="flex flex-col justify-center rounded-xl border border-[#eee8e1] bg-[#faf8f5] p-3 text-xs">
              <p className="font-semibold text-gray-700">Calculated Shift Payout</p>
              <div className="mt-1 flex items-center justify-between text-[11px] text-gray-600">
                <span>Duration: <strong>{(() => {
                  if (!form.startTime || !form.endTime) return "0.0";
                  const [sH, sM] = form.startTime.split(":").map(Number);
                  const [eH, eM] = form.endTime.split(":").map(Number);
                  let startMin = sH * 60 + (sM || 0);
                  let endMin = eH * 60 + (eM || 0);
                  if (endMin < startMin) endMin += 24 * 60;
                  return (Math.max(0, endMin - startMin) / 60).toFixed(1);
                })()} hrs</strong></span>
                <span className="font-bold text-[#b8894b]">Est. Pay: ${(() => {
                  if (!form.startTime || !form.endTime) return "0.00";
                  const [sH, sM] = form.startTime.split(":").map(Number);
                  const [eH, eM] = form.endTime.split(":").map(Number);
                  let startMin = sH * 60 + (sM || 0);
                  let endMin = eH * 60 + (eM || 0);
                  if (endMin < startMin) endMin += 24 * 60;
                  const hours = Math.max(0, endMin - startMin) / 60;
                  const rate = Number(form.hourlyRate) || 0;
                  return (hours * rate).toFixed(2);
                })()}</span>
              </div>
            </div>
          </div>

          <Field label="Description" htmlFor="duty-description">
            <textarea
              id="duty-description"
              rows={3}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              disabled={loading}
              placeholder="Describe staff responsibilities for this event shift..."
              className={`${inputClass} min-h-20 resize-none py-2.5`}
            />
          </Field>

          {/* Sub-Task Checklist Builder */}
          <div className="space-y-2 rounded-2xl border border-[#eee8e1] bg-[#faf6f0] p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#403a34] flex items-center gap-1.5">
                <ListChecks size={14} className="text-[#a7773f]" />
                Duty Checklist Sub-tasks ({form.checklist?.length || 0})
              </span>
            </div>

            {/* List of sub-tasks */}
            {form.checklist && form.checklist.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {form.checklist.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-xs border border-[#eee8e1]">
                    <span className="text-gray-800 break-words flex-1">{item.text}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((curr) => ({
                          ...curr,
                          checklist: curr.checklist?.filter((_, i) => i !== idx),
                        }));
                      }}
                      className="text-gray-400 hover:text-red-500 p-1 shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Sub-task Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add sub-task..."
                value={newCheckitem}
                onChange={(e) => setNewCheckitem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newCheckitem.trim()) {
                      setForm((curr) => ({
                        ...curr,
                        checklist: [...(curr.checklist || []), { text: newCheckitem.trim(), completed: false }],
                      }));
                      setNewCheckitem("");
                    }
                  }
                }}
                className="h-10 min-w-0 flex-1 rounded-xl border border-[#e3dbd2] bg-white px-3 text-xs outline-none focus:border-[#b8894b]"
              />
              <button
                type="button"
                onClick={() => {
                  if (newCheckitem.trim()) {
                    setForm((curr) => ({
                      ...curr,
                      checklist: [...(curr.checklist || []), { text: newCheckitem.trim(), completed: false }],
                    }));
                    setNewCheckitem("");
                  }
                }}
                className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl bg-[#b8894b] px-3.5 text-xs font-semibold text-white hover:bg-[#a7773f]"
              >
                <Plus size={14} /> Add
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="min-h-11 w-full rounded-xl border border-[#e3dbd2] px-5 text-sm font-semibold text-[#756d64] hover:bg-[#f8f4ee] disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#b8894b] px-5 text-sm font-semibold text-white hover:bg-[#a7773f] disabled:opacity-50 sm:w-auto"
            >
              <Save size={16} />
              {loading ? "Saving..." : editingDuty ? "Save Changes" : "Assign Duty"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-[#403a34]">
        {label}
      </label>
      {children}
    </div>
  );
}

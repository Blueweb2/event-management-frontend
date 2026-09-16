"use client";

import { useState } from "react";
import { Save, X } from "lucide-react";

import type { Duty } from "./constants";

export type DutyFormValues = {
  event: string;
  staff: string;
  dutyTitle: string;
  description: string;
  dutyDate: string;
  startTime: string;
  endTime: string;
};

type EventOption = { id: string; name: string; date: string; time: string };
type StaffOption = { id: string; name: string };

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
  event: "", staff: "", dutyTitle: "", description: "", dutyDate: "", startTime: "", endTime: "",
};

const inputClass = "h-11 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-3 text-sm text-[#29241f] outline-none placeholder:text-[#b0a79e] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10 disabled:opacity-50";

export default function AddDutyModal({ open, onClose, onSave, editingDuty, events, staff, loading = false }: AddDutyModalProps) {
  const [form, setForm] = useState<DutyFormValues>(() => editingDuty ? {
    event: editingDuty.eventId, staff: editingDuty.staffId, dutyTitle: editingDuty.title,
    description: editingDuty.description, dutyDate: editingDuty.eventDate,
    startTime: editingDuty.startTime, endTime: editingDuty.endTime,
  } : emptyForm);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const updateField = (field: keyof DutyFormValues, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const selectEvent = (id: string) => {
    const selected = events.find((event) => event.id === id);
    setForm((current) => ({ ...current, event: id, dutyDate: selected?.date || current.dutyDate, startTime: selected?.time || current.startTime }));
  };
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!form.event || !form.staff || !form.dutyTitle.trim() || !form.dutyDate || !form.startTime || !form.endTime) {
      setError("Event, staff member, title, date, and times are required.");
      return;
    }
    if (form.endTime <= form.startTime) {
      setError("End time must be later than start time.");
      return;
    }
    try {
      await onSave({ ...form, dutyTitle: form.dutyTitle.trim(), description: form.description.trim() });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save duty.");
    }
  };

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#29241f]/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#eee8e1] bg-white px-5 py-4 sm:px-6">
        <div><h2 className="text-lg font-bold text-[#29241f]">{editingDuty ? "Edit Duty" : "Add Duty"}</h2><p className="mt-1 text-xs text-[#9b938a]">Assign a staff member to an event duty.</p></div>
        <button type="button" onClick={onClose} disabled={loading} aria-label="Close" title="Close" className="flex h-9 w-9 items-center justify-center rounded-full text-[#8d847b] hover:bg-[#f7f3ee] disabled:opacity-50"><X size={19} /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
        {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
        <Field label="Event" htmlFor="duty-event"><select id="duty-event" value={form.event} onChange={(event) => selectEvent(event.target.value)} disabled={Boolean(editingDuty) || loading} required className={inputClass}><option value="">Select an event</option>{editingDuty && !events.some((event) => event.id === form.event) && <option value={form.event}>{editingDuty.event}</option>}{events.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}</select></Field>
        <Field label="Assign Staff" htmlFor="duty-staff"><select id="duty-staff" value={form.staff} onChange={(event) => updateField("staff", event.target.value)} disabled={loading} required className={inputClass}><option value="">Select a staff member</option>{staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></Field>
        <Field label="Duty Title" htmlFor="duty-title"><input id="duty-title" value={form.dutyTitle} onChange={(event) => updateField("dutyTitle", event.target.value)} disabled={loading} required placeholder="e.g. Event Setup" className={inputClass} /></Field>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Duty Date" htmlFor="duty-date"><input id="duty-date" type="date" value={form.dutyDate} onChange={(event) => updateField("dutyDate", event.target.value)} disabled={loading} required className={inputClass} /></Field><Field label="Start Time" htmlFor="duty-start-time"><input id="duty-start-time" type="time" value={form.startTime} onChange={(event) => updateField("startTime", event.target.value)} disabled={loading} required className={inputClass} /></Field></div>
        <Field label="End Time" htmlFor="duty-end-time"><input id="duty-end-time" type="time" value={form.endTime} onChange={(event) => updateField("endTime", event.target.value)} disabled={loading} required className={inputClass} /></Field>
        <Field label="Description" htmlFor="duty-description"><textarea id="duty-description" rows={3} value={form.description} onChange={(event) => updateField("description", event.target.value)} disabled={loading} placeholder="Describe the staff responsibility..." className={`${inputClass} min-h-24 resize-none py-3`} /></Field>
        <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={loading} className="min-h-11 rounded-xl border border-[#e3dbd2] px-5 text-sm font-semibold text-[#756d64] hover:bg-[#f8f4ee] disabled:opacity-50">Cancel</button><button type="submit" disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#b8894b] px-5 text-sm font-semibold text-white hover:bg-[#a7773f] disabled:opacity-50"><Save size={16} />{loading ? "Saving..." : editingDuty ? "Save Changes" : "Add Duty"}</button></div>
      </form>
    </div>
  </div>;
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div><label htmlFor={htmlFor} className="mb-2 block text-xs font-semibold text-[#403a34]">{label}</label>{children}</div>;
}

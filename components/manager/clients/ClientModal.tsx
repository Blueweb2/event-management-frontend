"use client";

import { useState } from "react";
import { Loader2, Mail, MapPin, Phone, UserRound, X } from "lucide-react";
import {
  type Client,
  type CreateClientPayload,
} from "@/lib/client.api";

interface ClientModalProps {
  isOpen: boolean;
  editingClient: Client | null;
  onClose: () => void;
  onSave: (payload: CreateClientPayload) => Promise<void>;
}

type ClientForm = CreateClientPayload;

const emptyForm: ClientForm = {
  name: "",
  phone: "",
  email: "",
  alternatePhone: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  notes: "",
};

export default function ClientModal({
  isOpen,
  editingClient,
  onClose,
  onSave,
}: ClientModalProps) {
  const [form, setForm] = useState<ClientForm>(() =>
    editingClient
      ? {
          name: editingClient.name,
          phone: editingClient.phone,
          email: editingClient.email,
          alternatePhone: editingClient.alternatePhone || "",
          address: editingClient.address || "",
          city: editingClient.city || "",
          state: editingClient.state || "",
          country: editingClient.country || "India",
          notes: editingClient.notes || "",
        }
      : emptyForm
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const updateField = (field: keyof ClientForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: ClientForm = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim().toLowerCase(),
      alternatePhone: form.alternatePhone?.trim(),
      address: form.address?.trim(),
      city: form.city?.trim(),
      state: form.state?.trim(),
      country: form.country?.trim() || "India",
      notes: form.notes?.trim(),
    };

    if (payload.name.length < 2) {
      setError("Please enter the client's name.");
      return;
    }
    if (!payload.phone) {
      setError("Please enter a phone number.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setSaving(true);
      await onSave(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save client.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close client form"
        onClick={() => !saving && onClose()}
        className="absolute inset-0 bg-black/40"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-modal-title"
        className="absolute inset-x-0 bottom-0 max-h-[94vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[calc(100%-2rem)] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4EBDD] text-[#9A7B4F]">
              <UserRound size={19} />
            </div>
            <div>
              <h2 id="client-modal-title" className="text-lg font-bold text-gray-900">
                {editingClient ? "Edit client" : "Add client"}
              </h2>
              <p className="text-xs text-gray-500">Keep contact details ready for future events.</p>
            </div>
          </div>
          <button type="button" onClick={() => !saving && onClose()} className="rounded-full p-2 text-gray-400 hover:bg-gray-100" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {error && <div role="alert" className="mx-5 mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-600 sm:mx-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" icon={<UserRound size={15} />} required value={form.name} onChange={(value) => updateField("name", value)} placeholder="e.g. Priya Sharma" />
            <Field label="Phone number" icon={<Phone size={15} />} required value={form.phone} onChange={(value) => updateField("phone", value)} placeholder="e.g. +91 98765 43210" />
            <Field label="Email address" icon={<Mail size={15} />} required type="email" value={form.email} onChange={(value) => updateField("email", value)} placeholder="client@example.com" />
            <Field label="Alternate phone" icon={<Phone size={15} />} value={form.alternatePhone || ""} onChange={(value) => updateField("alternatePhone", value)} placeholder="Optional" />
          </div>

          <div className="rounded-2xl border border-[#eadfce] bg-[#fcfaf6] p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#9A7B4F]"><MapPin size={14} /> Location</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Address" value={form.address || ""} onChange={(value) => updateField("address", value)} placeholder="Street and building" className="sm:col-span-2" />
              <Field label="City" value={form.city || ""} onChange={(value) => updateField("city", value)} placeholder="City" />
              <Field label="State" value={form.state || ""} onChange={(value) => updateField("state", value)} placeholder="State" />
              <Field label="Country" value={form.country || ""} onChange={(value) => updateField("country", value)} placeholder="Country" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700">Notes</label>
            <textarea value={form.notes || ""} onChange={(event) => updateField("notes", event.target.value)} rows={3} placeholder="Preferences, follow-ups, or useful context" className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#6B5B95] focus:outline-none focus:ring-1 focus:ring-[#6B5B95]" />
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={saving} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6B5B95] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#57487e] disabled:opacity-60">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {editingClient ? "Save changes" : "Create client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
}: {
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
      <div className="relative mt-1">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <input type={type} value={value} required={required} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`w-full rounded-xl border border-gray-300 py-2.5 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#6B5B95] focus:outline-none focus:ring-1 focus:ring-[#6B5B95] ${icon ? "pl-9" : "pl-3"}`} />
      </div>
    </div>
  );
}

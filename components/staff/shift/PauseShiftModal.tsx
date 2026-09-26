"use client";

import { useState } from "react";
import { Coffee, Loader2, X, AlertCircle } from "lucide-react";

export const PAUSE_REASONS = [
  { id: "Break", label: "Break", icon: "☕" },
  { id: "Lunch", label: "Lunch", icon: "🍱" },
  { id: "Personal", label: "Personal", icon: "👤" },
  { id: "Waiting for instructions", label: "Waiting for instructions", icon: "⏳" },
  { id: "Other", label: "Other", icon: "📝" },
];

interface PauseShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, notes: string) => Promise<void>;
}

export default function PauseShiftModal({
  isOpen,
  onClose,
  onConfirm,
}: PauseShiftModalProps) {
  const [selectedReason, setSelectedReason] = useState("Break");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      await onConfirm(selectedReason, notes.trim());
      setNotes("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to pause shift."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Coffee size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Pause Shift (Take Break)
              </h2>
              <p className="text-xs text-gray-500">
                Select your break reason for session tracking
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

          {/* Reason Radio Options */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-2">
              Select Pause Reason <span className="text-amber-600">*</span>
            </label>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PAUSE_REASONS.map((r) => {
                const isSelected = selectedReason === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedReason(r.id)}
                    className={`flex flex-col items-center justify-center gap-1 rounded-2xl border p-3 text-center transition ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/80 text-amber-900 ring-2 ring-amber-400/20 font-bold"
                        : "border-gray-200 bg-white text-gray-600 hover:border-amber-200 hover:bg-gray-50/50 font-medium"
                    }`}
                  >
                    <span className="text-lg">{r.icon}</span>
                    <span className="text-[11px] leading-tight">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label
              htmlFor="pause-notes"
              className="block text-xs font-bold text-gray-800 mb-1.5"
            >
              Optional Notes {selectedReason === "Other" && <span className="text-amber-600">*</span>}
            </label>
            <textarea
              id="pause-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Quick 15 min coffee break, meal break, step away for instructions..."
              disabled={submitting}
              className="w-full rounded-2xl border border-gray-200 bg-white p-3 text-xs text-gray-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100 placeholder:text-gray-400 resize-none disabled:bg-gray-50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
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
              disabled={submitting || (selectedReason === "Other" && !notes.trim())}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700 active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Pausing...
                </>
              ) : (
                "Pause Shift"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

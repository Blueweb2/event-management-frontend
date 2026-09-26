"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, X, AlertCircle } from "lucide-react";

interface CompleteTaskModalProps {
  taskTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (completionNotes: string) => Promise<void>;
}

export default function CompleteTaskModal({
  taskTitle,
  isOpen,
  onClose,
  onConfirm,
}: CompleteTaskModalProps) {
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      await onConfirm(notes.trim());
      setNotes("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete task."
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Complete Task
              </h2>
              <p className="text-xs text-gray-500 truncate max-w-[240px]">
                {taskTitle}
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

          <div>
            <label
              htmlFor="task-completion-notes"
              className="block text-xs font-bold text-gray-800 mb-1.5"
            >
              Completion Notes / Remarks (Optional)
            </label>
            <textarea
              id="task-completion-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Stage setup checked and verified. All lighting rigs tested."
              disabled={submitting}
              className="w-full rounded-2xl border border-gray-200 bg-white p-3 text-xs text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 placeholder:text-gray-400 resize-none disabled:bg-gray-50"
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
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                "Mark as Completed"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

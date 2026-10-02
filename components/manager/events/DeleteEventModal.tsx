"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import type { Event } from "@/lib/event.api";

interface DeleteEventModalProps {
  isOpen: boolean;
  event: Event | null;
  onClose: () => void;
  onConfirm: (eventId: string) => Promise<void>;
}

export default function DeleteEventModal({
  isOpen,
  event,
  onClose,
  onConfirm,
}: DeleteEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !event) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");
      await onConfirm(event._id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal overlay"
        onClick={() => !loading && onClose()}
        className="fixed inset-0 bg-transparent"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-event-title"
        className="relative z-10 w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-7 shadow-2xl transition-all animate-in fade-in zoom-in-95"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 id="delete-event-title" className="text-base font-bold text-gray-900">
                Delete Event
              </h2>
              <p className="text-xs text-gray-500">Permanent action confirmation</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => !loading && onClose()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mt-3.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-2 text-xs leading-relaxed text-gray-600">
          <p>
            Are you sure you want to permanently delete{" "}
            <strong className="text-gray-900 font-bold">"{event.eventName}"</strong>?
          </p>
          <p className="text-gray-500">
            This will remove the event along with all scheduled staff duties, attendance logs, and associated task records. This action cannot be undone.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-gray-100 pt-4">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="min-h-11 rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50 active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleDelete}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-95 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            <span>{loading ? "Deleting..." : "Delete Event"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

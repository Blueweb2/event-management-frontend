"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  FileText,
  Layers,
  Loader2,
  MapPin,
  Sparkles,
  Users,
  X,
  Tag,
} from "lucide-react";
import {
  type Event,
  type EventStatus,
  updateEvent,
} from "@/lib/event.api";
import { useAuth } from "@/hooks/useAuth";

interface EditEventModalProps {
  isOpen: boolean;
  event: Event | null;
  onClose: () => void;
  onSuccess: (updatedEvent: Event) => void;
}

export default function EditEventModal({
  isOpen,
  event,
  onClose,
  onSuccess,
}: EditEventModalProps) {
  const { token } = useAuth();

  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [guests, setGuests] = useState<number>(0);
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<EventStatus>("Upcoming");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (event) {
      setEventName(event.eventName || "");
      setEventType(event.eventType || "Event");
      setEventDate(
        event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 10) : ""
      );
      setEventTime(event.eventTime || "");
      setGuests(event.guests || 0);
      setLocation(event.location || "");
      setStatus(event.status || "Upcoming");
      setDescription(event.description || "");
      setNotes(event.notes || "");
      setError("");
    }
  }, [event, isOpen]);

  if (!isOpen || !event) return null;

  const isEligibleForPaid =
    event &&
    ["Ongoing", "IN_PROGRESS", "Completed", "COMPLETED", "Invoiced", "Settled"].includes(
      event.status || ""
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) {
      setError("Event name is required");
      return;
    }
    if (!eventDate) {
      setError("Event date is required");
      return;
    }

    if (["Invoiced", "Settled"].includes(status) && !isEligibleForPaid) {
      setError("Only in-progress or completed events can be marked as paid / settled.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await updateEvent(
        event._id,
        {
          eventName: eventName.trim(),
          eventType: eventType.trim(),
          eventDate,
          eventTime: eventTime.trim(),
          guests: Number(guests) || 0,
          location: location.trim(),
          status,
          description: description.trim(),
          notes: notes.trim(),
        },
        token || undefined
      );

      if (response.data) {
        onSuccess(response.data);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event");
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
        aria-labelledby="edit-event-title"
        className="relative z-10 w-full max-w-2xl max-h-[92dvh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-gray-100 p-5 sm:p-6 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f5ede4] text-[#9A7B4F]">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 id="edit-event-title" className="text-base sm:text-lg font-bold text-gray-900">
                Edit Event
              </h2>
              <p className="text-xs text-gray-500">
                Modify event schedule, location, guest size, and status.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => !loading && onClose()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-2 text-gray-400 hover:bg-gray-100 transition"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* Error Alert */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-gray-700">
                Event Name <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Grand Wedding Reception"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700">
                Event Type
              </label>
              <div className="relative mt-1.5">
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-900 outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F]"
                >
                  <option value="Wedding">Wedding</option>
                  <option value="Reception">Reception</option>
                  <option value="Birthday Party">Birthday Party</option>
                  <option value="Corporate Event">Corporate Event</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Conference">Conference</option>
                  <option value="Social Gathering">Social Gathering</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Date & Time */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-gray-700">
                Event Date <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1.5">
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700">
                Event Time
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  placeholder="e.g. 10:00 AM - 04:00 PM"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F]"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Guests & Location */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-gray-700">
                Guest Count
              </label>
              <div className="relative mt-1.5">
                <input
                  type="number"
                  min="1"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value) || 0)}
                  placeholder="e.g. 250"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700">
                Location / Venue
              </label>
              <div className="relative mt-1.5">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Royal Palace Ballroom, Mumbai"
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F]"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Status */}
          <div>
            <label className="block text-xs font-bold text-gray-700">
              Event Status
            </label>
            <div className="relative mt-1.5">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-gray-900 outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F]"
              >
                <option value="Upcoming">Upcoming (Scheduled)</option>
                <option value="Ongoing">Ongoing (In Progress)</option>
                <option value="Completed">Completed</option>
                <option value="Invoiced" disabled={!isEligibleForPaid}>
                  Invoiced {!isEligibleForPaid ? "(Requires In-Progress or Completed)" : ""}
                </option>
                <option value="Settled" disabled={!isEligibleForPaid}>
                  Settled {!isEligibleForPaid ? "(Requires In-Progress or Completed)" : ""}
                </option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Row 5: Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700">
              Description / Program Overview
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event program details or special requirements..."
              className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F]"
            />
          </div>

          {/* Row 6: Internal Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700">
              Internal Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal reminders, logistics notes, vendor remarks..."
              className="mt-1.5 w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F]"
            />
          </div>

          </div>

          {/* Action Buttons Footer */}
          <div className="shrink-0 flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/70 p-4 sm:p-5">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="min-h-11 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50 active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#29241f] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-black active:scale-95 disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>{loading ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

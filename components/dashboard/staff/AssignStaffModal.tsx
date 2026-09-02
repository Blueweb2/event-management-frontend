"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  MapPin,
  Search,
  Users,
  X,
} from "lucide-react";

import type { StaffEvent, StaffMember } from "./constants";

interface AssignStaffModalProps {
  open: boolean;
  onClose: () => void;
  staff: StaffMember;
  events: StaffEvent[];
  onAssign?: (eventId: string) => void;
}

export default function AssignStaffModal({
  open,
  onClose,
  staff,
  events,
  onAssign,
}: AssignStaffModalProps) {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedEventId("");
      setSearch("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const filteredEvents = events.filter((event) => {
    const searchValue = search.toLowerCase();

    return (
      event.title.toLowerCase().includes(searchValue) ||
      event.type.toLowerCase().includes(searchValue) ||
      event.location.toLowerCase().includes(searchValue)
    );
  });

  function handleAssign() {
    if (!selectedEventId) {
      return;
    }

    onAssign?.(selectedEventId);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#29241f]/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-event-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#e8e1d8] bg-[#fdfbf8] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#eee8e1] px-5 py-5 sm:px-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
                <CalendarDays size={19} />
              </div>

              <div>
                <h2
                  id="assign-event-title"
                  className="text-lg font-bold text-[#29241f]"
                >
                  Assign Event
                </h2>

                <p className="mt-0.5 text-xs text-[#8d847b]">
                  Assign an event to this staff member
                </p>
              </div>
            </div>

            {/* Staff */}
            <div className="mt-4 rounded-xl border border-[#eee8e1] bg-white px-4 py-3">
              <p className="text-xs font-medium text-[#9b938a]">
                Staff Member
              </p>

              <div className="mt-1 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#edf5ed] text-[10px] font-bold text-[#557555]">
                  {staff.name
                    .split(" ")
                    .map((name) => name[0])
                    .slice(0, 2)
                    .join("")}
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#29241f]">
                    {staff.name}
                  </p>

                  <p className="text-[11px] text-[#8d847b]">
                    {staff.role}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#756d64] transition hover:bg-[#f5eee5] hover:text-[#29241f]"
          >
            <X size={19} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-5 sm:px-6">
          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9b938a]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search events..."
              className="h-11 w-full rounded-xl border border-[#ded5cb] bg-white pl-10 pr-4 text-sm text-[#403a34] outline-none transition placeholder:text-[#b3aaa1] focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
            />
          </div>
        </div>

        {/* Events */}
        <div className="max-h-[360px] overflow-y-auto px-5 py-4 sm:px-6">
          <div className="space-y-2">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const selected = selectedEventId === event.id;

                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => setSelectedEventId(event.id)}
                    className={[
                      "w-full rounded-xl border p-4 text-left transition",
                      selected
                        ? "border-[#b8894b] bg-[#fdf7ee]"
                        : "border-[#eee8e1] bg-white hover:border-[#d7c4aa] hover:bg-[#fdfbf8]",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
                        <CalendarDays size={17} />
                      </div>

                      {/* Event details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#29241f]">
                              {event.title}
                            </p>

                            <p className="mt-0.5 text-xs font-medium text-[#9a6c37]">
                              {event.type}
                            </p>
                          </div>

                          {/* Selection */}
                          <span
                            className={[
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
                              selected
                                ? "border-[#b8894b] bg-[#b8894b] text-white"
                                : "border-[#d7cfc6] bg-white text-transparent",
                            ].join(" ")}
                          >
                            <Check size={13} />
                          </span>
                        </div>

                        {/* Meta */}
                        <div className="mt-3 grid gap-2 text-[11px] text-[#756d64]">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={13} />
                            {event.date} · {event.time}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} />
                            {event.location}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Users size={13} />
                            {event.guests} guests
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-10 text-center">
                <CalendarDays
                  size={28}
                  className="mx-auto text-[#b9afa4]"
                />

                <p className="mt-3 text-sm font-semibold text-[#5f574f]">
                  No events found
                </p>

                <p className="mt-1 text-xs text-[#9b938a]">
                  Try a different search.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#eee8e1] px-5 py-5 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs text-[#8d847b]">
              Selected event
            </p>

            <p className="text-xs font-semibold text-[#9a6c37]">
              {selectedEventId ? "1" : "0"}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-[#ded5cb] bg-white px-4 text-sm font-semibold text-[#5f574f] transition hover:border-[#cdbba5] hover:bg-[#f8f4ee]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAssign}
              disabled={!selectedEventId}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#b8894b] px-4 text-sm font-semibold text-white transition hover:bg-[#a7773f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={16} />
              Assign Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
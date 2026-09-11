"use client";

import {
  CalendarDays,
  Clock3,
  MapPin,
  UserRound,
  Pencil,
  Trash2,
} from "lucide-react";

import AssignmentStatusBadge from "./AssignmentStatusBadge";

import type {
  Assignment,
  AssignmentEvent,
  AssignmentStaff,
} from "@/types/assignment";

interface AssignmentCardProps {
  assignment: Assignment;
  onDelete?: (assignment: Assignment) => void;
  onEdit?: (assignment: Assignment) => void;
}

export default function AssignmentCard({
  assignment,
  onDelete,
  onEdit,
}: AssignmentCardProps) {
  const event: AssignmentEvent | null =
    typeof assignment.event === "string"
      ? null
      : assignment.event;

  const staff: AssignmentStaff | null =
    typeof assignment.staff === "string"
      ? null
      : assignment.staff;

  const eventName =
    event?.eventName ??
    (typeof assignment.event === "string"
      ? assignment.event
      : "Event");

  const staffName =
    staff?.name ??
    (typeof assignment.staff === "string"
      ? assignment.staff
      : "Staff member");

  const location = event?.location;

  const formatDate = (date: string) => {
    if (!date) {
      return "Date not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    if (!time) {
      return "";
    }

    const [hours, minutes] = time.split(":");
    const hour = Number(hours);

    if (Number.isNaN(hour)) {
      return time;
    }

    const suffix = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;

    return `${formattedHour}:${minutes || "00"} ${suffix}`;
  };

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-[#B89563]">
            Assignment
          </p>

          <h3 className="mt-1 truncate text-base font-semibold text-[#1F1F1F]">
            {assignment.dutyTitle}
          </h3>

          {assignment.role && (
            <p className="mt-0.5 text-sm text-gray-500">
              {assignment.role}
            </p>
          )}
        </div>

        <AssignmentStatusBadge
          status={assignment.status}
        />
      </div>

      {/* Event */}
      <div className="mt-4 rounded-xl bg-[#F8F7F3] p-3">
        <p className="text-xs font-medium text-gray-400">
          EVENT
        </p>

        <p className="mt-1 text-sm font-semibold text-[#1F1F1F]">
          {eventName}
        </p>

        {location && (
          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={13} />
            <span className="truncate">
              {location}
            </span>
          </div>
        )}
      </div>

      {/* Assignment details */}
      <div className="mt-4 space-y-3">
        {/* Staff */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4EBDD] text-[#9A7B4F]">
            <UserRound size={17} />
          </div>

          <div className="min-w-0">
            <p className="text-xs text-gray-400">
              Staff
            </p>

            <p className="truncate text-sm font-medium text-[#1F1F1F]">
              {staffName}
            </p>

            {staff?.email && (
              <p className="truncate text-xs text-gray-400">
                {staff.email}
              </p>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <CalendarDays size={17} />
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Date
            </p>

            <p className="text-sm font-medium text-[#1F1F1F]">
              {formatDate(assignment.dutyDate)}
            </p>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <Clock3 size={17} />
          </div>

          <div>
            <p className="text-xs text-gray-400">
              Time
            </p>

            <p className="text-sm font-medium text-[#1F1F1F]">
              {formatTime(assignment.startTime)}{" "}
              –{" "}
              {formatTime(assignment.endTime)}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {assignment.description && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-400">
            DESCRIPTION
          </p>

          <p className="mt-1 text-sm leading-5 text-gray-600">
            {assignment.description}
          </p>
        </div>
      )}

      {/* Notes */}
      {assignment.notes && (
        <div className="mt-3 rounded-xl bg-[#F8F7F3] p-3">
          <p className="text-xs font-medium text-gray-400">
            NOTES
          </p>

          <p className="mt-1 text-sm leading-5 text-gray-600">
            {assignment.notes}
          </p>
        </div>
      )}

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(assignment)}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-[#1F1F1F] transition active:scale-[0.98]"
            >
              <Pencil size={16} />
              Edit
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(assignment)}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 px-4 text-sm font-medium text-red-600 transition active:scale-[0.98]"
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}
        </div>
      )}
    </article>
  );
}
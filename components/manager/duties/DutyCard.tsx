"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  MapPin,
  MoreVertical,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";

import type { Duty } from "./constants";

interface DutyCardProps {
  duty: Duty;
  onEdit: (duty: Duty) => void;
  onDelete: (duty: Duty) => void;
  onStatusChange: (duty: Duty) => void;
}

export default function DutyCard({
  duty,
  onEdit,
  onDelete,
  onStatusChange,
}: DutyCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const statusClasses = {
    Pending: "bg-[#f8f0df] text-[#9a6c37]",
    Assigned: "bg-[#edf5ed] text-[#557555]",
    Completed: "bg-[#eeeae5] text-[#756d64]",
  };

  return (
    <article className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      {/* Top */}
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
          <CheckCircle2 size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-[#29241f]">
                {duty.title}
              </h3>

              <p className="mt-1 truncate text-sm text-[#756d64]">
                {duty.event}
              </p>
            </div>

            <div className="relative shrink-0">
              <button
                type="button"
                aria-label={`More options for ${duty.title}`}
                title="More options"
                onClick={() => setMenuOpen((value) => !value)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8d847b] transition hover:bg-[#f7f3ee] hover:text-[#29241f]"
              >
                <MoreVertical size={17} />
              </button>

              {menuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close menu"
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={() => setMenuOpen(false)}
                  />

                  <div className="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-xl border border-[#e8e1d8] bg-white p-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(duty);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#403a34] hover:bg-[#f8f4ee]"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(duty);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#a15f57] hover:bg-[#fdf1ef]"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <span
            className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClasses[duty.status]}`}
          >
            {duty.status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="mt-5 space-y-3 border-t border-[#eee8e1] pt-4">
        <div className="flex items-start gap-2.5">
          <CalendarDays
            size={16}
            className="mt-0.5 shrink-0 text-[#a7773f]"
          />

          <div>
            <p className="text-xs font-semibold text-[#403a34]">
              {duty.eventDate}
            </p>

            <p className="mt-0.5 flex items-center gap-1 text-xs text-[#9b938a]">
              <Clock3 size={12} />
              {duty.eventTime}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <MapPin
            size={16}
            className="mt-0.5 shrink-0 text-[#a7773f]"
          />

          <p className="text-xs leading-5 text-[#756d64]">
            {duty.location}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <User
            size={16}
            className="shrink-0 text-[#a7773f]"
          />

          <p
            className={`text-xs font-semibold ${
              duty.staffId
                ? "text-[#403a34]"
                : "text-[#9a6c37]"
            }`}
          >
            {duty.staffName}
          </p>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-xs leading-5 text-[#8d847b]">
        {duty.description}
      </p>

      {/* Action */}
      {duty.status !== "Completed" && (
        <button
          type="button"
          onClick={() => onStatusChange(duty)}
          className="mt-5 w-full rounded-xl border border-[#e3dbd2] bg-[#fdfbf8] px-4 py-2.5 text-xs font-semibold text-[#756d64] transition hover:bg-[#f8f4ee] hover:text-[#29241f]"
        >
          {duty.status === "Pending"
            ? "Mark as Assigned"
            : "Mark as Completed"}
        </button>
      )}
    </article>
  );
}
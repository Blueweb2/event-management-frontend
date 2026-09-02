"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Plus,
  X,
} from "lucide-react";

import {
  attendanceRecords,
  currentStaff,
  leaveRequests as initialLeaveRequests,
  type LeaveRequest,
} from "@/components/staff/constants";

export default function StaffAttendancePage() {
  const isRegular =
    currentStaff.employmentType === "Part-Time";

  return (
    <main className="py-5 sm:py-6">
      <div className="border-b border-[#e8e1d8] pb-6">
        <p className="text-sm font-semibold text-[#9a6c37]">
          Staff Portal
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#29241f] sm:text-3xl">
          Attendance
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756d64]">
          {isRegular
            ? "View your attendance and request leave when needed."
            : "View your attendance and mark the dates you are available to work."}
        </p>
      </div>

      <AttendanceSummary />

      <AttendanceHistory />

      {isRegular ? (
        <RegularLeaveSection />
      ) : (
        <PartTimeAvailabilitySection />
      )}
    </main>
  );
}

/* ----------------------------------------
   ATTENDANCE SUMMARY
----------------------------------------- */

function AttendanceSummary() {
  return (
    <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <SummaryCard
        label="Present"
        value="3"
      />

      <SummaryCard
        label="Late"
        value="1"
      />

      <SummaryCard
        label="Absent"
        value="1"
      />

      <SummaryCard
        label="Attendance"
        value="80%"
      />
    </section>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm">
      <p className="text-xs text-[#8d847b]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-[#29241f]">
        {value}
      </p>
    </div>
  );
}

/* ----------------------------------------
   ATTENDANCE HISTORY
----------------------------------------- */

function AttendanceHistory() {
  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      <div className="border-b border-[#eee8e1] px-5 py-4">
        <h2 className="text-base font-bold text-[#29241f]">
          Recent Attendance
        </h2>

        <p className="mt-1 text-xs text-[#8d847b]">
          Your recent attendance records
        </p>
      </div>

      <div className="divide-y divide-[#eee8e1]">
        {attendanceRecords.map((record) => (
          <div
            key={record.id}
            className="p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-[#29241f]">
                  <CalendarDays
                    size={15}
                    className="text-[#a7773f]"
                  />

                  {record.date}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#756d64]">
                  <span className="flex items-center gap-1.5">
                    <Clock3 size={14} />
                    In: {record.checkIn}
                  </span>

                  <span>
                    Out: {record.checkOut}
                  </span>

                  <span>
                    Hours: {record.hours}
                  </span>
                </div>
              </div>

              <AttendanceBadge
                status={record.status}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AttendanceBadge({
  status,
}: {
  status: "Present" | "Absent" | "Late";
}) {
  const classes = {
    Present: "bg-[#edf5ed] text-[#557555]",
    Late: "bg-[#fff4df] text-[#9a6c37]",
    Absent: "bg-[#f8eeee] text-[#9a6660]",
  };

  return (
    <span
      className={`flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${classes[status]}`}
    >
      {status === "Present" && (
        <CheckCircle2 size={13} />
      )}

      {status}
    </span>
  );
}

/* ----------------------------------------
   REGULAR STAFF - LEAVE
----------------------------------------- */

function RegularLeaveSection() {
  const [requests, setRequests] =
    useState<LeaveRequest[]>(initialLeaveRequests);

  const [modalOpen, setModalOpen] =
    useState(false);

  function addLeaveRequest(request: LeaveRequest) {
    setRequests((current) => [
      request,
      ...current,
    ]);

    setModalOpen(false);
  }

  return (
    <>
      <section className="mt-6 rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#eee8e1] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[#29241f]">
              Leave Requests
            </h2>

            <p className="mt-1 text-xs text-[#8d847b]">
              Request time off and track approval status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#b8894b] px-4 text-sm font-semibold text-white transition hover:bg-[#a7773f]"
          >
            <Plus size={16} />
            Request Leave
          </button>
        </div>

        <div className="divide-y divide-[#eee8e1]">
          {requests.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <FileText
                size={24}
                className="mx-auto text-[#b8894b]"
              />

              <p className="mt-3 text-sm font-semibold text-[#29241f]">
                No leave requests
              </p>

              <p className="mt-1 text-xs text-[#8d847b]">
                Your submitted leave requests will appear here.
              </p>
            </div>
          ) : (
            requests.map((request) => (
              <LeaveRequestRow
                key={request.id}
                request={request}
              />
            ))
          )}
        </div>
      </section>

      <LeaveRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addLeaveRequest}
      />
    </>
  );
}

function LeaveRequestRow({
  request,
}: {
  request: LeaveRequest;
}) {
  const statusClasses = {
    Pending: "bg-[#fff4df] text-[#9a6c37]",
    Approved: "bg-[#edf5ed] text-[#557555]",
    Rejected: "bg-[#f8eeee] text-[#9a6660]",
  };

  return (
    <div className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[#29241f]">
            {request.fromDate} → {request.toDate}
          </p>

          <p className="mt-1 text-xs text-[#756d64]">
            {request.reason}
          </p>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[request.status]}`}
        >
          {request.status}
        </span>
      </div>
    </div>
  );
}

/* ----------------------------------------
   LEAVE MODAL
----------------------------------------- */

function LeaveRequestModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (request: LeaveRequest) => void;
}) {
  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [reason, setReason] =
    useState("");

  if (!open) return null;

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!fromDate || !toDate || !reason.trim()) {
      return;
    }

    const formatDate = (value: string) => {
      return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(`${value}T00:00:00`));
    };

    onSubmit({
      id: `LEAVE-${Date.now()}`,
      fromDate: formatDate(fromDate),
      toDate: formatDate(toDate),
      reason: reason.trim(),
      status: "Pending",
    });

    setFromDate("");
    setToDate("");
    setReason("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#29241f]/25 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl bg-[#fbf6ef] p-5 shadow-2xl sm:rounded-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#29241f]">
              Request Leave
            </h2>

            <p className="mt-1 text-xs text-[#8d847b]">
              Submit your leave request to the manager.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e3dbd2] bg-white text-[#756d64]"
          >
            <X size={17} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="From"
              type="date"
              value={fromDate}
              onChange={setFromDate}
            />

            <Field
              label="To"
              type="date"
              value={toDate}
              onChange={setToDate}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#403a34]">
              Reason
            </label>

            <textarea
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              rows={4}
              placeholder="Enter reason for leave..."
              className="mt-2 w-full rounded-xl border border-[#e3dbd2] bg-white px-4 py-3 text-sm text-[#29241f] outline-none focus:border-[#b8894b] focus:ring-2 focus:ring-[#b8894b]/10"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#e3dbd2] bg-white px-5 py-3 text-sm font-semibold text-[#756d64]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[#b8894b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#a7773f]"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-[#403a34]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="mt-2 h-11 w-full rounded-xl border border-[#e3dbd2] bg-white px-3 text-sm text-[#29241f] outline-none focus:border-[#b8894b]"
      />
    </div>
  );
}

/* ----------------------------------------
   PART-TIME STAFF - AVAILABLE DATES
----------------------------------------- */

function PartTimeAvailabilitySection() {
  const [currentMonth, setCurrentMonth] = useState(
    new Date(2026, 8, 1)
  );

  const [selectedDates, setSelectedDates] = useState<string[]>([
    "2026-09-05",
    "2026-09-12",
    "2026-09-18",
  ]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthName = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(currentMonth);

  function formatDate(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  }

  function toggleDate(date: Date) {
    const value = formatDate(date);

    setSelectedDates((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  function previousMonth() {
    setCurrentMonth(
      new Date(year, month - 1, 1)
    );
  }

  function nextMonth() {
    setCurrentMonth(
      new Date(year, month + 1, 1)
    );
  }

  function goToToday() {
    const today = new Date();

    setCurrentMonth(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );
  }

  const calendarDays = getCalendarDays(
    year,
    month
  );

  return (
    <section className="mt-6 rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-[#eee8e1] px-5 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[#29241f]">
              My Available Dates
            </h2>

            <p className="mt-1 text-xs leading-5 text-[#8d847b]">
              Select the dates you are available to work.
              The manager will see your availability when
              assigning events.
            </p>
          </div>

          <div className="rounded-xl bg-[#edf5ed] px-4 py-2">
            <p className="text-xs text-[#557555]">
              Selected
            </p>

            <p className="text-lg font-bold text-[#557555]">
              {selectedDates.length} dates
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Calendar top controls */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={previousMonth}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e3dbd2] bg-white text-[#756d64] transition hover:border-[#cdbba5] hover:bg-[#f8f4ee]"
            aria-label="Previous month"
          >
            ←
          </button>

          <div className="text-center">
            <h3 className="text-lg font-bold text-[#29241f]">
              {monthName}
            </h3>

            <button
              type="button"
              onClick={goToToday}
              className="mt-1 text-xs font-semibold text-[#a7773f] hover:underline"
            >
              Go to today
            </button>
          </div>

          <button
            type="button"
            onClick={nextMonth}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e3dbd2] bg-white text-[#756d64] transition hover:border-[#cdbba5] hover:bg-[#f8f4ee]"
            aria-label="Next month"
          >
            →
          </button>
        </div>

        {/* Legend */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-[#756d64]">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#557555]" />
            Available
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border border-[#ded5cb] bg-[#fdfbf8]" />
            Not Available
          </div>
        </div>

        {/* Calendar */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-[#e8e1d8]">
          {/* Weekdays */}
          <div className="grid grid-cols-7 border-b border-[#e8e1d8] bg-[#f8f4ee]">
            {[
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ].map((day) => (
              <div
                key={day}
                className="py-3 text-center text-[11px] font-bold text-[#756d64] sm:text-xs"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="min-h-[70px] border-b border-r border-[#eee8e1] bg-[#faf8f5] sm:min-h-[90px]"
                  />
                );
              }

              const value = formatDate(day);
              const selected =
                selectedDates.includes(value);

              const isToday =
                formatDate(new Date()) === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleDate(day)}
                  className={`relative min-h-[70px] border-b border-r border-[#eee8e1] p-2 text-left transition sm:min-h-[90px] sm:p-3 ${
                    selected
                      ? "bg-[#edf5ed]"
                      : "bg-white hover:bg-[#f8f4ee]"
                  }`}
                >
                  {/* Date number */}
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold sm:h-8 sm:w-8 sm:text-sm ${
                      isToday
                        ? "border border-[#b8894b] text-[#a7773f]"
                        : selected
                        ? "bg-[#557555] text-white"
                        : "text-[#403a34]"
                    }`}
                  >
                    {day.getDate()}
                  </span>

                  {/* Availability text */}
                  <span
                    className={`mt-2 block text-[9px] font-semibold sm:text-[10px] ${
                      selected
                        ? "text-[#557555]"
                        : "text-[#b0a79f]"
                    }`}
                  >
                    {selected
                      ? "Available"
                      : "Not available"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected dates */}
        <div className="mt-5 rounded-xl border border-[#e8e1d8] bg-[#fdfbf8] p-4">
          <p className="text-xs font-bold text-[#403a34]">
            Selected availability
          </p>

          {selectedDates.length === 0 ? (
            <p className="mt-2 text-xs text-[#9b938a]">
              No dates selected.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedDates
                .slice()
                .sort()
                .map((date) => (
                  <span
                    key={date}
                    className="rounded-full bg-[#edf5ed] px-3 py-1.5 text-xs font-semibold text-[#557555]"
                  >
                    {formatDisplayDate(date)}
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Save */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-[#8d847b]">
            Tap a date to mark yourself available or
            unavailable.
          </p>

          <button
            type="button"
            onClick={() => {
              console.log(
                "Saved availability:",
                selectedDates
              );
            }}
            className="rounded-xl bg-[#b8894b] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a7773f] hover:shadow-md"
          >
            Save Availability
          </button>
        </div>
      </div>
    </section>
  );
}


function getCalendarDays(
  year: number,
  month: number
): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startingDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days: (Date | null)[] = [];

  // Empty cells before first day
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }

  // Actual month days
  for (let day = 1; day <= totalDays; day++) {
    days.push(
      new Date(year, month, day)
    );
  }

  // Complete the final week
  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

function formatDisplayDate(
  value: string
) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(
    new Date(`${value}T00:00:00`)
  );
}

function generateDates() {
  const result = [];

  for (let i = 0; i < 21; i++) {
    const date = new Date(2026, 8, 3 + i);

    const value = date
      .toISOString()
      .split("T")[0];

    result.push({
      value,
      day: new Intl.DateTimeFormat("en-IN", {
        weekday: "short",
      }).format(date),
      date: new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
      }).format(date),
    });
  }

  return result;
}
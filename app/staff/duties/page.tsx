"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Play,
  Loader2,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useAssignments } from "@/hooks/useAssignments";
import { useAttendance } from "@/hooks/useAttendance";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorMessage from "@/components/common/ErrorMessage";

const getLocation = (): Promise<string> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve("Location tracking not supported by browser");
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(
            `Location: ${position.coords.latitude}, ${position.coords.longitude}`
          );
        },
        () => {
          resolve("Location permission denied or unavailable");
        },
        { timeout: 5000 }
      );
    }
  });
};

export default function StaffDutiesPage() {
  const { token, user } = useAuth();
  
  const {
    assignments,
    loading: assignmentsLoading,
    error: assignmentsError,
  } = useAssignments({
    token,
    filters: { staff: user?.id },
    autoFetch: true,
  });

  const {
    attendance,
    staffCheckIn,
    staffCheckOut,
    fetchAttendance,
  } = useAttendance({
    token,
    filters: { staff: user?.id },
    autoFetch: true,
  });

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleCheckIn = async (dutyId: string) => {
    setProcessingId(dutyId);
    try {
      const locationNotes = await getLocation();
      await staffCheckIn({ duty: dutyId, notes: locationNotes });
      await fetchAttendance();
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleCheckOut = async (dutyId: string) => {
    setProcessingId(dutyId);
    try {
      const locationNotes = await getLocation();
      await staffCheckOut({ duty: dutyId, notes: locationNotes });
      await fetchAttendance();
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      }
    } finally {
      setProcessingId(null);
    }
  };

  if (assignmentsLoading && assignments.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (assignmentsError) {
    return <ErrorMessage message={assignmentsError} />;
  }

  return (
    <main className="py-5 sm:py-6">
      <div className="border-b border-[#e8e1d8] pb-6">
        <p className="text-sm font-semibold text-[#9a6c37]">
          Staff Portal
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#29241f] sm:text-3xl">
          My Duties
        </h1>

        <p className="mt-2 text-sm text-[#756d64]">
          Manage the duties assigned to you and record your attendance.
        </p>
      </div>

      {assignments.length === 0 ? (
        <div className="mt-8 rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">You don't have any duties assigned yet.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {assignments.map((assignment) => {
            const event = typeof assignment.event === "object" ? assignment.event : null;
            const dutyRecord = attendance.find(
              (att) => (typeof att.duty === "object" ? att.duty._id : att.duty) === assignment._id
            );

            let statusLabel = "Pending";
            if (dutyRecord?.checkIn && dutyRecord?.checkOut) statusLabel = "Completed";
            else if (dutyRecord?.checkIn) statusLabel = "In Progress";
            else if (assignment.status === "CANCELLED") statusLabel = "Cancelled";

            return (
              <article
                key={assignment._id}
                className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-[#29241f]">
                        {assignment.dutyTitle}
                      </h2>
                      <p className="mt-1 text-sm text-[#8d847b]">
                        {event ? event.eventName : "Event"}
                      </p>
                    </div>

                    <StatusBadge status={statusLabel} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Info
                      icon={<CalendarDays size={16} />}
                      label="Date"
                      value={
                        assignment.dutyDate
                          ? new Date(assignment.dutyDate).toLocaleDateString()
                          : event?.eventDate
                          ? new Date(event.eventDate).toLocaleDateString()
                          : "TBA"
                      }
                    />

                    <Info
                      icon={<Clock3 size={16} />}
                      label="Time"
                      value={`${assignment.startTime} - ${assignment.endTime}`}
                    />

                    <Info
                      icon={<MapPin size={16} />}
                      label="Location"
                      value={event ? event.location : "TBA"}
                    />
                  </div>

                  {(assignment.description || assignment.role) && (
                    <div className="rounded-xl bg-[#fbf8f4] p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#9b938a]">
                        Details
                      </p>

                      {assignment.role && (
                        <p className="mt-2 text-sm font-medium text-[#252525]">
                          Role: {assignment.role}
                        </p>
                      )}

                      {assignment.description && (
                        <p className="mt-1 text-sm leading-6 text-[#756d64]">
                          {assignment.description}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    {statusLabel === "Pending" && (
                      <button
                        type="button"
                        disabled={processingId === assignment._id}
                        onClick={() => handleCheckIn(assignment._id)}
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#b8894b] px-4 text-sm font-semibold text-white hover:bg-[#a7773f] disabled:opacity-50"
                      >
                        {processingId === assignment._id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Play size={15} />
                        )}
                        Check In (Location captured)
                      </button>
                    )}

                    {statusLabel === "In Progress" && (
                      <button
                        type="button"
                        disabled={processingId === assignment._id}
                        onClick={() => handleCheckOut(assignment._id)}
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#557555] px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                      >
                        {processingId === assignment._id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={15} />
                        )}
                        Check Out (Location captured)
                      </button>
                    )}

                    {statusLabel === "Completed" && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#557555]">
                          <CheckCircle2 size={17} />
                          Duty completed
                        </div>
                        <p className="text-xs text-gray-500">
                          Checked in: {dutyRecord?.checkIn ? new Date(dutyRecord.checkIn).toLocaleTimeString() : "N/A"} 
                          {" | "} 
                          Checked out: {dutyRecord?.checkOut ? new Date(dutyRecord.checkOut).toLocaleTimeString() : "N/A"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getClasses = () => {
    switch (status) {
      case "Pending":
        return "bg-[#fff4df] text-[#9a6c37]";
      case "In Progress":
        return "bg-[#edf5ed] text-[#557555]";
      case "Completed":
        return "bg-[#f1eee9] text-[#756d64]";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${getClasses()}`}
    >
      {status}
    </span>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | undefined;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-[#fbf8f4] p-3">
      <span className="text-[#a7773f]">
        {icon}
      </span>

      <div>
        <p className="text-[11px] uppercase tracking-wide text-[#9b938a]">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-[#403a34]">
          {value}
        </p>
      </div>
    </div>
  );
}
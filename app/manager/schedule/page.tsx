"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ScheduleCalendar from "@/components/manager/schedule/ScheduleCalendar";
import ScheduleFilters, {
  type ScheduleFilter,
} from "@/components/manager/schedule/ScheduleFilters";
import ScheduleLegend from "@/components/manager/schedule/ScheduleLegend";

import { useAssignments } from "@/hooks/useAssignments";

import type { Assignment } from "@/types/assignment";
import type { ScheduleEventData } from "@/components/manager/schedule/ScheduleEvent";

export default function SchedulePage() {
  const router = useRouter();

  const [activeFilter, setActiveFilter] =
    useState<ScheduleFilter>("All");

  const [token] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("token");
  });

  const {
    assignments,
    loading,
    error,
    fetchAssignments,
  } = useAssignments({
    token,
    autoFetch: true,
  });

  /*
   * Convert Assignment data into the format
   * expected by the schedule components.
   */
  const scheduleEvents = useMemo<
    ScheduleEventData[]
  >(() => {
    return assignments
      .filter((assignment) => {
        if (activeFilter === "All") {
          return true;
        }

        if (activeFilter === "On Duty") {
          return (
            assignment.status === "ASSIGNED" ||
            assignment.status === "ACCEPTED" ||
            assignment.status === "IN_PROGRESS"
          );
        }

        if (activeFilter === "Available") {
          return assignment.status === "COMPLETED";
        }

        if (activeFilter === "Off Duty") {
          return assignment.status === "CANCELLED";
        }

        return true;
      })
      .map((assignment: Assignment) => {
        const staff =
          typeof assignment.staff === "string"
            ? null
            : assignment.staff;

        const event =
          typeof assignment.event === "string"
            ? null
            : assignment.event;

        return {
          id: assignment._id,

          staffName:
            staff?.name ||
            (typeof assignment.staff === "string"
              ? assignment.staff
              : "Staff member"),

          staffRole:
            staff?.department ||
            undefined,

          staffAvatar:
            undefined,

          startTime:
            formatTime(assignment.startTime),

          endTime:
            formatTime(assignment.endTime),

          eventName:
            event?.eventName ||
            (typeof assignment.event === "string"
              ? assignment.event
              : assignment.dutyTitle),
        };
      });
  }, [assignments, activeFilter]);

  /*
   * Refresh schedule data.
   */
  const handleRefresh = async () => {
    await fetchAssignments({
      page: 1,
      limit: 100,
    });
  };

  /*
   * Add shift.
   *
   * Assignments are currently used as shifts,
   * so redirect to the assignment creation screen.
   */
  const handleAddShift = () => {
    router.push("/manager/assignments");
  };

  /*
   * Event click.
   *
   * Assignment details/edit functionality can be
   * connected here once the assignment detail route
   * is added.
   */
  const handleEventClick = (
    event: ScheduleEventData,
  ) => {
    console.log(
      "Selected schedule event:",
      event,
    );
  };

  /*
   * Loading state
   */
  if (loading && assignments.length === 0) {
    return (
      <main className="min-h-screen bg-[#F8F7F3]">
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#B89563] border-t-transparent" />

            <p className="mt-3 text-sm text-gray-500">
              Loading schedule...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * Error state
   */
  if (error && assignments.length === 0) {
    return (
      <main className="min-h-screen bg-[#F8F7F3] px-4 py-6">
        <div className="rounded-2xl border border-red-100 bg-white p-5 text-center">
          <h2 className="text-base font-semibold text-[#1F1F1F]">
            Unable to load schedule
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error}
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            className="mt-4 min-h-11 rounded-xl bg-[#1F1F1F] px-5 text-sm font-medium text-white"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F7F3]">
      {/* Filters */}
      <ScheduleFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Legend */}
      <ScheduleLegend />

      {/* Calendar */}
      <ScheduleCalendar
        events={scheduleEvents}
        onEventClick={handleEventClick}
        onBack={() => router.back()}
        onAddShift={handleAddShift}
      />

      {/* Refresh indicator */}
      {loading && (
        <div className="fixed right-4 top-20 z-40 rounded-full bg-white px-3 py-2 text-xs text-gray-500 shadow-md">
          Updating...
        </div>
      )}
    </main>
  );
}

/*
 * Convert backend time such as:
 *
 * 09:00 -> 9:00 AM
 * 13:30 -> 1:30 PM
 */
function formatTime(time: string) {
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
}
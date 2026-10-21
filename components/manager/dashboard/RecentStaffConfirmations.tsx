"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserCheck, Clock3, CalendarDays, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { getAuthToken } from "@/lib/auth-storage";
import { getSocket } from "@/lib/socket";
import { formatTime24to12 } from "@/lib/time-utils";

interface AcceptedDutyItem {
  _id: string;
  dutyTitle: string;
  dutyDate: string;
  startTime: string;
  endTime: string;
  status: string;
  respondedAt?: string;
  updatedAt?: string;
  createdAt?: string;
  staff?: {
    _id?: string;
    id?: string;
    name?: string;
    username?: string;
    department?: string;
  };
  event?: {
    _id?: string;
    eventName?: string;
    location?: string;
  };
}

export default function RecentStaffConfirmations() {
  const [confirmedDuties, setConfirmedDuties] = useState<AcceptedDutyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadConfirmedDuties() {
      try {
        const token = getAuthToken();
        if (!token) {
          if (isMounted) setLoading(false);
          return;
        }

        const res = await api<{ success: boolean; data: AcceptedDutyItem[] }>(
          "/assignments?limit=30",
          { token }
        );

        if (isMounted && res.success && Array.isArray(res.data)) {
          const accepted = res.data
            .filter((d) => ["ACCEPTED", "IN_PROGRESS", "COMPLETED"].includes(d.status))
            .sort((a, b) => {
              const timeA = new Date(a.respondedAt || a.updatedAt || a.dutyDate).getTime();
              const timeB = new Date(b.respondedAt || b.updatedAt || b.dutyDate).getTime();
              return timeB - timeA;
            })
            .slice(0, 6);

          setConfirmedDuties(accepted);
        }
      } catch (err) {
        console.warn("Could not load confirmed duties for dashboard", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadConfirmedDuties();
    const interval = setInterval(loadConfirmedDuties, 4500);

    const socket = getSocket();
    if (socket) {
      socket.on("duty:updated", loadConfirmedDuties);
      socket.on("duty:refresh", loadConfirmedDuties);
    }

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (socket) {
        socket.off("duty:updated", loadConfirmedDuties);
        socket.off("duty:refresh", loadConfirmedDuties);
      }
    };
  }, []);

  return (
    <section aria-labelledby="staff-confirmations-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2
            id="staff-confirmations-heading"
            className="text-base font-semibold text-[#1F1F1F] flex items-center gap-2"
          >
            <UserCheck size={18} className="text-emerald-700" />
            <span>Staff Duty Confirmations</span>
          </h2>
          <p className="mt-0.5 text-xs text-gray-500">
            Real-time feed of team members who have accepted their event duty assignments
          </p>
        </div>

        <Link
          href="/manager/duties"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#9A7B4F] hover:text-[#7D623E] transition"
        >
          <span>View All Duties</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center text-xs text-gray-400">
          Loading staff confirmations...
        </div>
      ) : confirmedDuties.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center">
          <Clock3 className="mx-auto h-7 w-7 text-gray-400" />
          <p className="mt-2 text-sm font-semibold text-gray-700">No shifts confirmed yet</p>
          <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
            When staff members review and accept shifts on their portal, their confirmed responses will appear live here.
          </p>
          <Link
            href="/manager/duties"
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition shadow-2xs"
          >
            Assign Duties to Staff
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {confirmedDuties.map((duty) => {
            const staffName = duty.staff?.name || "Staff Member";
            const staffDept = duty.staff?.department || "General Staff";
            const eventName = duty.event?.eventName || "Event";
            const formattedDate = duty.dutyDate
              ? new Date(duty.dutyDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "Upcoming";

            const timeString =
              duty.startTime && duty.endTime
                ? `${formatTime24to12(duty.startTime)} - ${formatTime24to12(duty.endTime)}`
                : "";

            return (
              <div
                key={duty._id}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-xs transition hover:border-[#9A7B4F] hover:shadow-md"
              >
                <div>
                  {/* Top row: Avatar & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#9A7B4F] to-[#D2B47A] text-xs font-black text-white shadow-xs">
                        {staffName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[#29241f] group-hover:text-[#9A7B4F] transition">
                          {staffName}
                        </p>
                        <p className="truncate text-[10px] text-gray-500">
                          {staffDept}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                      <CheckCircle2 size={10} className="text-emerald-700" />
                      <span>{duty.status === "IN_PROGRESS" ? "On Duty" : "Confirmed"}</span>
                    </span>
                  </div>

                  {/* Duty & Event info */}
                  <div className="mt-3 space-y-1 border-t border-gray-100 pt-2.5 text-xs">
                    <p className="font-semibold text-gray-800 truncate">
                      {duty.dutyTitle}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate flex items-center gap-1">
                      <span>for</span>
                      <span className="font-medium text-gray-700 truncate">{eventName}</span>
                    </p>
                  </div>
                </div>

                {/* Timing Footer */}
                <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={11} className="text-[#9A7B4F]" />
                    <span>{formattedDate}</span>
                  </span>

                  {timeString && (
                    <span className="flex items-center gap-1 font-medium text-gray-600">
                      <Clock3 size={11} className="text-[#9A7B4F]" />
                      <span>{timeString}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

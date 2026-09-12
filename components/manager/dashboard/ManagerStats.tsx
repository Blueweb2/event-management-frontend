"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CalendarDays,
  UserCheck,
  ClipboardList,
} from "lucide-react";

import ManagerStatCard from "./ManagerStatCard";
import { api } from "@/lib/api";

export default function ManagerStats() {
  const [counts, setCounts] = useState({
    totalStaff: 0,
    upcomingEvents: 0,
    availableStaff: 0,
    pendingTasks: 0,
    loaded: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        const [eventsRes, staffRes, assignmentsRes] = await Promise.allSettled([
          api<{ success: boolean; data?: any[]; pagination?: { total?: number } }>("/events"),
          api<{ success: boolean; data?: any[]; pagination?: { total?: number } }>("/users/staff"),
          api<{ success: boolean; data?: any[]; pagination?: { total?: number } }>("/assignments"),
        ]);

        let eventCount = 0;
        let staffCount = 0;
        let assignmentCount = 0;

        if (eventsRes.status === "fulfilled" && eventsRes.value) {
          eventCount =
            eventsRes.value.pagination?.total ??
            (Array.isArray(eventsRes.value.data) ? eventsRes.value.data.length : 0);
        }

        if (staffRes.status === "fulfilled" && staffRes.value) {
          staffCount =
            staffRes.value.pagination?.total ??
            (Array.isArray(staffRes.value.data) ? staffRes.value.data.length : 0);
        }

        if (assignmentsRes.status === "fulfilled" && assignmentsRes.value) {
          assignmentCount =
            assignmentsRes.value.pagination?.total ??
            (Array.isArray(assignmentsRes.value.data) ? assignmentsRes.value.data.length : 0);
        }

        if (isMounted) {
          setCounts({
            totalStaff: staffCount,
            upcomingEvents: eventCount,
            availableStaff: Math.max(staffCount - assignmentCount, 0),
            pendingTasks: assignmentCount,
            loaded: true,
          });
        }
      } catch (err) {
        console.warn("Could not fetch live dashboard stats", err);
      }
    }

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    {
      label: "Total Staff",
      value: counts.loaded ? String(counts.totalStaff) : "...",
      icon: Users,
      description: "Registered team members",
    },
    {
      label: "Upcoming Events",
      value: counts.loaded ? String(counts.upcomingEvents) : "...",
      icon: CalendarDays,
      description: "Events scheduled",
    },
    {
      label: "Available Today",
      value: counts.loaded ? String(counts.availableStaff) : "...",
      icon: UserCheck,
      description: "Staff ready for duty",
    },
    {
      label: "Active Assignments",
      value: counts.loaded ? String(counts.pendingTasks) : "...",
      icon: ClipboardList,
      description: "Scheduled assignments",
    },
  ];

  return (
    <section aria-labelledby="manager-stats-heading">
      <div className="mb-3">
        <h2
          id="manager-stats-heading"
          className="text-base font-semibold text-[#1F1F1F]"
        >
          Overview
        </h2>

        <p className="mt-0.5 text-xs text-gray-500">
          Your event management summary
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <ManagerStatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
          />
        ))}
      </div>
    </section>
  );
}
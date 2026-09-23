"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CalendarDays,
  UserCheck,
  ClipboardList,
  IndianRupee,
  FileText,
  Clock,
} from "lucide-react";

import ManagerStatCard from "./ManagerStatCard";
import { api } from "@/lib/api";

export default function ManagerStats() {
  const [counts, setCounts] = useState({
    totalStaff: 0,
    upcomingEvents: 0,
    availableStaff: 0,
    pendingTasks: 0,
    totalRevenue: 0,
    pendingEstimates: 0,
    totalStaffHours: 0,
    loaded: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        const [eventsRes, staffRes, assignmentsRes, estimatesRes, analyticsRes] = await Promise.allSettled([
          api<{ success: boolean; data?: any[]; pagination?: { total?: number } }>("/events"),
          api<{ success: boolean; data?: any[]; pagination?: { total?: number } }>("/users/staff"),
          api<{ success: boolean; data?: any[]; pagination?: { total?: number } }>("/assignments"),
          api<{ success: boolean; data?: any[] }>("/estimates"),
          api<{ success: boolean; data?: { totalStaffHours?: number; totalRevenue?: number } }>("/reports/analytics"),
        ]);

        let eventCount = 0;
        let staffCount = 0;
        let assignmentCount = 0;
        let pendingEstCount = 0;
        let revenue = 0;
        let staffHours = 0;

        if (eventsRes.status === "fulfilled" && eventsRes.value) {
          const eventsList = Array.isArray(eventsRes.value.data) ? eventsRes.value.data : [];
          eventCount = eventsRes.value.pagination?.total ?? eventsList.length;
          
          // Calculate revenue from confirmed events
          revenue = eventsList.reduce((sum: number, ev: any) => {
            const bookingTotal = typeof ev.booking === "object" ? Number(ev.booking?.total || 0) : 0;
            return sum + bookingTotal;
          }, 0);
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

        if (estimatesRes.status === "fulfilled" && estimatesRes.value && Array.isArray(estimatesRes.value.data)) {
          pendingEstCount = estimatesRes.value.data.filter((e: any) =>
            ["DRAFT", "SENT", "VIEWED"].includes(e.status)
          ).length;
        }

        if (analyticsRes.status === "fulfilled" && analyticsRes.value?.data) {
          staffHours = analyticsRes.value.data.totalStaffHours || 0;
          if (analyticsRes.value.data.totalRevenue) {
            revenue = analyticsRes.value.data.totalRevenue;
          }
        }

        if (isMounted) {
          setCounts({
            totalStaff: staffCount,
            upcomingEvents: eventCount,
            availableStaff: Math.max(staffCount - assignmentCount, 0),
            pendingTasks: assignmentCount,
            totalRevenue: revenue,
            pendingEstimates: pendingEstCount,
            totalStaffHours: staffHours,
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

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val);

  const stats = [
    {
      label: "Total Revenue",
      value: counts.loaded ? formatCurrency(counts.totalRevenue) : "...",
      icon: IndianRupee,
      description: "Confirmed event bookings",
    },
    {
      label: "Pending Estimates",
      value: counts.loaded ? String(counts.pendingEstimates) : "...",
      icon: FileText,
      description: "Awaiting client response",
    },
    {
      label: "Event Volume",
      value: counts.loaded ? String(counts.upcomingEvents) : "...",
      icon: CalendarDays,
      description: "Total events in pipeline",
    },
    {
      label: "Staff Hours Worked",
      value: counts.loaded ? `${counts.totalStaffHours} hrs` : "...",
      icon: Clock,
      description: "Log hours across shifts",
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
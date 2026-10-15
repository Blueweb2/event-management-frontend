"use client";

import { useState } from "react";
import Link from "next/link";
import { Utensils, Palette, Camera, Layers, ShieldCheck } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import ManagerStats from "@/components/manager/dashboard/ManagerStats";
import UpcomingEvents from "@/components/manager/dashboard/UpcomingEvents";
import KitchenDashboard from "@/components/manager/departments/KitchenDashboard";
import DecorationDashboard from "@/components/manager/departments/DecorationDashboard";
import PhotographyDashboard from "@/components/manager/departments/PhotographyDashboard";

export default function ManagerDashboardPage() {
  const { user, token } = useAuth();

  const userDept = (user?.department || "").toLowerCase().trim();
  const role = (user?.role || "").toLowerCase().trim();
  const isExecutive = role === "superadmin" || role === "admin" || userDept.includes("operation");

  // Determine initial view based on user department
  const getInitialView = () => {
    if (userDept.includes("kitchen") || userDept.includes("chef") || userDept.includes("cook")) {
      return "KITCHEN";
    }
    if (userDept.includes("decor") || userDept.includes("stage")) {
      return "DECORATION";
    }
    if (userDept.includes("photo") || userDept.includes("video") || userDept.includes("media")) {
      return "PHOTOGRAPHY";
    }
    return "OVERVIEW";
  };

  const [activeDepartmentView, setActiveDepartmentView] = useState<
    "OVERVIEW" | "KITCHEN" | "DECORATION" | "PHOTOGRAPHY"
  >(getInitialView());

  if (!token) {
    return null;
  }

  // If manager is explicitly scoped to Kitchen (and not executive), render Kitchen directly
  if (!isExecutive && getInitialView() === "KITCHEN") {
    return <KitchenDashboard token={token} />;
  }

  // If manager is explicitly scoped to Decoration, render Decoration directly
  if (!isExecutive && getInitialView() === "DECORATION") {
    return <DecorationDashboard token={token} />;
  }

  // If manager is explicitly scoped to Photography, render Photography directly
  if (!isExecutive && getInitialView() === "PHOTOGRAPHY") {
    return <PhotographyDashboard token={token} />;
  }

  // Executive / Operations Manager View with Multi-Department Switcher
  return (
    <div className="space-y-6">
      {/* Welcome & Department Switcher Bar */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A7B4F]">
              {user?.role === "superadmin" ? "Superadmin Executive Oversight" : "Operations Hub"}
            </span>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-300">
              {user?.department || (user?.role === "superadmin" ? "Executive" : "Operations")}
            </span>
          </div>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1F1F1F]">
            Good morning, {user?.name || "Manager"} 👋
          </h1>

          <p className="mt-0.5 text-sm text-gray-500">
            {activeDepartmentView === "OVERVIEW"
              ? "Organization-wide metrics and upcoming confirmed events."
              : `Viewing ${activeDepartmentView} department workflows and scoped resources.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === "superadmin" && (
            <Link
              href="/superadmin"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 text-xs font-bold text-[#84632a] transition hover:bg-amber-100"
            >
              <ShieldCheck size={14} />
              <span>Superadmin Console</span>
            </Link>
          )}

          <Link
            href="/manager/booking"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#252525] px-4 text-xs font-bold text-white transition active:scale-[0.98] hover:bg-[#1f1f1f]"
          >
            New Booking
          </Link>
        </div>
      </section>

      {/* Executive Department Switcher Tabs */}
      {isExecutive && (
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
          {[
            { id: "OVERVIEW", label: "Operations Overview", icon: Layers },
            { id: "KITCHEN", label: "Kitchen & Chef Console", icon: Utensils },
            { id: "DECORATION", label: "Decoration & Styling", icon: Palette },
            { id: "PHOTOGRAPHY", label: "Photography & Media", icon: Camera },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeDepartmentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveDepartmentView(item.id as any)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? "bg-[#252525] text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <Icon size={14} className={isActive ? "text-amber-400" : "text-gray-400"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* View Content */}
      {activeDepartmentView === "OVERVIEW" && (
        <>
          <ManagerStats />
          <UpcomingEvents />
        </>
      )}

      {activeDepartmentView === "KITCHEN" && <KitchenDashboard token={token} />}

      {activeDepartmentView === "DECORATION" && <DecorationDashboard token={token} />}

      {activeDepartmentView === "PHOTOGRAPHY" && <PhotographyDashboard token={token} />}
    </div>
  );
}
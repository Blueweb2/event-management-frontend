"use client";

import { useState } from "react";
import Link from "next/link";
import { Utensils, Palette, Camera, Layers, ShieldCheck } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import ManagerStats from "@/components/manager/dashboard/ManagerStats";
import UpcomingEvents from "@/components/manager/dashboard/UpcomingEvents";
import RecentStaffConfirmations from "@/components/manager/dashboard/RecentStaffConfirmations";
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
      {/* Welcome Bar */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-[#e8e1d8] bg-white p-5 sm:p-6 shadow-xs">
        <div>
          {/* <div className="flex items-center gap-2">
            <span className="rounded-md bg-stone-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-stone-700">
              {user?.department || (user?.role === "superadmin" ? "Super Admin" : "Manager")}
            </span>
          </div> */}

       
          {/* <p className="mt-0.5 text-xs text-gray-500">
            Organization-wide overview of upcoming confirmed events, bookings, and team operations.
          </p> */}
        </div>

      
      </section>

      {/* Department Tabs for Executive / Operations */}
      {/* <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveDepartmentView("OVERVIEW")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeDepartmentView === "OVERVIEW"
              ? "bg-[#29241f] text-white shadow-2xs"
              : "bg-white text-stone-600 hover:bg-stone-50 border border-gray-200"
          }`}
        >
          <Layers size={14} />
          <span>Operations Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDepartmentView("KITCHEN")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeDepartmentView === "KITCHEN"
              ? "bg-[#9a6c37] text-white shadow-2xs"
              : "bg-white text-stone-600 hover:bg-stone-50 border border-gray-200"
          }`}
        >
          <Utensils size={14} />
          <span>Kitchen / Chef Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDepartmentView("DECORATION")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeDepartmentView === "DECORATION"
              ? "bg-indigo-600 text-white shadow-2xs"
              : "bg-white text-stone-600 hover:bg-stone-50 border border-gray-200"
          }`}
        >
          <Palette size={14} />
          <span>Decoration Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDepartmentView("PHOTOGRAPHY")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeDepartmentView === "PHOTOGRAPHY"
              ? "bg-sky-600 text-white shadow-2xs"
              : "bg-white text-stone-600 hover:bg-stone-50 border border-gray-200"
          }`}
        >
          <Camera size={14} />
          <span>Photography Dashboard</span>
        </button>
      </div> */}


      {activeDepartmentView === "KITCHEN" && <KitchenDashboard token={token} />}
      {activeDepartmentView === "DECORATION" && <DecorationDashboard token={token} />}
      {activeDepartmentView === "PHOTOGRAPHY" && <PhotographyDashboard token={token} />}
      {activeDepartmentView === "OVERVIEW" && (
        <>
          <ManagerStats />
          <UpcomingEvents />
          {/* <RecentStaffConfirmations /> */}
        </>
      )}
    </div>
  );
}
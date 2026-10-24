"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ManagerStats from "@/components/manager/dashboard/ManagerStats";
import UpcomingEvents from "@/components/manager/dashboard/UpcomingEvents";
import KitchenDashboard from "@/components/manager/departments/KitchenDashboard";
import DecorationDashboard from "@/components/manager/departments/DecorationDashboard";
import PhotographyDashboard from "@/components/manager/departments/PhotographyDashboard";

export default function ManagerDashboardPage() {
  const router = useRouter();
  const { user, token } = useAuth();

  const userDept = (user?.department || "").toLowerCase().trim();
  const role = (user?.role || "").toLowerCase().trim();
  const isOperationsManager =
    userDept.includes("operation") && role !== "superadmin" && role !== "admin";
  const isExecutive = role === "superadmin" || role === "admin";

  useEffect(() => {
    if (isOperationsManager) {
      router.replace("/manager/events");
    }
  }, [isOperationsManager, router]);

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

  if (!token || isOperationsManager) {
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
      {activeDepartmentView === "KITCHEN" && <KitchenDashboard token={token} />}
      {activeDepartmentView === "DECORATION" && <DecorationDashboard token={token} />}
      {activeDepartmentView === "PHOTOGRAPHY" && <PhotographyDashboard token={token} />}
      {activeDepartmentView === "OVERVIEW" && (
        <>
          <ManagerStats />
          <UpcomingEvents />
        </>
      )}
    </div>
  );
}
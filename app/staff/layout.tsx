"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import StaffSidebar from "@/components/staff/layout/StaffSidebar";
import StaffHeaderNav from "@/components/staff/layout/StaffHeaderNav";
import StaffBottomNav from "@/components/staff/StaffBottomNav";
import StaffServiceWorker from "@/components/staff/StaffServiceWorker";
import ShiftNotificationsFeed from "@/components/staff/shift/ShiftNotificationsFeed";
import { useAuth } from "@/hooks/useAuth";
import { useAssignments } from "@/hooks/useAssignments";
import { useAttendance } from "@/hooks/useAttendance";

interface StaffLayoutProps {
  children: ReactNode;
}

export default function StaffLayout({
  children,
}: StaffLayoutProps) {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  // Navigation UI States (Matches ManagerLayout pattern)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);

  // Authenticate user & role check
  useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
    }
  }, [loading, token, router]);

  // Fetch live assignments for shift indicators, badges and notifications
  const {
    assignments,
  } = useAssignments({
    token,
    filters: user?.id ? { staff: user.id } : undefined,
    autoFetch: Boolean(token),
  });

  // Fetch live attendance for on-duty / clocked-in indicators
  const {
    attendance,
  } = useAttendance({
    token,
    filters: user?.id ? { staff: user.id } : undefined,
    autoFetch: Boolean(token),
  });

  // Approximate unread count based on assigned shifts and checklists
  const unreadCount = useMemo(() => {
    return assignments.filter(
      (a) =>
        a.status === "ASSIGNED" ||
        a.status === "IN_PROGRESS" ||
        (a.checklist && a.checklist.some((c) => !c.completed))
    ).length;
  }, [assignments]);

  const toggleMenu = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsDesktopSidebarOpen((prev) => !prev);
    } else {
      setIsMobileDrawerOpen((prev) => !prev);
    }
  };

  const closeMenu = () => {
    setIsMobileDrawerOpen(false);
  };

  if (loading || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf6ef]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#9a6c37] border-t-transparent" />
          <p className="text-sm font-medium text-gray-500">
            {loading ? "Loading Staff Portal..." : "Redirecting to login..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf6ef] text-[#29241f] selection:bg-[#9a6c37]/20 selection:text-[#29241f]">
      <StaffServiceWorker />

      {/* ======================================================= */}
      {/* 1. Desktop Docked Sidebar & Mobile Slide-Over Drawer     */}
      {/* ======================================================= */}
      <StaffSidebar
        isOpen={isMobileDrawerOpen}
        isDesktopOpen={isDesktopSidebarOpen}
        onClose={closeMenu}
        onToggle={toggleMenu}
        assignments={assignments}
        attendance={attendance}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotifsOpen(true)}
      />

      {/* ======================================================= */}
      {/* 2. Main Wrapper (Offset by sidebar width on desktop)    */}
      {/* ======================================================= */}
      <div
        className={`flex min-h-screen flex-col transition-[padding] duration-200 ${
          isDesktopSidebarOpen ? "lg:pl-64" : "lg:pl-0"
        }`}
      >
        {/* Sticky Top Header Nav */}
        <StaffHeaderNav
          onMenuClick={toggleMenu}
          onNotificationClick={() => setIsNotifsOpen(true)}
          unreadCount={unreadCount}
          attendance={attendance}
          isDesktopOpen={isDesktopSidebarOpen}
        />

        {/* Page Content Container */}
        <main className="flex-1 pb-28 sm:pb-24 lg:pb-12">
          <div className="mx-auto w-full max-w-7xl px-3.5 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* ======================================================= */}
      {/* 3. Mobile Bottom Navigation (Hidden on desktop)         */}
      {/* ======================================================= */}
      <StaffBottomNav
        onMore={() => setIsMobileDrawerOpen(true)}
      />

      {/* ======================================================= */}
      {/* 4. Shift Reminders & Notifications Modal / Drawer       */}
      {/* ======================================================= */}
      {isNotifsOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setIsNotifsOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <ShiftNotificationsFeed
              assignments={assignments}
              onClose={() => setIsNotifsOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
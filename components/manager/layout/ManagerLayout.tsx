"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import ManagerHeader from "./ManagerHeader";
import ManagerMenu from "./ManagerMenu";
import ManagerBottomNav from "./ManagerBottomNav";
import ManagerNotificationDrawer from "../notifications/ManagerNotificationDrawer";
import { useAuth } from "@/hooks/useAuth";
import { useManagerNotifications } from "@/hooks/useManagerNotifications";

interface ManagerLayoutProps {
  children: React.ReactNode;
}

export default function ManagerLayout({
  children,
}: ManagerLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isBookingPage =
    pathname === "/manager/booking" || pathname?.startsWith("/manager/booking");
  const { user, token, loading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    loading: notifsLoading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    refresh: refreshNotifs,
  } = useManagerNotifications();

  useEffect(() => {
    if (!loading) {
      if (!token) {
        const fullPath = typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/manager";
        router.push(`/login?redirect=${encodeURIComponent(fullPath)}`);
        return;
      }
      const role = (user?.role || "").toLowerCase();
      if (role === "staff") {
        router.push("/staff");
      }
    }
  }, [loading, token, user, router]);

  const openMenu = () => {
    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    router.replace("/login");
  };

  if (loading || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F7F3]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#9A7B4F] border-t-transparent" />
          <p className="text-sm font-medium text-gray-500">
            {loading ? "Loading Manager Portal..." : "Redirecting to login..."}
          </p>
        </div>
      </div>
    );
  }

  if (isBookingPage) {
    return (
      <div className="min-h-screen bg-[#F8F7F3] text-[#1F1F1F]">
        <main className="min-h-screen">
          <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#1F1F1F]">
      {/* Header with Live Notifications Bell */}
      <ManagerHeader
        onMenuClick={openMenu}
        onNotificationClick={() => setIsNotifsOpen(true)}
        unreadCount={unreadCount}
      />

      {/* Side Menu / Drawer */}
      <ManagerMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        onLogout={handleLogout}
      />

      {/* Slide-over Notifications Drawer */}
      <ManagerNotificationDrawer
        open={isNotifsOpen}
        onClose={() => setIsNotifsOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        loading={notifsLoading}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDismiss={dismissNotification}
        onRefresh={refreshNotifs}
      />

      {/* Page Content */}
      <main className="min-h-[calc(100dvh-64px)] pb-28 sm:pb-12">
        <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <ManagerBottomNav />
    </div>
  );
}
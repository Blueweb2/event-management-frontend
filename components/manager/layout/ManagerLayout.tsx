"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, LayoutDashboard } from "lucide-react";
import ManagerHeader from "./ManagerHeader";
import ManagerMenu from "./ManagerMenu";
import ManagerBottomNav from "./ManagerBottomNav";
import ManagerNotificationDrawer from "../notifications/ManagerNotificationDrawer";
import { useAuth } from "@/hooks/useAuth";
import { useManagerNotifications } from "@/hooks/useManagerNotifications";
import {
  isRouteAuthorizedForUser,
  getManagerScope,
} from "@/lib/manager-navigation";

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
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
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

  const toggleMenu = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsDesktopSidebarOpen((prev) => !prev);
    } else {
      setIsMenuOpen((prev) => !prev);
    }
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

  const scope = getManagerScope(user);
  const routeAuth = isRouteAuthorizedForUser(pathname, user);

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#1F1F1F]">
      {/* Side Menu / Sidebar (Always open on desktop) */}
      <ManagerMenu
        isOpen={isMenuOpen}
        isDesktopOpen={isDesktopSidebarOpen}
        onClose={closeMenu}
        onLogout={handleLogout}
      />

      {/* Main Content Area: offset by sidebar width on desktop */}
      <div
        className={`flex min-h-screen flex-col transition-[padding] duration-200 ${
          isDesktopSidebarOpen ? "lg:pl-64" : "lg:pl-0"
        }`}
      >
        {/* Header with Live Notifications Bell */}
        <ManagerHeader
          onMenuClick={toggleMenu}
          onNotificationClick={() => setIsNotifsOpen(true)}
          unreadCount={unreadCount}
          isDesktopSidebarOpen={isDesktopSidebarOpen}
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
        <main className="flex-1 pb-28 sm:pb-12">
          <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
            {!routeAuth.authorized ? (
              <div className="mx-auto max-w-lg py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shadow-xs border border-amber-200">
                  <ShieldAlert size={32} />
                </div>
                <h2 className="mt-4 text-lg font-bold text-gray-900">
                  Menu Not Available for {scope.departmentDisplay}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-gray-600">
                  {routeAuth.reason || "This menu is restricted to authorized departments."}
                </p>
                <div className="mt-6">
                  <Link
                    href="/manager"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#252525] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1a1a1a] active:scale-95"
                  >
                    <LayoutDashboard size={14} />
                    <span>Return to {scope.roleTitle} Dashboard</span>
                  </Link>
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <ManagerBottomNav />
    </div>
  );
}
"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShieldCheck,
  Users,
  LayoutDashboard,
  LogOut,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

interface SuperAdminLayoutProps {
  children: ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!token) {
        const fullPath =
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : "/superadmin";
        router.push(`/login?redirect=${encodeURIComponent(fullPath)}`);
        return;
      }

      const role = (user?.role || "").toLowerCase();
      if (role === "staff") {
        router.push("/staff");
        return;
      }
      if (role === "manager" || role === "admin") {
        router.push("/manager");
        return;
      }
    }
  }, [loading, token, user, router]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (loading || !token || (user && user.role !== "superadmin")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F7F3]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#9A7B4F] to-[#D2B47A] p-0.5 shadow-md shadow-[#9A7B4F]/20">
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-white">
              <ShieldCheck className="h-7 w-7 text-[#9A7B4F] animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-sm font-black text-[#29241f] tracking-wide">
              AUTHENTICATING SUPERADMIN CONSOLE
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Verifying cryptographic permissions and access boundaries...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#29241f] antialiased">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-[#e8e1d8] bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand & Superadmin Badge */}
          <div className="flex items-center gap-4">
            <Link
              href="/superadmin"
              className="flex items-center gap-3 transition-opacity hover:opacity-90"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#9A7B4F] to-[#D2B47A] p-0.5 shadow-sm shadow-[#9A7B4F]/20">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white">
                  <ShieldCheck className="h-5 w-5 text-[#9A7B4F]" />
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black tracking-wider text-[#29241f] uppercase">
                    Eventeo
                  </span>
                  <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-900 border border-amber-200">
                    SUPERADMIN
                  </span>
                </div>
                <p className="text-[11px] text-gray-500">
                  System Administration Console
                </p>
              </div>
            </Link>

            {/* Breadcrumb separator on desktop */}
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-gray-200 text-xs text-gray-500">
              <span className="flex items-center gap-1.5 font-bold text-gray-700">
                <Users size={14} className="text-[#9A7B4F]" />
                Managers & Access Control
              </span>
            </div>
          </div>

          {/* Right Action Links */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Direct Switch to Operations Hub */}
            <Link
              href="/manager"
              title="Open Manager Operations Hub"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-2xs transition hover:bg-gray-50 hover:text-black active:scale-95"
            >
              <LayoutDashboard size={14} className="text-[#9A7B4F]" />
              <span className="hidden sm:inline">Operations Hub</span>
              <ExternalLink size={12} className="opacity-50" />
            </Link>

            {/* Superadmin Profile pill */}
            <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 shadow-2xs">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#9A7B4F] to-[#D2B47A] text-[11px] font-black text-white">
                {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-black leading-none text-[#29241f] truncate max-w-[140px]">
                  {user?.name?.replace(/^Executive\s+/i, "") || "Superadmin"}
                </p>
                <p className="text-[10px] text-[#9A7B4F] leading-none mt-1 font-bold">
                  Root Authority
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-2xs transition hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 active:scale-95 cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

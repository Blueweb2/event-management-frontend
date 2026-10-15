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
      <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#9A7B4F] to-[#D2B47A] p-0.5 shadow-xl shadow-[#9A7B4F]/20">
            <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[#141414]">
              <ShieldCheck className="h-7 w-7 text-[#D2B47A] animate-pulse" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-wide">
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
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100 antialiased selection:bg-[#9A7B4F]/30 selection:text-white">
      {/* Top Luxury Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0F0F11]/90 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand & Superadmin Badge */}
          <div className="flex items-center gap-4">
            <Link
              href="/superadmin"
              className="flex items-center gap-3 transition-opacity hover:opacity-90"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#9A7B4F] to-[#D2B47A] p-0.5 shadow-md shadow-[#9A7B4F]/20">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#141414]">
                  <ShieldCheck className="h-5 w-5 text-[#D2B47A]" />
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold tracking-wider text-white uppercase">
                    Eventeo
                  </span>
                  <span className="rounded-md bg-[#9A7B4F]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#D2B47A] border border-[#9A7B4F]/30">
                    SUPERADMIN
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  System Administration Console
                </p>
              </div>
            </Link>

            {/* Breadcrumb separator on desktop */}
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-white/10 text-xs text-gray-400">
              <span className="flex items-center gap-1 font-medium text-gray-300">
                <Users size={14} className="text-[#D2B47A]" />
                Executive Managers Directory
              </span>
            </div>
          </div>

          {/* Right Action Links */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Direct Switch to Operations Hub */}
            <Link
              href="/manager"
              title="Open Manager Operations Hub"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              <LayoutDashboard size={14} className="text-[#D2B47A]" />
              <span className="hidden sm:inline">Operations Hub</span>
              <ExternalLink size={12} className="opacity-60" />
            </Link>

            {/* Superadmin Profile pill */}
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-[#9A7B4F] to-[#D2B47A] text-[11px] font-black text-black">
                {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold leading-none text-white truncate max-w-[140px]">
                  {user?.name || "Superadmin"}
                </p>
                <p className="text-[10px] text-[#D2B47A] leading-none mt-1 font-medium">
                  Root Authority
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 active:scale-95"
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

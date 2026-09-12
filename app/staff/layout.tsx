"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import StaffBottomNav from "@/components/staff/StaffBottomNav";
import StaffMoreMenu from "@/components/staff/StaffMoreMenu";
import { useAuth } from "@/hooks/useAuth";

interface StaffLayoutProps {
  children: ReactNode;
}

export default function StaffLayout({
  children,
}: StaffLayoutProps) {
  const router = useRouter();
  const { token, loading } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
    }
  }, [loading, token, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf6ef]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#9a6c37] border-t-transparent" />
          <p className="text-sm font-medium text-gray-500">Loading Staff Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf6ef] text-[#29241f]">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8 lg:pb-8">
        {children}
      </div>

      <StaffBottomNav
        onMore={() => setMoreOpen(true)}
      />

      <StaffMoreMenu
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
      />
    </div>
  );
}
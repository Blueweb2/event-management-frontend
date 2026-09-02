"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import StaffBottomNav from "@/components/staff/StaffBottomNav";
import StaffMoreMenu from "@/components/staff/StaffMoreMenu";

interface StaffLayoutProps {
  children: ReactNode;
}

export default function StaffLayout({
  children,
}: StaffLayoutProps) {
  const [moreOpen, setMoreOpen] = useState(false);

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
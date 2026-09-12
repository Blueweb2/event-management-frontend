"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ManagerHeader from "./ManagerHeader";
import ManagerMenu from "./ManagerMenu";
import ManagerBottomNav from "./ManagerBottomNav";
import { useAuth } from "@/hooks/useAuth";

interface ManagerLayoutProps {
  children: React.ReactNode;
}

export default function ManagerLayout({
  children,
}: ManagerLayoutProps) {
  const router = useRouter();
  const { user, token, loading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!token) {
        router.push("/login");
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
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F7F3]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#9A7B4F] border-t-transparent" />
          <p className="text-sm font-medium text-gray-500">Loading Manager Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#1F1F1F]">
      {/* Header */}
      <ManagerHeader onMenuClick={openMenu} />

      {/* Side Menu / Drawer */}
      <ManagerMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        onLogout={handleLogout}
      />

      {/* Page Content */}
      <main className="min-h-[calc(100vh-64px)] pb-20">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <ManagerBottomNav onMenuClick={openMenu} />
    </div>
  );
}
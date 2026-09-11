"use client";

import { useState } from "react";
import ManagerHeader from "./ManagerHeader";
import ManagerMenu from "./ManagerMenu";
import ManagerBottomNav from "./ManagerBottomNav";

interface ManagerLayoutProps {
  children: React.ReactNode;
}

export default function ManagerLayout({
  children,
}: ManagerLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openMenu = () => {
    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    // Logout functionality will be connected
    // to the authentication API later.
    console.log("Manager logout");
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#1F1F1F]">
      {/* Mobile Header */}
      <ManagerHeader onMenuClick={openMenu} />

      {/* Side Menu / Drawer */}
      <ManagerMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        onLogout={handleLogout}
      />

      {/* Page Content */}
      <main className="min-h-[calc(100vh-64px)] pb-20">
        <div className="mx-auto w-full max-w-md px-4 py-5">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <ManagerBottomNav onMenuClick={openMenu} />
    </div>
  );
}
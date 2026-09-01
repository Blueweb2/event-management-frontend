"use client";

import { useState } from "react";
import Navbar from "./Navbar";
import MobileMenu from "./MobileMenu";

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <Navbar
        onMenuClick={() => setIsMenuOpen(true)}
      />

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
}
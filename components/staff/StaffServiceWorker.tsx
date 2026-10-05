"use client";

import { useEffect } from "react";

export default function StaffServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const registerWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/staff",
        });

        // Trigger safe update check on mount
        if (registration.update) {
          registration.update().catch(() => {});
        }
      } catch (error) {
        console.warn("Staff Service Worker registration failed:", error);
      }
    };

    if (document.readyState === "complete") {
      registerWorker();
    } else {
      window.addEventListener("load", registerWorker, { once: true });
      return () => window.removeEventListener("load", registerWorker);
    }
  }, []);

  return null;
}

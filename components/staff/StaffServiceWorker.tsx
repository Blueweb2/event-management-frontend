"use client";

import { useEffect } from "react";

export default function StaffServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // In development mode, unregister any existing service worker and clear caches to prevent Turbopack HMR chunk cache issues
    if (process.env.NODE_ENV === "development") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().catch(() => {});
        }
      });
      if ("caches" in window) {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name).catch(() => {});
          }
        });
      }
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

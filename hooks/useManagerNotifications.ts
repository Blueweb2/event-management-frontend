"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getEvents } from "@/lib/event.api";
import { getExpenses } from "@/lib/expense.api";
import { getEstimates } from "@/lib/estimates.api";
import { useAuth } from "@/hooks/useAuth";

export type NotificationCategory = "ACTION" | "EVENT" | "FINANCE" | "ESTIMATE" | "STAFF";

export interface ManagerNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  timeAgo: string;
  link: string;
  read: boolean;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

const STORAGE_KEY = "antigravity_manager_read_notifs";
const DISMISSED_KEY = "antigravity_manager_dismissed_notifs";

export function useManagerNotifications() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(DISMISSED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [rawNotifications, setRawNotifications] = useState<ManagerNotification[]>([]);

  const fetchLiveNotifications = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);

      const [eventsRes, expensesRes, estimatesRes] = await Promise.allSettled([
        getEvents({ status: "Upcoming", limit: 10 }, token),
        getExpenses(),
        getEstimates({ limit: 10 }),
      ]);

      const items: ManagerNotification[] = [];
      const now = new Date();

      // 1. Upcoming Events (events occurring within 72 hours)
      if (eventsRes.status === "fulfilled" && eventsRes.value?.data) {
        eventsRes.value.data.forEach((evt) => {
          const eventDate = new Date(evt.eventDate);
          const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

          if (diffHours >= -12 && diffHours <= 72) {
            const isToday = eventDate.toDateString() === now.toDateString();
            const timingText = isToday
              ? `Today at ${evt.eventTime || "scheduled time"}`
              : `in ${Math.max(1, Math.round(diffHours / 24))} days`;

            items.push({
              id: `evt-upcoming-${evt._id}`,
              category: "EVENT",
              title: isToday ? `⚡ Event Happening Today: ${evt.eventName}` : `Upcoming Event: ${evt.eventName}`,
              message: `${evt.eventName} with ${evt.guests} guests is scheduled ${timingText} at ${evt.location}.`,
              timestamp: evt.eventDate,
              timeAgo: isToday ? "Today" : "Coming up",
              link: `/manager/events/${evt._id}`,
              read: false,
              priority: isToday ? "HIGH" : "MEDIUM",
            });
          }
        });
      }

      // 2. Pending Expenses needing manager attention
      if (expensesRes.status === "fulfilled" && Array.isArray(expensesRes.value)) {
        const pendingExpenses = expensesRes.value.filter((exp) => exp.status === "Pending");
        pendingExpenses.slice(0, 5).forEach((exp) => {
          items.push({
            id: `exp-pending-${exp.id}`,
            category: "FINANCE",
            title: `Pending Expense: ₹${exp.amount.toLocaleString("en-IN")}`,
            message: `Expense "${exp.title}" (${exp.category}) for ${exp.event} is awaiting settlement.`,
            timestamp: exp.date,
            timeAgo: "Awaiting Action",
            link: `/manager/expenses`,
            read: false,
            priority: exp.amount > 50000 ? "HIGH" : "MEDIUM",
          });
        });
      }

      // 3. New Estimates in DRAFT or SENT stage
      if (estimatesRes.status === "fulfilled" && estimatesRes.value?.data) {
        const activeEstimates = estimatesRes.value.data.filter(
          (est) => est.status === "DRAFT" || est.status === "SENT"
        );
        activeEstimates.slice(0, 5).forEach((est) => {
          items.push({
            id: `est-review-${est._id}`,
            category: "ESTIMATE",
            title: `Review Estimate: ${est.estimateNumber}`,
            message: `Estimate for "${est.eventName}" (₹${est.total.toLocaleString("en-IN")}) is in ${est.status} status.`,
            timestamp: est.createdAt,
            timeAgo: "Active Proposal",
            link: `/manager/estimates`,
            read: false,
            priority: "LOW",
          });
        });
      }

      // Fallback notification if system is fresh
      if (items.length === 0) {
        items.push({
          id: "sys-ready-1",
          category: "ACTION",
          title: "All Systems Running Smoothly",
          message: "No pending alerts or overdue shifts. Your event operations are fully up to date.",
          timestamp: new Date().toISOString(),
          timeAgo: "Just now",
          link: "/manager",
          read: true,
          priority: "LOW",
        });
      }

      setRawNotifications(items);
    } catch {
      // Keep existing
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchLiveNotifications();
    // Re-check periodically every 60 seconds
    const interval = setInterval(fetchLiveNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchLiveNotifications]);

  // Combine with read & dismissed states
  const notifications = useMemo(() => {
    return rawNotifications
      .filter((n) => !dismissedIds.includes(n.id))
      .map((n) => ({
        ...n,
        read: n.read || readIds.includes(n.id),
      }));
  }, [rawNotifications, readIds, dismissedIds]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
    } catch {}
  }, [notifications]);

  const dismissNotification = useCallback((id: string) => {
    setDismissedIds((prev) => {
      const updated = [...prev, id];
      try {
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setDismissedIds(allIds);
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(allIds));
    } catch {}
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAllNotifications,
    refresh: fetchLiveNotifications,
  };
}

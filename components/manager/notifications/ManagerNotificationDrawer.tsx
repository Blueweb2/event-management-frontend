"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Bell,
  CheckCheck,
  Calendar,
  CreditCard,
  FileText,
  AlertCircle,
  ExternalLink,
  Trash2,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import {
  ManagerNotification,
  NotificationCategory,
} from "@/hooks/useManagerNotifications";

interface ManagerNotificationDrawerProps {
  open: boolean;
  onClose: () => void;
  notifications: ManagerNotification[];
  unreadCount: number;
  loading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
  onRefresh: () => void;
}

export default function ManagerNotificationDrawer({
  open,
  onClose,
  notifications,
  unreadCount,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
  onRefresh,
}: ManagerNotificationDrawerProps) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<"ALL" | NotificationCategory | "UNREAD">("ALL");

  if (!open) return null;

  const filtered = notifications.filter((n) => {
    if (activeFilter === "ALL") return true;
    if (activeFilter === "UNREAD") return !n.read;
    return n.category === activeFilter;
  });

  const handleItemClick = (notification: ManagerNotification) => {
    onMarkAsRead(notification.id);
    onClose();
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "EVENT":
        return <Calendar size={16} className="text-[#9A6C37]" />;
      case "FINANCE":
        return <CreditCard size={16} className="text-emerald-600" />;
      case "ESTIMATE":
        return <FileText size={16} className="text-blue-600" />;
      default:
        return <AlertCircle size={16} className="text-amber-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="manager-notifications-title"
          className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#E8E1D8] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E8E1D8] bg-white px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4EBDD] text-[#9A6C37]">
                <Bell size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    id="manager-notifications-title"
                    className="text-base font-bold text-[#29241F]"
                  >
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#756D64]">
                  Live operational updates & alerts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onRefresh}
                title="Refresh notifications"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#756D64] hover:bg-[#F0ECE4] transition"
              >
                <RefreshCw size={16} className={loading ? "animate-spin text-[#9A6C37]" : ""} />
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close notifications drawer"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#756D64] hover:bg-[#F0ECE4] transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Action Row & Filter Pills */}
          <div className="border-b border-[#E8E1D8] bg-[#F7F4EE] px-5 py-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#756D64]">
                Filter by Category
              </span>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#9A6C37] hover:underline"
                >
                  <CheckCheck size={14} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveFilter("ALL")}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                  activeFilter === "ALL"
                    ? "bg-[#29241F] text-white shadow-sm"
                    : "bg-white text-[#756D64] border border-[#E8E1D8] hover:text-[#29241F]"
                }`}
              >
                All ({notifications.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("UNREAD")}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                  activeFilter === "UNREAD"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "bg-white text-[#756D64] border border-[#E8E1D8] hover:text-[#29241F]"
                }`}
              >
                Unread ({unreadCount})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("EVENT")}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                  activeFilter === "EVENT"
                    ? "bg-[#9A6C37] text-white shadow-sm"
                    : "bg-white text-[#756D64] border border-[#E8E1D8] hover:text-[#29241F]"
                }`}
              >
                Events
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("FINANCE")}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                  activeFilter === "FINANCE"
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-white text-[#756D64] border border-[#E8E1D8] hover:text-[#29241F]"
                }`}
              >
                Expenses
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("ESTIMATE")}
                className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
                  activeFilter === "ESTIMATE"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-[#756D64] border border-[#E8E1D8] hover:text-[#29241F]"
                }`}
              >
                Estimates
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-[#E8E1D8] text-[#9A6C37] shadow-sm mb-3">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-sm font-bold text-[#29241F]">
                  You&apos;re All Caught Up!
                </h3>
                <p className="mt-1 text-xs text-[#756D64] max-w-xs leading-relaxed">
                  No notifications match your filter. Live alerts for upcoming events and pending tasks will appear here.
                </p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`group relative rounded-2xl border p-4 transition cursor-pointer shadow-sm ${
                    !item.read
                      ? "bg-white border-[#B8894B]/40 hover:border-[#9A6C37] shadow-sm ring-1 ring-[#B8894B]/20"
                      : "bg-[#FAF8F5] border-[#E8E1D8] hover:bg-white text-gray-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon Badge */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                        !item.read
                          ? "bg-[#F4EBDD] border-[#E8E1D8]"
                          : "bg-white border-gray-200 text-gray-400"
                      }`}
                    >
                      {getCategoryIcon(item.category)}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 pr-6">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-xs font-bold truncate ${
                            !item.read ? "text-[#29241F]" : "text-gray-700"
                          }`}
                        >
                          {item.title}
                        </p>
                        {!item.read && (
                          <span className="h-2 w-2 rounded-full bg-[#B8894B] shrink-0" />
                        )}
                      </div>

                      <p className="mt-1 text-xs text-[#756D64] line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#A8A196]">
                        <span>{item.timeAgo}</span>
                        <span className="inline-flex items-center gap-1 font-semibold text-[#9A6C37] group-hover:underline">
                          <span>View Details</span>
                          <ExternalLink size={11} />
                        </span>
                      </div>
                    </div>

                    {/* Dismiss Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismiss(item.id);
                      }}
                      title="Dismiss notification"
                      className="absolute right-3 top-3 opacity-40 hover:opacity-100 text-gray-400 hover:text-red-600 transition p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#E8E1D8] bg-white px-5 py-3 flex items-center justify-between text-xs text-[#756D64]">
            <span>Auto-synced with operations</span>
            <button
              type="button"
              onClick={onClose}
              className="font-bold text-[#29241F] hover:underline"
            >
              Close
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

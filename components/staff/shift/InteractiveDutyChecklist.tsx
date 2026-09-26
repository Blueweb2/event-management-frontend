"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckSquare, Square, Plus, CheckCircle2, ListTodo, Sparkles, CalendarDays, Clock3, ChevronDown, Radio } from "lucide-react";
import type { Assignment } from "@/types/assignment";
import { updateAssignmentChecklist } from "@/lib/assignment.api";
import { useAuth } from "@/hooks/useAuth";
import { formatTime24to12 } from "@/lib/duty-mapper";

interface ChecklistItem {
  _id?: string;
  text: string;
  completed: boolean;
}

interface InteractiveDutyChecklistProps {
  assignments?: Assignment[];
  assignment?: Assignment;
  onUpdate?: () => void;
}

const DEFAULT_SUBTASKS: Record<string, string[]> = {
  "Audio/Visual": ["Set up stage lights", "Soundcheck microphones", "Test main speakers & mixers", "Verify wireless frequency"],
  Catering: ["Inspect buffet layout", "Check food warmer temperatures", "Ensure cutlery sanitization", "Coordinate beverage bar setup"],
  Operations: ["Venue walkthrough", "Confirm emergency exits clear", "Brief team on timeline", "Coordinate vendor arrivals"],
  Default: ["Arrive 15 mins prior", "Check in with shift lead", "Inspect equipment", "Perform safety check", "Final area cleanup"],
};

const getEventName = (assignment?: Assignment): string => {
  if (!assignment) return "Event";
  if (typeof assignment.event === "object" && assignment.event !== null) {
    return assignment.event.eventName || "Scheduled Event";
  }
  return "Scheduled Event";
};

export default function InteractiveDutyChecklist({
  assignments = [],
  assignment: providedAssignment,
  onUpdate,
}: InteractiveDutyChecklistProps) {
  const { token } = useAuth();
  const [selectedId, setSelectedId] = useState<string>("");
  const [newItemText, setNewItemText] = useState("");
  const [loading, setLoading] = useState(false);

  // Filter valid active/accepted duties
  const validAssignments = useMemo(() => {
    if (assignments.length > 0) {
      return assignments.filter((a) => a.status !== "CANCELLED" && a.status !== "REJECTED");
    }
    return providedAssignment ? [providedAssignment] : [];
  }, [assignments, providedAssignment]);

  // Determine active or next upcoming assignment
  const activeOrNextAssignment = useMemo(() => {
    if (validAssignments.length === 0) return undefined;

    // Priority 1: Shift currently in progress (checked in)
    const inProgress = validAssignments.find((a) => a.status === "IN_PROGRESS");
    if (inProgress) return inProgress;

    // Priority 2: Upcoming or today's accepted shift
    const todayStr = new Date().toISOString().slice(0, 10);
    const upcoming = validAssignments
      .filter((a) => {
        const dStr = a.dutyDate ? new Date(a.dutyDate).toISOString().slice(0, 10) : "";
        return dStr >= todayStr || a.status === "ACCEPTED";
      })
      .sort((a, b) => {
        const dA = new Date(a.dutyDate).getTime();
        const dB = new Date(b.dutyDate).getTime();
        if (dA !== dB) return dA - dB;
        return (a.startTime || "").localeCompare(b.startTime || "");
      });

    if (upcoming.length > 0) return upcoming[0];

    return validAssignments[0];
  }, [validAssignments]);

  // Active selected duty
  const currentAssignment = useMemo(() => {
    if (selectedId) {
      const found = validAssignments.find((a) => a._id === selectedId);
      if (found) return found;
    }
    return activeOrNextAssignment || providedAssignment || validAssignments[0];
  }, [selectedId, validAssignments, activeOrNextAssignment, providedAssignment]);

  // Local checklist items state
  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    if (!currentAssignment) {
      setItems([]);
      return;
    }

    if (currentAssignment.checklist && currentAssignment.checklist.length > 0) {
      setItems(currentAssignment.checklist);
    } else {
      const defaults = DEFAULT_SUBTASKS[currentAssignment.role || "Default"] || DEFAULT_SUBTASKS.Default;
      setItems(defaults.map((text) => ({ text, completed: false })));
    }
  }, [currentAssignment]);

  const completedCount = items.filter((i) => i.completed).length;
  const progressPct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const saveChecklist = async (updatedItems: ChecklistItem[]) => {
    if (!currentAssignment || !token) return;
    try {
      setLoading(true);
      await updateAssignmentChecklist(currentAssignment._id, updatedItems, token);
      onUpdate?.();
    } catch (err) {
      console.warn("Failed to persist checklist:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (index: number) => {
    const updated = items.map((item, i) => (i === index ? { ...item, completed: !item.completed } : item));
    setItems(updated);
    void saveChecklist(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const updated = [...items, { text: newItemText.trim(), completed: false }];
    setItems(updated);
    setNewItemText("");
    void saveChecklist(updated);
  };

  if (!currentAssignment) {
    return (
      <div className="rounded-2xl border border-[#e8e1d8] bg-white p-6 text-center text-gray-500 shadow-xs">
        <ListTodo size={28} className="mx-auto text-gray-400" />
        <p className="mt-2 text-sm font-bold text-[#29241f]">No Duty Selected</p>
        <p className="mt-1 text-xs text-[#756d64]">Sub-task checklist will appear once a shift is assigned.</p>
      </div>
    );
  }

  const isCurrentActiveNext = currentAssignment._id === activeOrNextAssignment?._id;

  return (
    <div className="w-full min-w-0 rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f2ede6] pb-3.5">
        <div className="flex items-center gap-2 text-[#9a6c37]">
          <ListTodo size={18} />
          <h2 className="text-base font-bold text-[#29241f]">Duty Sub-Task Checklist</h2>
        </div>

        <div className="flex items-center gap-2">
          {currentAssignment.status === "IN_PROGRESS" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 animate-pulse">
              <Radio size={12} /> Live Shift Active
            </span>
          ) : isCurrentActiveNext ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-[#9a6c37]">
              ⚡ Current Event
            </span>
          ) : null}

          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-[#9a6c37]">
            {completedCount}/{items.length} Done
          </span>
        </div>
      </div>

      {/* Multi-event Duty Selector */}
      {validAssignments.length > 1 && (
        <div className="mt-3.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#756d64]">
            Select Event Duty:
          </label>
          <div className="relative mt-1">
            <select
              value={currentAssignment._id}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#e0d6ca] bg-[#faf8f5] px-3.5 py-2 pr-8 text-xs font-bold text-[#29241f] outline-none transition focus:border-[#9a6c37]"
            >
              {validAssignments.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.dutyTitle} — {getEventName(a)} (
                  {new Date(a.dutyDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  {a._id === activeOrNextAssignment?._id ? " ★ Next Event" : ""})
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      )}

      {/* Event Details Sub-header */}
      <div className="mt-3.5 rounded-xl border border-[#f0eadf] bg-[#faf8f5] p-3 text-xs text-[#554e46]">
        <p className="font-extrabold text-[#29241f] truncate">{currentAssignment.dutyTitle}</p>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-[#756d64]">
          <span className="flex items-center gap-1">
            <Sparkles size={12} className="text-[#9a6c37]" /> {getEventName(currentAssignment)}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays size={12} className="text-[#9a6c37]" />
            {new Date(currentAssignment.dutyDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
          </span>
          <span className="flex items-center gap-1">
            <Clock3 size={12} className="text-[#9a6c37]" />
            {formatTime24to12(currentAssignment.startTime)} - {formatTime24to12(currentAssignment.endTime)}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
          <span>Completion Progress</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-[#9a6c37] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* List */}
      <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {items.map((item, idx) => (
          <button
            key={item._id || idx}
            type="button"
            onClick={() => toggleItem(idx)}
            className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-xs transition active:scale-[0.99] ${
              item.completed
                ? "border-emerald-200 bg-emerald-50/50 text-emerald-900"
                : "border-gray-100 bg-[#fdfcfb] text-gray-800 hover:border-amber-200"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              {item.completed ? (
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              ) : (
                <Square size={18} className="shrink-0 text-gray-400" />
              )}
              <span className={`truncate font-medium ${item.completed ? "line-through text-gray-500" : ""}`}>
                {item.text}
              </span>
            </div>
            {item.completed && (
              <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                Done
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Add Custom Subtask Form */}
      <form onSubmit={handleAddItem} className="mt-4 flex gap-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add custom sub-task..."
          className="h-10 flex-1 rounded-xl border border-gray-200 px-3 text-xs outline-none focus:border-[#9a6c37] focus:ring-1 focus:ring-[#9a6c37]"
        />
        <button
          type="submit"
          disabled={!newItemText.trim() || loading}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#9a6c37] px-3.5 text-xs font-semibold text-white transition hover:bg-[#835b2e] disabled:opacity-50"
        >
          <Plus size={15} />
          <span>Add</span>
        </button>
      </form>
    </div>
  );
}


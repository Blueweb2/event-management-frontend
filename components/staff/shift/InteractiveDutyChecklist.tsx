"use client";

import { useState } from "react";
import { CheckSquare, Square, Plus, CheckCircle2, ListTodo, Sparkles } from "lucide-react";
import type { Assignment } from "@/types/assignment";
import { updateAssignment } from "@/lib/assignment.api";
import { useAuth } from "@/hooks/useAuth";

interface ChecklistItem {
  _id?: string;
  text: string;
  completed: boolean;
}

interface InteractiveDutyChecklistProps {
  assignment?: Assignment;
  onUpdate?: () => void;
}

const DEFAULT_SUBTASKS: Record<string, string[]> = {
  "Audio/Visual": ["Set up stage lights", "Soundcheck microphones", "Test main speakers & mixers", "Verify wireless frequency"],
  Catering: ["Inspect buffet layout", "Check food warmer temperatures", "Ensure cutlery sanitization", "Coordinate beverage bar setup"],
  Operations: ["Venue walkthrough", "Confirm emergency exits clear", "Brief team on timeline", "Coordinate vendor arrivals"],
  Default: ["Arrive 15 mins prior", "Check in with shift lead", "Inspect equipment", "Perform safety check", "Final area cleanup"],
};

export default function InteractiveDutyChecklist({
  assignment,
  onUpdate,
}: InteractiveDutyChecklistProps) {
  const { token } = useAuth();
  const [newItemText, setNewItemText] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize checklist items
  const initialItems: ChecklistItem[] = (assignment as any)?.checklist?.length
    ? (assignment as any).checklist
    : (DEFAULT_SUBTASKS[assignment?.role || "Default"] || DEFAULT_SUBTASKS.Default).map((text) => ({
        text,
        completed: false,
      }));

  const [items, setItems] = useState<ChecklistItem[]>(initialItems);

  const completedCount = items.filter((i) => i.completed).length;
  const progressPct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const saveChecklist = async (updatedItems: ChecklistItem[]) => {
    if (!assignment || !token) return;
    try {
      setLoading(true);
      await updateAssignment(assignment._id, { checklist: updatedItems }, token);
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

  if (!assignment) {
    return (
      <div className="rounded-2xl border border-[#e8e1d8] bg-white p-5 text-center text-gray-500 shadow-sm">
        <ListTodo size={24} className="mx-auto text-gray-400" />
        <p className="mt-2 text-sm font-semibold">No Duty Selected</p>
        <p className="mt-0.5 text-xs">Sub-task checklist will appear once a shift is assigned.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#9a6c37]">
          <ListTodo size={18} />
          <h2 className="text-base font-bold text-[#29241f]">Duty Sub-Task Checklist</h2>
        </div>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-[#9a6c37]">
          {completedCount}/{items.length} Done
        </span>
      </div>

      <p className="mt-1 text-xs text-[#756d64]">
        Sub-tasks for <span className="font-semibold text-[#29241f]">{assignment.dutyTitle}</span>
      </p>

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
      <div className="mt-4 space-y-2.5">
        {items.map((item, idx) => (
          <button
            key={idx}
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

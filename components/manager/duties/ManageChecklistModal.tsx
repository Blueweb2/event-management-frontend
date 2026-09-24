"use client";

import { useState, useEffect } from "react";
import {
  X,
  ListChecks,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  UserCheck,
  CalendarDays,
  MapPin,
  Clock3,
} from "lucide-react";
import type { Duty } from "./constants";

interface ManageChecklistModalProps {
  isOpen: boolean;
  duty: Duty | null;
  onClose: () => void;
  onSaveChecklist: (
    dutyId: string,
    checklist: Array<{ _id?: string; text: string; completed: boolean }>
  ) => Promise<void>;
}

const TEMPLATE_SUGGESTIONS: Record<string, string[]> = {
  catering: [
    "Inspect banquet buffet setups and warmers",
    "Verify VIP dietary & vegetarian arrangements",
    "Monitor beverage refill stations during reception",
    "Clear table plates & coordinate dessert service",
    "Pack remaining supplies & sanitize prep counter",
  ],
  decor: [
    "Assemble stage backdrop and floral arrangements",
    "Set up table centerpieces and place cards",
    "Check ambiance lighting and spotlight angles",
    "Inspect entrance welcome arch & signage",
    "Dismantle decor pieces safely post-event",
  ],
  av: [
    "Test stage wireless microphones & spare batteries",
    "Verify projector screen alignment and audio levels",
    "Cue background playlist during guest arrival",
    "Record keynote presentation & speeches",
    "Secure all floor cabling with safety gaffer tape",
  ],
  security: [
    "Verify guest check-in QR codes and passes",
    "Monitor emergency exit routes and crowd flow",
    "Escort VIP attendees to reserved seating section",
    "Perform periodic venue perimeter checks",
    "Secure lost & found items and conduct final sweep",
  ],
  hospitality: [
    "Greet arriving guests and distribute event brochures",
    "Direct attendees to main auditorium and restrooms",
    "Coordinate stage transitions with master of ceremonies",
    "Assist speakers with lapel microphones and cue cards",
    "Collect attendee feedback forms at departure",
  ],
};

export default function ManageChecklistModal({
  isOpen,
  duty,
  onClose,
  onSaveChecklist,
}: ManageChecklistModalProps) {
  const [items, setItems] = useState<
    Array<{ _id?: string; text: string; completed: boolean }>
  >([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTemplateTab, setActiveTemplateTab] = useState<string>("catering");

  useEffect(() => {
    if (duty) {
      setItems(duty.checklist ? [...duty.checklist] : []);
      // auto-detect template from department
      const dept = (duty.department || duty.serviceName || "").toLowerCase();
      if (dept.includes("cater") || dept.includes("food") || dept.includes("chef")) {
        setActiveTemplateTab("catering");
      } else if (dept.includes("decor") || dept.includes("flower") || dept.includes("stage")) {
        setActiveTemplateTab("decor");
      } else if (dept.includes("audio") || dept.includes("sound") || dept.includes("photo") || dept.includes("video")) {
        setActiveTemplateTab("av");
      } else if (dept.includes("security") || dept.includes("guard")) {
        setActiveTemplateTab("security");
      } else {
        setActiveTemplateTab("hospitality");
      }
    }
  }, [duty]);

  if (!isOpen || !duty) return null;

  const totalTasks = items.length;
  const completedTasks = items.filter((i) => i.completed).length;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleAddTask = (textToAdd?: string) => {
    const text = (textToAdd !== undefined ? textToAdd : newTaskText).trim();
    if (!text) return;
    setItems((prev) => [...prev, { text, completed: false }]);
    if (textToAdd === undefined) setNewTaskText("");
  };

  const handleToggleItem = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleDeleteItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveChecklist(duty.id, items);
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save checklist");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-[#e8e1d8] bg-white shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#eee7dc] bg-[#faf8f5] px-6 py-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg bg-[#29241f] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                <ListChecks size={13} className="text-[#d8a86c]" /> Event Day Subtasks
              </span>

              {duty.status === "ACCEPTED" && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-200">
                  <UserCheck size={12} /> Staff Confirmed
                </span>
              )}
            </div>

            <h2 className="mt-2 text-lg sm:text-xl font-black text-[#29241f]">
              {duty.title}
            </h2>
            <p className="text-xs font-semibold text-[#8d847b]">
              {duty.event} · Assigned to <span className="font-extrabold text-[#403a34]">{duty.staffName}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition border border-gray-200"
          >
            <X size={17} />
          </button>
        </div>

        {/* Shift Details Banner */}
        <div className="grid grid-cols-3 gap-2 border-b border-[#eee7dc] bg-[#faf8f5]/60 px-6 py-3 text-xs text-[#554e46]">
          <div className="flex items-center gap-1.5 truncate">
            <CalendarDays size={14} className="text-[#a7773f] shrink-0" />
            <span className="truncate">{duty.eventDate}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Clock3 size={14} className="text-[#a7773f] shrink-0" />
            <span className="truncate">{duty.startTime} - {duty.endTime}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <MapPin size={14} className="text-[#a7773f] shrink-0" />
            <span className="truncate">{duty.location || "Venue TBA"}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Real-time Sub-Task Progress Card */}
          <div className="rounded-2xl border border-[#e8e1d8] bg-linear-to-br from-[#faf7f2] to-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#9a6c37]">
                  Sub-Task Completion Progress
                </p>
                <p className="mt-0.5 text-sm font-black text-[#29241f]">
                  {completedTasks} of {totalTasks} Subtasks Completed
                </p>
              </div>

              <div className="text-right">
                <span className="text-xl font-black text-[#b8894b]">
                  {progressPercent}%
                </span>
                <p className="text-[10px] font-bold text-[#8d847b]">
                  {progressPercent === 100
                    ? "🎉 All Done!"
                    : progressPercent > 0
                    ? "In Progress"
                    : "Pending Start"}
                </p>
              </div>
            </div>

            {/* Progress Track */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progressPercent === 100
                    ? "bg-emerald-600"
                    : progressPercent > 50
                    ? "bg-[#b8894b]"
                    : "bg-amber-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* New Subtask Input Form */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-[#756d64]">
              Assign New Subtask to Staff Member
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Inspect buffet heaters 30 mins before dinner service..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
                className="flex-1 rounded-xl border border-[#d8cfc4] bg-white px-3.5 py-2.5 text-xs text-[#29241f] outline-none transition placeholder:text-gray-400 focus:border-[#a7773f] focus:ring-2 focus:ring-[#a7773f]/20"
              />

              <button
                type="button"
                onClick={() => handleAddTask()}
                disabled={!newTaskText.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#29241f] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-black disabled:opacity-40"
              >
                <Plus size={15} />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* One-Click Template Suggestions */}
          <div className="rounded-2xl border border-dashed border-[#d8cfc4] bg-[#faf8f5] p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#756d64] mb-2.5">
              <Sparkles size={14} className="text-[#a7773f]" />
              <span>Quick-Add Recommended Duty Subtasks</span>
            </div>

            {/* Template Selector Pills */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {Object.keys(TEMPLATE_SUGGESTIONS).map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => setActiveTemplateTab(category)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize transition ${
                    activeTemplateTab === category
                      ? "bg-[#29241f] text-white shadow-xs"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Template Items */}
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_SUGGESTIONS[activeTemplateTab]?.map((suggestion, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleAddTask(suggestion)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#e0d6ca] bg-white px-2.5 py-1 text-[11px] font-medium text-[#403a34] transition hover:border-[#a7773f] hover:bg-[#f7efe4]"
                >
                  <Plus size={11} className="text-[#a7773f]" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Checklist Items List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-extrabold uppercase tracking-wider text-[#756d64]">
                Event Day Subtasks ({items.length})
              </p>
              {items.length > 0 && (
                <span className="text-[10px] text-gray-500">
                  Staff will view and check off these tasks on the event day.
                </span>
              )}
            </div>

            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 py-8 text-center text-xs text-gray-400">
                No subtasks assigned yet. Use the input above or select quick templates.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={item._id || index}
                    className={`group flex items-center justify-between gap-3 rounded-xl border p-3 text-xs transition ${
                      item.completed
                        ? "border-emerald-200 bg-emerald-50/40 text-gray-500"
                        : "border-gray-200 bg-white text-[#29241f] hover:border-[#a7773f]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleItem(index)}
                      className="flex flex-1 items-start gap-2.5 text-left"
                    >
                      <span className="mt-0.5 shrink-0 text-emerald-600">
                        {item.completed ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <Circle size={16} className="text-gray-400 group-hover:text-[#a7773f]" />
                        )}
                      </span>
                      <div>
                        <p
                          className={`font-semibold ${
                            item.completed ? "line-through text-gray-400" : "text-[#29241f]"
                          }`}
                        >
                          {item.text}
                        </p>
                        <span className="text-[10px] font-bold">
                          {item.completed ? (
                            <span className="text-emerald-700">✓ Completed by Staff</span>
                          ) : (
                            <span className="text-amber-700">● Pending Execution</span>
                          )}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(index)}
                      title="Remove Subtask"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 border-t border-[#eee7dc] bg-[#faf8f5] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#29241f] px-6 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-black disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ListChecks size={14} />
            )}
            Save Sub-Tasks & Notify Staff
          </button>
        </div>
      </div>
    </div>
  );
}

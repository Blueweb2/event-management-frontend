"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Camera,
  Calendar,
  MapPin,
  CheckCircle2,
  Plus,
  RefreshCw,
  Loader2,
  ArrowRight,
  Package,
  Users,
} from "lucide-react";

import {
  getPhotographyEvents,
  getPhotographyEquipment,
  getPhotographyTasks,
  createPhotographyTask,
  type PhotographyEventItem,
  type DepartmentTask,
} from "@/lib/department.api";

interface PhotographyDashboardProps {
  token: string;
}

export default function PhotographyDashboard({ token }: PhotographyDashboardProps) {
  const [events, setEvents] = useState<PhotographyEventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [tasks, setTasks] = useState<DepartmentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [taskCreating, setTaskCreating] = useState(false);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [eventsRes, equipRes, tasksRes] = await Promise.all([
        getPhotographyEvents({}, token),
        getPhotographyEquipment(token),
        getPhotographyTasks("", token),
      ]);
      const loadedEvents = eventsRes.data || [];
      setEvents(loadedEvents);
      setEquipment(equipRes.data || []);
      setTasks(tasksRes.data || []);

      if (loadedEvents.length > 0 && !selectedEventId) {
        setSelectedEventId(loadedEvents[0].eventId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) void loadData();
  }, [token]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTaskTitle.trim()) return;

    const eventId = selectedEventId || (events.length > 0 ? events[0].eventId : "");
    if (!eventId) return;

    try {
      setTaskCreating(true);
      await createPhotographyTask(
        {
          eventId,
          title: newTaskTitle.trim(),
          dutyTitle: "Media Crew",
        },
        token
      );
      setNewTaskTitle("");
      const updated = await getPhotographyTasks("", token);
      setTasks(updated.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setTaskCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-[#e8e1d8] bg-white">
        <div className="flex items-center gap-3 text-sm font-semibold text-stone-600">
          <Loader2 size={20} className="animate-spin text-sky-600" />
          <span>Loading Photography Dashboard...</span>
        </div>
      </div>
    );
  }

  const pendingTasksCount = tasks.filter((t) => t.status !== "COMPLETED").length;

  return (
    <div className="space-y-6">
      {/* 1. Welcoming Header */}
      <section className="rounded-3xl border border-[#e8e1d8] bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 shadow-2xs shrink-0">
              <Camera size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-sky-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-900">
                  Photography & Media
                </span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500 font-medium">Photo & Cinematography</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#29241f] mt-0.5">
                Photography Overview
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage wedding shoots, drone coverage, camera gear, and crew assignments.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {/* 3 Snapshot Badges */}
        <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-4 pt-4 border-t border-[#f0ece6]">
          <div className="rounded-2xl bg-[#faf8f5] p-3 text-center border border-stone-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Scheduled Shoots
            </p>
            <p className="mt-0.5 text-xl sm:text-2xl font-black text-[#29241f]">
              {events.length}
            </p>
          </div>

          <div className="rounded-2xl bg-[#faf8f5] p-3 text-center border border-stone-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Camera Gear In Stock
            </p>
            <p className="mt-0.5 text-xl sm:text-2xl font-black text-sky-700">
              {equipment.length || "15"}
            </p>
          </div>

          <div className="rounded-2xl bg-[#faf8f5] p-3 text-center border border-stone-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Crew Tasks
            </p>
            <p className="mt-0.5 text-xl sm:text-2xl font-black text-amber-800">
              {pendingTasksCount}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Quick Action Shortcuts */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/manager/stock"
          className="group flex items-center justify-between rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-xs transition hover:border-sky-400"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700 group-hover:bg-sky-600 group-hover:text-white transition">
              <Package size={18} />
            </div>
            <div>
              <p className="text-xs font-black text-[#29241f]">Camera Gear & Stock</p>
              <p className="text-[11px] text-gray-500">Bodies, lenses, drones, lighting</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-gray-300 group-hover:text-sky-600 transition" />
        </Link>

        <Link
          href="/manager/staff"
          className="group flex items-center justify-between rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-xs transition hover:border-sky-400"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-800 group-hover:bg-[#29241f] group-hover:text-white transition">
              <Users size={18} />
            </div>
            <div>
              <p className="text-xs font-black text-[#29241f]">Media Crew</p>
              <p className="text-[11px] text-gray-500">Photographers & videographers</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-gray-300 group-hover:text-[#29241f] transition" />
        </Link>

        <Link
          href="/manager/events"
          className="group flex items-center justify-between rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-xs transition hover:border-sky-400"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white transition">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs font-black text-[#29241f]">Shoot Schedule</p>
              <p className="text-[11px] text-gray-500">Event dates & locations</p>
            </div>
          </div>
          <ArrowRight size={14} className="text-gray-300 group-hover:text-emerald-700 transition" />
        </Link>
      </section>

      {/* 3. Main Grid: Shoots (Left) + Crew Checklist (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events to Shoot */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-black text-[#29241f]">
            Upcoming Event Shoots
          </h2>

          {events.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-400">
              <Camera size={32} className="mx-auto text-gray-300" />
              <p className="mt-2 text-sm font-bold text-gray-700">No photography shoots scheduled</p>
              <p className="text-xs text-gray-400 mt-0.5">
                When new bookings require media coverage, they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => {
                const isSelected = selectedEventId === ev.eventId;
                return (
                  <div
                    key={ev.eventId}
                    onClick={() => setSelectedEventId(ev.eventId)}
                    className={`rounded-2xl border p-4 sm:p-5 transition cursor-pointer shadow-xs ${
                      isSelected
                        ? "border-sky-400 bg-sky-50/20"
                        : "border-[#e8e1d8] bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm sm:text-base font-black text-[#29241f]">
                            {ev.eventName}
                          </h3>
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                            {ev.status || "Confirmed"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                          <span className="flex items-center gap-1 text-sky-700 font-semibold">
                            <Calendar size={13} />
                            {new Date(ev.eventDate).toLocaleDateString()}
                          </span>
                          {ev.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={13} />
                              {ev.location}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/manager/events/${ev.eventId}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-900 transition self-start"
                      >
                        <span>Shoot Details</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>

                    {/* Services / Media tags */}
                    {ev.photoServices && ev.photoServices.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 pt-2.5 border-t border-gray-100">
                        {ev.photoServices.map((s, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg bg-sky-50 border border-sky-200/60 px-2 py-0.5 text-[11px] font-bold text-sky-800"
                          >
                            {s.serviceName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Media Checklist */}
        <div className="space-y-4">
          <h2 className="text-base font-black text-[#29241f]">
            Media Crew Checklist
          </h2>

          <div className="rounded-2xl border border-[#e8e1d8] bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
            <form onSubmit={handleCreateTask} className="flex gap-1.5">
              <input
                type="text"
                placeholder="e.g. Charge drone, format SD cards..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 h-9 rounded-xl border border-gray-200 px-3 text-xs outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                disabled={taskCreating || !newTaskTitle.trim()}
                className="h-9 px-3.5 rounded-xl bg-sky-700 text-white font-bold text-xs hover:bg-sky-800 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </form>

            <div className="space-y-2 pt-2 border-t border-gray-100 max-h-80 overflow-y-auto">
              {tasks.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center italic">
                  No media tasks added yet. Type a task above to track equipment & shoot prep!
                </p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200 bg-[#faf8f5] text-xs"
                  >
                    <span className="font-bold text-[#29241f]">{task.title}</span>
                    <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                      {task.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

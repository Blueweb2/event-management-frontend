"use client";

import { useEffect, useState } from "react";
import {
  Camera,
  Calendar,
  MapPin,
  Video,
  CheckCircle2,
  Clock,
  Layers,
  RefreshCw,
  Film,
  Tv,
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
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsRes, equipRes, tasksRes] = await Promise.all([
        getPhotographyEvents({}, token),
        getPhotographyEquipment(token),
        getPhotographyTasks("", token),
      ]);
      setEvents(eventsRes.data || []);
      setEquipment(equipRes.data || []);
      setTasks(tasksRes.data || []);
      if (eventsRes.data && eventsRes.data.length > 0) {
        setSelectedEventId(eventsRes.data[0].eventId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) void loadData();
  }, [token]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTaskTitle.trim() || !selectedEventId) return;

    try {
      await createPhotographyTask(
        {
          eventId: selectedEventId,
          title: newTaskTitle.trim(),
          dutyTitle: "Media & Camera Crew",
        },
        token
      );
      setNewTaskTitle("");
      const updated = await getPhotographyTasks("", token);
      setTasks(updated.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-sky-500/20 bg-gradient-to-br from-[#121924] via-[#0f141d] to-[#090d14] p-6 sm:p-8 shadow-2xl text-white">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400">
              <Camera size={14} />
              Photography & Cinematography Manager Console
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
              Photography Schedules & Media Production
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-400 max-w-xl">
              Manage 4K video recording, drone aerial shoots, teaser editing, client reels, and audio/visual camera kit readiness.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-gray-300 hover:bg-white/10"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Media Confirmed Events ({events.length})
          </h2>

          {events.map((ev) => {
            const isSelected = selectedEventId === ev.eventId;
            return (
              <div
                key={ev.eventId}
                onClick={() => setSelectedEventId(ev.eventId)}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  isSelected
                    ? "border-sky-500 bg-sky-500/5 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 shadow-sm"
                }`}
              >
                <h3 className="font-bold text-sm text-[#1F1F1F]">{ev.eventName}</h3>
                <div className="mt-2 space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-sky-600" />
                    <span>{new Date(ev.eventDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-sky-600" />
                    <span>{ev.location}</span>
                  </div>
                </div>

                <div className="mt-3 border-t border-gray-100 pt-2 flex flex-wrap gap-1">
                  {ev.photoServices.map((s, idx) => (
                    <span key={idx} className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                      {s.serviceName}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Equipment & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Equipment Status */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-extrabold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <Tv size={15} className="text-sky-600" />
              Camera, Audio & Video Equipment Kit Status
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Equipment Gear</th>
                    <th className="px-4 py-2.5 font-semibold">Available Units</th>
                    <th className="px-4 py-2.5 font-semibold">Total Inventory</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Kit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {equipment.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-bold text-gray-900">{item.name}</td>
                      <td className="px-4 py-2.5 font-semibold text-gray-800">
                        {item.availableQuantity} {item.unit}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">
                        {item.totalQuantity} {item.unit}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {item.isLowStock ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            Low Availability
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            Ready for Shoot
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shoot & Deliverable Tasks */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <Film size={15} className="text-sky-600" />
              Shoot Timeline & Editing Deliverables Checklist
            </h3>

            <form onSubmit={handleCreateTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Drone battery check, primary shoot, teaser reel export..."
                className="flex-1 h-9 rounded-xl border border-gray-200 px-3 text-xs outline-none"
              />
              <button
                type="submit"
                disabled={!selectedEventId}
                className="h-9 px-4 rounded-xl bg-sky-600 text-white font-bold text-xs hover:bg-sky-700"
              >
                Add Deliverable
              </button>
            </form>

            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50 text-xs">
                  <span className="font-medium text-gray-900">{task.title}</span>
                  <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

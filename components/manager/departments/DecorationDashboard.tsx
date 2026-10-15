"use client";

import { useEffect, useState } from "react";
import {
  Palette,
  Calendar,
  MapPin,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import {
  getDecorationEvents,
  getDecorationMaterials,
  getDecorationTasks,
  createDecorationTask,
  createDecorationPurchaseRequest,
  type DecorationEventItem,
  type DepartmentTask,
} from "@/lib/department.api";

interface DecorationDashboardProps {
  token: string;
}

export default function DecorationDashboard({ token }: DecorationDashboardProps) {
  const [events, setEvents] = useState<DecorationEventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [tasks, setTasks] = useState<DepartmentTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsRes, tasksRes] = await Promise.all([
        getDecorationEvents({}, token),
        getDecorationTasks("", token),
      ]);
      setEvents(eventsRes.data || []);
      setTasks(tasksRes.data || []);
      if (eventsRes.data && eventsRes.data.length > 0) {
        setSelectedEventId(eventsRes.data[0].eventId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load decoration data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) void loadData();
  }, [token]);

  useEffect(() => {
    if (!selectedEventId || !token) return;
    const fetchMaterials = async () => {
      try {
        const res = await getDecorationMaterials(selectedEventId, token);
        setMaterials(res.data.materials || []);
      } catch (err) {
        console.error(err);
      }
    };
    void fetchMaterials();
  }, [selectedEventId, token]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTaskTitle.trim() || !selectedEventId) return;

    try {
      await createDecorationTask(
        {
          eventId: selectedEventId,
          title: newTaskTitle.trim(),
          dutyTitle: "Decoration & Setup Crew",
        },
        token
      );
      setNewTaskTitle("");
      const updated = await getDecorationTasks("", token);
      setTasks(updated.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-rose-500/20 bg-gradient-to-br from-[#1e1518] via-[#171113] to-[#0e0a0c] p-6 sm:p-8 shadow-2xl text-white">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400">
              <Palette size={14} />
              Decoration & Stage Styling Manager Console
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
              Decoration Workflows & Setup Progress
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-400 max-w-xl">
              Track customer decor selections, floral arches, stage themes, warehouse decor inventory, and on-site setup tasks.
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
            Decoration Confirmed Events ({events.length})
          </h2>

          {events.map((ev) => {
            const isSelected = selectedEventId === ev.eventId;
            return (
              <div
                key={ev.eventId}
                onClick={() => setSelectedEventId(ev.eventId)}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  isSelected
                    ? "border-rose-500 bg-rose-500/5 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-300 shadow-sm"
                }`}
              >
                <h3 className="font-bold text-sm text-[#1F1F1F]">{ev.eventName}</h3>
                <div className="mt-2 space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-rose-600" />
                    <span>{new Date(ev.eventDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-rose-600" />
                    <span>{ev.location}</span>
                  </div>
                </div>

                <div className="mt-3 border-t border-gray-100 pt-2 flex flex-wrap gap-1">
                  {ev.decorServices.map((s, idx) => (
                    <span key={idx} className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                      {s.serviceName}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Materials & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Materials Availability */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="font-extrabold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <Package size={15} className="text-rose-600" />
              Warehouse Materials & Equipment Status (Decor, Linen, Furniture)
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Material Item</th>
                    <th className="px-4 py-2.5 font-semibold">Category</th>
                    <th className="px-4 py-2.5 font-semibold">Available Qty</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {materials.map((mat) => (
                    <tr key={mat.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-bold text-gray-900">{mat.name}</td>
                      <td className="px-4 py-2.5 text-gray-600">{mat.category}</td>
                      <td className="px-4 py-2.5 font-semibold text-gray-800">
                        {mat.availableQuantity} {mat.unit}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {mat.isLowStock ? (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                            Low Stock
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            Available
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Setup Tasks */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <Layers size={15} className="text-rose-600" />
              Decoration Setup & Teardown Checklist
            </h3>

            <form onSubmit={handleCreateTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Assemble stage arch, hang fairy lights, arrange entrance flowers..."
                className="flex-1 h-9 rounded-xl border border-gray-200 px-3 text-xs outline-none"
              />
              <button
                type="submit"
                disabled={!selectedEventId}
                className="h-9 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
              >
                Add Task
              </button>
            </form>

            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50 text-xs">
                  <span className="font-medium text-gray-900">{task.title}</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
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

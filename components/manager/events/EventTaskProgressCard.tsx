"use client";

import { CheckSquare, Clock, AlertTriangle, PlayCircle, CheckCircle2 } from "lucide-react";

interface EventTaskItem {
  dutyId: string;
  dutyTitle: string;
  dutyRole: string;
  staffName: string;
  taskId: string;
  title: string;
  description?: string;
  plannedStartAt?: string;
  plannedEndAt?: string;
  actualStartAt?: string;
  actualEndAt?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  completionNotes?: string;
  wasOverdue?: boolean;
  delayMinutes?: number;
}

interface EventTaskProgressCardProps {
  taskProgress: {
    tasks: EventTaskItem[];
    summary: {
      totalTasks: number;
      completedCount: number;
      inProgressCount: number;
      pendingCount: number;
      overdueCount: number;
      progressPercentage: number;
    };
  };
  loading?: boolean;
  onRefresh?: () => void;
}

export default function EventTaskProgressCard({
  taskProgress,
  loading = false,
  onRefresh,
}: EventTaskProgressCardProps) {
  const { tasks = [], summary = { totalTasks: 0, completedCount: 0, inProgressCount: 0, pendingCount: 0, overdueCount: 0, progressPercentage: 0 } } = taskProgress;

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "--:--";
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status: EventTaskItem["status"], wasOverdue?: boolean) => {
    if (status === "COMPLETED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Completed
        </span>
      );
    }
    if (status === "IN_PROGRESS") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
          <PlayCircle className="w-3.5 h-3.5" />
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
        <Clock className="w-3.5 h-3.5" />
        Pending
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-[#9a6c37]/20 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-[#29241f] flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#9a6c37]" />
            Event Task Execution Progress
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Real-time execution status of sub-tasks assigned to staff duties
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-[#9a6c37] transition-colors rounded-lg hover:bg-slate-100 self-start sm:self-auto"
            title="Refresh tasks"
          >
            <Clock className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>

      {/* Progress Bar & Stat Summary */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-600">Completion Status ({summary.progressPercentage}%)</span>
          <span className="text-slate-500">
            {summary.completedCount} of {summary.totalTasks} Tasks Finished
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${summary.progressPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3">
            <div className="text-xs text-emerald-600 font-medium">Completed</div>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">{summary.completedCount}</div>
          </div>
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3">
            <div className="text-xs text-blue-600 font-medium">In Progress</div>
            <div className="text-xl font-bold text-blue-700 mt-0.5">{summary.inProgressCount}</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-xs text-slate-500 font-medium">Pending</div>
            <div className="text-xl font-bold text-slate-700 mt-0.5">{summary.pendingCount}</div>
          </div>
          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3">
            <div className="text-xs text-amber-600 font-medium">Overdue / Delayed</div>
            <div className="text-xl font-bold text-amber-700 mt-0.5">{summary.overdueCount}</div>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      {tasks.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-sm">
          No sub-tasks configured for staff duties in this event.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Task Details</th>
                <th className="py-3 px-4">Assigned Staff</th>
                <th className="py-3 px-4">Duty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Planned Time</th>
                <th className="py-3 px-4">Actual Execution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {tasks.map((task) => (
                <tr key={`${task.dutyId}-${task.taskId}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-slate-400 mt-0.5">{task.description}</div>
                    )}
                    {task.completionNotes && (
                      <div className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-1 border border-emerald-100">
                        Note: {task.completionNotes}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-700">{task.staffName}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">{task.dutyTitle}</td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(task.status, task.wasOverdue)}
                    {task.wasOverdue && (
                      <div className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" />
                        Delayed +{task.delayMinutes}m
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    {task.plannedStartAt || task.plannedEndAt ? (
                      <div>
                        {formatTime(task.plannedStartAt)} - {formatTime(task.plannedEndAt)}
                      </div>
                    ) : (
                      <span className="text-slate-400">Flex</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    <div>Start: {formatTime(task.actualStartAt)}</div>
                    {task.actualEndAt && <div>End: {formatTime(task.actualEndAt)}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

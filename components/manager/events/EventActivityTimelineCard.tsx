"use client";

import { Activity, Clock, User, CheckCircle2, AlertCircle, PlayCircle, PauseCircle, CheckSquare } from "lucide-react";

interface ActivityItem {
  _id?: string;
  type?: string;
  description: string;
  performedBy?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  timestamp: string;
}

interface EventActivityTimelineCardProps {
  activities: ActivityItem[];
  loading?: boolean;
  onRefresh?: () => void;
}

export default function EventActivityTimelineCard({
  activities = [],
  loading = false,
  onRefresh,
}: EventActivityTimelineCardProps) {
  const getActivityIcon = (description: string) => {
    const descLower = description.toLowerCase();
    if (descLower.includes("started by") || descLower.includes("started event")) {
      return <PlayCircle className="w-4 h-4 text-emerald-500" />;
    }
    if (descLower.includes("clocked in")) {
      return <User className="w-4 h-4 text-blue-500" />;
    }
    if (descLower.includes("paused")) {
      return <PauseCircle className="w-4 h-4 text-amber-500" />;
    }
    if (descLower.includes("resumed")) {
      return <PlayCircle className="w-4 h-4 text-emerald-500" />;
    }
    if (descLower.includes("clocked out")) {
      return <CheckCircle2 className="w-4 h-4 text-slate-500" />;
    }
    if (descLower.includes("task")) {
      return <CheckSquare className="w-4 h-4 text-purple-500" />;
    }
    return <Activity className="w-4 h-4 text-[#9a6c37]" />;
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="rounded-2xl border border-[#9a6c37]/20 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-[#29241f] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#9a6c37]" />
            Operational Audit Log & Activity Timeline
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Complete chronological history of event lifecycle, staff attendance, shift pauses, and task executions
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-[#9a6c37] transition-colors rounded-lg hover:bg-slate-100 self-start sm:self-auto"
            title="Refresh activity log"
          >
            <Clock className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          No activity logs recorded for this event yet.
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-100 ml-4 space-y-6 py-2">
          {activities.map((act, index) => (
            <div key={act._id || index} className="relative pl-7 group">
              <div className="absolute -left-[17px] top-0.5 p-1 rounded-full bg-white border border-slate-200 shadow-xs group-hover:border-[#9a6c37] transition-colors">
                {getActivityIcon(act.description)}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
                <div className="font-semibold text-slate-800">{act.description}</div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDateTime(act.timestamp)}
                </div>
              </div>

              {act.performedBy?.name && (
                <div className="text-xs text-slate-500 mt-0.5">
                  Action performed by: <span className="font-medium text-slate-700">{act.performedBy.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

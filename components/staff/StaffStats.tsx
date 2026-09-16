import { CalendarDays, CheckCircle2, ClipboardList, Clock3 } from "lucide-react";
import type { Assignment } from "@/types/assignment";
import type { Attendance } from "@/types/attendance";

export default function StaffStats({ assignments, attendance }: { assignments: Assignment[]; attendance: Attendance[] }) {
  const pending = assignments.filter((item) => !["COMPLETED", "CANCELLED"].includes(item.status)).length;
  const completed = assignments.filter((item) => item.status === "COMPLETED").length;
  const hours = attendance.reduce((total, item) => {
    if (!item.checkIn || !item.checkOut) return total;
    return total + (new Date(item.checkOut).getTime() - new Date(item.checkIn).getTime()) / 3600000;
  }, 0);
  const eventCount = new Set(assignments.map((item) => typeof item.event === "string" ? item.event : item.event._id)).size;
  const stats = [
    { label: "Pending Duties", value: pending, icon: ClipboardList, color: "text-amber-600 bg-amber-50" },
    { label: "Assigned Events", value: eventCount, icon: CalendarDays, color: "text-blue-600 bg-blue-50" },
    { label: "Completed", value: completed, icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
    { label: "Recorded Hours", value: `${hours.toFixed(1)} hrs`, icon: Clock3, color: "text-purple-600 bg-purple-50" },
  ];
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{stats.map((stat) => { const Icon = stat.icon; return <div key={stat.label} className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm"><div className="flex items-center justify-between gap-2"><span className="text-xs font-medium text-gray-500">{stat.label}</span><div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}><Icon size={16} /></div></div><p className="mt-3 text-2xl font-bold text-[#29241f]">{stat.value}</p></div>; })}</div>;
}

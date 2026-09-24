import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import type { Assignment } from "@/types/assignment";

export default function StaffUpcomingEvents({ assignments }: { assignments: Assignment[] }) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const events = Array.from(
    new Map(assignments.map((item) => [typeof item.event === "string" ? item.event : item.event._id, item])).values()
  )
    .filter((item) => {
      const dateStr = typeof item.event === "object" ? item.event?.eventDate : null;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      const eventEnd = new Date(d);
      eventEnd.setHours(23, 59, 59, 999);
      return eventEnd.getTime() >= todayStart.getTime();
    })
    .sort((a, b) => {
      const dateA = typeof a.event === "object" && a.event?.eventDate ? new Date(a.event.eventDate).getTime() : 0;
      const dateB = typeof b.event === "object" && b.event?.eventDate ? new Date(b.event.eventDate).getTime() : 0;
      return dateA - dateB;
    })
    .slice(0, 4);
  return <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm"><div className="flex items-center justify-between pb-4"><div><h2 className="text-base font-bold text-[#29241f]">Upcoming Events</h2><p className="text-xs text-[#756d64]">Events linked to your assignments</p></div><Link href="/staff/events" className="text-xs font-semibold text-[#9a6c37] hover:underline">View All</Link></div>{events.length === 0 ? <p className="rounded-xl bg-[#fdfcfb] p-4 text-sm text-gray-500">No assigned events yet.</p> : <div className="space-y-3">{events.map((item) => { const event = typeof item.event === "string" ? null : item.event; return <div key={item._id} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-[#fdfcfb] p-3.5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5ede3] text-[#9a6c37]"><CalendarDays size={18} /></div><div className="min-w-0"><h3 className="truncate text-sm font-bold text-[#29241f]">{event?.eventName || "Assigned event"}</h3><p className="mt-1 text-xs text-gray-500">{event?.eventDate ? new Date(event.eventDate).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "Date pending"}</p><div className="mt-1 flex items-center gap-1 text-[11px] text-gray-400"><MapPin size={11} />{event?.location || "Location pending"}</div></div></div>; })}</div>}</section>;
}

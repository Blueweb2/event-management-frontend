import {
  CheckCircle2,
  ClipboardCheck,
  XCircle,
} from "lucide-react";

import { bookingStatusReports } from "./constants";

export default function BookingStatusReport() {
  const completed =
    bookingStatusReports.find(
      (item) => item.status === "Completed"
    )?.count ?? 0;

  const cancelled =
    bookingStatusReports.find(
      (item) => item.status === "Cancelled"
    )?.count ?? 0;

  const total = completed + cancelled;

  const completionRate =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      <div className="border-b border-[#eee8e1] p-5">
        <h2 className="text-base font-bold text-[#29241f]">
          Booking Status
        </h2>

        <p className="mt-1 text-xs text-[#8d847b]">
          Completed and cancelled booking overview.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 p-5">
        <div className="rounded-xl bg-[#edf5ed] p-4">
          <CheckCircle2
            size={18}
            className="text-[#557555]"
          />

          <p className="mt-3 text-2xl font-bold text-[#29241f]">
            {completed}
          </p>

          <p className="mt-1 text-xs text-[#557555]">
            Completed
          </p>
        </div>

        <div className="rounded-xl bg-[#f9e9df] p-4">
          <XCircle
            size={18}
            className="text-[#9a5b3f]"
          />

          <p className="mt-3 text-2xl font-bold text-[#29241f]">
            {cancelled}
          </p>

          <p className="mt-1 text-xs text-[#9a5b3f]">
            Cancelled
          </p>
        </div>
      </div>

      <div className="mx-5 mb-5 rounded-xl border border-[#eee8e1] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck
              size={15}
              className="text-[#a7773f]"
            />

            <p className="text-xs font-semibold text-[#5f574f]">
              Completion rate
            </p>
          </div>

          <p className="text-xs font-bold text-[#29241f]">
            {completionRate}%
          </p>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eee8e1]">
          <div
            className="h-full rounded-full bg-[#7d9b7d]"
            style={{
              width: `${completionRate}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
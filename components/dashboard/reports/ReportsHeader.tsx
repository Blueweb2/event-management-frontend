import { BarChart3, Download } from "lucide-react";

export default function ReportsHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
            <BarChart3 size={18} />
          </div>

          <p className="text-sm font-semibold text-[#9a6c37]">
            Manager Reports
          </p>
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#29241f] sm:text-3xl">
          Reports & Analytics
        </h1>

        <p className="mt-1 text-sm leading-6 text-[#756d64]">
          Track revenue, bookings, events and customer activity.
        </p>
      </div>

      <button
        type="button"
        className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-full border border-[#ded5cb] bg-white px-4 text-xs font-semibold text-[#5f574f] transition hover:border-[#b8894b] hover:bg-[#f8f3ec]"
      >
        <Download size={15} />
        Export Report
      </button>
    </div>
  );
}
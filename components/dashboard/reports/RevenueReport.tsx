import { ArrowUpRight, IndianRupee, TrendingUp } from "lucide-react";

import { monthlyReports } from "./constants";

export default function RevenueReport() {
  const maxRevenue = Math.max(
    ...monthlyReports.map((item) => item.revenue)
  );

  const totalRevenue = monthlyReports.reduce(
    (total, item) => total + item.revenue,
    0
  );

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#eee8e1] p-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
              <IndianRupee size={17} />
            </div>

            <div>
              <h2 className="text-base font-bold text-[#29241f]">
                Revenue
              </h2>

              <p className="mt-0.5 text-xs text-[#8d847b]">
                Revenue performance by month.
              </p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs text-[#9b938a]">
            Period total
          </p>

          <p className="mt-1 text-sm font-bold text-[#29241f]">
            ₹{(totalRevenue / 100000).toFixed(2)}L
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-5">
        <div className="flex h-56 items-end gap-3 sm:gap-5">
          {monthlyReports.map((item) => {
            const height = Math.max(
              Math.round((item.revenue / maxRevenue) * 100),
              8
            );

            return (
              <div
                key={item.month}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <p className="text-[10px] font-semibold text-[#756d64]">
                  ₹{Math.round(item.revenue / 1000)}K
                </p>

                <div className="flex h-full w-full items-end">
                  <div
                    className="w-full rounded-t-lg bg-[#b8894b] transition hover:bg-[#a7773f]"
                    style={{
                      height: `${height}%`,
                    }}
                  />
                </div>

                <p className="text-[10px] font-medium text-[#9b938a]">
                  {item.month}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#fdfbf8] p-3">
          <TrendingUp
            size={15}
            className="text-[#557555]"
          />

          <p className="text-xs text-[#756d64]">
            Revenue is tracking positively across recent months.
          </p>

          <ArrowUpRight
            size={14}
            className="ml-auto text-[#9a6c37]"
          />
        </div>
      </div>
    </section>
  );
}
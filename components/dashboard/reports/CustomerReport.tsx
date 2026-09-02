import {
  UserRoundCheck,
  UserRoundPlus,
  Users,
} from "lucide-react";

import { reportSummary } from "./constants";

export default function CustomerReport() {
  const returningCustomers = 42;
  const newCustomers = 54;
  const activeCustomers = 81;

  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
      <div className="border-b border-[#eee8e1] p-5">
        <h2 className="text-base font-bold text-[#29241f]">
          Customer Statistics
        </h2>

        <p className="mt-1 text-xs text-[#8d847b]">
          Overview of your customer base.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 p-5">
        <CustomerStat
          icon={Users}
          label="Total Customers"
          value={reportSummary.totalCustomers}
        />

        <CustomerStat
          icon={UserRoundCheck}
          label="Active Customers"
          value={activeCustomers}
        />

        <CustomerStat
          icon={UserRoundPlus}
          label="New Customers"
          value={newCustomers}
        />

        <CustomerStat
          icon={Users}
          label="Returning"
          value={returningCustomers}
        />
      </div>

      <div className="mx-5 mb-5 rounded-xl bg-[#fdfbf8] p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-[#756d64]">
            Returning customer rate
          </p>

          <p className="text-sm font-bold text-[#29241f]">
            {Math.round(
              (returningCustomers /
                reportSummary.totalCustomers) *
                100
            )}
            %
          </p>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eee8e1]">
          <div
            className="h-full rounded-full bg-[#7d9b7d]"
            style={{
              width: `${Math.round(
                (returningCustomers /
                  reportSummary.totalCustomers) *
                  100
              )}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}

function CustomerStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-[#eee8e1] bg-[#fdfbf8] p-4">
      <Icon
        size={17}
        className="text-[#a7773f]"
      />

      <p className="mt-3 text-xl font-bold text-[#29241f]">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-[#8d847b]">
        {label}
      </p>
    </div>
  );
}
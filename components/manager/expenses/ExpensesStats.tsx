import {
  CircleDollarSign,
  Clock3,
  Receipt,
  Wallet,
} from "lucide-react";

import type { Expense } from "./constants";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function ExpensesStats({ expenses }: { expenses: Expense[] }) {
  const totalAmount = expenses.reduce((total, expense) => total + expense.amount, 0);
  const paidAmount = expenses.filter((expense) => expense.status === "Paid").reduce((total, expense) => total + expense.amount, 0);
  const pendingAmount = expenses.filter((expense) => expense.status === "Pending").reduce((total, expense) => total + expense.amount, 0);

  const stats = [
    {
      label: "Total Expenses",
      value: formatCurrency(totalAmount),
      count: `${expenses.length} records`,
      icon: Receipt,
    },
    {
      label: "Paid",
      value: formatCurrency(paidAmount),
      count: "Paid expenses",
      icon: Wallet,
    },
    {
      label: "Pending",
      value: formatCurrency(pendingAmount),
      count: "Outstanding",
      icon: Clock3,
    },
    {
      label: "Average Expense",
      value: formatCurrency(
        expenses.length
          ? totalAmount / expenses.length
          : 0
      ),
      count: "Per expense",
      icon: CircleDollarSign,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article
            key={stat.label}
            className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#756d64]">
                  {stat.label}
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-[#29241f]">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-[#9b938a]">
                  {stat.count}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
                <Icon size={19} />
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
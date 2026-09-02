import Link from "next/link";
import {
  CalendarPlus,
  ClipboardPlus,
  UserPlus,
  Utensils,
  ListPlus,
  WalletCards,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const quickActions: QuickAction[] = [
  {
    title: "New Booking",
    description: "Create a customer booking",
    href: "/booking",
    icon: CalendarPlus,
  },
  {
    title: "Add Event",
    description: "Schedule a new event",
    href: "/dashboard/events",
    icon: ClipboardPlus,
  },
  {
    title: "Add Customer",
    description: "Create a customer profile",
    href: "/dashboard/customers",
    icon: UserPlus,
  },
  {
    title: "Manage Food",
    description: "Update food options",
    href: "/dashboard/food",
    icon: Utensils,
  },
  {
    title: "Assign Duty",
    description: "Assign staff duties",
    href: "/dashboard/duties",
    icon: ListPlus,
  },
  {
    title: "Add Expense",
    description: "Record an event expense",
    href: "/dashboard/expenses",
    icon: WalletCards,
  },
];

export default function QuickActions() {
  return (
    <section className="rounded-2xl border border-[#e8e1d8] bg-white p-5 shadow-sm">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#29241f]">
          Quick Actions
        </h2>

        <p className="mt-1 text-sm text-[#756d64]">
          Quickly access common tasks.
        </p>
      </div>

      {/* Actions */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center gap-3 rounded-xl border border-[#eee8e1] p-3 transition-all duration-200 hover:border-[#d7c4aa] hover:bg-[#fdfbf8]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f7efe4] text-[#a7773f] transition group-hover:bg-[#b8894b] group-hover:text-white">
                <Icon size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#29241f]">
                  {action.title}
                </p>

                <p className="mt-0.5 truncate text-xs text-[#8d847b]">
                  {action.description}
                </p>
              </div>

              <ArrowRight
                size={15}
                className="shrink-0 text-[#b9afa4] transition-transform group-hover:translate-x-0.5 group-hover:text-[#9a6c37]"
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
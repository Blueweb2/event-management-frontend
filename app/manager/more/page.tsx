import Link from "next/link";
import {
  BarChart3,
  ClipboardList,
  DollarSign,
  Settings,
  Utensils,
  Users,
} from "lucide-react";

const menuItems = [
  {
    label: "Customers",
    description: "Manage customer profiles and history",
    href: "/dashboard/customers",
    icon: Users,
  },
  {
    label: "Expenses",
    description: "Track event-related expenses",
    href: "/dashboard/expenses",
    icon: DollarSign,
  },
  {
    label: "Food",
    description: "Manage food and menu options",
    href: "/dashboard/food",
    icon: Utensils,
  },
  {
    label: "Duties",
    description: "Manage staff duties",
    href: "/dashboard/duties",
    icon: ClipboardList,
  },
  {
    label: "Reports",
    description: "View business performance",
    href: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    label: "Settings",
    description: "Manage dashboard settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function MorePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#9a6c37]">
          Manager
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#29241f]">
          More
        </h1>

        <p className="mt-2 text-sm text-[#756d64]">
          Additional management tools and settings.
        </p>
      </div>

      <div className="grid gap-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm transition hover:border-[#d7c4aa] hover:bg-[#fdfbf8]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
                <Icon size={20} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#29241f]">
                  {item.label}
                </p>

                <p className="mt-1 text-xs text-[#8d847b]">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
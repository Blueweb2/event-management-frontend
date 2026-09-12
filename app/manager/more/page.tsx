import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  DollarSign,
  Settings,
  Users,
  UserRound,
  Utensils,
} from "lucide-react";

// ==========================================
// Menu Items
// ==========================================

const menuItems = [
  {
    label: "Clients",
    description: "Manage client profiles and history",
    href: "/manager/clients",
    icon: UserRound,
  },
  {
    label: "Events",
    description: "Manage confirmed events and schedules",
    href: "/manager/events",
    icon: CalendarDays,
  },
  {
    label: "Staff",
    description: "Manage staff members and profiles",
    href: "/manager/staff",
    icon: Users,
  },
  {
    label: "Assignments",
    description: "Assign staff to events and duties",
    href: "/manager/assignments",
    icon: ClipboardList,
  },
  {
    label: "Expenses",
    description: "Track event-related expenses",
    href: "/manager/expenses",
    icon: DollarSign,
  },
  {
    label: "Food",
    description: "Manage food and menu options",
    href: "/manager/food",
    icon: Utensils,
  },
  {
    label: "Reports",
    description: "View business performance",
    href: "/manager/reports",
    icon: BarChart3,
  },
  {
    label: "Settings",
    description: "Manage dashboard settings",
    href: "/manager/settings",
    icon: Settings,
  },
];

// ==========================================
// More Page
// ==========================================

export default function MorePage() {
  return (
    <div className="space-y-6">
      {/* ======================================
          Header
      ====================================== */}

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

      {/* ======================================
          Menu
      ====================================== */}

      <div className="grid gap-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm transition hover:border-[#d7c4aa] hover:bg-[#fdfbf8]"
            >
              {/* ==================================
                  Icon
              ================================== */}

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f7efe4] text-[#a7773f]">
                <Icon size={20} />
              </div>

              {/* ==================================
                  Content
              ================================== */}

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
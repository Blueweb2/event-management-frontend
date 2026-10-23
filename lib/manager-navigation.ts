import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  BriefcaseBusiness,
  Utensils,
  Package,
  Users,
  Wallet,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { AuthUser } from "@/types/auth";

export interface ManagerMenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  description?: string;
}

export type DepartmentScopeType =
  | "superadmin"
  | "kitchen"
  | "decoration"
  | "photography"
  | "sound_lighting"
  | "logistics"
  | "operations"
  | "marketing"
  | "general";

export interface ManagerScopeInfo {
  isSuperAdmin: boolean;
  isChefManager: boolean;
  isMarketingManager: boolean;
  canViewClientPayments: boolean;
  departmentType: DepartmentScopeType;
  roleTitle: string;
  departmentDisplay: string;
  badgeColor: string;
}

/**
 * Identify manager scope based on authenticated user's role and department
 */
export function getManagerScope(user: AuthUser | null): ManagerScopeInfo {
  const role = (user?.role || "").toLowerCase().trim();
  const dept = (user?.department || "").toLowerCase().trim();

  // Super Admin / Admin
  if (role === "superadmin" || role === "admin") {
    return {
      isSuperAdmin: true,
      isChefManager: false,
      isMarketingManager: false,
      canViewClientPayments: true,
      departmentType: "superadmin",
      roleTitle: "Super Admin",
      departmentDisplay: "All Departments",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
    };
  }

  // Marketing & Promotions Manager
  if (
    role.includes("market") ||
    dept.includes("market") ||
    dept.includes("promo")
  ) {
    return {
      isSuperAdmin: false,
      isChefManager: false,
      isMarketingManager: true,
      canViewClientPayments: false,
      departmentType: "marketing",
      roleTitle: "Marketing Manager",
      departmentDisplay: user?.department || "Marketing & Promotions",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-200",
    };
  }

  // Chef / Kitchen Manager
  if (
    dept.includes("kitchen") ||
    dept.includes("catering") ||
    dept.includes("chef") ||
    dept.includes("cook") ||
    dept.includes("food")
  ) {
    return {
      isSuperAdmin: false,
      isChefManager: true,
      isMarketingManager: false,
      canViewClientPayments: false,
      departmentType: "kitchen",
      roleTitle: "Chef Manager",
      departmentDisplay: user?.department || "Kitchen Department",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
    };
  }

  // Decoration Manager
  if (
    dept.includes("decor") ||
    dept.includes("styling") ||
    dept.includes("stage") ||
    dept.includes("flower")
  ) {
    return {
      isSuperAdmin: false,
      isChefManager: false,
      isMarketingManager: false,
      canViewClientPayments: false,
      departmentType: "decoration",
      roleTitle: "Decoration Manager",
      departmentDisplay: user?.department || "Decoration Department",
      badgeColor: "bg-indigo-100 text-indigo-900 border-indigo-200",
    };
  }

  // Photography / Media Manager
  if (
    dept.includes("photo") ||
    dept.includes("video") ||
    dept.includes("media")
  ) {
    return {
      isSuperAdmin: false,
      isChefManager: false,
      isMarketingManager: false,
      canViewClientPayments: false,
      departmentType: "photography",
      roleTitle: "Photography Manager",
      departmentDisplay: user?.department || "Photography & Media",
      badgeColor: "bg-sky-100 text-sky-900 border-sky-200",
    };
  }

  // Sound & Lighting
  if (
    dept.includes("sound") ||
    dept.includes("light") ||
    dept.includes("audio") ||
    dept.includes("dj")
  ) {
    return {
      isSuperAdmin: false,
      isChefManager: false,
      isMarketingManager: false,
      canViewClientPayments: false,
      departmentType: "sound_lighting",
      roleTitle: "Sound & Lighting Manager",
      departmentDisplay: user?.department || "Sound & Lighting",
      badgeColor: "bg-purple-100 text-purple-900 border-purple-200",
    };
  }

  // Logistics
  if (
    dept.includes("logistic") ||
    dept.includes("transport") ||
    dept.includes("warehouse")
  ) {
    return {
      isSuperAdmin: false,
      isChefManager: false,
      isMarketingManager: false,
      canViewClientPayments: false,
      departmentType: "logistics",
      roleTitle: "Logistics Manager",
      departmentDisplay: user?.department || "Logistics",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-200",
    };
  }

  // Operations Manager
  if (dept.includes("operation")) {
    return {
      isSuperAdmin: false,
      isChefManager: false,
      isMarketingManager: false,
      canViewClientPayments: false,
      departmentType: "operations",
      roleTitle: "Operations Manager",
      departmentDisplay: user?.department || "Operations",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
    };
  }

  // Generic Department Manager
  return {
    isSuperAdmin: false,
    isChefManager: false,
    isMarketingManager: false,
    canViewClientPayments: false,
    departmentType: "general",
    roleTitle: user?.department ? `${user.department} Manager` : "Department Manager",
    departmentDisplay: user?.department || "Department",
    badgeColor: "bg-gray-100 text-gray-800 border-gray-200",
  };
}

/**
 * Returns whether the user is a Marketing Manager
 */
export function isMarketingManager(user: AuthUser | null): boolean {
  if (!user) return false;
  const role = (user.role || "").toLowerCase().trim();
  const dept = (user.department || "").toLowerCase().trim();

  return (
    role.includes("market") ||
    dept.includes("market") ||
    dept.includes("promo")
  );
}

/**
 * Determines whether the user is authorized to view Client Payment Overview and Payment Status.
 * Strictly restricted to Super Admin only - no other managers including marketing manager can see this.
 */
export function canViewClientPayments(user: AuthUser | null): boolean {
  if (!user) return false;
  const role = (user.role || "").toLowerCase().trim();

  // Super Admin / Admin ONLY
  return role === "superadmin" || role === "admin";
}

/**
 * Determines whether the user is authorized to view or manage event expenses.
 * All managers are authorized to view and add event operational expenses.
 */
export function canViewExpenses(user: AuthUser | null): boolean {
  if (!user) return false;
  return true;
}

/**
 * Returns strictly department-authorized menu items for the slide-out navigation menu
 */
export function getAuthorizedMenuItems(user: AuthUser | null): ManagerMenuItem[] {
  const scope = getManagerScope(user);

  // 1. Super Admin / Executive Operations — Organization-wide menus
  if (scope.isSuperAdmin || scope.departmentType === "operations") {
    return [
      {
        label: "Dashboard",
        href: "/manager",
        icon: LayoutDashboard,
      },
      {
        label: "Events",
        href: "/manager/events",
        icon: CalendarCheck,
      },
      {
        label: "Services",
        href: "/manager/services",
        icon: BriefcaseBusiness,
      },
      {
        label: "Food Menu",
        href: "/manager/food",
        icon: Utensils,
      },
      {
        label: "Stock & Equipment",
        href: "/manager/stock",
        icon: Package,
      },
      {
        label: "Staff Members",
        href: "/manager/staff",
        icon: Users,
      },
      {
        label: "Expenses",
        href: "/manager/expenses",
        icon: Wallet,
      },
      {
        label: "Reports",
        href: "/manager/reports",
        icon: BarChart3,
      },
      {
        label: "Settings",
        href: "/manager/settings",
        icon: Settings,
      },
    ];
  }

  // 2. Chef Manager — Strictly Chef & Kitchen related menus ONLY
  if (scope.departmentType === "kitchen") {
    return [
      {
        label: "Kitchen Console",
        href: "/manager",
        icon: LayoutDashboard,
        badge: "Console",
      },
      {
        label: "Food Menu",
        href: "/manager/food",
        icon: Utensils,
      },
      {
        label: "Kitchen Stock & Supplies",
        href: "/manager/stock",
        icon: Package,
      },
      {
        label: "Kitchen Staff",
        href: "/manager/staff",
        icon: Users,
      },
      {
        label: "Event Catering",
        href: "/manager/events",
        icon: CalendarCheck,
      },
    ];
  }

  // 3. Decoration Manager — Strictly Decoration & Styling related menus
  if (scope.departmentType === "decoration") {
    return [
      {
        label: "Decoration Console",
        href: "/manager",
        icon: LayoutDashboard,
        badge: "Console",
      },
      {
        label: "Events & Setups",
        href: "/manager/events",
        icon: CalendarCheck,
      },
      {
        label: "Decor Services",
        href: "/manager/services",
        icon: BriefcaseBusiness,
      },
      {
        label: "Decor Inventory & Props",
        href: "/manager/stock",
        icon: Package,
      },
      {
        label: "Decor Staff",
        href: "/manager/staff",
        icon: Users,
      },
    ];
  }

  // 4. Photography / Media Manager — Strictly Photography & Media related menus
  if (scope.departmentType === "photography") {
    return [
      {
        label: "Media Console",
        href: "/manager",
        icon: LayoutDashboard,
        badge: "Console",
      },
      {
        label: "Event Shoots",
        href: "/manager/events",
        icon: CalendarCheck,
      },
      {
        label: "Media Packages",
        href: "/manager/services",
        icon: BriefcaseBusiness,
      },
      {
        label: "Camera & Gear Stock",
        href: "/manager/stock",
        icon: Package,
      },
      {
        label: "Media Staff",
        href: "/manager/staff",
        icon: Users,
      },
    ];
  }

  // 5. Marketing & Promotions Manager — Marketing Console, Events, Services, Staff
  if (scope.departmentType === "marketing") {
    return [
      {
        label: "Marketing Console",
        href: "/manager",
        icon: LayoutDashboard,
        badge: "Console",
      },
      {
        label: "Events",
        href: "/manager/events",
        icon: CalendarCheck,
      },
      {
        label: "Services",
        href: "/manager/services",
        icon: BriefcaseBusiness,
      },
      {
        label: "Staff Members",
        href: "/manager/staff",
        icon: Users,
      },
    ];
  }

  // 6. Sound & Lighting, Logistics, or other specific service departments
  return [
    {
      label: "Department Dashboard",
      href: "/manager",
      icon: LayoutDashboard,
    },
    {
      label: "Events",
      href: "/manager/events",
      icon: CalendarCheck,
    },
    {
      label: "Services",
      href: "/manager/services",
      icon: BriefcaseBusiness,
    },
    {
      label: "Equipment & Stock",
      href: "/manager/stock",
      icon: Package,
    },
    {
      label: "Staff Members",
      href: "/manager/staff",
      icon: Users,
    },
  ];
}

/**
 * Returns strictly department-authorized 4-item bottom navigation for mobile
 */
export function getAuthorizedBottomNavItems(user: AuthUser | null): Array<{
  label: string;
  href: string;
  icon: LucideIcon;
}> {
  const scope = getManagerScope(user);

  // Chef Manager: Home, Food, Stock, Staff
  if (scope.departmentType === "kitchen") {
    return [
      {
        label: "Console",
        href: "/manager",
        icon: LayoutDashboard,
      },
      {
        label: "Food Menu",
        href: "/manager/food",
        icon: Utensils,
      },
      {
        label: "Stock",
        href: "/manager/stock",
        icon: Package,
      },
      {
        label: "Staff",
        href: "/manager/staff",
        icon: Users,
      },
    ];
  }

  // Decoration Manager: Home, Events, Services, Staff
  if (scope.departmentType === "decoration") {
    return [
      {
        label: "Console",
        href: "/manager",
        icon: LayoutDashboard,
      },
      {
        label: "Events",
        href: "/manager/events",
        icon: CalendarDays,
      },
      {
        label: "Services",
        href: "/manager/services",
        icon: BriefcaseBusiness,
      },
      {
        label: "Staff",
        href: "/manager/staff",
        icon: Users,
      },
    ];
  }

  // Photography Manager: Home, Events, Services, Staff
  if (scope.departmentType === "photography") {
    return [
      {
        label: "Console",
        href: "/manager",
        icon: LayoutDashboard,
      },
      {
        label: "Events",
        href: "/manager/events",
        icon: CalendarDays,
      },
      {
        label: "Services",
        href: "/manager/services",
        icon: BriefcaseBusiness,
      },
      {
        label: "Staff",
        href: "/manager/staff",
        icon: Users,
      },
    ];
  }

  // Marketing Manager: Console, Events, Services, Staff
  if (scope.departmentType === "marketing") {
    return [
      {
        label: "Console",
        href: "/manager",
        icon: LayoutDashboard,
      },
      {
        label: "Events",
        href: "/manager/events",
        icon: CalendarDays,
      },
      {
        label: "Services",
        href: "/manager/services",
        icon: BriefcaseBusiness,
      },
      {
        label: "Staff",
        href: "/manager/staff",
        icon: Users,
      },
    ];
  }

  // Generic department managers: Home, Events, Stock, Staff
  if (!scope.isSuperAdmin && scope.departmentType !== "operations") {
    return [
      {
        label: "Home",
        href: "/manager",
        icon: LayoutDashboard,
      },
      {
        label: "Events",
        href: "/manager/events",
        icon: CalendarDays,
      },
      {
        label: "Stock",
        href: "/manager/stock",
        icon: Package,
      },
      {
        label: "Staff",
        href: "/manager/staff",
        icon: Users,
      },
    ];
  }

  // Super Admin / Operations: Home, Events, Staff, Expenses
  return [
    {
      label: "Home",
      href: "/manager",
      icon: LayoutDashboard,
    },
    {
      label: "Events",
      href: "/manager/events",
      icon: CalendarDays,
    },
    {
      label: "Staff",
      href: "/manager/staff",
      icon: Users,
    },
    {
      label: "Expenses",
      href: "/manager/expenses",
      icon: Wallet,
    },
  ];
}

/**
 * Validates if the requested pathname is permitted for the logged-in manager
 */
export function isRouteAuthorizedForUser(
  pathname: string,
  user: AuthUser | null
): { authorized: boolean; reason?: string } {
  if (!user) {
    return { authorized: true };
  }

  const scope = getManagerScope(user);

  // Superadmin and Executive Operations can access all manager pages
  if (scope.isSuperAdmin || scope.departmentType === "operations") {
    return { authorized: true };
  }

  // Base manager dashboard is always authorized
  if (pathname === "/manager" || pathname === "/manager/") {
    return { authorized: true };
  }

  // Routes strictly prohibited for non-executive managers:
  // Expenses (financials), Reports (financial analytics), Settings (global system settings)
  if (pathname.startsWith("/manager/expenses")) {
    return {
      authorized: false,
      reason: "Expenses and financial disbursement records are restricted to Super Admin and Finance administrators.",
    };
  }

  if (pathname.startsWith("/manager/reports")) {
    return {
      authorized: false,
      reason: "Organization-wide analytics and financial reports are restricted to Super Admin.",
    };
  }

  if (pathname.startsWith("/manager/settings")) {
    return {
      authorized: false,
      reason: "System settings and global company configuration are restricted to Super Admin.",
    };
  }

  if (pathname.startsWith("/manager/booking") || pathname.startsWith("/manager/estimates") || pathname.startsWith("/manager/clients")) {
    return {
      authorized: false,
      reason: "Booking creation, estimates, and client contracts are managed by Sales and Event Operations.",
    };
  }

  // Food Menu: ONLY Chef / Kitchen / Catering managers are authorized
  if (pathname.startsWith("/manager/food")) {
    if (scope.departmentType !== "kitchen") {
      return {
        authorized: false,
        reason: "The Food Menu catalog is restricted to the Kitchen & Catering department.",
      };
    }
  }

  // Services: Chef Manager has no decor/photo/dj services
  if (pathname.startsWith("/manager/services")) {
    if (scope.departmentType === "kitchen") {
      return {
        authorized: false,
        reason: "Services and client packages are not relevant to the Kitchen Department. Culinary items are managed under Food Menu.",
      };
    }
  }

  return { authorized: true };
}

"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  X,
  Edit,
  Utensils,
  Palette,
  Camera,
  Music,
  Coffee,
  Layers,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import {
  getManagers,
  createManager,
  updateManager,
  updateManagerStatus,
} from "@/lib/auth.api";
import type {
  ManagerItem,
  CreateManagerPayload,
  UpdateManagerPayload,
} from "@/types/auth";
import {
  validateFullName,
  validateUsername,
  validateEmail,
  validatePassword,
  validatePhone,
  generateUsernameSuggestion,
} from "@/lib/user-validation";

const DEPARTMENT_OPTIONS = [
  {
    label: "Kitchen / Chef",
    value: "Kitchen",
    icon: Utensils,
    color: "text-amber-800 border-amber-200 bg-amber-50",
  },
  {
    label: "Decoration",
    value: "Decoration",
    icon: Palette,
    color: "text-rose-800 border-rose-200 bg-rose-50",
  },
  {
    label: "Photography & Media",
    value: "Photography",
    icon: Camera,
    color: "text-sky-800 border-sky-200 bg-sky-50",
  },
  // {
  //   label: "Sound & Lighting",
  //   value: "Sound & Lighting",
  //   icon: Music,
  //   color: "text-purple-800 border-purple-200 bg-purple-50",
  // },
   {
    label: "Marketing & Promotions",
    value: "Marketing & Promotions",
    icon: Layers,
    color: "text-emerald-800 border-emerald-200 bg-emerald-50",
  },

  {
    label: "Catering Service",
    value: "Catering",
    icon: Coffee,
    color: "text-orange-800 border-orange-200 bg-orange-50",
  },
  {
    label: "General Operations",
    value: "Operations",
    icon: Layers,
    color: "text-emerald-800 border-emerald-200 bg-emerald-50",
  },
];

const PERMISSION_OPTIONS = [
  {
    id: "kitchen:view_events",
    label: "View Kitchen Events",
    depts: ["Kitchen", "Operations"],
  },
  {
    id: "kitchen:manage_recipes",
    label: "Manage Recipes & Yields",
    depts: ["Kitchen", "Operations"],
  },
  {
    id: "kitchen:calculate_ingredients",
    label: "Calculate Ingredient Requirements",
    depts: ["Kitchen", "Operations"],
  },
  {
    id: "kitchen:create_purchase_request",
    label: "Submit Kitchen Purchase Requisitions",
    depts: ["Kitchen", "Operations"],
  },
  {
    id: "kitchen:manage_prep_tasks",
    label: "Manage Kitchen Preparation Tasks",
    depts: ["Kitchen", "Operations"],
  },
  {
    id: "decoration:view_events",
    label: "View Decoration Events",
    depts: ["Decoration", "Operations"],
  },

  {
    id: "decoration:view_materials",
    label: "Check Decor Materials Availability",
    depts: ["Decoration", "Operations"],
  },
  {
    id: "decoration:create_purchase_request",
    label: "Submit Material Purchase Requisitions",
    depts: ["Decoration", "Operations"],
  },
  {
    id: "decoration:manage_setup_tasks",
    label: "Manage Decor Setup Tasks",
    depts: ["Decoration", "Operations"],
  },
  {
    id: "photography:view_events",
    label: "View Photography Packages & Schedules",
    depts: ["Photography", "Operations"],
  },
  {
    id: "photography:view_equipment",
    label: "Check AV Equipment Readiness",
    depts: ["Photography", "Operations"],
  },
  {
    id: "photography:manage_shoot_tasks",
    label: "Manage Shoot & Media Delivery Tasks",
    depts: ["Photography", "Operations"],
  },

  {
    id: "staff:manage",
    label: "Staff Duty & Task Management",
    depts: [
      "Kitchen",
      "Decoration",
      "Photography",
      "Marketing & Promotions",
      "Catering",
      "Operations",
    ],
  },
];

const getDefaultPermissionsForDept = (dept: string): string[] => {
  return PERMISSION_OPTIONS.filter((p) => p.depts.includes(dept)).map(
    (p) => p.id
  );
};

export default function DepartmentManagersTab() {
  const { token, user } = useAuth();
  const isSuperAdmin = (user?.role || "").toLowerCase() === "superadmin";

  const [managers, setManagers] = useState<ManagerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">(
    "ALL"
  );
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Create Form State
  const [formData, setFormData] = useState<CreateManagerPayload>({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    location: "",
    department: "Kitchen",
    permissions: getDefaultPermissionsForDept("Kitchen"),
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState<ManagerItem | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateManagerPayload>({
    name: "",
    phone: "",
    location: "",
    department: "Kitchen",
    permissions: [],
  });

  // Fetch managers
  const fetchManagersList = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getManagers(token);
      setManagers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load managers directory"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      void fetchManagersList();
    }
  }, [token]);

  // Form Handlers (Create)
  const handleInputChange = (
    field: keyof CreateManagerPayload,
    value: string
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "department") {
        next.permissions = getDefaultPermissionsForDept(value);
      }
      return next;
    });
    if (modalError) setModalError(null);
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData((prev) => {
      const current = prev.permissions || [];
      const updated = current.includes(permissionId)
        ? current.filter((p) => p !== permissionId)
        : [...current, permissionId];
      return { ...prev, permissions: updated };
    });
  };

  const handleNameBlur = () => {
    if (formData.name && !formData.username) {
      const generated = generateUsernameSuggestion(formData.name);
      setFormData((prev) => ({ ...prev, username: generated }));
    }
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const nameErr = validateFullName(formData.name);
    if (nameErr) {
      setModalError(nameErr);
      return;
    }

    const usernameErr = validateUsername(formData.username);
    if (usernameErr) {
      setModalError(usernameErr);
      return;
    }

    const emailErr = validateEmail(formData.email);
    if (emailErr) {
      setModalError(emailErr);
      return;
    }

    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) {
      setModalError(phoneErr);
      return;
    }

    const passwordErr = validatePassword(formData.password);
    if (passwordErr) {
      setModalError(passwordErr);
      return;
    }

    if (!formData.department?.trim()) {
      setModalError("Please select an operational department for this manager.");
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError(null);

      const created = await createManager(
        {
          name: formData.name.trim(),
          username: formData.username.trim().toLowerCase(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: formData.phone?.trim() || "",
          location: formData.location?.trim() || "",
          department: formData.department?.trim() || "Kitchen",
          permissions: formData.permissions || [],
        },
        token
      );

      setSuccessMessage(
        `Manager account for "${created.name}" created successfully with ${created.department} department privileges.`
      );
      setIsModalOpen(false);
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        phone: "",
        location: "",
        department: "Kitchen",
        permissions: getDefaultPermissionsForDept("Kitchen"),
      });

      await fetchManagersList();
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Failed to create manager"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (m: ManagerItem) => {
    setEditingManager(m);
    setEditFormData({
      name: m.name,
      phone: m.phone || "",
      location: m.location || "",
      department: m.department || "Kitchen",
      permissions:
        m.permissions && m.permissions.length > 0
          ? m.permissions
          : getDefaultPermissionsForDept(m.department || "Kitchen"),
    });
    setModalError(null);
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (
    field: keyof UpdateManagerPayload,
    value: string
  ) => {
    setEditFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "department") {
        next.permissions = getDefaultPermissionsForDept(value);
      }
      return next;
    });
    if (modalError) setModalError(null);
  };

  const handleEditPermissionToggle = (permissionId: string) => {
    setEditFormData((prev) => {
      const current = prev.permissions || [];
      const updated = current.includes(permissionId)
        ? current.filter((p) => p !== permissionId)
        : [...current, permissionId];
      return { ...prev, permissions: updated };
    });
  };

  const handleUpdateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingManager) return;

    if (editFormData.name) {
      const nameErr = validateFullName(editFormData.name);
      if (nameErr) {
        setModalError(nameErr);
        return;
      }
    }

    if (editFormData.phone) {
      const phoneErr = validatePhone(editFormData.phone);
      if (phoneErr) {
        setModalError(phoneErr);
        return;
      }
    }

    if (!editFormData.department?.trim()) {
      setModalError("Operational department cannot be empty.");
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError(null);

      await updateManager(
        editingManager.id,
        {
          name: editFormData.name?.trim(),
          phone: editFormData.phone?.trim(),
          location: editFormData.location?.trim(),
          department: editFormData.department?.trim(),
          permissions: editFormData.permissions || [],
        },
        token
      );

      setSuccessMessage(
        `Department and permissions for "${editFormData.name}" updated successfully.`
      );
      setIsEditModalOpen(false);
      setEditingManager(null);
      await fetchManagersList();
    } catch (err) {
      setModalError(
        err instanceof Error ? err.message : "Failed to update manager"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status toggle
  const handleToggleStatus = async (m: ManagerItem) => {
    if (!token) return;
    const newStatus = !m.isActive;
    const confirmText = newStatus
      ? `Reactivate account for manager "${m.name}"?`
      : `Suspend all access for manager "${m.name}"?`;

    if (!window.confirm(confirmText)) return;

    try {
      await updateManagerStatus(m.id, newStatus, token);
      setSuccessMessage(
        `Manager ${m.name} has been ${newStatus ? "reactivated" : "suspended"}.`
      );
      await fetchManagersList();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update manager status"
      );
    }
  };

  // Filtered managers
  const filteredManagers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return managers.filter((m) => {
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.username.toLowerCase().includes(q) ||
        (m.department || "").toLowerCase().includes(q) ||
        (m.location || "").toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && m.isActive) ||
        (statusFilter === "INACTIVE" && !m.isActive);

      const matchesDept =
        departmentFilter === "ALL" ||
        (m.department || "")
          .toLowerCase()
          .includes(departmentFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [managers, searchQuery, statusFilter, departmentFilter]);

  const stats = useMemo(() => {
    const total = managers.length;
    const active = managers.filter((m) => m.isActive).length;
    const suspended = total - active;
    const deptCount = new Set(
      managers.map((m) => m.department).filter(Boolean)
    ).size;
    return { total, active, suspended, deptCount };
  }, [managers]);

  const getDeptBadge = (dept = "") => {
    const found = DEPARTMENT_OPTIONS.find(
      (d) => d.value.toLowerCase() === dept.toLowerCase()
    );
    return (
      found || {
        label: dept || "Operations",
        value: dept,
        icon: Layers,
        color: "text-emerald-800 border-emerald-200 bg-emerald-50",
      }
    );
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-amber-200 bg-amber-50/60 p-8 sm:p-12 text-center shadow-xs">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-[#9A7B4F] mb-4 shadow-xs">
          <ShieldCheck size={28} />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900">
          Super Admin Privileges Required
        </h3>
        <p className="mt-1 text-xs text-gray-600 max-w-md">
          Department manager provisioning, cross-department role configuration, and scoped permission assignments are restricted to authenticated Super Admin accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* =========================================================
          SUPERADMIN OVERVIEW & ACTION BAR
      ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-[#e8e1d8] bg-white p-5 sm:p-7 shadow-xs">
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
              <ShieldCheck size={14} className="text-[#9A7B4F]" />
              Super Admin Exclusive Access Control
            </div>

            <h2 className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-[#29241f]">
              Department Managers & Scoped Roles
            </h2>

            <p className="mt-1 text-xs sm:text-sm text-gray-600 max-w-2xl leading-relaxed">
              Create, configure, and isolate department managers across Kitchen, Decoration, Photography, Sound, and Operations. Department managers only access workflows and inventory within their assigned boundary.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={fetchManagersList}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 text-xs font-bold text-gray-700 shadow-2xs transition hover:bg-gray-50 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                size={13}
                className={loading ? "animate-spin text-[#9A7B4F]" : "text-gray-500"}
              />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setModalError(null);
                setIsModalOpen(true);
              }}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#29241f] hover:bg-black px-4 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
            >
              <UserPlus size={15} className="text-amber-300" />
              <span>Create Department Manager</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-gray-100 pt-5">
          <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-3.5 shadow-2xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-900 border border-indigo-200 shrink-0">
              <Users size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-indigo-700/80 uppercase tracking-wider">
                Total Managers
              </p>
              <p className="text-xl font-black text-indigo-950 mt-0.5">{stats.total}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3.5 shadow-2xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-700/80 uppercase tracking-wider">
                Active Officers
              </p>
              <p className="text-xl font-black text-emerald-950 mt-0.5">{stats.active}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/40 p-3.5 shadow-2xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-800 border border-rose-200 shrink-0">
              <XCircle size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-rose-700/80 uppercase tracking-wider">
                Suspended
              </p>
              <p className="text-xl font-black text-rose-950 mt-0.5">{stats.suspended}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50/40 p-3.5 shadow-2xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
              <Layers size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-amber-700/80 uppercase tracking-wider">
                Depts Covered
              </p>
              <p className="text-xl font-black text-amber-950 mt-0.5">{stats.deptCount || 1}</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          ALERTS
      ========================================================= */}
      {successMessage && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-700 hover:text-rose-950 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =========================================================
          SEARCH & FILTERS
      ========================================================= */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, department, location..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-xs text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F] shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 outline-none focus:border-[#9A7B4F] shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            <option value="Kitchen">Kitchen / Chef</option>
            <option value="Decoration">Decoration</option>
            <option value="Photography">Photography</option>
            <option value="Sound & Lighting">Sound & Lighting</option>
            <option value="Catering">Catering</option>
            <option value="Operations">Operations</option>
          </select>

          {/* Status Filter */}
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`h-10 rounded-xl px-3.5 text-xs font-bold transition cursor-pointer ${
                statusFilter === filter
                  ? "bg-[#29241f] text-white shadow-2xs"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter === "ALL"
                ? "All Status"
                : filter === "ACTIVE"
                ? "Active"
                : "Suspended"}
            </button>
          ))}
        </div>
      </section>

      {/* =========================================================
          MANAGERS DIRECTORY GRID
      ========================================================= */}
      <section>
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-[#e8e1d8] bg-white shadow-xs">
            <Loader2 size={32} className="animate-spin text-[#9A7B4F]" />
            <p className="mt-3 text-xs font-medium text-gray-500">
              Loading managers directory...
            </p>
          </div>
        ) : filteredManagers.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white text-center p-6 shadow-xs">
            <Users size={32} className="text-gray-400 mb-2" />
            <p className="text-sm font-bold text-gray-800">No managers found</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              {searchQuery || statusFilter !== "ALL" || departmentFilter !== "ALL"
                ? "Try adjusting your search criteria or filters."
                : "No manager accounts provisioned yet. Click Create Department Manager above."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredManagers.map((m) => {
              const deptBadge = getDeptBadge(m.department);
              const DeptIcon = deptBadge.icon;

              return (
                <div
                  key={m.id}
                  className="group relative flex flex-col justify-between rounded-3xl border border-[#e8e1d8] bg-white p-5 shadow-xs transition-all duration-300 hover:border-[#9a6c37] hover:shadow-md"
                >
                  <div>
                    {/* Top Row: User Avatar & Department Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#9A7B4F] to-[#D2B47A] text-sm font-black text-white shadow-xs">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-[#29241f] text-sm group-hover:text-[#9A7B4F] transition truncate">
                            {m.name}
                          </h3>
                          <p className="text-xs text-gray-500">@{m.username}</p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold border ${deptBadge.color}`}
                      >
                        <DeptIcon size={11} />
                        {deptBadge.label}
                      </span>
                    </div>

                    {/* Metadata fields */}
                    <div className="mt-4 space-y-2 border-t border-gray-100 pt-3 text-xs text-gray-600">
                      <div className="flex items-center gap-2 truncate">
                        <Mail size={13} className="shrink-0 text-[#9A7B4F]" />
                        <span className="truncate">{m.email}</span>
                      </div>

                      {m.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="shrink-0 text-[#9A7B4F]" />
                          <span>{m.phone}</span>
                        </div>
                      )}

                      {m.location && (
                        <div className="flex items-center gap-2 truncate">
                          <MapPin size={13} className="shrink-0 text-[#9A7B4F]" />
                          <span className="truncate">{m.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Permissions tags */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {m.permissions && m.permissions.length > 0 ? (
                        m.permissions.slice(0, 3).map((p) => (
                          <span
                            key={p}
                            className="rounded-md bg-stone-100 px-2 py-0.5 text-[9px] font-semibold text-stone-700 border border-stone-200"
                          >
                            {p.replace(/_/g, " ")}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">
                          Default permissions
                        </span>
                      )}
                      {m.permissions && m.permissions.length > 3 && (
                        <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-[#9A7B4F] border border-amber-200">
                          +{m.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Actions */}
                  <div className="mt-5 border-t border-gray-100 pt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(m)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-white hover:border-[#9A7B4F] hover:text-[#29241f] shadow-2xs cursor-pointer"
                    >
                      <Edit size={12} className="text-[#9A7B4F]" />
                      <span>Edit Access</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(m)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        m.isActive
                          ? "text-rose-600 hover:bg-rose-50 border border-rose-200/60"
                          : "text-emerald-700 hover:bg-emerald-50 border border-emerald-200/60"
                      }`}
                    >
                      {m.isActive ? "Suspend" : "Reactivate"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================================================
          REGISTER NEW MANAGER MODAL
      ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            onClick={() => !isSubmitting && setIsModalOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-xl rounded-3xl border border-[#e8e1d8] bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-[#29241f] max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#9A7B4F] to-[#D2B47A] text-white shadow-xs">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#29241f]">
                    Create Department Manager
                  </h2>
                  <p className="text-xs text-gray-500">
                    Assign role, operational department, and scoped system permissions.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateManager} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    onBlur={handleNameBlur}
                    placeholder="e.g. Marco Silva"
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    placeholder="e.g. marco_chef"
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="marco@eventmanagement.com"
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700">
                    Initial Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-3 pr-10 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700">
                    Assigned Location / Branch
                  </label>
                  <input
                    type="text"
                    value={formData.location || ""}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="e.g. Central Banquet Hall"
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F]"
                  />
                </div>
              </div>

              {/* Department Selection */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700">
                  Assigned Operational Department *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DEPARTMENT_OPTIONS.map((dept) => {
                    const isSelected = formData.department === dept.value;
                    const Icon = dept.icon;
                    return (
                      <button
                        key={dept.value}
                        type="button"
                        onClick={() => handleInputChange("department", dept.value)}
                        className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? "border-[#9A7B4F] bg-amber-50 text-amber-950 font-bold shadow-xs"
                            : "border-gray-200 bg-stone-50/60 text-gray-600 hover:bg-stone-100 hover:text-gray-900"
                        }`}
                      >
                        <Icon
                          size={14}
                          className={isSelected ? "text-[#9A7B4F]" : "text-gray-400"}
                        />
                        <span className="truncate">{dept.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scoped Permissions Checklist */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700">
                  Granted Department Permissions
                </label>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-200 bg-stone-50/60 p-3 space-y-2">
                  {PERMISSION_OPTIONS.map((perm) => {
                    const isChecked = (formData.permissions || []).includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-gray-900"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handlePermissionToggle(perm.id)}
                          className="rounded border-gray-300 text-[#9A7B4F] focus:ring-[#9A7B4F]"
                        />
                        <span>{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#29241f] hover:bg-black px-5 py-2 text-xs font-bold text-white shadow-md shadow-gray-900/10 transition hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{isSubmitting ? "Creating..." : "Provision Manager Account"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          EDIT MANAGER DEPARTMENT & ACCESS MODAL
      ========================================================= */}
      {isEditModalOpen && editingManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            onClick={() => !isSubmitting && setIsEditModalOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-xl rounded-3xl border border-[#e8e1d8] bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-[#29241f] max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-[#9A7B4F] shadow-xs">
                  <Edit size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#29241f]">
                    Edit Department & Scoped Permissions
                  </h2>
                  <p className="text-xs text-gray-500">
                    Modifying {editingManager.name} (@{editingManager.username})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !isSubmitting && setIsEditModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateManager} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => handleEditInputChange("name", e.target.value)}
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 outline-none focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone || ""}
                    onChange={(e) => handleEditInputChange("phone", e.target.value)}
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 outline-none focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700">
                  Assigned Location / Branch
                </label>
                <input
                  type="text"
                  value={editFormData.location || ""}
                  onChange={(e) => handleEditInputChange("location", e.target.value)}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs text-gray-900 outline-none focus:border-[#9A7B4F] focus:ring-1 focus:ring-[#9A7B4F]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700">
                  Change Operational Department
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DEPARTMENT_OPTIONS.map((dept) => {
                    const isSelected = editFormData.department === dept.value;
                    const Icon = dept.icon;
                    return (
                      <button
                        key={dept.value}
                        type="button"
                        onClick={() =>
                          handleEditInputChange("department", dept.value)
                        }
                        className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-semibold transition cursor-pointer ${
                          isSelected
                            ? "border-[#9A7B4F] bg-amber-50 text-amber-950 font-bold shadow-xs"
                            : "border-gray-200 bg-stone-50/60 text-gray-600 hover:bg-stone-100 hover:text-gray-900"
                        }`}
                      >
                        <Icon
                          size={14}
                          className={isSelected ? "text-[#9A7B4F]" : "text-gray-400"}
                        />
                        <span className="truncate">{dept.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-700">
                  Scoped Permissions
                </label>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-stone-50/60 p-3 space-y-2">
                  {PERMISSION_OPTIONS.map((perm) => {
                    const isChecked = (editFormData.permissions || []).includes(
                      perm.id
                    );
                    return (
                      <label
                        key={perm.id}
                        className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer hover:text-gray-900"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleEditPermissionToggle(perm.id)}
                          className="rounded border-gray-300 text-[#9A7B4F] focus:ring-[#9A7B4F]"
                        />
                        <span>{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#29241f] hover:bg-black px-5 py-2 text-xs font-bold text-white shadow-md shadow-gray-900/10 transition hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

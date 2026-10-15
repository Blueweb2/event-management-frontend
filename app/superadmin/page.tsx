"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  Phone,
  Building2,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  Calendar,
  Sparkles,
  X,
  UserCheck,
  Briefcase,
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
import type { ManagerItem, CreateManagerPayload, UpdateManagerPayload } from "@/types/auth";

const DEPARTMENT_OPTIONS = [
  { label: "Kitchen / Chef", value: "Kitchen", icon: Utensils, color: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  { label: "Decoration", value: "Decoration", icon: Palette, color: "text-rose-400 border-rose-500/30 bg-rose-500/10" },
  { label: "Photography & Media", value: "Photography", icon: Camera, color: "text-sky-400 border-sky-500/30 bg-sky-500/10" },
  { label: "Sound & Lighting", value: "Sound & Lighting", icon: Music, color: "text-purple-400 border-purple-500/30 bg-purple-500/10" },
  { label: "Catering Service", value: "Catering", icon: Coffee, color: "text-orange-400 border-orange-500/30 bg-orange-500/10" },
  { label: "General Operations", value: "Operations", icon: Layers, color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
];

const PERMISSION_OPTIONS = [
  { id: "kitchen:view_events", label: "View Kitchen Events", depts: ["Kitchen", "Operations"] },
  { id: "kitchen:manage_recipes", label: "Manage Recipes & Yields", depts: ["Kitchen", "Operations"] },
  { id: "kitchen:calculate_ingredients", label: "Calculate Ingredient Requirements", depts: ["Kitchen", "Operations"] },
  { id: "kitchen:create_purchase_request", label: "Submit Kitchen Purchase Requisitions", depts: ["Kitchen", "Operations"] },
  { id: "kitchen:manage_prep_tasks", label: "Manage Kitchen Preparation Tasks", depts: ["Kitchen", "Operations"] },
  { id: "decoration:view_events", label: "View Decoration Events", depts: ["Decoration", "Operations"] },
  { id: "decoration:view_materials", label: "Check Decor Materials Availability", depts: ["Decoration", "Operations"] },
  { id: "decoration:create_purchase_request", label: "Submit Material Purchase Requisitions", depts: ["Decoration", "Operations"] },
  { id: "decoration:manage_setup_tasks", label: "Manage Decor Setup Tasks", depts: ["Decoration", "Operations"] },
  { id: "photography:view_events", label: "View Photography Packages & Schedules", depts: ["Photography", "Operations"] },
  { id: "photography:view_equipment", label: "Check AV Equipment Readiness", depts: ["Photography", "Operations"] },
  { id: "photography:manage_shoot_tasks", label: "Manage Shoot & Media Delivery Tasks", depts: ["Photography", "Operations"] },
  { id: "staff:manage", label: "Staff Duty & Task Management", depts: ["Kitchen", "Decoration", "Photography", "Sound & Lighting", "Catering", "Operations"] },
];

const getDefaultPermissionsForDept = (dept: string): string[] => {
  return PERMISSION_OPTIONS.filter((p) => p.depts.includes(dept)).map((p) => p.id);
};

export default function SuperadminManagersPage() {
  const { token, user } = useAuth();

  const [managers, setManagers] = useState<ManagerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
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
  const handleInputChange = (field: keyof CreateManagerPayload, value: string) => {
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
      const generated = formData.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .slice(0, 20);
      setFormData((prev) => ({ ...prev, username: generated }));
    }
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formData.name.trim()) {
      setModalError("Manager full name is required");
      return;
    }
    if (!formData.username.trim() || formData.username.trim().length < 3) {
      setModalError("Username must be at least 3 characters");
      return;
    }
    if (!formData.email.trim()) {
      setModalError("Valid email address is required");
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setModalError("Password must be at least 6 characters");
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
      permissions: m.permissions && m.permissions.length > 0
        ? m.permissions
        : getDefaultPermissionsForDept(m.department || "Kitchen"),
    });
    setModalError(null);
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (field: keyof UpdateManagerPayload, value: string) => {
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
        (m.department || "").toLowerCase().includes(departmentFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [managers, searchQuery, statusFilter, departmentFilter]);

  const stats = useMemo(() => {
    const total = managers.length;
    const active = managers.filter((m) => m.isActive).length;
    const suspended = total - active;
    return { total, active, suspended };
  }, [managers]);

  const getDeptBadge = (dept = "") => {
    const found = DEPARTMENT_OPTIONS.find(
      (d) => d.value.toLowerCase() === dept.toLowerCase()
    );
    return found || {
      label: dept || "Operations",
      value: dept,
      icon: Layers,
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    };
  };

  return (
    <div className="space-y-8 pb-12">
      {/* =========================================================
          PAGE HEADER & METRICS
      ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#18181b] via-[#121214] to-[#09090b] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-[#9A7B4F]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#9A7B4F]/30 bg-[#9A7B4F]/10 px-3 py-1 text-xs font-semibold text-[#D2B47A]">
              <ShieldCheck size={14} />
              Executive System Administration & Department Scoping
            </div>

            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Department Managers & Access Control
            </h1>

            <p className="mt-1.5 text-sm text-gray-400 max-w-2xl leading-relaxed">
              Create, configure, and isolate department managers across Kitchen, Decoration, Photography, Sound, and Operations. Department managers only access workflows and inventory within their assigned boundary.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={fetchManagersList}
              disabled={loading}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-xs font-semibold text-gray-200 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setModalError(null);
                setIsModalOpen(true);
              }}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#9A7B4F] to-[#D2B47A] px-5 text-xs font-bold text-black shadow-lg shadow-[#9A7B4F]/20 transition hover:scale-[1.02] active:scale-95"
            >
              <UserPlus size={16} />
              <span>Create Department Manager</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="relative z-10 mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-6">
          <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#9A7B4F]/20 text-[#D2B47A]">
              <Users size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Total Managers</p>
              <p className="text-2xl font-bold text-white mt-0.5">{stats.total}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Active Operational Accounts</p>
              <p className="text-2xl font-bold text-emerald-400 mt-0.5">{stats.active}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
              <XCircle size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Suspended Accounts</p>
              <p className="text-2xl font-bold text-rose-400 mt-0.5">{stats.suspended}</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          ALERTS
      ========================================================= */}
      {successMessage && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-medium text-emerald-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-200"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-medium text-rose-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-200"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* =========================================================
          SEARCH & FILTERS
      ========================================================= */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, department, location..."
            className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-4 text-xs text-white placeholder-gray-500 outline-none transition focus:border-[#D2B47A] focus:ring-1 focus:ring-[#D2B47A]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-[#141417] px-3 text-xs text-white outline-none focus:border-[#D2B47A]"
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
              className={`h-10 rounded-xl px-3.5 text-xs font-semibold transition ${
                statusFilter === filter
                  ? "bg-[#D2B47A] text-black shadow-md shadow-[#D2B47A]/20"
                  : "border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {filter === "ALL" ? "All Status" : filter}
            </button>
          ))}
        </div>
      </section>

      {/* =========================================================
          MANAGERS DIRECTORY GRID
      ========================================================= */}
      <section>
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/[0.02]">
            <Loader2 size={32} className="animate-spin text-[#D2B47A]" />
            <p className="mt-3 text-xs font-medium text-gray-400">
              Loading managers directory...
            </p>
          </div>
        ) : filteredManagers.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] text-center p-6">
            <Users size={32} className="text-gray-600 mb-2" />
            <p className="text-sm font-semibold text-gray-300">No managers found</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              {searchQuery || statusFilter !== "ALL" || departmentFilter !== "ALL"
                ? "Try adjusting your search criteria or filters."
                : "No manager accounts provisioned yet. Click Create Department Manager above."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredManagers.map((m) => {
              const deptBadge = getDeptBadge(m.department);
              const DeptIcon = deptBadge.icon;

              return (
                <div
                  key={m.id}
                  className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-b from-[#18181b]/80 to-[#121214]/80 p-5 shadow-xl transition-all duration-300 hover:border-[#D2B47A]/40 hover:shadow-2xl hover:shadow-[#D2B47A]/5"
                >
                  <div>
                    {/* Top Row: User Avatar & Department Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#9A7B4F] to-[#D2B47A] text-sm font-bold text-black shadow-md">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm group-hover:text-[#D2B47A] transition truncate">
                            {m.name}
                          </h3>
                          <p className="text-xs text-gray-400">@{m.username}</p>
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
                    <div className="mt-4 space-y-2 border-t border-white/5 pt-3 text-xs text-gray-300">
                      <div className="flex items-center gap-2 text-gray-400 truncate">
                        <Mail size={13} className="shrink-0 text-[#D2B47A]" />
                        <span className="truncate">{m.email}</span>
                      </div>

                      {m.phone && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <Phone size={13} className="shrink-0 text-[#D2B47A]" />
                          <span>{m.phone}</span>
                        </div>
                      )}

                      {m.location && (
                        <div className="flex items-center gap-2 text-gray-400 truncate">
                          <MapPin size={13} className="shrink-0 text-[#D2B47A]" />
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
                            className="rounded-md bg-white/5 px-2 py-0.5 text-[9px] font-medium text-gray-300 border border-white/5"
                          >
                            {p.replace(/_/g, " ")}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-gray-500 italic">Default permissions</span>
                      )}
                      {m.permissions && m.permissions.length > 3 && (
                        <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-bold text-[#D2B47A]">
                          +{m.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row: Actions */}
                  <div className="mt-5 border-t border-white/10 pt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(m)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-gray-200 transition hover:bg-white/10 hover:text-white"
                    >
                      <Edit size={12} className="text-[#D2B47A]" />
                      <span>Edit Access</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(m)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                        m.isActive
                          ? "text-rose-400 hover:bg-rose-500/10"
                          : "text-emerald-400 hover:bg-emerald-500/10"
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-xl rounded-3xl border border-white/15 bg-[#141417] p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-gray-100 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#9A7B4F] to-[#D2B47A] text-black">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Create Department Manager
                  </h2>
                  <p className="text-xs text-gray-400">
                    Assign role, operational department, and scoped system permissions.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateManager} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    onBlur={handleNameBlur}
                    placeholder="e.g. Marco Silva"
                    className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-500 outline-none transition focus:border-[#D2B47A] focus:ring-1 focus:ring-[#D2B47A]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-300">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    placeholder="e.g. marco_chef"
                    className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-500 outline-none transition focus:border-[#D2B47A] focus:ring-1 focus:ring-[#D2B47A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-300">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="marco@eventmanagement.com"
                    className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-gray-500 outline-none transition focus:border-[#D2B47A] focus:ring-1 focus:ring-[#D2B47A]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-300">
                    Initial Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-3 pr-10 text-xs text-white placeholder-gray-500 outline-none transition focus:border-[#D2B47A] focus:ring-1 focus:ring-[#D2B47A]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Department Selection */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-300">
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
                        className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-semibold transition ${
                          isSelected
                            ? "border-[#D2B47A] bg-[#D2B47A]/15 text-white"
                            : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200"
                        }`}
                      >
                        <Icon size={14} className={isSelected ? "text-[#D2B47A]" : "text-gray-500"} />
                        <span className="truncate">{dept.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scoped Permissions Checklist */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-300">
                  Granted Department Permissions
                </label>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                  {PERMISSION_OPTIONS.map((perm) => {
                    const isChecked = (formData.permissions || []).includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer hover:text-white"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handlePermissionToggle(perm.id)}
                          className="rounded border-white/20 bg-black text-[#D2B47A] focus:ring-[#D2B47A]"
                        />
                        <span>{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#9A7B4F] to-[#D2B47A] px-5 py-2 text-xs font-bold text-black shadow-lg shadow-[#9A7B4F]/20 transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-xl rounded-3xl border border-white/15 bg-[#141417] p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-gray-100 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D2B47A]/20 text-[#D2B47A]">
                  <Edit size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Edit Department & Scoped Permissions
                  </h2>
                  <p className="text-xs text-gray-400">
                    Modifying {editingManager.name} (@{editingManager.username})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !isSubmitting && setIsEditModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateManager} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => handleEditInputChange("name", e.target.value)}
                  className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white outline-none focus:border-[#D2B47A]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-300">
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
                        onClick={() => handleEditInputChange("department", dept.value)}
                        className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-semibold transition ${
                          isSelected
                            ? "border-[#D2B47A] bg-[#D2B47A]/15 text-white"
                            : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200"
                        }`}
                      >
                        <Icon size={14} className={isSelected ? "text-[#D2B47A]" : "text-gray-500"} />
                        <span className="truncate">{dept.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-300">
                  Scoped Permissions
                </label>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
                  {PERMISSION_OPTIONS.map((perm) => {
                    const isChecked = (editFormData.permissions || []).includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer hover:text-white"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleEditPermissionToggle(perm.id)}
                          className="rounded border-white/20 bg-black text-[#D2B47A] focus:ring-[#D2B47A]"
                        />
                        <span>{perm.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/10"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#9A7B4F] to-[#D2B47A] px-5 py-2 text-xs font-bold text-black shadow-lg shadow-[#9A7B4F]/20 transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
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

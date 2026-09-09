"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import ServiceCard from "./ServiceCard";
import ServiceForm from "./ServiceForm";

import {
  deleteService,
  getServices,
} from "@/lib/services.api";

import type { Service } from "@/types/service";

type ServiceListProps = {
  onServicesChange?: (services: Service[]) => void;
};

const categories = [
  "all",
  "catering",
  "decoration",
  "lighting",
  "sound",
  "photography",
  "videography",
  "entertainment",
  "staff",
  "venue",
  "other",
];

export default function ServiceList({
  onServicesChange,
}: ServiceListProps) {
  const [services, setServices] = useState<
    Service[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState("all");

  const [showForm, setShowForm] =
    useState(false);

  const [editingService, setEditingService] =
    useState<Service | null>(null);

  const [deactivatingId, setDeactivatingId] =
    useState<string | null>(null);

  const loadServices = async (
    showRefresh = false,
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getServices(true);

      setServices(data);

      onServicesChange?.(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load services.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const filteredServices = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesCategory =
        category === "all" ||
        service.category.toLowerCase() ===
          category.toLowerCase();

      const matchesSearch =
        !searchValue ||
        service.name
          .toLowerCase()
          .includes(searchValue) ||
        service.category
          .toLowerCase()
          .includes(searchValue) ||
        service.description
          ?.toLowerCase()
          .includes(searchValue);

      return (
        matchesCategory && matchesSearch
      );
    });
  }, [services, search, category]);

  const activeCount = services.filter(
    (service) => service.active,
  ).length;

  const inactiveCount = services.filter(
    (service) => !service.active,
  ).length;

  const handleAdd = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleFormSuccess = (
    savedService: Service,
  ) => {
    setServices((previous) => {
      const exists = previous.some(
        (service) =>
          service._id === savedService._id,
      );

      const updated = exists
        ? previous.map((service) =>
            service._id ===
            savedService._id
              ? savedService
              : service,
          )
        : [savedService, ...previous];

      onServicesChange?.(updated);

      return updated;
    });

    setShowForm(false);
    setEditingService(null);
  };

  const handleDeactivate = async (
    service: Service,
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${service.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeactivatingId(service._id);
      setError("");

      const updatedService =
        await deleteService(
          service._id,
        );

      setServices((previous) => {
        const updated = previous.map(
          (item) =>
            item._id ===
            updatedService._id
              ? updatedService
              : item,
        );

        onServicesChange?.(updated);

        return updated;
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to deactivate service.",
      );
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      {showForm ? (
        <ServiceForm
          service={editingService}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingService(null);
          }}
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[var(--ink)]">
                Services
              </h2>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Manage services, pricing and
                service options.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  loadServices(true)
                }
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--ivory)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                <span className="hidden sm:inline">
                  Refresh
                </span>
              </button>

              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                <Plus size={17} />
                Add Service
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
              <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                Total Services
              </p>

              <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                {services.length}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
              <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                Active
              </p>

              <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                {activeCount}
              </p>
            </div>

            <div className="col-span-2 rounded-2xl border border-[var(--line)] bg-white p-4 lg:col-span-1">
              <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                Inactive
              </p>

              <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                {inactiveCount}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-medium">
                  Something went wrong
                </p>

                <p className="mt-0.5">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Search services..."
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--ivory)]/30 py-3 pl-10 pr-4 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                />
              </div>

              {/* Category */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal
                  size={17}
                  className="shrink-0 text-[var(--muted)]"
                />

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(
                      event.target.value,
                    )
                  }
                  className="min-w-[180px] rounded-xl border border-[var(--line)] bg-[var(--ivory)]/30 px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                >
                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item === "all"
                          ? "All Categories"
                          : item
                              .charAt(0)
                              .toUpperCase() +
                            item.slice(1)}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-64 animate-pulse rounded-2xl border border-[var(--line)] bg-white"
                />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            /* Empty */
            <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ivory)]">
                <Search
                  size={20}
                  className="text-[var(--muted)]"
                />
              </div>

              <h3 className="mt-4 text-base font-semibold text-[var(--ink)]">
                {services.length === 0
                  ? "No services yet"
                  : "No services found"}
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm text-[var(--muted)]">
                {services.length === 0
                  ? "Create your first service to make it available in the booking flow."
                  : "Try changing your search or category filter."}
              </p>

              {services.length === 0 && (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--ink)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                >
                  <Plus size={16} />
                  Add Service
                </button>
              )}
            </div>
          ) : (
            /* Service Cards */
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredServices.map(
                (service) => (
                  <div
                    key={service._id}
                    className={
                      deactivatingId ===
                      service._id
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  >
                    <ServiceCard
                      service={service}
                      onEdit={
                        handleEdit
                      }
                      onDeactivate={
                        handleDeactivate
                      }
                    />
                  </div>
                ),
              )}
            </div>
          )}

          {/* Result count */}
          {!loading &&
            filteredServices.length >
              0 && (
              <p className="text-center text-xs text-[var(--muted)]">
                Showing{" "}
                {filteredServices.length}{" "}
                of {services.length}{" "}
                services
              </p>
            )}
        </>
      )}
    </div>
  );
}
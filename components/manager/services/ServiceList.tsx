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
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[#5F6062]">
                Services
              </h2>

              <p className="mt-1 text-sm text-[#8A8B8F]">
                Manage services, pricing and service options.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Refresh */}
              <button
                type="button"
                onClick={() => loadServices(true)}
                disabled={refreshing}
                className="group inline-flex items-center gap-2 rounded-lg border border-[#E5E6EA] bg-[#F3F4F8] px-3.5 py-2.5 text-sm font-medium text-[#5F6062] transition-all duration-200 hover:bg-[#E9EAF0] hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  strokeWidth={2}
                  className={`transition-transform duration-500 ${
                    refreshing
                      ? "animate-spin"
                      : "group-hover:rotate-180"
                  }`}
                />

                <span className="hidden sm:inline">
                  Refresh
                </span>
              </button>

              {/* Add Service */}
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center gap-2 rounded-lg bg-[#5F6062] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#454649] active:bg-[#3F4042]"
              >
                <Plus size={17} strokeWidth={2.5} />
                Add Service
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FEFEFE] p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[#8A8B8E]">
                Total Services
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#5F6062]">
                {services.length}
              </p>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FEFEFE] p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-[#8A8B8E]">
                Active
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#5F6062]">
                {activeCount}
              </p>
            </div>

            <div className="col-span-2 rounded-2xl border border-[#E5E7EB] bg-[#FEFEFE] p-4 lg:col-span-1">
              <p className="text-xs font-medium uppercase tracking-wider text-[#8A8B8E]">
                Inactive
              </p>

              <p className="mt-2 text-2xl font-semibold text-[#5F6062]">
                {inactiveCount}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-[#E2D9D9] bg-[#FAF7F7] px-4 py-3.5 text-sm text-[#5F6062]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F8]">
                <AlertCircle
                  size={17}
                  strokeWidth={2}
                  className="text-[#6B6262]"
                />
              </div>

              <div className="min-w-0">
                <p className="font-medium text-[#5F6062]">
                  Something went wrong
                </p>

                <p className="mt-0.5 text-[#85868A]">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#FEFEFE] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  size={17}
                  strokeWidth={2}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8B8F]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search services..."
                  className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFC] py-2.5 pl-10 pr-4 text-sm text-[#5F6062] outline-none transition-all duration-200 placeholder:text-[#9A9BA0] hover:border-[#DCDDE2] focus:border-[#BFC1C5] focus:bg-[#FEFEFE] focus:ring-2 focus:ring-[#5F6062]/5"
                />
              </div>

              {/* Category */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal
                  size={17}
                  strokeWidth={2}
                  className="shrink-0 text-[#8A8B8F]"
                />

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  className="h-11 min-w-[190px] cursor-pointer rounded-xl border border-[#E5E7EB] bg-[#F9FAFC] px-4 text-sm font-medium text-[#5F6062] outline-none transition-all duration-200 hover:border-[#DCDDE2] focus:border-[#BFC1C5] focus:bg-[#FEFEFE] focus:ring-2 focus:ring-[#5F6062]/5"
                >
                  {categories.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item === "all"
                        ? "All Categories"
                        : item.charAt(0).toUpperCase() +
                          item.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#FEFEFE] p-5"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 animate-pulse rounded-xl bg-[#F3F4F8]" />

                      <div className="space-y-2">
                        <div className="h-4 w-28 animate-pulse rounded-md bg-[#F3F4F8]" />
                        <div className="h-3 w-20 animate-pulse rounded-md bg-[#F3F4F8]" />
                      </div>
                    </div>

                    <div className="h-7 w-16 animate-pulse rounded-full bg-[#F3F4F8]" />
                  </div>

                  {/* Content */}
                  <div className="mt-5 space-y-3">
                    <div className="h-3 w-full animate-pulse rounded-md bg-[#F3F4F8]" />
                    <div className="h-3 w-5/6 animate-pulse rounded-md bg-[#F3F4F8]" />
                    <div className="h-3 w-2/3 animate-pulse rounded-md bg-[#F3F4F8]" />
                  </div>

                  {/* Price */}
                  <div className="mt-5">
                    <div className="h-6 w-24 animate-pulse rounded-md bg-[#F3F4F8]" />
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-between border-t border-[#F0F1F3] pt-4">
                    <div className="h-3 w-20 animate-pulse rounded-md bg-[#F3F4F8]" />

                    <div className="h-8 w-20 animate-pulse rounded-lg bg-[#F3F4F8]" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            /* Empty */
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#DCDDE2] bg-[#FEFEFE] px-6 py-12 text-center">
              {/* Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F4F8]">
                <Search
                  size={22}
                  strokeWidth={1.8}
                  className="text-[#7A7B7F]"
                />
              </div>

              {/* Title */}
              <h3 className="mt-5 text-base font-semibold text-[#5F6062]">
                {services.length === 0
                  ? "No services yet"
                  : "No services found"}
              </h3>

              {/* Description */}
              <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-[#8A8B8F]">
                {services.length === 0
                  ? "Create your first service to make it available in the booking flow."
                  : "Try changing your search or category filter."}
              </p>

              {/* Action */}
              {services.length === 0 && (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#5F6062] px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#48494B] active:scale-[0.98]"
                >
                  <Plus
                    size={17}
                    strokeWidth={2.5}
                  />
                  Add Service
                </button>
              )}
            </div>
          ) : (
            /* Service Cards */
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredServices.map((service, index) => (
                <div
                  key={service._id}
                  className={`transition-all duration-300 ${
                    deactivatingId === service._id
                      ? "pointer-events-none opacity-50"
                      : "animate-[fadeIn_0.35s_ease-out]"
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <ServiceCard
                    service={service}
                    onEdit={handleEdit}
                    onDeactivate={handleDeactivate}
                  />
                </div>
              ))}
            </div>
          )}

            {/* Result count */}
            {!loading && filteredServices.length > 0 && (
              <div className="flex justify-center">
                <p className="rounded-full bg-[#F3F4F8] px-3.5 py-1.5 text-xs font-medium text-[#7A7B7F]">
                  Showing{" "}
                  <span className="font-semibold text-[#5F6062]">
                    {filteredServices.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-[#5F6062]">
                    {services.length}
                  </span>{" "}
                  services
                </p>
              </div>
            )}
        </>
      )}
    </div>
  );
}
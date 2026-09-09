"use client";

import {
  Edit3,
  MoreVertical,
  Power,
  Tag,
} from "lucide-react";

import type { Service } from "@/types/service";

type ServiceCardProps = {
  service: Service;
  onEdit: (service: Service) => void;
  onDeactivate: (service: Service) => void;
};

const pricingLabels: Record<string, string> = {
  FIXED: "Fixed Price",
  PER_GUEST: "Per Guest",
  PER_UNIT: "Per Unit",
  PER_HOUR: "Per Hour",
  PER_DAY: "Per Day",
  PER_STAFF: "Per Staff",
  PER_REEL: "Per Reel",
};

export default function ServiceCard({
  service,
  onEdit,
  onDeactivate,
}: ServiceCardProps) {
  const pricingLabel =
    pricingLabels[service.pricingType] ||
    service.pricingType;

  const formattedPrice =
    Number(service.basePrice || 0).toLocaleString(
      "en-IN",
    );

  return (
    <div className="group rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-[var(--ink)]">
              {service.name}
            </h3>

            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                service.active
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {service.active
                ? "Active"
                : "Inactive"}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs text-[var(--muted)]">
            <Tag size={13} />

            <span className="capitalize">
              {service.category}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(service)}
            className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--ivory)] hover:text-[var(--ink)]"
            aria-label={`Edit ${service.name}`}
          >
            <Edit3 size={17} />
          </button>

          {service.active && (
            <button
              type="button"
              onClick={() =>
                onDeactivate(service)
              }
              className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-red-50 hover:text-red-600"
              aria-label={`Deactivate ${service.name}`}
            >
              <Power size={17} />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {service.description && (
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
          {service.description}
        </p>
      )}

      {/* Pricing */}
      <div className="mt-5 rounded-xl bg-[var(--ivory)]/70 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          Pricing
        </p>

        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-lg font-semibold text-[var(--ink)]">
            ₹{formattedPrice}
          </span>

          {service.pricingType !== "FIXED" && (
            <span className="text-xs text-[var(--muted)]">
              / {service.unitLabel || "unit"}
            </span>
          )}
        </div>

        <p className="mt-1 text-xs text-[var(--muted)]">
          {pricingLabel}
        </p>
      </div>

      {/* Options */}
      <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-4">
        <span className="text-xs text-[var(--muted)]">
          {service.options?.length || 0}{" "}
          {service.options?.length === 1
            ? "option"
            : "options"}
        </span>

        {service.options &&
          service.options.length > 0 && (
            <div className="flex -space-x-1">
              {service.options
                .slice(0, 3)
                .map((option, index) => (
                  <span
                    key={
                      option._id || index
                    }
                    className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[var(--ink)] text-[9px] font-medium text-white"
                    title={option.name}
                  >
                    {option.name
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                ))}

              {service.options.length > 3 && (
                <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[var(--gold)] text-[9px] font-medium text-[var(--ink)]">
                  +{service.options.length - 3}
                </span>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
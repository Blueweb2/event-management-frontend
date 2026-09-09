"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Camera,
  Check,
  ChevronDown,
  Clapperboard,
  Lightbulb,
  Loader2,
  Mic2,
  Plus,
  Trash2,
  Utensils,
  Users,
  Volume2,
  Warehouse,
  Wrench,
} from "lucide-react";

import type {
  BookingFormData,
  ServiceItem,
} from "../types";

import {
  getServices,
} from "@/lib/services.api";

import type {
  PricingType,
  Service,
} from "@/types/service";

type ServicesItemsStepProps = {
  formData: BookingFormData;
  updateServices: (
    services: BookingFormData["services"],
  ) => void;
};

type Category = {
  id: string;
  name: string;
  icon: React.ElementType;
};

const categoryIcons: Record<
  string,
  React.ElementType
> = {
  venue: Warehouse,
  catering: Utensils,
  decoration: Clapperboard,
  lighting: Lightbulb,
  sound: Volume2,
  photography: Camera,
  videography: Camera,
  entertainment: Mic2,
  staff: Users,
  other: Wrench,
};

const fallbackIcon = Wrench;

const pricingLabels: Record<
  PricingType,
  string
> = {
  FIXED: "Fixed Price",
  PER_GUEST: "Per Guest",
  PER_UNIT: "Per Unit",
  PER_HOUR: "Per Hour",
  PER_DAY: "Per Day",
  PER_STAFF: "Per Staff",
  PER_REEL: "Per Reel",
};

const formatCategoryName = (
  category: string,
) => {
  return category
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
};

const formatCurrency = (
  amount: number,
) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getDefaultQuantity = (
  pricingType: PricingType,
  guests: number,
) => {
  switch (pricingType) {
    case "PER_GUEST":
      return guests || 1;

    case "FIXED":
      return 1;

    default:
      return 1;
  }
};

const getQuantityLabel = (
  pricingType: PricingType,
  unitLabel?: string,
) => {
  if (unitLabel) {
    return formatCategoryName(unitLabel);
  }

  switch (pricingType) {
    case "PER_GUEST":
      return "Guests";

    case "PER_HOUR":
      return "Hours";

    case "PER_DAY":
      return "Days";

    case "PER_STAFF":
      return "Staff";

    case "PER_REEL":
      return "Reels";

    case "PER_UNIT":
      return "Quantity";

    case "FIXED":
      return "Quantity";

    default:
      return "Quantity";
  }
};

const getQuantityFromItem = (
  item: ServiceItem,
) => {
  return Math.max(
    Number(item.quantity) || 1,
    1,
  );
};

export default function ServicesItemsStep({
  formData,
  updateServices,
}: ServicesItemsStepProps) {
  const [services, setServices] =
    useState<Service[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [addingServiceId, setAddingServiceId] =
    useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError("");

        // Only active services are returned.
        const data = await getServices();

        setServices(data);

        if (data.length > 0) {
          setSelectedCategory(
            data[0].category,
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load services.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  /*
   * Build categories dynamically from
   * Admin-configured services.
   */
  const categories = useMemo<
    Category[]
  >(() => {
    const uniqueCategories = Array.from(
      new Set(
        services.map(
          (service) =>
            service.category.toLowerCase(),
        ),
      ),
    );

    return uniqueCategories.map(
      (category) => ({
        id: category,
        name: formatCategoryName(
          category,
        ),
        icon:
          categoryIcons[category] ||
          fallbackIcon,
      }),
    );
  }, [services]);

  /*
   * Services belonging to the
   * currently selected category.
   */
  const visibleServices = useMemo(() => {
    if (selectedCategory === "all") {
      return services;
    }

    return services.filter(
      (service) =>
        service.category.toLowerCase() ===
        selectedCategory.toLowerCase(),
    );
  }, [
    services,
    selectedCategory,
  ]);

  /*
   * Add a service to the booking.
   */
  const addService = (
    service: Service,
  ) => {
    const alreadySelected =
      formData.services.some(
        (item) =>
          item.serviceId ===
            service._id ||
          item.id === service._id,
      );

    if (alreadySelected) {
      return;
    }

    const guests =
      Number(formData.guests) || 1;

    const quantity =
      getDefaultQuantity(
        service.pricingType,
        guests,
      );

    const newItem =
      {
        id: crypto.randomUUID(),

        // Backend service ID
        serviceId: service._id,

        // Display information
        category: service.category,
        name: service.name,
        description:
          service.description || "",

        // Quantity selected by customer
        quantity,

        /*
         * Snapshot/display value only.
         *
         * IMPORTANT:
         * This value is NOT trusted by the backend.
         */
        unitPrice: service.basePrice,

        pricingType:
          service.pricingType,

        unitLabel:
          service.unitLabel || "",
      } as ServiceItem;

    updateServices([
      ...formData.services,
      newItem,
    ]);
  };

  /*
   * Remove selected service.
   */
  const removeService = (
    itemId: string,
  ) => {
    updateServices(
      formData.services.filter(
        (item) =>
          item.id !== itemId,
      ),
    );
  };

  /*
   * Update quantity only.
   *
   * There is deliberately NO
   * updateUnitPrice function.
   */
  const updateQuantity = (
    itemId: string,
    value: number,
  ) => {
    const quantity = Math.max(
      Number(value) || 1,
      1,
    );

    updateServices(
      formData.services.map(
        (item) =>
          item.id === itemId
            ? {
                ...item,
                quantity,
              }
            : item,
      ),
    );
  };

  /*
   * Select an option for a service.
   */
  const selectOption = (
    itemId: string,
    service: Service,
    optionId: string,
  ) => {
    const option =
      service.options.find(
        (item) =>
          item._id === optionId,
      );

    if (!option) {
      return;
    }

    updateServices(
      formData.services.map(
        (item) =>
          item.id === itemId
            ? {
                ...item,

                serviceId:
                  service._id,

                optionId:
                  option._id,

                name:
                  service.name,

                description:
                  option.description ||
                  service.description ||
                  "",

                unitPrice:
                  option.price,

                pricingType:
                  option.pricingType,

                unitLabel:
                  option.unitLabel ||
                  "",
              }
            : item,
      ),
    );
  };

  /*
   * Display-only subtotal.
   *
   * Backend remains the source of truth.
   */
  const displaySubtotal =
    formData.services.reduce(
      (total, item) =>
        total +
        getQuantityFromItem(item) *
          Number(item.unitPrice || 0),
      0,
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--sage)]">
          Step 3
        </p>

        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--sage-dark)] sm:text-3xl">
          Services & Items
        </h2>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--taupe)] sm:text-base">
          Select the services your event
          requires. Pricing is configured by
          the event manager.
        </p>
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
              Unable to load services
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-[var(--border)] bg-white">
          <div className="flex items-center gap-3 text-sm text-[var(--taupe)]">
            <Loader2
              size={20}
              className="animate-spin"
            />

            Loading available services...
          </div>
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white px-6 py-14 text-center">
          <p className="text-base font-semibold text-[var(--sage-dark)]">
            No services are currently available
          </p>

          <p className="mt-2 text-sm text-[var(--taupe)]">
            Please contact the event manager
            for available services.
          </p>
        </div>
      ) : (
        <>
          {/* Categories */}
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[var(--sage-dark)]">
                  Service Categories
                </h3>

                <p className="mt-1 text-xs text-[var(--taupe)]">
                  Select a category to browse
                  available services.
                </p>
              </div>

              <span className="rounded-full bg-[var(--ivory)] px-3 py-1.5 text-xs font-medium text-[var(--taupe)]">
                {formData.services.length}{" "}
                {formData.services.length ===
                1
                  ? "item"
                  : "items"}
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map(
                (category) => {
                  const Icon =
                    category.icon;

                  const isSelected =
                    selectedCategory ===
                    category.id;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() =>
                        setSelectedCategory(
                          category.id,
                        )
                      }
                      className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isSelected
                          ? "bg-[var(--sage)] text-white"
                          : "bg-[var(--ivory)] text-[var(--sage-dark)] hover:bg-[var(--sage-light)]"
                      }`}
                    >
                      <Icon size={17} />

                      {category.name}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* Available Services */}
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4">
              <h3 className="font-semibold text-[var(--sage-dark)]">
                Available Services
              </h3>

              <p className="mt-1 text-xs text-[var(--taupe)]">
                Select a service to add it to
                your estimate.
              </p>
            </div>

            {visibleServices.length ===
            0 ? (
              <div className="rounded-xl border border-dashed border-[var(--border)] px-5 py-8 text-center">
                <p className="text-sm text-[var(--taupe)]">
                  No services available in
                  this category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {visibleServices.map(
                  (service) => {
                    const isSelected =
                      formData.services.some(
                        (item) =>
                          item.serviceId ===
                          service._id,
                      );

                    return (
                      <button
                        key={
                          service._id
                        }
                        type="button"
                        disabled={
                          isSelected ||
                          addingServiceId ===
                            service._id
                        }
                        onClick={() => {
                          setAddingServiceId(
                            service._id,
                          );

                          addService(
                            service,
                          );

                          setTimeout(
                            () =>
                              setAddingServiceId(
                                null,
                              ),
                            150,
                          );
                        }}
                        className={`rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-[var(--sage)]/30 bg-[var(--sage-light)]/40"
                            : "border-[var(--border)] hover:border-[var(--sage)]/40 hover:bg-[var(--ivory)]/50"
                        } disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-medium text-[var(--sage-dark)]">
                              {
                                service.name
                              }
                            </p>

                            {service.description && (
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--taupe)]">
                                {
                                  service.description
                                }
                              </p>
                            )}
                          </div>

                          <div className="shrink-0">
                            {isSelected ? (
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--sage)] text-white">
                                <Check
                                  size={
                                    16
                                  }
                                />
                              </span>
                            ) : (
                              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--sage)]">
                                {addingServiceId ===
                                service._id ? (
                                  <Loader2
                                    size={
                                      16
                                    }
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Plus
                                    size={
                                      16
                                    }
                                  />
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[var(--sage-dark)]">
                              {formatCurrency(
                                service.basePrice,
                              )}

                              {service.pricingType !==
                                "FIXED" && (
                                <span className="ml-1 text-xs font-normal text-[var(--taupe)]">
                                  /{" "}
                                  {service.unitLabel ||
                                    "unit"}
                                </span>
                              )}
                            </p>

                            <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--taupe)]">
                              {
                                pricingLabels[
                                  service
                                    .pricingType
                                ]
                              }
                            </p>
                          </div>

                          {service.options?.length >
                            0 && (
                            <span className="rounded-full bg-[var(--ivory)] px-2.5 py-1 text-[10px] font-medium text-[var(--taupe)]">
                              {
                                service
                                  .options
                                  .filter(
                                    (
                                      option,
                                    ) =>
                                      option.active,
                                  ).length
                              }{" "}
                              options
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </div>

          {/* Selected Services */}
          {formData.services.length >
            0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-5">
                <h3 className="font-semibold text-[var(--sage-dark)]">
                  Selected Services
                </h3>

                <p className="mt-1 text-xs text-[var(--taupe)]">
                  Adjust quantities as needed.
                  Prices are controlled by the
                  event manager.
                </p>
              </div>

              <div className="space-y-4">
                {formData.services.map(
                  (item) => {
                    const service =
                      services.find(
                        (service) =>
                          service._id ===
                          item.serviceId,
                      );

                    const activeOptions =
                      service?.options?.filter(
                        (option) =>
                          option.active,
                      ) || [];

                    const pricingType =
                      item.pricingType ||
                      service?.pricingType ||
                      "FIXED";

                    const quantityLabel =
                      getQuantityLabel(
                        pricingType,
                        item.unitLabel ||
                          service?.unitLabel,
                      );

                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-[var(--border)] bg-[var(--ivory)]/30 p-4"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          {/* Service info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--sage-light)] text-[var(--sage-dark)]">
                                <Check
                                  size={
                                    17
                                  }
                                />
                              </div>

                              <div className="min-w-0">
                                <h4 className="font-medium text-[var(--sage-dark)]">
                                  {
                                    item.name
                                  }
                                </h4>

                                {item.description && (
                                  <p className="mt-1 text-xs leading-5 text-[var(--taupe)]">
                                    {
                                      item.description
                                    }
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Option */}
                            {service &&
                              activeOptions.length >
                                0 && (
                                <div className="mt-4 max-w-md">
                                  <label className="mb-2 block text-xs font-medium text-[var(--sage-dark)]">
                                    Service
                                    Option
                                  </label>

                                  <div className="relative">
                                    <select
                                      value={
                                        item.optionId ||
                                        ""
                                      }
                                      onChange={(
                                        event,
                                      ) =>
                                        selectOption(
                                          item.id,
                                          service,
                                          event
                                            .target
                                            .value,
                                        )
                                      }
                                      className="w-full appearance-none rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 pr-9 text-sm text-[var(--sage-dark)] outline-none focus:border-[var(--sage)] focus:ring-2 focus:ring-[var(--sage)]/20"
                                    >
                                      <option value="">
                                        Select an option
                                      </option>

                                      {activeOptions.map(
                                        (
                                          option,
                                        ) => (
                                          <option
                                            key={
                                              option._id
                                            }
                                            value={
                                              option._id
                                            }
                                          >
                                            {
                                              option.name
                                            }{" "}
                                            —{" "}
                                            {formatCurrency(
                                              option.price,
                                            )}
                                            {option.pricingType !==
                                              "FIXED" &&
                                              ` / ${
                                                option.unitLabel ||
                                                "unit"
                                              }`}
                                          </option>
                                        ),
                                      )}
                                    </select>

                                    <ChevronDown
                                      size={
                                        16
                                      }
                                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--taupe)]"
                                    />
                                  </div>
                                </div>
                              )}
                          </div>

                          {/* Quantity + price */}
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            {pricingType !==
                              "FIXED" && (
                              <div className="w-full sm:w-28">
                                <label className="mb-2 block text-xs font-medium text-[var(--sage-dark)]">
                                  {
                                    quantityLabel
                                  }
                                </label>

                                <input
                                  type="number"
                                  min="1"
                                  value={getQuantityFromItem(
                                    item,
                                  )}
                                  onChange={(
                                    event,
                                  ) =>
                                    updateQuantity(
                                      item.id,
                                      Number(
                                        event
                                          .target
                                          .value,
                                      ),
                                    )
                                  }
                                  className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--sage-dark)] outline-none focus:border-[var(--sage)] focus:ring-2 focus:ring-[var(--sage)]/20"
                                />
                              </div>
                            )}

                            {/* Price - display only */}
                            <div className="min-w-[130px]">
                              <p className="mb-2 text-xs font-medium text-[var(--sage-dark)]">
                                Price
                              </p>

                              <div className="rounded-xl border border-[var(--border)] bg-white px-3 py-2.5">
                                <p className="text-sm font-semibold text-[var(--sage-dark)]">
                                  {formatCurrency(
                                    Number(
                                      item.unitPrice ||
                                        0,
                                    ),
                                  )}
                                </p>

                                <p className="mt-0.5 text-[10px] text-[var(--taupe)]">
                                  {pricingType ===
                                  "FIXED"
                                    ? "Fixed"
                                    : `per ${
                                        item.unitLabel ||
                                        "unit"
                                      }`}
                                </p>
                              </div>
                            </div>

                            {/* Remove */}
                            <button
                              type="button"
                              onClick={() =>
                                removeService(
                                  item.id,
                                )
                              }
                              className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-white text-red-500 transition hover:bg-red-50"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2
                                size={
                                  17
                                }
                              />
                            </button>
                          </div>
                        </div>

                        {/* Line total */}
                        <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
                          <span className="text-xs text-[var(--taupe)]">
                            Line total
                          </span>

                          <span className="text-sm font-semibold text-[var(--sage-dark)]">
                            {formatCurrency(
                              pricingType ===
                                "FIXED"
                                ? Number(
                                    item.unitPrice ||
                                      0,
                                  )
                                : Number(
                                    item.unitPrice ||
                                      0,
                                  ) *
                                    getQuantityFromItem(
                                      item,
                                    ),
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>

              {/* Subtotal */}
              <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-5">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--taupe)]">
                    Current Subtotal
                  </p>

                  <p className="mt-1 text-xs text-[var(--taupe)]">
                    Final pricing will be
                    recalculated by the server.
                  </p>
                </div>

                <p className="text-xl font-semibold text-[var(--sage-dark)]">
                  {formatCurrency(
                    displaySubtotal,
                  )}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
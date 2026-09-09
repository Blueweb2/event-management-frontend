"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

import PricingRuleForm from "./PricingRuleForm";

import {
  createService,
  updateService,
} from "@/lib/services.api";

import type {
  PricingType,
  Service,
  ServiceOption,
} from "@/types/service";

type ServiceFormProps = {
  service?: Service | null;
  onSuccess: (service: Service) => void;
  onCancel: () => void;
};

type OptionFormData = {
  name: string;
  description: string;
  price: number;
  pricingType: PricingType;
  unitLabel: string;
  active: boolean;
};

type FormData = {
  name: string;
  category: string;
  description: string;
  pricingType: PricingType;
  basePrice: number;
  unitLabel: string;
  sortOrder: number;
  options: OptionFormData[];
};

const categories = [
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

const defaultFormData: FormData = {
  name: "",
  category: "catering",
  description: "",
  pricingType: "FIXED",
  basePrice: 0,
  unitLabel: "service",
  sortOrder: 0,
  options: [],
};

const createEmptyOption = (): OptionFormData => ({
  name: "",
  description: "",
  price: 0,
  pricingType: "FIXED",
  unitLabel: "service",
  active: true,
});

export default function ServiceForm({
  service,
  onSuccess,
  onCancel,
}: ServiceFormProps) {
  const isEditing = Boolean(service);

  const [formData, setFormData] =
    useState<FormData>(defaultFormData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!service) {
      setFormData(defaultFormData);
      return;
    }

    setFormData({
      name: service.name,
      category: service.category,
      description: service.description || "",
      pricingType: service.pricingType,
      basePrice: service.basePrice,
      unitLabel: service.unitLabel || "service",
      sortOrder: service.sortOrder || 0,

      options: (service.options || []).map(
        (option) => ({
          name: option.name,
          description: option.description || "",
          price: option.price,
          pricingType: option.pricingType,
          unitLabel:
            option.unitLabel || "service",
          active: option.active,
        }),
      ),
    });
  }, [service]);

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  };

  const addOption = () => {
    setFormData((previous) => ({
      ...previous,
      options: [
        ...previous.options,
        createEmptyOption(),
      ],
    }));
  };

  const updateOption = (
    index: number,
    field: keyof OptionFormData,
    value:
      | string
      | number
      | boolean
      | PricingType,
  ) => {
    setFormData((previous) => {
      const options = [...previous.options];

      options[index] = {
        ...options[index],
        [field]: value,
      };

      return {
        ...previous,
        options,
      };
    });

    setError("");
  };

  const removeOption = (index: number) => {
    setFormData((previous) => ({
      ...previous,
      options: previous.options.filter(
        (_, optionIndex) =>
          optionIndex !== index,
      ),
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Service name is required.";
    }

    if (!formData.category.trim()) {
      return "Category is required.";
    }

    if (formData.basePrice < 0) {
      return "Base price cannot be negative.";
    }

    if (!formData.unitLabel.trim()) {
      return "Unit label is required.";
    }

    for (let i = 0; i < formData.options.length; i++) {
      const option = formData.options[i];

      if (!option.name.trim()) {
        return `Option ${i + 1}: name is required.`;
      }

      if (option.price < 0) {
        return `Option ${i + 1}: price cannot be negative.`;
      }

      if (!option.unitLabel.trim()) {
        return `Option ${i + 1}: unit label is required.`;
      }
    }

    return "";
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        description:
          formData.description.trim(),

        pricingType: formData.pricingType,

        basePrice: Number(
          formData.basePrice,
        ),

        unitLabel:
          formData.unitLabel.trim(),

        sortOrder: Number(
          formData.sortOrder,
        ),

        options: formData.options.map(
          (option) => ({
            name: option.name.trim(),
            description:
              option.description.trim(),
            price: Number(option.price),
            pricingType:
              option.pricingType,
            unitLabel:
              option.unitLabel.trim(),
            active: option.active,
          }),
        ),
      };

      let savedService: Service;

      if (service?._id) {
        savedService =
          await updateService(
            service._id,
            payload,
          );
      } else {
        savedService =
          await createService(payload);
      }

      onSuccess(savedService);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            {isEditing
              ? "Edit Service"
              : "Add Service"}
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Configure the service and its pricing.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--ivory)] hover:text-[var(--ink)]"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 p-6 pb-28"
      >
        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Basic Details */}
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
            Service Details
          </h3>

          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Name */}
            <div className="md:col-span-2">
              <label
                htmlFor="serviceName"
                className="mb-2 block text-sm font-medium text-[var(--ink)]"
              >
                Service Name
              </label>

              <input
                id="serviceName"
                type="text"
                value={formData.name}
                disabled={loading}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value,
                  )
                }
                placeholder="e.g. Premium Catering"
                className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 disabled:opacity-60"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="serviceCategory"
                className="mb-2 block text-sm font-medium text-[var(--ink)]"
              >
                Category
              </label>

              <select
                id="serviceCategory"
                value={formData.category}
                disabled={loading}
                onChange={(event) =>
                  updateField(
                    "category",
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 disabled:opacity-60"
              >
                {categories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category
                        .charAt(0)
                        .toUpperCase() +
                        category.slice(1)}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label
                htmlFor="sortOrder"
                className="mb-2 block text-sm font-medium text-[var(--ink)]"
              >
                Sort Order
              </label>

              <input
                id="sortOrder"
                type="number"
                min="0"
                value={formData.sortOrder}
                disabled={loading}
                onChange={(event) =>
                  updateField(
                    "sortOrder",
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 disabled:opacity-60"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="serviceDescription"
                className="mb-2 block text-sm font-medium text-[var(--ink)]"
              >
                Description
              </label>

              <textarea
                id="serviceDescription"
                rows={3}
                value={formData.description}
                disabled={loading}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value,
                  )
                }
                placeholder="Describe what this service includes..."
                className="w-full resize-none rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20 disabled:opacity-60"
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t border-[var(--line)] pt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
            Base Pricing
          </h3>

          <div className="mt-4">
            <PricingRuleForm
              pricingType={
                formData.pricingType
              }
              price={
                formData.basePrice
              }
              unitLabel={
                formData.unitLabel
              }
              onPricingTypeChange={(
                value,
              ) =>
                updateField(
                  "pricingType",
                  value,
                )
              }
              onPriceChange={(value) =>
                updateField(
                  "basePrice",
                  value,
                )
              }
              onUnitLabelChange={(
                value,
              ) =>
                updateField(
                  "unitLabel",
                  value,
                )
              }
              disabled={loading}
            />
          </div>
        </section>

        {/* Options */}
        <section className="border-t border-[var(--line)] pt-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
                Service Options
              </h3>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Add different options with their
                own pricing.
              </p>
            </div>

            <button
              type="button"
              onClick={addOption}
              disabled={loading}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[var(--gold)] bg-[var(--gold)]/10 px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--gold)]/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} />
              Add Option
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {formData.options.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--line)] px-5 py-8 text-center">
                <p className="text-sm text-[var(--muted)]">
                  No options added.
                </p>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  Options are useful for services such
                  as Photography Only or Photography +
                  Videography.
                </p>
              </div>
            ) : (
              formData.options.map(
                (option, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[var(--line)] bg-[var(--ivory)]/40 p-5"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-[var(--ink)]">
                        Option {index + 1}
                      </h4>

                      <button
                        type="button"
                        onClick={() =>
                          removeOption(
                            index,
                          )
                        }
                        disabled={loading}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                        aria-label="Remove option"
                      >
                        <Trash2
                          size={17}
                        />
                      </button>
                    </div>

                    <div className="space-y-5">
                      {/* Option name */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--ink)]">
                          Option Name
                        </label>

                        <input
                          type="text"
                          value={
                            option.name
                          }
                          disabled={loading}
                          onChange={(
                            event,
                          ) =>
                            updateOption(
                              index,
                              "name",
                              event.target
                                .value,
                            )
                          }
                          placeholder="e.g. Photography Only"
                          className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                        />
                      </div>

                      {/* Option description */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-[var(--ink)]">
                          Description
                        </label>

                        <textarea
                          rows={2}
                          value={
                            option.description
                          }
                          disabled={loading}
                          onChange={(
                            event,
                          ) =>
                            updateOption(
                              index,
                              "description",
                              event.target
                                .value,
                            )
                          }
                          placeholder="Describe this option..."
                          className="w-full resize-none rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/20"
                        />
                      </div>

                      {/* Option pricing */}
                      <PricingRuleForm
                        pricingType={
                          option.pricingType
                        }
                        price={
                          option.price
                        }
                        unitLabel={
                          option.unitLabel
                        }
                        onPricingTypeChange={(
                          value,
                        ) =>
                          updateOption(
                            index,
                            "pricingType",
                            value,
                          )
                        }
                        onPriceChange={(
                          value,
                        ) =>
                          updateOption(
                            index,
                            "price",
                            value,
                          )
                        }
                        onUnitLabelChange={(
                          value,
                        ) =>
                          updateOption(
                            index,
                            "unitLabel",
                            value,
                          )
                        }
                        disabled={
                          loading
                        }
                      />

                      {/* Active */}
                      <label className="flex items-center gap-3 text-sm text-[var(--ink)]">
                        <input
                          type="checkbox"
                          checked={
                            option.active
                          }
                          disabled={
                            loading
                          }
                          onChange={(
                            event,
                          ) =>
                            updateOption(
                              index,
                              "active",
                              event.target
                                .checked,
                            )
                          }
                          className="h-4 w-4 rounded border-[var(--line)] accent-[var(--gold)]"
                        />

                        Option is active
                      </label>
                    </div>
                  </div>
                ),
              )
            )}
          </div>
        </section>

        {/* Actions */}
        {/* Actions */}
        <div className="sticky bottom-0 z-20 -mx-6 mt-8 border-t border-[var(--line)] bg-white px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

            {/* Cancel */}
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-xl border border-[var(--line)] bg-white px-6 py-3 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--ivory)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            {/* Save */}
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-black px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Update Service"
                  : "Save Service"}
            </button>

          </div>
        </div>
      </form>
    </div>
  );
}
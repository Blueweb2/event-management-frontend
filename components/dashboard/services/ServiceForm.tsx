"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Plus, Trash2, X } from "lucide-react";

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
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FEFEFE]">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-5">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-[#5F6062]">
            {isEditing ? "Edit Service" : "Add Service"}
          </h2>

          <p className="mt-1 text-sm text-[#85868A]">
            Configure the service and its pricing.
          </p>
        </div>

        {/* Close */}
        <button
          type="button"
          onClick={onCancel}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#8A8B8F] transition-all duration-200 hover:bg-[#F3F4F8] hover:text-[#5F6062] active:scale-95"
          aria-label="Close"
        >
          <X size={19} strokeWidth={2} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 p-6 pb-28"
      >
        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-[#E4E5E8] bg-[#F3F4F8] px-4 py-3.5">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FEFEFE] text-[#5F6062]">
              <AlertCircle size={17} strokeWidth={2} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#5F6062]">
                Unable to save service
              </p>

              <p className="mt-0.5 text-sm leading-5 text-[#85868A]">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Basic Details */}
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5F6062]">
            Service Details
          </h3>

          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Name */}
            <div className="md:col-span-2">
              <label
                htmlFor="serviceName"
                className="mb-2 block text-sm font-medium text-[#5F6062]"
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
                className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFC] px-4 text-sm text-[#5F6062] outline-none transition-all duration-200 placeholder:text-[#9A9BA0] hover:border-[#DCDDE2] focus:border-[#BFC1C5] focus:bg-[#FEFEFE] focus:ring-2 focus:ring-[#5F6062]/5 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="serviceCategory"
                className="mb-2 block text-sm font-medium text-[#5F6062]"
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
                className="h-11 w-full cursor-pointer rounded-xl border border-[#E5E7EB] bg-[#F9FAFC] px-4 text-sm text-[#5F6062] outline-none transition-all duration-200 hover:border-[#DCDDE2] focus:border-[#BFC1C5] focus:bg-[#FEFEFE] focus:ring-2 focus:ring-[#5F6062]/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category.charAt(0).toUpperCase() +
                      category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label
                htmlFor="sortOrder"
                className="mb-2 block text-sm font-medium text-[#5F6062]"
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
                    Number(event.target.value),
                  )
                }
                className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFC] px-4 text-sm text-[#5F6062] outline-none transition-all duration-200 placeholder:text-[#9A9BA0] hover:border-[#DCDDE2] focus:border-[#BFC1C5] focus:bg-[#FEFEFE] focus:ring-2 focus:ring-[#5F6062]/5 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label
                htmlFor="serviceDescription"
                className="mb-2 block text-sm font-medium text-[#5F6062]"
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
                className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-[#F9FAFC] px-4 py-3 text-sm leading-6 text-[#5F6062] outline-none transition-all duration-200 placeholder:text-[#9A9BA0] hover:border-[#DCDDE2] focus:border-[#BFC1C5] focus:bg-[#FEFEFE] focus:ring-2 focus:ring-[#5F6062]/5 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t border-[#E5E7EB] pt-8">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5F6062]">
            Base Pricing
          </h3>

          <div className="mt-4">
            <PricingRuleForm
              pricingType={formData.pricingType}
              price={formData.basePrice}
              unitLabel={formData.unitLabel}
              onPricingTypeChange={(value) =>
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
              onUnitLabelChange={(value) =>
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
        <section className="border-t border-[#E5E7EB] pt-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#5F6062]">
                Service Options
              </h3>

              <p className="mt-1 text-sm leading-5 text-[#85868A]">
                Add different options with their own pricing.
              </p>
            </div>

            {/* Add Option */}
            <button
              type="button"
              onClick={addOption}
              disabled={loading}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F3F4F8] px-3.5 py-2.5 text-sm font-medium text-[#5F6062] transition-all duration-200 hover:border-[#DCDDE2] hover:bg-[#E9EAF0] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Option
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {formData.options.length === 0 ? (
              /* Empty Options */
              <div className="flex min-h-[150px] flex-col items-center justify-center rounded-xl border border-dashed border-[#DCDDE2] bg-[#FEFEFE] px-5 py-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F4F8]">
                  <Plus
                    size={18}
                    strokeWidth={2}
                    className="text-[#85868A]"
                  />
                </div>

                <p className="mt-3 text-sm font-medium text-[#5F6062]">
                  No options added
                </p>

                <p className="mt-1 max-w-md text-xs leading-5 text-[#8A8B8F]">
                  Options are useful for services such as Photography Only
                  or Photography + Videography.
                </p>
              </div>
            ) : (
              formData.options.map((option, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFC] p-5"
                >
                  {/* Option Header */}
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5F6062] text-[11px] font-semibold text-white">
                        {index + 1}
                      </span>

                      <h4 className="text-sm font-semibold text-[#5F6062]">
                        Option {index + 1}
                      </h4>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      disabled={loading}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8A8B8F] transition-all duration-200 hover:bg-[#EDEEF1] hover:text-[#5F6062] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Remove option"
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </div>

                  <div className="space-y-5">
                    {/* Option Name */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#5F6062]">
                        Option Name
                      </label>

                      <input
                        type="text"
                        value={option.name}
                        disabled={loading}
                        onChange={(event) =>
                          updateOption(
                            index,
                            "name",
                            event.target.value,
                          )
                        }
                        placeholder="e.g. Photography Only"
                        className="h-11 w-full rounded-xl border border-[#E5E7EB] bg-[#FEFEFE] px-4 text-sm text-[#5F6062] outline-none transition-all duration-200 placeholder:text-[#9A9BA0] hover:border-[#DCDDE2] focus:border-[#BFC1C5] focus:ring-2 focus:ring-[#5F6062]/5 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    {/* Option Description */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#5F6062]">
                        Description
                      </label>

                      <textarea
                        rows={2}
                        value={option.description}
                        disabled={loading}
                        onChange={(event) =>
                          updateOption(
                            index,
                            "description",
                            event.target.value,
                          )
                        }
                        placeholder="Describe this option..."
                        className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-[#FEFEFE] px-4 py-3 text-sm leading-6 text-[#5F6062] outline-none transition-all duration-200 placeholder:text-[#9A9BA0] hover:border-[#DCDDE2] focus:border-[#BFC1C5] focus:ring-2 focus:ring-[#5F6062]/5 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    {/* Option Pricing */}
                    <div className="rounded-xl border border-[#E5E7EB] bg-[#FEFEFE] p-4">
                      <PricingRuleForm
                        pricingType={option.pricingType}
                        price={option.price}
                        unitLabel={option.unitLabel}
                        onPricingTypeChange={(value) =>
                          updateOption(
                            index,
                            "pricingType",
                            value,
                          )
                        }
                        onPriceChange={(value) =>
                          updateOption(
                            index,
                            "price",
                            value,
                          )
                        }
                        onUnitLabelChange={(value) =>
                          updateOption(
                            index,
                            "unitLabel",
                            value,
                          )
                        }
                        disabled={loading}
                      />
                    </div>

                    {/* Active */}
                    <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-[#5F6062]">
                      <input
                        type="checkbox"
                        checked={option.active}
                        disabled={loading}
                        onChange={(event) =>
                          updateOption(
                            index,
                            "active",
                            event.target.checked,
                          )
                        }
                        className="h-4 w-4 cursor-pointer rounded border-[#DCDDE2] accent-[#5F6062] disabled:cursor-not-allowed"
                      />

                      <span>Option is active</span>
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Actions */}
        <div className="sticky bottom-0 z-20 -mx-6 mt-8 border-t border-[#E5E7EB] bg-[#FEFEFE] px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            {/* Cancel */}
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFC] px-6 py-2.5 text-sm font-medium text-[#5F6062] transition-all duration-200 hover:border-[#DCDDE2] hover:bg-[#F3F4F8] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            {/* Save */}
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#5F6062] px-7 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#48494B] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#BFC0C2]"
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
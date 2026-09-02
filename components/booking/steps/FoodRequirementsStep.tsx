import {
  Check,
  ChefHat,
  ClipboardCheck,
  Utensils,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

import {
  foodTypeOptions,
  mealOptions,
  requirementOptions,
} from "../constants";

import type { BookingFormData } from "../types";

interface FoodRequirementsStepProps {
  formData: BookingFormData;
  updateField: (
    field: keyof BookingFormData,
    value: string,
  ) => void;
  toggleArrayValue: (
    field: "meals" | "requirements",
    value: string,
  ) => void;
}

export default function FoodRequirementsStep({
  formData,
  updateField,
  toggleArrayValue,
}: FoodRequirementsStepProps) {
  return (
    <Card
      title="Food & Requirements"
      description="Tell us about your food preferences and additional event needs."
      className="border-[#e8e1d8] shadow-sm"
    >
      <div className="space-y-8">
        {/* Food Preference */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Utensils
              size={18}
              className="text-[#a7773f]"
            />

            <label className="text-sm font-semibold text-[#403a34]">
              Food Preference
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {foodTypeOptions.map((item) => {
              const selected =
                formData.foodType === item;

              return (
                <button
                  type="button"
                  key={item}
                  onClick={() =>
                    updateField(
                      "foodType",
                      item,
                    )
                  }
                  className={[
                    "flex min-h-12 items-center justify-center rounded-xl border px-4 py-3",
                    "text-sm font-medium transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-[#b8894b]/20",
                    selected
                      ? "border-[#b8894b] bg-[#fbf6ef] text-[#8a6435] shadow-sm"
                      : "border-[#e3dbd2] bg-white text-[#5f574f] hover:border-[#cdbba5] hover:bg-[#fdfbf8]",
                  ].join(" ")}
                >
                  {selected && (
                    <Check
                      size={16}
                      className="mr-2"
                    />
                  )}

                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meals */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <ChefHat
              size={18}
              className="text-[#a7773f]"
            />

            <label className="text-sm font-semibold text-[#403a34]">
              Meals Required
            </label>
          </div>

          <p className="mb-4 text-xs text-[#81776d]">
            Select all meals you would like us to arrange.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {mealOptions.map((meal) => {
              const selected =
                formData.meals.includes(meal);

              return (
                <button
                  type="button"
                  key={meal}
                  onClick={() =>
                    toggleArrayValue(
                      "meals",
                      meal,
                    )
                  }
                  aria-pressed={selected}
                  className={[
                    "flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3",
                    "text-left text-sm font-medium transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-[#b8894b]/20",
                    selected
                      ? "border-[#b8894b] bg-[#fbf6ef] text-[#8a6435] shadow-sm"
                      : "border-[#e3dbd2] bg-white text-[#5f574f] hover:border-[#cdbba5] hover:bg-[#fdfbf8]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                      selected
                        ? "border-[#b8894b] bg-[#b8894b] text-white"
                        : "border-[#cfc6bc] bg-white",
                    ].join(" ")}
                  >
                    {selected && (
                      <Check size={13} />
                    )}
                  </span>

                  {meal}
                </button>
              );
            })}
          </div>
        </div>

        {/* Special Food Requirements */}
        <Input
          id="foodRequirements"
          label="Special Food Requirements"
          placeholder="Specific dishes, allergies, dietary needs, etc."
          value={formData.foodRequirements}
          onChange={(event) =>
            updateField(
              "foodRequirements",
              event.target.value,
            )
          }
        />

        {/* Additional Requirements */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <ClipboardCheck
              size={18}
              className="text-[#a7773f]"
            />

            <label className="text-sm font-semibold text-[#403a34]">
              Additional Requirements
            </label>
          </div>

          <p className="mb-4 text-xs text-[#81776d]">
            Select any additional services you need for your event.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {requirementOptions.map((item) => {
              const selected =
                formData.requirements.includes(
                  item,
                );

              return (
                <button
                  type="button"
                  key={item}
                  onClick={() =>
                    toggleArrayValue(
                      "requirements",
                      item,
                    )
                  }
                  aria-pressed={selected}
                  className={[
                    "flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3",
                    "text-left text-sm font-medium transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-[#b8894b]/20",
                    selected
                      ? "border-[#b8894b] bg-[#fbf6ef] text-[#8a6435] shadow-sm"
                      : "border-[#e3dbd2] bg-white text-[#5f574f] hover:border-[#cdbba5] hover:bg-[#fdfbf8]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                      selected
                        ? "border-[#b8894b] bg-[#b8894b] text-white"
                        : "border-[#cfc6bc] bg-white",
                    ].join(" ")}
                  >
                    {selected && (
                      <Check size={13} />
                    )}
                  </span>

                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Other Requirements */}
        <Input
          id="otherRequirements"
          label="Other Requirements"
          placeholder="Tell us anything else you need..."
          value={formData.otherRequirements}
          onChange={(event) =>
            updateField(
              "otherRequirements",
              event.target.value,
            )
          }
        />

        {/* Selection Summary */}
        {(formData.foodType ||
          formData.meals.length > 0 ||
          formData.requirements.length > 0) && (
          <div className="rounded-xl border border-[#e8e1d8] bg-[#fdfbf8] p-4">
            <p className="text-sm font-semibold text-[#403a34]">
              Your selections
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {formData.foodType && (
                <span className="rounded-full bg-[#f5eee5] px-3 py-1 text-xs font-medium text-[#8a6435]">
                  {formData.foodType}
                </span>
              )}

              {formData.meals.map((meal) => (
                <span
                  key={meal}
                  className="rounded-full bg-[#f5eee5] px-3 py-1 text-xs font-medium text-[#8a6435]"
                >
                  {meal}
                </span>
              ))}

              {formData.requirements.map(
                (requirement) => (
                  <span
                    key={requirement}
                    className="rounded-full bg-[#f5eee5] px-3 py-1 text-xs font-medium text-[#8a6435]"
                  >
                    {requirement}
                  </span>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
import {
  Check,
  Crown,
  Gem,
  Sparkles,
} from "lucide-react";

import Card from "@/components/ui/Card";

import { packageOptions } from "../constants";
import type { BookingFormData } from "../types";

interface PackageStepProps {
  formData: BookingFormData;
  updateField: (
    field: keyof BookingFormData,
    value: string
  ) => void;
}

const packageIcons = {
  starter: Sparkles,
  medium: Crown,
  premium: Gem,
};

export default function PackageStep({
  formData,
  updateField,
}: PackageStepProps) {
  return (
    <Card
      title="Choose Your Package"
      description="Select a package that fits your event. You can customize your requirements in the next step."
      className="border-[#e5dfd5] bg-[#fffdfa] shadow-[0_10px_40px_rgba(75,65,55,0.06)]"
    >
      <div className="space-y-4">
        {packageOptions.map((pkg) => {
          const selected = formData.package === pkg.id;

          const Icon =
            packageIcons[
              pkg.id as keyof typeof packageIcons
            ] ?? Sparkles;

          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() =>
                updateField("package", pkg.id)
              }
              aria-pressed={selected}
              className={[
                "group relative w-full rounded-2xl border p-5 text-left",
                "transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-[#a8ad98]/40",
                selected
                  ? "border-[#a8ad98] bg-[#f4f5ed] shadow-sm"
                  : "border-[#e5dfd5] bg-white hover:-translate-y-0.5 hover:border-[#c7b9a7] hover:bg-[#fdfbf7] hover:shadow-sm",
              ].join(" ")}
            >
              {/* Popular badge */}
              {pkg.popular && (
                <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-[#e8d8bd] px-3 py-1 text-[11px] font-semibold tracking-wide text-[#725635]">
                  MOST POPULAR
                </span>
              )}

              <div className="flex items-start gap-4 pr-20">
                {/* Icon */}
                <div
                  className={[
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                    "transition-all duration-200",
                    selected
                      ? "bg-[#6f7862] text-white"
                      : "bg-[#f1eee7] text-[#8a806f] group-hover:bg-[#e9e5db]",
                  ].join(" ")}
                >
                  <Icon size={22} strokeWidth={1.8} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-[#302d28] sm:text-lg">
                      {pkg.name}
                    </h3>

                    {selected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6f7862] text-white">
                        <Check size={13} strokeWidth={3} />
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm leading-6 text-[#7b746b]">
                    {pkg.description}
                  </p>

                  <p className="mt-3 text-sm font-semibold text-[#9a7547]">
                    {pkg.price}
                  </p>
                </div>
              </div>

              {/* Selected indicator */}
              <div
                className={[
                  "absolute bottom-0 left-0 top-0 w-1 rounded-l-2xl transition-opacity",
                  selected
                    ? "bg-[#a8ad98] opacity-100"
                    : "opacity-0",
                ].join(" ")}
              />
            </button>
          );
        })}
      </div>

      {/* Information note */}
      <div className="mt-6 rounded-xl border border-[#ebe5dc] bg-[#faf8f3] p-4">
        <p className="text-xs leading-5 text-[#7b746b]">
          <span className="font-semibold text-[#5e584f]">
            Good to know:
          </span>{" "}
          Package pricing is based on your event requirements
          and guest count. Our team will confirm the final
          quotation after reviewing your booking details.
        </p>
      </div>
    </Card>
  );
}
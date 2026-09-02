import {
  CalendarDays,
  MapPin,
  Users,
  Package,
  Utensils,
  ClipboardCheck,
  User,
} from "lucide-react";

import Card from "@/components/ui/Card";

import type { BookingFormData } from "./types";

interface BookingSummaryProps {
  formData: BookingFormData;
}

export default function BookingSummary({
  formData,
}: BookingSummaryProps) {
  return (
    <Card
      title="Booking Summary"
      description="Please review your event details before submitting."
      className="mt-6 border-[#e8e1d8] shadow-sm"
    >
      <div className="space-y-5">
        {/* Event */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-[#403a34]">
            Event Information
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryItem
              icon={<CalendarDays size={17} />}
              label="Event"
              value={
                formData.eventType || "Not selected"
              }
            />

            <SummaryItem
              icon={<CalendarDays size={17} />}
              label="Date"
              value={
                formData.eventDate || "Not selected"
              }
            />

            <SummaryItem
              icon={<Users size={17} />}
              label="Guests"
              value={
                formData.guests
                  ? `${formData.guests} guests`
                  : "Not specified"
              }
            />

            <SummaryItem
              icon={<MapPin size={17} />}
              label="Location"
              value={
                formData.location || "Not specified"
              }
            />
          </div>
        </div>

        <div className="border-t border-[#eee7df]" />

        {/* Package */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-[#403a34]">
            Package
          </h3>

          <SummaryItem
            icon={<Package size={17} />}
            label="Selected Package"
            value={
              formData.package
                ? formatValue(formData.package)
                : "Not selected"
            }
          />
        </div>

        <div className="border-t border-[#eee7df]" />

        {/* Food */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-[#403a34]">
            Food & Meals
          </h3>

          <div className="space-y-3">
            <SummaryItem
              icon={<Utensils size={17} />}
              label="Food Preference"
              value={
                formData.foodType ||
                "Not selected"
              }
            />

            <SummaryItem
              icon={<Utensils size={17} />}
              label="Meals"
              value={
                formData.meals.length > 0
                  ? formData.meals.join(", ")
                  : "None selected"
              }
            />

            {formData.foodRequirements && (
              <SummaryItem
                icon={<ClipboardCheck size={17} />}
                label="Food Requirements"
                value={formData.foodRequirements}
              />
            )}
          </div>
        </div>

        <div className="border-t border-[#eee7df]" />

        {/* Requirements */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-[#403a34]">
            Additional Requirements
          </h3>

          <div className="space-y-3">
            <SummaryItem
              icon={<ClipboardCheck size={17} />}
              label="Services"
              value={
                formData.requirements.length > 0
                  ? formData.requirements.join(", ")
                  : "None selected"
              }
            />

            {formData.otherRequirements && (
              <SummaryItem
                icon={<ClipboardCheck size={17} />}
                label="Other"
                value={
                  formData.otherRequirements
                }
              />
            )}
          </div>
        </div>

        <div className="border-t border-[#eee7df]" />

        {/* Customer */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-[#403a34]">
            Contact Details
          </h3>

          <div className="space-y-3">
            <SummaryItem
              icon={<User size={17} />}
              label="Name"
              value={
                formData.name || "Not provided"
              }
            />

            <SummaryItem
              icon={<User size={17} />}
              label="Phone"
              value={
                formData.phone || "Not provided"
              }
            />

            {formData.email && (
              <SummaryItem
                icon={<User size={17} />}
                label="Email"
                value={formData.email}
              />
            )}
          </div>
        </div>

        {/* Message */}
        {formData.message && (
          <>
            <div className="border-t border-[#eee7df]" />

            <div>
              <h3 className="mb-2 text-sm font-semibold text-[#403a34]">
                Additional Message
              </h3>

              <p className="rounded-lg bg-[#faf7f2] p-4 text-sm leading-6 text-[#756d64]">
                {formData.message}
              </p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f5eee5] text-[#a7773f]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-[#958b80]">
          {label}
        </p>

        <p className="mt-0.5 break-words text-sm font-medium text-[#403a34]">
          {value}
        </p>
      </div>
    </div>
  );
}

function formatValue(value: string) {
  return value
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}